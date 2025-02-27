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

    if (loading) return <p className="text-center text-gray-500">Loading responses...</p>;
    if (responses.length === 0) return <p className="text-center text-gray-500">No responses found.</p>;

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Responses</h2>
            {responses.map((response, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-300 rounded-md">
                    <p><strong>Username :</strong> {response.username}</p>
                    <p><strong>Submitted Responses :</strong></p>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(
                        typeof response.responses === "string" ? JSON.parse(response.responses) : response.responses, 
                        null, 
                        2
                    )}</pre>
                </div>
            ))}
        </div>
    );
};

export default FormResponses;
