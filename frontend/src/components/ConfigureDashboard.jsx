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

const mockDashboards = [
  {
    id: '1',
    name: 'Asset Dashboard',
    tiles: [
      { id: 't1', name: 'Total Assets', function: 'count', field: 'asset_id', order: 0 },
      { id: 't2', name: 'Total Value', function: 'sum', field: 'value', order: 1 },
    ],
    elements: [
      { id: 'e1', name: 'Asset Distribution', type: 'pie', fields: ['status'], order: 0 },
      { id: 'e2', name: 'Asset List', type: 'table', fields: ['name', 'status', 'value'], order: 1 },
    ],
  },
];

const mockFields = [
  { id: 'asset_id', name: 'Asset ID' },
  { id: 'name', name: 'Name' },
  { id: 'status', name: 'Status' },
  { id: 'value', name: 'Value' },
  { id: 'category', name: 'Category' },
  { id: 'location', name: 'Location' },
];

function ConfigureDashboard() {
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (selectedDashboard) {
      const found = mockDashboards.find(d => d.id === selectedDashboard);
      setDashboard(found || null);
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
      .filter(t => t.id !== tileId)
      .map((tile, index) => ({ ...tile, order: index }));
    
    setDashboard({
      ...dashboard,
      tiles: updatedTiles,
    });
  };

  const handleDeleteElement = (elementId) => {
    if (!dashboard) return;
    const updatedElements = dashboard.elements
      .filter(e => e.id !== elementId)
      .map((element, index) => ({ ...element, order: index }));

    setDashboard({
      ...dashboard,
      elements: updatedElements,
    });
  };

  const handleAddTile = () => {
    if (!dashboard) return;
    const newTile = {
      id: `t${Date.now()}`,
      name: 'New Tile',
      function: 'count',
      field: '',
      order: dashboard.tiles.length,
    };
    setDashboard({
      ...dashboard,
      tiles: [...dashboard.tiles, newTile],
    });
  };

  const handleAddElement = () => {
    if (!dashboard) return;
    const newElement = {
      id: `e${Date.now()}`,
      name: 'New Element',
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
        t.id === tileId ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleUpdateElement = (elementId, field, value) => {
    if (!dashboard) return;
    setDashboard({
      ...dashboard,
      elements: dashboard.elements.map(e =>
        e.id === elementId ? { ...e, [field]: value } : e
      ),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
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
              {mockDashboards.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
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
                        <Draggable key={tile.id} draggableId={tile.id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item {...provided.dragHandleProps}>
                                  <Icon name="grip-vertical" size={20} />
                                </Grid>
                                <Grid item xs={3}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Name"
                                    value={tile.name}
                                    onChange={(e) => handleUpdateTile(tile.id, 'name', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Function</InputLabel>
                                    <Select
                                      value={tile.function}
                                      label="Function"
                                      onChange={(e) => handleUpdateTile(tile.id, 'function', e.target.value)}
                                    >
                                      <MenuItem value="count">Count</MenuItem>
                                      <MenuItem value="sum">Sum</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Field</InputLabel>
                                    <Select
                                      value={tile.field}
                                      label="Field"
                                      onChange={(e) => handleUpdateTile(tile.id, 'field', e.target.value)}
                                    >
                                      {mockFields.map(field => (
                                        <MenuItem key={field.id} value={field.id}>
                                          {field.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTile(tile.id)}
                                  >
                                    <Icon name="trash-2" size={18} />
                                  </IconButton>
                                </Grid>
                              </Grid>
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
                        <Draggable key={element.id} draggableId={element.id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item {...provided.dragHandleProps}>
                                  <Icon name="grip-vertical" size={20} />
                                </Grid>
                                <Grid item xs={3}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Name"
                                    value={element.name}
                                    onChange={(e) => handleUpdateElement(element.id, 'name', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                      value={element.type}
                                      label="Type"
                                      onChange={(e) => {
                                        handleUpdateElement(element.id, 'type', e.target.value);
                                        if (e.target.value === 'pie' && element.fields.length > 1) {
                                          handleUpdateElement(element.id, 'fields', []);
                                        }
                                      }}
                                    >
                                      <MenuItem value="table">Table</MenuItem>
                                      <MenuItem value="pie">Pie Chart</MenuItem>
                                      <MenuItem value="bar">Bar Chart</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Fields</InputLabel>
                                    <Select
                                      multiple={element.type === 'table'}
                                      value={element.fields}
                                      label="Fields"
                                      onChange={(e) => handleUpdateElement(
                                        element.id,
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
                                              label={mockFields.find(f => f.id === value)?.name}
                                              size="small"
                                            />
                                          ))}
                                        </Box>
                                      )}
                                    >
                                      {mockFields.map(field => (
                                        <MenuItem key={field.id} value={field.id}>
                                          {field.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteElement(element.id)}
                                  >
                                    <Icon name="trash-2" size={18} />
                                  </IconButton>
                                </Grid>
                              </Grid>
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
              <Button variant="contained">Save Changes</Button>
            </Box>
          </>
        )}
      </form>
    </Box>
  );
}

export default ConfigureDashboard;
