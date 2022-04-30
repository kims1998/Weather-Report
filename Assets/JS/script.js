//when input, it will make an API call
//when you type in the city and click search, the weather for that city shows up.

//search bar goes here, where user can input location to get a information on the city searched.

//when the search is successful, it will display the city name, date, icon representing the current weather condition, temp, humidity, winds speed, and uv index.

//5 days worth of weather report must be reported.


// search history shows current and future weather for that city.

//Information provided from the OpenWeatherMap web page.
const apiKey = "3af2daa697039b84dd4116deaa485545";
const keyId = "&appid=" + apiKey;

const currently = document.querySelector(".currently");
const theNextFive = document.querySelector(".nextFiveDays");
const baseWeatherAPI = "https://api.openweathermap.org/data/2.5/weather?";
const geocodeAPI = "http://api.openweathermap.org/geo/1.0/direct?";
const oneCallAPI = "https://api.openweathermap.org/data/2.5/onecall?";


//declaring variables/constants/let provided from the html page.
const history = document.querySelector("#history");
const searchBtn = document.querySelector("#search-btn");
const userInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");
const cityLabel = document.querySelector(".cityLabel");
const forecastLabel = document.querySelector(".forecastLabel");
let citySearch = "San Diego";
let localData = [];


//As the user inputs a city into the search bar and clicks "search", the GeoCodeAPI is called to search up all the cities similar to the corresponding search input.
//This is strictly for cities, cannot search by state. 
searchBtn.addEventListener("click", function (event) {
    citySearch = userInput.value;
    const url = geocodeAPI+ `q=${citySearch}&limit=5&` + keyId;
    if (!!citySearch) {
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                let templateHTML = `<div class='text-center'>
                <h4>Here are the results.</h4>
            `;
                for (let city of data) {
                    templateHTML += ` 
                    <button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-info btn-city mb-2 btn-block'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>
                `;
                }
                templateHTML += `</div>`;
                searchResult.innerHTML = templateHTML;
            });
    }
});

//
searchResult.addEventListener("click", function (event) {
    let target = event.target;

    if (target.matches(".btn-city")) {
        const city = {
            ...target.dataset,
        };
        let filteredCities = localData.filter(
            (city) => city.lat == city.lat && city.lon == city.lon
        );
        if (filteredCities.length == 0) {
            localData.push(city);
        }
        displayHistory(localData);
        localStorage.setItem("history", JSON.stringify(localData));
        searchResult.innerHTML = "";
        userInput.value = "";

        displayTheForeCast(city);
    };
});

