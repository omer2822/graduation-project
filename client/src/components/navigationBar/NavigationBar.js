import React from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Shift Scheduler</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/schedule">Schedule</Nav.Link>
            <NavDropdown title="Employees" id="employees-dropdown">
              <NavDropdown.Item as={Link} to="/employees/list">Employee List</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/employees/add">Add Employee</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
          </Nav>
          {/* <Form className="d-flex ml-auto">
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-success">Search</Button>
          </Form> */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
