/**
 * Created by Asus on 10/24/2016.
 */

var mongoose = require('mongoose');

var users = new mongoose.Schema({
    username: {
        type: String,
        required: 'Username is required',
        unique: true
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    orgname: {
        type: String,
        required: 'Organization name is required'
    },
    //email: {
    //    type: String,
    //    match: [/.+\@.+\..+/, "Please fill a valid e-mail address"],
    //    required: 'Username is required'
    //},
    country: {
        type: String,
        required: 'Country is required'
    },
    description: {
        type: String,
        required: 'Description is required'
    },
    mission: {
      type: String
    },
    vision: {
        type: String
    },
    picture: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    contacts: {
        type: Object,
        default: {
            email: "",
            website: "",
            telNo: ""
        }
    },
    awards: [],
    sectors: [],
    resources: [],
    connections: []
});

mongoose.model('accounts', users);