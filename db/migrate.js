const mysql = require('mysql');
const fs = require('fs');
const config = require('./config');

const migrations_file_path = './all_migrations.txt';

(async () => {
    const con = mysql.createConnection({ ...config.connection_options, multipleStatements: true });
    console.log('Created a DB connection');

    console.log('Applying the migrations');
    let applied_migrations = [];
    if (fs.existsSync(migrations_file_path)) {
        applied_migrations = fs.readFileSync(migrations_file_path).toString().split('\n');
    }

    const all_migrations = fs.readdirSync('./migrations');

    for (const migration of all_migrations) {
        if (applied_migrations.includes(migration)) {
            console.log(`Already applied ${migration}`);
            continue;
        }
        const migration_statements = fs.readFileSync('migrations/' + migration).toString();
        con.query(migration_statements, (error) => {
            if (error) {
                throw error;
            }
            console.log('Applied ' + migration);
            fs.writeFileSync(migrations_file_path, all_migrations.join('\n'));
        });
    }

    con.end();
})();
