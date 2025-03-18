import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import Icon from "../components/Icon";
import PropTypes from "prop-types";

const Filters = ({ currentSection, columns, sendFilters }) => {
  // Local state for dialog filters
  const [dialogFilters, setDialogFilters] = React.useState({});
  // State for applied filters (shown as chips)
  const [appliedFilters, setAppliedFilters] = React.useState(
    sessionStorage.getItem(`${currentSection}-filters`)
      ? JSON.parse(sessionStorage.getItem(`${currentSection}-filters`))
      : {},
  );

  // Convert columns object to array and filter for select types
  const selectColumns = columns
    ? Object.entries(columns)
        // eslint-disable-next-line no-unused-vars
        .filter(([id, column]) => column.type === "select")
        .map(([id, column]) => ({ id, ...column }))
    : [];

  const handleFilterChange = (columnKey, value) => {
    if (value === "") {
      const newFilters = { ...dialogFilters };
      delete newFilters[columnKey];
      setDialogFilters(newFilters);
      return;
    }

    setDialogFilters((prevFilters) => ({
      ...prevFilters,
      [columnKey]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(dialogFilters);
    sendFilters(dialogFilters);
  };

  const handleResetFilters = () => {
    setDialogFilters({});
  };

  // Remove a filter chip and update applied filters
  const handleRemoveFilter = (key) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[key];
    setAppliedFilters(newFilters);
    setDialogFilters(newFilters); // Keep dialog state in sync
    sendFilters(newFilters); // Update the actual filters
  };

  // Add state for dialog
  const [open, setOpen] = React.useState(false);

  // Dialog handlers
  const handleOpenDialog = () => {
    // Initialize dialog filters with currently applied filters
    setDialogFilters({ ...appliedFilters });
    setOpen(true);
  };
  const handleCloseDialog = () => setOpen(false);

  // Apply filters and close dialog
  const handleApplyAndClose = () => {
    handleApplyFilters();
    handleCloseDialog();
  };

  return (
    <div
      className="filters-container"
      style={{ display: "flex", alignItems: "center", gap: 10 }}
    >
      {/* Display active filters */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {Object.keys(appliedFilters).length > 0 &&
          Object.entries(appliedFilters).map(([key, value]) => {
            // Find the column to get its label
            const column = selectColumns.find((col) => col.id === key);
            const columnName = column?.label || key;

            // Find the option label if it's an object
            const optionLabel = column?.options?.find(
              (opt) => (typeof opt === "object" ? opt.value : opt) === value,
            );
            const displayValue =
              typeof optionLabel === "object"
                ? optionLabel.label
                : optionLabel || value;

            return (
              <Chip
                key={key}
                label={`${columnName}: ${displayValue}`}
                color="success"
                size="small"
                onDelete={() => handleRemoveFilter(key)}
                sx={{ m: 0.5 }}
              />
            );
          })}
      </Box>

      <Button
        variant="outlined"
        startIcon={<Icon name="filter" />}
        onClick={handleOpenDialog}
      >
        Filters
      </Button>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Options</DialogTitle>
        <DialogContent>
          {selectColumns.length === 0 ? (
            <Box sx={{ p: 2 }}>No filters available</Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              {selectColumns.map((column) => {
                const columnKey = column.id;
                const columnName = column.label || columnKey;
                const options = column.options || [];

                return (
                  <FormControl key={columnKey} fullWidth margin="dense">
                    <InputLabel id={`filter-label-${columnKey}`}>
                      {columnName}
                    </InputLabel>
                    <Select
                      labelId={`filter-label-${columnKey}`}
                      value={dialogFilters[columnKey] || ""}
                      onChange={(e) =>
                        handleFilterChange(columnKey, e.target.value)
                      }
                      label={columnName}
                    >
                      <MenuItem value="">All</MenuItem>
                      {Array.isArray(options) &&
                        options.map((option, index) => {
                          const value =
                            typeof option === "object"
                              ? option.value || ""
                              : option;
                          const label =
                            typeof option === "object"
                              ? option.label || option.value || ""
                              : option;
                          return (
                            <MenuItem key={index} value={value}>
                              {label}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} color="error">
            Reset
          </Button>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleApplyAndClose} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
Filters.propTypes = {
  currentSection: PropTypes.string.isRequired,
  columns: PropTypes.object.isRequired,
  sendFilters: PropTypes.func.isRequired,
};

export default Filters;
