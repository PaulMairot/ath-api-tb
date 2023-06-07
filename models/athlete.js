import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const athleteSchema = new Schema({
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    dateOfBirth: {
        type: Date
    },
    nationality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    discipline: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Discipline' 
    }],
});

// Create the model from the schema and export it
export default mongoose.model('Athlete', athleteSchema);