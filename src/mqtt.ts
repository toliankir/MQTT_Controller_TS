import mqtt from 'mqtt';
import storage from './test-storage';

export function mqttInit() {
    const mqttClient = mqtt.connect('mqtt://m13.cloudmqtt.com', {
        port: 17447,
        clientId: "mqtt_nodejs",
        username: "fjwkxsvo",
        password: "0uLbMzS4c4mr"
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
                value: msgObj[el]
            });
        }
    });
}
