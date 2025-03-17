import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
    Chip,
    Pagination,
    Stack,
    InputAdornment,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Select,
    FormControl,
    InputLabel,
    MenuItem
} from '@mui/material';
import getDataFromGemini from '../utils/gemini';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Icon from "../components/Icon";
import { convertPascaleCaseToSnakeCase, convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';
import { PAGE_LIMIT } from '../utils/constants';
// import ApiError from '../../../backend/utils/ApiError';


function InputField({ label, type, id, value, options, required, setInputValue }) {
    return (
        type === 'select' ? (
            <FormControl fullWidth>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={convertPascaleCaseToSnakeCase(value) || ''}
                    label={label}
                    onChange={(e) => setInputValue(id, e.target.value)}
                    required={required}
                >
                    {
                        options.map((option) => {
                            return (
                                <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                            )
                        })
                    }
                </Select>
            </FormControl>) : type === 'date' ? (


                <DatePicker
                    label={label}
                    value={value ? dayjs(value) : null}
                    onChange={(value) => setInputValue(id, dayjs(value).format('YYYY-MM-DD'))}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required: required,
                        },
                    }}
                />) : type === 'textarea' ? (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={label}
                        type={type}
                        value={value}
                        onChange={(e) => setInputValue(id, e.target.value)}
                    />)
            : (
                <TextField
                    fullWidth
                    label={label}
                    value={value}
                    onChange={(e) => setInputValue(id, e.target.value)}
                />
            ));
}
function ParsedInvoiceData({ items, columns, onEdit, onDelete }) {
    if (items.length == 0) return <>No items found.</>;

    return <Box>
        {
            items.map((item, index) => {
                return (
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        {Object.keys(columns).map((key) => {
                            const column = columns[key];
                            return (
                                <Grid key={key + "-" + column.id} item xs={12} md={2}>
                                    <InputField
                                        key={column.id}
                                        label={column.label}
                                        type={column.type}
                                        id={column.id}
                                        value={item[key] || column.default}
                                        options={column.options}
                                        required={column.required}
                                        setInputValue={
                                            (id, value) => {
                                                onEdit(index, id, value)
                                            }
                                        }
                                    />
                                </Grid>
                            )
                        })}
                        <Button variant='contained' color='error' sx={{ mt: 3, ml: 3 }} onClick={() => { onDelete(index) }}>Delete</Button>
                    </Grid>
                );
            })
        }
    </Box>
}



