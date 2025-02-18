import React from 'react';
import {
  Paper,
  Typography,
  Button,
  Checkbox,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import { ShoppingCart, Package, Trash2, Calendar } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function CheckoutAssets() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Checkout Assets
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Select items to check out or enter details manually
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          sx={{ mr: 1 }}
        >
          Individual Checkout
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Package />}
        >
          Bulk Checkout
        </Button>
      </Box>

      <Box display="flex" gap={3}>
        <Paper sx={{ flex: 2, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Items
          </Typography>
          <List>
            <ListItem
              secondaryAction={
                <>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      slotProps={{
                        textField: { size: 'small', sx: { width: 150, mr: 1 } }
                      }}
                    />
                  </LocalizationProvider>
                  <IconButton edge="end" aria-label="delete" color="error">
                    <Trash2 size={20} />
                  </IconButton>
                </>
              }
            >
              <Checkbox edge="start" />
              <ListItemText
                primary="Asset #12345"
                secondary="Category: Equipment"
              />
            </ListItem>
            <Divider />
            <ListItem
              secondaryAction={
                <>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      slotProps={{
                        textField: { size: 'small', sx: { width: 150, mr: 1 } }
                      }}
                    />
                  </LocalizationProvider>
                  <IconButton edge="end" aria-label="delete" color="error">
                    <Trash2 size={20} />
                  </IconButton>
                </>
              }
            >
              <Checkbox edge="start" />
              <ListItemText
                primary="Asset #67890"
                secondary="Category: Device"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Checkout Summary
          </Typography>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Selected Items
            </Typography>
            <Typography variant="h4">2</Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Add Item Manually
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Asset ID"
            placeholder="Enter asset ID"
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              sx={{ width: '100%', mb: 3 }}
            />
          </LocalizationProvider>

          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          >
            + Add Item
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="primary"
          >
            Complete Checkout
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}