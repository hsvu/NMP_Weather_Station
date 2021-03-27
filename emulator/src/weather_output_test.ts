import {generate_weather_data} from "./weather_output";
import dgram from "dgram";
import TelemetryPacket from "./Telemetry";
var starting_time = new Date().getTime();

async function print_weather_data() {
    var ending_time = new Date().getTime();
    const HOST = "localhost";
    const PORT = 12000;
    const data = generate_weather_data();
    var time_difference = (ending_time - starting_time)/1000;
    let packet: TelemetryPacket = {
        data: {
            1567: {
                channel: 1567,
                value: data.ambient_temp,
                time: time_difference,
            },   
            1568: {
                channel: 1568,
                value: data.track_temp,
                time: time_difference,
            },
            1569: {
                channel: 1569,
                value: data.humidity,
                time: time_difference,
            },
            1570: {
                channel: 1570,
                value: data.precipitation,
                time: time_difference,
            },
            1571: {
                channel: 1571,
                value: data.wind_speed,
                time: time_difference,
            },
            1572: {
                channel: 1572,
                value: data.wind_dir,
                time: time_difference,
            }
        },
    }
    console.log(packet);
    var buf = Buffer.from(JSON.stringify(packet), 'utf8');
    var client = dgram.createSocket('udp4');
    client.send(buf, 0, buf.length, PORT, HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST + ':' + PORT);
        client.close();
    });
}

setInterval(print_weather_data, 1000);