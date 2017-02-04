/**
 * Created by Asus on 11/1/2016.
 */
var mongoose = require('mongoose');

require('../models/UserAccounts');
require('../models/Projects');
require('../models/Chat');
require('../models/Notification');
require('../models/Donation');
require('../models/Summary');
require('../models/Performance');
require('../models/FAQ');

var url = 'mongodb://'+process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;

// if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    // url = process.env.OPENSHIFT_MONGODB_DB_URL +
    // process.env.OPENSHIFT_APP_NAME;
// }

mongoose.Promise = global.Promise;
var connect = function () {
    mongoose.connect(url);
};
connect();

var db = mongoose.connection;

db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);