const columns = {
    invoice_id: { id: 'invoice_id', label: 'Invoice ID', type: 'text', required: true,visible: true,create:true,edit: true},
    vendor_name: { id: 'vendor_name', label: 'Vendor Name', type: 'text', required: true,visible: true,create:true,edit: true},
    invoice_date: { id: 'invoice_date', label: 'Invoice Date', type: 'datetime', required: true,visible: true,create:true,edit: true},
    invoice_description: { id: 'invoice_description', label: 'Invoice Description', type: 'text', required: true,visible: true,create:true,edit: true},
    owner_name: { id: 'owner_name', label: 'Owner Name', type: 'text', required: true,visible: true,create:true,edit: true },
    assets: {
        serial_no: { id: 'serial_no', label: 'Serial No', type: 'text', required: true },
        category: {
            id: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { label: 'Laptop', value: 'laptop' },
                { label: 'Desktop', value: 'desktop' },
                { label: 'Server', value: 'server' },
                { label: 'Printer', value: 'printer' },
                { label: 'Monitor', value: 'monitor' },
                { label: 'Mouse', value: 'mouse' },
                { label: 'Keyboard', value: 'keyboard' }
            ],
            required: true
        },
        make: {
            id: 'make',
            label: 'Make',
            type: 'select',
            options: [
                { label: 'Lenovo', value: 'lenovo' },
                { label: 'Mac', value: 'mac' },
                { label: 'Dell', value: 'dell' },
                { label: 'HP', value: 'hp' },
                { label: 'Logitech', value: 'logitech' },
                { label: 'Samsung', value: 'samsung' },
                { label: 'LG', value: 'lg' },
                { label: 'Epson', value: 'epson' }
            ],
            required: true
        },
        model: {
            id: 'model',
            label: 'Model',
            type: 'select',
            options: [
                { label: 'MacBook Air', value: 'macbook_air' },
                { label: 'MacBook Pro', value: 'macbook_pro' },
                { label: 'ThinkPad X1 Carbon', value: 'thinkpad_x1_carbon' },
                { label: 'ThinkPad T14', value: 'thinkpad_t14' },
                { label: 'Latitude 9510', value: 'latitude_9510' },
                { label: 'Inspiron 5406', value: 'inspiron_5406' },
                { label: 'Galaxy Book Flex', value: 'galaxy_book_flex' },
                { label: 'UltraFine 4K Display', value: 'ultrafine_4k_display' },
                { label: 'WorkForce Pro WF-3820', value: 'workforce_pro_wf_3820' },
                { label: 'Latitude', value: 'latitude' },
                { label: 'ProBook', value: 'probook' },
                { label: 'EliteBook', value: 'elitebook' },
                { label: 'Chromebook', value: 'chromebook' },
                { label: 'ThinkCentre', value: 'thinkcentre' },
                { label: 'OptiPlex', value: 'optiplex' },
                { label: 'Precision', value: 'precision' },
                { label: 'PowerEdge', value: 'poweredge' },
                { label: 'ProLiant', value: 'proliant' },
                { label: 'Galaxy Book', value: 'galaxy_book' },
                { label: 'UltraFine 5K Display', value: 'ultrafine_5k_display' },
                { label: 'WorkForce Pro WF-7840', value: 'workforce_pro_wf_7840' }
            ],
            required: true
        },
        warranty: {
            id: 'warranty',
            label: 'Warranty Type',
            type: 'select',
            options: [
                { label: 'Apple Care', value: 'apple_care' },
                { label: 'Basic', value: 'basic' },
                { label: 'ADP', value: 'adp' }
            ],
            required: true
        },
        cost: { id: 'cost', label: 'Cost', type: 'number', required: true },
        os_type: {
            id: 'os_type',
            label: 'OS Type',
            type: 'select',
            options: [
                { label: 'Mac', value: 'mac' },
                { label: 'Windows', value: 'windows' },
                { label: 'Linux', value: 'linux' }
            ],
            required: true
        },
        processor: {
            id: 'processor',
            label: 'Processor',
            type: 'select',
            options: [
                { label: 'M1', value: 'm1' },
                { label: 'M1 Pro', value: 'm1_pro' },
                { label: 'M1 Max', value: 'm1_max' },
                { label: 'M2', value: 'm2' },
                { label: 'M2 Pro', value: 'm2_pro' },
                { label: 'M2 Max', value: 'm2_max' },
                { label: 'M3', value: 'm3' },
                { label: 'M3 Pro', value: 'm3_pro' },
                { label: 'M3 Max', value: 'm3_max' },
                { label: 'i3', value: 'i3' },
                { label: 'i5', value: 'i5' },
                { label: 'i7', value: 'i7' },
                { label: 'i9', value: 'i9' },
                { label: 'Ryzen 3', value: 'ryzen_3' },
                { label: 'Ryzen 5', value: 'ryzen_5' },
                { label: 'Ryzen 7', value: 'ryzen_7' },
                { label: 'Ryzen 9', value: 'ryzen_9' }
            ],
            required: true
        },
        ram: {
            id: 'ram',
            label: 'RAM',
            type: 'select',
            options: [
                { label: '8GB', value: '8gb' },
                { label: '16GB', value: '16gb' },
                { label: '32GB', value: '32gb' },
                { label: '64GB', value: '64gb' },
                { label: '128GB', value: '128gb' }
            ],
            required: true
        },
        storage: {
            id: 'storage',
            label: 'Storage',
            type: 'select',
            options: [
                { label: '128GB', value: '128gb' },
                { label: '256GB', value: '256gb' },
                { label: '512GB', value: '512gb' },
                { label: '1TB', value: '1tb' },
                { label: '2TB', value: '2tb' }
            ],
            required: true
        },
        warranty_period: {
            id: 'warranty_period',
            label: 'Warranty Period',
            type: 'select',
            options: [
                { label: '1 Year', value: '1year' },
                { label: '2 Years', value: '2years' },
                { label: '3 Years', value: '3years' },
                { label: '4 Years', value: '4years' },
                { label: '5 Years', value: '5years' }
            ],
            default: '3years',
            required: true
        },
        warranty_start_date: {
            id: 'warranty_start_date',
            label: 'Warranty Start Date',
            type: 'date',
            required: true
        }
    },
    licenses: {
        serial_no: { id: 'serial_no', label: 'Serial No', type: 'text', required: true },
        category: {
            id: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { label: 'Sophos', value: 'sophos' },
                { label: 'Grammarly', value: 'grammarly' },
                { label: 'Microsoft', value: 'microsoft' },
                { label: 'Adobe', value: 'adobe' },
                { label: 'Autodesk', value: 'autodesk' }
            ],
            required: true
        },
        model: { id: 'model', label: 'Model', type: 'text', required: true },
        cost: { id: 'cost', label: 'Cost', type: 'number', required: true },
        warranty: {
            id: 'warranty',
            label: 'Warranty Type',
            type: 'select',
            options: [
                { label: 'Basic', value: 'basic' },
                { label: 'ADP', value: 'adp' },
                { label: 'Apple Care', value: 'apple_care' }
            ],
            required: true
        },
        warranty_period: {
            id: 'warranty_period',
            label: 'Warranty Period',
            type: 'select',
            options: [
                { label: '1 Year', value: '1year' },
                { label: '2 Years', value: '2years' },
                { label: '3 Years', value: '3years' },
                { label: '4 Years', value: '4years' },
                { label: '5 Years', value: '5years' }
            ],
            required: true
        },
        warranty_start_date: {
            id: 'warranty_start_date',
            label: 'Warranty Start Date',
            type: 'date',
            required: true
        }
    },
    invoice_type: {
        id: 'invoice_type',
        label: 'Invoice Type',
        type: 'select',
        options: [
            { label: 'Own', value: 'own' },
            { label: 'Rental', value: 'rental' }
        ]
    },
    total_amount: { id: 'total_amount', label: 'Total Amount', type: 'number' }
};

