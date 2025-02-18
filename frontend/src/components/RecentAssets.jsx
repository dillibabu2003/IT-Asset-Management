import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';

const recentAssets = [
  { name: 'MacBook Pro M2', status: 'Available', category: 'Laptops', lastUpdated: '2 hours ago' },
  { name: 'iPhone 14 Pro', status: 'Checked Out', category: 'Phones', lastUpdated: '5 hours ago' },
  { name: 'Dell XPS 15', status: 'Maintenance', category: 'Laptops', lastUpdated: '1 day ago' },
  { name: 'iPad Pro 12.9"', status: 'Available', category: 'Tablets', lastUpdated: '2 days ago' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Checked Out':
      return 'warning';
    case 'Maintenance':
      return 'error';
    default:
      return 'default';
  }
};

function RecentAssets() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Asset Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Last Updated</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {recentAssets.map((asset) => (
          <TableRow key={asset.name}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>
              <Chip 
                label={asset.status} 
                color={getStatusColor(asset.status)}
                size="small"
              />
            </TableCell>
            <TableCell>{asset.category}</TableCell>
            <TableCell>{asset.lastUpdated}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default RecentAssets;