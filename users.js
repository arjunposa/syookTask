const mongoose = require("mongoose");

const { Schema } = mongoose;

const DataSchema = new Schema({
  name: String,
  origin: String,
  destination: String,
  date: {
    type: Date,
    default: Date.now,
  },
},
{
    timestamps: true, 
    timeseries: {
        timeField: 'date',
        metaFields: ['name', 'origin', 'destination']
    }
});
  


module.exports = mongoose.model("users", DataSchema);
