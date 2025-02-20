import React from 'react'
import Icon from './Icon'

export const DashboardTable1 = ({columns,documents}) => {
  return (
    <TableContainer>
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
            {documents.map((document,index) => (
              <TableRow key={document.name+index}>
                
                {Object.keys(document).map((column,index) => (
                  <TableCell key={document[column]+index}>
                    {column.id === 'name' ? (
                      <div>
                        <div>{document[column]}</div>
                        <div style={{ color: 'gray', fontSize: '0.875rem' }}>{asset.description}</div>
                      </div>
                    ) : column.id === 'status' ? (
                      <Chip
                        label={asset.status}
                        color={asset.status === 'Available' ? 'success' : 'warning'}
                        size="small"
                      />
                    ) : (
                      asset[column.id]
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Icon name="edit" size={20} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Icon name="trash-2" size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  )
}
