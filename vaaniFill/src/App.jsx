import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import FormEditor from "./components/FormEditor";
import FormFill from "./components/FormFill";
import FormResponses from "./components/FormResponses";
import Home from "./components/Home";

const App = () => {
    const [status, setStatus] = useState(false);

    useEffect(() => {
        if(localStorage.getItem('token')){
            setStatus(true);
        } else {
            setStatus(false);
        }
    }, [status])
    

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token from local storage
        setStatus(false);
        window.location.href = '/'; // Navigate to the login page
    };

    return (
        <Router>
            <nav className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4 shadow-lg flex justify-between items-center">
                <Link className="text-white font-bold cursor-pointer hover:text-yellow-300 transition duration-300 transform hover:scale-110 text-xl" to={status ? "/dashboard" : '/login'}>VaaniFill</Link>
                <ul className="flex space-x-4">
                    {!status ? (
                        <>
                            <li>
                                <Link className="text-white font-bold hover:text-yellow-300 transition duration-300 transform hover:scale-110" to="/signup">
                                    Signup
                                </Link>
                            </li>
                            <li>
                                <Link className="text-white font-bold hover:text-yellow-300 transition duration-300 transform hover:scale-110" to="/login" >
                                    Login
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <button className="text-white font-bold hover:text-yellow-300 transition duration-300 transform hover:scale-110" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login setStatus={setStatus}/>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/form/:id" element={<FormEditor />} />
                <Route path="/fill-form/:id" element={<FormFill />} />
                <Route path="/responses/:id" element={<FormResponses />} />
            </Routes>
        </Router>
    );
};

export default App;
