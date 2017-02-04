/**
 * Created by Asus on 10/25/2016.
 */

var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Title Required',
        unique: true
    },
    picture: String,
    creator: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    address:{
        type: Object,
        default: {
            country: "",
            province: "",
            city: "",
            street: ""
        }
    },
    budget: {
        type: Object,
        default: {
            amount: 0
        }
    },
    sector: [],
    description: String,
    contacts: {
        type: Object,
        default: {
            email: "",
            website: "",
            telNo: ""
        }
    },
    //resources: [{name: String, description: String, amount: [Number]}],
    resources: [],
    status: {
        type: String,
        default: "Ongoing"
    },
    media: [],
    collaboration: []
});

mongoose.model('Projects', ProjectSchema);