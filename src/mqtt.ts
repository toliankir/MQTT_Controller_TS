import mqtt from 'mqtt';
import storage from './test-storage';

export function mqttInit() {
    if (!process.env.MQTT_PORT || !process.env.MQTT_CLIENTID || !process.env.MQTT_USERNAME || !process.env.MQTT_PASSWORD) {
        return false;
    }
    const mqttClient = mqtt.connect('mqtt://m13.cloudmqtt.com', {
        port: parseInt(process.env.MQTT_PORT),
        clientId: process.env.MQTT_CLIENTID,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
    });

    mqttClient.on('connect', () => {
        console.log('Mqtt connected');
        mqttClient.subscribe('#', (err) => {
            if (err) {
                console.log(err);
                return;
            }
            // mqttClient.publish('presence', 'Hello mqtt');
        })
    });

    mqttClient.on('message', (topic, message) => {
        const [deviceId, deviceType] = topic.toString().split('/');
        const msgObj = JSON.parse(message.toString());
        for (let el in msgObj) {
            storage.save({
                deviceId,
                deviceType,
                parameter: el,
                value: msgObj[el],
                timestamp: Math.floor(Date.now() / 1000)
            });
        }
    });
}
