const weather_output = require("./weather_output.js") 

async function print_weather_data() {
    console.log(weather_output.generate_weather_data());    
}

setInterval(print_weather_data, 1000);