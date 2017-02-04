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

var url = '127.0.0.1:27017/' + process.env.OPENSHIFT_APP_NAME;

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    url = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
}

mongoose.Promise = global.Promise;
mongoose.connect(url);

var db = mongoose.connection;

db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);
