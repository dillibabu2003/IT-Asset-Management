import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import { PAGE_LIMIT } from "../utils/constants";
import { Box, Button, Popover, Typography } from '@mui/material';
import CreateForm from '../components/CreateForm';
import Icon from '../components/Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const AssetsPage = () => {


    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT);
    const [showCreateForm, setShowCreateForm] = useState(false);

    async function fetchAssetsByPageAndLimit(abortController,page,limit){
            const response = await axiosInstance.get(`/objects/assets?page=${page}&limit=${limit}`, { signal: abortController.signal });
            return response.data;
    }
    async function fetchAssetsMetaData(abortController){
            const response = await axiosInstance.get("/metadata/assets", { signal: abortController.signal });
            return response.data;
    }
    async function fetchUserColumnPreferences(abortController){
        const response = await axiosInstance.get("/objects/assets/column-visibilities", { signal: abortController.signal });
        return response.data;
    }
    async function fetchData(abortController) {
            const assetsPromise=fetchAssetsByPageAndLimit(abortController,page,pageLimit);
            const assetsMetadataPromise=fetchAssetsMetaData(abortController);
            const userColumnPreferencesPromise=fetchUserColumnPreferences(abortController);
            return Promise.all([assetsPromise,assetsMetadataPromise,userColumnPreferencesPromise]);
    }
    async function handleSave(formData){
        console.log(formData);
        try {
            const response = await axiosInstance.post("/objects/assets/create",formData);
            if(response.data.success){
                toast.success(response.data.message);
                setShowCreateForm(false);
            }
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }

        
    }
    useEffect(() => {
        const abortController = new AbortController();
        
        if (!data) {
            // Initial load - fetch everything
            fetchData(abortController).then((response) => {
                const assets = response[0].data;
                const assetsMetaData = response[1].data;
                const userColumnPreferences = response[2].data;
                setData({data: assets, fields: assetsMetaData, userColumnPreferences: userColumnPreferences});
            }).catch((error) => {   
                console.log(error);
            });
        } else {
            // On page/limit change - fetch only assets
            fetchAssetsByPageAndLimit(abortController, page, pageLimit).then((response) => {
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
                        <CreateForm currentSection="assets" fields={data.fields} isDialogOpen={showCreateForm} values={Object.fromEntries(data.fields.map(field => [field.id, '']))} closeDialog={() => setShowCreateForm(false)} saveData={handleSave}  aria-describedby={`create-assets-form`} />
                        <CustomTable currentSection="assets" page={page} pageLimit={pageLimit} setPageLimit={setPageLimit} data={data} setPage={setPage} userVisibleColumns={data.userColumnPreferences} />
                    </React.Fragment>
                }
            </React.Fragment>
        )
    )
}

export default AssetsPage;