import React, { useEffect, useRef, useState } from "react";
import "./WeatherApp.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import humidityImage from "../assets/humidity.png";
import windImage from "../assets/wind.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";

const WeatherApp = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(false);
    const [history, setHistory] = useState(
        JSON.parse(localStorage.getItem("searchHistory")) || []
    );
    const [suggestions, setSuggestions] = useState([]);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    };

    const search = async (city) => {
        if (city === "") {
            alert("Enter City Name");
            return
        }
        try {
            const key = import.meta.env.VITE_API_ID;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon,
            });
            

            // ✅ Save to history
            const updatedHistory = [
                city,
                ...history.filter((item) => item.toLowerCase() !== city.toLowerCase()),
            ];

            setHistory(updatedHistory);
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

            setSuggestions([]); // close dropdown
            inputRef.current.value = ""; // clear input
            setHighlightIndex(-1);
        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching weather data:", error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value) {
            const filtered = history.filter((item) =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
        setHighlightIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            setHighlightIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            setHighlightIndex((prev) =>
                prev <= 0 ? suggestions.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            if (highlightIndex >= 0) {
                search(suggestions[highlightIndex]);
            } else {
                search(inputRef.current.value);
            }
        }
    };

    useEffect(() => {
        search("mumbai"); // default city
    }, []);

    return (
        <div className="container">
            <div className="searchs">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search any city name"
                    spellCheck="false"
                    autoComplete="on"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <div
                    className="search-icon"
                    onClick={() => search(inputRef.current.value)}
                >
                    <img src={search_icon} alt="search" />
                </div>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                    <ul className="suggestion-list">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                className={`suggestion-item ${highlightIndex === index ? "highlighted" : ""
                                    }`}
                                onClick={() => search(item)}
                            >
                                <span className="suggestion-icon">🔍</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

            </div>

            {weatherData && (
                <>
                    <div className="whether-image">
                        <img src={weatherData.icon} alt="weather-icon" />
                    </div>
                    <div className="centigrade-div">
                        <h1 className="centigrade-num">{weatherData.temperature}°C</h1>
                        <h3 className="centigrade-text">{weatherData.location}</h3>
                    </div>
                    <div className="footer">
                        <div className="humidity">
                            <img src={humidityImage} alt="humidity" />
                            <div className="humidity-text-div">
                                <h1>{weatherData.humidity}%</h1>
                                <h4>Humidity</h4>
                            </div>
                        </div>
                        <div className="wind">
                            <img src={windImage} alt="wind" />
                            <div className="wind-text-div">
                                <h1>{weatherData.windSpeed}Km/h</h1>
                                <h4>Wind Speed</h4>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default WeatherApp
