const mysql = require('mysql');
const config = require('./config');
const fs = require('fs');

(async () => {
    console.log('Removing migrations tracker file');
    if (fs.existsSync('./all_migrations.txt')) {
        fs.unlinkSync('./all_migrations.txt');
    }
    delete config.connection_options.database;
    const con = mysql.createConnection({ ...config.connection_options, multipleStatements: true });
    const sql_statements = fs.readFileSync('./initialize.sql', { encoding: 'utf-8' });

    console.log('Performing initial db sql statements');
    con.query(sql_statements, () => {
        console.log('Done');
    });
    con.end();
})();
