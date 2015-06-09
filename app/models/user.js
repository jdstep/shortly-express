var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,

  initialize: function() {
    this.on('creating', this.makePassword.bind(this);
  },

  makePassword: function (){
    Promise.promisify(bcrypt.genSalt);
    bcrypt.genSalt
  }
});

module.exports = User;
