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
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import Icon from './Icon';
import * as XLSX from 'xlsx';
import { convertPascaleCaseToSnakeCase } from '../utils/helperFunctions';
import EditForm from './EditForm';
import toast from 'react-hot-toast';

const initialState = {
    object_id: '',
};

function BulkCheckout() {
    const [filter, setFilter] = useState(initialState);
    const [columnMetadata, setColumnMetadata] = useState([]);
    const [availableItemsBasedOnFilter, setAvailableItemsBasedOnFilter] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [editingInfo, setEditingInfo] = useState({ cell_id: null, rowIndex: null, isEditing: false });
    async function fetchMetaData(object_id, abortController) {
        const response = await axiosInstance.get(`/metadata/${object_id}`, { signal: abortController.signal });
        return response.data;
    }

    useEffect(() => {
        //fetch column metadata
        console.log('Fetching column metadata...');
        const abortController = new AbortController();
        fetchMetaData(filter.object_id, abortController).then((response) => {
            console.log('Column metadata:', response.data);

            setColumnMetadata(response.data);
        }).catch((error) => {
            console.error('Error fetching column metadata:', error);
        });
        return () => {
            abortController.abort();
        };
    }, [filter.object_id]);

    const handleFilterChange = (field) => (event) => {
        setFilter(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const renameExcelHeaderToColumnId = (sheet) => {
        const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
        const headerCell = sheet[headerCellAddress];
        const headerValue = headerCell.v;
        const snakeCaseHeader = convertPascaleCaseToSnakeCase(headerValue);
        if (snakeCaseHeader == "employee_id") {
            sheet[headerCellAddress] = {
                t: 's',  // type: string
                v: snakeCaseHeader, // value
                w: snakeCaseHeader  // formatted text
            };
        }
        return sheet;
    }
    const convertExcelToJson = (data) => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        sheet = renameExcelHeaderToColumnId(sheet);
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setExcelData(jsonData);
        return jsonData;
    }
    const handleCellEdit = (cell_id, rowIndex) => {
        setEditingInfo({ cell_id, rowIndex, isEditing: true });
    };
    const handleCellDelete = (cell_id, rowIndex) => {
        const updatedData = excelData.filter((row, index) => index !== rowIndex);
        setExcelData(updatedData);
    };
    const saveCellEdit = (editedData) => {
        const updatedData = excelData.map((row, index) => {
            if (index === editingInfo.rowIndex) {
                return {
                    ...row,
                    ...editedData
                };
            }
            return row;
        });
        setExcelData(updatedData);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const jsonData = convertExcelToJson(data);
                event.target.value=null;
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const getavailableItemsBasedOnFilter = async () => {
        const response = await axiosInstance.post(`/objects/${filter.object_id}/filter-docs/all`, filter);
        console.log(response.data.data);
        setAvailableItemsBasedOnFilter(response.data.data);
    }

    const handleBulkCheckout = async () => {
        console.log('Excel data:', excelData);
        const data = {
            object_name: filter.object_id,
            employees_info: excelData,
            filters: { ...filter },
        }
        delete data.filters.object_id;
        console.log(data);
        try {
            const response = await axiosInstance.post(`/checkout/assign/bulk`, data);
            console.log(response);
            toast.success(response.data.message);
            await getavailableItemsBasedOnFilter();
            setExcelData([]);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error completing bulk checkout');
        }
        // Reset the file input
        document.getElementById('file').value = '';
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
                            onChange={handleFilterChange('object_id')}
                        >
                            <MenuItem value="assets">Assets</MenuItem>
                            <MenuItem value="licenses">Licenses</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                
                    { 
                        Object.keys(columnMetadata).map((key) =>{
                          const column = columnMetadata[key];
                        return (column.type==='select' &&
                        <Grid item xs={12} md={4} key={column.id}>
                            <FormControl fullWidth>
                                <InputLabel>{column.label}</InputLabel>
                                <Select
                                    value={filter[column.id]}
                                    label={column.label}
                                    onChange={handleFilterChange(column.id)}
                                >
                                    {
                                        column.id == "status" ?
                                            column.options.map((option) => (
                                                option.value == "available" || option.value == "reissue"  ? 
                                                    <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem> : null
                                            )) :
                                            column.options.map((option) => (
                                                <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                                            ))
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                    )})
                }

                {
                    Object.keys(columnMetadata).length > 0 && (
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<Icon name="search" size={18} />}
                                onClick={getavailableItemsBasedOnFilter}
                            >
                                Search
                            </Button>
                        </Grid>
                    )
                }
            </Grid>

            {
                availableItemsBasedOnFilter!=null && (
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>Total Assets: {availableItemsBasedOnFilter.length}</Typography>
                        </Paper>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<Icon name="upload" size={18} />}
                            sx={{ mt: 2 }}
                        >
                            Import Excel File
                            <input
                                type="file"
                                id='file'
                                hidden
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                        </Button>
                    </Box>
                )}
            {excelData.length > 0 && (
                <TableContainer component={Paper} sx={{ maxWidth: '100%', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell key={"employee_id"}>
                                    Employee Id *
                                </TableCell>

                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {excelData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell
                                        key={"employee_id"}
                                    >
                                        {row["employee_id"] || row[convertSnakeCaseToPascaleCase("employee_id")]}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCellEdit("employee_id", rowIndex)}
                                            color='primary'
                                        >
                                            <Icon name="pencil" size={18} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCellDelete("employee_id", rowIndex)}
                                            color="error"
                                        >
                                            <Icon name="trash-2" size={18}  />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {excelData.length > 0 && (
                <Button
                    variant="outlined"
                    startIcon={<Icon name="save" size={18} />}
                    onClick={handleBulkCheckout}
                    sx={{ mt: 2 }}
                >
                    Complete Bulk Checkout
                </Button>
            )}
            {editingInfo.isEditing &&
                (
                    () => {
                        const fields = [{ id: "employee_id", label: "Employee Id", type: "text", edit: true, required: true }];
                        const values = { employee_id: excelData[editingInfo.rowIndex][editingInfo.cell_id] };
                        const closeDialog = () => {
                            setEditingInfo(prev => { return { cell_id: null, rowIndex: null, isEditing: false } });
                        }
                        return (
                            <EditForm isDialogOpen={editingInfo.isEditing} closeDialog={closeDialog} currentSection={"Employee Id"} fields={fields} values={values} saveData={saveCellEdit} />
                        )
                    }
                )()
            }
        </Box>
    );
}

export default BulkCheckout;
