const fs = require('fs');

if (process.argv.length < 3) {
    console.error('A migration name is required');
    process.exit(1);
}

const migration_name = Date.now() + '-' + process.argv[2].replace(' ', '-') + '.sql';
fs.writeFileSync(`./migrations/${migration_name}`, '');
console.log(`${migration_name} created in the migrations folder`);
