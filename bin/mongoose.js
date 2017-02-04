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

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/app4db');
