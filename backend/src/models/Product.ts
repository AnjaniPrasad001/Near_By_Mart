import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  shop: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [140, 'Product name cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'piece',
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    stockCount: {
      type: Number,
      default: 10,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
