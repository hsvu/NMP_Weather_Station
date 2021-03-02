import weather_output from "./weather_output";

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