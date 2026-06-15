const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
    nhietdo: Number,
    doamkk: Number,
    doamdat: Number,
    anhsang: Number,
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Sensor = mongoose.model("sensor",sensorSchema);

module.exports = Sensor;