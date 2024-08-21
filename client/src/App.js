// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/navigationBar/NavigationBar';
import HomePage from './pages/HomePage'; // Create HomePage component
import SchedulePage from './pages/SchedulePage'; // Create SchedulePage component
import EmployeesPage from './pages/EmployeesPage'; // Create EmployeesPage component
import ReportsPage from './pages/ReportsPage'; // Create ReportsPage component
import AddEmployees from './components/addEmployees/AddEmployees';
import GetEmployees from './components/getEmployees/GetEmployees';
import CalenderPage from './pages/CalenderPage';

const App = () => {
  return (
    <Router>
      <div>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<CalenderPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/employees/add" element={<AddEmployees />} />
          <Route path="/employees/list" element={<GetEmployees />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
