import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue, get, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔑 Ganti dengan Firebase milik kamu
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

const counterRef = ref(db, "traffic");
const historyRef = ref(db, "history");

async function tambahVisitor() {
  await runTransaction(counterRef, (data) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (!data) {
      return { today: 1, all: 1, lastDate: todayStr };
    }

    // Reset harian
    if (data.lastDate !== todayStr) {
      data.today = 0;
      data.lastDate = todayStr;
    }

    data.today = (data.today || 0) + 1;
    data.all = (data.all || 0) + 1;

    return data;
  });

  // Simpan history per hari
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0];
  const todayHistoryRef = ref(db, `history/${dateKey}`);
  const snapshot = await get(todayHistoryRef);
  if (snapshot.exists()) {
    await set(todayHistoryRef, snapshot.val() + 1);
  } else {
    await set(todayHistoryRef, 1);
  }
}

tambahVisitor();

// Realtime update counter
onValue(counterRef, (snapshot) => {
  const data = snapshot.val() || { today: 0, all: 0 };
  document.getElementById("today").textContent = data.today;
  document.getElementById("all").textContent = data.all;
});

// Realtime update grafik
onValue(historyRef, (snapshot) => {
  const history = snapshot.val() || {};
  const labels = Object.keys(history).sort();
  const values = labels.map(date => history[date]);

  updateChart(labels, values);
});

// Chart.js setup
let chart;
function updateChart(labels, data) {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Kunjungan Harian",
        data,
        borderColor: "#00ff88",
        backgroundColor: "rgba(0,255,136,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      },
      plugins: {
        legend: { labels: { color: "#fff" } }
      }
    }
  });
}
