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

    db.query(`CREATE DATABASE IF NOT EXISTS auth_db`, (err) => {
        if (err) {
            console.error("Database creation failed:", err);
            process.exit(1);
        }
        console.log("Database ensured: auth_db");

        db.changeUser({ database: "auth_db" }, (err) => {
            if (err) {
                console.error("Switching database failed:", err);
                process.exit(1);
            }

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

            const createResponsesTable = `
                CREATE TABLE IF NOT EXISTS form_responses (
                    response_id INT AUTO_INCREMENT PRIMARY KEY,
                    form_name VARCHAR(255) NOT NULL,
                    username VARCHAR(255) NOT NULL,
                    responses JSON NOT NULL,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;

            db.query(createResponsesTable, (err) => {
                if (err) {
                    console.error("Table creation failed:", err);
                    process.exit(1);
                }
                console.log("Table ensured: form_responses");
            });

            const createFormsTable = `
                CREATE TABLE IF NOT EXISTS forms (
                    form_id VARCHAR(36) PRIMARY KEY,
                    user_id INT NOT NULL,
                    form_name VARCHAR(255) NOT NULL,
                    fields JSON NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )`;

            db.query(createFormsTable, (err) => {
                if (err) {
                    console.error("Table creation failed:", err);
                    process.exit(1);
                }
                console.log("Table ensured: forms");
            });
        });
    });
});

module.exports = db;
