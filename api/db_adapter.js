const mysql = require('mysql');
const db_config = require('../db/config');

const conn = mysql.createConnection(db_config.connection_options);

module.exports.query = async (query_string, query_values = []) => {
    let results;
    await new Promise((resolve) => {
        conn.query(query_string, query_values, (e, r) => {
            if (e) {
                throw e;
            }
            results = r;
            resolve();
        });
    });
    return results;
};

module.exports.end_connection = () => {
    conn.end();
};
