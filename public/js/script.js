const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const geoBtn = document.querySelector("#geo-btn");
const weatherResult = document.querySelector("#weather-result");

const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

const suggestionsBox = document.querySelector("#suggestions");

cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    try {
        const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OPENWEATHER_API_KEY}`
        );
        const data = await res.json();

        if (data.length === 0) {
        suggestionsBox.innerHTML = "<p class='suggestion-empty'>No results found</p>";
        return;
        }

        suggestionsBox.innerHTML = data
        .map(
            city => `
            <div class="suggestion-item" data-city="${city.name},${city.country}">
                ${city.name}, ${city.state ? city.state + ", " : ""}${city.country}
            </div>
            `
        )
        .join("");

        // Event klik untuk setiap suggestion
        document.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
            cityInput.value = item.dataset.city;
            suggestionsBox.innerHTML = "";
        });
        });
        } catch (err) {
            console.error("Error fetching city suggestions:", err);
        }
    });


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

function loadLottieAnimation(condition) {
    let animPath = "";

    if (condition === "Clear") {
        animPath = "lottie/clear.json";   // file animasi Lottie
    } else if (condition === "Clouds") {
        animPath = "lottie/cloudy.json";
    } else if (condition === "Rain") {
        animPath = "lottie/rain.json";
    } else if (condition === "Snow") {
        animPath = "lottie/snow.json";
    } else {
        animPath = "lottie/default.json"; // fallback
    }

    lottie.loadAnimation({
        container: document.getElementById("weather-icon"),
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: animPath
    });
}

function renderWeather(data) {
    weatherResult.innerHTML = `
        <div class="weather-card">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p><strong>${Math.round(data.main.temp)}°C</strong> — ${data.weather[0].description}</p>
            <div id="weather-icon" style="width:100px;height:100px;margin:0 auto;"></div>
            <div class="weather-details">
                <p>Feels like: ${Math.round(data.main.feels_like)}°C</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind: ${data.wind.speed} m/s</p>
            </div>
        </div>
    `;

    loadLottieAnimation(data.weather[0].main);


    // --- background dinamis ---
    const condition = data.weather[0].main.toLowerCase();
    const body = document.body;

    if (condition.includes("clear")) {
        body.style.backgroundImage = "url('assets/img/clear.jpg')";
    } else if (condition.includes("cloud")) {
        body.style.backgroundImage = "url('assets/img/cloudy.jpg')";
    } else if (condition.includes("rain")) {
        body.style.backgroundImage = "url('assets/img/rain.jpg')";
    } else if (condition.includes("snow")) {
        body.style.backgroundImage = "url('assets/img/snowy.jpg')";
    } else if (condition.includes("thunderstorm")) {
        body.style.backgroundImage = "url('assets/img/thunder.jpg')";
    } else {
        body.style.backgroundImage = "url('assets/img/default.jpg')";
    }

    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.transition = "background-image 0.5s ease-in-out";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
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

// Clear history button
document.querySelector("#clear-history").addEventListener("click", () => {
    localStorage.removeItem("lastCity");
    weatherResult.innerHTML = `<p class="placeholder">Search a city or use your location to get started.</p>`;
});
