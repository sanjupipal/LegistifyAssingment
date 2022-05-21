const mongoose = require("mongoose");
let Schema = mongoose.Schema
const vehicleTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    vehicleTypeRates: {
      "0-2hr": { type: Number, default: 20 },
      "2-4hr": { type: Number, default: 40 },
      "4+hr": { type: Number, default: 60 },
    },
    parkingLotId: {type: Schema.Types.ObjectId, ref: "parkingLots", required: true },
    capacity: { type: Number, required: true },
    vacantCapacity: { type: Number },
    modifiedAt: { type: Date, default: Date.now() },
    createdAt: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: 1 },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

vehicleTypeSchema.index({
  name: 1,
  vacantCapacity: 1,
  parkingLotId: 1,
});
module.exports = mongoose.model("vehicleTypes", vehicleTypeSchema);
