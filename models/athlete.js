import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

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
    gender: {
        type: String,
        lowercase: true,
        enum: ['women', 'men', 'girls', 'boys']
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

athleteSchema.pre('save', function (next) {
    // Capitalize only first letter
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();

    next();
});

athleteSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Athlete', athleteSchema);