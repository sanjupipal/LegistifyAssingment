const Parking = require("../../model/parking");
const ParkingLot = require("../../model/parkingLot");
const VehicleType = require("../../model/vehicleType");

const get = async (req, res) => {
  try {
    let { id } = req.query;
    let data = await Parking.find(id ? { _id: id } : {}).lean();
    return res.status(200).json({ data, msg: "success" });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

const parkingEntry = async (req, res) => {
  try {
    let { vehicleNo, carType, parkingLotId } = req.body;

    carType = await VehicleType.findOne({
      $and: [{ name: carType }, { parkingLotId }],
    }).lean();
    if (!carType) {
      throw { message: "vehicle type not added in parkingLot" };
    }
    if (carType.vacantCapacity == 0) throw { message: "No Parking Space" };

    let parkingLotData = await ParkingLot.findOne({ _id: parkingLotId }).lean();
    if (!parkingLotData) {
      throw { message: "incorrect parkingLotId" };
    }
    if (parkingLotData.vacantCapacity == 0) {
      throw { message: "No Parking Space" };
    }

    let data = {
      vehicleNo,
      vehicleTypeId: carType._id,
      parkingLotId,
      startTime: new Date(),
      endTime: null,
      amountPaid: null,
    };

    updateVacantParking(carType._id, parkingLotId, "-");
    let newData = await Parking.findOneAndUpdate(
      { $and: [{ vehicleNo }, { parkingLotId }] },
      { $set: { ...data } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    return res.status(200).json({ newData, msg: "created" });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

const parkingExit = async (req, res) => {
  try {
    let { vehicleNo, parkingLotId } = req.body;

    let parkingData = await Parking.findOne({
      $and: [{ vehicleNo }, { parkingLotId }],
    }).lean();
    if (!parkingData) throw { message: "no data found" };

    if (parkingData.startTime == null)
      throw { message: "No Parking Entry Found" };

    let vehicleType = await VehicleType.findOne({
      _id: parkingData.vehicleTypeId,
    }).lean();

    let duration = getDateDifference(parkingData.startTime, new Date());
    let amountPaid = 0;
    if (duration < 2) {
      amountPaid = vehicleType.vehicleTypeRates["0-2hr"];
    } else if (duration > 2 && duration < 4) {
      amountPaid = vehicleType.vehicleTypeRates["2-4hr"];
    } else {
      amountPaid = vehicleType.vehicleTypeRates["4+hr"];
    }
    parkingData.amountPaid = amountPaid;
    parkingData.endTime = new Date();
    let parkingHistory = parkingData.parkingHistory;
    delete parkingData.parkingHistory;
    parkingHistory.push(JSON.parse(JSON.stringify(parkingData)));

    // setting null values after exit
    parkingData.startTime = null;
    parkingData.endTime = null;
    parkingData.amountPaid = null;

    updateVacantParking(vehicleType._id, parkingLotId, "+");

    let newData = await Parking.findOneAndUpdate(
      { $and: [{ vehicleNo }, { parkingLotId }] },
      { $set: { ...parkingData, parkingHistory } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      data: newData.parkingHistory[newData.parkingHistory.length - 1],
      msg: "success",
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

const parkingHistory = async (req, res) => {
  try {
    let { vehicleNo, parkingLotId } = req.query;
    let query = { $and: [] };
    if (vehicleNo) {
      query.$and.push({ vehicleNo });
    }
    if (parkingLotId) {
      query.$and.push({ parkingLotId });
    }
    let history = await Parking.find(!vehicleNo && !parkingLotId ? {} : query)
      .select({ parkingHistory: 1, parkingLotId: 1, _id: 0 })
      .lean();
    if (!history) {
      throw { message: "no history found" };
    }
    return res.status(200).json({
      msg: "success",
      data: history,
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message || error });
  }
};

function updateVacantParking(vehicleTypeId, parkingLotId, operation) {
  Promise.all([
    VehicleType.findById(vehicleTypeId).lean(),
    ParkingLot.findById(parkingLotId).lean(),
  ]).then((data) => {
    let newPromise = [];
    switch (operation) {
      case "+":
        newPromise = [
          VehicleType.updateOne(
            { _id: data[0]._id },
            { $set: { vacantCapacity: data[0].vacantCapacity + 1 } }
          ),
          ParkingLot.updateOne(
            { _id: data[1]._id },
            { $set: { vacantCapacity: data[1].vacantCapacity + 1 } }
          ),
        ];
        break;
      case "-":
        newPromise = [
          VehicleType.updateOne(
            { _id: data[0]._id },
            { $set: { vacantCapacity: data[0].vacantCapacity - 1 } }
          ),
          ParkingLot.updateOne(
            { _id: data[1]._id },
            { $set: { vacantCapacity: data[1].vacantCapacity - 1 } }
          ),
        ];
        break;
    }
    Promise.all(newPromise).then(() => {
      console.log("vacant updated");
    });
  });
}

function getDateDifference(date_now, date_future) {
  let delta = Math.abs(date_future - date_now) / 1000;
  let hours = Math.floor(delta / 3600) % 24;
  return hours;
}

module.exports = {
  get,
  parkingEntry,
  parkingExit,
  parkingHistory,
};
