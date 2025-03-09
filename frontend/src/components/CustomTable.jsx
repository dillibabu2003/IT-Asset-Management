import React, { useState, useEffect } from 'react';
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
  TablePagination,
} from '@mui/material';
import * as XLSX from 'xlsx';
import Icon from './Icon';
import { PAGE_LIMIT } from '../utils/constants';
import axiosInstance from '../utils/axios';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';
import { convertExpiryToReadable } from '../utils/helperFunctions';

export default function CustomTable({ currentSection, data, page, setPage,pageLimit,setPageLimit, userVisibleColumns }) {
  const [columns, setColumns] = useState(data.fields);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(userVisibleColumns);

  const [filteredDocuments, setFilteredDocuments] = useState(data.data.documents);

  useEffect(() => {
    setFilteredDocuments(data.data.documents);
  }, [data]);

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
        if (visibleColumns[col]) {
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
          {Object.entries(visibleColumns).map(([columnId, isVisible]) => (
            <MenuItem key={columnId} onClick={() => handleColumnToggle(columnId)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isVisible}
                    onChange={() => handleColumnToggle(columnId)}
                  />
                }
                label={convertSnakeCaseToPascaleCase(columnId)}
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

      <TableContainer sx={{ maxHeight: 600, overflow: 'auto', maxWidth: "100%",whiteSpace: 'nowrap' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {Object.entries(visibleColumns).map(([columnId, isVisible]) => (isVisible &&
                <TableCell key={columnId}>
                  <TableSortLabel
                    active={orderBy === columnId}
                    direction={orderBy === columnId ? order : 'asc'}
                    onClick={() => handleSort(columnId)}
                  >
                    {convertSnakeCaseToPascaleCase(columnId)}
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
                {Object.entries(visibleColumns).map(([columnId, isVisible]) =>  {
                  let colType = null;
                  for (let i = 0; i < columns.length; i++) {
                    if (columns[i].id === columnId) {
                      colType = columns[i].type;
                      break;
                    }
                  }                  
                  return (isVisible &&
                  <TableCell key={columnId}>
                    {
                      columnId==='expiry' ? convertExpiryToReadable(document.end) :
                      colType === 'date' ? (
                           new Date(document[columnId]).toLocaleDateString()
                      ) : columnId === 'assigned_to' ? (
                        document.assigned_to ? document.assigned_to : 'N/A'
                      ) :
                      colType ==='select'?
                          columnId === 'status' ? (
                            <Chip
                              label={convertSnakeCaseToPascaleCase(document.status)}
                              color={document.status === 'available' ? 'success' : 'warning'}
                              size="small"
                            />
                          ) : convertSnakeCaseToPascaleCase(document[columnId])
                      : document[columnId]
                        }
                  </TableCell>
                )})}
                <ProtectedComponent requiredPermission={`edit:${currentSection}`}>
                  <TableCell key="actions">
                    {
                      document.assigned_to && 
                      <React.Fragment>

                      <IconButton size="small" color="primary">
                        <Icon name="eye" size={20} />
                      </IconButton>
                      <IconButton size="small" color="warning">
                        <Icon name="user-x" size={20} />
                      </IconButton>
                      </React.Fragment>
                    }
                    <IconButton size="small" color="primary">
                      <Icon name="pencil" size={20} />
                    </IconButton>
                    {
                      !document.assigned_to && 
                    <IconButton size="small" color="error">
                      <Icon name="trash-2" size={20} />
                    </IconButton>
                    }
                  </TableCell>
                </ProtectedComponent>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
          <TablePagination
          component="div"
          count={data.data.total}
          page={page-1} // Convert 1-based to 0-based index
          onPageChange={(event,page)=>{setPage(page+1)}}
          rowsPerPage={pageLimit}
          onRowsPerPageChange={(event)=>{setPageLimit(parseInt(event.target.value));setPage(1)}}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    </Paper>
  );
}
