"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import { mqttInit } from './mqtt';
//import storage from './test-storage';
// mqttInit();
const app = express_1.default();
app.get('/', (req, res) => {
    res.send('Hello');
    // console.log(storage.getStorage());
});
/*app.get('/api', (req, res) => {
    res.send(JSON.stringify(storage.getStorage()));
});

app.get('/test', (req, res) => {
    // const deviceId = 'a020a610-5990';
    // const parameter = 'temperature';
    // const value = storage.getValue(deviceId, parameter);
    // console.log(value);
    const testStr = 'a020a610-5990.temperature<30&a020a610-5990.humidity<50|a020a610-5990.humidity<60';
    // console.log(testStr.match(/[&|]/g));
    const expressionArray = testStr.split(/[&|]/);
    // cb  onsole.log(testStr[2]);

    for (let expression of expressionArray) {
        const condition = expression.match(/[<>=]/);
        if (!condition) {
            continue;
        }

        const [device, controlValue] = expression.split(/[<>=]/);
        const [deviceId, parameter] = device.split('.');
        const currentValue = storage.getValue(deviceId, parameter);
        // console.log(currentValue, controlValue, condition);
        
        console.log(condition[0]);

    }
    console.log('----------------');

});
*/
app.listen(5000, () => console.log('Server is running'));
