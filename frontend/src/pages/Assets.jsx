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

const AssetsPage = () => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editInfo, setEditInfo] = useState({ showEditForm: false, selectedRow: null });
    const [operationInfo, setOperationInfo] = useState({ showSnackBar: false, operation: null, message: "", selectedRow: null });
    const [employeeId, setEmployeeId] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [bulkAssignInfo, setBulkAssignInfo] = useState({showBulkAssignDialog: false, selectedRows: [], serialNumbersMappedWithEmployeeIds: []});
    //Fetching Data Functions
    async function fetchAssetsByPageAndLimit(abortController, page, limit) {
        const response = await axiosInstance.get(`/objects/assets?page=${page}&limit=${limit}`, { signal: abortController.signal });
        return response.data;
    }
    async function fetchAssetsMetaData(abortController) {
        const response = await axiosInstance.get("/metadata/assets", { signal: abortController.signal });
        return response.data;
    }
    async function fetchUserColumnPreferences(abortController) {
        const response = await axiosInstance.get("/objects/assets/column-visibilities", { signal: abortController.signal });
        return response.data;
    }
    async function fetchData(abortController) {
        const assetsPromise = fetchAssetsByPageAndLimit(abortController, page, pageLimit);
        const assetsMetadataPromise = fetchAssetsMetaData(abortController);
        const userColumnPreferencesPromise = fetchUserColumnPreferences(abortController);
        return Promise.all([assetsPromise, assetsMetadataPromise, userColumnPreferencesPromise]);
    }

    // Refersh data after any edits or deletes
    async function refreshData() {
        const toastId = toast.loading("Refreshing data...");
        const abortController = new AbortController();
        fetchData(abortController).then((response) => {
            const assets = response[0].data;
            const assetsMetaData = response[1].data;
            const userColumnPreferences = response[2].data;
            toast.success("Data refreshed", { id: toastId });
            setData({ data: assets, fields: assetsMetaData, userColumnPreferences: userColumnPreferences });
        }).catch((error) => {
            console.log(error);
            toast.error("An error occurred while refreshing data", { id: toastId });
        });
    }

    // Creating an asset
    async function createAsset(formData) {
        try {
            const response = await axiosInstance.post("/objects/assets/create", formData);
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
            const response = await axiosInstance.put("/objects/assets/update", formData);
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
            object_name: "assets",
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
                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
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
                object_name: "assets",
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
                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
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
            const response = await axiosInstance.delete(`/objects/assets/delete`, {
                data: {
                    object_name: "assets",
                    serial_no: data.data.documents[operationInfo.selectedRow].serial_no
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
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
        setOperationInfo({ showSnackBar: true, operation: "delete_bulk", message: `Are you sure you want to delete ${selectedRowsInfo.length} assets?`, selectedRow: selectedRowsInfo });
    }

    // Delete multiple assets
    async function deleteMultipleAssets() {
        try {
            const response = await axiosInstance.delete(`/objects/assets/delete/bulk`, {
                data: {
                    object_name: "assets",
                    serial_nos: operationInfo.selectedRow
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
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
        setOperationInfo({ showSnackBar: true, operation: "unassign_bulk", message: `Are you sure you want to unassign ${selectedRowsInfo.length} assets?`, selectedRow: selectedRowsInfo });
    }

    // Unassign multiple assets
    async function unAssignMultipleAssets() {
        try {
            const assetsToBeUnAssigned = [];
            data.data.documents.map((asset, index) => {
                if(selectedRows.includes(asset.serial_no))
                {
                    assetsToBeUnAssigned.push({
                        serial_no: asset.serial_no,
                        employee_id: asset.assigned_to
                    })
                }
            });
            const response = await axiosInstance.post(`/checkout/unassign/bulk`, {
                object_name: "assets",
                info_to_unassign: assetsToBeUnAssigned
                });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
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
        
        setBulkAssignInfo({showBulkAssignDialog: true, selectedRows: selectedRows, serialNumbersMappedWithEmployeeIds: []});
    }
    const setEmployeeIdsWithSelectedRows = (assignmentInfo) => {
        console.log(assignmentInfo);
        const newBulkAssignInfo = {
            ...bulkAssignInfo,
            serialNumbersMappedWithEmployeeIds: assignmentInfo
        }
        console.log(newBulkAssignInfo);
        
        setBulkAssignInfo(newBulkAssignInfo);
        setOperationInfo({ showSnackBar: true, operation: "assign_bulk", message: `Are you sure you want to assign ${bulkAssignInfo.selectedRows.length} assets?`, selectedRow: selectedRows });
    }

    async function assignMultipleAssets() {
        try {
            console.log(bulkAssignInfo);
            
            const response = await axiosInstance.post(`/checkout/assign/bulk`, {
                object_name: "assets",
                info_to_assign: bulkAssignInfo.serialNumbersMappedWithEmployeeIds
            });
            if (response.data.success) {
                toast.success(response.data.message);

                setTimeout(() => {
                    refreshData();
                }, 1000);

                setOperationInfo(prev=>{return {...prev, showSnackBar: false}});
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }


    // Employee AutoComplete
    const employeeOptionLabel = (option) => { return option ? `${option.employee_id || ''} ${option.firstname || ''} ${option.lastname || ''}`.trim() : '' };
    const employeeOptionEqualToLabel = (option, value) => { return option?.employee_id === value?.employee_id };
    const handleAutoCompleteChange = (field) => (event) => {
        console.log('field:', field);
        console.log('event:', event.target.value.employee_id);
        setEmployeeId(event.target.value.employee_id);
    };

    // Dialog Actions configuration
    const dialogActions = {
        assign: assignAsset,
        unassign: unAssignAsset,
        delete: deleteAsset,
        delete_bulk: deleteMultipleAssets,
        unassign_bulk: unAssignMultipleAssets,
        assign_bulk: assignMultipleAssets
    };
    const dialogActionColors = {
        assign: "success",
        unassign: "warning",
        delete: "error",
        delete_bulk: "error",
        unassign_bulk: "warning",
        assign_bulk: "success"
    };


    useEffect(() => {
        const abortController = new AbortController();

        if (!data) {
            fetchData(abortController).then((response) => {
                const assets = response[0].data;
                const assetsMetaData = response[1].data;
                const userColumnPreferences = response[2].data;
                setData({ data: assets, fields: assetsMetaData, userColumnPreferences: userColumnPreferences });
            }).catch((error) => {
                console.log(error);
            });
        } else {
            fetchAssetsByPageAndLimit(abortController, page, pageLimit).then((response) => {
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
                <Typography variant="h5" fontWeight="500">Assets</Typography>

                <ProtectedComponent requiredPermission={"create:assets"}>
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
                            <Link to="/assets/import" style={{ textDecoration: "none" }}>
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
            {!data ? <Loader /> :
                <React.Fragment>
                    <CreateForm
                        currentSection="assets"
                        fields={data.fields}
                        isDialogOpen={showCreateForm}
                        values={Object.keys(data.fields).reduce((acc, key) => {
                            acc[key] = '';
                            return acc;
                        }, {})}
                        closeDialog={() => setShowCreateForm(false)}
                        saveData={createAsset}
                        aria-describedby={`create-assets-form`}
                    />
                    <CustomTable
                        currentSection="assets"
                        page={page}
                        pageLimit={pageLimit}
                        setPageLimit={setPageLimit}
                        setEditingRowIndex={setEditingRowIndex}
                        data={data}
                        setPage={setPage}
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
                            currentSection="assets"
                            fields={data.fields}
                            isDialogOpen={editInfo.showEditForm}
                            values={editInfo.selectedRow !== null &&
                                Object.keys(data.fields).reduce((acc, key) => {
                                    acc[key] = data.data.documents[editInfo.selectedRow][key];
                                    return acc;
                                }, {})}
                            closeDialog={() => { setEditInfo({ selectedRow: null, showEditForm: false }) }}
                            saveData={saveEditedData}
                            aria-describedby={`edit-assets-form`}
                        />
                    )}
                    {bulkAssignInfo.showBulkAssignDialog && data.fields && data.data && (
                        <AssignMultipleItems 
                            currentSection="assets"
                            isDialogOpen={bulkAssignInfo.showBulkAssignDialog}
                            employeeOptionLabel={employeeOptionLabel}
                            employeeOptionEqualToLabel={employeeOptionEqualToLabel}
                            closeDialog={() => { setBulkAssignInfo(prev=>{ return {...prev,showBulkAssignDialog: false}}) }}
                            fields={data.fields}
                            items={data.data.documents}
                            selectedItemsSerialNumbers={bulkAssignInfo.selectedRows}
                            saveData={setEmployeeIdsWithSelectedRows}
                            aria-describedby={`bulk-assign-assets-form`}
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
                            {operationInfo.selectedRow.length} assets will be assigned to the selected employee. Are you sure you want to assign these assets?
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

export default AssetsPage;
