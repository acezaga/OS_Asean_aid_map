/**
 * Created by Asus on 1/15/2017.
 */
var mongoose = require('mongoose');

var FAQSchema = new mongoose.Schema({
    email:{
        type: String
    },
    subject: {
        type: String
    },
    question: {
        type: String
    },
    answer: {
        type: String
    },
    answered: {
        type: Boolean,
        default: false
    }
});

mongoose.model('FAQ', FAQSchema);