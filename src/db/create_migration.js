const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.error('A migration name is required');
    process.exit(1);
}

const migration_name = Date.now() + '-' + process.argv[2].replace(' ', '-') + '.sql';
const migration_path = path.join(__dirname, 'migrations', migration_name);
fs.writeFileSync(migration_path, '');
console.log(`${migration_name} created in the migrations folder`);
