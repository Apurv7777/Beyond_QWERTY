import React, { useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaEye, FaEyeSlash } from "react-icons/fa";

const Form = () => {
    const [listening, setListening] = useState({ username: false, password: false });
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [inputValues, setInputValues] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleVoiceInput = async (field) => {
        if (!listening[field]) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                let chunks = [];

                recorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };

                recorder.onstop = async () => {
                    const audioBlob = new Blob(chunks, { type: "audio/webm" });
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "recording.webm");
                    const apiKey = import.meta.env.VITE_API_KEY;
                    const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&smart_format=true&hints=Apurv,Deepika,email@gmail.com,xyz@domain.in",{
                        method: "POST",
                        headers: {
                            "Authorization": `Token ${apiKey}`,
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        console.error("Error with Deepgram API:", response);
                        return;
                    }

                    const data = await response.json();
                    console.log(data);
                    
                    if (data.results && data.results.channels) {
                        const transcription = data.results.channels[0].alternatives[0].transcript;
                        setInputValues((prevValues) => ({ ...prevValues, [field]: transcription }));
                    }
                };

                recorder.start();
                setMediaRecorder(recorder);
                setListening((prevListening) => ({ ...prevListening, [field]: true }));
            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        } else {
            mediaRecorder.stop();
            setListening((prevListening) => ({ ...prevListening, [field]: false }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", inputValues);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <nav className="bg-gray-200 p-4 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">VaaniFill</h1>
                </div>
            </nav>
            <h2 className="text-2xl text-center mt-11 font-semibold">Login Form</h2>
            <main className="container mx-auto p-6 flex-grow">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit} className="">
                        <div className="mb-4 flex items-center relative">
                            <label className="block text-md font-medium mb-2 w-1/4">Username</label>
                            <input
                                type="text"
                                value={inputValues.username}
                                onChange={(e) => setInputValues({ ...inputValues, username: e.target.value })}
                                className="w-full p-2 bg-gray-100 border border-gray-400 rounded"
                            />
                            <button type="button" onClick={() => handleVoiceInput("username")} className="ml-2 px-4 py-2 bg-gray-200 rounded text-black cursor-pointer">
                                {listening.username ? <FaMicrophoneSlash /> : <FaMicrophone />}
                            </button>
                        </div>
                        <div className="mb-4 flex items-center relative">
                            <label className="block text-md font-medium mb-2 w-1/4">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={inputValues.password}
                                onChange={(e) => setInputValues({ ...inputValues, password: e.target.value })}
                                className="w-full p-2 bg-gray-100 border border-gray-400 rounded"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-17 bg-gray-200 rounded text-black cursor-pointer">
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button type="button" onClick={() => handleVoiceInput("password")} className="ml-2 px-4 py-2 bg-gray-200 rounded text-black cursor-pointer">
                                {listening.password ? <FaMicrophoneSlash /> : <FaMicrophone />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 cursor-pointer bg-gray-300 font-medium text-black rounded">Submit</button>
                        </div>
                    </form>
                </div>
            </main>
            <footer className="bg-gray-200 p-4 mt-auto shadow-inner">
                <div className="container mx-auto">
                    <p className="text-center">&copy; 2025 VaaniFill</p>
                </div>
            </footer>
        </div>
    );
};

export default Form;
