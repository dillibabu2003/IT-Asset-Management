import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Chip,
  Pagination,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  TableSortLabel,
  Popover,
} from '@mui/material';
import * as XLSX from 'xlsx';
import CustomForm from './CustomForm';
import Icon from './Icon';
import { PAGE_LIMIT } from '../utils/constants';


export default function CustomTable({currentSection,data,page,setPage}) {
  const [columns, setColumns] = useState(data.fields);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedDocuments = [...data.documents].sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] < b[orderBy] ? -1 : 1;
    } else {
      return b[orderBy] < a[orderBy] ? -1 : 1;
    }
  });

  const handleColumnToggle = (columnId) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const exportToExcel = () => {
    const visibleColumns = columns.filter(col => col.visible);
    const data = sortedAssets.map(asset => {
      const row = {};
      visibleColumns.forEach(col => {
        row[col.label] = asset[col.id];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    XLSX.writeFile(wb, 'assets.xlsx');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, flexWrap: "wrap", gap: "10px" }}>
        <TextField
          placeholder={`Search ${currentSection}...`}
          size="small"
          InputProps={{
            startAdornment: <Icon name="search" size={20} style={{ marginRight: 8 }} />,
          }}
          sx={{ width: 300, flexGrow: 1 }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<Icon name="settings" size={20} />}
            onClick={(e) => setColumnsMenuAnchor(e.currentTarget)}
          >
            Columns
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icon name="download" size={20} />}
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon name="plus" size={20} />}
            onClick={() => setShowCreateForm(true)}
          >
            Create New {`${currentSection}`}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Icon name="plus" size={20} />}
            onClick={(e) => setImportMenuAnchor(e.currentTarget)}
          >
            Bulk Import
          </Button>
        </div>
      </div>

      <Menu
        anchorEl={columnsMenuAnchor}
        open={Boolean(columnsMenuAnchor)}
        onClose={() => setColumnsMenuAnchor(null)}
      >
        <React.Fragment>
        {columns.map((column) => (
          <MenuItem key={column.id} onClick={() => handleColumnToggle(column.id)}>
            <FormControlLabel
            
            control={
              <Checkbox
              checked={column.visible}
              onChange={() => handleColumnToggle(column.id)}
              />
            }
            label={column.label}
            />
          </MenuItem>
        ))}
        <Button
              variant="contained"
              color="primary"
              sx={{m:1, mx:2}}
              onClick={() => setColumnsMenuAnchor(null)}
            >
              Apply Changes
            </Button>
        </React.Fragment>
      </Menu>

      <Popover
        open={Boolean(importMenuAnchor)}
        anchorEl={importMenuAnchor}
        onClose={() => setImportMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            startIcon={<Icon name="file-spreadsheet" size={20} />}
            sx={{ mb: 1, justifyContent: 'flex-start' }}
          >
            Import From Excel
          </Button>
          <Button
            fullWidth
            startIcon={<Icon name="file-text" size={20} />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Import From Invoice
          </Button>
        </Box>
      </Popover>

          <CustomForm currentSection={currentSection} fields={data.fields} open={showCreateForm} onClose={() => setShowCreateForm(false)} aria-describedby={`create-${currentSection}-form`}/>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.filter(col => col.visible).map((column) => (
                <TableCell key={column.id}>
                 
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDocuments.map((document) => (
              <TableRow key={document.id}>
                {columns.filter(col => col.visible).map((column) => (
                  <TableCell key={column.id}>
                    {column.id === 'name' ? (
                      <div>
                        <div>{document.name}</div>
                        <div style={{ color: 'gray', fontSize: '0.875rem' }}>{document.description}</div>
                      </div>
                    ) : column.id === 'status' ? (
                      <Chip
                        label={document.status}
                        color={document.status === 'Available' ? 'success' : 'warning'}
                        size="small"
                      />
                    ) : (
                      document[column.id]
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Icon name="pencil" size={20} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Icon name="trash-2" size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <div>Showing {(page-1)*PAGE_LIMIT+1} to {(page-1)*PAGE_LIMIT+PAGE_LIMIT} of {data.total}</div>
        <Pagination count={Math.ceil(data.total/PAGE_LIMIT)} color="primary" onChange={(event, page) => {console.log(page);
         setPage(page)}} />
      </Box>
    </Paper>
  );
}
