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

// Remember dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  document.getElementById("modeBtn").textContent = "☀️ Light";
}

setDate();
