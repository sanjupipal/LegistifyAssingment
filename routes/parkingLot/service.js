const ParkingLot = require("../../model/parkingLot");

const get = async (req, res) => {
  try {
    let { id } = req.query;
    let data = await ParkingLot.find(id ? { _id: id } : {}).lean();
    return res.status(200).json({ data, msg: "success" });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

const createOrUpdate = async (req, res) => {
  try {
    let { name, capacity, vacantCapacity } = req.body;
    if (!name || !capacity) throw { message: "name and capacity is required" };
    if (vacantCapacity > capacity)
      throw { message: "vacantCapacity can not be grater then capacity" };
    let data = await ParkingLot.findOneAndUpdate({ name }, req.body, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    return res.status(200).json({ msg: "created", data });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

module.exports = {
  get,
  createOrUpdate,
};
