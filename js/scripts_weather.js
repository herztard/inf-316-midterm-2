const apiKey = '7908168df347cd95a62e7df68d1fdc51';
let unit = 'metric';
let isCelsius = true;
let weatherDisplayed = false;

async function getWeather(lat, lon) {
    if (isCelsius) {
        unit = 'metric';
    } else {
        unit = 'imperial';
    }

    const city = document.getElementById('city-input').value;
    let url;
    if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayCurrentWeather(data);
        displayForecast(data);
        if (!weatherDisplayed) {
            const container = document.getElementById('weather-container');
            const toggleSystemsButton = document.createElement('div');
            toggleSystemsButton.id = 'unit-toggle';
            toggleSystemsButton.innerHTML = `<button style="border: 2px solid #3e6bd0; width: 100%;" onclick="toggleUnit()">Toggle °C/°F</button>`;
            container.appendChild(toggleSystemsButton);
            container.style.display = "block";
            weatherDisplayed = true;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Make sure you entered the city name correctly and Internet connection is stable.');
    }
}

function displayCurrentWeather(data) {
    const currentWeather = document.getElementById('current-weather');
    const cityName = data.city.name;
    const temp = Math.round(data.list[0].main.temp);
    const description = data.list[0].weather[0].description;
    const icon = data.list[0].weather[0].icon;
    const humidity = data.list[0].main.humidity;
    const windSpeed = data.list[0].wind.speed;

    currentWeather.innerHTML = `
        <img id="weather-icon" src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <div style="text-align: center;">
            <h2>${cityName}</h2>
            <p style="font-size: 2.5rem; font-weight: 700; margin-top: 0; margin-bottom: 32px;">${temp}°${unit === 'metric' ? 'C' : 'F'}</p>
            <div class="city-stats">
                <p>Condition: ${description}</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = forecast.weather[0].icon;
        const temp = Math.round(forecast.main.temp);

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <p>${dayName}</p>
            <img class="forecast-icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="${forecast.weather[0].description}">
            <p>${temp}°${unit === 'metric' ? 'C' : 'F'}</p>
        `;
        forecastContainer.appendChild(forecastDay);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeather(lat, lon);
            },
            (error) => {
                console.error('Error:', error);
                alert('Unable to retrieve your location');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function toggleUnit() {
    isCelsius = !isCelsius;
    const city = document.getElementById('city-input').value;
    if (city) {
        getWeather();
    } else {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeather(lat, lon);
            },
            (error) => {
                console.error('Error:', error);
                alert('Unable to retrieve your location');
            }
        );
    }
}