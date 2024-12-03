const fs = require('fs');

function logEvent(event) {
    const logEntry = {
        id: event.id,
        title: event.title,
        description: event.description,
        completedAt: new Date().toISOString(),
    };

    fs.appendFile('completed_events.log', JSON.stringify(logEntry) + '\n', (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

module.exports = { logEvent };
