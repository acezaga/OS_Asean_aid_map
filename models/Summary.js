/**
 * Created by Asus on 1/4/2017.
 */
var mongoose = require('mongoose');

var SummarySchema = new mongoose.Schema({
    project: {
        type: String,
        required: 'Project name is required'
    },
    activities: []
});

mongoose.model('Summary', SummarySchema);