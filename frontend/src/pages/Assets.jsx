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

    useEffect(() => {
        const abortController = new AbortController();
        async function fetchData() {
            try {
                const response = await axiosInstance.get(`/assets?page=${page}&limit=${PAGE_LIMIT}`, { signal: abortController.signal });
                console.log(response.data);

                setData(response.data);
            } catch (error) {
                console.error(error);

                console.log("Error occurred while fetching data");

            }
        }
        fetchData();
        return () => {
            abortController.abort();
        }
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
                        <CustomTable currentSection="assets" page={page} data={data} setPage={setPage} />
                    </React.Fragment>
                }
            </React.Fragment>
        )
    )
}

export default AssetsPage;