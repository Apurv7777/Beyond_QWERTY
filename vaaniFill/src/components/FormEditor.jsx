import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const FormEditor = () => {
    const { id } = useParams();      
    const [formName, setFormName] = useState("");
    const [fields, setFields] = useState([]);
    const navigate = useNavigate();

    const addField = () => {
        setFields([...fields, { name: "", type: "text", options: [] }]);
    };

    const handleFieldChange = (index, key, value) => {
        setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
    };

    const deleteField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("User not authenticated. Please log in.");
                return;
            }

            const formData = { id, formName, fields };

            await axios.post("http://localhost:5000/api/forms/save-form", 
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Form saved successfully!");
            navigate("/dashboard"); 
        } catch (error) {
            console.error("Error saving form:", error.response ? error.response.data : error);
            alert("Failed to save form. Check the console for details.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Create Form</h2>
            <input 
                type="text" 
                placeholder="Form Name" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <button 
                onClick={addField} 
                className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600"
            >
                Add Field
            </button>

            {fields.map((field, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                    <input 
                        type="text" 
                        placeholder="Field Name" 
                        value={field.name} 
                        onChange={(e) => handleFieldChange(index, "name", e.target.value)} 
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <select 
                        value={field.type} 
                        onChange={(e) => handleFieldChange(index, "type", e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                        <option value="date">Date</option>
                    </select>
                    <button 
                        onClick={() => deleteField(index)} 
                        className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-2"
                    >
                        Delete Field
                    </button>
                </div>
            ))}

            <button 
                onClick={handleSubmit} 
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
                Save Form
            </button>
        </div>
    );
};

export default FormEditor;
