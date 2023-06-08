import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const performanceSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete'
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race'
    },
    result: {
        type: Date
    },
    position: [{ 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Position' 
    }],
    startingPressure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pressure'
    },
    reactionTime: {
        type: Number,
        min: -10.0,
        max: 10.0
    },
    mention: {
        type: String,
        required: true,
        enum: { values: ['SB', 'PB', 'NB', 'WB', 'MB', 'WR', 'OR', 'MR', 'NR', 'DNS', 'DNF', 'DQ'], 
                message: "{VALUE} is not supported, try a value from this list : [SB, PB, NB, WB, MB, WR, OR, MR, NR, DNS, DNF, DQ]"}
    }
}, { toJSON: { getters: true } }); 

// Create the model from the schema and export it
export default mongoose.model('Performance', performanceSchema);