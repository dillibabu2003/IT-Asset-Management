import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import { PAGE_LIMIT } from "../utils/constants";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import CreateForm from '../components/CreateForm';
import EditForm from '../components/EditForm';
import Icon from '../components/Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import AsynchronousAutoComplete from '../components/AsynchronousAutoComplete';
import AssignMultipleItems from '../components/AssignMultipleItems';

const LicensePage = () => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editInfo, setEditInfo] = useState({ showEditForm: false, selectedRow: null });
    const [operationInfo, setOperationInfo] = useState({ showSnackBar: false, operation: null, message: "", selectedRow: null });
    const [employeeId, setEmployeeId] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [bulkAssignInfo, setBulkAssignInfo] = useState({ showBulkAssignDialog: false, selectedRows: [], serialNumbersMappedWithEmployeeIds: [] });
    const [filters, setFilters] = useState(sessionStorage.getItem('licenses-filters') ? JSON.parse(sessionStorage.getItem('licenses-filters')) : null);
    //Fetching Data Functions
    async function fetchLicensesByPageAndLimit(abortController, page, limit) {
        const response = await axiosInstance.get('/objects/licenses/filter-docs/paginate', {
            params: {
                page: page,
                limit: limit,
                filters: JSON.stringify(filters || {})
            } 
            },
            {signal: abortController.signal});
        return response.data;
    }
    async function fetchLicensesMetaData(abortController) {
        const response = await axiosInstance.get("/metadata/licenses", { signal: abortController.signal });
        return response.data;
    }
    async function fetchUserColumnPreferences(abortController) {
        const response = await axiosInstance.get("/objects/licenses/column-visibilities", { signal: abortController.signal });
        return response.data;
    }
    async function fetchData(abortController) {
        const licensesPromise = fetchLicensesByPageAndLimit(abortController, page, pageLimit);
        const licensesMetadataPromise = fetchLicensesMetaData(abortController);
        const userColumnPreferencesPromise = fetchUserColumnPreferences(abortController);
        return Promise.all([licensesPromise, licensesMetadataPromise, userColumnPreferencesPromise]);
    }

    // Refersh data after any edits or deletes
    async function refreshData() {
        setSelectedRows([]);
        const toastId = toast.loading("Refreshing data...");
        const abortController = new AbortController();
        fetchLicensesByPageAndLimit(abortController,page,pageLimit).then((response) => {
            const licenses = response.data;
            // const licensesMetaData = response[1].data;
            // const userColumnPreferences = response[2].data;
            toast.success("Data refreshed", { id: toastId });
            setData(prev=>{return {...prev, data: licenses }});
        }).catch((error) => {
            console.log(error);
            toast.error("An error occurred while refreshing data", { id: toastId });
        });
    }

    // Creating an asset
    async function createAsset(formData) {
        try {
            const response = await axiosInstance.post("/objects/licenses/create", formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setShowCreateForm(false);
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row index to be edited
    const setEditingRowIndex = (rowIndex) => {
        setEditInfo({ showEditForm: true, selectedRow: rowIndex });
    }
    // Editing an asset
    async function saveEditedData(formData) {
        try {
            const response = await axiosInstance.put("/objects/licenses/update", formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setEditInfo(prev => { return { ...prev, showEditForm: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row index to be assigned
    const setAssignRowIndex = (rowIndex) => {
        setOperationInfo({ showSnackBar: true, operation: "assign", message: `Are you sure you want to assign asset ${data.data.documents[rowIndex].serial_no} to an employee?`, selectedRow: rowIndex });
    }
    // Assign an asset
    async function assignAsset() {
        const reqBody = {
            object_name: "licenses",
            employee_info: {
                employee_id: employeeId
            },
            serial_no: data.data.documents[operationInfo.selectedRow].serial_no
        };
        try {
            const response = await axiosInstance.post('/checkout/assign/individual', reqBody);
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error completing checkout';
            toast.error(errorMessage);
            console.error(errorMessage);
        }
    }

    // Set the row index to be unassigned
    const setUnAssignRowIndex = (rowIndex) => {
        setOperationInfo({ showSnackBar: true, operation: "unassign", message: `Are you sure you want to unassign asset ${data.data.documents[rowIndex].serial_no} from ${data.data.documents[rowIndex].assigned_to}?`, selectedRow: rowIndex });
    }
    // Unassign an asset
    async function unAssignAsset() {
        try {
            const response = await axiosInstance.post(`/checkout/unassign/individual`, {
                object_name: "licenses",
                info_to_unassign: {
                    serial_no: data.data.documents[operationInfo.selectedRow].serial_no,
                    employee_id: data.data.documents[operationInfo.selectedRow].assigned_to
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row index to be deleted
    const setDeleteRowIndex = (rowIndex) => {
        if (data.data.documents[rowIndex].assigned_to) {
            return toast.error("Cannot delete assigned asset");
        }
        setOperationInfo({ showSnackBar: true, operation: "delete", message: `Are you sure you want to delete ${data.data.documents[rowIndex].serial_no} asset?`, selectedRow: rowIndex });
    }

    // Delete an asset
    async function deleteAsset() {
        try {
            const response = await axiosInstance.delete(`/objects/licenses/delete`, {
                data: {
                    object_name: "licenses",
                    serial_no: data.data.documents[operationInfo.selectedRow].serial_no
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row indices to be deleted to perform bulk delete
    const setItemSerialNumbersToBeDeleted = () => {
        if (selectedRows.length === 0) {
            return toast.error("No rows selected");
        }
        const selectedRowsInfo = selectedRows.map((serial_no) => {
            return serial_no;
        });
        setOperationInfo({ showSnackBar: true, operation: "delete_bulk", message: `Are you sure you want to delete ${selectedRowsInfo.length} licenses?`, selectedRow: selectedRowsInfo });
    }

    // Delete multiple licenses
    async function deleteMultipleLicenses() {
        try {
            const response = await axiosInstance.delete(`/objects/licenses/delete/bulk`, {
                data: {
                    object_name: "licenses",
                    serial_nos: operationInfo.selectedRow
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row indices to be unassigned to perform bulk unassign
    const setItemSerialNumbersToBeUnassigned = () => {
        if (selectedRows.length === 0) {
            return toast.error("No rows selected");
        }
        const selectedRowsInfo = selectedRows.map((serial_no) => {
            return serial_no;
        });
        setOperationInfo({ showSnackBar: true, operation: "unassign_bulk", message: `Are you sure you want to unassign ${selectedRowsInfo.length} licenses?`, selectedRow: selectedRowsInfo });
    }

    // Unassign multiple licenses
    async function unAssignMultipleLicenses() {
        try {
            const licensesToBeUnAssigned = [];
            data.data.documents.map((asset, index) => {
                if (selectedRows.includes(asset.serial_no)) {
                    licensesToBeUnAssigned.push({
                        serial_no: asset.serial_no,
                        employee_id: asset.assigned_to
                    })
                }
            });
            const response = await axiosInstance.post(`/checkout/unassign/bulk`, {
                object_name: "licenses",
                info_to_unassign: licensesToBeUnAssigned
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    // Set the row indices to be assigned to perform bulk assign
    const setItemSerialNumbersToBeAssigned = () => {
        if (selectedRows.length === 0) {
            return toast.error("No rows selected");
        }

        setBulkAssignInfo({ showBulkAssignDialog: true, selectedRows: selectedRows, serialNumbersMappedWithEmployeeIds: [] });
    }
    const setEmployeeIdsWithSelectedRows = (assignmentInfo) => {
        console.log(assignmentInfo);
        const newBulkAssignInfo = {
            ...bulkAssignInfo,
            serialNumbersMappedWithEmployeeIds: assignmentInfo
        }
        console.log(newBulkAssignInfo);

        setBulkAssignInfo(newBulkAssignInfo);
        setOperationInfo({ showSnackBar: true, operation: "assign_bulk", message: `Are you sure you want to assign ${bulkAssignInfo.selectedRows.length} licenses?`, selectedRow: selectedRows });
    }

    async function assignMultipleLicenses() {
        try {
            console.log(bulkAssignInfo);

            const response = await axiosInstance.post(`/checkout/assign/bulk`, {
                object_name: "licenses",
                info_to_assign: bulkAssignInfo.serialNumbersMappedWithEmployeeIds
            });
            if (response.data.success) {
                toast.success(response.data.message);

                setTimeout(() => {
                    refreshData();
                }, 1000);

                setOperationInfo(prev => { return { ...prev, showSnackBar: false } });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }


    // Employee AutoComplete
    const employeeOptionLabel = (option) => { return option ? `${option.employee_id || ''} ${option.firstname || ''} ${option.lastname || ''}`.trim() : '' };
    const employeeOptionEqualToLabel = (option, value) => { return option?.employee_id === value?.employee_id };
    const handleAutoCompleteChange = (field) => (event) => {
        setEmployeeId(event.target.value.employee_id);
    };

    // Dialog Actions configuration
    const dialogActions = {
        assign: assignAsset,
        unassign: unAssignAsset,
        delete: deleteAsset,
        delete_bulk: deleteMultipleLicenses,
        unassign_bulk: unAssignMultipleLicenses,
        assign_bulk: assignMultipleLicenses
    };
    const dialogActionColors = {
        assign: "success",
        unassign: "warning",
        delete: "error",
        delete_bulk: "error",
        unassign_bulk: "warning",
        assign_bulk: "success"
    };


    // Set Filters
    const handleFilterChange = async(newFilters) => {
        sessionStorage.setItem("licenses-filters", JSON.stringify(newFilters));
        setFilters(newFilters);
    }
    useEffect(() => {
       if(filters==null || data ==null) return ;
       refreshData();
    }, [filters]);
    

    useEffect(() => {
        const abortController = new AbortController();

        if (!data) {
            fetchData(abortController).then((response) => {
                const licenses = response[0].data;
                const licensesMetaData = response[1].data;
                const userColumnPreferences = response[2].data;
                console.log(data)
                console.log(response);
                
                setData({ data: licenses, fields: licensesMetaData, userColumnPreferences: userColumnPreferences });
            }).catch((error) => {
                console.log(error);
            });
        } else {
            fetchLicensesByPageAndLimit(abortController, page, pageLimit).then((response) => {
                setData(prev => ({ ...prev, data: response.data }));
            }).catch((error) => {
                console.log(error);
            });
        }

        return () => {
            abortController.abort();
        };
    }, [page, pageLimit]);

    return (
        <React.Fragment>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="500">licenses</Typography>

                <ProtectedComponent requiredPermission={"create:licenses"}>
                    <Box sx={{ display: 'flex', gap: "8px", alignItems: "center" }}>
                        <Button
                            variant="contained"
                            startIcon={<Icon name="plus" size={18} />}
                            sx={{ textTransform: 'none' }}
                            onClick={() => setShowCreateForm(true)}
                        >
                            Create Asset
                        </Button>
                        <Box component="div" sx={{ width: "fit-content" }}>
                            <Link to="/licenses/import" style={{ textDecoration: "none" }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Icon name="upload" size={20} />}
                                >
                                    Import Excel
                                </Button>
                            </Link>
                        </Box>
                    </Box>
                </ProtectedComponent>
            </Box>
            {data==null ? <Loader /> :
                <React.Fragment>
                    <CreateForm
                        currentSection="licenses"
                        fields={data.fields}
                        isDialogOpen={showCreateForm}
                        values={Object.keys(data.fields).reduce((acc, key) => {
                            acc[key] = '';
                            return acc;
                        }, {})}
                        closeDialog={() => setShowCreateForm(false)}
                        saveData={createAsset}
                        aria-describedby={`create-licenses-form`}
                    />
                    <CustomTable
                        currentSection="licenses"
                        page={page}
                        pageLimit={pageLimit}
                        setPageLimit={setPageLimit}
                        setEditingRowIndex={setEditingRowIndex}
                        data={data}
                        setPage={setPage}
                        handleFilterChange={handleFilterChange}
                        userVisibleColumns={data.userColumnPreferences}
                        setAssignRowIndex={setAssignRowIndex}
                        setUnAssignRowIndex={setUnAssignRowIndex}
                        setDeleteRowIndex={setDeleteRowIndex}
                        setItemSerialNumbersToBeAssigned={setItemSerialNumbersToBeAssigned}
                        setItemSerialNumbersToBeDeleted={setItemSerialNumbersToBeDeleted}
                        setItemSerialNumbersToBeUnassigned={setItemSerialNumbersToBeUnassigned}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                    />
                    {editInfo.showEditForm && data.fields && data.data && (
                        <EditForm
                            currentSection="licenses"
                            fields={data.fields}
                            isDialogOpen={editInfo.showEditForm}
                            values={editInfo.selectedRow !== null &&
                                Object.keys(data.fields).reduce((acc, key) => {
                                    acc[key] = data.data.documents[editInfo.selectedRow][key];
                                    return acc;
                                }, {})}
                            closeDialog={() => { setEditInfo({ selectedRow: null, showEditForm: false }) }}
                            saveData={saveEditedData}
                            aria-describedby={`edit-licenses-form`}
                        />
                    )}
                    {bulkAssignInfo.showBulkAssignDialog && data.fields && data.data && (
                        <AssignMultipleItems
                            currentSection="licenses"
                            isDialogOpen={bulkAssignInfo.showBulkAssignDialog}
                            employeeOptionLabel={employeeOptionLabel}
                            employeeOptionEqualToLabel={employeeOptionEqualToLabel}
                            closeDialog={() => { setBulkAssignInfo(prev => { return { ...prev, showBulkAssignDialog: false } }) }}
                            fields={data.fields}
                            items={data.data.documents}
                            selectedItemsSerialNumbers={bulkAssignInfo.selectedRows}
                            saveData={setEmployeeIdsWithSelectedRows}
                            aria-describedby={`bulk-assign-licenses-form`}
                        />
                    )
                    }
                </React.Fragment>
            }
            <Dialog
                open={operationInfo.showSnackBar}
                onClose={() => setOperationInfo({ showSnackBar: false, operation: null, message: "", selectedRow: null })}
            >
                <DialogTitle>Confirm {operationInfo.operation?.substring(0, 1).toUpperCase() + operationInfo.operation?.substring(1)}</DialogTitle>
                <DialogContent>
                    {operationInfo.message}
                    {
                        operationInfo.operation == "unassign" &&
                        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                            Unassigning an asset will make it available for reassignment. Are you sure you want to unassign this asset?
                        </Typography>
                    }
                    {
                        operationInfo.operation == "assign" &&
                        <Box sx={{ mt: 2 }}>
                            <AsynchronousAutoComplete fetchUrl="/employees/search" optionLabelFunction={employeeOptionLabel} optionaEqualToValueFunction={employeeOptionEqualToLabel} sendInputToParent={handleAutoCompleteChange('employee_id')} />
                        </Box>
                    }
                    {
                        operationInfo.operation == "assign_bulk" &&
                        <Box sx={{ mt: 2 }}>
                            {operationInfo.selectedRow.length} licenses will be assigned to the selected employee. Are you sure you want to assign these licenses?
                        </Box>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOperationInfo(prev => { return { ...prev, showSnackBar: false } })}>Cancel</Button>
                    <Button onClick={dialogActions[operationInfo.operation]} color={dialogActionColors[operationInfo.operation]}>{operationInfo.operation?.substring(0, 1).toUpperCase() + operationInfo.operation?.substring(1)}</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default LicensePage;
