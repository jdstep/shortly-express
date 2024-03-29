var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(cookieParser());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(util.checkUser);

app.get('/',
function(req, res) {
  res.render('index');
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var passwordPlain = req.body.password;
  var salt;
  var passwordHash;

  bcrypt.genSaltAsync(null).then(function(result) {
    salt = result;
    console.log('brand new salt is:', salt);
    return bcrypt.hashAsync(passwordPlain, salt, null);
  }).then(function(hashResult) {
    passwordHash = hashResult;
    console.log('brand new hash is:', passwordHash);
    return passwordHash;
  }).then(function() {
    console.log('checking if user exists already');
    return new User({ username: username }).fetch();
  }).then(function(found) {
    console.log('user is ', found);
    if (found) {
      console.log('error, user already exists.');
      res.render('login');
    } else {
      var user = new User( {
        username: username,
        password: passwordHash,
        salt: salt
      });
      return user;
    }
  }).then(function(user) {
    console.log('saving the user:', user);
    return user.save();
  }).then(function(newUser) {
    console.log('adding user:', newUser);
    Users.add(newUser);
    res.redirect('/login');
  });
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // console.log(req.body);
  var username = req.body.username;
  var passwordPlain = req.body.password;
  var salt;
  var passwordHash;
  var passwordHashInTable;
  // crazy password stuff

  new User({ username: username }).fetch()
  .then(function(found) {
    if (found) {
      salt = found.get('salt');
      passwordHashInTable = found.get('password');
      console.log('salt:', salt, 'passwordHashInTable:', passwordHashInTable);
      return bcrypt.hashAsync(passwordPlain, salt, null);
    } else {
      res.redirect('/login');
    }
  })
  .then(function(hashResult) {
    passwordHash = hashResult;
    if (passwordHash === passwordHashInTable) {
      res.cookie('loggedin', 'true', {maxAge: 900000});
      res.redirect('/index');
    } else {
      res.redirect('/login');
    }
  });



  // });

  // make a new user model
  //  check if the new user model username matches a user currently in the db
  //    check if password matches
  //      if yes, let the user go to the index page
  //      if no, reload login page
});

app.get('/logout', function(req, res) {
  res.clearCookie('loggedin');
  res.redirect('/index');
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
