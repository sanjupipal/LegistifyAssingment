const vehicleType = require("../../model/vehicleType");
const ParkingLot = require("../../model/parkingLot");

const get = async (req, res) => {
  try {
    let { id, parkingLotId } = req.query;
    let data = await vehicleType
      .find(id ? { _id: id } : parkingLotId ? { parkingLotId } : {})
      .lean();
    if (!data) throw { message: "no data found" };
    return res.status(200).json({ data, msg: "success" });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

const createOrUpdate = async (req, res) => {
  try {
    let { name, capacity, parkingLotId } = req.body;
    if (!name || !capacity || !parkingLotId)
      throw { message: "name, parkingLotId and capacity is required" };

    let parkingLot = await ParkingLot.findOne({ _id: parkingLotId }).lean();
    if (!parkingLot) {
      throw { message: "no parking lot found" };
    }
    await vehicleType.findOneAndUpdate(
      { $and: [{ name }, { parkingLotId }] },
      req.body,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    return res.status(200).json({ msg: "created" });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

module.exports = {
  get,
  createOrUpdate,
};
