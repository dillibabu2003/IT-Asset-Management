import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import { PAGE_LIMIT } from "../utils/constants";
import { Box, Button, Popover, Typography } from '@mui/material';
import CreateForm from '../components/CreateForm';
import Icon from '../components/Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';

const AssetsPage = () => {


    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [importMenuAnchor, setImportMenuAnchor] = useState(null);

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
            const assetsPromise=fetchAssetsByPageAndLimit(abortController,page,PAGE_LIMIT);
            const assetsMetadataPromise=fetchAssetsMetaData(abortController);
            const userColumnPreferencesPromise=fetchUserColumnPreferences(abortController);
            return Promise.all([assetsPromise,assetsMetadataPromise,userColumnPreferencesPromise]);
    }
    useEffect(() => {
        const abortController = new AbortController();
        fetchData(abortController).then((response) => {
            const assets=response[0].data;
            const assetsMetaData=response[1].data;
            const userColumnPreferences=response[2].data;
            console.log(userColumnPreferences);
            console.log(assets,assetsMetaData);
            
            setData({data: assets, fields: assetsMetaData, userColumnPreferences: userColumnPreferences});
        }).catch((error) => {   
            console.log(error);
        });
        return () => {
            abortController.abort();
        };
    }, [page]);
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
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Icon name="upload" size={20} />}
                                onClick={(e) => setImportMenuAnchor(e.currentTarget)}
                            >
                                Bulk Import
                            </Button>
                            <Popover
                                open={Boolean(importMenuAnchor)}
                                anchorEl={importMenuAnchor}
                                onClose={() => setImportMenuAnchor(null)}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                            >
                                <Box sx={{ p: 1, width: "fit-content", display: 'flex', flexDirection: "column" }}>
                                    <Button
                                        fullWidth
                                        startIcon={<Icon name="file-spreadsheet" size={20} />}
                                        sx={{ mb: 1, justifyContent: 'flex-start', textWrap: 'nowrap' }}
                                    >
                                        From Excel
                                    </Button>
                                    <Button
                                        fullWidth
                                        startIcon={<Icon name="file-text" size={20} />}
                                        sx={{ justifyContent: 'flex-start', textWrap: 'nowrap' }}
                                    >
                                        From Invoice
                                    </Button>
                                </Box>
                            </Popover>

                        </Box>

                    </Box>
                    </ProtectedComponent>

                </Box>
                {!data ? <Loader /> :
                    <React.Fragment>
                        <CreateForm currentSection="assets" fields={data.fields} isOpen={showCreateForm} closeDialog={() => setShowCreateForm(false)} aria-describedby={`create-assets-form`} />
                        <CustomTable currentSection="assets" page={page} data={data} setPage={setPage} userVisibleColumns={data.userColumnPreferences} />
                    </React.Fragment>
                }
            </React.Fragment>
        )
    )
}

export default AssetsPage;