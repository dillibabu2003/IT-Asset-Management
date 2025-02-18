import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          '& > svg': { 
            color: color,
            width: 24,
            height: 24
          }
        }}>
          {icon}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
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
