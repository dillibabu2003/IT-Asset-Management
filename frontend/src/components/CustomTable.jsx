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
import { convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';

export default function CustomTable({ currentSection, data, page, setPage, userVisibleColumns }) {
  const [columns, setColumns] = useState(data.fields);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(userVisibleColumns);

  const totalPages = Math.ceil(data.data.total / PAGE_LIMIT);
  const currentDocumentStartIndex = (page - 1) * PAGE_LIMIT + 1
  const currentDocumentEndIndex = Math.min((page - 1) * PAGE_LIMIT + PAGE_LIMIT, data.data.total);
  const [filteredDocuments, setFilteredDocuments] = useState(data.data.documents);

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
    console.log(columnId);
    setVisibleColumns({ ...visibleColumns, [columnId]: !visibleColumns[columnId] });
  };

  const exportToExcel = () => {
    const data = sortedDocuments.map(document => {
      const row = {};
      Object.keys(visibleColumns).forEach(col => {
        if(visibleColumns[col]){
          const label = convertSnakeCaseToPascaleCase(col);
          row[label] = document[col];
        }
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
    <Paper sx={{ p: 3, width: 'calc(100vw - 48px)' }}>
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
            <MenuItem key={column._id} onClick={() => handleColumnToggle(column.id)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns[column.id]}
                    // onChange={() => handleColumnToggle(column.id)}
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

      <TableContainer sx={{ maxHeight: 600, overflow: 'auto', maxWidth: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.filter(col => visibleColumns[col.id]).map((column) => (
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
                {columns.filter(col => visibleColumns[col.id]).map((column) => (
                  <TableCell key={column.id}>
                    {column.id === 'status' ? (
                      <Chip
                        label={document.status}
                        color={document.status === 'available' ? 'success' : 'warning'}
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
        <div>Showing {currentDocumentStartIndex} to {currentDocumentEndIndex} of {data.data.total}</div>
        <Pagination count={totalPages} color="primary" onChange={(event, page) => { console.log(page); setPage(page) }} />
      </Box>
    </Paper>
  );
}
