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
app.use(cors())

const create_connection = () => {
    return mysql.createConnection(db_config.connection_options);
};

app.get('/', (req, res) => {
    const db = create_connection();
    db.query('select * from users;', (error, results, fields) => {
        res.send(fields);
    });
    db.end();
});

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
