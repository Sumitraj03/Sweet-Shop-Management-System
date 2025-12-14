import { purchaseModel } from "../Models/purchase.model.js";
import { sweetModel } from "../Models/sweet.model.js";

export const purchaseSweet = async (req, res) => {
  try {
    const sweetId = req.params.id;
    const { quantity } = req.body;
    const userId = req.id;

    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const sweet = await sweetModel.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    if (sweet.quantity < Number(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const purchasedAtPrice = sweet.price;
    const totalAmount = purchasedAtPrice * Number(quantity);

    const newPurchase = await purchaseModel.create({
      userId,
      sweetId,
      quantity: Number(quantity),
      purchasedAtPrice,
      totalAmount,
    });

    sweet.quantity -= Number(quantity);
    await sweet.save();

    return res.status(200).json({
      success: true,
      message: "Sweet purchased successfully",
      newPurchase,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while purchasing",
    });
  }
};


export const restockSweet = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body missing",
      });
    }

    const quantity = req.body.quantity;
    const sweetId = req.params.id;

    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const sweet = await sweetModel.findById(sweetId);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    sweet.quantity += Number(quantity);
    await sweet.save();

    return res.status(200).json({
      success: true,
      message: "Sweet restocked successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const getPurchases = async(req,res)=>{
    try {
        const userId = req.id;

        const purchases = await purchaseModel.find({userId}).populate({
            path:'sweetId'
        }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            purchases,
        });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
}