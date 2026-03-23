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
const upload = multer({ storage });

// keep secret in environment variable for flexibility
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

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("HELLO FROM HRISHABH SERVER 🔥");
});

/* ================= PUBLIC ACTIVITY (For Home Page Demo) ================= */
app.get("/public/latest-activity", (req, res) => {
  const query = `
    SELECT u.name, u.roomNumber, a.created_at
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results[0] || null);
  });
});

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(query, [name, normalizedEmail, hashedPassword, role], (err) => {
    if (err) return res.status(500).json({ message: "Error registering user" });

    res.json({ message: "User registered successfully" });
  });
});

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [normalizedEmail], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  });
});

/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  const query = "SELECT id FROM users WHERE email = ?";

  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0)
      return res.status(400).json({ message: "User not found" });

    const userId = result[0].id;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    const updateQuery = "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?";
    db.query(updateQuery, [resetToken, resetTokenExpiry, userId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}. This link expires in 1 hour.`
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).json({ message: "Error sending email" });

        res.json({ message: "Password reset email sent" });
      });
    });
  });
});

/* ================= RESET PASSWORD ================= */

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const query = "SELECT id FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()";

  db.query(query, [token], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    const userId = result[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?";
    db.query(updateQuery, [hashedPassword, userId], (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      res.json({ message: "Password reset successfully" });
    });
  });
});

/* ================= STUDENT PROFILE ================= */

app.get("/student/profile", authMiddleware, (req, res) => {
  const query = "SELECT id, name, email, phone, roomNumber, profilePic, role, created_at FROM users WHERE id = ?";

  db.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    const player = result[0];

    // Standard fields for all roles
    player.joinDate = player.created_at;
    player.hostelName = "ZyrraStay Premium"; // Default hostel name
    player.enrollmentStatus = "Active Member";

    // If student, fetch real stats
    if (player.role === 'student') {
      const attQuery = "SELECT COUNT(*) as present_days FROM attendance WHERE user_id = ?";
      const compQuery = "SELECT COUNT(*) as active_complaints FROM complaints WHERE user_id = ? AND status = 'pending'";
      const feeQuery = "SELECT status FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";

      db.query(attQuery, [player.id], (err, attRes) => {
        db.query(compQuery, [player.id], (err, compRes) => {
          db.query(feeQuery, [player.id], (err, feeRes) => {
            player.presentDays = attRes ? attRes[0].present_days : 0;
            player.complaints = compRes ? compRes[0].active_complaints : 0;
            player.feeStatus = feeRes && feeRes.length > 0 ? feeRes[0].status : 'due';

            // Calculate % since joined (approximate)
            const joinedDate = new Date(player.created_at);
            const today = new Date();
            const diffTime = Math.abs(today - joinedDate);
            const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            player.attendance = ((player.presentDays / totalDays) * 100).toFixed(1);
            if (player.attendance > 100) player.attendance = 100;

            res.json(player);
          });
        });
      });
    } else {
      res.json(player);
    }
  });
});

app.put("/student/profile", authMiddleware, (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const query = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?";
  db.query(query, [name, email, phone, req.user.id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(500).json({ message: "Error updating profile" });
    }

    res.json({ message: "Profile updated successfully" });
  });
});

app.post("/student/upload-profile-pic", authMiddleware, upload.single("profilePic"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const query = "UPDATE users SET profilePic = ? WHERE id = ?";
  db.query(query, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: "Error saving profile picture" });
    res.json({ message: "Profile picture updated successfully", profilePic: imageUrl });
  });
});

