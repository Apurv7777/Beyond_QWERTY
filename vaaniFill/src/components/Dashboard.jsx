import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash } from "react-icons/fa";

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [allForms, setAllForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated. Please log in.");
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/forms`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setForms(response.data);
            } catch (err) {
                console.error("Error fetching forms:", err);
                setError("Failed to load forms. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAllForms = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated. Please log in.");
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/all-forms`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAllForms(response.data);
            } catch (err) {
                console.error("Error fetching all forms:", err);
                setError("Failed to load all forms. Please try again.");
            }
        };

        fetchForms();
        fetchAllForms();
    }, []);

    const deleteForm = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
            setError("User not authenticated. Please log in.");
            return;
            }

            await axios.delete(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
            });

            setForms(forms.filter(form => form.form_id !== id));
        } catch (err) {
            console.error("Error deleting form:", err);
            setError("Failed to delete form. Please try again.");
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    // Handle new form creation
    const createNewForm = async () => {
        const newFormId = crypto.randomUUID(); // Generate a unique ID
        navigate(`/form/${newFormId}`); // Redirect to new form page
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-4">Your Forms</h2>
                <button
                    onClick={() => createNewForm()}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <div className="flex cursor-pointer items-center">
                        <FaPlus className="m-2"/> Create New Form
                    </div>
                </button>
            </div>
            {forms.length === 0 ? (
                <p className="text-gray-500">No forms found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => (
                        <div key={form.form_id} className="border border-gray-300 p-4 rounded shadow">
                            <h3 className="text-xl font-semibold">{form.form_name}</h3>
                            <p className="text-gray-500">Created: {new Date(form.created_at).toLocaleString()}</p>
                            <button
                                onClick={() => navigate(`/fill-form/${form.form_id}`)}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Fill
                            </button>
                            <button 
                                onClick={() => navigate(`/responses/${form.form_id}`)} 
                                className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Responses
                            </button>
                            <button 
                                onClick={() => deleteForm(form.form_id)} 
                                className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="text-2xl font-bold mt-8 mb-4">Other Forms</h2>
            {allForms.length === 0 ? (
                <p className="text-gray-500">No forms found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allForms.map((form) => (
                        <div key={form.form_id} className="border border-gray-300 p-4 rounded shadow">
                            <h3 className="text-xl font-semibold">{form.form_name}</h3>
                            <p className="text-gray-500">Created: {new Date(form.created_at).toLocaleString()}</p>
                            <button
                                onClick={() => navigate(`/fill-form/${form.form_id}`)}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Fill
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
