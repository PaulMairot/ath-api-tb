import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const positionSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete'
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race'
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
        type: Date
    },
    coordinates: [{
        type: Number,
        min: 0
    }]
});

positionSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Position', positionSchema);