const filterColumns = {
    invoice_id: { id: 'invoice_id', label: 'Invoice ID', type: 'text' },
    vendor_name: { id: 'vendor_name', label: 'Vendor Name', type: 'text' },
    invoice_type: {
        id: 'invoice_type',
        label: 'Invoice Type',
        type: 'select',
        options: ['own', 'rental']
    },
    total_amount: { id: 'total_amount', label: 'Total Amount', type: 'number' },
};



function InvoiceSection(
    {
        refreshData,
        ...props
    }
) {
    
    const [dragActive, setDragActive] = useState(false);
    const [processingStatus, setProcessingStatus] = useState({
        loading: false,
        message: null
    });
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            await processFile(file);
        }
    };

    const uploadFileToS3 = async (url, file, fileType) => {
        const s3Response = await axiosInstance.put(url, file, { headers: { "Content-Type": fileType } });
        return s3Response.status === 200;
    }

    const handleFileInput = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure correct file type (PDF, PNG, JPEG)
        if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
            toast.error("Invalid file format. Please upload a PDF, PNG, or JPEG file.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB size limit
            toast.error("File size exceeds the limit of 10MB.");
            return;
        }

        const document = await processFile(file);
        setCurrentInvoice(document);
    };

    const processFile = async (file) => {
        try {
            setError(null);
            // Read file content
            setProcessingStatus({ loading: true, message: 'Uploading file...' });
            const content = await readFileContent(file);
            const base64String = content.split(',')[1]; // Remove the data URL prefix

            setProcessingStatus(prev => ({ ...prev, message: "Parsing invoice..." }));

            // Process with Gemini AI
            const result = await processWithGemini(base64String, file.type);
            return result;
            // setPreviewOpen(true);
        } catch (err) {
            console.log(err);
            setError('Error processing invoice. Please try again.');
        } finally {
            setProcessingStatus(prev => { return { loading: false, message: null } });
        }
    };


    const readFileContent = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    const processWithGemini = async (base64String, fileType) => {
        try {
            const JsonResponse = await getDataFromGemini(base64String, fileType);
            const document = JSON.parse(JsonResponse.candidates[0].content.parts[0].text);
            return document;
        } catch (error) {
            console.error("Error processing the file with Gemini:", error);
        }
    };

    const addInvoiceDataToDB = async (document) => {
        try {
            const invoiceResponse = await axiosInstance.post("/invoices/create", document);
            return invoiceResponse;
        } catch (err) {
            console.error("Error Updating the Invoice details: ", err);
            return err.response;
        }
    }
    const handleSaveInvoice = async () => {
        const file = fileInputRef.current.files[0];
        const fileType = file.type;
        const toastId = toast.loading("Saving data...");
        try {
            const invoice_filename = currentInvoice.invoice_id+"."+fileType.split("/")[1];
            currentInvoice.invoice_filename = invoice_filename;
            const savedData = await addInvoiceDataToDB(currentInvoice);
            const invoice = savedData.data.data;
            if(!savedData.data.success){
                toast.error("Failed to save data.", { id: toastId });
                return;
            }
            toast.loading("Uploading invoice...", { id: toastId });
            const preSignedUrlResponse = await axiosInstance.post("/services/s3/put-object-url", {
                "content_type": fileType,
                "type": "invoice",
                "file_name": invoice.invoice_id
            });
            if (preSignedUrlResponse.data.success) {
                const { url, file_name } = preSignedUrlResponse.data.data;
                const response = await uploadFileToS3(url, file, fileType);
                if (response) {
                    toast.success("Invoice uploaded and data saved successfully.", { id: toastId });
                    fileInputRef.current.value = null;
                    setTimeout(() => {
                        refreshData();
                    }, 1000);
                    setCurrentInvoice(null);
                }
            }
        } catch (error) {
            console.error('Error occurred while uploading or saving data. Try again.', error);
            toast.error(error.response.data.message || "Failed to save invoice.", { id: toastId });
        }


    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="500">Invoices</Typography>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    border: '2px dashed',
                    borderColor: dragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: dragActive ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s ease-in-out'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Icon name="upload" size={48} color="#666" />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Drag and drop your invoice here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        or
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ textTransform: 'none' }}
                    >
                        Browse Files
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                        Supported formats: PDF, PNG, JPEG (Max size: 10MB)
                    </Typography>
                </Box>

                {processingStatus.loading && (
                    <Box sx={{ mt: 2 }}>
                        <Stack spacing={2}>
                            <Alert severity="info" icon={<CircularProgress size={20} />}>
                                {processingStatus.message}
                            </Alert>
                        </Stack>
                    </Box>
                )}

                {error && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Box>
                )}
            </Paper>
            {currentInvoice && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Invoice Details</Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {
                            Object.keys(columns).map((key) => {
                                const column = columns[key];
                                return (column.type != undefined &&
                                    <Grid item xs={12} key={column.id} md={6}>
                                        {/* Main details of invoice will be rendered here. */}
                                        <InputField
                                            label={column.label}
                                            type={column.type}
                                            id={column.id}
                                            value={currentInvoice[key] ?? column.default}
                                            options={column.options}
                                            required={column.required}
                                            setInputValue={setCurrentInvoice}
                                        />
                                    </Grid>
                                )
                            })
                        }
                    </Grid>
                </Box>
            )}
            {
                currentInvoice && Object.keys(columns).map((outerKey) => {
                    const innerObject = columns[outerKey]; // {serial_no: {id: ,label: , type: }}
                    return (
                        innerObject.type == undefined &&
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>{convertSnakeCaseToPascaleCase(outerKey)}</Typography>
                            {/* Details related to asset or license will be over here */}
                            <ParsedInvoiceData
                                items={currentInvoice[outerKey]}
                                columns={innerObject}
                                onEdit={(index, key, value) => {
                                    setCurrentInvoice((prev) => {
                                        const updatedData = [...prev[outerKey]];
                                        updatedData[index][key] = value;
                                        return { ...prev, [outerKey]: updatedData };
                                    });
                                }}
                                onDelete={(index) => {
                                    setCurrentInvoice((prev) => {
                                        const updatedData = [...prev[outerKey]];
                                        updatedData.splice(index, 1);
                                        return { ...prev, [outerKey]: updatedData };
                                    });
                                }}
                            />
                        </Box>
                    )
                })
            }
            {
                currentInvoice && (
                    <Box sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleSaveInvoice}
                        >
                            Save Invoice
                        </Button>
                    </Box>
                )
            }
            {!currentInvoice &&
                <React.Fragment>

                   
                </React.Fragment>
            }
        </Box>
    );
}

export default InvoiceSection;
