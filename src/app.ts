import express, { Application } from 'express';

const app: Application = express();
app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(5000, () => console.log('Server is running'));