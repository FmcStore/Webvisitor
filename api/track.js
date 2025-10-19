import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAempQGHy4Akq_n-TWCi9QUwv4pMccNDyU",
  authDomain: "web-traffic-realtime.firebaseapp.com",
  databaseURL: "https://web-traffic-realtime-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-traffic-realtime",
  storageBucket: "web-traffic-realtime.firebasestorage.app",
  messagingSenderId: "903367581475",
  appId: "1:903367581475:web:73044ffed257608a2e3696",
  measurementId: "G-FHR1ZRVVBM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";
    const ua = req.headers["user-agent"] || "unknown";

    const reqRef = ref(db, "requests");
    await push(reqRef, {
      timestamp: new Date().toISOString(),
      ip,
      userAgent: ua
    });

    res.status(200).json({ success: true, message: "Visitor recorded!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
