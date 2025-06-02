// Clé API pour accéder au service OpenWeatherMap
const API_KEY = "d9ec316c2befc0f7909eccb409c4a7a1";

// Récupération des éléments HTML nécessaires
const form = document.getElementById("form");
const input = document.getElementById("input_city");
const suggestionsBox = document.getElementById("suggestions");

const city1 = document.getElementById("city_1");
const city2 = document.getElementById("city_2");
const temp = document.getElementById("temperature");
const desc = document.getElementById("description_weather");
const weatherIcon = document.getElementById("weather_icon");
const vignette = document.getElementById("vignette");
const windDiv = document.getElementById("wind");
const windDesc = document.getElementById("description_wind");
const humidityDiv = document.getElementById("humidity");
const humidityDesc = document.getElementById("description_humidity");

const previsionContainer = document.getElementById("prevision_weather");
const predictionContainer = document.getElementById("prediction_weather");

// Fonction pour afficher les sections météo (après chargement réussi)
function showWeatherSections() {
  vignette.style.display = "block";
  windDiv.style.display = "flex";
  humidityDiv.style.display = "flex";
  previsionContainer.style.display = "flex";
  predictionContainer.style.display = "flex";
}

// Fonction pour cacher les sections météo (au démarrage ou en cas d'erreur)
function hideWeatherSections() {
  vignette.style.display = "none";
  windDiv.style.display = "none";
  humidityDiv.style.display = "none";
  previsionContainer.style.display = "none";
  predictionContainer.style.display = "none";
}

// Événement sur la saisie de texte pour proposer des suggestions de villes
input.addEventListener("input", async () => {
  const query = input.value.trim();

  // PAs de suggestions s'il y a moins de 2 caractères
  if (query.length < 2) {
    suggestionsBox.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${query}&limit=5`);
    if (!res.ok) throw new Error("Erreur lors de la récupération des suggestions");
    const data = await res.json();

    suggestionsBox.innerHTML = "";

    data.forEach(commune => {
      const div = document.createElement("div");
      div.textContent = commune.nom;
      div.addEventListener("click", () => {
        input.value = commune.nom;
        suggestionsBox.innerHTML = "";
      });
      suggestionsBox.appendChild(div);
    });
  } catch (error) {
    console.error("Erreur de suggestion :", error);
    suggestionsBox.innerHTML = "";
  }
});

// Clic en dehors du formulaire : cache les suggestions
document.addEventListener("click", e => {
  if (!form.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.innerHTML = "";
  }
});

// Soumission du formulaire : récupère et affiche la météo
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${city}&boost=population&limit=1`);
  const data = await res.json();
  if (data.length === 0) {
    alert("Ville non trouvée.");
    return;
  }

  const selectedCity = data[0].nom;
  city1.textContent = selectedCity;
  city2.textContent = selectedCity;
  
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric&lang=fr`);
    if (!weatherRes.ok) throw new Error("Météo actuelle non trouvée");
    const weatherData = await weatherRes.json();

    temp.textContent = `${Math.round(weatherData.main.temp)}°C`;
    desc.textContent = weatherData.weather[0].description;

    // 🟡 Forcer l'utilisation d'une icône de jour
    let iconCode = weatherData.weather[0].icon;
    iconCode = iconCode.replace("n", "d");
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.style.display = "inline";

    windDesc.textContent = `Vent : ${weatherData.wind.speed} m/s`;
    humidityDesc.textContent = `Humidité : ${weatherData.main.humidity}%`;

    // Fond selon la météo uniquement
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    let backgroundImage = "";
    switch (weatherMain) {
      case "clear":
        backgroundImage = "url('./images/sunny.png')";
        break;
      case "clouds":
        backgroundImage = "url('./images/cloudy.png')";
        break;
      case "rain":
      case "drizzle":
        backgroundImage = "url('./images/rainy.png')";
        break;
      case "thunderstorm":
        backgroundImage = "url('./images/storm.png')";
        break;
      case "snow":
        backgroundImage = "url('./images/snowy2.png')";
        break;
      case "fog":
      case "mist":
        backgroundImage = "url('./images/foggy.png')";
        break;
      default:
        backgroundImage = "none";
    }
    document.getElementById("main").style.backgroundImage = backgroundImage;

    showWeatherSections();

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&appid=${API_KEY}&units=metric&lang=fr`);
    if (!forecastRes.ok) throw new Error("Prévisions non trouvées");
    const forecastData = await forecastRes.json();

    // Prévisions horaires
    previsionContainer.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const item = forecastData.list[i];
      const date = new Date(item.dt * 1000);
      const hours = date.getHours().toString().padStart(2, "0");

      let icon = item.weather[0].icon;
      icon = icon.replace("n", "d");

      const tempVal = Math.round(item.main.temp);

      const div = document.createElement("div");
      div.classList.add("prevision-item");
      div.innerHTML = `
        <p>${hours}h</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon_weather" />
        <p>${tempVal}°C</p>
      `;
      previsionContainer.appendChild(div);
    }

    // Prévisions journalières
    predictionContainer.innerHTML = "";
    const dailyMap = new Map();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "numeric" });
      if (!dailyMap.has(day)) {
        dailyMap.set(day, item);
      }
    });

    let count = 0;
    for (const [day, item] of dailyMap) {
      if (count >= 5) break;

      let icon = item.weather[0].icon;
      icon = icon.replace("n", "d");

      const tempVal = Math.round(item.main.temp);

      const div = document.createElement("div");
      div.classList.add("prediction-item");
      div.innerHTML = `
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon_weather" />
        <p>${tempVal}°C</p>
      `;
      predictionContainer.appendChild(div);
      count++;
    }

    input.value = "";

  } catch (err) {
    alert("Erreur lors de la récupération des données météo.");
    hideWeatherSections();
  }
});

// Cache les sections météo au chargement initial
hideWeatherSections();

// Recherche météo de Beauvais à l'ouverture
window.addEventListener("DOMContentLoaded", () => {
  input.value = "Beauvais";
  form.dispatchEvent(new Event("submit"));
});
