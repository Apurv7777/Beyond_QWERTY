import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import { AssemblyAI } from 'assemblyai'
import { startRecording, stopRecording } from "../utils/speechToText"; // Import functions

const FormFill = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState({});
    const [errors, setErrors] = useState({});
    const [listening, setListening] = useState({});
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const navigate = useNavigate();

    // const client = new AssemblyAI({
    // apiKey: 'a9657ea16a224379bb76ee33f93ba05b'
    // })

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/fill-form/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setForm(response.data);

                // Initialize state for responses and listening dynamically
                const initialResponses = response.data.fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {});
                const initialListening = response.data.fields.reduce((acc, field) => ({ ...acc, [field.name]: false }), {});

                setResponses(initialResponses);
                setListening(initialListening);
            } catch (err) {
                console.error("Error fetching form:", err);
            }
        };

        fetchForm();
    }, [id]);

    const validateField = (fieldName, value, type) => {
        let error = "";
        if (type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) error = "Invalid email address";
        } else if (type === "number") {
            if (isNaN(value)) error = "Must be a number";
        } else if (type === "text" && value.trim() === "") {
            error = "This field is required";
        }
        return error;
    };

    const handleChange = (fieldName, value, type) => {
        setResponses((prev) => ({ ...prev, [fieldName]: value }));
        const error = validateField(fieldName, value, type);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
    };

    const handleVoiceInput = async (fieldName) => {
        if (!listening[fieldName]) {
            const recorder = await startRecording((text) => {
                setResponses((prev) => ({ ...prev, [fieldName]: text }));
            }, (isListening) => {
                setListening((prev) => ({ ...prev, [fieldName]: isListening }));
            },fieldName);

            setMediaRecorder(recorder);
        } else {
            stopRecording(mediaRecorder);
            setListening((prev) => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleSubmit = async () => {
        // Check if all fields are filled and valid
        const allFieldsValid = form.fields.every((field) => {
            const error = validateField(field.name, responses[field.name], field.type);
            if (error) {
                setErrors((prev) => ({ ...prev, [field.name]: error }));
            }
            return !error;
        });

        if (!allFieldsValid) {
            alert("Please fill out all fields correctly.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const formName = form.form_name;

            await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/submit`, {
                formName,
                responses,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Form submitted successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    if (!form) return <p className="text-center text-gray-500">Loading form...</p>;

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Fill Form: {form.form_name}</h2>
            {form.fields.map((field, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-gray-700 mb-2">{field.name}:</label>
                    <div className="flex items-center">
                        <input
                            type={field.type}
                            value={responses[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => handleVoiceInput(field.name)}
                            className="ml-2 px-4 py-2 bg-gray-200 rounded text-black cursor-pointer"
                        >
                            {listening[field.name] ? <FaMicrophone className="text-red-500" /> : <FaMicrophone />}
                        </button>

                    </div>
                    {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
                </div>
            ))}
            <button 
                onClick={handleSubmit} 
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
                Submit
            </button>
        </div>
    );
};

export default FormFill;
