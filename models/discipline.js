import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const disciplineSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['none', 'hurdles', 'relay', 'steeplechase']
    },
    distance: {
        type: Number,
        required: true,
        min: 100,
        max: 10000
    }
});

// Create the model from the schema and export it
export default mongoose.model('Discipline', disciplineSchema);