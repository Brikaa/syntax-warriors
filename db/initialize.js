const mysql = require('mysql');
const config = require('./config');
const fs = require('fs/promises');

(async () => {
    delete config.connection_options.database;
    const con = mysql.createConnection({ ...config.connection_options, multipleStatements: true });
    const sql_statements = await fs.readFile('./initialize.sql', { encoding: 'utf-8' });

    console.log('Performing initial db sql statements');
    con.query(sql_statements);

    con.end();
    console.log('Done');
})();
