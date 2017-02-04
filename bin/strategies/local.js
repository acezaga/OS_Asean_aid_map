/**
 * Created by Asus on 11/5/2016.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs');
    User = require('mongoose').model('accounts');

module.exports = function(){

  passport.use('signin',new LocalStrategy({passReqToCallBack: true},function(username, password, done){
      User.findOne({
          'username': username
      }, function(err, user){
          if(err){
              return done(err);
          }
          if(!user){
              return done(null, false, {
                  message: 'Unknown user'
              });
          }
          if(!isValidPassword(user, password)){
              return done(null, false, {
                  message: 'Invalid password'
              });
          }

          return done(null,user);
      });
  }));

  var isValidPassword = function(user, password){
      return bcrypt.compareSync(password, user.password);
  }
};