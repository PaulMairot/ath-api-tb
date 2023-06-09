import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const raceSchema = new Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    plannedStartTime: {
        type: Date,
    },
    realStartTime: {
        type: Date
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['pending', 'live', 'finished', 'cancelled']
    },
    discipline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discipline',
        required: true
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['women', 'men', 'girls', 'boys', 'mixed']
    },
    weather: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weather'
    },
    athletes: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Athlete' 
    }],
});

// Create the model from the schema and export it
export default mongoose.model('Race', raceSchema);