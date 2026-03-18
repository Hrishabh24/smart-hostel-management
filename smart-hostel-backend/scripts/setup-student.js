const db = require("./db");
const bcrypt = require("bcryptjs");

async function setup() {
    const password = await bcrypt.hash("student123", 10);
    const email = "test_student@example.com";
    
    db.query("DELETE FROM users WHERE email = ?", [email], (err) => {
        db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        ["Test Student", email, password, "student"], (err, res) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log("Student account created. ID:", res.insertId);
            process.exit(0);
        });
    });
}

setup();
