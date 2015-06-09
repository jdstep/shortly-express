var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false

  // initialize: function() {
  //   // this.on('creating', this.makePassword);
  // }

  // makePassword: function() {

  //   var context = this;

  //   var genSalt = Promise.promisify(bcrypt.genSalt, bcrypt);
  //   var hash = Promise.promisify(bcrypt.hash, bcrypt);

  //   genSalt(null).then(function(salt) {
  //     console.log(salt);
  //     context.set('salt', salt);
  //     return salt;



  //   }).then(function(salt) {
  //     var password = context.get('password');

  //     hash(password, salt, null).then(function(hash) {
  //       context.set('password', hash);
  //     }).then(function() {
  //       console.log(context.get('password'));
  //     });


  //   });

  // }
});

module.exports = User;
