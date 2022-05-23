const mysql = require('mysql');
const config = require('./config');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Removing migrations tracker file');
    if (fs.existsSync(path.join(__dirname, 'all_migrations.txt'))) {
        fs.unlinkSync(path.join(__dirname, 'all_migrations.txt'));
    }
    delete config.connection_options.database;
    const con = mysql.createConnection({ ...config.connection_options, multipleStatements: true });
    const sql_statements = fs.readFileSync(path.join(__dirname, 'initialize.sql'), {
        encoding: 'utf-8'
    });

    console.log('Performing initial db sql statements');
    con.query(sql_statements, (e) => {
        if (e) {
            throw e;
        }
        console.log('Done');
    });
    con.end();
})();
