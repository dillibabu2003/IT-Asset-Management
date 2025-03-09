import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import BulkCheckout from '../components/BulkCheckout';
import IndividualCheckout from '../components/IndividualCheckout';
import Icon from '../components/Icon';
// import RecentCheckouts from './checkout/RecentCheckouts';
 
function CheckoutPage() {
  const [checkoutMode, setCheckoutMode] = useState(null);
 
  const renderCheckoutSection = () => {
    if (!checkoutMode) {
      return (
        <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<Icon name="shopping-cart" />}
          sx={{ mr: 1 }}
          onClick={() => setCheckoutMode('individual')}
        >
          Individual Checkout
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Icon name="package-2" />}
          onClick={() => setCheckoutMode('bulk')}
        >
          Bulk Checkout
        </Button>
      </Box>
       
      );
    }
 
    return (
      <Box>
        <Button
          variant="outlined"
          onClick={() => setCheckoutMode(null)}
          sx={{ mb: 2 }}
        >
          Back to Selection
        </Button>
        {checkoutMode === 'bulk' ? <BulkCheckout /> : <IndividualCheckout />}
      </Box>
    );
  };
 
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Checkout Page</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderCheckoutSection()}
      </Paper>
      {/* <Paper sx={{ p: 3 }}>
        <RecentCheckouts />
      </Paper> */}
    </Box>
  );
}
 
export default CheckoutPage;
 
 