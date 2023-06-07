import mongoose from 'mongoose';
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

// Create the model from the schema and export it
export default mongoose.model('Weather', weatherSchema);