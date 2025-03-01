import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import { startRecording, stopRecording } from "../utils/speechToText";

const FormFill = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState({});
    const [errors, setErrors] = useState({});
    const [listening, setListening] = useState({});
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/fill-form/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setForm(response.data);
                
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

    const autoCorrectValue = (value, type) => {
        value = value.trim(); // Remove unnecessary spaces
    
        if (type === "email") {
            // Replace "gmailcom" with "@gmail.com"
            value = value.replace(/gmailcom/g, "@gmail.com");
    
            // Ensure there is exactly one '@'
            if (!value.includes("@")) {
                value += "@gmail.com";
            } else {
                let [local, domain] = value.split("@");
    
                // If domain is missing or incorrect, replace it with "gmail.com"
                if (!domain || !domain.includes(".")) {
                    domain = "gmail.com";
                } else {
                    // Ensure the domain has at least one dot and a valid ending
                    domain = domain.replace(/(\.[^.]+)?$/, ".com");
                }
    
                value = `${local}@${domain}`;
            }
        } else if (type === "number" || type === "tel") {
            value = value.replace(/[^0-9]/g, ""); // Keep only numbers
        } else if (type === "date") {
            // Remove any non-numeric characters (including extra hyphens)
            value = value.replace(/[^0-9]/g, "");
    
            // Ensure the correct length after cleaning
            if (value.length !== 8) return "Invalid Date";
    
            // Extract day, month, and year
            let day = value.substring(0, 2);
            let month = value.substring(2, 4);
            let year = value.substring(4, 8);
    
            return `${year}-${month}-${day}`;
        }
    
        return value;
    };
    
    const validateField = (value, type) => {
        let error = "";
        if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Invalid email address";
        } else if (type === "number" && isNaN(value)) {
            error = "Must be a number";
        } else if (type === "text" && value.trim() === "") {
            error = "This field is required";
        } else if (type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            error = "Invalid date format (YYYY-MM-DD)";
        } else if (type === "tel" && !/^\d{10}$/.test(value)) {
            error = "Invalid phone number (must be 10 digits)";
        }
        return error;
    };

    const handleChange = (fieldName, value, type) => {
        // const correctedValue = autoCorrectValue(value, type);
        setResponses((prev) => ({ ...prev, [fieldName]: value }));
        setErrors((prev) => ({ ...prev, [fieldName]: validateField(value, type) }));
    };

    const handleVoiceInput = async (fieldName,fieldType) => {
        if (!listening[fieldName]) {
            const recorder = await startRecording((text) => {
                const correctedValue = autoCorrectValue(text, fieldType);
                setResponses((prev) => ({ ...prev, [fieldName]: correctedValue }));
            }, (isListening) => {
                setListening((prev) => ({ ...prev, [fieldName]: isListening }));
            }, fieldName);

            setMediaRecorder(recorder);
        } else {
            stopRecording(mediaRecorder);
            setListening((prev) => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleSubmit = async () => {
        const allFieldsValid = form.fields.every((field) => {
            const error = validateField(responses[field.name], field.type);
            if (error) setErrors((prev) => ({ ...prev, [field.name]: error }));
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="max-w-2xl w-full bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">{form.form_name}</h2>
                
                {form.fields.map((field, index) => (
                    <div key={index} className="mb-4">
                        <label className="block text-lg font-medium text-gray-700 mb-2">{field.name}:</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type={field.type}
                                value={responses[field.name] || ""}
                                onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => handleVoiceInput(field.name,field.type)}
                                className={`p-3 rounded-full transition ${
                                    listening[field.name] ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                            >
                                <FaMicrophone />
                            </button>
                        </div>
                        {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
                    </div>
                ))}

                <button 
                    onClick={handleSubmit} 
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 transition"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default FormFill;
