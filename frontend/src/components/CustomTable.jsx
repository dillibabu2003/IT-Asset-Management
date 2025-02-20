import React, { use, useState } from 'react';
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
  Slide,
} from '@mui/material';
import * as XLSX from 'xlsx';
import CustomForm from './CustomForm';
import Icon from './Icon';

const mockAssets = [
  {
    id: '#AST001',
    name: 'Office Laptop',
    description: 'Dell XPS 13',
    category: 'Electronics',
    status: 'Available',
    dueDate: '2025-01-15',
  },
  {
    id: '#AST002',
    name: 'Office Chair',
    description: 'Herman Miller Aeron',
    category: 'Furniture',
    status: 'Ready to Deploy',
    dueDate: '2025-01-14',
  },
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});


//fields, documents should be passed
export default function CustomTable({fields,documents}) {
  // const [columns, setColumns] = useState([
  //   { id: 'id', label: 'Asset ID', visible: true, sortable: true },
  //   { id: 'name', label: 'Name/Description', visible: true, sortable: true },
  //   { id: 'category', label: 'Category', visible: true, sortable: true },
  //   { id: 'status', label: 'Status', visible: true, sortable: true },
  //   { id: 'dueDate', label: 'Due Date', visible: true, sortable: true },
  // ]); 
  const [columns,setColumns]=useState(fields);
  const [data,setData]=useState(documents);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const [showCreateAssetForm, setShowCreateAssetForm] = useState(false);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedAssets = [...data].sort((a, b) => {
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
            onClick={() => setShowCreateAssetForm(true)}
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
            startIcon={<Icon name="fileSpreadSheet" size={20} />}
            sx={{ mb: 1, justifyContent: 'flex-start' }}
          >
            Import From Excel
          </Button>
          <Button
            fullWidth
            startIcon={<Icon name="fileText" size={20} />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Import From Invoice
          </Button>
        </Box>
      </Popover>

      {/* <Dialog
        open={showCreateAssetForm}
        keepMounted
        onClose={() => setShowCreateAssetForm(false)}
        aria-describedby="create-asset-form"
      > */}
        {/* <DialogTitle>Create New Asset</DialogTitle> */}
          <CustomForm currentSection={currentSection} open={showCreateAssetForm} onClose={() => setShowCreateAssetForm(false)} aria-describedby="create-asset-form"/>
        {/* <DialogContent>
        </DialogContent> */}
        {/* <DialogActions>
          <Button onClick={() => setShowCreateAssetForm(false)}>Close</Button>
        </DialogActions>
      </Dialog> */}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.filter(col => col.visible).map((column) => (
                <TableCell key={column.id}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAssets.map((asset) => (
              <TableRow key={asset.id}>
                {columns.filter(col => col.visible).map((column) => (
                  <TableCell key={column.id}>
                    {column.id === 'name' ? (
                      <div>
                        <div>{asset.name}</div>
                        <div style={{ color: 'gray', fontSize: '0.875rem' }}>{asset.description}</div>
                      </div>
                    ) : column.id === 'status' ? (
                      <Chip
                        label={asset.status}
                        color={asset.status === 'Available' ? 'success' : 'warning'}
                        size="small"
                      />
                    ) : (
                      asset[column.id]
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Icon name="edit" size={20} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Icon name="trash2" size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <div>Showing 1 to 2 of 50 results</div>
        <Pagination count={5} color="primary" />
      </Box>
    </Paper>
  );
}
