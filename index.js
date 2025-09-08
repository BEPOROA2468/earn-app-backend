const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin initialize
const serviceAccount = require("./serviceAccountKey.json"); // 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// API routes
app.get("/", (req, res) => {
  res.send("Backend is running on Render 🚀");
});

// Get tasks
app.get("/getTasks", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claim task
app.post("/claimTask", async (req, res) => {
  const { userId, taskId } = req.body;
  try {
    await db.collection("claims").add({ userId, taskId, createdAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw
app.post("/withdraw", async (req, res) => {
  const { userId, amount, method } = req.body;
  try {
    await db.collection("withdrawals").add({ userId, amount, method, status: "pending", createdAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Render 
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
