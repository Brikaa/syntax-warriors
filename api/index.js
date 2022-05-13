const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const db_config = require('../db/config');
const app = express();
const port = config.port;

app.get('/', (req, res) => {
    const db = mysql.createConnection(db_config.connection_options);
    db.connect(function (err) {
        if (err) throw err;
        console.log('Initialized db connection');
    });
    db.query('select * from users;', (error, results, fields) => {
        res.send(results[0].username);
    });
    db.end();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
