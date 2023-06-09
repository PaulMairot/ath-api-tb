import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const weatherSchema = new Schema({
    windSpeed: {
        type: Number,
    },
    temperature: {
        type: Number,
        required: true,
    },
    conditions: {
        type: String,
        required: true,
        enum: { values: ['sunny', 'cloudy', 'partly cloudy', 'clear skies', 'overcast', 'rainy', 'showers', 'drizzle', 'thunderstorms', 'lightning', 'hail', 'snowy', 'foggy', 'misty', 'smoggy', 'windy'], 
                message: "{VALUE} is not supported, try a value from this list : [sunny, cloudy, partly cloudy, clear skies, overcast, rainy, showers, drizzle, thunderstorms, lightning, hail, snowy, foggy, misty, smoggy, windy]"}
    }
});

weatherSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Weather', weatherSchema);