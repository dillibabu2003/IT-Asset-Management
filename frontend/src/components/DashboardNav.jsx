import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { LayoutDashboard, FileSpreadsheet, FilePlus, Settings } from 'lucide-react';

function DashboardNav({ value, onChange }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={value} onChange={onChange} aria-label="dashboard navigation">
        <Tab icon={<LayoutDashboard size={18} />} iconPosition="start" label="Asset Dashboard" />
        <Tab icon={<FileSpreadsheet size={18} />} iconPosition="start" label="License Dashboard" />
        <Tab icon={<FilePlus size={18} />} iconPosition="start" label="Create New" />
        <Tab icon={<Settings size={18} />} iconPosition="start" label="Configure" />
      </Tabs>
    </Box>
  );
}

export default DashboardNav;
