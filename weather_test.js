const weather_output = require("./weather_output.js") 

async function print_weather_data() {
    while (true) {
        console.log(weather_output.generate_weather_data());
        await sleep(1000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

print_weather_data();