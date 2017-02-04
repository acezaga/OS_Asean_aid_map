/**
 * Created by Asus on 11/23/2016.
 */

var mongoose = require('mongoose');

var DonationSchema = new mongoose.Schema({
    projectId: String,
    from: String,
    resources: []
});

mongoose.model('Donations', DonationSchema);