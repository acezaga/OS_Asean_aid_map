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

var connection_string = 'mongodb://127.0.0.1/app4db';

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

mongoose.Promise = global.Promise;
mongoose.connect(connection_string);
