/**
 * Created by Asus on 1/4/2017.
 */
var mongoose = require('mongoose');

var PerformanceSchema = new mongoose.Schema({
    project: String,
    evaluator: String,
    evaluation: {},
    overall: {
        type: Object,
        default: {
            evaluation: "",
            score: 0
        }
    }
});

mongoose.model('Performance', PerformanceSchema);