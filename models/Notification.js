/**
 * Created by Asus on 10/26/2016.
 */

var mongoose = require('mongoose');

var NotificationSchema = mongoose.Schema({
    to: {
        type: Object,
        default: {
            id: "",
            name: "",
            project: {
                type: Object
            }
        }
    },
    from: {
        type: Object,
        default: {
            id: "",
            name: "",
            project: {
                type: Object
            }
        }
    },
    date: {
        type: Date,
        default: new Date()
    },
    title: String,
    type: String,
    content: String,
    donation: [],
    answered: Boolean,
    answer: Boolean,
    seen: {
        type: Boolean,
        default: false
    },
    cancelled: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Notifications', NotificationSchema);