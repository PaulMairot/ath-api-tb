import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const pressureSchema = new Schema({
    athlete: { 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Athlete' 
    },
    race: { 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Race' 
    },
    time: [{ 
        type : Number,
        min: -1000,
        max: 1000
    }],
    pressure: [{ 
        type : Number,
        min: 0,
        max: 2000
    }],
});

pressureSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Pressure', pressureSchema);