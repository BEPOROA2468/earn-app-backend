const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// ✅ Get tasks list
exports.getTasks = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Claim task (add points)
exports.claimTask = functions.https.onRequest(async (req, res) => {
  const { uid, taskId } = req.body;
  if (!uid || !taskId) return res.status(400).json({ error: "Invalid data" });

  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return res.status(404).json({ error: "User not found" });

  const points = (userDoc.data().points || 0) + 10; // fixed reward demo
  await userRef.update({ points });
  res.json({ success: true, newPoints: points });
});

// ✅ Withdraw request
exports.withdraw = functions.https.onRequest(async (req, res) => {
  const { uid, method, account, points } = req.body;
  if (!uid || !method || !account || !points) return res.status(400).json({ error: "Invalid data" });

  const request = {
    uid,
    method,
    account,
    points,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("withdrawRequests").add(request);
  res.json({ success: true, message: "Withdraw request submitted" });
});
