import mqtt from 'mqtt';
import storage from './state';
import logger from './logger';

export function mqttInit() {
    if (!process.env.MQTT_SERVER || !process.env.MQTT_PORT || !process.env.MQTT_CLIENTID || !process.env.MQTT_USERNAME || !process.env.MQTT_PASSWORD) {
        throw new Error('MQTT connection error');
    }
    const mqttClient = mqtt.connect(process.env.MQTT_SERVER, {
        port: parseInt(process.env.MQTT_PORT),
        clientId: process.env.MQTT_CLIENTID,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
    });

    mqttClient.on('connect', () => {
        logger.log({
            level: 'info',
            message: `MQTT: Mqtt connected to ${process.env.MQTT_SERVER}`
        });
        mqttClient.subscribe('#', (err) => {
            if (err) {
                logger.log({
                    level: 'error',
                    message: `MQTT: ${err.message}`
                });
                return;
            }
            // mqttClient.publish('presence', 'Hello mqtt');
        })
    });

    mqttClient.on('message', (topic, message) => {
        const [deviceId, deviceType] = topic.toString().split('/');
        const msgObj = JSON.parse(message.toString());
        logger.log({
            level: 'debug',
            message: `MQTT: Recived mqtt message: ${topic.toString()}, ${message.toString()}`
        })
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
