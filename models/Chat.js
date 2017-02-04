/**
 * Created by Asus on 10/25/2016.
 */

var mongoose = require('mongoose');

var ChatSchema = mongoose.Schema({
    from: {
        type: Object,
        default: {
            id: "",
            name: ""
        }
    },
    to: {
        type: Object,
        default: {
            id: "",
            name: ""
        }
    },
    type: String,
    dateCreated: {
        type: Date,
        default: new Date()
    },
    message: String,
    seen: {
        type: Boolean,
        default: false
    }
    //members: []
});

mongoose.model('Chat', ChatSchema);