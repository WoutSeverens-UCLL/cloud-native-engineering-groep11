import express from 'express';
const app = express();

const port = process.env.APP_PORT || 3000;

app.get('/status', (req, res) => {
    res.json({ message: 'Back-end is running...' });
});

app.listen(port || 3000, () => {
    console.log(`Back-end is running on port ${port}.`);
});

