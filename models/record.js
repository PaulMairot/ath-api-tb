import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const recordSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
        required: true
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race',
        required: true
    },
    discipline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discipline'
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: function(){
            return this.mention.charAt(0)==='N'? true : false 
        }
    },
    performance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Performance',
    },
    result: {
        type: Date
    },
    mention: {
        type: String,
        required: true,
        enum: { values: ['WR', 'OR', 'PR', 'CR', 'GR', 'MR', 'DLR', 'NR', 'PB'], 
                message: "{VALUE} is not supported, try a value from this list : [WR, OR, PR, CR, GR, MR, DLR, NR, PB]"}
    }
});

recordSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Record', recordSchema);