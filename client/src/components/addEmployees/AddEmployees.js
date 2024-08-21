import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import FileUpload from '../fileUpload/FileUpload';
import { useState } from 'react';
import axios from 'axios';

function AddEmployees() {
    const [array1, setArray1] = useState([]);
    const [array2, setArray2] = useState([]);
    const [uploadedMessages, setUploadedMessages] = useState('');

    const csvFileToArray = (string, setArray) => {
        const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        const array = csvRows.map((row) => {
            const values = row.split(",");
            const obj = csvHeader.reduce((object, header, index) => {
                object[header.trim()] = values[index] ? values[index].trim() : "";
                return object;
            }, {});
            return obj;
        }).filter(obj => Object.values(obj).some(value => value !== ""));

        setArray(array);
    };

    const handleFileSubmit1 = async (file) => {
        const text = await new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = (event) => resolve(event.target.result);
            fileReader.readAsText(file);
        });

        csvFileToArray(text, (updatedArray) => {
            setArray1(updatedArray);

            const sendToServer = async () => {
                try {
                    const response = await axios.post('http://localhost:5000/employees/upload', { data: updatedArray }, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    setUploadedMessages(response.data.message);
                    const assignments = response.data;
                    console.log(assignments);
                } catch (error) {
                    console.log(error);
                    setUploadedMessages('Error uploading the data' + error);
                }
            };

            sendToServer();
        });
    };
    const handleFileSubmit2 = async (file) => {
        const text = await new Promise((resolve) => {
            const fileReader = new FileReader()
            fileReader.onload = (event) => resolve(event.target.result)
            fileReader.readAsText(file)
        })
        csvFileToArray(text, (updatedArray) => {
            setArray2(updatedArray)

            const sendToServer = async () => {
                try {
                    const response = await axios.post('http://localhost:5000/employees/delete', { data: updatedArray }, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    setUploadedMessages(response.data.message);
                    const assignments = response.data;
                    console.log(assignments);
                } catch (error) {
                    console.log(error);
                    setUploadedMessages('Error uploading the data' + error);
                }
            };

            sendToServer();
        })
    }


    return (
        <div className="App">
            <div className="row">
                <div className="col-md-6">
                    <FileUpload onFileSubmit={handleFileSubmit1} label="Add Employees" />
                </div>
            </div>
            <br />
            <div>
                <div className="col-md-6">
                    <FileUpload onFileSubmit={handleFileSubmit2} label="Delete Employees" />
                </div>
            </div>
            {uploadedMessages && (
                <div className='alert alert-info mt-3'>
                    {uploadedMessages}
                </div>
            )}
        </div>
    );
}

export default AddEmployees;
