const mysql = require('mysql');
const config = require("./config");
var con = mysql.createConnection(config.connection_options);


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});