/* ================= STUDENT ROOM ================= */
app.get("/student/room", authMiddleware, (req, res) => {
  const userQuery = "SELECT name, roomNumber FROM users WHERE id = ?";
  db.query(userQuery, [req.user.id], (err, usersRes) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (usersRes.length === 0 || !usersRes[0].roomNumber) {
      return res.status(404).json({ message: "No room assigned" });
    }
    const currentUserName = usersRes[0].name;
    const roomNum = usersRes[0].roomNumber;

    const roomQuery = "SELECT capacity, block, floor, facilities FROM rooms WHERE room_number = ?";
    db.query(roomQuery, [roomNum], (err, roomsRes) => {
      if (err) return res.status(500).json({ message: "Server error" });

      const roommatesQuery = "SELECT name FROM users WHERE roomNumber = ? AND role = 'student'";
      db.query(roommatesQuery, [roomNum], (err, matesRes) => {
        if (err) return res.status(500).json({ message: "Server error" });

        const allOccupants = matesRes.map(m => m.name);
        const roommates = allOccupants.filter(name => name !== currentUserName);
        const occupantsCount = allOccupants.length;

        let capacity = 2;
        let block = "A";
        let floor = "1st";
        let facilities = ["WiFi", "AC", "Study Table", "Attached Bathroom"];

        if (roomsRes.length > 0) {
          const r = roomsRes[0];
          capacity = r.capacity || capacity;
          block = r.block || block;
          floor = r.floor || floor;
          try {
            if (r.facilities) {
              facilities = typeof r.facilities === 'string' ? JSON.parse(r.facilities) : r.facilities;
            }
          } catch (e) { }
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
      });
    });
  });
});


/* ================= COMPLAINT ================= */

app.post("/complaint", authMiddleware, (req, res) => {
  const { message, category } = req.body;

  const query = "INSERT INTO complaints (user_id, message, category) VALUES (?, ?, ?)";

  db.query(query, [req.user.id, message, category || 'general'], (err) => {
    if (err)
      return res.status(500).json({ message: "Error submitting complaint" });

    res.json({ message: "Complaint/Message submitted successfully" });
  });
});

/* ================= LEAVE REQUESTS ================= */

app.post("/student/leave", authMiddleware, (req, res) => {
  const { reason, startDate, endDate } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const query = "INSERT INTO leave_requests (user_id, reason, start_date, end_date, status) VALUES (?, ?, ?, ?, 'pending')";
  db.query(query, [req.user.id, reason, startDate, endDate], (err) => {
    if (err) return res.status(500).json({ message: "Error submitting leave request" });
    res.json({ message: "Leave Request Submitted Successfully" });
  });
});

app.get("/student/leave-history", authMiddleware, (req, res) => {
  const query = "SELECT id, reason, start_date as startDate, end_date as endDate, status, created_at FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC";
  db.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

/* ================= NOTIFICATIONS ================= */

app.get("/student/notifications", authMiddleware, (req, res) => {
  const query = "SELECT id, message, read_status as readStatus, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
  db.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});


/* ================= STUDENT COMPLAINTS ================= */

app.get("/student/complaints", authMiddleware, (req, res) => {
  const query =
    "SELECT message, status, created_at, category FROM complaints WHERE user_id = ? ORDER BY created_at DESC";

  db.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json(result);
  });
});

/* ================= GET ALL COMPLAINTS (ADMIN) ================= */

app.get("/admin/complaints", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const query = `
    SELECT c.id, u.name as student, c.message as description, c.created_at as date, c.status, c.category
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json(result);
  });
});

/* ================= STUDENT MARK ATTENDANCE ================= */

app.post("/student/mark-attendance", authMiddleware, (req, res) => {
  let { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ message: "No QR data provided" });
  }

  // Trim and normalize the incoming QR data just in case
  qrData = String(qrData).trim();

  // Get today's date in YYYY-MM-DD format consistently
  const now = new Date();
  const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

  console.log(`[ATTENDANCE] User ID ${req.user.id} attempting to mark attendance.`);
  console.log(`[ATTENDANCE] Received: "${qrData}", Expected: "attendance-${today}"`);

  // Check if QR data is valid (matches today's date)
  if (qrData !== `attendance-${today}`) {
    return res.status(400).json({ message: "Invalid or expired QR code" });
  }

  // Check if already marked today
  const checkQuery = "SELECT id FROM attendance WHERE user_id = ? AND attendance_date = ?";
  db.query(checkQuery, [req.user.id, today], (err, result) => {
    if (err) {
      console.error("[ATTENDANCE] DB Check Error:", err);
      return res.status(500).json({ message: "Server error during attendance check" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    // Mark attendance
    const insertQuery = "INSERT INTO attendance (user_id, attendance_date) VALUES (?, ?)";
    db.query(insertQuery, [req.user.id, today], (err) => {
      if (err) {
        console.error("[ATTENDANCE] DB Insert Error:", err);
        return res.status(500).json({ message: "Failed to mark attendance in database" });
      }

      console.log(`[ATTENDANCE] Success: Attendance marked for User ID ${req.user.id} on ${today}`);
      res.json({ message: "Attendance marked successfully" });
    });
  });
});

/* ================= ADMIN GENERATE QR ================= */

app.get("/admin/generate-qr", authMiddleware, (req, res) => {
  // Note: Restricting to admin/warden is ideal for production.
  // We allow students to view it here to ensure the system can be tested/demoed easily.
  /* if (req.user.role !== "admin" && req.user.role !== "warden") {
    return res.status(403).json({ message: "Access denied" });
  } */

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const qrData = `attendance-${today}`;

  res.json({ qrData });
});

/* ================= LIVE ATTENDANCE (ADMIN) ================= */

app.get("/admin/attendance-percentage", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const query = `
    SELECT id, name, created_at,
    (SELECT COUNT(*) FROM attendance WHERE user_id = users.id) AS present_days
    FROM users
    WHERE role = 'student'
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const formatted = result.map(r => {
      const joinedDate = new Date(r.created_at);
      const today = new Date();
      const diffTime = Math.abs(today - joinedDate);
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const percentage = ((r.present_days / totalDays) * 100).toFixed(1);
      return {
        id: r.id,
        name: r.name,
        present_days: r.present_days,
        totalDays,
        percentage: Math.min(100, parseFloat(percentage))
      };
    });

    res.json(formatted);
  });
});

