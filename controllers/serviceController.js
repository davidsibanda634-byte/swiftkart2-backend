import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      user: req.user?._id,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .populate("user", "name phone");

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};