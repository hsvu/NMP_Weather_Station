import {generate_weather_data} from "./weather_output";
import dgram from "dgram";

async function print_weather_data() {
    const HOST = "localhost";
    const PORT = 12000;
    const data = generate_weather_data();
    console.log(data);
    var buf = Buffer.from(JSON.stringify(data), 'utf8');
    var client = dgram.createSocket('udp4');
    client.send(buf, 0, buf.length, PORT, HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST + ':' + PORT);
        client.close();
    });
}

setInterval(print_weather_data, 1000);