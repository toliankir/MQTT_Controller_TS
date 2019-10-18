require('dotenv').config();
import express, { Application } from 'express';
import { mqttInit } from './mqtt';
import stateStorage from './test-storage';
import archive from './sql_storage';
import { runExpression } from './expression';

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

app.get('/save', async (req, res) => {
    const savedItems = await archive.saveState(stateStorage.getStorage(), ['sensor']);
    res.send(`Data saved ${savedItems}`);

});

app.get('/get/:deviceId', async (req, res) => {
    // const savedItems = await archive.saveState(stateStorage.getStorage(), ['sensor']);
    const itemData = await archive.getByDeviceId(req.params.deviceId)
    // console.log(itemData);
    res.send(JSON.stringify(itemData));
});

app.get('/test', (req, res) => {
    const testStr = 'ESP.temperature>20&ESP_1071504.temperature>10';
    console.log(runExpression(testStr));
    res.send('test expression');
});


app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
