var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var mysql = require('mysql');
var CORS = require('cors')();
var bcrypt = require('bcrypt');
const saltRounds = 10;
 
app.use(CORS);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host    :'localhost',
    port : 3307,
    user : 'root',
    password : '',
    database: 'codin9cafe'
});

app.post('/register', function (req, res){
  connection.connect(function(err) {
    if (err) {
      res.status(500).send('mysql connection error');
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
  });

  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.pw, salt, function(err, hash) {
      // Store hash in your password DB.
      if(err) {
        console.error(err);
        res.status(500).send('Register Failed');
      }

      var user = {
        'id': req.body.id,
        'pw': hash,
        'email': req.body.email
      };

      var q = connection.query('INSERT INTO users SET ?', user, function(err, result){
        if(err){
          res.status(500).send('Register Failed');
          console.error(err);
          connection.end();
          throw err;
        }
        connection.end();
        res.status(200).send('Register Success');
      }); 
    });
  });
});

app.listen(3000, function() {
  console.log("I'm listening.");
});