import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import { PAGE_LIMIT } from "../utils/constants";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Popover, Snackbar, Typography } from '@mui/material';
import CreateForm from '../components/CreateForm';
import EditForm from '../components/EditForm';
import Icon from '../components/Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const AssetsPage = () => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editInfo, setEditInfo] = useState({ showEditForm: false, selectedRow: null });
    const [operationInfo, setOperationInfo] = useState({ showSnackBar: false, operation: null, message: "", selectedRow: null });

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

    async function refreshData(){
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
            toast.error("An error occurred while refreshing data", { id: toastId});
        });
    }

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

    const setEditingRowIndex = (rowIndex) => {
        setEditInfo({ showEditForm: true, selectedRow: rowIndex });
    }

    const setUnAssignRowIndex = (rowIndex) => {
        setOperationInfo({ showSnackBar: true, operation: "unassign", message: `Are you sure you want to unassign asset ${data.data.documents[rowIndex].serial_no} from ${data.data.documents[rowIndex].assigned_to}?`, selectedRow: rowIndex });
    }

    const setDeleteRowIndex = (rowIndex) => {
        if(data.data.documents[rowIndex].assigned_to){
            return toast.error("Cannot delete assigned asset");
        }
        setOperationInfo({ showSnackBar: true, operation: "delete", message: `Are you sure you want to delete ${data.data.documents[rowIndex].serial_no} asset?`, selectedRow: rowIndex });
    }

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
                setOperationInfo({ showSnackBar: false, operation: null, message: "", selectedRow: null });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    async function deleteAsset(){
        try {
            const response = await axiosInstance.delete(`/objects/assets/delete`,{
               data:{
                object_name: "assets",
                serial_no: data.data.documents[operationInfo.selectedRow].serial_no
               }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    refreshData();
                }, 1000);
                setOperationInfo({ showSnackBar: false, operation: null, message: "", selectedRow: null });
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

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
                        setUnAssignRowIndex={setUnAssignRowIndex}
                        setDeleteRowIndex={setDeleteRowIndex}
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
                </React.Fragment>
            }
            <Dialog
                open={operationInfo.showSnackBar}
                onClose={() => setOperationInfo({ showSnackBar: false, operation: null, message: "", selectedRow: null })}
            >
                <DialogTitle>Confirm {operationInfo.operation == "unassign" ? "Unassign" : "Delete"}</DialogTitle>
                <DialogContent>
                    {operationInfo.message}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOperationInfo(prev => { return { ...prev, showSnackBar: false } })}>Cancel</Button>
                    <Button onClick={operationInfo.operation =="unassign" ? unAssignAsset: deleteAsset} color={operationInfo.operation == "unassign" ? "warning" : "error"}>{operationInfo.operation == "unassign" ? "Unassign" : "Delete"}</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default AssetsPage;
