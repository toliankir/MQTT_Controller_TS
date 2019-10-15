import express, { Application } from 'express';
import { mqttInit } from './mqtt';
import storage from './test-storage';

mqttInit();

const PORT = process.env.PORT || 5000;
const app: Application = express();


app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));