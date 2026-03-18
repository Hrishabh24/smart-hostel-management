const axios = require("axios");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret_here"; // from .env

async function test() {
    const userId = 1; // from setup-student
    const token = jwt.sign({ id: userId, role: "admin" }, JWT_SECRET);
    
    try {
        const res = await axios.get("http://localhost:2008/admin/generate-qr", 
        { headers: { Authorization: `Bearer ${token}` } });
        console.log("QR Data from backend:", res.data.qrData);
    } catch (err) {
        console.error("Failed:", err.response?.data || err.message);
    }
}

test();
