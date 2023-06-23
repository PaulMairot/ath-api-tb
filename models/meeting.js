import mongoose from 'mongoose';
import { transformJson, formatDate } from '../spec/utils.js';

const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    name: {
        type: String,
        require: true,
        minlength: 2,
        maxlength: 100
    },
    startDate: {
        type: Date,
        require: true,
        get: formatDate
    },
    endDate: {
        type: Date,
        require: true,
        get: formatDate
    },
    location: {
        type: String,
        require: true,
        minlength: 5,
        maxlength: 50
    },
    city: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        require: true
    },
    races: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Race' 
    }],
});

meetingSchema.pre('save', function (next) {
    // Capitalize first letter of each word
    this.name = this.name.split(" ").map((word) => { 
        return word[0].toUpperCase() + word.substring(1);
    }).join(" ");

    // Capitalize first letter
    this.city = this.city.charAt(0).toUpperCase() + this.city.slice(1).toLowerCase();

    next();
});


meetingSchema.set("toJSON", {
    transform: transformJson,
    getters: true
});

// Create the model from the schema and export it
export default mongoose.model('Meeting', meetingSchema);