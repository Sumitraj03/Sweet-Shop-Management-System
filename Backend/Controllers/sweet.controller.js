import { sweetModel } from "../Models/sweet.model.js";
import { userModel } from "../Models/user.model.js";

export const add = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const userId = req.id;
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    if (price<0 || quantity<0) {
      return res.status(400).json({
        message: "Price and quantity cant be negative",
        success: false,
      });
    }

    const sweet = await sweetModel.create({
      name,
      category,
      price,
      quantity,
      createdBy: userId,
    });

    return res.status(200).json({
      message: "New sweet has been added",
      success: true,
      sweet,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error while adding sweet",
      success: false,
    });
  }
};

export const getAllSweets = async (req, res) => {
  try {
    const sweets = await sweetModel
      .find()
      .populate({
        path: "createdBy",
        select: "fullname email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      sweets,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Sweet ID is required",
      });
    }

    const sweet = await sweetModel.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }
    if (sweet.createdBy.toString() !== req.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this sweet",
      });
    }

    if (name) sweet.name = name;
    if (category) sweet.category = category;

    if (price) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price should not be negative",
        });
      }
      sweet.price = price;
    }

    if (quantity) {
      if (quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity should not be negative",
        });
      }
      sweet.quantity = quantity;
    }

    await sweet.save();

    return res.status(200).json({
      success: true,
      message: "Sweet details updated successfully",
      sweet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating sweet",
    });
  }
};

export const deleteSweet = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Sweet ID is required",
      });
    }

    const sweet = await sweetModel.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }
    if (sweet.createdBy.toString() !== req.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this sweet",
      });
    }

    await sweetModel.findByIdAndDelete(id);
    return res.status(200).json({
        success:true,
        message:"sweet has been deleted"
    })




  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"error while deleting sweet"
    })
  }
};

export const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query = {};

    if (name) {
      const words = name.trim().split(/\s+/);

      query.$and = words.map(word => ({
        name: { $regex: word, $options: "i" }
      }));
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await sweetModel
      .find(query)
      .populate("createdBy", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching sweets",
    });
  }
};

export const getSweetByUser = async (req, res) => {
  try {
    const userId = req.id;

    const sweets = await sweetModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user sweets",
    });
  }
};

