import express, { Application } from 'express';
import { mqttInit } from './mqtt';
import stateStorage from './test-storage';
import archive from './sql_storage';

mqttInit();

const PORT = process.env.PORT || 5000;
const app: Application = express();
// const archive: ArchiveStoage = SqlArchiveStorage();

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/api', (req, res) => {
    res.send(JSON.stringify(stateStorage.getStorage()));
});

app.get('/save', (req, res) => {
    archive.saveState(stateStorage.getStorage(), ['sensor']);
});

app.get('/test', (req, res) => {
    // const deviceId = 'a020a610-5990';
    // const parameter = 'temperature';
    // const value = storage.getValue(deviceId, parameter);
    // console.log(value);
    const testStr = 'ESP.temperature<30&ESP.humidity<50|ESP.humidity<60';
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
        const currentValue = stateStorage.getValue(deviceId, parameter);
        // console.log(currentValue, controlValue, condition);

        console.log(currentValue, condition[0], controlValue);

    }
    console.log('----------------');

});


app.listen(PORT, () => console.log(`Server is running on ${PORT}`));