// Framework related
const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');

// Configuration and adapters
const db = require('./db_adapter');
const config = require('./config');

// Middleware
const users_middleware = require('./middleware/users');

// Exceptions
const BadRequestException = require('./bad_request_exception');

// Constants
const app = express();
const port = config.port;
const corsOptions = {
    origin: config.front_url,
    optionsSuccessStatus: 200
};
app.locals.db = db;

// Using middleware
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

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

app.use(users_middleware);

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
