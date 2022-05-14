const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const config = require('./config');
const db_config = require('../db/config');
const body_parser = require('body-parser');

const app = express();
const port = config.port;
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());

const db = mysql.createConnection(db_config.connection_options);

app.post('/signup', (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (password.length < 8) {
            return res.status(400).send('The password must be at least 8 characters long');
        }
        if (email.length < 1) {
            return res.status(400).send('An email address must be provided');
        }

        db.query(
            'select username, email from users where username = ? or email = ?',
            [username, email],
            (error, results) => {
                if (results.length > 0) {
                    console.log(results[0]);
                    const what_already_exists = results[0].email === email ? 'email' : 'username';
                    return res.status(400).send(`This ${what_already_exists} already exists`);
                } else {
                    db.query(
                        'insert into users(email, username, password) values (?, ?, ?)',
                        [email, username, password],
                        () => {
                            res.status(200).send();
                        }
                    );
                    res.status(200).send();
                }
            }
        );
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
