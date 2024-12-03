const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { addEvent, getEvents, setupNotifications } = require('./events');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// HTTP Endpoints
app.post('/events', (req, res) => {
    const { title, description, time } = req.body;
    try {
        const event = addEvent(title, description, time);
        res.status(201).json({ message: 'Event added successfully', event });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/events', (req, res) => {
    res.status(200).json(getEvents());
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket Setup
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
});

// Schedule Notifications
setupNotifications(wss);
