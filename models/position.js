import mongoose from 'mongoose';
import { format } from 'date-fns'
import { transformJson, formatTimeRace } from '../spec/utils.js';

const Schema = mongoose.Schema;

const positionSchema = new Schema({
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
    rank: {
        type: Number,
        min: 1,
        max: 30
    },
    runnedDistance: {
        type: Number,
        min: 0
    },
    gapToLeader: {
        type: Number,
        min: 0.0,
        max: 1000.0
    },
    speed: {
        type: Number,
        min: 0.0,
        max: 100.0
    },
    time: {
        type: Date,
        get: formatTimeRace,
        required: true
        
    },
    coordinates: [{
        type: Number,
        min: 0,
        required: true
    }]
});

positionSchema.set("toJSON", {
    transform: transformJson,
    getters: true
});

// Create the model from the schema and export it
export default mongoose.model('Position', positionSchema);