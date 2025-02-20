import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';

// const recentAssets = [
//   { name: 'MacBook Pro M2', status: 'Available', category: 'Laptops', lastUpdated: '2 hours ago' },
//   { name: 'iPhone 14 Pro', status: 'Checked Out', category: 'Phones', lastUpdated: '5 hours ago' },
//   { name: 'Dell XPS 15', status: 'Maintenance', category: 'Laptops', lastUpdated: '1 day ago' },
//   { name: 'iPad Pro 12.9"', status: 'Available', category: 'Tablets', lastUpdated: '2 days ago' },
//   { name: 'iPad Pro 12.9"', status: 'Available', category: 'Tablets', lastUpdated: '2 days ago' },
//   { name: 'iPad Pro 12.9"', status: 'Available', category: 'Tablets', lastUpdated: '2 days ago' },
// ];

const getStatusColor = (status) => {
  switch (status) {
    case 'Available':
      return ['#F0FDF4','#15803D'];
    case 'Checked Out':
      return ['#FEFCE8',"#AD7523"];
    case 'Maintenance':
      return ['#FEF2F2','#BD2929'];
    default:
      return ['#ffffff','#6B7280'];
  }
};

function DashboardTable({columns,documents}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
        {columns.map((column,index) => (
                <TableCell key={column+index}>
                  {column}
                </TableCell>
              ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map((document,index) => {
          const color= getStatusColor(document?.status);
          return (<TableRow key={document.name+Math.random()*100}>
            {
              columns.map((column,index)=>{
                return column=="status"?
                <TableCell key={index}>
                {
                  document[column]&&
                  <Chip 
                  label={document[column]} 
                  style={{ background:`${color[0]}`, color:`${color[1]}`} }
                  size="small"
                />
              }
              </TableCell>:
              <TableCell>{document[column]}</TableCell>
              })
            }
          </TableRow>)
})}
      </TableBody>
    </Table>
  );
}

export default DashboardTable;