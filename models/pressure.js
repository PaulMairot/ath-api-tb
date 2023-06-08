import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pressureSchema = new Schema({
    time: [{ 
        type : Number,
        min: -1000,
        max: 1000
    }],
    pressure: [{ 
        type : Number,
        min: 0,
        max: 2000
    }],
});

// Create the model from the schema and export it
export default mongoose.model('Pressure', pressureSchema);