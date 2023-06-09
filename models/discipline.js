import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

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
    }
});

disciplineSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Discipline', disciplineSchema);