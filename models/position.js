import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const positionSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete'
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race'
    },
    rank: {
        type: Number,
        min: 1,
        max: 30
    },
    gapToLeader: {
        type: Number,
        min: 0.0,
        max: 10000.0
    },
    speed: {
        type: Number,
        min: 0.0,
        max: 100.0
    },
    time: {
        type: Date
    },
    coordinates: [{
        type: Number,
        min: 0
    }]
});

// Create the model from the schema and export it
export default mongoose.model('Position', positionSchema);