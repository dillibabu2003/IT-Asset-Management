import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import BulkCheckout from '../components/BulkCheckout';
import IndividualCheckout from '../components/IndividualCheckout';
import Icon from '../components/Icon';
import CustomTable from '../components/CustomTable';
// import RecentCheckouts from './checkout/RecentCheckouts';

function CheckoutPage() {
  const [checkoutMode, setCheckoutMode] = useState(null);

  const renderCheckoutSection = () => {
    return (checkoutMode &&
      <Paper sx={{ p: 3, mb: 3 }}>
        <Button
          variant="text"
          onClick={() => setCheckoutMode(null)}
          sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Icon name="arrow-left" />
          Back
        </Button>
        {checkoutMode === 'bulk' ? <BulkCheckout /> : <IndividualCheckout />}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Checkout Page</Typography>
        {
          !checkoutMode &&
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
        }
      </Box>
      {
        renderCheckoutSection()
      }
      {
        !checkoutMode &&

        <Paper sx={{ p: 3, mb: 3 }}>

          <Typography variant="h6" gutterBottom>Recent Checkouts</Typography>
          {/* <CustomTable /> */}

        </Paper>
      }

    </Box>
  );
}

export default CheckoutPage;

