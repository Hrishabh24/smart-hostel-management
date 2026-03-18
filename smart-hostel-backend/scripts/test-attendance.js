const axios = require("axios");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "secretkey"; // from server.js

async function test() {
    const userId = 10; // from setup-student
    const token = jwt.sign({ id: userId, role: "student" }, JWT_SECRET);
    const today = new Date().toLocaleDateString('en-CA');
    
    try {
        console.log("Marking for today:", today);
        const res = await axios.post("http://localhost:2008/student/mark-attendance", 
        { qrData: `attendance-${today}` }, 
        { headers: { Authorization: `Bearer ${token}` } });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Failed:", err.response?.data || err.message);
    }
}

test();
