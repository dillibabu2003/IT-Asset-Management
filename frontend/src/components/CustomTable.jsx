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
import Icon from './Icon';
import { PAGE_LIMIT } from '../utils/constants';
import axiosInstance from '../utils/axios';
import ProtectedComponent from '../protectors/ProtectedComponent';

export default function CustomTable({ currentSection, data, page, setPage }) {
  const [columns, setColumns] = useState(data.fields);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState(data.documents);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
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
    const data = sortedDocuments.map(document => {
      const row = {};
      visibleColumns.forEach(col => {
        row[col.label] = document[col.id];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${currentSection}`);
    XLSX.writeFile(wb, `${currentSection}.xlsx`);
  };

  const searchText = (e) => {
    const searchValue = e.target.value.toLowerCase();
       const abortController = new AbortController();
      async function fetchData() {
        try {
            const response = await axiosInstance.get(`/assets/search?val=${searchValue}`, { signal: abortController.signal });
            console.log(response);
        } catch (error) {
            console.error(error);

            console.log("Error occurred while fetching data");

        }
      }
    fetchData();
    
    const regex = new RegExp(searchValue, 'i');
    const filtered = data.documents.filter(document =>
      Object.values(document).some(value => regex.test(value))
    );
    setFilteredDocuments(filtered);
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
          sx={{ maxWidth: 500, flexGrow: 1 }}
          onChange={(e) => searchText(e)}
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
            Export
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
            sx={{ m: 1, mx: 2 }}
            onClick={() => setColumnsMenuAnchor(null)}
          >
            Apply Changes
          </Button>
        </React.Fragment>
      </Menu>

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
              <ProtectedComponent requiredPermission={`edit:${currentSection}`}>
              <TableCell>Actions</TableCell>
              </ProtectedComponent>
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
                <ProtectedComponent requiredPermission={`edit:${currentSection}`}>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Icon name="pencil" size={20} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Icon name="trash-2" size={20} />
                  </IconButton>
                </TableCell>
                </ProtectedComponent>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <div>Showing {(page - 1) * PAGE_LIMIT + 1} to {(page - 1) * PAGE_LIMIT + PAGE_LIMIT} of {data.total}</div>
        <Pagination count={Math.ceil(data.total / PAGE_LIMIT)} color="primary" onChange={(event, page) => { console.log(page); setPage(page) }} />
      </Box>
    </Paper>
  );
}
