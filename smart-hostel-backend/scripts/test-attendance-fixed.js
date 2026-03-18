const axios = require("axios");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret_here"; // corrected

async function test() {
    const userId = 10;
    const token = jwt.sign({ id: userId, role: "student" }, JWT_SECRET);
    const today = new Date().toLocaleDateString('en-CA');
    
    try {
        console.log("Posting:", `attendance-${today}`);
        const res = await axios.post("http://localhost:2008/student/mark-attendance", 
        { qrData: `attendance-${today}` }, 
        { headers: { Authorization: `Bearer ${token}` } });
        console.log("Result:", res.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}
test();
