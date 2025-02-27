const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");  // Import UUID generator

// 📌 POST /save-form — Store form data
router.post("/save-form", authMiddleware, (req, res) => {
    const { id, formName, fields } = req.body;    
    const userId = req.user.id;  // Assuming user ID is stored in `req.user`

    if (!formName || !fields || !userId) {
        return res.status(400).json({ message: "Form name, fields, and user ID are required" });
    }

    try {
        const insertQuery = "INSERT INTO forms (form_id, user_id, form_name, fields) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [id, userId, formName, JSON.stringify(fields)], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error saving form data" });
            }
            res.status(201).json({ message: "Form saved successfully", id });
        });
    } catch (error) {
        console.error("Error saving form:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// 📌 GET /forms — Fetch forms for the logged-in user
router.get("/", authMiddleware, (req, res) => {
    const userId = req.user.id; // Get user ID from the authenticated request

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    try {
        const selectQuery = "SELECT * FROM forms WHERE user_id = ?";
        db.query(selectQuery, [userId], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error fetching forms" });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📌 GET /all-forms — Fetch all forms
router.get("/all-forms", authMiddleware, (req, res) => {
    const userId = req.user.id; // Get user ID from the authenticated request

    try {
        const selectQuery = "SELECT * FROM forms WHERE user_id != ?";
        db.query(selectQuery, [userId], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error fetching all forms" });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching all forms:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📌 Fetch Single Form by ID
router.get("/fill-form/:id", authMiddleware, (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM forms WHERE form_id = ?", [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching form" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.json(results[0]);
    });
});

// 📌 GET /responses/:formId — Fetch responses for a specific form
router.get("/responses/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.query("SELECT * FROM form_responses WHERE form_name = (SELECT form_name FROM forms WHERE form_id = ?)", [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching form responses" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No responses found for this form" });
        }        
        res.json(results);
    });
});


// 📌 Submit Form Data
router.post("/submit", authMiddleware, (req, res) => {
    const { formName,responses } = req.body;
    const username = req.user.username;

    if (!formName || !username || !responses) {
        return res.status(400).json({ message: "Some fields are missing, which are required" });
    }

    const insertQuery = "INSERT INTO form_responses (form_name, username, responses) VALUES (?, ?, ?)";
    db.query(insertQuery, [formName, username, JSON.stringify(responses)], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error saving form response" });
        }
        res.status(201).json({ message: "Form submitted successfully" });
    });
});

// 📌 DELETE /delete/:id — Delete a form by ID
router.delete("/delete/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    
    const userId = req.user.id; // Get user ID from the authenticated request

    if (!id || !userId) {
        return res.status(400).json({ message: "Form ID and user ID are required" });
    }

    try {
        const deleteQuery = "DELETE FROM forms WHERE form_id = ? AND user_id = ?";
        db.query(deleteQuery, [id, userId], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error deleting form" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Form not found or not authorized to delete" });
            }
            res.json({ message: "Form deleted successfully" });
        });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
