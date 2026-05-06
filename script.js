const apiKey = "d34f5a026a72aaa28489f4d3126af98d";

const weatherIcons = {
  Clear: "☀️", Clouds: "⛅", Rain: "🌧️",
  Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️",
  Mist: "🌫️", Fog: "🌫️", Haze: "🌫️"
};

const weatherClasses = {
  Clear: "clear", Clouds: "clouds", Rain: "rain",
  Drizzle: "drizzle", Thunderstorm: "thunderstorm",
  Snow: "snow", Mist: "mist", Fog: "mist", Haze: "mist"
};

function setWeatherBackground(main) {
  document.body.className = document.body.className
    .split(" ")
    .filter(c => !c.startsWith("weather-"))
    .join(" ");
  document.body.classList.add(`weather-${weatherClasses[main] || "clear"}`);
}

function formatTime(unixTime, offset) {
  const date = new Date((unixTime + offset) * 1000);
  const hrs = date.getUTCHours();
  const mins = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hrs >= 12 ? "PM" : "AM";
  return `${hrs % 12 || 12}:${mins} ${ampm}`;
}

function setDate() {
  const now = new Date();
  const options = { weekday: "long", month: "long", day: "numeric" };
  document.getElementById("dateLabel").textContent = now.toLocaleDateString("en-US", options);
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3000);
}

function showLoading(show) {
  document.getElementById("loadingState").style.display = show ? "flex" : "none";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  document.getElementById("modeBtn").textContent = isDark ? "☀️ Light" : "🌙 Dark";
  localStorage.setItem("darkMode", isDark);
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  document.getElementById("result").classList.remove("visible");
  document.getElementById("errorMsg").style.display = "none";
  showLoading(true);

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      showLoading(false);

      if (data.cod !== 200) {
        showError("City not found. Please try again.");
        return;
      }

      const main = data.weather[0].main;
      const offset = data.timezone;

      document.getElementById("cityName").textContent = data.name + ", " + data.sys.country;
      document.getElementById("localTime").textContent = "Local time: " + formatTime(Math.floor(Date.now() / 1000), offset);
      document.getElementById("temp").textContent = Math.round(data.main.temp) + "°";
      document.getElementById("condition").textContent = data.weather[0].description;
      document.getElementById("weatherIcon").textContent = weatherIcons[main] || "🌤️";
      document.getElementById("highLow").textContent = `H: ${Math.round(data.main.temp_max)}°  L: ${Math.round(data.main.temp_min)}°`;
      document.getElementById("humidity").textContent = data.main.humidity + "%";
      document.getElementById("wind").textContent = Math.round(data.wind.speed) + " m/s";
      document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like) + "°C";
      document.getElementById("visibility").textContent = (data.visibility / 1000).toFixed(1) + " km";
      document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise, offset);
      document.getElementById("sunset").textContent = formatTime(data.sys.sunset, offset);
      document.getElementById("lastUpdated").textContent = "Updated just now";

      setWeatherBackground(main);
      document.getElementById("result").classList.add("visible");
    })
    .catch(() => {
      showLoading(false);
      showError("Something went wrong. Check your connection.");
    });
}

document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") getWeather();
});

// ── Speed Test ──────────────────────────────────────

async function measurePing() {
  const times = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    try {
      await fetch(`https://www.cloudflare.com/cdn-cgi/trace?t=${Date.now()}`, { cache: "no-store" });
      times.push(performance.now() - start);
    } catch {}
  }
  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

async function measureDownload() {
  const fileSizeMB = 5;
  const url = `https://speed.cloudflare.com/__down?bytes=${fileSizeMB * 1024 * 1024}&t=${Date.now()}`;
  const start = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    await res.blob();
    const duration = (performance.now() - start) / 1000;
    return ((fileSizeMB * 8) / duration).toFixed(1);
  } catch {
    return null;
  }
}

async function measureUpload() {
  const fileSizeMB = 2;
  const data = new Uint8Array(fileSizeMB * 1024 * 1024);
  const url = `https://speed.cloudflare.com/__up?t=${Date.now()}`;
  const start = performance.now();
  try {
    await fetch(url, {
      method: "POST",
      body: data,
      cache: "no-store"
    });
    const duration = (performance.now() - start) / 1000;
    return ((fileSizeMB * 8) / duration).toFixed(1);
  } catch {
    return null;
  }
}

function getConnectionLabel(download) {
  if (download === null) return "Offline";
  if (download >= 100) return "Excellent";
  if (download >= 50) return "Great";
  if (download >= 20) return "Good";
  if (download >= 5) return "Fair";
  return "Slow";
}

async function runSpeedTest() {
  const btn = document.getElementById("speedBtn");
  const resultEl = document.getElementById("speedResult");
  const loadingEl = document.getElementById("speedLoading");

  btn.disabled = true;
  btn.textContent = "Testing...";
  resultEl.classList.remove("visible");
  loadingEl.style.display = "flex";

  document.getElementById("downloadSpeed").textContent = "-";
  document.getElementById("uploadSpeed").textContent = "-";
  document.getElementById("pingSpeed").textContent = "-";
  document.getElementById("connectionStatus").textContent = "-";

  const ping = await measurePing();
  document.getElementById("pingSpeed").textContent = ping !== null ? ping : "N/A";

  const download = await measureDownload();
  document.getElementById("downloadSpeed").textContent = download !== null ? download : "N/A";

  const upload = await measureUpload();
  document.getElementById("uploadSpeed").textContent = upload !== null ? upload : "N/A";

  document.getElementById("connectionStatus").textContent = getConnectionLabel(parseFloat(download));
  document.getElementById("speedFooter").textContent = "Tested just now";

  loadingEl.style.display = "none";
  resultEl.classList.add("visible");

  btn.disabled = false;
  btn.textContent = "Run Speed Test";
}

// ── Init ─────────────────────────────────────────────

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  document.getElementById("modeBtn").textContent = "☀️ Light";
}

setDate();
