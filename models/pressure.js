import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const pressureSchema = new Schema({
    athlete: { 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Athlete',
        required: true
    },
    race: { 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Race',
        required: true
    },
    time: [{ 
        type : Number,
        required: true,
        min: -1000,
        max: 1000
    }],
    pressure: [{ 
        type : Number,
        required: true,
        min: 0,
        max: 3000
    }],
});

pressureSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Pressure', pressureSchema);