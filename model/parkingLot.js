const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const parkingLotsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    vacantCapacity: { type: Number },
    location: { type: String },
    modifiedAt: { type: Date, default: Date.now() },
    createdAt: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: 1 },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

parkingLotsSchema.index({
  name: 1,
  vacantCapacity: 1,
  vehicleType: 1,
});
module.exports = mongoose.model("parkingLots", parkingLotsSchema);