/* ================= STUDENT ATTENDANCE PERCENTAGE ================= */

app.get("/student/attendance-percentage", authMiddleware, (req, res) => {
  // Use current month for attendance %, meaning 1st to today
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];
  const totalDays = now.getDate();

  const query = `
    SELECT COUNT(id) AS present_days
    FROM attendance
    WHERE user_id = ? AND attendance_date BETWEEN ? AND ?
  `;

  db.query(query, [req.user.id, startOfMonth, today], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const presentDays = result[0].present_days;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({ percentage: parseFloat(percentage), presentDays, totalDays });
  });
});

/* ================= RAZORPAY ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= GET RAZORPAY KEY ================= */

app.get("/razorpay-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

/* ================= CREATE ORDER ================= */

app.post("/create-order", authMiddleware, async (req, res) => {
  // don't allow new order if user already paid successfully
  const checkQuery =
    "SELECT id FROM payments WHERE user_id = ? AND status = 'success' LIMIT 1";
  db.query(checkQuery, [req.user.id], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length > 0) {
      return res.status(400).json({ message: "Fees already paid" });
    }

    const options = {
      amount: 5000 * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    try {
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Payment error" });
    }
  });
});

/* ================= SAVE PAYMENT ================= */

app.post("/payment-success", authMiddleware, (req, res) => {
  const { amount, status } = req.body;

  const query =
    "INSERT INTO payments (user_id, amount, status) VALUES (?, ?, ?)";

  db.query(query, [req.user.id, amount, status], (err) => {
    if (err) return res.status(500).json({ message: "Payment save error" });

    res.json({ message: "Payment recorded successfully" });
  });
});

/* ================= PAYMENT HISTORY (ADMIN) ================= */

app.get("/admin/payments", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const query = `
    SELECT users.name, payments.amount, payments.status, payments.created_at
    FROM payments
    JOIN users ON payments.user_id = users.id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json(result);
  });
});

/* ================= ADMIN PARENTS LIST ================= */

app.get("/admin/parents", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const query = `
    SELECT p.id, p.name, p.email, p.phone,
      s.name AS student_name
    FROM users p
    LEFT JOIN parent_child pc ON pc.parent_id = p.id
    LEFT JOIN users s ON s.id = pc.student_id
    WHERE p.role = 'parent'
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    // rename fields to match frontend expectations
    const formatted = result.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || "",
      student: r.student_name || "(none)"
    }));
    res.json(formatted);
  });
});

/* ================= ADMIN STUDENTS LIST ================= */

