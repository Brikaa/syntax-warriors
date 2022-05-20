// Framework related
const express = require('express');
const body_parser = require('body-parser');

// Configuration and adapters
const db = require('./db_adapter');
const config = require('./config');

// Exceptions
const BadRequestException = require('./exceptions/bad_request_exception');

// Constants
const app = express();
const port = config.port;
const corsOptions = {
    origin: config.front_url,
    optionsSuccessStatus: 200
};
app.locals.db = db;

// Using external middleware
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(require('cors')(corsOptions));

app.use((req, res, next) => {
    if (
        !req.headers.hasOwnProperty('content-type') ||
        !req.headers['content-type'].startsWith('application/json')
    ) {
        return res.status(415).send({
            message: 'Requests must be of type application/json'
        });
    }
    next();
});

// Using internal middleware
app.use(require('./middleware/users'));
app.use(require('./middleware/admins'));
app.use(require('./middleware/contests'));

app.use((err, req, res, next) => {
    if (err instanceof BadRequestException) {
        return res.status(400).send(err.message);
    }
    console.error(err);
    return res.status(500).send();
});

// Process
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const end_gracefully = () => {
    console.log('Closing the database connection');
    db.end_connection();
    console.log('Ending the process');
    process.exit(0);
};

process.on('SIGINT', () => {
    end_gracefully();
});

process.once('SIGUSR2', () => {
    end_gracefully();
});
