import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const countrySchema = new Schema({
    alpha2: {
        type: String,
        required: true,
        minlength: [2, "The alpha2 code of a country must have exactly 2 characters."],
        maxlength: [2, "The alpha2 code of a country must have exactly 2 characters."]
    },
    alpha3: {
        type: String,
        required: true,
        minlength: [3, "The alpha3 code of a country must have exactly 3 characters."],
        maxlength: [3, "The alpha3 code of a country must have exactly 3 characters."]
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 80
    }
});

countrySchema.pre('save', function (next) {
    // Capitalize only first letter
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    // Capitalize codes
    this.alpha2 = this.alpha2.toUpperCase();
    this.alpha3 = this.alpha3.toUpperCase();

    next();
});

countrySchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Country', countrySchema);