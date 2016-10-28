var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var mysql = require('mysql');
var CORS = require('cors')();
var bcrypt = require('bcrypt');
const saltRounds = 10;
 
app.use(CORS);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

var connection = mysql.createConnection({
    host    :'localhost',
    port : 3307,
    user : 'root',
    password : '',
    database: 'codin9cafe'
});

app.post('/register', function (req, res){
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.pw, salt, function(err, hash) {
      // Store hash in your password DB.
      var user = {
        'id': req.body.id,
        'pw': hash,
        'email': req.body.email
      };

      var q = connection.query('INSERT INTO users SET ?', user, function(err, result){
        if(err){
          res.status(500).send('{"status": "500", "msg": "Register Failed"}');
          console.error(err);
          throw err;
        }
        res.status(200).send('{"status": "200", "msg": "Register Success"}');
      }); 
    });
  });
});

app.post('/login', function(req, res){
  var user = {
    'id': req.body.id,
    'pw': req.body.pw,
  };

  var queryString = 'SELECT pw FROM users WHERE id=' + mysql.escape(user.id);
  var q = connection.query(queryString, function(err, result){
    if(err){
      res.status(500).send('{"status": "404", "msg": "No matched data"}');
      console.error(err);
      throw err;
    }

    if(result[0].pw) {
      hash = result[0].pw;
      bcrypt.compare(user.pw, hash, function(err, result) {
        if(result) {
          req.session.id = user.id;
          res.status(200).send('{"status": "200", "msg": "Login Success", "user": "' + user.id + '"}');
        }
      });
    }
  });
});

app.listen(3000, function() {
  console.log("I'm listening.");
});