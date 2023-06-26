import mongoose from 'mongoose';
import { transformJson, formatTime } from '../spec/utils.js';

const Schema = mongoose.Schema;

const raceSchema = new Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    plannedStartTime: {
        type: Date,
        get: formatTime
    },
    realStartTime: {
        type: Date,
        get: formatTime
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['pending', 'live', 'finished', 'cancelled']
    },
    discipline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discipline',
        required: true
    },
    windSpeed: {
        type: Number,
    },
    temperature: {
        type: Number,
    },
    conditions: {
        type: String,
        enum: { values: ['sunny', 'cloudy', 'partly cloudy', 'clear skies', 'overcast', 'rainy', 'showers', 'drizzle', 'thunderstorms', 'lightning', 'hail', 'snowy', 'foggy', 'misty', 'smoggy', 'windy'], 
                message: "{VALUE} is not supported, try a value from this list : [sunny, cloudy, partly cloudy, clear skies, overcast, rainy, showers, drizzle, thunderstorms, lightning, hail, snowy, foggy, misty, smoggy, windy]"}
    },
    athletes: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Athlete' 
    }],
    performances: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Performance'
    }],
});

raceSchema.set("toJSON", {
    transform: transformJson,
    getters: true
});

// Create the model from the schema and export it
export default mongoose.model('Race', raceSchema);