import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Grid,
  Chip,
  TextField,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Icon from './Icon';
import { ICONS } from '../utils/constants';
import axiosInstance from '../utils/axios';
import { DatePicker } from '@mui/x-date-pickers';
import {availableDashboards} from '../utils/constants'

function ConfigureDashboard() {
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchDashboardMetadataById(dashboard_id, abortController) {
      try {
        const response = await axiosInstance.get(`/dashboards/${dashboard_id}/metadata`, { signal: abortController.signal });
        return response.data;
      }
      catch (error) {
        return error;
      }
    }
    async function fetchFieldsOfObjectToWhichThisDashboardBelongTo(belongs_to, abortController) {
      try {
        const response = await axiosInstance.get(`/metadata/${belongs_to}`, { signal: abortController.signal });
        return response.data;
      }
      catch (error) {
        return error;
      }
    }

    async function fetchRequiredData(abortController) {
      const dashboardDataPromise = fetchDashboardMetadataById(selectedDashboard, abortController);
      const fieldsPromise = fetchFieldsOfObjectToWhichThisDashboardBelongTo(selectedDashboard, abortController);
      return Promise.all([dashboardDataPromise, fieldsPromise]);
    }

    if (selectedDashboard) {
      fetchRequiredData(abortController).then(([dashboardData, fields]) => {
        setDashboard(dashboardData.data);
        setFields(fields.data);
      }).catch((error) => {
        console.error(error);
        //TODO: add toastify here
      });
    }
    return () => {
      abortController.abort();
    }
  }, [selectedDashboard]);

  const handleDragEnd = (result) => {
    if (!result.destination || !dashboard) return;

    const listType = result.type;
    const list = listType === 'tile' ? [...dashboard.tiles] : [...dashboard.elements];
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);

    const updatedList = list.map((item, index) => ({
      ...item,
      order: index,
    }));

    setDashboard({
      ...dashboard,
      [listType === 'tile' ? 'tiles' : 'elements']: updatedList,
    });
  };

  const handleDeleteTile = (tileId) => {
    if (!dashboard) return;
    const updatedTiles = dashboard.tiles
      .filter(t => t._id !== tileId)
      .map((tile, index) => ({ ...tile, order: index }));

    setDashboard({
      ...dashboard,
      tiles: updatedTiles,
    });
  };

  const handleDeleteElement = (elementId) => {
    if (!dashboard) return;
    const updatedElements = dashboard.elements
      .filter(e => e._id !== elementId)
      .map((element, index) => ({ ...element, order: index }));

    setDashboard({
      ...dashboard,
      elements: updatedElements,
    });
  };

  const handleAddTile = () => {
    if (!dashboard) return;
    const newTile = {
      _id: `t${Date.now()}`,
      title: 'New Tile',
      func: 'count',
      matcher_field: '',
      order: dashboard.tiles.length,
      matcher_value: '',
      target: '',
      color: '#000000',
      icon: 'check-circle',
    };
    setDashboard({
      ...dashboard,
      tiles: [...dashboard.tiles, newTile],
    });
  };

  const handleAddElement = () => {
    if (!dashboard) return;
    const newElement = {
      _id: `e${Date.now()}`,
      title: 'New Element',
      type: 'table',
      fields: [],
      order: dashboard.elements.length,
    };
    setDashboard({
      ...dashboard,
      elements: [...dashboard.elements, newElement],
    });
  };

  const handleUpdateTile = (tileId, field, value) => {
    if (!dashboard) return;
    setDashboard({
      ...dashboard,
      tiles: dashboard.tiles.map(t =>
        t._id === tileId ?
          {
            ...t,
            [field]: value,
            ...(field === 'matcher_field' && { matcher_value: '' })
          } :
          t
      ),
    });
  };

  const handleUpdateElement = (elementId, field, value) => {
    if (!dashboard) return;
    setDashboard({
      ...dashboard,
      elements: dashboard.elements.map(e =>
        e._id === elementId ? { ...e, [field]: value } : e
      ),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    console.log(dashboard);
    try {
      const response = await axiosInstance.post(`/dashboards/${selectedDashboard}/configure`, dashboard);
      console.log(response);
    } catch (error) {
      console.error(error);

    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Configure Dashboard</Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Dashboard</InputLabel>
            <Select
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(e.target.value)}
              label="Select Dashboard"
            >
              {availableDashboards.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {dashboard && (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Tiles</Typography>
                <Button
                  startIcon={<Icon name="plus" size={18} />}
                  onClick={handleAddTile}
                  variant="outlined"
                  size="small"
                >
                  Add Tile
                </Button>
              </Box>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tiles" type="tile">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {dashboard.tiles.map((tile, index) => (
                        <Draggable key={tile._id} draggableId={tile._id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
                            >
                              <Box container="true" sx={{ display: "flex", gap: 3, alignItems: 'center' }} spacing={2} alignItems="center">
                                <Box {...provided.dragHandleProps}>
                                  <Icon name="grip-vertical" size={20} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                  <Box sx={{ flex: "1 1 0px" }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Name"
                                      value={tile.title}
                                      onChange={(e) => handleUpdateTile(tile._id, 'title', e.target.value)}
                                    />
                                  </Box>
                                  {(
                                    <Box sx={{ flex: "1 1 0px" }}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Matcher Field</InputLabel>
                                        <Select
                                          value={tile.matcher_field}
                                          label="Matcher Field"
                                          onChange={(e) => handleUpdateTile(tile._id, 'matcher_field', e.target.value)}
                                        >
                                          {/* mock fields are here */}
                                          {fields.map(field => (
                                            <MenuItem key={field.id} value={field.id}>
                                              {field.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Box>
                                  )}
                                  {fields.find(f => f.id === tile.matcher_field)?.type === 'select' && (
                                    <Box sx={{ flex: "1 1 0px" }}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Matcher Value</InputLabel>
                                        <Select
                                          value={tile.matcher_value}
                                          label="Matcher Value"
                                          onChange={(e) => handleUpdateTile(tile._id, 'matcher_value', e.target.value)}
                                        >
                                          {fields.find(f => f.id === tile.matcher_field)?.options.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                              {option.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Box>
                                  )}

                                  {fields.find(f => f.id === tile.matcher_field)?.type === 'date' && (
                                    <>
                                      <Box sx={{ flex: "1 1 0px" }}>
                                        <FormControl fullWidth size="small">
                                          <DatePicker
                                            label={"Matcher Start Date"}
                                            name={"start_date"}
                                            onChange={(newValue) => { handleUpdateTile(tile._id, 'matcher_value', { start_date: newValue.$d, end_date: tile.matcher_value.end_date }) }}
                                            slotProps={{
                                              textField: {
                                                fullWidth: true,
                                                required: true,
                                              },
                                            }}
                                          />
                                        </FormControl>
                                      </Box>
                                      <Box sx={{ flex: "1 1 0px" }}>
                                        <FormControl fullWidth size="small">
                                          <DatePicker
                                            label={"Matcher End Date"}
                                            name={"end_date"}
                                            onChange={(newValue) => { handleUpdateTile(tile._id, 'matcher_value', { start_date: tile.matcher_value.start_date, end_date: newValue.$d }) }}
                                            slotProps={{
                                              textField: {
                                                fullWidth: true,
                                                required: true,
                                              },
                                            }}
                                          />
                                        </FormControl>
                                      </Box>
                                    </>
                                  )}
                                  <Box sx={{ flex: "1 1 0px" }}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Function</InputLabel>
                                      <Select
                                        value={tile.func}
                                        label="Function"
                                        onChange={(e) => handleUpdateTile(tile._id, 'func', e.target.value)}
                                      >
                                        <MenuItem value="count">Count</MenuItem>
                                        <MenuItem value="sum">Sum</MenuItem>
                                        <MenuItem value="avg">Average</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  {(tile.func === 'sum' || tile.func === 'avg') && (
                                    <Box sx={{ flex: "1 1 0px" }}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Target Field</InputLabel>
                                        <Select
                                          value={tile.target}
                                          label="Target Field"
                                          onChange={(e) => handleUpdateTile(tile._id, 'target', e.target.value)}
                                        >
                                          {fields.filter(field => field.type === 'numeric').map(field => (
                                            <MenuItem key={field.id} value={field.id}>
                                              {field.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Box>
                                  )}

                                  <Box sx={{ flex: "1 1 0px" }}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Icon</InputLabel>
                                      <Select
                                        value={tile.icon}
                                        label="Icon"
                                        onChange={(e) => handleUpdateTile(tile._id, 'icon', e.target.value)}
                                      >
                                        {ICONS.map((icon) => (
                                          <MenuItem key={icon} value={icon} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                            <Icon name={icon} size={18} />
                                            {icon.split("-").map(c => c.toUpperCase()).join(" ")}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  <Box sx={{ flex: "1 1 0px" }}>
                                    <input
                                      type="color"
                                      label="Color"
                                      value={tile.color}
                                      onChange={(e) => handleUpdateTile(tile._id, 'color', e.target.value)}
                                    />
                                    </Box>
                                </Box>
                                <Box>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTile(tile.id)}
                                  >
                                    <Icon name="trash-2" size={18} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Elements</Typography>
                <Button
                  startIcon={<Icon name="plus" size={18} />}
                  onClick={handleAddElement}
                  variant="outlined"
                  size="small"
                >
                  Add Element
                </Button>
              </Box>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="elements" type="element">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {dashboard.elements.map((element, index) => (
                        <Draggable key={element._id} draggableId={element._id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
                            >
                              <Box container="true" sx={{ display: "flex", gap: 3 }} spacing={2} alignItems="center">
                                <Box {...provided.dragHandleProps}>
                                  <Icon name="grip-vertical" size={20} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                  <Box sx={{ flex: "1 1 0px" }} xs={3}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Title"
                                      value={element.title}
                                      onChange={(e) => handleUpdateElement(element._id, 'title', e.target.value)}
                                    />
                                  </Box>
                                  <Box sx={{ flex: "1 1 0px" }} xs={3}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Type</InputLabel>
                                      <Select
                                        value={element.type}
                                        label="Type"
                                        onChange={(e) => {
                                          handleUpdateElement(element._id, 'type', e.target.value);
                                          if (e.target.value === 'bar' && element.fields.length > 2 || e.target.value === 'pie' && element.fields.length > 1) {
                                            handleUpdateElement(element._id, 'fields', []);
                                          }
                                        }}
                                      >
                                        <MenuItem value="table">Table</MenuItem>
                                        <MenuItem value="pie">Pie Chart</MenuItem>
                                        <MenuItem value="bar">Bar Chart</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  <Box sx={{ flex: "1 1 0px" }} xs={3}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Fields</InputLabel>
                                      <Select
                                        multiple={element.type === 'table'}
                                        value={element.fields}
                                        label="Fields"
                                        onChange={(e) => handleUpdateElement(
                                          element._id,
                                          'fields',
                                          typeof e.target.value === 'string'
                                            ? [e.target.value]
                                            : e.target.value
                                        )}
                                        renderValue={(selected) => (
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected).map((value) => (
                                              <Chip
                                                key={value}
                                                label={fields.find(f => f.id === value)?.label}
                                                size="small"
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      >
                                        {element.type === 'table' ?
                                          fields.map(field => (
                                            <MenuItem key={field.id} value={field.id}>
                                              {field.label}
                                            </MenuItem>
                                          )) :
                                          fields.map(field => {
                                            if (field.type === "select") {
                                              return <MenuItem key={field.id} value={field.id}>
                                                {field.label}
                                              </MenuItem>
                                            }
                                          }
                                          )}
                                      </Select>
                                    </FormControl>
                                  </Box>

                                </Box>

                                <Box >
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteElement(element._id)}
                                  >
                                    <Icon name="trash-2" size={18} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined">Cancel</Button>
              <Button variant="contained" type='submit'>Save Changes</Button>
            </Box>
          </>
        )
        }
      </form >
    </Box >
  );
}

export default ConfigureDashboard;
