/*
This is US specific weather forecast dashboard as country code is not being usedin API call and even if the same city exist in
multiple states ,only one from the search is picked

User is presented with a search box and button to search for city name and additional option to clear search history.
When user enter the city name and click Search,verifies if the city name is not empty using isValid()
Verifies if city is not already part of local storage and only if not creates a new button with city name and add to search history
Also displays current and 5 day weather forecast.
As per documentation,used the updated One call API and geocoding API ,first to fetch coordinates with city name
and then to search with coordinates for weather details.

When user clicks on buttons on search history ,only one API call happens with coordinates to get updated weather data
When user clicks on Clear search histor,local storage is cleared and UI is updated
*/

//Global Variables

let searchHistoryEl = $(".search-history");
let inputEl = $("#city-search-input");
let searchBtn = $(".search-button");
let cityButtons = $(".cityButtons");

let formEl = $("form");

let currentWeatherEl = $("#weather-info-section");
let forecastWeatherEl = $("#forecast-section");

let cityNameEl = $("#city-icon-div h2");
let dateEl = $(".date");
let iconEl = $(".icon");
let tempEL = $("#current-weather-info .temp");
let humidityEL = $("#current-weather-info .humidity");
let windEL = $("#current-weather-info .wind");
let uviEL = $("#current-weather-info .uvi");

let pEl = $(".error-para");

/*Click Event Listener for Search Button*/
searchBtn.click(lookUpCityWeather);

/*Event cannot be added on the dynamic element */
$(".search-history").click(getFromStorage);

/*Additional Feature : On click on clear search hostory button ,local storage is cleared and display is supdated */
$(".clear-section button").click(clearHistory);
/*



Function is invoked when a Search Button is clicked and it checkd if the city name is not empty
Creates a new button and add to search history only if its doesnt exist in the local Storage
Make an API call to get coordinates with city name using updated geocodeing API of Open weather 
*/
function lookUpCityWeather(event) {
  //To prevent refreshing the page
  event.preventDefault();
  currentWeatherEl.removeClass("hide");

  let city = inputEl.val();
  pEl.html("");

  //If valid city,checks teh city is not already part of the storage ,if not create a new button add to history
  //Call the API to get coordinates for city

  if (isValid(city)) {
    //As suggested by API documentation using more acturate GEOCoder API
    //Fetches coordinates of the city within country US and
    //if same city exist in multiple states,pick one of the record returned by API

    let tempStorage = JSON.parse(localStorage.getItem("city-coords"));

    if (!tempStorage || !(city in tempStorage)) {
      let buttonEl = $("<button>");
      buttonEl.addClass("cityButtons");
      buttonEl.html(city);
      searchHistoryEl.append(buttonEl);
    }

    getCoordinatesByCityName(city);
  } else {
    pEl.html("Please enter a valid city name.");
  }

  return;
}

//Verify if the city value is not empty,if entered wrong value display error message and return
function isValid(city) {
  if (city.length == 0) {
    pEl.attr("style", "color:red");
    pEl.html("Please enter a city name.");
    return false;
  }
  return true;
}

/*Function to get data from storage and make API call with the stored coordinates*/

function getFromStorage(event) {
    //This will remove the sections and display weather section
    //when users refreshes page and then click on the city buttons
    currentWeatherEl.removeClass("hide");
    forecastWeatherEl.removeClass("hide");
  
    if (event.target.type === "submit") {
      let cityName = event.target.innerHTML;
  
      let lat = JSON.parse(localStorage.getItem("city-coords"))[cityName][0];
      let lng = JSON.parse(localStorage.getItem("city-coords"))[cityName][1];
  
      getcurrentWeatherData(lat, lng, cityName);
    }
  
    return;
  }
  


/*This will make an API call using city name and country code and return lat,lng coordinates of that city */

