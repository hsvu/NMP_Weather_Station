import {generate_weather_data} from "./weather_output";
import dgram from "dgram";

async function print_weather_data() {
    const data = generate_weather_data();
    console.log(data);
    var buf = Buffer.from(JSON.stringify(data), 'utf8');
}

setInterval(print_weather_data, 1000);