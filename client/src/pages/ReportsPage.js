import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';

const ReportsPage = () => {
  const [events, setEvents] = useState([]);
  const [kpis, setKpis] = useState({});
  const [empData, setEmpData] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/reports');
        setEvents(response.data.reports);
        setKpis(response.data.kpis);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/employees/read');
        setEmpData(response.data); // Assuming response.data is like { id: { name, ...otherDetails } }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchReports();
    fetchEmployeeData();
  }, []); // Dependency array should be empty to run once on mount

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Reports
      </Typography>

      {/* KPIs Section */}
      <Paper elevation={3} style={{ marginBottom: 20, padding: 20 }}>
        <Typography variant="h6" gutterBottom>
          Key Performance Indicators (KPIs)
        </Typography>
        <List>
          <KPIListItem primary={`Total Events`} value={kpis.total_events} />
          <KPIListItem primary={`Total Demand`} value={kpis.total_demand} />
          <KPIListItem primary={`Total Skills Matched`} value={kpis.total_skills_matched} />
          <KPIListItem primary={`Total Needed Hours`} value={kpis.total_needed_hours} />
          <KPIListItem primary={`Total Employee Hours Scheduled`} value={kpis.total_employee_hours_scheduled} />
          <KPIListItem primary={`Average Employee Hours Scheduled`} value={kpis.average_employee_hours_scheduled} />
          <KPIListItem primary={`Total Hours Scheduled`} value={kpis.total_hours_scheduled} />
          <KPIListItem primary={`Average Hours Per Event`} value={kpis.average_hours_per_event} />
          <KPIListItem primary={`Average Demand Per Event`} value={kpis.average_demand_per_event} />
          <KPIListItem primary={`High Demand Events`} value={kpis.num_high_demand_events} />
          {/* Add more KPIs as needed */}
        </List>
      </Paper>

      {/* Events Section */}
      <Paper elevation={3} style={{ marginBottom: 20, padding: 20 }}>
        <Typography variant="h6" gutterBottom>
          Events
        </Typography>
        <List>
          {events.map((event, index) => (
            <EventListItem
              key={index}
              index={index}
              event={event}
              empData={empData}
            />
          ))}
        </List>
      </Paper>
    </Container>
  );
};

const KPIListItem = ({ primary, value }) => (
  <ListItem>
    <ListItemText primary={`${primary}: ${value}`} />
  </ListItem>
);

const EventListItem = ({ index, event, empData }) => (
  <ListItem>
    <ListItemText
      primary={`Event ${index + 1}: ${event.title}`}
      secondary={`Start: ${event.start}, End: ${event.end}`}
    />
    <ListItemText
      primary={`Demand: ${event.demand}`}
      secondary={`Assigned Employees: ${getAssignedEmployees(event.employees, empData)}`}
    />
  </ListItem>
);

const getAssignedEmployees = (employeeIds, empData) => {
  if (employeeIds.length === 0) {
    return 'None';
  }

  return employeeIds
    .map(empId => {
      const employee = Object.values(empData).find(emp => emp._id.$oid === empId);
      return employee ? employee.Name : 'Unknown';
    })
    .join(', ');
};

export default ReportsPage;
