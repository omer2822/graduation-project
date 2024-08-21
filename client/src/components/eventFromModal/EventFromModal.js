import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';

const EventFormModal = ({ modalOpen, handleModalClose, handleSubmit, newEvent, handleInputChange, handleEmployeeChange, employees }) => {
  return (
    <Dialog open={modalOpen} onClose={handleModalClose}>
      <DialogTitle>{newEvent._id ? 'Edit Event' : 'Add New Event'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the form below to {newEvent._id ? 'edit' : 'add'} an event to the calendar.
        </DialogContentText>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Skill"
                name="skill"
                value={newEvent.skill}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Demand"
                name="demand"
                type="number"
                value={newEvent.demand}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Start"
                name="start"
                type="datetime-local"
                value={newEvent.start}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="End"
                name="end"
                type="datetime-local"
                value={newEvent.end}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Employees</InputLabel>
                <Select
                  multiple
                  name="employees"
                  value={newEvent.employees}
                  onChange={handleEmployeeChange}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {newEvent._id ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormModal;
