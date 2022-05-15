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

const validate_username = (username) => {
    return !username.match('[^A-Za-z0-9]');
};

app.post('/is_authorized', async (req, res) => {
    try {
        if (!req.headers.hasOwnProperty('authorization')) {
            return res.status(200).send(false);
        }
        const auth_str = req.headers.authorization;
        const username = auth_str.slice(0, auth_str.indexOf('-'));
        if (!validate_username(username)) {
            return res.status(200).send(false);
        }
        const password = auth_str.slice(auth_str.indexOf('-') + 1);
        const users = await db.query(
            'select username from users where username = ? and password = ?',
            [username, password]
        );
        return res.status(200).send(users.length >= 1);
    } catch (e) {
        return res.status(500).send();
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(typeof username);
        // Validate body data
        if (
            !req.body.hasOwnProperty('password') ||
            typeof password !== 'string' ||
            password.length < 8
        ) {
            return res
                .status(400)
                .send('A string password that is at least 8 characters long must be provided');
        }
        if (!req.body.hasOwnProperty('email') || typeof email !== 'string' || email.length < 1) {
            return res.status(400).send('A string email address must be provided');
        }
        if (
            !req.body.hasOwnProperty('username') ||
            typeof username !== 'string' ||
            username.length < 1
        ) {
            return res.status(400).send('A string username must be provided');
        }
        if (!validate_username(username)) {
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
        console.error(e);
        return res.status(500).send();
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