app.get("/admin/students", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const query = "SELECT id, name, email, roomNumber as room, 'active' as status FROM users WHERE role = 'student'";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

/* ================= ADMIN ROOMS LIST ================= */

app.get("/admin/rooms", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const query = "SELECT room_number as roomNumber, capacity, occupied, block, floor, status FROM (SELECT r.*, CASE WHEN occupied >= capacity THEN 'Full' ELSE 'Available' END as status FROM rooms r) t";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

/* ================= ADMIN CREATE ROOM ================= */
app.post("/admin/rooms", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { roomNumber, capacity, block, floor } = req.body;
  if (!roomNumber || !capacity) return res.status(400).json({ message: "Room number and capacity are required" });

  const query = "INSERT INTO rooms (room_number, capacity, block, floor) VALUES (?, ?, ?, ?)";
  db.query(query, [roomNumber, capacity, block, floor], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Room already exists" });
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Room created successfully" });
  });
});

/* ================= ADMIN DELETE ROOM ================= */
app.delete("/admin/rooms/:roomNumber", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const roomNumber = req.params.roomNumber;
  db.query("DELETE FROM rooms WHERE room_number = ?", [roomNumber], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    // Unassign students from this room
    db.query("UPDATE users SET roomNumber = NULL WHERE roomNumber = ?", [roomNumber], () => {
      res.json({ message: "Room deleted successfully" });
    });
  });
});

/* ================= ADMIN WARDENS LIST ================= */

app.get("/admin/wardens", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const query = "SELECT id, name, email, phone FROM users WHERE role = 'warden'";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

/* ================= ADMIN ASSIGN ROOM ================= */

app.put("/admin/assign-room", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { studentId, roomNumber } = req.body;

  const updateQuery = "UPDATE users SET roomNumber = ? WHERE id = ?";
  db.query(updateQuery, [roomNumber, studentId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    // Update occupied count for all affected rooms
    const updateRoomCount = "UPDATE rooms r SET occupied = (SELECT COUNT(*) FROM users u WHERE u.roomNumber = r.room_number) WHERE room_number IN (SELECT roomNumber FROM users WHERE id = ?) OR room_number = ?";
    db.query(updateRoomCount, [studentId, roomNumber], () => {
      // Refresh all just to be safe
      db.query("UPDATE rooms r SET occupied = (SELECT COUNT(*) FROM users u WHERE u.roomNumber = r.room_number)", () => {
        res.json({ message: "Room assigned successfully" });
      });
    });
  });
});

/* ================= ADMIN UNASSIGN ROOM ================= */

app.put("/admin/unassign-room", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { studentId, roomNumber } = req.body;

  const updateQuery = "UPDATE users SET roomNumber = NULL WHERE id = ?";
  db.query(updateQuery, [studentId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (roomNumber) {
      db.query("UPDATE rooms r SET occupied = (SELECT COUNT(*) FROM users u WHERE u.roomNumber = r.room_number) WHERE room_number = ?", [roomNumber], () => {
        res.json({ message: "Room unassigned successfully" });
      });
    } else {
      res.json({ message: "Room unassigned successfully" });
    }
  });
});

/* ================= ADMIN FEES LIST ================= */

