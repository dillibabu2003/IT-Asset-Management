import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  TablePagination,
  Tooltip,
  Toolbar,
  Typography,
  InputAdornment,
} from '@mui/material';
import * as XLSX from 'xlsx';
import Icon from './Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';
import { convertSnakeCaseToPascaleCase, getColorAndBackgroundColorByStatus } from '../utils/helperFunctions';
import { convertExpiryToReadable } from '../utils/helperFunctions';
import { alpha } from '@mui/material/styles';
import Filters from './Filters';

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, visibleColumns } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all rows',
            }}
          />
        </TableCell>
        {Object.entries(visibleColumns).map(([columnId, isVisible]) =>
          isVisible ? (
            <TableCell
              key={columnId}
              sortDirection={orderBy === columnId ? order : false}
            >
              <TableSortLabel
                active={orderBy === columnId}
                direction={orderBy === columnId ? order : 'asc'}
                onClick={createSortHandler(columnId)}
              >
                {convertSnakeCaseToPascaleCase(columnId)}
              </TableSortLabel>
            </TableCell>
          ) : null
        )}
        <ProtectedComponent requiredPermission={`edit:${props.currentSection}`}>
          <TableCell>Actions</TableCell>
        </ProtectedComponent>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  currentSection: PropTypes.string.isRequired,
};

function EnhancedTableToolbar(props) {
  const { 
    numSelected, 
    onExport, 
    currentSection,
    columns,
    items,
    handleFilterChange,
    visibleColumns,
    selectedRows,
    setVisibleColumns,
    setItemSerialNumbersToBeAssigned,
    setItemSerialNumbersToBeUnassigned,
    setItemSerialNumbersToBeDeleted,
    searchText
  } = props;
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);

  const handleColumnToggle = (columnId) => {
    console.log(columnId);
    setVisibleColumns({ ...visibleColumns, [columnId]: !visibleColumns[columnId] });
  };
  const allSelectedItemsCanBeAssigned = () => {
    for (let i = 0; i < items.length; i++) {
      if (selectedRows.includes(items[i].serial_no) && !(items[i].status=="available" || items[i].status=="reissue")) {
        return false;
      }
    }
    return true;
  }
  const allSelectedItemsCanBeUnAssigned = () => {
    for (let i = 0; i < items.length; i++) {
      if (selectedRows.includes(items[i].serial_no) &&items[i].assigned_to==null) {
        return false;
      }
    }
    return true;
  }
  const allSelectedItemsCanBeDeleted = () => {
    for (let i = 0; i < items.length; i++) {
      if (selectedRows.includes(items[i].serial_no) &&items[i].assigned_to) {
        return false;
      }
    }
    return true;
  }
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <TextField
            placeholder={`Search ${currentSection}...`}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Icon name="search" size={20} />
                    </InputAdornment>
                ),
            }}
            onChange={(e) => searchText(e.target.value)}
        />
      )}
      {numSelected > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {
            allSelectedItemsCanBeAssigned() && (
              <IconButton size="small" color="success" onClick={() => setItemSerialNumbersToBeAssigned()}>
                        <Icon name="user-plus" size={20} />
                      </IconButton>
            )
          }
          {
            allSelectedItemsCanBeUnAssigned() && (
              <IconButton size="small" color="warning" onClick={() => setItemSerialNumbersToBeUnassigned()}>
                        <Icon name="user-x" size={20} />
                      </IconButton>
            )
          }
          {
            allSelectedItemsCanBeDeleted() && (
              <IconButton size="small" color="error" onClick={() => setItemSerialNumbersToBeDeleted()}>
                        <Icon name="trash-2" size={20} />
                      </IconButton>
            ) 
          }

        <Tooltip title="Export">
          <IconButton onClick={onExport}>
            <Icon name="download" size={20} />
          </IconButton>
        </Tooltip>
        </Box>
      ) : 
      <Box sx={{ display: 'flex', alignItems: 'center',gap: 1 }}>
      <Filters columns={columns} currentSection={currentSection} sendFilters={handleFilterChange}/>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
       <Button
            variant="outlined"
            startIcon={<Icon name="settings" size={20} />}
            onClick={(e) => setColumnsMenuAnchor(e.currentTarget)}
          >
            Columns
          </Button>
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
      </Box>
      </Box>
      }
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  columns: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onExport: PropTypes.func.isRequired,
  currentSection: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  setVisibleColumns: PropTypes.func.isRequired,
  setItemSerialNumbersToBeUnassigned: PropTypes.func.isRequired,
  setItemSerialNumbersToBeDeleted: PropTypes.func.isRequired,
};

