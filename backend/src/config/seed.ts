import User from '../models/User';
import Shop from '../models/Shop';
import Product from '../models/Product';

/**
 * Populate sample local shops, products, and demo accounts if the database is empty.
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    const existingShops = await Shop.countDocuments();
    if (existingShops > 0) {
      return;
    }

    let demoSeller = await User.findOne({ email: 'seller@nearbymart.local' });
    if (!demoSeller) {
      demoSeller = await User.create({
        name: 'Ravi Kumar (Local Seller)',
        email: 'seller@nearbymart.local',
        password: 'Seller@123',
        role: 'seller',
        phone: '+91 98765 43210',
      });
    }

    const existingBuyer = await User.findOne({ email: 'buyer@nearbymart.local' });
    if (!existingBuyer) {
      await User.create({
        name: 'Anjali Sharma',
        email: 'buyer@nearbymart.local',
        password: 'Buyer@123',
        role: 'buyer',
        phone: '+91 91234 56789',
      });
    }

    const shopsData = [
      {
        owner: demoSeller._id,
        name: 'Sri Lakshmi Kirana & General Store',
        description: 'Daily groceries, rice bags, pulses, cooking oils, and household essentials.',
        category: 'Kirana',
        address: 'Shop 12, Main Market Road, Madhapur',
        city: 'Hyderabad',
        phone: '+91 98480 11223',
        location: { lat: 17.4486, lng: 78.3908 },
        isOpen: true,
        rating: 4.7,
        products: [
          {
            name: 'Sona Masoori Rice 10kg',
            description: 'Aged premium Sona Masoori rice bag, ideal for daily cooking.',
            category: 'Grocery',
            price: 620,
            unit: '10kg bag',
            inStock: true,
            stockCount: 24,
            tags: ['rice', 'rice 10kg', 'grocery', 'kirana', 'staples'],
          },
          {
            name: 'Cold-Pressed Sunflower Oil 1L',
            description: 'Refined cooking oil pouch, fresh batch.',
            category: 'Kirana',
            price: 145,
            unit: '1L pouch',
            inStock: true,
            stockCount: 40,
            tags: ['oil', 'cooking', 'kirana'],
          },
          {
            name: 'Organic Toor Dal 1kg',
            description: 'Unpolished farm-fresh pigeon peas.',
            category: 'Kirana',
            price: 165,
            unit: '1kg pack',
            inStock: true,
            stockCount: 18,
            tags: ['dal', 'pulses', 'kirana', 'grocery'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'Shubham Pooja Samagri Bhandar',
        description: 'Complete pooja items, brass diyas, agarbatti, camphor, and festive kits.',
        category: 'Pooja',
        address: '4-22 Temple Street, Kukatpally',
        city: 'Hyderabad',
        phone: '+91 98480 22334',
        location: { lat: 17.4849, lng: 78.4138 },
        isOpen: true,
        rating: 4.8,
        products: [
          {
            name: 'Complete Pooja Items Kit',
            description: 'Includes camphor, kumkum, turmeric, agarbatti, cotton wicks, and diya oil.',
            category: 'Pooja',
            price: 299,
            unit: 'box',
            inStock: true,
            stockCount: 15,
            tags: ['pooja items', 'pooja', 'diya', 'camphor', 'festival'],
          },
          {
            name: 'Handcrafted Brass Diya (Pair)',
            description: 'Traditional solid brass oil lamps for daily worship.',
            category: 'Pooja',
            price: 450,
            unit: 'pair',
            inStock: true,
            stockCount: 12,
            tags: ['diya', 'brass', 'pooja items', 'lamp'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'Stride & Step Footwear',
        description: 'Running shoes, walking sneakers, sandals, and sports socks.',
        category: 'Shoes',
        address: 'Plot 8, Jubilee Enclave, Hitech City',
        city: 'Hyderabad',
        phone: '+91 98480 33445',
        location: { lat: 17.4504, lng: 78.3808 },
        isOpen: true,
        rating: 4.6,
        products: [
          {
            name: 'AeroRun Pro Running Shoes',
            description: 'Lightweight breathable mesh running shoes with cushioned EVA sole.',
            category: 'Shoes',
            price: 1899,
            unit: 'pair',
            inStock: true,
            stockCount: 9,
            tags: ['running shoes', 'shoes', 'sports', 'sneakers'],
          },
          {
            name: 'UrbanWalk Canvas Sneakers',
            description: 'Comfortable everyday casual sneakers in navy and white.',
            category: 'Shoes',
            price: 1299,
            unit: 'pair',
            inStock: true,
            stockCount: 14,
            tags: ['shoes', 'sneakers', 'casual'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'TechPulse Mobile & Electronics',
        description: 'Fast chargers, USB-C cables, earphones, power banks, and phone accessories.',
        category: 'Electronics',
        address: 'Shop 3, Cyber Plaza, Ameerpet',
        city: 'Hyderabad',
        phone: '+91 98480 44556',
        location: { lat: 17.4375, lng: 78.4483 },
        isOpen: true,
        rating: 4.5,
        products: [
          {
            name: '65W GaN Fast Mobile Charger + USB-C Cable',
            description: 'Universal fast-charging adapter compatible with Android and iPhone.',
            category: 'Electronics',
            price: 799,
            unit: 'unit',
            inStock: true,
            stockCount: 22,
            tags: ['mobile charger', 'charger', 'usb-c', 'electronics'],
          },
          {
            name: '10000mAh Slim Power Bank',
            description: 'Dual USB output portable power bank with 18W PD fast charge.',
            category: 'Electronics',
            price: 1199,
            unit: 'unit',
            inStock: true,
            stockCount: 11,
            tags: ['power bank', 'mobile', 'electronics'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'OvenFresh Artisan Bakery',
        description: 'Freshly baked cakes, sourdough bread, puffs, and cookies every morning.',
        category: 'Bakery',
        address: '18 Park Avenue, Banjara Hills',
        city: 'Hyderabad',
        phone: '+91 98480 55667',
        location: { lat: 17.4156, lng: 78.4347 },
        isOpen: true,
        rating: 4.9,
        products: [
          {
            name: 'Belgian Chocolate Truffle Cake (500g)',
            description: 'Rich dark chocolate ganache cake made fresh daily.',
            category: 'Bakery',
            price: 550,
            unit: '500g cake',
            inStock: true,
            stockCount: 6,
            tags: ['cake', 'chocolate', 'bakery', 'dessert'],
          },
          {
            name: 'Multigrain Whole Wheat Loaf',
            description: 'Soft preservative-free sandwich bread.',
            category: 'Bakery',
            price: 65,
            unit: 'loaf',
            inStock: true,
            stockCount: 20,
            tags: ['bread', 'bakery', 'breakfast'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'CarePlus Neighbourhood Pharmacy',
        description: 'OTC medicines, first-aid kits, thermometers, and wellness essentials.',
        category: 'Pharmacy',
        address: 'Ground Floor, Sunrise Arcade, Kondapur',
        city: 'Hyderabad',
        phone: '+91 98480 66778',
        location: { lat: 17.4622, lng: 78.3568 },
        isOpen: true,
        rating: 4.8,
        products: [
          {
            name: 'Home First-Aid Emergency Kit',
            description: 'Bandages, antiseptic solution, gauze, and digital thermometer.',
            category: 'Pharmacy',
            price: 399,
            unit: 'kit',
            inStock: true,
            stockCount: 16,
            tags: ['first aid', 'pharmacy', 'medical'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'PaperCraft Books & Stationery',
        description: 'Notebooks, pens, art supplies, school kits, and office stationery.',
        category: 'Stationery',
        address: '22 College Lane, Begumpet',
        city: 'Hyderabad',
        phone: '+91 98480 77889',
        location: { lat: 17.4447, lng: 78.4664 },
        isOpen: true,
        rating: 4.4,
        products: [
          {
            name: 'Ruled Spiral Notebooks (Pack of 6)',
            description: '200-page A4 smooth paper notebooks for college and office.',
            category: 'Stationery',
            price: 320,
            unit: 'pack of 6',
            inStock: true,
            stockCount: 30,
            tags: ['notebooks', 'stationery', 'books'],
          },
        ],
      },
      {
        owner: demoSeller._id,
        name: 'CottonLoom Clothing Studio',
        description: 'Breathable cotton shirts, kurtas, t-shirts, and casual wear.',
        category: 'Clothing',
        address: '45 Fashion Plaza, Somajiguda',
        city: 'Hyderabad',
        phone: '+91 98480 88990',
        location: { lat: 17.4239, lng: 78.4581 },
        isOpen: true,
        rating: 4.6,
        products: [
          {
            name: 'Pure Cotton Polo T-Shirt',
            description: 'Combed cotton regular-fit polo shirt available in M, L, XL.',
            category: 'Clothing',
            price: 599,
            unit: 'piece',
            inStock: true,
            stockCount: 19,
            tags: ['t-shirt', 'clothing', 'cotton', 'shirt'],
          },
        ],
      },
    ];

    for (const shopItem of shopsData) {
      const { products, ...shopFields } = shopItem;
      const createdShop = await Shop.create(shopFields);
      await Product.insertMany(
        products.map((p) => ({
          ...p,
          shop: createdShop._id,
        })),
      );
    }

    console.log('🌱 Seeded initial shops, products, and demo accounts');
  } catch (error) {
    console.error('⚠️  Seed skipped or failed:', error);
  }
};
