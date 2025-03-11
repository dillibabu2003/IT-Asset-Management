import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import { PAGE_LIMIT } from "../utils/constants";
import { Box, Button, Popover, Typography } from '@mui/material';
import CreateForm from '../components/CreateForm';

import EditForm from '../components/EditForm';
import Icon from '../components/Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const LicensesPage = () => {


    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editInfo, setEditInfo] = useState({showEditForm: false, selectedRow: null});
    // const [edit]
    async function fetchLicensesByPageAndLimit(abortController,page,limit){
            const response = await axiosInstance.get(`/objects/licenses?page=${page}&limit=${limit}`, { signal: abortController.signal });
            return response.data;
    }
    async function fetchLicensesMetaData(abortController){
            const response = await axiosInstance.get("/metadata/licenses", { signal: abortController.signal });
            return response.data;
    }
    async function fetchUserColumnPreferences(abortController){
        const response = await axiosInstance.get("/objects/licenses/column-visibilities", { signal: abortController.signal });
        return response.data;
    }
    async function fetchData(abortController) {
            const licensesPromise=fetchLicensesByPageAndLimit(abortController,page,pageLimit);
            const licensesMetadataPromise=fetchLicensesMetaData(abortController);
            const userColumnPreferencesPromise=fetchUserColumnPreferences(abortController);
            return Promise.all([licensesPromise,licensesMetadataPromise,userColumnPreferencesPromise]);
    }
    async function createLicense(formData){
        console.log(formData);
        try {
            const response = await axiosInstance.post("/objects/licenses/create",formData);
            if(response.data.success){
                toast.success(response.data.message);
                setShowCreateForm(false);
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }
    async function saveEditedData(formData){
        console.log(formData);
        try {
            const response = await axiosInstance.put("/objects/licenses/update",formData);
            if(response.data.success){
                toast.success(response.data.message);
                setEditInfo(prev=>{return {...prev,showEditForm: false}});
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    }

    const setEditingRowIndex=(rowIndex)=>{
        console.log("Editing row index",rowIndex);
        console.log(data.data);
        
        setEditInfo({showEditForm: true, selectedRow: rowIndex});
    }

    useEffect(() => {
        const abortController = new AbortController();
        
        if (!data) {
            // Initial load - fetch everything
            fetchData(abortController).then((response) => {
                const licenses = response[0].data;
                const licensesMetaData = response[1].data;
                const userColumnPreferences = response[2].data;
                setData({data: licenses, fields: licensesMetaData, userColumnPreferences: userColumnPreferences});
            }).catch((error) => {   
                console.log(error);
            });
        } else {
            // On page/limit change - fetch only licenses
            fetchLicensesByPageAndLimit(abortController, page, pageLimit).then((response) => {
                setData(prev => ({...prev, data: response.data}));
            }).catch((error) => {   
                console.log(error);
            });
        }

        return () => {
            abortController.abort();
        };
    }, [page, pageLimit]);

    
    return (
        (
            <React.Fragment>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="500">Licenses</Typography>

                        <ProtectedComponent requiredPermission={"create:licenses"}>
                    <Box sx={{ display: 'flex', gap: "8px", alignItems: "center" }}>
                        <Button
                            variant="contained"
                            startIcon={<Icon name="plus" size={18} />}
                            sx={{ textTransform: 'none' }}
                            onClick={() => setShowCreateForm(true)}
                        >
                            Create License
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
                {!data ? <Loader /> :
                    <React.Fragment>
                        <CreateForm currentSection="licenses" fields={data.fields} isDialogOpen={showCreateForm} values={Object.keys(data.fields).reduce((acc, key) => {
                                        acc[key] = '';
                                        return acc;
                                    }, {})} closeDialog={() => setShowCreateForm(false)} saveData={createLicense}  aria-describedby={`create-licenses-form`} />
                        <CustomTable currentSection="licenses" page={page} pageLimit={pageLimit} setPageLimit={setPageLimit} setEditingRowIndex={setEditingRowIndex} data={data} setPage={setPage} userVisibleColumns={data.userColumnPreferences} />
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
                                closeDialog={() => {setEditInfo({selectedRow:null,showEditForm: false})}} 
                                saveData={saveEditedData}  
                                aria-describedby={`edit-licenses-form`} 
                            />
                        )}
                    </React.Fragment>
                }
            </React.Fragment>
        )
    )
}

export default LicensesPage;