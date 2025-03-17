import React, { useState } from 'react'
import { convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';
import { Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { PERMISSIONS } from '../utils/constants';
import Icon from './Icon';
import axiosInstance from '../utils/axios';
import { toast } from 'react-hot-toast';

const InvoiceTable = (
    {
        columns,
        rows,
        userColumnPreferences,
        page,
        totalInvoices,
        pageLimit,
        setPage,
        setPageLimit,
        setDeleteDialogInfo,
        ...props
    }
) => {
    const [orderBy, setOrderBy] = useState('invoice_id');
    const [order, setOrder] = useState('asc');
    const [visibleColumns, setVisibleColumns] = useState(userColumnPreferences);
    const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
    // const [displayInvoiceInfo, setDisplayInvoiceInfo] = useState({ display: false, invoiceId: null });

    const handleColumnToggle = (columnId) => {
        console.log(columnId);
        setVisibleColumns({ ...visibleColumns, [columnId]: !visibleColumns[columnId] });
    };
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        console.log(property, orderBy, order);
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const sortedDocuments = [...rows].sort((a, b) => {
        if (order === 'asc') {
            return a[orderBy] < b[orderBy] ? -1 : 1;
        } else {
            return b[orderBy] < a[orderBy] ? -1 : 1;
        }
    });
    const handleViewInvoice = async(invoiceFilename) => {
        try {
            const response = await axiosInstance.get('/services/s3/get-object-url', { 
                params: {
                    key: invoiceFilename
                }
             });
            console.log(response);
            if(response.data.success){
                window.open(response.data.data.url, '_blank', 'scrollbars=yes,resizable=yes,top=200,left=500,height=500,width=1000,noopener,noreferrer');
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2,justifyContent: 'space-between' }}>
                <TextField
                    placeholder="Search invoices..."
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon name="search" size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Icon name="settings" size={20} />}
                            onClick={(e) => setColumnsMenuAnchor(e.currentTarget)}
                        >
                            Columns
                        </Button>
                        <Menu
                            anchorEl={columnsMenuAnchor}
                            open={Boolean(columnsMenuAnchor)}
                            onClose={() => setColumnsMenuAnchor(null)}
                        >
                            <React.Fragment>
                                {Object.entries(visibleColumns).map(([columnId, isVisible]) => (
                                    <MenuItem key={columnId} onClick={() => handleColumnToggle(columnId)}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isVisible}
                                                    onChange={() => handleColumnToggle(columnId)}
                                                />
                                            }
                                            label={convertSnakeCaseToPascaleCase(columnId)}
                                        />
                                    </MenuItem>
                                ))}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ m: 1, mx: 2 }}
                                    onClick={() => setColumnsMenuAnchor(null)}
                                >
                                    Apply Changes
                                </Button>
                            </React.Fragment>
                        </Menu>
                    </Box>
                    {/* <Button
                        variant="outlined"
                        startIcon={<Icon name="download" size={18} />}
                        sx={{ textTransform: 'none' }}
                    >
                        Export
                    </Button> */}
                </Box>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {Object.entries(visibleColumns).map(([columnId, isVisible]) =>
                                isVisible ? (
                                    <TableCell
                                        key={columnId}
                                        sortDirection={orderBy === columnId ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === columnId}
                                            direction={orderBy === columnId ? order : 'asc'}
                                            onClick={() => { handleSort(columnId) }}
                                        >
                                            {convertSnakeCaseToPascaleCase(columnId)}
                                        </TableSortLabel>
                                    </TableCell>
                                ) : null
                            )}
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDocuments.map((document, rowIndex) => (
                            <TableRow
                                key={document.invoice_id}
                                hover
                            >
                                {Object.entries(visibleColumns).map(([columnId, isVisible]) => {
                                    let colType = columns[columnId]?.type;
                                    return (
                                        isVisible && (
                                            <TableCell key={columnId}>
                                                {
                                                    colType === 'date'
                                                        ? new Date(document[columnId]).toLocaleDateString()
                                                        : colType === 'select' ? convertSnakeCaseToPascaleCase(document[columnId])
                                                            : document[columnId]}
                                            </TableCell>
                                        )
                                    );
                                })}
                                <TableCell>
                                    <ProtectedComponent requiredPermission={PERMISSIONS.VIEW_INVOICES}>
                                        <IconButton size="small" color="success" onClick={() => handleViewInvoice(document.invoice_filename)}>
                                            <Icon name="eye" size={20} />
                                        </IconButton>
                                    </ProtectedComponent>
                                    <ProtectedComponent requiredPermission={PERMISSIONS.DELETE_INVOICES}>
                                        <IconButton size="small" color="error" onClick={() => setDeleteDialogInfo(prev=>{return { ...prev,showDialog: true, invoice_id: document.invoice_id }})}>
                                            <Icon name="trash-2" size={20} />
                                        </IconButton>
                                    </ProtectedComponent>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                <TablePagination
                    component="div"
                    count={totalInvoices}
                    page={page - 1}
                    onPageChange={(_, page) => setPage(page + 1)}
                    rowsPerPage={pageLimit}
                    onRowsPerPageChange={(event) => {
                        setPageLimit(parseInt(event.target.value));
                        setPage(1);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Box>
        </Paper>
    )
}

export default InvoiceTable