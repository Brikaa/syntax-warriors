const express = require('express');
const cors = require('cors');
const db = require('./db_adapter');
const config = require('./config');
const body_parser = require('body-parser');

const app = express();
const port = config.port;
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());

app.post('/is_authorized', (req, res) => {
    if (!req.headers.hasOwnProperty('authorization')) {
        return res.status(200).send(false);
    }
    const username = str.slice(0, str.indexOf('-'));
    const password = str.slice(str.indexOf('-') + 1);
    return res.status(200).send(true);
})

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (password.length < 8) {
        return res.status(400).send('The password must be at least 8 characters long');
    }
    if (email.length < 1) {
        return res.status(400).send('An email address must be provided');
    }
    if (username.length < 1) {
        return res.status(400).send('A username must be provided');
    }
    if (username.match('[^A-Za-z0-9]')) {
        return res.status(400).send('The username must contain letters and numbers only');
    }

    try {
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
