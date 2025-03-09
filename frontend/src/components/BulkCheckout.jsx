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

const initialState = {
    object_id: '',
};

function BulkCheckout() {
    const [filter, setFilter] = useState(initialState);
    const [columnMetadata, setColumnMetadata] = useState([]);
    const [filteredData, setFilteredData] = useState(null);

    async function fetchMetaData(object_id,abortController){
        const response = await axiosInstance.get(`/metadata/${object_id}`, { signal: abortController.signal });
        return response.data;
}

    useEffect(() => {
        //fetch column metadata
        console.log('Fetching column metadata...');
        const abortController = new AbortController();
        fetchMetaData(filter.object_id,abortController).then((response) => {
            console.log('Column metadata:', response.data);
            
            setColumnMetadata(response.data);
        }).catch((error) => {
            console.error('Error fetching column metadata:', error);
        });
        return () => {
            abortController.abort();
        };
    },[filter.object_id]);

    const handleChange = (field) => (event) => {
        setFilter(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleImportExcel = () => {
        // Handle Excel import
        console.log('Importing Excel...');
    };

    const getFilteredData = async() => {
       const response =  await axiosInstance.post(`/objects/${filter.object_id}/filter-docs/all`,filter);
       console.log(response.data.data);
       setFilteredData(response.data.data);
       
    }

    const handleComplete = () => {
        console.log('Completing bulk checkout:', filter);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Bulk Checkout</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filter.object_id}
                            label="Type"
                            onChange={handleChange('object_id')}
                        >
                            <MenuItem value="assets">Assets</MenuItem>
                            <MenuItem value="licenses">Licenses</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {
                    columnMetadata.map((column) => ( column.type==='select' &&
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
                    ))
                }

                {
                    columnMetadata.length > 0 && (
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

            <Box sx={{ mt: 3, mb: 3 }}>
                {
                    filteredData && (
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>Total Assets: {filteredData.length}</Typography>
                        </Paper>
                    )
                }
               
                
                <Button
                    variant="outlined"
                    startIcon={<Icon name="upload" size={18} />}
                    onClick={handleImportExcel}
                    sx={{ mt: 2 }}
                >
                    Import Excel
                </Button>
            </Box>
        </Box>
    );
}

export default BulkCheckout;
