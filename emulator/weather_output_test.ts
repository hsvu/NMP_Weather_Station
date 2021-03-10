import {generate_weather_data} from "./weather_output";

async function print_weather_data() {
    console.log(generate_weather_data());    
}

setInterval(print_weather_data, 1000);