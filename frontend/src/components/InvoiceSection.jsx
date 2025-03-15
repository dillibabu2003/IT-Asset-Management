import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import Icon from './Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';


const invoices = [
  { id: '#INV-2025001', vendor: 'Apple Inc.', date: 'Jan 15, 2025', amount: 1299.00, status: 'Processed' },
  { id: '#INV-2025002', vendor: 'Microsoft Corp.', date: 'Jan 14, 2025', amount: 899.00, status: 'Pending' },
  { id: '#INV-2025003', vendor: 'Amazon.com', date: 'Jan 13, 2025', amount: 2499.00, status: 'Rejected' },
];


const getStatusColor = (status) => {
  switch (status) {
    case 'Processed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

function InvoiceSection() {
  const [page, setPage] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [documents,setDocuments]=useState({});

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const uploadFileToS3 = async (url,file,fileType,file_name) => {
    const s3Response = await axiosInstance.put(url,file,{headers: {"Content-Type": fileType}});
    return s3Response.status===200;
  }
  const handleUpload = async (e) => {
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
  
    // Convert file to base64 using FileReader
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1]; // Remove the data URL prefix
      // console.log("Base64 Encoded File: ", base64String);
  
      // Call your function to process the base64 string with Gemini
      try {
        const JsonResponse = await getDataFromGemini(base64String, file.type);
        const document=JSON.parse(JsonResponse.candidates[0].content.parts[0].text);
        console.log(document);
        setDocuments(document);
      } catch (error) {
        console.error("Error processing the file with Gemini:", error);
      }
    };
  
    reader.onerror = () => {
      console.error("Error reading file");
    };
  
    reader.readAsDataURL(file); // Reads the file as a Data URL (base64 encoded string)
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="500">Invoices</Typography>
        <ProtectedComponent requiredPermission="create:invoice">
          <Button
            variant="contained"
            startIcon={<Icon name="upload" size={18} />}
            sx={{ textTransform: 'none' }}
          >
            Upload Invoice
          </Button>
        </ProtectedComponent>
      </Box>

      <ProtectedComponent requiredPermission="create:invoices">
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
          onDrop={handleDrag}
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
              component="label"
              startIcon={<Icon name="upload" size={18} />}
              sx={{ textTransform: 'none' }}
            >
              Upload Invoice
              <input
                type="file"
                hidden
                name={"invoice"}
                onChange={handleUpload}
              />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
              Supported formats: PDF, PNG, JPEG (Max size: 10MB)
            </Typography>
          </Box>
        </Paper>
      </ProtectedComponent>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<Icon name="filter" size={18} />}
            sx={{ textTransform: 'none' }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icon name="download" size={18} />}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Vendor Name</TableCell>
                <TableCell>Date of Upload</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small">
                        <Icon name="eye" size={18} />
                      </IconButton>
                      <IconButton size="small">
                        <Icon name="download" size={18} />
                      </IconButton>
                      <IconButton size="small">
                        <Icon name="more-vertical" size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing 1 to 3 of 50 entries
          </Typography>
          <Pagination
            count={10}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default InvoiceSection;
