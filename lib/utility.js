var request = require('request');
var cookieParser = require('cookie-parser');
var users = require('../app/collections/users.js');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

var restricted = {
  '/links': true,
  '/create': true,
  '/': true
};

exports.checkUser = function(req, res, next) {

  // console.log(req.cookies.loggedin);
  if (restricted[req.url]) {
    // console.log(req.url);
    if (req.cookies.loggedin) {
      next();
    } else {
      console.log('you are trying to access a restricted url!');
      res.redirect('/login');
      // res.end();
    }
  } else {
    next();
  }
};

exports.hashPassword = function(username, password) {
  var salt;

  // users.query().where({username: username}).then(function(user) {

  //   console.log(user);

  // // }get('salt').then(function(saltGet) {
  // //   console.log("in hash password, the salt for " + username + " is " + saltGet);
  // });
};
