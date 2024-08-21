// src/getEmployees/GetEmployees.js
import { useEffect, useState } from 'react';
import EmployeeTable from '../employeeTable/EmployeeTable';
import axios from 'axios';

const GetEmployees = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/employees/read');
        const transformedData = transformData(response.data);
        setEmployees(transformedData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployees();
  }, []);

  const transformData = (data) => {
    // Example transformation: Convert ObjectId fields to strings
    return data.map(item => ({
      ...item,
      _id: item._id.$oid // Assuming MongoDB ObjectId is stored in _id.$oid
    }));
  };

  const headerKeys = employees.length ? Object.keys(employees[0]) : [];

  return (
    <div>
      <h3 className="mt-4">Employee Data</h3>
      <EmployeeTable headerKeys={headerKeys} dataArray={employees} />
    </div>
  );
};

export default GetEmployees;
