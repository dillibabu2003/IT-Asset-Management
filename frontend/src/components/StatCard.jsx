import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

function StatCard({ name, value, icon, color }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          '& > svg': { 
            color: color || "#1976d2",
            width: 24,
            height: 24
          }
        }}>
          {icon || "No icon"}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {name}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default StatCard;
