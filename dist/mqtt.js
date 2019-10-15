"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const test_storage_1 = __importDefault(require("./test-storage"));
function mqttInit() {
    const mqttClient = mqtt_1.default.connect('mqtt://m13.cloudmqtt.com', {
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
        });
    });
    mqttClient.on('message', (topic, message) => {
        const [deviceId, deviceType] = topic.toString().split('/');
        const msgObj = JSON.parse(message.toString());
        for (let el in msgObj) {
            test_storage_1.default.save({
                deviceId,
                deviceType,
                parameter: el,
                value: msgObj[el]
            });
        }
    });
}
exports.mqttInit = mqttInit;
