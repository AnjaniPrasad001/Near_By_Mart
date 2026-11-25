import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: [120, 'Shop name cannot exceed 120 characters'],
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
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      lat: { type: Number, required: true, default: 17.385 },
      lng: { type: Number, required: true, default: 78.4867 },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

const Shop = mongoose.model<IShop>('Shop', shopSchema);
export default Shop;
