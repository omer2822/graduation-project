import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const FileUpload = ({ onFileSubmit, label }) => {
  const [file, setFile] = useState(null);

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onFileSubmit(file);
    }
  };

  return (
    <Form onSubmit={handleOnSubmit} className="mb-4">
      <Form.Group>
        <Form.Label>{label}</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleOnChange} />
      </Form.Group>
      <Button type="submit" variant="primary">Import</Button>
    </Form>
  );
};

export default FileUpload;
