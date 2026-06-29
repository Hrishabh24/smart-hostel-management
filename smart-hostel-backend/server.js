const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user ? req.user.id : "user"}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP files are allowed."));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Custom Rate Limiter Middleware ---
const rateLimits = new Map();
const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limitData = rateLimits.get(ip);
  if (now > limitData.resetTime) {
    limitData.count = 1;
    limitData.resetTime = now + windowMs;
    return next();
  }

  limitData.count += 1;
  if (limitData.count > maxRequests) {
    return res.status(429).json({ message: "Too many login attempts from this IP, please try again after 15 minutes." });
  }
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimits.entries()) {
    if (now > data.resetTime) rateLimits.delete(ip);
  }
}, 15 * 60 * 1000);

// Helper to format firestore doc date
const formatDate = (val) => {
  if (!val) return new Date().toISOString();
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString();
  return val;
};

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("HELLO FROM HRISHABH SERVER 🔥 (Powered by Firebase Firestore)");
});

/* ================= PUBLIC ACTIVITY (For Home Page Demo) ================= */
app.get("/public/latest-activity", async (req, res) => {
  try {
    const snapshot = await db.collection("attendance").orderBy("created_at", "desc").limit(1).get();
    if (snapshot.empty) return res.json(null);

    const attDoc = snapshot.docs[0].data();
    const userDoc = await db.collection("users").doc(String(attDoc.user_id)).get();
    let name = "Student";
    if (userDoc.exists) {
      name = userDoc.data().name || "Student";
    } else {
      // search user by custom id field
      const userSnap = await db.collection("users").where("id", "==", attDoc.user_id).limit(1).get();
      if (!userSnap.empty) name = userSnap.docs[0].data().name || "Student";
    }

    const firstName = name.split(' ')[0];
    res.json({
      name: firstName + ' ***',
      roomNumber: 'Hidden for privacy',
      created_at: formatDate(attDoc.created_at)
    });
  } catch (err) {
    console.error("Latest activity error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUBLIC FEEDBACK (Web Form) ================= */
app.post("/public/feedback", async (req, res) => {
  const { name, email, rating, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  try {
    const docRef = await db.collection("feedbacks").add({
      name,
      email,
      rating: rating || 5,
      message,
      created_at: new Date().toISOString()
    });
    await docRef.update({ id: docRef.id });
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback submit error:", err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

app.get("/public/feedbacks", async (req, res) => {
  try {
    const snapshot = await db.collection("feedbacks").orderBy("created_at", "desc").limit(6).get();
    const result = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: formatDate(doc.data().created_at)
    }));
    res.json(result);
  } catch (err) {
    console.error("Public feedbacks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN VIEW FEEDBACKS ================= */
app.get("/admin/feedbacks", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("feedbacks").orderBy("created_at", "desc").get();
    const result = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: formatDate(doc.data().created_at)
    }));
    res.json(result);
  } catch (err) {
    console.error("Admin feedbacks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUBLIC LIVE INSIGHTS (For Home Page Demo) ================= */
app.get("/public/live-insights", async (req, res) => {
  try {
    const studentsSnap = await db.collection("users").where("role", "==", "student").get();
    const studentsCount = studentsSnap.size;

    const roomsSnap = await db.collection("rooms").get();
    let availableRooms = 0;
    roomsSnap.forEach(doc => {
      const r = doc.data();
      const cap = Number(r.capacity) || 0;
      const occ = Number(r.occupied) || 0;
      availableRooms += Math.max(0, cap - occ);
    });

    const paymentsSnap = await db.collection("payments").where("status", "==", "success").get();
    let totalPayments = 0;
    paymentsSnap.forEach(doc => {
      totalPayments += Number(doc.data().amount) || 0;
    });

    res.json({
      students: studentsCount,
      rooms: availableRooms,
      payments: totalPayments,
    });
  } catch (err) {
    console.error("Live insights error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const role = "student";
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const existingSnap = await db.collection("users").where("email", "==", normalizedEmail).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const docRef = db.collection("users").doc();
    const userId = docRef.id; // use string doc ID or numeric timestamp fallback

    await docRef.set({
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: "",
      roomNumber: null,
      profilePic: "",
      resetToken: null,
      resetTokenExpiry: null,
      created_at: new Date().toISOString()
    });

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", loginRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const snapshot = await db.collection("users").where("email", "==", normalizedEmail).limit(1).get();
    if (snapshot.empty) return res.status(400).json({ message: "User not found" });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const userId = user.id || userDoc.id;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: userId, role: user.role },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", loginRateLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snapshot.empty) return res.status(400).json({ message: "User not found" });

    const userDoc = snapshot.docs[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();

    await userDoc.ref.update({
      resetToken,
      resetTokenExpiry
    });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}. This link expires in 1 hour.`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Email send error:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.json({ message: "Password reset email sent" });
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const snapshot = await db.collection("users").where("resetToken", "==", token).limit(1).get();
    if (snapshot.empty) return res.status(400).json({ message: "Invalid or expired token" });

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    if (new Date(userData.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userDoc.ref.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= STUDENT PROFILE ================= */

app.get("/student/profile", authMiddleware, async (req, res) => {
  try {
    let userDoc = await db.collection("users").doc(String(req.user.id)).get();
    let userData = null;

    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    } else {
      const snap = await db.collection("users").where("id", "==", req.user.id).limit(1).get();
      if (!snap.empty) {
        userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    }

    if (!userData) return res.status(404).json({ message: "User not found" });

    userData.joinDate = formatDate(userData.created_at);
    userData.hostelName = "ZyrraStay Premium";
    userData.enrollmentStatus = "Active Member";

    if (userData.role === 'student') {
      const attSnap = await db.collection("attendance").where("user_id", "==", req.user.id).get();
      const presentDays = attSnap.size;

      const compSnap = await db.collection("complaints").where("user_id", "==", req.user.id).where("status", "==", "pending").get();
      const activeComplaints = compSnap.size;

      const feeSnap = await db.collection("payments").where("user_id", "==", req.user.id).orderBy("created_at", "desc").limit(1).get();
      const feeStatus = !feeSnap.empty ? feeSnap.docs[0].data().status : 'due';

      userData.presentDays = presentDays;
      userData.complaints = activeComplaints;
      userData.feeStatus = feeStatus;

      const joinedDate = new Date(userData.created_at || Date.now());
      const today = new Date();
      const diffTime = Math.abs(today - joinedDate);
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      let attPerc = ((presentDays / totalDays) * 100).toFixed(1);
      if (attPerc > 100) attPerc = 100;
      userData.attendance = attPerc;
    }

    res.json(userData);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/student/profile", authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const dupCheck = await db.collection("users").where("email", "==", email).get();
    let isDup = false;
    dupCheck.forEach(doc => {
      const d = doc.data();
      if (doc.id !== String(req.user.id) && d.id !== req.user.id) {
        isDup = true;
      }
    });
    if (isDup) return res.status(400).json({ message: "Email already in use" });

    let userRef = db.collection("users").doc(String(req.user.id));
    let docSnap = await userRef.get();
    if (!docSnap.exists) {
      const snap = await db.collection("users").where("id", "==", req.user.id).limit(1).get();
      if (!snap.empty) userRef = snap.docs[0].ref;
    }

    await userRef.update({ name, email, phone: phone || "" });
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.post("/student/upload-profile-pic", authMiddleware, (req, res) => {
  upload.single("profilePic")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || "File upload failed" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = `/uploads/${req.file.filename}`;
    try {
      let userRef = db.collection("users").doc(String(req.user.id));
      let docSnap = await userRef.get();
      if (!docSnap.exists) {
        const snap = await db.collection("users").where("id", "==", req.user.id).limit(1).get();
        if (!snap.empty) userRef = snap.docs[0].ref;
      }
      await userRef.update({ profilePic: imageUrl });
      res.json({ message: "Profile picture updated successfully", profilePic: imageUrl });
    } catch (dbErr) {
      console.error("Upload profile pic error:", dbErr);
      res.status(500).json({ message: "Error saving profile picture" });
    }
  });
});

/* ================= STUDENT ROOM ================= */
app.get("/student/room", authMiddleware, async (req, res) => {
  try {
    let userDoc = await db.collection("users").doc(String(req.user.id)).get();
    let userData = userDoc.exists ? userDoc.data() : null;
    if (!userData) {
      const snap = await db.collection("users").where("id", "==", req.user.id).limit(1).get();
      if (!snap.empty) userData = snap.docs[0].data();
    }

    if (!userData || !userData.roomNumber) {
      return res.status(404).json({ message: "No room assigned" });
    }

    const currentUserName = userData.name;
    const roomNum = userData.roomNumber;

    const roomSnap = await db.collection("rooms").where("room_number", "==", roomNum).limit(1).get();
    const roommatesSnap = await db.collection("users").where("roomNumber", "==", roomNum).where("role", "==", "student").get();

    const allOccupants = roommatesSnap.docs.map(d => d.data().name);
    const roommates = allOccupants.filter(name => name !== currentUserName);
    const occupantsCount = allOccupants.length;

    let capacity = 2;
    let block = "A";
    let floor = "1st";
    let facilities = ["WiFi", "AC", "Study Table", "Attached Bathroom"];

    if (!roomSnap.empty) {
      const r = roomSnap.docs[0].data();
      capacity = r.capacity || capacity;
      block = r.block || block;
      floor = r.floor || floor;
      if (r.facilities) {
        facilities = typeof r.facilities === 'string' ? JSON.parse(r.facilities) : r.facilities;
      }
    }

    res.json({
      roomNumber: roomNum,
      block,
      floor,
      capacity,
      occupants: occupantsCount,
      roommates,
      facilities,
      status: "Occupied"
    });
  } catch (err) {
    console.error("Student room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= COMPLAINT ================= */

app.post("/complaint", authMiddleware, async (req, res) => {
  const { message, category } = req.body;

  try {
    const docRef = db.collection("complaints").doc();
    await docRef.set({
      id: docRef.id,
      user_id: req.user.id,
      message,
      category: category || 'general',
      status: 'pending',
      created_at: new Date().toISOString()
    });
    res.json({ message: "Complaint/Message submitted successfully" });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ message: "Error submitting complaint" });
  }
});

/* ================= LEAVE REQUESTS ================= */

app.post("/student/leave", authMiddleware, async (req, res) => {
  const { reason, startDate, endDate } = req.body;
  if (!reason || !startDate || !endDate) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const docRef = db.collection("leave_requests").doc();
    await docRef.set({
      id: docRef.id,
      user_id: req.user.id,
      reason,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    res.json({ message: "Leave Request Submitted Successfully" });
  } catch (err) {
    console.error("Leave error:", err);
    res.status(500).json({ message: "Error submitting leave request" });
  }
});

app.get("/student/leave-history", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("leave_requests").where("user_id", "==", req.user.id).get();
    const result = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        reason: d.reason,
        startDate: d.start_date,
        endDate: d.end_date,
        status: d.status,
        created_at: formatDate(d.created_at)
      };
    });
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(result);
  } catch (err) {
    console.error("Leave history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= NOTIFICATIONS ================= */

app.get("/student/notifications", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("notifications").where("user_id", "==", req.user.id).get();
    const result = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        message: d.message,
        readStatus: d.read_status || false,
        created_at: formatDate(d.created_at)
      };
    });
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(result);
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= STUDENT COMPLAINTS ================= */

app.get("/student/complaints", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("complaints").where("user_id", "==", req.user.id).get();
    const result = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        message: d.message,
        status: d.status,
        category: d.category,
        created_at: formatDate(d.created_at)
      };
    });
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(result);
  } catch (err) {
    console.error("Student complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL COMPLAINTS (ADMIN) ================= */

app.get("/admin/complaints", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("complaints").get();
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const data = u.data();
      usersMap[u.id] = data.name;
      if (data.id) usersMap[data.id] = data.name;
    });

    const result = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        student: usersMap[d.user_id] || "Unknown Student",
        description: d.message,
        date: formatDate(d.created_at),
        status: d.status,
        category: d.category
      };
    });
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(result);
  } catch (err) {
    console.error("Admin complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= STUDENT MARK ATTENDANCE ================= */

app.post("/student/mark-attendance", authMiddleware, async (req, res) => {
  let { qrData, latitude, longitude } = req.body;
  if (!qrData) return res.status(400).json({ message: "No QR data provided" });

  qrData = String(qrData).trim();
  let decoded;
  try {
    decoded = jwt.verify(qrData, JWT_SECRET);
    if (decoded.type !== "attendance_qr") throw new Error("Invalid token type");
  } catch (err) {
    return res.status(400).json({ message: "Expired or Invalid QR Code. Please scan a fresh one." });
  }

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Location required. Please allow location access." });
  }

  const HOSTEL_LAT = decoded.lat ? parseFloat(decoded.lat) : parseFloat(process.env.HOSTEL_LAT || "28.6139");
  const HOSTEL_LON = decoded.lng ? parseFloat(decoded.lng) : parseFloat(process.env.HOSTEL_LON || "77.2090");
  const ALLOWED_RADIUS = 200;

  const R = 6371e3;
  const r1 = latitude * Math.PI / 180;
  const r2 = HOSTEL_LAT * Math.PI / 180;
  const dp = (HOSTEL_LAT - latitude) * Math.PI / 180;
  const dl = (HOSTEL_LON - longitude) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(r1) * Math.cos(r2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance > ALLOWED_RADIUS) {
    return res.status(400).json({ message: `Access denied. You are ${Math.round(distance)}m away. Must be inside hostel.` });
  }

  const now = new Date();
  const today = now.toLocaleDateString('en-CA');

  try {
    const existing = await db.collection("attendance")
      .where("user_id", "==", req.user.id)
      .where("attendance_date", "==", today)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    const docRef = db.collection("attendance").doc();
    await docRef.set({
      id: docRef.id,
      user_id: req.user.id,
      attendance_date: today,
      created_at: new Date().toISOString()
    });

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Attendance mark error:", err);
    res.status(500).json({ message: "Failed to mark attendance in database" });
  }
});

/* ================= ADMIN GENERATE QR ================= */

app.get("/admin/generate-qr", authMiddleware, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "warden") {
    return res.status(403).json({ message: "Access denied" });
  }
  const { lat, lng } = req.query;
  const qrData = jwt.sign(
    {
      type: "attendance_qr",
      generatedAt: Date.now(),
      lat: lat || null,
      lng: lng || null
    },
    JWT_SECRET,
    { expiresIn: "2m" }
  );
  res.json({ qrData });
});

/* ================= LIVE ATTENDANCE (ADMIN) ================= */

app.get("/admin/attendance-percentage", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const studentsSnap = await db.collection("users").where("role", "==", "student").get();
    const formatted = [];

    for (const doc of studentsSnap.docs) {
      const u = doc.data();
      const uId = u.id || doc.id;
      const attSnap = await db.collection("attendance").where("user_id", "==", uId).get();
      const presentDays = attSnap.size;

      const joinedDate = new Date(u.created_at || Date.now());
      const today = new Date();
      const diffTime = Math.abs(today - joinedDate);
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const percentage = ((presentDays / totalDays) * 100).toFixed(1);

      formatted.push({
        id: uId,
        name: u.name,
        present_days: presentDays,
        totalDays,
        percentage: Math.min(100, parseFloat(percentage))
      });
    }

    res.json(formatted);
  } catch (err) {
    console.error("Admin attendance percentage error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= STUDENT ATTENDANCE PERCENTAGE ================= */

app.get("/student/attendance-percentage", authMiddleware, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];
  const totalDays = now.getDate();

  try {
    const attSnap = await db.collection("attendance").where("user_id", "==", req.user.id).get();
    let presentDays = 0;
    attSnap.forEach(doc => {
      const d = doc.data().attendance_date;
      if (d >= startOfMonth && d <= today) {
        presentDays++;
      }
    });

    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    res.json({ percentage: parseFloat(percentage), presentDays, totalDays });
  } catch (err) {
    console.error("Student attendance percentage error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RAZORPAY ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/razorpay-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

app.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const checkSnap = await db.collection("payments").where("user_id", "==", req.user.id).where("status", "==", "success").limit(1).get();
    if (!checkSnap.empty) {
      return res.status(400).json({ message: "Fees already paid" });
    }

    const today = new Date();
    let lateFees = 0;
    if (today.getDate() > 15) {
      lateFees = (today.getDate() - 15) * 100;
    }
    const finalAmount = 5000 + lateFees;

    const options = {
      amount: finalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Payment error" });
  }
});

app.post("/payment-success", authMiddleware, async (req, res) => {
  const { amount, status } = req.body;
  try {
    const docRef = db.collection("payments").doc();
    await docRef.set({
      id: docRef.id,
      user_id: req.user.id,
      amount,
      status,
      created_at: new Date().toISOString()
    });
    res.json({ message: "Payment recorded successfully" });
  } catch (err) {
    console.error("Payment save error:", err);
    res.status(500).json({ message: "Payment save error" });
  }
});

app.get("/admin/payments", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const paymentsSnap = await db.collection("payments").get();
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const result = paymentsSnap.docs.map(doc => {
      const p = doc.data();
      return {
        name: usersMap[p.user_id] || "Unknown Student",
        amount: p.amount,
        status: p.status,
        created_at: formatDate(p.created_at)
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Admin payments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN PARENTS LIST ================= */

app.get("/admin/parents", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const parentsSnap = await db.collection("users").where("role", "==", "parent").get();
    const pcSnap = await db.collection("parent_child").get();
    const usersSnap = await db.collection("users").get();

    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const pcMap = {};
    pcSnap.forEach(doc => {
      const d = doc.data();
      pcMap[d.parent_id] = d.student_id;
    });

    const formatted = parentsSnap.docs.map(doc => {
      const p = doc.data();
      const pId = p.id || doc.id;
      const studentId = pcMap[pId] || pcMap[doc.id];
      return {
        id: pId,
        name: p.name,
        email: p.email,
        phone: p.phone || "",
        student: studentId ? (usersMap[studentId] || "(unknown)") : "(none)"
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Admin parents error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN STUDENTS LIST ================= */

app.get("/admin/students", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("users").where("role", "==", "student").get();
    const result = snapshot.docs.map(doc => {
      const u = doc.data();
      return {
        id: u.id || doc.id,
        name: u.name,
        email: u.email,
        room: u.roomNumber || null,
        status: 'active'
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Admin students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN ROOMS LIST ================= */

app.get("/admin/rooms", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("rooms").get();
    const result = snapshot.docs.map(doc => {
      const r = doc.data();
      const cap = Number(r.capacity) || 0;
      const occ = Number(r.occupied) || 0;
      return {
        roomNumber: r.room_number || r.roomNumber || doc.id,
        capacity: cap,
        occupied: occ,
        block: r.block || "A",
        floor: r.floor || "1st",
        status: occ >= cap ? "Full" : "Available"
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Admin rooms error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN CREATE ROOM ================= */

app.post("/admin/rooms", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { roomNumber, capacity, block, floor } = req.body;
  if (!roomNumber || !capacity) return res.status(400).json({ message: "Room number and capacity are required" });

  try {
    const roomSnap = await db.collection("rooms").where("room_number", "==", String(roomNumber)).get();
    if (!roomSnap.empty) {
      return res.status(400).json({ message: "Room already exists" });
    }

    await db.collection("rooms").doc(String(roomNumber)).set({
      room_number: String(roomNumber),
      capacity: Number(capacity),
      occupied: 0,
      block: block || "A",
      floor: floor || "1st",
      status: "Available"
    });

    res.json({ message: "Room created successfully" });
  } catch (err) {
    console.error("Create room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN DELETE ROOM ================= */

app.delete("/admin/rooms/:roomNumber", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const roomNumber = req.params.roomNumber;
  try {
    await db.collection("rooms").doc(String(roomNumber)).delete();
    const roomSnap = await db.collection("rooms").where("room_number", "==", String(roomNumber)).get();
    roomSnap.forEach(d => d.ref.delete());

    const studentsSnap = await db.collection("users").where("roomNumber", "==", String(roomNumber)).get();
    const batch = db.batch();
    studentsSnap.forEach(doc => {
      batch.update(doc.ref, { roomNumber: null });
    });
    await batch.commit();

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Delete room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN WARDENS LIST ================= */

app.get("/admin/wardens", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("users").where("role", "==", "warden").get();
    const result = snapshot.docs.map(doc => {
      const u = doc.data();
      return {
        id: u.id || doc.id,
        name: u.name,
        email: u.email,
        phone: u.phone || ""
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Admin wardens error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN ASSIGN ROOM ================= */

app.put("/admin/assign-room", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  const { studentId, roomNumber } = req.body;

  try {
    let userRef = db.collection("users").doc(String(studentId));
    let userSnap = await userRef.get();
    if (!userSnap.exists) {
      const snap = await db.collection("users").where("id", "==", studentId).limit(1).get();
      if (!snap.empty) userRef = snap.docs[0].ref;
    }

    await userRef.update({ roomNumber: String(roomNumber) });

    // recalculate room occupancy counts
    const roomsSnap = await db.collection("rooms").get();
    for (const doc of roomsSnap.docs) {
      const rNum = doc.data().room_number || doc.id;
      const countSnap = await db.collection("users").where("roomNumber", "==", rNum).get();
      await doc.ref.update({ occupied: countSnap.size });
    }

    res.json({ message: "Room assigned successfully" });
  } catch (err) {
    console.error("Assign room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN UNASSIGN ROOM ================= */

app.put("/admin/unassign-room", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  const { studentId, roomNumber } = req.body;

  try {
    let userRef = db.collection("users").doc(String(studentId));
    let userSnap = await userRef.get();
    if (!userSnap.exists) {
      const snap = await db.collection("users").where("id", "==", studentId).limit(1).get();
      if (!snap.empty) userRef = snap.docs[0].ref;
    }

    await userRef.update({ roomNumber: null });

    if (roomNumber) {
      const countSnap = await db.collection("users").where("roomNumber", "==", String(roomNumber)).get();
      const roomDoc = db.collection("rooms").doc(String(roomNumber));
      const rSnap = await roomDoc.get();
      if (rSnap.exists) await roomDoc.update({ occupied: countSnap.size });
    }

    res.json({ message: "Room unassigned successfully" });
  } catch (err) {
    console.error("Unassign room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN FEES LIST ================= */

app.get("/admin/fees", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const paymentsSnap = await db.collection("payments").get();
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const result = paymentsSnap.docs.map(doc => {
      const p = doc.data();
      return {
        id: doc.id,
        ...p,
        studentName: usersMap[p.user_id] || "Unknown Student",
        created_at: formatDate(p.created_at)
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Admin fees error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN CHART DATA ================= */

app.get("/admin/attendance-chart", authMiddleware, (req, res) => {
  const data = [
    { name: 'Mon', present: 45 },
    { name: 'Tue', present: 52 },
    { name: 'Wed', present: 48 },
    { name: 'Thu', present: 61 },
    { name: 'Fri', present: 55 }
  ];
  res.json(data);
});

app.get("/admin/fees-chart", authMiddleware, (req, res) => {
  const data = [
    { name: 'Paid', value: 80 },
    { name: 'Pending', value: 15 },
    { name: 'Unpaid', value: 5 }
  ];
  res.json(data);
});

app.get("/admin/complaints-chart", authMiddleware, (req, res) => {
  const data = [
    { name: 'Electrical', count: 12 },
    { name: 'Plumbing', count: 19 },
    { name: 'Wifi', count: 8 },
    { name: 'Food', count: 15 }
  ];
  res.json(data);
});

/* ================= ADMIN RECENT ACTIVITY ================= */

app.get("/admin/recent-activity", authMiddleware, async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const activities = [];

    const complaintsSnap = await db.collection("complaints").get();
    complaintsSnap.forEach(doc => {
      const d = doc.data();
      activities.push({
        description: `User ${usersMap[d.user_id] || 'Student'} submitted a complaint`,
        date: formatDate(d.created_at),
        status: 'complaint'
      });
    });

    const paymentsSnap = await db.collection("payments").get();
    paymentsSnap.forEach(doc => {
      const d = doc.data();
      activities.push({
        description: `Payment of ${d.amount} from ${usersMap[d.user_id] || 'Student'}`,
        date: formatDate(d.created_at),
        status: d.status || 'success'
      });
    });

    const leaveSnap = await db.collection("leave_requests").get();
    leaveSnap.forEach(doc => {
      const d = doc.data();
      activities.push({
        description: `${usersMap[d.user_id] || 'Student'} requested leave`,
        date: formatDate(d.created_at),
        status: d.status || 'pending'
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(activities.slice(0, 10));
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= WARDEN ENDPOINTS ================= */

app.get("/warden/students", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("users").where("role", "==", "student").get();
    const result = snapshot.docs.map(doc => {
      const u = doc.data();
      return {
        id: u.id || doc.id,
        name: u.name,
        email: u.email,
        roomNumber: u.roomNumber || null,
        phone: u.phone || "",
        status: 'active'
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Warden students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/warden/rooms", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("rooms").get();
    const result = snapshot.docs.map(doc => {
      const r = doc.data();
      const cap = Number(r.capacity) || 0;
      const occ = Number(r.occupied) || 0;
      return {
        roomNumber: r.room_number || r.roomNumber || doc.id,
        capacity: cap,
        occupied: occ,
        block: r.block || "A",
        floor: r.floor || "1st",
        status: occ >= cap ? "Full" : "Available"
      };
    });
    res.json(result);
  } catch (err) {
    console.error("Warden rooms error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/warden/rooms", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const { roomNumber, capacity, block, floor } = req.body;
  if (!roomNumber || !capacity) return res.status(400).json({ message: "Room number and capacity are required" });

  try {
    const roomSnap = await db.collection("rooms").where("room_number", "==", String(roomNumber)).get();
    if (!roomSnap.empty) return res.status(400).json({ message: "Room already exists" });

    await db.collection("rooms").doc(String(roomNumber)).set({
      room_number: String(roomNumber),
      capacity: Number(capacity),
      occupied: 0,
      block: block || "A",
      floor: floor || "1st",
      status: "Available"
    });

    res.json({ message: "Room created successfully" });
  } catch (err) {
    console.error("Warden create room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/warden/rooms/:roomNumber", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const roomNumber = req.params.roomNumber;
  try {
    await db.collection("rooms").doc(String(roomNumber)).delete();
    const studentsSnap = await db.collection("users").where("roomNumber", "==", String(roomNumber)).get();
    const batch = db.batch();
    studentsSnap.forEach(doc => batch.update(doc.ref, { roomNumber: null }));
    await batch.commit();

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Warden delete room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/warden/assign-room", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const { studentId, roomNumber } = req.body;

  try {
    let userRef = db.collection("users").doc(String(studentId));
    let userSnap = await userRef.get();
    if (!userSnap.exists) {
      const snap = await db.collection("users").where("id", "==", studentId).limit(1).get();
      if (!snap.empty) userRef = snap.docs[0].ref;
    }

    await userRef.update({ roomNumber: String(roomNumber) });

    const roomsSnap = await db.collection("rooms").get();
    for (const doc of roomsSnap.docs) {
      const rNum = doc.data().room_number || doc.id;
      const countSnap = await db.collection("users").where("roomNumber", "==", rNum).get();
      await doc.ref.update({ occupied: countSnap.size });
    }

    res.json({ message: "Room assigned successfully" });
  } catch (err) {
    console.error("Warden assign room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/warden/unassign-room", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const { studentId, roomNumber } = req.body;

  try {
    let userRef = db.collection("users").doc(String(studentId));
    let userSnap = await userRef.get();
    if (!userSnap.exists) {
      const snap = await db.collection("users").where("id", "==", studentId).limit(1).get();
      if (!snap.empty) userRef = snap.docs[0].ref;
    }

    await userRef.update({ roomNumber: null });

    if (roomNumber) {
      const countSnap = await db.collection("users").where("roomNumber", "==", String(roomNumber)).get();
      const roomDoc = db.collection("rooms").doc(String(roomNumber));
      const rSnap = await roomDoc.get();
      if (rSnap.exists) await roomDoc.update({ occupied: countSnap.size });
    }

    res.json({ message: "Room unassigned successfully" });
  } catch (err) {
    console.error("Warden unassign room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/warden/attendance", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const today = new Date().toLocaleDateString('en-CA');

  try {
    const studentsSnap = await db.collection("users").where("role", "==", "student").get();
    const result = [];

    for (const doc of studentsSnap.docs) {
      const u = doc.data();
      const uId = u.id || doc.id;
      const attSnap = await db.collection("attendance")
        .where("user_id", "==", uId)
        .where("attendance_date", "==", today)
        .get();

      result.push({
        id: uId,
        name: u.name,
        status: !attSnap.empty ? 'present' : 'absent',
        date: today
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Warden attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/warden/complaints", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  try {
    const snapshot = await db.collection("complaints").get();
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const result = snapshot.docs.map(doc => {
      const c = doc.data();
      return {
        id: doc.id,
        complaint: c.message,
        status: c.status,
        date: formatDate(c.created_at),
        category: c.category,
        student: usersMap[c.user_id] || "Unknown Student"
      };
    });
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(result);
  } catch (err) {
    console.error("Warden complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/warden/complaint/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden" && req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  const { status } = req.body;
  const complaintId = req.params.id;

  try {
    await db.collection("complaints").doc(String(complaintId)).update({ status });
    res.json({ message: "Complaint status updated" });
  } catch (err) {
    console.error("Update complaint status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/warden/leave-requests", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  try {
    const usersSnap = await db.collection("users").get();
    const usersMap = {};
    usersSnap.forEach(u => {
      const d = u.data();
      usersMap[u.id] = d.name;
      if (d.id) usersMap[d.id] = d.name;
    });

    const result = [];

    const studentLeaves = await db.collection("leave_requests").get();
    studentLeaves.forEach(doc => {
      const l = doc.data();
      result.push({
        id: doc.id,
        reason: l.reason,
        startDate: l.start_date,
        endDate: l.end_date,
        status: l.status,
        student: usersMap[l.user_id] || "Student",
        type: 'student'
      });
    });

    const parentLeaves = await db.collection("parent_leave_requests").get();
    parentLeaves.forEach(doc => {
      const l = doc.data();
      result.push({
        id: doc.id,
        reason: l.reason,
        startDate: l.start_date,
        endDate: l.end_date,
        status: l.status,
        student: usersMap[l.student_id] || "Student",
        type: 'parent'
      });
    });

    result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    res.json(result);
  } catch (err) {
    console.error("Warden leave requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/warden/leave-requests/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const { status, type } = req.body;
  const requestId = req.params.id;

  try {
    const collectionName = type === 'parent' ? 'parent_leave_requests' : 'leave_requests';
    await db.collection(collectionName).doc(String(requestId)).update({ status });
    res.json({ message: `Leave request ${status} successfully` });
  } catch (err) {
    console.error("Update leave request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PAYMENT STATUS (STUDENT) ================= */

app.get("/payment-status", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("payments")
      .where("user_id", "==", req.user.id)
      .get();

    if (snapshot.empty) {
      return res.json({ paid: false });
    }

    const docs = snapshot.docs.map(d => d.data());
    docs.sort((a, b) => new Date(formatDate(b.created_at)) - new Date(formatDate(a.created_at)));
    const payment = docs[0];

    res.json({
      paid: payment.status === "success",
      amount: payment.amount,
      date: formatDate(payment.created_at),
    });
  } catch (err) {
    console.error("Payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PARENT-CHILD RELATIONSHIP SUPPORT ================= */

async function getChildId(parentId) {
  const snapshot = await db.collection("parent_child").where("parent_id", "==", parentId).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().student_id;
}

/* ================= ADMIN ASSIGN PARENT ================= */

app.post("/admin/assign-parent", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  const { parentId, studentId } = req.body;
  if (!parentId || !studentId) return res.status(400).json({ message: "parentId and studentId required" });

  try {
    const existing = await db.collection("parent_child")
      .where("parent_id", "==", parentId)
      .where("student_id", "==", studentId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Mapping already exists" });
    }

    await db.collection("parent_child").add({
      parent_id: parentId,
      student_id: studentId,
      created_at: new Date().toISOString()
    });

    res.json({ message: "Parent assigned successfully" });
  } catch (err) {
    console.error("Assign parent error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PARENT LINK STUDENT (PARENT) ================= */

app.post("/parent/link-student", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });
  const { studentEmail } = req.body;
  if (!studentEmail) return res.status(400).json({ message: "studentEmail is required" });

  try {
    const studentSnap = await db.collection("users")
      .where("email", "==", String(studentEmail).trim().toLowerCase())
      .where("role", "==", "student")
      .limit(1)
      .get();

    if (studentSnap.empty) return res.status(404).json({ message: "Student not found" });

    const studentDoc = studentSnap.docs[0];
    const studentId = studentDoc.data().id || studentDoc.id;

    const existing = await db.collection("parent_child")
      .where("parent_id", "==", req.user.id)
      .where("student_id", "==", studentId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Parent already linked to this student" });
    }

    await db.collection("parent_child").add({
      parent_id: req.user.id,
      student_id: studentId,
      created_at: new Date().toISOString()
    });

    res.json({ message: "Parent linked to student successfully" });
  } catch (err) {
    console.error("Parent link student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/child", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });
  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.json({ name: "No child linked" });

    let childDoc = await db.collection("users").doc(String(childId)).get();
    let name = childDoc.exists ? childDoc.data().name : null;
    if (!name) {
      const snap = await db.collection("users").where("id", "==", childId).limit(1).get();
      if (!snap.empty) name = snap.docs[0].data().name;
    }

    res.json({ name: name || "Unknown" });
  } catch (err) {
    console.error("Parent child error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/attendance-percentage", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const totalDays = 30;
    const attSnap = await db.collection("attendance").where("user_id", "==", childId).get();
    const presentDays = attSnap.size;
    const percentage = ((presentDays / totalDays) * 100).toFixed(2);

    res.json({ percentage: parseFloat(percentage), presentDays, totalDays });
  } catch (err) {
    console.error("Parent attendance percentage error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/payment-status", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const snapshot = await db.collection("payments").where("user_id", "==", childId).get();
    if (snapshot.empty) return res.json({ paid: false });

    const docs = snapshot.docs.map(d => d.data());
    docs.sort((a, b) => new Date(formatDate(b.created_at)) - new Date(formatDate(a.created_at)));
    const payment = docs[0];

    res.json({
      paid: payment.status === "success",
      amount: payment.amount,
      date: formatDate(payment.created_at),
    });
  } catch (err) {
    console.error("Parent payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/parent/leave", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });
  const { reason, startDate, endDate } = req.body;
  if (!reason || !startDate || !endDate) return res.status(400).json({ message: "Please fill all fields" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const docRef = db.collection("parent_leave_requests").doc();
    await docRef.set({
      id: docRef.id,
      parent_id: req.user.id,
      student_id: childId,
      reason,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({ message: "Leave Request Submitted Successfully" });
  } catch (err) {
    console.error("Parent leave error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/leave-history", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const result = [];
    const studentLeaves = await db.collection("leave_requests").where("user_id", "==", childId).get();
    studentLeaves.forEach(doc => {
      const d = doc.data();
      result.push({
        id: doc.id,
        reason: d.reason,
        startDate: d.start_date,
        endDate: d.end_date,
        status: d.status,
        created_at: formatDate(d.created_at),
        requestedBy: 'student'
      });
    });

    const parentLeaves = await db.collection("parent_leave_requests").where("student_id", "==", childId).get();
    parentLeaves.forEach(doc => {
      const d = doc.data();
      result.push({
        id: doc.id,
        reason: d.reason,
        startDate: d.start_date,
        endDate: d.end_date,
        status: d.status,
        created_at: formatDate(d.created_at),
        requestedBy: 'parent'
      });
    });

    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(result);
  } catch (err) {
    console.error("Parent leave history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/notifications", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const snapshot = await db.collection("notifications").where("user_id", "==", childId).get();
    const result = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        message: d.message,
        readStatus: d.read_status || false,
        created_at: formatDate(d.created_at)
      };
    });
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(result);
  } catch (err) {
    console.error("Parent notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= START SERVER ================= */

app.listen(2008, () => {
  console.log("Server running on port 2008 🚀 (Firebase Firestore Database active)");
});