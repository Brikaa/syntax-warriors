const express = require('express');
const cors = require('cors');
const db = require('./db_adapter');
const config = require('./config');
const body_parser = require('body-parser');

const app = express();
const port = config.port;
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
const corsOptions = {
    origin: config.front_url,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

class RequestBodyException {
    constructor(message) {
        this.message = message;
    }
}

const handle_api_errors = (e, res) => {
    if (e instanceof RequestBodyException) {
        return res.status(400).send(e.message);
    }
    console.error(e);
    return res.status(500);
};

const check_missing_properties = (req_body, required_properties) => {
    const missing_properties = required_properties.filter((p) => req_body.hasOwnProperty(p));
    console.log({ req_body, required_properties, missing_properties });
    if (missing_properties.length > 0) {
        throw new RequestBodyException(
            'Missing request body properties: ' + missing_properties.join(', ')
        );
    }
};

app.post('/get_user', async (req, res) => {
    try {
        check_missing_properties(req.body, ['username', 'password']);
        console.log(req.body);
        const { username, password } = req.body;
        if (username === null || password === null) {
            return res.status(200).send({ user: null });
        }
        if (typeof username !== 'string') {
            return res.status(400).send('The username must be provided as a string');
        }
        if (typeof password !== 'string') {
            return res.status(400).send('The password must be provided as a string');
        }
        const users = await db.query(
            'select username, email, no_wins, score from users where username = ? and password = ?',
            [username, password]
        );
        if (users.length < 1) {
            return res.status(200).json({ user: null });
        }
        return res.status(200).json({ user: users[0] });
    } catch (e) {
        handle_api_errors(e, res);
    }
});

app.post('/signup', async (req, res) => {
    try {
        check_missing_properties(req.body, ['username', 'email', 'password']);
        const { username, email, password } = req.body;
        // Validate body data
        if (typeof password !== 'string' || password.length < 8) {
            return res
                .status(400)
                .send('A string password that is at least 8 characters long must be provided');
        }
        if (typeof email !== 'string' || email.length < 1) {
            return res.status(400).send('A string email address must be provided');
        }
        if (typeof username !== 'string' || username.length < 1) {
            return res.status(400).send('A string username must be provided');
        }
        if (username.match('[^A-Za-z0-9]')) {
            return res.status(400).send('The username must contain letters and/or numbers only');
        }

        // Create user if doesn't exist
        const same_usernames = await db.query(
            'select username, email from users where username = ? or email = ?',
            [username, email]
        );
        if (same_usernames.length > 0) {
            const what_exists = same_usernames[0].email === email ? 'email' : 'username';
            return res.status(400).send(`This ${what_exists} already exists`);
        }
        await db.query('insert into users (email, username, password) values (?, ?, ?)', [
            email,
            username,
            password
        ]);
        return res.status(200).send();
    } catch (e) {
        handle_api_errors(e, res);
    }
});

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