app.get("/admin/fees", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const query = "SELECT p.*, u.name as studentName FROM payments p JOIN users u ON p.user_id = u.id";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
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

app.get("/admin/recent-activity", authMiddleware, (req, res) => {
  const query = `
    (SELECT CONCAT('User ', name, ' submitted a complaint') as description, created_at as date, 'complaint' as status FROM complaints JOIN users ON complaints.user_id = users.id)
    UNION
    (SELECT CONCAT('Payment of ', amount, ' from ', name) as description, created_at as date, status FROM payments JOIN users ON payments.user_id = users.id)
    UNION
    (SELECT CONCAT(name, ' requested leave') as description, created_at as date, status FROM leave_requests JOIN users ON leave_requests.user_id = users.id)
    ORDER BY date DESC LIMIT 10
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});


/* ================= WARDEN ENDPOINTS ================= */

app.get("/warden/students", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const query = "SELECT id, name, email, roomNumber, phone, 'active' as status FROM users WHERE role = 'student'";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

app.get("/warden/rooms", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const query = "SELECT room_number as roomNumber, capacity, occupied, block, floor, status FROM (SELECT r.*, CASE WHEN occupied >= capacity THEN 'Full' ELSE 'Available' END as status FROM rooms r) t";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

app.post("/warden/rooms", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const { roomNumber, capacity, block, floor } = req.body;
  if (!roomNumber || !capacity) return res.status(400).json({ message: "Room number and capacity are required" });

  const query = "INSERT INTO rooms (room_number, capacity, block, floor) VALUES (?, ?, ?, ?)";
  db.query(query, [roomNumber, capacity, block, floor], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Room already exists" });
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Room created successfully" });
  });
});

app.delete("/warden/rooms/:roomNumber", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const roomNumber = req.params.roomNumber;
  db.query("DELETE FROM rooms WHERE room_number = ?", [roomNumber], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    // Unassign students from this room
    db.query("UPDATE users SET roomNumber = NULL WHERE roomNumber = ?", [roomNumber], () => {
      res.json({ message: "Room deleted successfully" });
    });
  });
});

app.put("/warden/assign-room", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const { studentId, roomNumber } = req.body;

  const updateQuery = "UPDATE users SET roomNumber = ? WHERE id = ?";
  db.query(updateQuery, [roomNumber, studentId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    db.query("UPDATE rooms r SET occupied = (SELECT COUNT(*) FROM users u WHERE u.roomNumber = r.room_number)", () => {
      res.json({ message: "Room assigned successfully" });
    });
  });
});

app.put("/warden/unassign-room", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });

  const { studentId, roomNumber } = req.body;

  const updateQuery = "UPDATE users SET roomNumber = NULL WHERE id = ?";
  db.query(updateQuery, [studentId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (roomNumber) {
      db.query("UPDATE rooms r SET occupied = (SELECT COUNT(*) FROM users u WHERE u.roomNumber = r.room_number) WHERE room_number = ?", [roomNumber], () => {
        res.json({ message: "Room unassigned successfully" });
      });
    } else {
      res.json({ message: "Room unassigned successfully" });
    }
  });
});

app.get("/warden/attendance", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const today = new Date().toLocaleDateString('en-CA');
  const query = `
    SELECT u.id, u.name, 
    CASE WHEN a.id IS NOT NULL THEN 'present' ELSE 'absent' END as status,
    ? as date
    FROM users u
    LEFT JOIN attendance a ON u.id = a.user_id AND a.attendance_date = ?
    WHERE u.role = 'student'
  `;
  db.query(query, [today, today], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

app.get("/warden/complaints", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const query = "SELECT c.id, c.message as complaint, c.status, c.created_at as date, c.category, u.name as student FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

app.put("/warden/complaint/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "warden" && req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  const { status } = req.body;
  const complaintId = req.params.id;
  db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, complaintId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json({ message: "Complaint status updated" });
  });
});

app.get("/warden/leave-requests", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const query = `
    SELECT l.id, l.reason, l.start_date as startDate, l.end_date as endDate, l.status, u.name as student, 'student' as type 
    FROM leave_requests l JOIN users u ON l.user_id = u.id 
    UNION 
    SELECT p.id, p.reason, p.start_date as startDate, p.end_date as endDate, p.status, u.name as student, 'parent' as type 
    FROM parent_leave_requests p JOIN users u ON p.student_id = u.id 
    ORDER BY startDate DESC
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

app.put("/warden/leave-requests/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "warden") return res.status(403).json({ message: "Access denied" });
  const { status, type } = req.body;
  const requestId = req.params.id;

  const table = type === 'parent' ? 'parent_leave_requests' : 'leave_requests';
  const query = `UPDATE ${table} SET status = ? WHERE id = ?`;

  db.query(query, [status, requestId], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json({ message: `Leave request ${status} successfully` });
  });
});


/* ================= PAYMENT STATUS (STUDENT) ================= */

app.get("/payment-status", authMiddleware, (req, res) => {
  const query =
    "SELECT amount, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";

  db.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.json({ paid: false });
    }

    const payment = result[0];
    res.json({
      paid: payment.status === "success",
      amount: payment.amount,
      date: payment.created_at,
    });
  });
});

/* ================= PARENT-CHILD RELATIONSHIP SUPPORT ================= */

