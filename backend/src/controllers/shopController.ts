import { Request, Response, NextFunction } from 'express';
import Shop from '../models/Shop';
import Product from '../models/Product';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import {
  calculateDistanceKm,
  escapeRegex,
  parseCoordinates,
} from '../utils/geo';

export const getShops = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { category, search, lat, lng } = req.query;
    const filter: Record<string, any> = {};

    if (category && String(category).trim() && category !== 'All') {
      filter.category = new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i');
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { address: regex }, { city: regex }];
    }

    const coords = parseCoordinates(lat, lng);
    const shops = await Shop.find(filter).sort({ createdAt: -1 }).lean();

    const shopIds = shops.map((s) => s._id);
    const counts = await Product.aggregate([
      { $match: { shop: { $in: shopIds } } },
      { $group: { _id: '$shop', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const enriched = shops.map((shop) => ({
      ...shop,
      id: shop._id.toString(),
      productCount: countMap.get(shop._id.toString()) || 0,
      distanceKm: coords
        ? calculateDistanceKm(coords.lat, coords.lng, shop.location.lat, shop.location.lng)
        : null,
    }));

    if (coords) {
      enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    ApiResponse.success(res, enriched);
  } catch (err) {
    next(err);
  }
};

export const getMyShops = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shops = await Shop.find({ owner: req.user!._id }).sort({ createdAt: -1 }).lean();
    const shopIds = shops.map((s) => s._id);
    const products = await Product.find({ shop: { $in: shopIds } })
      .sort({ createdAt: -1 })
      .lean();

    const productsByShop = new Map<string, any[]>();
    for (const product of products) {
      const key = product.shop.toString();
      const list = productsByShop.get(key) || [];
      list.push({ ...product, id: product._id.toString() });
      productsByShop.set(key, list);
    }

    const result = shops.map((shop) => ({
      ...shop,
      id: shop._id.toString(),
      products: productsByShop.get(shop._id.toString()) || [],
    }));

    ApiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

export const getShopById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    const coords = parseCoordinates(req.query.lat, req.query.lng);
    const products = await Product.find({ shop: shop._id })
      .sort({ inStock: -1, createdAt: -1 })
      .lean();

    ApiResponse.success(res, {
      ...shop,
      id: shop._id.toString(),
      distanceKm: coords
        ? calculateDistanceKm(coords.lat, coords.lng, shop.location.lat, shop.location.lng)
        : null,
      products: products.map((p) => ({ ...p, id: p._id.toString() })),
    });
  } catch (err) {
    next(err);
  }
};

export const createShop = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, description, category, address, city, phone, lat, lng, isOpen } = req.body;

    const shop = await Shop.create({
      owner: req.user!._id,
      name,
      description: description || '',
      category,
      address,
      city,
      phone,
      location: {
        lat: typeof lat === 'number' ? lat : 17.385,
        lng: typeof lng === 'number' ? lng : 78.4867,
      },
      isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
    });

    ApiResponse.created(
      res,
      { ...shop.toObject(), id: shop._id.toString(), products: [] },
      'Shop created successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const updateShop = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    if (shop.owner.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You can only update your own shops');
    }

    const allowedFields = ['name', 'description', 'category', 'address', 'city', 'phone', 'isOpen'] as const;
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (shop as any)[field] = req.body[field];
      }
    }

    if (typeof req.body.lat === 'number' && typeof req.body.lng === 'number') {
      shop.location = { lat: req.body.lat, lng: req.body.lng };
    }

    await shop.save();
    ApiResponse.success(res, { ...shop.toObject(), id: shop._id.toString() }, 200, 'Shop updated');
  } catch (err) {
    next(err);
  }
};
