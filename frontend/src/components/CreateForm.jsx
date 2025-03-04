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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default function CustomForm({ isOpen, closeDialog, currentSection,fields }) {
  if(!fields) return null;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async() => {
    console.log('Form data:', formData);
    
    closeDialog();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={closeDialog}
      fullWidth
      TransitionProps={{
        enter: true,
        exit: true,
      }}
    >
      <DialogTitle>Create New {`${currentSection}`}</DialogTitle>
      <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            {fields.map((field) => ( field.create &&
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
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Create {currentSection}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
