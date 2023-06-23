import mongoose from 'mongoose';
import { transformJson } from '../spec/utils.js';

const Schema = mongoose.Schema;

const recordSchema = new Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
        require: true
    },
    race: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Race',
        require: true
    },
    performance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Performance',
        require: true
    },
    mention: {
        type: String,
        enum: { values: ['NB', 'WB', 'MB', 'WR', 'OR', 'MR', 'NR'], 
                message: "{VALUE} is not supported, try a value from this list : [NB, WB, MB, WR, OR, MR, NR]"}
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: function(){
            return this.mention.charAt(0)==='N'? true : false 
        }
    },
});

recordSchema.set("toJSON", {
    transform: transformJson
});

// Create the model from the schema and export it
export default mongoose.model('Record', recordSchema);