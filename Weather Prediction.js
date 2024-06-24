document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        alert('Please enter a city name');
    }
});

async function getWeatherData(city) {
    const apiKey = '41d4d3432834b51acb15c77e2a0ab1b1'; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('City not found');
        }
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not found');
        }
        const forecastData = await forecastResponse.json();

        displayWeatherData(weatherData, forecastData);
        displayHourlyForecast(forecastData);
        displayDailyForecast(forecastData);
    } catch (error) {
        alert(error.message);
    }
}

function displayWeatherData(weatherData, forecastData) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.style.display = 'block';

    const currentTemp = weatherData.main.temp.toFixed(2);
    const humidity = weatherData.main.humidity.toFixed(2);
    const windSpeed = weatherData.wind.speed.toFixed(2);
    const windDirection = weatherData.wind.deg.toFixed(0);
    const description = weatherData.weather[0].description;

    const date = new Date(weatherData.dt * 1000).toLocaleDateString();

    // Get min and max temperatures from the forecast data
    const minTemp = Math.min(...forecastData.list.slice(0, 8).map(item => item.main.temp_min)).toFixed(2);
    const maxTemp = Math.max(...forecastData.list.slice(0, 8).map(item => item.main.temp_max)).toFixed(2);

    weatherInfo.innerHTML = `
        <div class="weather-main">
            <div class="weather-detail">
                <span>Location: ${weatherData.name}, ${weatherData.sys.country}</span>
            </div>
            <div class="weather-detail">
                <span>Date: ${date}</span>
            </div>
            <div class="weather-detail">
                <span>Current Temperature: ${currentTemp} °C</span>
            </div>
            <div class="weather-detail">
                <span>Min Temperature: ${minTemp} °C</span>
            </div>
            <div class="weather-detail">
                <span>Max Temperature: ${maxTemp} °C</span>
            </div>
            <div class="weather-detail">
                <span>Humidity: ${humidity} %</span>
            </div>
            <div class="weather-detail">
                <span>Wind Speed: ${windSpeed} m/s, Direction: ${windDirection}°</span>
            </div>
            <div class="weather-detail">
                <span>Description: ${description}</span>
            </div>
        </div>
    `;
}

function displayHourlyForecast(forecastData) {
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.style.display = 'block';

    hourlyForecast.innerHTML = `
        <h3>Hourly Forecast for Today</h3>
        <div class="timeline">
            ${forecastData.list.slice(0, 8).map(hour => `
                <div class="timeline-hour">
                    <p>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}">
                    <p>${hour.main.temp.toFixed(2)} °C</p>
                </div>
            `).join('')}
        </div>
    `;
}

function displayDailyForecast(forecastData) {
    const dailyForecast = document.getElementById('daily-forecast');
    dailyForecast.style.display = 'block';

    dailyForecast.innerHTML = `
        <h3>5-Day Forecast</h3>
        <div class="forecast">
            ${getDailyForecast(forecastData).map(day => `
                <div class="forecast-day">
                    <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                    <p>${day.temp.day.toFixed(2)} °C</p>
                </div>
            `).join('')}
        </div>
    `;
}

function getDailyForecast(forecastData) {
    const dailyData = [];
    const daysMap = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!daysMap[date]) {
            daysMap[date] = {
                dt: item.dt,
                temp: { day: item.main.temp },
                weather: item.weather,
            };
        } else {
            daysMap[date].temp.day = (daysMap[date].temp.day + item.main.temp) / 2;
        }
    });

    for (const key in daysMap) {
        dailyData.push(daysMap[key]);
    }

    return dailyData.slice(1, 6); // Get the next 5 days
}
