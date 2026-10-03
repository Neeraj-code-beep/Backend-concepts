import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      trim: true,
      required: true,
    },

    title: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      required: true,
    },

    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        trim: true,
        required: true,
        uppercase: true,
        default: 'INR',
      },
    },

    category: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const productModel = mongoose.model('Product', productSchema);

export default productModel;
