import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { convertSnakeCaseToPascaleCase, getColorAndBackgroundColorByStatus } from '../utils/helperFunctions';

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
                  {convertSnakeCaseToPascaleCase(column)}
                </TableCell>
              ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map((document,rowIndex) => {
          const color= getStatusColor(document?.status);
          return (<TableRow key={document._id}>
            {
              columns.map((column,colIndex)=>{                
                const [color, backgroundColor]=getColorAndBackgroundColorByStatus(document[column])
                return column=="status"?
                <TableCell key={""+document._id+rowIndex+colIndex}>
                {
                  // document[column]&&
                  <Chip 
                  label={convertSnakeCaseToPascaleCase(document[column])} 
                  style={{ background:backgroundColor, color:color }}
                  // color={document.status === 'available' ? 'success' : 'warning'}
                  size="small"
                />
              }
              </TableCell>:
              <TableCell key={""+document._id+rowIndex+colIndex}>{document[column]}</TableCell>
              })
            }
          </TableRow>)
})}
      </TableBody>
    </Table>
  );
}

export default DashboardTable;