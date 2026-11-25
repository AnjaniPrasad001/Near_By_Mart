import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/near-by-mart',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Cloudinary (Phase 5+)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // AI / RAG (Phase 10+)
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || '',
    embeddingApiKey: process.env.EMBEDDING_API_KEY || '',
    embeddingModel: process.env.EMBEDDING_MODEL || '',
  },

  // Google Maps (Phase 9+)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },

  // File upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
} as const;

export default config;
