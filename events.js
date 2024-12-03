const fs = require('fs');
const cron = require('node-cron');

let events = [];

// Add a new event
function addEvent(title, description, time) {
    const eventTime = new Date(time);
    if (isNaN(eventTime)) throw new Error('Invalid time format');

    // Check for overlapping events
    const overlap = events.some((event) => event.time.getTime() === eventTime.getTime());
    if (overlap) throw new Error('Event overlaps with an existing event');

    const event = { id: Date.now().toString(), title, description, time: eventTime };
    events.push(event);
    events.sort((a, b) => a.time - b.time); // Sort by time
    return event;
}

// Fetch upcoming events
function getEvents() {
    return events.filter((event) => event.time > new Date());
}

// Log completed events to a file
function logCompletedEvent(event) {
    const logEntry = {
        id: event.id,
        title: event.title,
        description: event.description,
        completedAt: new Date().toISOString(),
    };

    // Write to the completed events log file
    fs.appendFile('completed_events.log', JSON.stringify(logEntry) + '\n', (err) => {
        if (err) console.error('Error logging event:', err);
        else console.log(`Logged completed event: ${event.title}`);
    });
}

// Notify users and handle completed events
function setupNotifications(wss) {
    cron.schedule('* * * * *', () => {
        const now = new Date();
        const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);

        events.forEach((event, index) => {
            // Send notification for upcoming events
            if (event.time <= in5Minutes && event.time > now) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ message: `Event starting soon: ${event.title}` }));
                    }
                });
            }

            // Log completed events
            if (event.time <= now) {
                logCompletedEvent(event);  // Log the completed event
                events.splice(index, 1);    // Remove the event from the list
            }
        });
    });
}

module.exports = { addEvent, getEvents, setupNotifications };
