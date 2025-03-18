import { Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { convertSnakeCaseToPascaleCase, getColorAndBackgroundColorByStatus } from '../utils/helperFunctions';
import PropTypes from 'prop-types';

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
DashboardTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DashboardTable;