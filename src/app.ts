require('dotenv').config();
import express, { Application } from 'express';
import { mqttInit, setRelay } from './mqtt';
import stateStorage from './state';
import archive from './sql_storage';
import { cronStart } from './cron';
import logger from './logger';
import state from './state';
import { initVirtualDevices } from './virtual_devices';
import ruleHandler from './rule';

mqttInit();
cronStart();
// initVirtualDevices();

const PORT = process.env.PORT || 5000;
const app: Application = express();

ruleHandler.initRules();
stateStorage.onStateChange(() => {
    ruleHandler.checkAllRules();
});

const apiPrefix = '/api/v0.1/'

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get(`${apiPrefix}getAllDevices`, (req, res) => {
    res.send(JSON.stringify(stateStorage.getStorage()));
});

app.get(`${apiPrefix}getAllRules`, async (req, res) => {
    res.send(JSON.stringify(await archive.getRules()));
});

app.get(`${apiPrefix}getDevice/:deviceId`, async (req, res) => {
    res.send(JSON.stringify(await archive.getByDeviceId(req.params.deviceId)));
});

app.get('/test', async (req, res) => {
    // const testStr = 'ESP_1071504.temperature>10';
    // const ruleId = await archive.addRule(testStr, {
    //     defaultValue: 11,
    //     trueValue: 22,
    //     falseValue: 0
    // }, 'esp/relay1');
    // console.log(ruleId);
    // const rule = await archive.getRule(11);
    // res.send(JSON.stringify(rule));
    // console.log(runExpression(testStr));
    // archive.deleteRule(9);
    // archive.updateRule(9, '1234', 22);
    // setRelay('ESP_12001655', 0, true);
    res.send('test expression');

    // const rules = await archive.getRules();
    //    res.send(JSON.stringify(rules));
});


app.listen(PORT, () => logger.log({ level: 'info', message: `Server is running on ${PORT}` }));
