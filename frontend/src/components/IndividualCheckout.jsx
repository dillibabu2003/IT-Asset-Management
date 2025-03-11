import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Paper,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import Icon from './Icon';
import AsynchronousAutoComplete from './AsynchronousAutoComplete';
import toast from 'react-hot-toast';

const initialState = {
    object_name: '',
};

function IndividualCheckout() {
    const [filter, setFilter] = useState(initialState);
    const [columnMetadata, setColumnMetadata] = useState([]);
    const [filteredData, setFilteredData] = useState(null);

    async function fetchMetaData(object_name,abortController){
        const response = await axiosInstance.get(`/metadata/${object_name}`, { signal: abortController.signal });
        return response.data;
}

    useEffect(() => {
        //fetch column metadata
        console.log('Fetching column metadata...');
        const abortController = new AbortController();
        fetchMetaData(filter.object_name,abortController).then((response) => {
            console.log('Column metadata:', response.data);
            
            setColumnMetadata(response.data);
        }).catch((error) => {
            console.error('Error fetching column metadata:', error);
        });
        return () => {
            abortController.abort();
        };
    },[filter.object_name]);

    const handleChange = (field) => (event) => {
        console.log('field:', field);
        console.log('event:', event.target.value);
        setFilter(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const getFilteredData = async() => {
       const response =  await axiosInstance.post(`/objects/${filter.object_name}/filter-docs/all`,filter);
       console.log(response.data.data);
       setFilteredData(response.data.data);
    }

    const handleComplete = async() => {
        const data = {
            object_name: filter.object_name,
            employee_info: filter.employee_id,
            filters:{...filter}
        };
        delete data.filters.object_name;
        delete data.filters.employee_id;
        try {
            const response = await axiosInstance.post('/checkout/assign/individual', data);
            if(response.data.success){
                setFilter(filter=>({...filter,employee_id:''}));
                setFilteredData(null);
                console.log('Checkout completed:', response.data);
                toast.success(response.data.message)
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error completing checkout';
            toast.error(errorMessage);
            console.error( errorMessage);
        }
    };


    const employeeOptionLabel = (option) => { return option ? `${option.employee_id || ''} ${option.firstname || ''} ${option.lastname || ''}`.trim() : ''};
    const employeeOptionEqualToLabel=(option, value) => {return option?.employee_id === value?.employee_id};
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Individual Checkout</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filter.object_name}
                            label="Type"
                            onChange={handleChange('object_name')}
                        >
                            <MenuItem value="assets">Assets</MenuItem>
                            <MenuItem value="licenses">Licenses</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {
                    columnMetadata&&
                    Object.keys(columnMetadata).map((key) =>{
                        const column = columnMetadata[key];
                      return (column.type==='select' &&
                        <Grid item xs={12} md={4} key={column.id}>
                            <FormControl fullWidth>
                                <InputLabel>{column.label}</InputLabel>
                                <Select
                                    value={filter[column.id]}
                                    label={column.label}
                                    onChange={handleChange(column.id)}
                                >
                                    {column.options.map((option) => ( 
                                        
                                        column.id=="status" ? (option.value=="available" || option.value=="reissue") ? <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem> : null :
                                        <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )})
                }

                {
                    columnMetadata && Object.keys(columnMetadata).length > 0 && (
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<Icon name="search" size={18} />}
                                onClick={getFilteredData}
                            >
                                Search
                            </Button>
                </Grid>
                    )
                }
            </Grid>

                {
                                    filteredData && (
                                        <Paper sx={{ p: 2, mb: 2 }}>
                                            <Typography variant="h6" gutterBottom>Total {filter.object_name} {filteredData.length}</Typography>
                                        </Paper>
                                    )
                                }
                {
                filteredData&&filteredData.length>0 && (   
                    <React.Fragment>

                    <Box sx={{ mt: 3, mb: 3 }}>
                        <AsynchronousAutoComplete fetchUrl="/employees/search" optionLabelFunction={employeeOptionLabel}  optionaEqualToValueFunction={employeeOptionEqualToLabel} sendInputToParent={handleChange('employee_id')}/>
                        
                    </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    startIcon={<Icon name="check" size={18} />}
                                    onClick={handleComplete}
                                >
                                    Complete Checkout
                                </Button>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                    )
               }
               
        </Box>
    );
}

export default IndividualCheckout;
