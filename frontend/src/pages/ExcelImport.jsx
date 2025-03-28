import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import * as XLSX from "xlsx";
import axiosInstance from "../utils/axios";
import Icon from "../components/Icon";
import {
  convertPascaleCaseToSnakeCase,
  convertSnakeCaseToPascaleCase,
} from "../utils/helperFunctions";
import toast from "react-hot-toast";
import CreateForm from "../components/CreateForm";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";

function ExcelImport({ objectId }) {
  const [columnMetadata, setColumnMetadata] = useState(null);
  const [columnIds, setColumnIds] = useState([]);
  const [data, setData] = useState([]);
  const [errors] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editingCell, setEditingCell] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  async function fetchMetaDataByObjectId(objectId, abortController) {
    const response = await axiosInstance.get(`/metadata/${objectId}`, {
      signal: abortController.signal,
    });
    return response.data;
  }
  useEffect(() => {
    // Fetch data from the backend here
    const abortController = new AbortController();
    fetchMetaDataByObjectId(objectId, abortController)
      .then((response) => {
        setColumnMetadata(response.data);
        setColumnIds(Object.keys(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    return () => {
      abortController.abort();
    };
  }, [objectId]);

  const updateHeadersWithColumnIds = (worksheet) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (headerCell) {
        const headerValue = headerCell.v;
        const snakeCaseHeader = convertPascaleCaseToSnakeCase(headerValue);
        console.log(snakeCaseHeader);

        if (columnIds.includes(snakeCaseHeader)) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          worksheet[cellAddress] = {
            t: "s", // type: string
            v: snakeCaseHeader, // value
            w: snakeCaseHeader, // formatted text
          };
        } else {
          delete worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
          for (let R = range.s.r + 1; R <= range.e.r; R++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            delete worksheet[cellAddress];
          }
        }
      }
    }
    return worksheet;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Replace sheet headers with column IDs
        const updatedWorkSheet = updateHeadersWithColumnIds(worksheet);
        const jsonData = XLSX.utils.sheet_to_json(updatedWorkSheet);
        if (jsonData.length === 0) {
          toast.error("No data found in the file");
          return;
        }
        setData(jsonData);
        event.target.value = null;
      } catch (error) {
        console.error(error);
        toast.error("Error importing file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCellEdit = (columnMetaData, rowIndex) => {
    setEditingCell({ index: rowIndex, data: { ...data[rowIndex] } });
    setEditDialogOpen(true);
  };
  const handleCellDelete = (columnMetaData, rowIndex) => {
    const newData = [...data];
    newData.splice(rowIndex, 1);
    setData(newData);
  };

  const handleEditSave = (editedRow) => {
    if (editingCell) {
      const newData = [...data];
      newData[editingCell.index] = editedRow;
      setData(newData);
    }
    setEditDialogOpen(false);
    setEditingCell(null);
  };

  const handleSaveAll = async () => {
    try {
      const response = await axiosInstance.post(`/objects/${objectId}/bulk`, {
        documents: data,
      });
      console.log(response);
      if (response.data.success) {
        toast.success(response.data.message);
        setData(null);
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="text"
        onClick={() => {
          navigate(-1);
        }}
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <Icon name="arrow-left" />
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Import Excel
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<Icon name="upload" size={18} />}
          >
            Import Excel File
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
          </Button>
          {data.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<Icon name="save" size={18} />}
              onClick={handleSaveAll}
            >
              Save Changes
            </Button>
          )}
        </Box>
      </Paper>

      {data.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{ maxWidth: "100%", overflow: "auto" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(columnMetadata).map((key) => {
                  const column = columnMetadata[key];
                  return (
                    column.create && (
                      <TableCell key={column.id}>
                        {convertSnakeCaseToPascaleCase(column.id)}
                        {column.required && " *"}
                      </TableCell>
                    )
                  );
                })}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.keys(columnMetadata).map((key) => {
                    const column = columnMetadata[key];
                    return (
                      column.create && (
                        <TableCell
                          key={column.id}
                          sx={{
                            backgroundColor: errors.some(
                              (e) =>
                                e.row === rowIndex + 1 && e.column === column,
                            )
                              ? "error.main"
                              : "inherit",
                          }}
                        >
                          {row[column.id] ||
                            row[convertSnakeCaseToPascaleCase(column.id)] ||
                            ""}
                        </TableCell>
                      )
                    );
                  })}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleCellEdit(columnMetadata, rowIndex)}
                      color="primary"
                    >
                      <Icon name="pencil" size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCellDelete(columnMetadata, rowIndex)}
                      color="error"
                    >
                      <Icon name="trash-2" size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editingCell && (
        <CreateForm
          isDialogOpen={editDialogOpen}
          closeDialog={() => {
            setEditDialogOpen(false);
          }}
          currentSection={objectId}
          fields={columnMetadata}
          values={editingCell.data}
          saveData={handleEditSave}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
ExcelImport.propTypes = {
  objectId: PropTypes.string.isRequired,
};

export default ExcelImport;
