import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const countrySchema = new Schema({
    alpha2: {
        type: String,
        required: true,
        lowercase: true,
        minlength: [2, "The alpha2 code of a country must have exactly 2 characters."],
        maxlength: [2, "The alpha2 code of a country must have exactly 2 characters."]
    },
    alpha3: {
        type: String,
        required: true,
        lowercase: true,
        minlength: [3, "The alpha3 code of a country must have exactly 2 characters."],
        maxlength: [3, "The alpha3 code of a country must have exactly 2 characters."]
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    }
});

countrySchema.pre('save', function (next) {
    // Capitalize only first letter
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase()
    next();
});

// Create the model from the schema and export it
export default mongoose.model('Country', countrySchema);