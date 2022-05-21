const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const parkingSchema = new mongoose.Schema(
  {
    vehicleNo: { type: String, required: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: "vehicleTypes" },
    parkingLotId: { type: Schema.Types.ObjectId, ref: "parkingLots" },
    startTime: { type: Date, default: Date.now(), required: true },
    endTime: { type: Date },
    amountPaid: { type: Number },
    parkingHistory: [],
    modifiedAt: { type: Date, default: Date.now() },
    createdAt: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: 1 },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

parkingSchema.index({
  name: 1,
  vacantCapacity: 1,
  parkingLotId: 1,
});
module.exports = mongoose.model("parkings", parkingSchema);
