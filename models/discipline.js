import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';
import Athlete from './athlete.js';
import Race from './race.js';
import Record from './record.js';

const Schema = mongoose.Schema;

const disciplineSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['none', 'hurdles', 'relay', 'steeple']
    },
    distance: {
        type: Number,
        required: true,
        min: 100,
        max: 10000
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ['women', 'men', 'girls', 'boys']
    },
});

disciplineSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Discipline', disciplineSchema);