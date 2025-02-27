import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-blue-500 to-purple-600">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl text-center bg-white p-10 rounded-2xl shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-5xl font-extrabold text-gray-900 mb-4"
        >
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            VaaniFill
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="text-lg text-gray-700 mb-3"
        >
          VaaniFill is a platform where you can create, fill, and manage forms
          easily.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          className="text-lg text-gray-700 mb-6"
        >
          To get started, please sign up or log in.
        </motion.p>

        <div className="flex justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-110"
            >
              Sign Up
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-50 hover:shadow-lg"
            >
              Log In
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
