import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import NavigationBar from '../components/navigationBar/NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function App() {
  return (
    <div className="App">
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <h1 className="text-center mb-4">Welcome to Employee Scheduler</h1>
                <p className="text-center mb-5">Follow these steps to get started:</p>

                <Row className="gy-4">
                  <Col md={4}>
                    <Card className="h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>1. Manage Employees</Card.Title>
                        <Card.Text>
                          Check your existing employees and update if needed.
                        </Card.Text>
                        <div className="mt-auto">
                          <Button variant="outline-primary" href="/employees/list">View Employees</Button>
                          <Button variant="primary" href="/employees/add" className="ms-2">Add Employee</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>2. Schedule Shifts</Card.Title>
                        <Card.Text>
                          Create shifts and schedule employees using the calendar.
                        </Card.Text>
                        <div className="mt-auto">
                          <Button variant="primary" href="/schedule">Open Calendar</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>3. View Reports</Card.Title>
                        <Card.Text>
                          Check out reports and KPIs for insights.
                        </Card.Text>
                        <div className="mt-auto">
                          <Button variant="primary" href="/reports">View Reports</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;