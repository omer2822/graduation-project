import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Paper from '@mui/material/Paper';

const localizer = momentLocalizer(moment);

const CalendarComponent = ({ events, onSelectEvent }) => {
  return (
    <Paper>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={onSelectEvent}
      />
    </Paper>
  );
};

export default CalendarComponent;
