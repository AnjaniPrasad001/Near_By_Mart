import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Shop from '../models/Shop';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import {
  calculateDistanceKm,
  escapeRegex,
  parseCoordinates,
} from '../utils/geo';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q, category, inStock, lat, lng } = req.query;
    const filter: Record<string, any> = {};

    if (category && String(category).trim() && category !== 'All') {
      filter.category = new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i');
    }

    if (inStock === 'true') {
      filter.inStock = true;
    }

    if (q && String(q).trim()) {
      const terms = String(q)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      filter.$and = terms.map((term) => {
        const regex = new RegExp(escapeRegex(term), 'i');
        return {
          $or: [
            { name: regex },
            { description: regex },
            { category: regex },
            { tags: regex },
          ],
        };
      });
    }

    const coords = parseCoordinates(lat, lng);
    const products = await Product.find(filter)
      .populate('shop', 'name category address city phone location isOpen rating')
      .sort({ inStock: -1, createdAt: -1 })
      .lean();

    const enriched = products
      .filter((p) => p.shop)
      .map((product: any) => {
        const shop = product.shop;
        const distanceKm = coords
          ? calculateDistanceKm(coords.lat, coords.lng, shop.location.lat, shop.location.lng)
          : null;

        return {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          unit: product.unit,
          inStock: product.inStock,
          stockCount: product.stockCount,
          tags: product.tags,
          distanceKm,
          shop: {
            id: shop._id.toString(),
            name: shop.name,
            category: shop.category,
            address: shop.address,
            city: shop.city,
            phone: shop.phone,
            location: shop.location,
            isOpen: shop.isOpen,
            rating: shop.rating,
          },
        };
      });

    if (coords) {
      enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    ApiResponse.success(res, enriched);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    ApiResponse.success(
      res,
      categories.map((c) => ({ name: c._id, count: c.count })),
    );
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { shopId, name, description, category, price, unit, inStock, stockCount, tags } =
      req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    if (shop.owner.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You can only add products to your own shops');
    }

    const parsedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    const count = Number(stockCount ?? 10);
    const product = await Product.create({
      shop: shop._id,
      name,
      description: description || '',
      category: category || shop.category,
      price: Number(price),
      unit: unit || 'piece',
      inStock: inStock !== undefined ? Boolean(inStock) : count > 0,
      stockCount: count,
      tags: parsedTags,
    });

    ApiResponse.created(
      res,
      { ...product.toObject(), id: product._id.toString() },
      'Product added successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const shop = await Shop.findById(product.shop);
    if (!shop || shop.owner.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You can only update products in your own shops');
    }

    const fields = ['name', 'description', 'category', 'price', 'unit', 'inStock', 'stockCount'] as const;
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    }

    await product.save();
    ApiResponse.success(
      res,
      { ...product.toObject(), id: product._id.toString() },
      200,
      'Product updated',
    );
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const shop = await Shop.findById(product.shop);
    if (!shop || shop.owner.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You can only delete products in your own shops');
    }

    await product.deleteOne();
    ApiResponse.success(res, { id: req.params.id }, 200, 'Product deleted');
  } catch (err) {
    next(err);
  }
};
