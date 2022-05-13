const mysql = require('mysql');
const config = require('./config');
const fs = require('fs/promises');

(async () => {
    const con = mysql.createConnection({ ...config.connection_options, multipleStatements: true });
    const sql_statements = await fs.readFile('./initialize.sql', { encoding: 'utf-8' });

    con.connect(function (err) {
        if (err) throw err;
        console.log('Connected!');
    });

    console.log('performing initial db sql statements');
    con.query(sql_statements);

    con.end();
})();
