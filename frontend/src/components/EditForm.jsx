import { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { convertPascaleCaseToSnakeCase } from "../utils/helperFunctions";

export default function EditForm({
  isDialogOpen,
  closeDialog,
  currentSection,
  fields,
  values,
  saveData,
}) {
  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
  }, [values]);

  if (!fields || !values) return null;

  console.log(values);

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async () => {
    console.log("Form data:", formData);
    saveData(formData);
    closeDialog();
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
      <DialogTitle>Edit {`${currentSection}`}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {Object.keys(fields).map((key) => {
            const field = fields[key];
            return (
              field.edit && (
                <Box key={field.id} sx={{ mb: 2 }}>
                  {field.type === "select" ? (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={
                          convertPascaleCaseToSnakeCase(formData[field.id]) ||
                          ""
                        }
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
                  ) : field.type === "date" ? (
                    <DatePicker
                      label={field.label}
                      value={dayjs(formData[field.id])}
                      onChange={(value) =>
                        handleChange(
                          field.id,
                          dayjs(value).format("YYYY-MM-DD"),
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: field.required,
                        },
                      }}
                    />
                  ) : field.type === "textarea" ? (
                    <TextField
                      fullWidth
                      label={field.label}
                      multiline
                      rows={4}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  )}
                </Box>
              )
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditForm.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  currentSection: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  saveData: PropTypes.func.isRequired,
};
