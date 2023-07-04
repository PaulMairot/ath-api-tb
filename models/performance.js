import mongoose from 'mongoose';
import { format, getHours, getMinutes } from 'date-fns'
import { transformJson } from '../spec/utils.js';

import { manageRecord } from '../spec/utils.js';

const Schema = mongoose.Schema;

const performanceSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
        required: true
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race',
        required: true
    },
    lane: {
        type: Number,
        min: 1,
        max: 10
    },
    result: {
        type: Date,
        get: formatResult
    },
    position: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Position' 
    }],
    startingPressure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pressure'
    },
    reactionTime: {
        type: Number,
        min: -10.0,
        max: 10.0
    },
    stepsHurldes: [{
        type: Number,
        min: 0
    }],
    exchangeTime: {
        type: Date
    },
    mention: [{
        type: String,
        enum: { values: ['WR', 'OR', 'PR', 'CR', 'GR', 'MR', 'DLR', 'NR', 'PB', 'DNS', 'DNF', 'DQ'], 
                message: "{VALUE} is not supported, try a value from this list : [WR, OR, PR, CR, GR, MR, DLR, NR, PB, DNS, DNF, DQ]"}
    }]
});

function formatResult(result) {
    // Remove timezone offset
    let time = new Date(result.valueOf() + result.getTimezoneOffset() * 60 * 1000);

    // Adjust time format tokens
    let formatTokens = "HH:mm:ss.SSS";
    if (getHours(time) == 0) {
        formatTokens = "mm:ss.SSS";
    } 
    if (getHours(time) == 0 && getMinutes(time) == 0) {
        formatTokens = "ss.SSS";
    }

    return format(time, formatTokens);
}

performanceSchema.set("toJSON", {
    transform: transformJson,
    getters: true
});

// Create the model from the schema and export it
export default mongoose.model('Performance', performanceSchema);