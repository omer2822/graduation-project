import React, { useState } from 'react';
import { Table, Form, InputGroup } from 'react-bootstrap';

const EmployeeTable = ({ headerKeys, dataArray }) => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleHeaders = headerKeys.filter(key => key !== '_id');

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...dataArray].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    Object.entries(item).some(([key, value]) =>
      key !== '_id' && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>
          🔍
        </InputGroup.Text>
        <Form.Control
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <Table striped bordered hover responsive className="mt-4">
        <thead className="thead-dark">
          <tr>
            {visibleHeaders.map((key) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                {key}{' '}
                {sortColumn === key && (
                  <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              {visibleHeaders.map((key, idx) => (
                <td key={idx}>
                  {typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <p>Showing {filteredData.length} of {dataArray.length} entries</p>
    </>
  );
};

export default EmployeeTable;