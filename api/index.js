const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const db_config = require('../db/config');
const app = express();
const port = config.port;

const db = mysql.createConnection(db_config.connection_options);

app.get('/', (req, res) => {
    db.query('select * from users;', (error, results, fields) => {
        res.send(fields);
        console.log(error);
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
