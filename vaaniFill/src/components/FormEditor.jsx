import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
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

    const isFormValid = () => {
        return formName.trim() !== "" && fields.length > 0 && fields.every(field => field.name.trim() !== "");
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("User not authenticated. Please log in.");
                return;
            }

            const formData = { id, formName, fields };
            await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/save-form`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Form saved successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving form:", error.response ? error.response.data : error);
            alert("Failed to save form. Check the console for details.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Form</h2>
            <div className="flex items-center space-x-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Form Name" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button 
                    onClick={addField} 
                    className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <FiPlus className="text-xl" />
                </button>
            </div>

            {fields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 mb-4 p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <input 
                        type="text" 
                        placeholder="Field Name" 
                        value={field.name} 
                        onChange={(e) => handleFieldChange(index, "name", e.target.value)} 
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <select 
                        value={field.type} 
                        onChange={(e) => handleFieldChange(index, "type", e.target.value)} 
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                        <option value="date">Date</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="select">Dropdown</option>
                        <option value="file">File Upload</option>
                    </select>
                    <button 
                        onClick={() => deleteField(index)} 
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                    >
                        Delete
                    </button>
                </div>
            ))}

            <button 
                onClick={handleSubmit} 
                disabled={!isFormValid()}
                className={`w-full py-3 rounded-lg transition ${!isFormValid() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
                Save Form
            </button>
        </div>
    );
};

export default FormEditor;