//Once the API has been called after the user's input is searched, this function helps display the information that is being requested.
//this first portion of the function displays the current day and weather, along with the location by city, state, and country.
async function displayTheForeCast(city) {
    const search =
        oneCallAPI +
        `lat=${city.lat}&lon=${city.lon}&exclude=minutely&units=imperial&` +
        keyId;
    cityLabel.textContent = `${city.name}, ${!!city.state ? city.state + "," : ""
        } ${city.country}`;
    
    //this portion displays the next five days following the current day.
    forecastLabel.textContent = "Next 5 days";
    let hourly = [];
    await fetch(search)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);

            let templateHTML = `
        <div class="card row">
            <div class="card-body">
                <h3 class="card-title">
                ${moment(data.current.dt, "X").format("dddd, MMMM Do, YYYY")}
                </h3>
                <h6 class="card-subtitle mb-2 text-muted"></h6>
                <div class='row'>
                    <div class='col-md-4'><img class='card-img-top' src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png" class="rounded-circle card-img-top" alt="weather today"></div>
                    <div class='col-md-4 align-self-center'>
                    <p><i class="fa-solid fa-temperature-full"></i> ${data.current.temp} °F</p>
                    <p><i class="fa-solid fa-wind"></i> ${data.current.wind_speed} MPH</p>
                    <p><i class="fa-solid fa-droplet"></i> ${data.current.humidity}%</p>
                    </div>
                    <div class='col-md-4 align-self-center'>
                    <p><i class="fa-solid fa-radiation ${data.current.uvi>=8?'text-danger':data.current.uvi>=5?'text-warning':data.current.uvi>=3?'text-info':'text-success'}"></i> ${data.current.uvi} (UVI)</p>
                    <p><i class="fa-solid  fa-sun text-warning"></i> ${moment(data.current.sunrise, "X").format("h:mm A")}</p>
                    <p><i class="fa-solid fa-sun text-info"></i> ${moment(data.current.sunset, "X").format("h:mm A")}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
            currently.innerHTML = templateHTML;
            let forecastHTML = `<div class='row'>`;
            let temps = [];
            for (let i = 1; i <= 5; i++) {
                const dayForecast = data.daily[i];

                const temp = {
                    labels: ["dawn", "day", "dusk", "night"],
                    datasets: [{
                            label: "Temp(°F)",
                            borderColor: "rgb(60,186,159)",
                            backgroundColor: "rgb(60,186,159,0.1)",
                            borderWidth: 2,
                            data: [
                                dayForecast.temp.dawn,
                                dayForecast.temp.day,
                                dayForecast.temp.dusk,
                                dayForecast.temp.night,
                            ],
                        },
                        {
                            label: "Feels like",
                            borderColor: "red",
                            backgroundColor: "rgb(160,186,159,0.1)",
                            borderWidth: 2,
                            data: [
                                dayForecast.feels_like.dawn,
                                dayForecast.feels_like.day,
                                dayForecast.feels_like.dusk,
                                dayForecast.feels_like.night,
                            ],
                        },
                    ],
                };
                temps.push(temp);

                forecastHTML += `
            <div class="card col-md-4">
                <img class="card-img-top" src="https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@4x.png" alt="weather image">
                <div class="card-body">
                <h4 class="card-title">${moment(dayForecast.dt, "X").format("dddd, MMM Do")}</h4>
                <p>Temp: ${dayForecast.temp.day} °F</p>
                    <p>Wind: ${dayForecast.wind_speed} MPH</p>
                    <p>Humidity: ${dayForecast.humidity}%</p>
                    <p>UV Index: ${dayForecast.uvi}</p>
                    <p>Sunrise: ${moment(dayForecast.sunrise, "X").format(
                        "h:mm A"
                    )}</p>
                    <p>Sunrise: ${moment(dayForecast.sunset, "X").format(
                        "h:mm A"
                    )}</p>
                    <canvas id='tempDay-${i}'></canvas>
                </div>
            </div>
          `;
            }

            //this provides the diagram below the weather for visual representation of the temperature in fahrenheit and what the temperature feels like.
            forecastHTML += `</div>`;
            theNextFive.innerHTML = forecastHTML;

            for (let i = 1; i <= 5; i++) {
                const myChart = new Chart(
                    document.querySelector(`#tempDay-${i}`).getContext("2d"), {
                        type: "line",
                        data: temps[i - 1],
                        options: {
                            responsive: true,
                        } ,
                        
                    }
                );
            }
        });
}

//local storage that allows the user to quickly go back to previously searched cities.
function displayHistory(cities) {
    let templateHTML = ``;
    for (let city of cities) {
        templateHTML += `<button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-secondary btn-city-history btn-block mb-1'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>`;
    }
    history.innerHTML = templateHTML;
}
//If the user wishes to clear the previous searches that are stored in the localStorage, the button allows to clear.
document.querySelector("#clear-btn").addEventListener("click", function (event) {
    localData = [];
    displayHistory(localData);
    localStorage.setItem("history", JSON.stringify(localData));
});
history.addEventListener("click", function (event) {
    let target = event.target;
    if (target.matches(".btn-city-history")) {
        const city = {...target.dataset,};
        displayTheForeCast(city);
    }
});

function init() {
    localData =JSON.parse(localStorage.getItem("history")) || localData;
    displayHistory(localData);
}

init();