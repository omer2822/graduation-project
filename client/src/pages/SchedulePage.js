import React, { useState, useEffect } from 'react';
import { Container, Button, Typography } from '@mui/material';
import axios from 'axios';
import CalendarComponent from '../components/calendar/calendar';
import EventFormModal from '../components/eventFromModal/EventFromModal';
import EventDetailsDialog from '../components/eventDetailsDialog/EventDetailsDialog';
import SnackbarNotification from '../components/snackBarNotification/SnackbarNotification ';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', skill: '', demand: 0, employees: [] });
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events/read');
        const events = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/employees/read');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEvents();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleEmployeeChange = (e) => {
    setNewEvent({ ...newEvent, employees: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventToSubmit = {
        ...newEvent,
        demand: parseInt(newEvent.demand, 10),
      };
      if (eventToSubmit._id) {
        const eventId = newEvent._id.$oid;
        const response = await axios.put('http://localhost:5000/events/update/${eventId}', eventToSubmit);
        const updatedEvent = { ...eventToSubmit, start: new Date(eventToSubmit.start), end: new Date(eventToSubmit.end) };
        const updatedEvents = events.map(event => event._id === eventToSubmit._id ? updatedEvent : event);
        setEvents(updatedEvents);
        setMessage('Event updated successfully');
      } else {
        const response = await axios.post('http://localhost:5000/events/add', eventToSubmit);
        setEvents([...events, { ...eventToSubmit, start: new Date(eventToSubmit.start), end: new Date(eventToSubmit.end) }]);
        setMessage('Event added successfully');
      }
      setSeverity('success');
      setOpen(true);
      setModalOpen(false);
      setNewEvent({ title: '', start: '', end: '', skill: '', demand: 0, employees: [] });
    } catch (error) {
      console.error('Error adding/updating event:', error);
      setMessage('Error adding/updating event');
      setSeverity('error');
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setNewEvent({ title: '', start: '', end: '', skill: '', demand: 0, employees: [] });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = () => {
    setNewEvent(selectedEvent);
    setModalOpen(true);
  };

  const handleSchedule = async () => {
    try {
      const response = await axios.post('http://localhost:5000/schedule', { events, employees });
      if (response.status === 200) {
        setMessage('Shifts scheduled successfully');
        setSeverity('success');
        setOpen(true);
      } else {
        setMessage('Error scheduling shifts');
        setSeverity('error');
        setOpen(true);
      }
    } catch (error) {
      console.error('Error scheduling shifts:', error);
      setMessage('Error scheduling shifts');
      setSeverity('error');
      setOpen(true);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:5000/events/upload_csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setMessage('Events added successfully from CSV');
        setSeverity('success');
        setOpen(true);
      })
      .catch(error => {
        console.error('Error uploading CSV:', error);
        setMessage('Error uploading CSV');
        setSeverity('error');
        setOpen(true);
      });
  };

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Schedule
      </Typography>
      <Button variant="contained" color="primary" onClick={handleModalOpen}>
        Add Event
      </Button>
      <input
        accept=".csv"
        style={{ display: 'none' }}
        id="contained-button-file"
        multiple
        type="file"
        onChange={handleCSVUpload}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="success" component="span">
          Upload CSV
        </Button>
      </label>
      <Button variant="contained" color="secondary" onClick={handleSchedule}>
        Schedule Shifts
      </Button>
      <br /><br />
      <EventFormModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        handleSubmit={handleSubmit}
        newEvent={newEvent}
        handleInputChange={handleInputChange}
        handleEmployeeChange={handleEmployeeChange}
        employees={employees}
      />
      <SnackbarNotification
        open={open}
        handleClose={handleClose}
        message={message}
        severity={severity}
      />
      <CalendarComponent
        events={events}
        onSelectEvent={handleEventClick}
      />
      <EventDetailsDialog
        selectedEvent={selectedEvent}
        handleCloseEventDetails={handleCloseEventDetails}
        handleEditEvent={handleEditEvent}
        employees={employees}
      />
    </Container>
  );
};

export default CalendarPage;