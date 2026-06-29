const db = require("../db");
const bcrypt = require("bcryptjs");

async function setup() {
    try {
        const password = await bcrypt.hash("student123", 10);
        const email = "test_student@example.com";
        
        const existingSnap = await db.collection("users").where("email", "==", email).get();
        existingSnap.forEach(doc => doc.ref.delete());

        const docRef = db.collection("users").doc();
        await docRef.set({
            id: docRef.id,
            name: "Test Student",
            email,
            password,
            role: "student",
            created_at: new Date().toISOString()
        });

        console.log("Student account created. ID:", docRef.id);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

setup();