function getCoordinatesByCityName(city) {
    let request =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      city +
      ",us&limit=1&appid=bbdf0ceeaac95b54bc84b84990bee209";
  
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        let latitude = data[0].lat;
        let longitude = data[0].lon;
  
        //Save the coordinates and city name to the local storage
        let storageCopy = JSON.parse(localStorage.getItem("city-coords"));
  
        console.log(storageCopy);
        let initialObj = !storageCopy ? {} : storageCopy;
        initialObj[city] = [latitude, longitude];
        localStorage.setItem("city-coords", JSON.stringify(initialObj));
  
        getcurrentWeatherData(latitude, longitude, city);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  /*Function will accept lat and long values and make an Open Weather's One Call API and return weather data */

function getcurrentWeatherData(lat, lng, city) {
    //API URL : https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
  
    let request =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lng +
      "&exclude=hourly,minutely,alerts&appid=bbdf0ceeaac95b54bc84b84990bee209";
    let uviIndexColors = [
      { 0: "#336600" },
      { 1: "#336600" },
      { 2: "#336600" },
      { 3: "#ffff00" },
      { 4: "#ffff00" },
      { 5: "#ffff00" },
      { 6: "#ffa500" },
      { 7: "#ffa500" },
      { 8: "#ff0000" },
      { 9: "#ff0000" },
      { 10: "#ff0000" },
      { 11: "#9900ff" },
    ];
  
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        let formattedDate = formatDate(data.current.dt);
        let icon = data.current.weather[0].icon;
        let temperature = data.current.temp;
        let humidity = data.current.humidity;
        let windspeed = data.current.wind_speed;
        let uvi = data.current.uvi;
  
        let uviEl = $(".uvi").html("UV Index: ");
  
        //Round the UVI Index value to an integer
        uvi = Math.floor(uvi);
  
        //For any value greater than 11,color code will be same as that of UVI:11
        if (uvi >= 12) {
          uvi = 11;
        }
  
        //Checks if the uvi values is in the color code array,if then create a span element with styling and set its value as uvi Index value
  
        uviIndexColors.forEach((uviColorObj) => {
          if (uvi in uviColorObj) {
            let uviSpan = $("<span>&nbsp;" + uvi + "&nbsp;</span>").attr(
              "style",
              "color:#000;padding:0.2rem;background-color:" + uviColorObj[uvi]
            );
  
            uviEL.append(uviSpan);
            return;
          }
        });
  
        cityNameEl.html(city);
        dateEl.html(formattedDate);
  
        //URL for the icon from Open Weather API
        let iconUrl = "https://openweathermap.org/img/wn/" + icon + ".png";
        iconEl.attr("src", iconUrl);
  
        tempEL.html("Temp: " + temperature +" °F");
        humidityEL.html("Humidity: " + humidity+" %");
        windEL.html("Wind: " + windspeed+" mph");
  
        
        let weatherArray = data.daily.slice(0, 5);
        getFiveDayForecast(weatherArray);
      })
      .catch((e) => console.log(e));
  }


function getFiveDayForecast(daily) {
    forecastWeatherEl.html("");
    for (index = 0; index < 5; index++) {
      let foreCastWeather = daily[index];
  
      let date = formatDate(foreCastWeather.dt);
      let temperature = foreCastWeather.temp.day;
      let wind = foreCastWeather.wind_speed;
      let humidity = foreCastWeather.humidity;
      let weathrerIcon =
        "https://openweathermap.org/img/wn/" +
        foreCastWeather.weather[0].icon +
        ".png";
  
      //Creates elements to display the forecast weather with the fetched data
      createForecastSection(date, temperature, wind, humidity, weathrerIcon);
    }
  
    forecastWeatherEl.removeClass("hide");
    return;
  }

  /*Creates elements dynamically to display the data and apply style to it*/
function createForecastSection(date, temperature, wind, humidity, weatherIcon) {
    let forecastInnerDiv = $("<div>");
  
    let dateEl = $("<h3>");
    dateEl.html(date);
  
    let iconEl = $("<img>");
    iconEl.attr("src", weatherIcon);
  
    let dateIconDiv = $("<div>");
    dateIconDiv.append(dateEl);
    dateIconDiv.append(iconEl);
    dateIconDiv.attr("style", "display:flex;padding-right:0.1rem");
  
    let tempPara = $("<p>");
    tempPara.html("Temp: " + temperature+" °F");
  
    let windPara = $("<p>");
    windPara.html("Wind: " + wind+" mph");
  
    let humidityPara = $("<p>");
    humidityPara.html("Humidity: " + humidity+" %");
  
    forecastInnerDiv.append(dateIconDiv);
    forecastInnerDiv.append(tempPara);
    forecastInnerDiv.append(windPara);
    forecastInnerDiv.append(humidityPara);
    forecastInnerDiv.attr(
      "style",
      "display:flex;flex-direction:column;background-color:#9F496E;padding:3rem 1.5rem;border-radius:10px"
    );
  
    forecastWeatherEl.append(forecastInnerDiv);
  }

  //Using moment API to format the date
function formatDate(date) {
    return moment.unix(date).format("M/DD/YYYY");
  }
  //Function will fetch data from local storage,and create buttons for each of the elements in the
//array and create button for it and append to the csearch history container.

function updateDisplay() {
    let storage = JSON.parse(localStorage.getItem("city-coords"));
    if (storage) {
      let keys = Object.keys(storage);
      for (let index = 0; index < keys.length; index++) {
        let buttonEl = $("<button>");
        buttonEl.addClass("cityButtons");
        buttonEl.html(keys[index]);
        searchHistoryEl.append(buttonEl);
      }
    } else {
      searchHistoryEl.empty();
    }
  }

//Function is invoked every time the page loads and update html page
updateDisplay();

/*Added a functionality to clear the Storage and update the display*/

function clearHistory() {
  localStorage.clear();
  updateDisplay();
}