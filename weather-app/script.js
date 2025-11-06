const apiKey = "7747fc103d7df36be54364fe39d4d4da";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");
const localTimeEl = document.querySelector(".local-time");

window.onload = () => searchBox.focus();

const weatherMap = {
    "clouds": "clouds",
    "clear": "clear",
    "rain": "rain",
    "drizzle": "drizzle",
    "mist": "mist",
    "snow": "snow",
    "thunderstorm": "thunderstorm"
};

const countryToCapital = {
    "india": "New Delhi",
    "usa": "Washington",
    "united states": "Washington",
    "japan": "Tokyo",
    "china": "Beijing",
    "canada": "Ottawa",
    "france": "Paris",
    "germany": "Berlin",
    "italy": "Rome",
    "uk": "London",
    "england": "London",
    "australia": "Canberra"
};

// ✅ Auto-detect correct image path (works for both local + Render)
function chooseIconFilename(weatherMain, isNight) {
    const base = weatherMap[weatherMain.toLowerCase()] || weatherMain.toLowerCase();

    // Detect if hosted on Render or localhost
    const prefix = window.location.hostname === "localhost" || window.location.protocol === "file:"
        ? "../images"   // Local use (index.html inside a folder)
        : "./images";   // Render use (static hosting relative path)

    return isNight
        ? `${prefix}/${base}-night.png`
        : `${prefix}/${base}.png`;
}

function formatLocalTime(date) {
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const mm = minutes.toString().padStart(2, "0");
    return `${hours}:${mm} ${ampm}`;
}

async function checkWeather(city) {
    if (!city) return;

    const cityKey = city.toLowerCase().trim();
    if (countryToCapital[cityKey]) city = countryToCapital[cityKey];

    try {
        const response = await fetch(apiUrl + encodeURIComponent(city) + `&appid=${apiKey}`);
        if (response.status === 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").textContent = data.main.humidity + "%";
        document.querySelector(".wind").textContent = data.wind.speed + " km/h";

        const localMs = Date.now() + (data.timezone * 1000);
        const localDate = new Date(localMs);
        const localUnixSec = Math.floor(localMs / 1000);
        const sunrise = data.sys?.sunrise || null;
        const sunset = data.sys?.sunset || null;

        let isDay = true;
        if (sunrise && sunset) {
            isDay = localUnixSec >= sunrise && localUnixSec < sunset;
        } else {
            const hour = localDate.getUTCHours();
            isDay = hour >= 6 && hour < 18;
        }

        card.classList.remove("day", "night");
        card.classList.add(isDay ? "day" : "night");

        const weatherMain = data.weather[0].main || "clear";
        const iconPath = chooseIconFilename(weatherMain, !isDay);

        weatherIcon.style.opacity = "0";
        setTimeout(() => {
            weatherIcon.src = iconPath;
            weatherIcon.style.opacity = "1";
        }, 300);

        localTimeEl.textContent = `Local time: ${formatLocalTime(localDate)}`;

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

    } catch (err) {
        console.error(err);
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error p").textContent = "Could not fetch weather. Try again.";
        document.querySelector(".weather").style.display = "none";
    }
}

searchBtn.addEventListener("click", () => checkWeather(searchBox.value.trim()));
searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") checkWeather(searchBox.value.trim());
});
