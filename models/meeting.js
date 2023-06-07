import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    start: {
        type: Date,
        require: true
    },
    end: {
        type: Date,
        require: true
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
        ref: 'Country'
    },
    races: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Race' 
    }],
});

// Create the model from the schema and export it
export default mongoose.model('Meeting', meetingSchema);