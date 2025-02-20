const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }

    console.log("Connected to MySQL");

    // Create database if not exists
    db.query(`CREATE DATABASE IF NOT EXISTS auth_db`, (err) => {
        if (err) {
            console.error("Database creation failed:", err);
            process.exit(1);
        }
        console.log("Database ensured: auth_db");

        // Connect to the newly created database
        db.changeUser({ database: "auth_db" }, (err) => {
            if (err) {
                console.error("Switching database failed:", err);
                process.exit(1);
            }

            // Create `users` table if it does not exist
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;

            db.query(createUsersTable, (err) => {
                if (err) {
                    console.error("Table creation failed:", err);
                    process.exit(1);
                }
                console.log("Table ensured: users");
            });
        });
    });
});

module.exports = db;
