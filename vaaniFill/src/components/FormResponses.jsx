import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FormResponses = () => {
    const { id } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/forms/responses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setResponses(response.data);
                
            } catch (error) {
                console.error("Error fetching responses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [id]);

    if (loading) return <p className="text-center text-gray-500 mt-10">Loading responses...</p>;
    if (responses.length === 0) return <p className="text-center text-gray-500 mt-10">No responses found.</p>;

    return (
        <div className="min-h-[91.5vh] py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-lg p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Form Responses</h2>
                {responses.map((response, index) => (
                    <div key={index} className="mb-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                        <p className="text-lg font-semibold text-gray-700 mb-2">Username : <span className="text-gray-900 font-bold">{response.username}</span></p>
                        <p className="text-gray-700 font-medium">Response :</p>
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-sm overflow-x-auto mt-2 border border-gray-200">
                            {Object.entries(typeof response.responses === "string" ? JSON.parse(response.responses) : response.responses).map(([key, value]) => (
                                <p key={key} className="mb-1"><strong>{key} :</strong> {value}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormResponses;
