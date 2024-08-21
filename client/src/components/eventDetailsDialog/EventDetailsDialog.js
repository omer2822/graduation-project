import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';

const EventDetailsDialog = ({ selectedEvent, handleCloseEventDetails, handleEditEvent, employees }) => {
  return (
    <Dialog open={selectedEvent !== null} onClose={handleCloseEventDetails}>
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">Title: {selectedEvent?.title}</Typography>
        <Typography variant="subtitle1">Skill: {selectedEvent?.skill}</Typography>
        <Typography variant="subtitle1">Demand: {selectedEvent?.demand}</Typography>
        <Typography variant="subtitle1">Start: {selectedEvent?.start.toLocaleString()}</Typography>
        <Typography variant="subtitle1">End: {selectedEvent?.end.toLocaleString()}</Typography>
        <Typography variant="subtitle1">Employees:</Typography>
        <List>
          {selectedEvent?.employees.map(employeeId => {
            

            const employee = employees.find((emp) => {
              debugger;
              if (emp._id?.$oid) {
                if (employeeId.$oid) {
                  return emp._id?.$oid === employeeId.$oid
                }
                return emp._id.$oid === employeeId
              }
              if (emp.id) {
                return emp.id === employeeId
              }
              return false;
            });
            return (
              <ListItem key={employeeId}>
                <ListItemText primary={employee?.Name} />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditEvent} color="primary">
          Edit
        </Button>
        <Button onClick={handleCloseEventDetails} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsDialog;
