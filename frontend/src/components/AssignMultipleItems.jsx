import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import React, { useState } from 'react'
import AsynchronousAutoComplete from './AsynchronousAutoComplete';
import { convertSnakeCaseToPascaleCase } from '../utils/helperFunctions';

const AssignMultipleItems = (
    {
        currentSection,
        isDialogOpen,
        closeDialog,
        fields,
        items,
        employeeOptionLabel,
        employeeOptionEqualToLabel,
        selectedItemsSerialNumbers,

        saveData,
    }
) => {
    const [bulkAssignInfo, setBulkAssignInfo] = useState([]);
    const handleAutoCompleteChange = (serial_no)=>(event) => {
        console.log('field:', serial_no);
        console.log('event:', event.target.value.employee_id);
        setBulkAssignInfo([...bulkAssignInfo, {serial_no: serial_no, employee_id: event.target.value.employee_id}]);
        // setEmployeeIds(event.target.value.employee_id);
    };
    const handleSave = () => {
        console.log('bulkAssignInfo:', bulkAssignInfo);
        
        saveData(bulkAssignInfo);
        closeDialog();
    }
    return (
        <Dialog
            open={isDialogOpen}
            onClose={closeDialog}
            maxWidth='md'
            fullWidth
        >
            <DialogTitle>Assign {currentSection.substring(0, 1).toUpperCase() + currentSection.substring(1)}</DialogTitle>

            <DialogContent>
                <DialogContentText>
                    Select the employee to assign the items to:
                </DialogContentText>
                {
                    selectedItemsSerialNumbers.length == 0 ? <DialogContentText>No items selected</DialogContentText> :

                        selectedItemsSerialNumbers.map(serial_no =>
                            <Accordion key={serial_no} sx={{ width: '100%' }}>
                                <AccordionSummary>
                                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center',justifyContent: 'space-between', gap: 2 }}>
                                        <Typography>{serial_no}</Typography>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <AsynchronousAutoComplete 
                                                fetchUrl="/employees/search" 
                                                optionLabelFunction={employeeOptionLabel} 
                                                optionaEqualToValueFunction={employeeOptionEqualToLabel} 
                                                sendInputToParent={handleAutoCompleteChange(serial_no)} 
                                            />
                                        </div>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {
                                        items.map(item => (item.serial_no == serial_no &&
                                            
                                            Object.entries(item).map(([key,value], index) => (
                                                ([ '__v','employee_name'].includes(key) || key.match(/^[a-zA-Z]*_id$/))? null :
                                                <Typography key={`${serial_no}-${key}`}>{convertSnakeCaseToPascaleCase(key)}: {value}</Typography>
                                            ))
                                        ))
                                    }
                                </AccordionDetails>
                            </Accordion>
                        )
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleSave} color="success">Freeze Assignments</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AssignMultipleItems