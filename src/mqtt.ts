import mqtt from 'mqtt';
import storage from './state';
import logger from './logger';

if (!process.env.MQTT_SERVER || !process.env.MQTT_PORT || !process.env.MQTT_CLIENTID || !process.env.MQTT_USERNAME || !process.env.MQTT_PASSWORD) {
    throw new Error('MQTT connection error');
}
const mqttClient = mqtt.connect(process.env.MQTT_SERVER, {
    port: parseInt(process.env.MQTT_PORT),
    clientId: process.env.MQTT_CLIENTID,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
});

export function mqttInit() {
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
        let msgObj;
        try {
            msgObj = JSON.parse(message.toString());
        } catch (err) {
            logger.log({
                level: 'error',
                message: `MQTT: ${err.message}`
            });
            return;
        }
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

export function setRelay(deviceId: string, relayId: number, state: boolean) {
    const message: string = relayId + (state ? '1' : '0');
    mqttClient.publish(`${deviceId}/set/relay`, message);
}

export function sendMessage(topic: string, message: string) {
    logger.log({
        level: 'info',
        message: `MQTT: Send  ${topic} : ${message}`
    });
    mqttClient.publish(topic, message);
}