import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Mock API response
const mockFormFields = [
  { id: 'name', label: 'Asset Name', type: 'text', required: true },
  { id: 'number', label: 'Asset Number', type: 'text', required: true },
  { id: 'description', label: 'Description', type: 'textarea' },
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'Electronics', label: 'Electronics' },
      { value: 'Furniture', label: 'Furniture' },
      { value: 'Software', label: 'Software' },
      { value: 'Equipment', label: 'Equipment' },
    ],
    required: true,
  },
  { id: 'purchaseDate', label: 'Purchase Date', type: 'date' },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Available', label: 'Available' },
      { value: 'In Use', label: 'In Use' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Retired', label: 'Retired' },
    ],
    required: true,
  },
];

export default function CreateAssetForm({ open, onClose }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormFields = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFields(mockFormFields);
        
        const initialData = {};
        mockFormFields.forEach(field => {
          initialData[field.id] = '';
        });
        setFormData(initialData);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchFormFields();
    }
  }, [open]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form data:', formData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      sx={
        {

          maxWidth:"sm"
        }
      }
      fullWidth
      TransitionProps={{
        enter: true,
        exit: true,
      }}
    >
      <DialogTitle>Create New Asset</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" noValidate sx={{ mt: 2 }}>
            {fields.map((field) => (
              <Box key={field.id} sx={{ mb: 2 }}>
                {field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={formData[field.id] || ''}
                      label={field.label}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                    >
                      {field.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : field.type === 'date' ? (
                  <DatePicker
                    label={field.label}
                    value={formData[field.id] || null}
                    onChange={(value) => handleChange(field.id, value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: field.required,
                      },
                    }}
                  />
                ) : field.type === 'textarea' ? (
                  <TextField
                    fullWidth
                    label={field.label}
                    multiline
                    rows={4}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Create Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
}
