const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const geoBtn = document.querySelector("#geo-btn");
const weatherResult = document.querySelector("#weather-result");

const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
    fetchWeatherByCity(city);
    }
});

geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => renderError("Location access denied ❌")
    );
    } else {
    renderError("Geolocation not supported.");
    }
});

async function fetchWeatherByCity(city) {
    setLoading();
    try {
    const res = await fetch(`${API_BASE}?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const data = await res.json();
    if (res.ok) {
        renderWeather(data);
        localStorage.setItem("lastCity", city);
    } else {
        renderError(data.message);
    }
    } catch (err) {
    renderError("Network error. Try again.");
    }
}

async function fetchWeatherByCoords(lat, lon) {
    setLoading();
    try {
    const res = await fetch(`${API_BASE}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const data = await res.json();
    if (res.ok) {
        renderWeather(data);
    } else {
        renderError(data.message);
    }
    } catch (err) {
    renderError("Network error. Try again.");
    }
}

function renderWeather(data) {
    weatherResult.innerHTML = `
    <div class="weather-card">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p><strong>${Math.round(data.main.temp)}°C</strong> — ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon"/>
        <div class="weather-details">
            <p>Feels like: ${Math.round(data.main.feels_like)}°C</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${data.wind.speed} m/s</p>
        </div>
    </div>
    `;
}

function renderError(msg) {
    weatherResult.innerHTML = `<p class="error">${msg}</p>`;
}

function setLoading() {
    weatherResult.innerHTML = `<p>Loading...</p>`;
}

// Load last city if available
window.addEventListener("DOMContentLoaded", () => {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
    fetchWeatherByCity(lastCity);
    }
});