export default function CustomTable(
  { 
    currentSection, 
    data, 
    page, 
    setPage, 
    pageLimit, 
    handleFilterChange,
    setEditingRowIndex, 
    setAssignRowIndex, 
    setUnAssignRowIndex, 
    setDeleteRowIndex,
    setItemSerialNumbersToBeAssigned,
    setItemSerialNumbersToBeUnassigned,
    setItemSerialNumbersToBeDeleted, 
    setPageLimit, 
    userVisibleColumns, 
    selectedRows,
    setSelectedRows,
    searchText
  }) {
  const [columns] = useState(data.fields);
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState(userVisibleColumns);
  const [filteredDocuments, setFilteredDocuments] = useState(data.data.documents);

  useEffect(() => {
    setFilteredDocuments(data.data.documents);
  }, [data]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    console.log(property, orderBy, order);
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredDocuments.map((doc) => doc.serial_no);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleClick = (serial_no) => {
    const selectedIndex = selectedRows.indexOf(serial_no);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, serial_no);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const exportToExcel = () => {
    console.log(selectedRows);
    const data = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const row = {};
      Object.keys(visibleColumns).forEach((col) => {
        if (visibleColumns[col]) {
          const label = convertSnakeCaseToPascaleCase(col);
          row[label] = filteredDocuments.find((doc) => doc.serial_no === selectedRows[i])[col];
        }
      });
      data.push(row);
    }
   

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${currentSection}`);
    XLSX.writeFile(wb, `${currentSection}.xlsx`);
  };

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if(orderBy==null) return filteredDocuments;
    if (order === 'asc') {
      return a[orderBy] < b[orderBy] ? -1 : 1;
    } else {
      return b[orderBy] < a[orderBy] ? -1 : 1;
    }
  });

  return (
    <Paper sx={{ p: 3, width: 'calc(100vw - 48px)' }}>
      <EnhancedTableToolbar
        numSelected={selectedRows.length}
        onExport={exportToExcel}
        columns={columns}
        currentSection={currentSection}
        items={filteredDocuments}
        handleFilterChange={handleFilterChange}
        selectedRows={selectedRows}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        setItemSerialNumbersToBeAssigned={setItemSerialNumbersToBeAssigned}
        setItemSerialNumbersToBeUnassigned={setItemSerialNumbersToBeUnassigned}
        setItemSerialNumbersToBeDeleted={setItemSerialNumbersToBeDeleted}
        searchText={searchText}
      />
      <TableContainer sx={{ maxHeight: 600, overflow: 'auto', maxWidth: '100%', whiteSpace: 'nowrap' }}>
        <Table stickyHeader>
          <EnhancedTableHead
            numSelected={selectedRows.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleSort}
            rowCount={filteredDocuments.length}
            visibleColumns={visibleColumns}
            currentSection={currentSection}
          />
          <TableBody>
            {sortedDocuments.map((document, rowIndex) => (
              <TableRow
                key={document.serial_no}
                hover
                onClick={() => handleClick(document.serial_no)}
                selected={selectedRows.indexOf(document.serial_no) !== -1}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selectedRows.indexOf(document.serial_no) !== -1}
                  />
                </TableCell>
                {Object.entries(visibleColumns).map(([columnId, isVisible]) => {
                  let colType = columns[columnId]?.type;
                  return (
                    isVisible && (
                      <TableCell key={columnId}>
                        {columnId === 'expiry'
                          ? convertExpiryToReadable(document.end)
                          : colType === 'date'
                          ? new Date(document[columnId]).toLocaleDateString()
                          : colType === 'select' && columnId === 'status'
                          ? (() => {
                              const [color, backgroundColor] = getColorAndBackgroundColorByStatus(document.status);
                              return (
                                <Chip
                                  label={convertSnakeCaseToPascaleCase(document.status)}
                                  style={{ background: backgroundColor, color: color }}
                                  size="small"
                                />
                              );
                            })()
                          : document[columnId]}
                      </TableCell>
                    )
                  );
                })}
                <ProtectedComponent requiredPermission={`edit:${currentSection}`}>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => setEditingRowIndex(rowIndex)}>
                      <Icon name="pencil" size={20} />
                    </IconButton>
                    {document.assigned_to && (
                      <IconButton size="small" color="warning" onClick={() => setUnAssignRowIndex(rowIndex)}>
                        <Icon name="user-x" size={20} />
                      </IconButton>
                    )}
                    {!document.assigned_to && (
                      <IconButton size="small" color="error" onClick={() => setDeleteRowIndex(rowIndex)}>
                        <Icon name="trash-2" size={20} />
                      </IconButton>
                    )}
                    {!document.assigned_to && (
                      <IconButton size="small" color="success" onClick={() => setAssignRowIndex(rowIndex)}>
                        <Icon name="user-plus" size={20} />
                      </IconButton>
                    )}
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
          page={page - 1}
          onPageChange={(_, page) => setPage(page + 1)}
          rowsPerPage={pageLimit}
          onRowsPerPageChange={(event) => {
            setPageLimit(parseInt(event.target.value));
            setPage(1);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    </Paper>
  );
}
