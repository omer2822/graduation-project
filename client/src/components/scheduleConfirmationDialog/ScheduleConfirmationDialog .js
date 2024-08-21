import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    FormControlLabel,
    Checkbox,
    Snackbar, // Add Snackbar from MUI
} from '@mui/material';
import MuiAlert from '@mui/material/Alert'; // Alert component for Snackbar
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const ScheduleConfirmationDialog = ({
    open,
    handleClose,
    scheduledShifts,
    employees,
    setScheduledShifts,
    setMessage,
    setSeverity,
    setOpen,
}) => {
    const [selectedShift, setSelectedShift] = useState(null);
    const [editedShifts, setEditedShifts] = useState({});
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [alertOpen, setAlertOpen] = useState(false); // State for Snackbar visibility
    const [alertMessage, setAlertMessage] = useState(''); // State for Snackbar message
    const [alertSeverity, setAlertSeverity] = useState('info'); // State for Snackbar severity

    useEffect(() => {
        if (selectedShift) {
            setSelectedEmployees([...selectedShift.assigned_workers]);
        }
    }, [selectedShift]);

    // Function to handle Snackbar close
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlertOpen(false);
    };

    // Function to display alerts with custom message and severity
    const displayAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    const calculateUnmetDemand = (shift) => {
        const fulfilledDemand = shift.assigned_workers.length; // Assuming assigned_workers is an array of employee IDs
        const unmetDemand = shift.demand - fulfilledDemand;
        return unmetDemand > 0 ? unmetDemand : 0;
    };

    const calculateLessThanMax = (employee) => {
        const maxShifts = employee.max; // Replace with actual max shifts from employee data
        const currentShifts = employee.shifts?.length; // Replace with actual current shifts from employee data
        return currentShifts < maxShifts;
    };

    const allEmployeesAtMax = () => {
        return employees.every((employee) => {
            const maxShifts = employee.max; // Replace with actual max shifts from employee data
            const currentShifts = employee.shifts?.length; // Replace with actual current shifts from employee data
            return currentShifts >= maxShifts;
        });
    };

    const handleConfirmAndSave = async () => {
        try {
            const finalShifts = scheduledShifts.map(shift => ({
                ...shift,
                assigned_workers: editedShifts[shift._id] || shift.assigned_workers
            }));
            const response = await axios.post('http://localhost:5000/save_schedule', {
                assignments: finalShifts, // Ensure scheduledShifts is updated
                employees: employees,
            });

            console.log('Schedule saved successfully:', response.data);

            // Set success message
            setMessage('Shifts scheduled successfully');
            setSeverity('success');
            setOpen(true);

            // Close the dialog window
            handleClose();
        } catch (error) {
            console.error('Error saving schedule:', error);
            setMessage('Error saving schedule');
            setSeverity('error');
            setOpen(true);
        }
    };

    const handleEditClick = (shift) => {
        setSelectedShift(shift);
        setEditedShifts(prev => ({
            ...prev,
            [shift._id]: shift.assigned_workers || []
        }));
        setSelectedEmployees([...shift.assigned_workers]);
    };

    const handleEmployeeSelection = (event, employeeId) => {
        const isChecked = event.target.checked;
        const employee = employees.find(emp => emp.id === employeeId);
        if (selectedShift) {
            setEditedShifts(prev => {
                const currentAssigned = prev[selectedShift._id] || [];
                let newAssigned;
                debugger;
                if (isChecked) {
                    if (!employee || !employee.skills?.includes(selectedShift.skill)) {
                        displayAlert('Employee does not have the required skill for this shift.', 'warning');
                       // return prev; // Stop further execution
                    }

                    if (currentAssigned.length >= selectedShift.max_workers) {
                        displayAlert('Cannot add more employees than the maximum allowed for this shift.', 'warning');
                        //return prev; // Stop further execution
                    }

                    if (!calculateLessThanMax(employee)) {
                        displayAlert('Employee has already reached the maximum number of shifts.', 'warning');
                        //return prev; // Stop further execution
                    }

                    newAssigned = [...currentAssigned, employeeId];
                } else {
                    newAssigned = currentAssigned.filter(id => id !== employeeId);
                }

                return {
                    ...prev,
                    [selectedShift._id]: newAssigned
                };
            });
        }
    };

    const handleSaveEdit = () => {
        if (selectedShift) {
            const updatedShifts = scheduledShifts.map((shift) =>
                shift._id === selectedShift._id
                    ? { ...shift, assigned_workers: editedShifts[shift._id] || shift.assigned_workers }
                    : shift
            );

            setScheduledShifts(updatedShifts);
            setSelectedShift(null);
            setSelectedEmployees([]);
        }

        setMessage('Shift updated successfully');
        setSeverity('success');
        setOpen(true);
    };

    // Filter shifts with unmet demand
    const shiftsWithUnmetDemand = scheduledShifts.filter((shift) => calculateUnmetDemand(shift) > 0);

    // Filter employees with fewer shifts than maximum
    const employeesWithLessThanMax = employees.filter((employee) => calculateLessThanMax(employee));

    // Sort employees by selected status and then alphabetically
    const sortedEmployees = employees
        .filter((employee) => selectedEmployees.includes(employee.id))
        .concat(
            employees
                .filter((employee) => !selectedEmployees.includes(employee.id) && employee.name)
                .sort((a, b) => a.name.localeCompare(b.name))
        );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Schedule Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please review the shifts and employees details before confirming.
                </DialogContentText>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Shifts with Unmet Demand</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {shiftsWithUnmetDemand.length > 0 ? (
                            <List>
                                {shiftsWithUnmetDemand.map((shift, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`Title: ${shift.title}`}
                                            secondary={`Skill: ${shift.skill}, Demand: ${shift.demand}, Start: ${new Date(
                                                shift.start
                                            ).toLocaleString()}, End: ${new Date(shift.end).toLocaleString()}`}
                                        />
                                        <ListItemText primary={`Unmet Demand: ${calculateUnmetDemand(shift)}`} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>No shifts with unmet demand.</Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Employees with Fewer Shifts than Maximum</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {employeesWithLessThanMax.length > 0 ? (
                            <List>
                                {employeesWithLessThanMax.map((employee) => (
                                    <ListItem key={employee._id}>
                                        <ListItemText
                                            primary={`Employee: ${employee.name}`}
                                            secondary={`Max: ${employee.max}, Got: ${employee.shifts?.length}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>All employees have reached maximum shifts.</Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>All Scheduled Shifts</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Skill</TableCell>
                                    <TableCell>Demand</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {scheduledShifts.map((shift, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{shift.title}</TableCell>
                                        <TableCell>{shift.skill}</TableCell>
                                        <TableCell>{shift.demand}</TableCell>
                                        <TableCell>{new Date(shift.start).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(shift.end).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEditClick(shift)} color="primary">
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
                {/* Edit Shift Dialog */}
                <Dialog open={!!selectedShift} onClose={() => setSelectedShift(null)} maxWidth="md" fullWidth>
                    <DialogTitle>Edit Shift: {selectedShift?.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Select employees for the shift:
                        </DialogContentText>
                        <List>
                            {sortedEmployees.map((employee) => (
                                <ListItem key={employee.id}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={editedShifts[selectedShift?._id]?.includes(employee.id)}
                                                onChange={(event) => handleEmployeeSelection(event, employee.id)}
                                                value={employee.id}
                                            />
                                        }
                                        label={employee.name}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedShift(null)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} color="primary">
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
                <Button onClick={handleConfirmAndSave} color="primary">
                    Confirm and Save
                </Button>
            </DialogActions>
            {/* Snackbar for alerts */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={handleAlertClose}
                    severity={alertSeverity}
                >
                    {alertMessage}
                </MuiAlert>
            </Snackbar>
        </Dialog>
    );
};

export default ScheduleConfirmationDialog;