// ensure mapping table exists when server starts
const parentChildTableSql = `
CREATE TABLE IF NOT EXISTS parent_child (
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  PRIMARY KEY (parent_id, student_id),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
)`;
db.query(parentChildTableSql, (err) => {
  if (err) console.error("Failed to create parent_child table", err);
});

// ensure attendance table exists when server starts
const attendanceTableSql = `
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_date (user_id, attendance_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;
db.query(attendanceTableSql, (err) => {
  if (err) console.error("Failed to create attendance table", err);
});

// ensure parent_leave_requests table exists
const parentLeaveTableSql = `
CREATE TABLE IF NOT EXISTS parent_leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
)`;
db.query(parentLeaveTableSql, (err) => {
  if (err) console.error("Failed to create parent_leave_requests table", err);
});

// helper to get child id for the logged-in parent
function getChildId(parentId) {
  return new Promise((resolve, reject) => {
    const q = "SELECT student_id FROM parent_child WHERE parent_id = ? LIMIT 1";
    db.query(q, [parentId], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return resolve(null);
      resolve(result[0].student_id);
    });
  });
}

/* ================= ADMIN ASSIGN PARENT ================= */

app.post("/admin/assign-parent", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const { parentId, studentId } = req.body;
  if (!parentId || !studentId)
    return res.status(400).json({ message: "parentId and studentId required" });

  const insert =
    "INSERT INTO parent_child (parent_id, student_id) VALUES (?, ?)";

  db.query(insert, [parentId, studentId], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Mapping already exists" });
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Parent assigned successfully" });
  });
});

/* ================= PARENT LINK STUDENT (PARENT) ================= */

app.post("/parent/link-student", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  const { studentEmail } = req.body;
  if (!studentEmail)
    return res.status(400).json({ message: "studentEmail is required" });

  const studentQuery = "SELECT id FROM users WHERE email = ? AND role = 'student' LIMIT 1";
  db.query(studentQuery, [studentEmail], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const studentId = result[0].id;
    const insert = "INSERT INTO parent_child (parent_id, student_id) VALUES (?, ?)";

    db.query(insert, [req.user.id, studentId], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "Parent already linked to this student" });
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ message: "Parent linked to student successfully" });
    });
  });
});

app.get("/parent/child", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).json({ message: "Access denied" });
  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.json({ name: "No child linked" });
    db.query("SELECT name FROM users WHERE id = ?", [childId], (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ name: result[0]?.name || "Unknown" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/attendance-percentage", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const totalDays = 30;
    const query = `
      SELECT COUNT(id) AS present_days
      FROM attendance
      WHERE user_id = ?
    `;

    db.query(query, [childId], (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      const presentDays = result[0].present_days;
      const percentage = ((presentDays / totalDays) * 100).toFixed(2);
      res.json({ percentage: parseFloat(percentage), presentDays, totalDays });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/payment-status", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const query =
      "SELECT amount, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";

    db.query(query, [childId], (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (result.length === 0) {
        return res.json({ paid: false });
      }

      const payment = result[0];
      res.json({
        paid: payment.status === "success",
        amount: payment.amount,
        date: payment.created_at,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/parent/leave", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  const { reason, startDate, endDate } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const query = "INSERT INTO parent_leave_requests (parent_id, student_id, reason, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, 'pending')";
    db.query(query, [req.user.id, childId, reason, startDate, endDate], (err) => {
      if (err) return res.status(500).json({ message: "Error submitting leave request" });
      res.json({ message: "Leave Request Submitted Successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/leave-history", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const query = `
      SELECT reason, start_date as startDate, end_date as endDate, status, created_at, 'student' as requestedBy 
      FROM leave_requests WHERE user_id = ? 
      UNION 
      SELECT reason, start_date as startDate, end_date as endDate, status, created_at, 'parent' as requestedBy 
      FROM parent_leave_requests WHERE student_id = ? 
      ORDER BY created_at DESC
    `;

    db.query(query, [childId, childId], (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(result);
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/parent/notifications", authMiddleware, async (req, res) => {
  if (req.user.role !== "parent")
    return res.status(403).json({ message: "Access denied" });

  try {
    const childId = await getChildId(req.user.id);
    if (!childId) return res.status(404).json({ message: "No child assigned" });

    const query =
      "SELECT message, read_status as readStatus, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    db.query(query, [childId], (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(result);
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});