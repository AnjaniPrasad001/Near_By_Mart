import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Shop from '../models/Shop';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import {
  calculateDistanceKm,
  escapeRegex,
  parseCoordinates,
} from '../utils/geo';

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'you', 'a', 'an', 'the', 'is', 'are', 'was', 'were',
  'find', 'looking', 'for', 'where', 'can', 'get', 'buy', 'need', 'want',
  'any', 'some', 'near', 'nearby', 'close', 'open', 'shop', 'shops', 'store',
  'stores', 'available', 'price', 'best', 'cheap', 'under', 'in', 'on', 'at',
  'to', 'of', 'and', 'or', 'please', 'help', 'show', 'tell', 'have', 'carry',
]);

export const chatWithAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawMessage = String(req.body?.message || '').trim();
    if (!rawMessage) {
      throw ApiError.badRequest('Message is required');
    }

    const coords = parseCoordinates(req.body?.lat, req.body?.lng);
    const wantsOpenOnly = /\bopen\b/i.test(rawMessage);
    const priceMatch = rawMessage.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

    const keywords = rawMessage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

    const productFilter: Record<string, any> = { inStock: true };
    if (maxPrice !== null) {
      productFilter.price = { $lte: maxPrice };
    }

    if (keywords.length > 0) {
      productFilter.$or = keywords.flatMap((kw) => {
        const regex = new RegExp(escapeRegex(kw), 'i');
        return [
          { name: regex },
          { description: regex },
          { category: regex },
          { tags: regex },
        ];
      });
    }

    const matchedProducts = await Product.find(productFilter)
      .populate('shop', 'name category address city phone location isOpen rating')
      .limit(12)
      .lean();

    const scoredProducts = matchedProducts
      .filter((p: any) => p.shop && (!wantsOpenOnly || p.shop.isOpen))
      .map((p: any) => {
        const haystack = `${p.name} ${p.description} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        const matchScore = keywords.reduce(
          (acc, kw) => acc + (haystack.includes(kw) ? 1 : 0),
          0,
        );
        const distanceKm = coords
          ? calculateDistanceKm(
              coords.lat,
              coords.lng,
              p.shop.location.lat,
              p.shop.location.lng,
            )
          : null;

        return {
          matchScore,
          distanceKm,
          product: {
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            unit: p.unit,
            inStock: p.inStock,
            stockCount: p.stockCount,
            distanceKm,
            shop: {
              id: p.shop._id.toString(),
              name: p.shop.name,
              category: p.shop.category,
              address: p.shop.address,
              city: p.shop.city,
              phone: p.shop.phone,
              location: p.shop.location,
              isOpen: p.shop.isOpen,
              rating: p.shop.rating,
            },
          },
        };
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      })
      .slice(0, 6)
      .map((item) => item.product);

    const shopFilter: Record<string, any> = {};
    if (wantsOpenOnly) shopFilter.isOpen = true;
    if (keywords.length > 0) {
      shopFilter.$or = keywords.flatMap((kw) => {
        const regex = new RegExp(escapeRegex(kw), 'i');
        return [{ name: regex }, { category: regex }, { description: regex }];
      });
    }

    const matchedShopsRaw = await Shop.find(shopFilter).limit(5).lean();
    const matchedShops = matchedShopsRaw.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      category: s.category,
      address: s.address,
      city: s.city,
      phone: s.phone,
      location: s.location,
      isOpen: s.isOpen,
      rating: s.rating,
      distanceKm: coords
        ? calculateDistanceKm(coords.lat, coords.lng, s.location.lat, s.location.lng)
        : null,
    }));

    let reply: string;
    if (matchedProducts.length === 0 && matchedShops.length === 0) {
      const totalShops = await Shop.countDocuments();
      const totalProducts = await Product.countDocuments();
      reply =
        `I couldn't find an exact match for "${rawMessage}" right now. ` +
        `We currently have ${totalProducts} products across ${totalShops} local shops — ` +
        `try asking for items like "pooja items", "running shoes", "rice 10kg", "mobile charger", or "bakery".`;
    } else if (matchedProducts.length > 0) {
      const top = scoredProducts[0];
      const distText =
        top.distanceKm !== null ? ` (${top.distanceKm} km away)` : '';
      reply =
        `I found ${scoredProducts.length} in-stock option${scoredProducts.length > 1 ? 's' : ''} matching your request. ` +
        `Top pick: **${top.name}** for ₹${top.price}/${top.unit} at **${top.shop.name}**${distText}. ` +
        `You can view shop details, call to confirm stock, or open Google Maps directions below.`;
    } else {
      const topShop = matchedShops[0];
      reply =
        `I found ${matchedShops.length} local shop${matchedShops.length > 1 ? 's' : ''} matching your query, ` +
        `including **${topShop.name}** (${topShop.category}) at ${topShop.address}.`;
    }

    ApiResponse.success(res, {
      reply,
      products: scoredProducts,
      shops: matchedShops,
    });
  } catch (err) {
    next(err);
  }
};
