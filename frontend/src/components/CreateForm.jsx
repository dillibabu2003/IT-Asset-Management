import React, { use, useEffect, useState } from 'react';
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
import dayjs from 'dayjs';
import { convertPascaleCaseToSnakeCase } from '../utils/helperFunctions';



export default function CreateForm({ isDialogOpen, closeDialog, currentSection, fields, values, saveData }) {
  if (!fields || !values) return null;

  console.log(isDialogOpen);
  

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
  }, [values]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    console.log('Form data:', formData);
    saveData(formData);
    
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={closeDialog}
      fullWidth
      TransitionProps={{
        enter: true,
        exit: true,
      }}
    >
      <DialogTitle>Create {`${currentSection}`}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {Object.keys(fields).map((key)=>{ const field=fields[key]; return (field.create &&
            <Box key={field.id} sx={{ mb: 2 }}>
              {field.type === 'select' ? (
                <FormControl fullWidth>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={convertPascaleCaseToSnakeCase(formData[field.id]) || ''}
                    label={field.label}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                  >
                    {
                      field.id == "status" ?
                        field.options.map((option) => (
                          option.value == "available" ?
                            <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem> : null
                        ))
                        :
                        field.options.map((option) => (
                          <MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>
                        ))
                    }
                  </Select>
                </FormControl>
              ) : field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  value={formData[field.id] ? dayjs(formData[field.id]) : null}
                  onChange={(value) => handleChange(field.id, dayjs(value).format('YYYY-MM-DD'))}
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
          )})}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
