const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Subscription = require('../models/Subscription');
const SupportTicket = require('../models/SupportTicket');
const Address = require('../models/Address');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartbite');
    console.log('[Seed] Connected to MongoDB');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany(),
    SellerProfile.deleteMany(),
    Category.deleteMany(),
    Food.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
    Coupon.deleteMany(),
    Subscription.deleteMany(),
    SupportTicket.deleteMany(),
    Address.deleteMany(),
  ]);

  // Plaintext password: userSchema pre('save') hook will hash it once
  const passwordHash = 'smartbite123';

  console.log('[Seed] Creating demo users...');
  // 1. Admin
  const adminUser = await User.create({
    name: 'SmartBite Administrator',
    email: 'admin@smartbite.com',
    password: passwordHash,
    phone: '9876543210',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  });

  // 2. Demo Customers
  const customer1 = await User.create({
    name: 'Rahul Sharma',
    email: 'customer@smartbite.com',
    password: passwordHash,
    phone: '9845123456',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    foodPreferences: {
      isVegetarianOnly: false,
      allergies: ['Peanuts'],
      favoriteCuisines: ['North Karnataka', 'Homestyle Thali'],
      dietaryNotes: 'Prefers medium spicy, less oil',
    },
  });

  const customer2 = await User.create({
    name: 'Pooja Hegde',
    email: 'pooja@smartbite.com',
    password: passwordHash,
    phone: '9822334455',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    foodPreferences: {
      isVegetarianOnly: true,
      allergies: [],
      favoriteCuisines: ['South Indian Breakfast', 'Millet Bowls'],
      dietaryNotes: 'Strictly Vegetarian, pure ghee',
    },
  });

  // Customer addresses
  await Address.create([
    {
      user: customer1._id,
      label: 'Home',
      recipientName: 'Rahul Sharma',
      phone: '9845123456',
      street: '#42, 3rd Cross, Green Glen Layout',
      locality: 'Bellandur',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: true,
    },
    {
      user: customer1._id,
      label: 'Work',
      recipientName: 'Rahul Sharma (Office)',
      phone: '9845123456',
      street: 'EcoSpace Tech Park, Block 3B',
      locality: 'Outer Ring Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: false,
    },
  ]);

  // 3. Home Chef Users
  const chefUsers = await Promise.all([
    User.create({
      name: 'Sunitha Patil',
      email: 'seller@smartbite.com', // Primary demo seller
      password: passwordHash,
      phone: '9880112233',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Gangamma Ajji',
      email: 'gangamma@smartbite.com',
      password: passwordHash,
      phone: '9880223344',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Parvati Iyer',
      email: 'parvati@smartbite.com',
      password: passwordHash,
      phone: '9880334455',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Kavitha Hegde',
      email: 'kavitha@smartbite.com',
      password: passwordHash,
      phone: '9880445566',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Shabana Begum',
      email: 'shabana@smartbite.com',
      password: passwordHash,
      phone: '9880556677',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Devraj Gowda',
      email: 'devraj@smartbite.com',
      password: passwordHash,
      phone: '9880667788',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Meenakshi Sundaram',
      email: 'meenakshi@smartbite.com',
      password: passwordHash,
      phone: '9880778899',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    }),
    User.create({
      name: 'Pooja Kulkarni', // Pending applicant demo
      email: 'applicant@smartbite.com',
      password: passwordHash,
      phone: '9880889900',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
    }),
  ]);

  console.log('[Seed] Creating 8 home chef kitchen profiles (FEATURE 5: Verified Kitchens)...');
  const sellers = await Promise.all([
    // 1. Sunitha Patil (Approved)
    SellerProfile.create({
      user: chefUsers[0]._id,
      kitchenName: "Annapurna Amma's Kitchen",
      tagline: 'Authentic North Karnataka Jowar Rotti & Yennegai',
      bio: 'Cooking traditional Uttara Karnataka meals for over 28 years using stone-ground spices and organic millets from our family farms.',
      phone: '9880112233',
      address: {
        street: '12th Main, 4th Block, Jayanagar',
        locality: 'Jayanagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560011',
      },
      logo: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223005000124',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Home kitchen inspected; FSSAI registration verified; hygiene standards approved.',
      rating: 4.9,
      numReviews: 48,
      isKitchenOpen: true,
      operatingHours: { open: '07:30 AM', close: '09:30 PM' },
      cuisines: ['North Karnataka', 'Healthy Millets', 'Traditional Homestyle'],
      bankDetails: {
        accountHolder: 'Sunitha Patil',
        accountNumber: '918801122334',
        ifscCode: 'SBIN0004561',
        upiId: 'sunithapatil@oksbi',
      },
      totalOrdersCompleted: 142,
      totalEarnings: 38400,
    }),

    // 2. Gangamma Ajji (Approved)
    SellerProfile.create({
      user: chefUsers[1]._id,
      kitchenName: "Ajji's Traditional Rotti Mane",
      tagline: 'Crispy Akki Rotti & Village Style Chutneys',
      bio: 'Grandmother recipes crafted fresh on cast-iron tawa with cold-pressed coconut oil and fresh garden coriander.',
      phone: '9880223344',
      address: {
        street: '8th Cross, Malleshwaram',
        locality: 'Malleshwaram',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
      },
      logo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223006000289',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Verified home kitchen hygiene certification.',
      rating: 4.8,
      numReviews: 36,
      isKitchenOpen: true,
      operatingHours: { open: '07:00 AM', close: '08:00 PM' },
      cuisines: ['Karnataka Breakfast', 'Traditional Tiffin', 'Akki Rotti'],
      totalOrdersCompleted: 98,
      totalEarnings: 21500,
    }),

    // 3. Parvati Iyer (Approved)
    SellerProfile.create({
      user: chefUsers[2]._id,
      kitchenName: "Brahmin's Satvik Rasam & Meals",
      tagline: 'No Onion, No Garlic Divine Satvik Cooking',
      bio: 'Pure traditional vegetarian Brahmin meals cooked with freshly ground sambar masala, Mysore rasam, and heritage rice.',
      phone: '9880334455',
      address: {
        street: 'Gandhi Bazaar Main Road, Basavanagudi',
        locality: 'Basavanagudi',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560004',
      },
      logo: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223007000341',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'FSSAI compliant Satvik kitchen.',
      rating: 4.9,
      numReviews: 54,
      isKitchenOpen: true,
      operatingHours: { open: '08:00 AM', close: '09:00 PM' },
      cuisines: ['Satvik', 'South Indian Brahmin Thali', 'Rasam & Sambar'],
      totalOrdersCompleted: 175,
      totalEarnings: 42000,
    }),

    // 4. Kavitha Hegde (Approved)
    SellerProfile.create({
      user: chefUsers[3]._id,
      kitchenName: "Malnad Homely Rasoi",
      tagline: 'Western Ghats Spices, Neer Dosa & Halasina Meals',
      bio: 'Bringing flavors of Thirthahalli and Malnad forests straight to your dining table.',
      phone: '9880445566',
      address: {
        street: '17th Cross, Indiranagar',
        locality: 'Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
      },
      logo: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223008000456',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Verified documentation & kitchen photo audit.',
      rating: 4.7,
      numReviews: 29,
      isKitchenOpen: true,
      operatingHours: { open: '08:30 AM', close: '09:30 PM' },
      cuisines: ['Malnad', 'Coastal Karnataka', 'Neer Dosa'],
      totalOrdersCompleted: 84,
      totalEarnings: 19800,
    }),

    // 5. Shabana Begum (Approved)
    SellerProfile.create({
      user: chefUsers[4]._id,
      kitchenName: "Ammi's Dastarkhwan & Dum Biryani",
      tagline: 'Slow Wood-fired Fragrant Dum Biryani & Kebabs',
      bio: 'Heritage family recipes passed down 3 generations. We marinate our cuts with pure saffron, whole spices and slow seal in clay handis.',
      phone: '9880556677',
      address: {
        street: 'Coles Road, Frazer Town',
        locality: 'Frazer Town',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560005',
      },
      logo: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223009000512',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Approved FSSAI catering registration.',
      rating: 4.9,
      numReviews: 72,
      isKitchenOpen: true,
      operatingHours: { open: '11:30 AM', close: '10:30 PM' },
      cuisines: ['Dum Biryani', 'Mughlai', 'Hyderabadi'],
      totalOrdersCompleted: 210,
      totalEarnings: 68500,
    }),

    // 6. Devraj Gowda (Approved)
    SellerProfile.create({
      user: chefUsers[5]._id,
      kitchenName: "Mandya Mane Oota & Ragi Mudde",
      tagline: 'Authentic Soft Ragi Mudde, Bassaru & Country Chicken',
      bio: 'Farm fresh organic finger millet (Ragi) steamed to velvety balls, paired with aromatic soppina saaru & rustic village curries.',
      phone: '9880667788',
      address: {
        street: 'Kanaka Nagar, RT Nagar',
        locality: 'RT Nagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560032',
      },
      logo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223010000678',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Verified rural recipe cottage kitchen certificate.',
      rating: 4.8,
      numReviews: 41,
      isKitchenOpen: true,
      operatingHours: { open: '12:00 PM', close: '10:00 PM' },
      cuisines: ['Mandya Country Meals', 'Ragi Mudde', 'Karnataka Village'],
      totalOrdersCompleted: 115,
      totalEarnings: 29500,
    }),

    // 7. Meenakshi Sundaram (Approved)
    SellerProfile.create({
      user: chefUsers[6]._id,
      kitchenName: "Madurai Meenakshi Tiffin House",
      tagline: 'Podi Idli, Medu Vada & Filter Coffee Decoction',
      bio: 'Softest steamed mallipoo idlis with gun powder ghee and 4 varieties of fresh village chutneys.',
      phone: '9880778899',
      address: {
        street: 'BTM 2nd Stage, Bannerghatta Road',
        locality: 'BTM Layout',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560076',
      },
      logo: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223011000723',
      foodSafetyCertified: true,
      verificationStatus: 'approved',
      verificationNotes: 'FSSAI certified commercial domestic food unit.',
      rating: 4.9,
      numReviews: 63,
      isKitchenOpen: true,
      operatingHours: { open: '06:30 AM', close: '02:00 PM' },
      cuisines: ['Tamil Tiffin', 'Podi Idli', 'Chettinad'],
      totalOrdersCompleted: 165,
      totalEarnings: 33200,
    }),

    // 8. Pooja Kulkarni (Pending Verification Demo)
    SellerProfile.create({
      user: chefUsers[7]._id,
      kitchenName: "Dharwad Pedha & Maharashtrian Treats",
      tagline: 'Handmade Puran Poli & Authentic Dharwad Sweet Delicacies',
      bio: 'Specializing in authentic Puran Poli with Katachi Amti and original caramelized Dharwad milk pedha.',
      phone: '9880889900',
      address: {
        street: 'Vijayanagar 2nd Stage',
        locality: 'Vijayanagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560040',
      },
      logo: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      fssaiNumber: '21223012000845',
      foodSafetyCertified: false,
      verificationStatus: 'pending',
      verificationNotes: 'Application submitted on Nov 16; government ID uploaded; awaiting kitchen inspection.',
      rating: 5.0,
      numReviews: 0,
      isKitchenOpen: false,
      operatingHours: { open: '09:00 AM', close: '07:00 PM' },
      cuisines: ['Sweets & Mithai', 'Maharashtrian', 'North Karnataka Sweets'],
      totalOrdersCompleted: 0,
      totalEarnings: 0,
    }),
  ]);

  console.log('[Seed] Creating 6 food categories...');
  const categories = await Promise.all([
    Category.create({
      name: 'Traditional Breakfast',
      slug: 'traditional-breakfast',
      description: 'Soft idlis, crispy dosas, steaming akki rottis, and savory pongal crafted fresh at dawn.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      icon: 'Coffee',
    }),
    Category.create({
      name: 'Regional Thali & Meals',
      slug: 'regional-thali-meals',
      description: 'Complete balanced homemade thalis with dal, curries, sabzi, curd, and warm breads.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      icon: 'Utensils',
    }),
    Category.create({
      name: 'Roti & Homestyle Breads',
      slug: 'roti-homestyle-breads',
      description: 'Hand-patted Jolada Rotti, whole wheat soft phulkas, chapati stacks, and stuffed parathas.',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      icon: 'Disc',
    }),
    Category.create({
      name: 'Biryani & Fragrant Rice',
      slug: 'biryani-fragrant-rice',
      description: 'Slow-dum aromatics, Vegetable Pulao, Curd Rice, and homestyle sealed handi biryanis.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      icon: 'Flame',
    }),
    Category.create({
      name: 'Millet & Healthy Bowls',
      slug: 'millet-healthy-bowls',
      description: 'Wholesome Ragi Mudde, Foxtail Millet Khichdi, low-GI ancient grain healthy lunches.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      icon: 'Heart',
    }),
    Category.create({
      name: 'Artisanal Sweets & Snacks',
      slug: 'artisanal-sweets-snacks',
      description: 'Pure ghee sweets, Mysore Pak, Obbattu / Puran Poli, besan ladoos made without preservatives.',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
      icon: 'Smile',
    }),
  ]);

  console.log('[Seed] Creating 16 homemade dishes with FreshBatch & Rescue Deals...');
  const foods = await Promise.all([
    // 1. Homemade Jolada Rotti Meal (FEATURE 1: FreshBatch Example)
    Food.create({
      seller: sellers[0]._id,
      kitchenName: sellers[0].kitchenName,
      name: 'Homemade Jolada Rotti Oota (2 Rottis + Yennegai)',
      description: '2 hand-patted soft Jowar (Sorghum) rottis served with authentic Dharwad brinjal curry (Badanekayi Yennegai), spiced Shenga chutney pudi, fresh salad & curd.',
      price: 130,
      category: categories[2]._id,
      categoryName: categories[2].name,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Sorghum (Jowar) Flour', 'Baby Brinjals', 'Roasted Peanuts', 'Sesame Seeds', 'Cumin', 'Red Chillies', 'Curd'],
      allergens: ['Peanuts', 'Sesame'],
      preparationTime: 25,
      calories: 420,
      servingSize: '2 Rottis + Yennegai + Chutney Pudi + Curd',
      freshBatch: {
        totalPortions: 25,
        availablePortions: 11,
        soldPortions: 14,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 24,
      tags: ['Jowar Rotti', 'North Karnataka', 'Gluten Free', 'Best Seller'],
      isFeatured: true,
    }),

    // 2. North Karnataka Deluxe Thali
    Food.create({
      seller: sellers[0]._id,
      kitchenName: sellers[0].kitchenName,
      name: 'North Karnataka Deluxe Festive Thali',
      description: 'Festive platter with 2 Jolada Rottis, Yennegai, Kaalina Palya (Sprouted Mung), Koshambari, Steamed Rice, Saaru (Rasam), Curd and 1 sweet Obbattu.',
      price: 190,
      category: categories[1]._id,
      categoryName: categories[1].name,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Jowar Flour', 'Sprouted Moong', 'Brinjals', 'Sona Masoori Rice', 'Jaggery', 'Chana Dal', 'Curd'],
      allergens: ['Peanuts'],
      preparationTime: 35,
      calories: 680,
      servingSize: 'Complete Meal for 1',
      freshBatch: {
        totalPortions: 20,
        availablePortions: 8,
        soldPortions: 12,
        batchDate: new Date(),
        isActive: true,
      },
      rescueDeal: {
        isRescueDeal: true,
        originalPrice: 190,
        discountedPrice: 120,
        remainingPortions: 3,
        pickupDeadline: '09:00 PM',
        active: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 32,
      tags: ['Thali', 'Uttara Karnataka', 'Festive', 'Healthy'],
      isFeatured: true,
    }),

    // 3. Crispy Akki Rotti with Coconut & Dill Leaves
    Food.create({
      seller: sellers[1]._id,
      kitchenName: sellers[1].kitchenName,
      name: 'Sabsige Soppu Akki Rotti (Set of 2)',
      description: 'Golden, crispy hand-pressed rice flour flatbread loaded with finely chopped dill leaves, cumin, fresh onions, green chillies, served with coconut chutney & butter.',
      price: 90,
      category: categories[0]._id,
      categoryName: categories[0].name,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Rice Flour', 'Dill Leaves (Sabsige)', 'Fresh Grated Coconut', 'Onions', 'Cumin', 'Green Chillies', 'White Butter'],
      allergens: ['Dairy'],
      preparationTime: 20,
      calories: 360,
      servingSize: '2 Rottis + White Butter + Coconut Chutney',
      freshBatch: {
        totalPortions: 30,
        availablePortions: 14,
        soldPortions: 16,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.8,
      numReviews: 19,
      tags: ['Akki Rotti', 'Bangalore Tiffin', 'Gluten Free'],
      isFeatured: true,
    }),

    // 4. Steamed Mallipoo Thatte Idli with Red Coconut Chutney
    Food.create({
      seller: sellers[6]._id,
      kitchenName: sellers[6].kitchenName,
      name: 'Bidadi Style Thatte Idli with Ghee Podi',
      description: 'Huge soft plate idli steamed to cloud-like perfection, topped with golden melted desi ghee and spiced gun powder (Podi), served with tangy coconut chutney.',
      price: 75,
      category: categories[0]._id,
      categoryName: categories[0].name,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Idli Rice', 'Urad Dal', 'Poha', 'Desi Cow Ghee', 'Roasted Chana Dal Podi', 'Coconut'],
      allergens: ['Dairy'],
      preparationTime: 15,
      calories: 280,
      servingSize: '1 Large Thatte Idli + 1 Crispy Vada + 2 Chutneys',
      freshBatch: {
        totalPortions: 40,
        availablePortions: 18,
        soldPortions: 22,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 42,
      tags: ['Idli', 'Breakfast', 'Comfort Food'],
      isFeatured: true,
    }),

    // 5. Crispy Masala Dosa with Potato Palya
    Food.create({
      seller: sellers[1]._id,
      kitchenName: sellers[1].kitchenName,
      name: 'Homestyle Benne Masala Dosa',
      description: 'Thick, crunchy golden fermented crepe brushed with fresh churned white butter (Benne), red garlic chutney spread inside, filled with spiced onion-potato filling.',
      price: 85,
      category: categories[0]._id,
      categoryName: categories[0].name,
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Rice & Urad Dal Batter', 'Fresh White Butter', 'Potatoes', 'Mustard', 'Curry Leaves', 'Garlic Chutney'],
      allergens: ['Dairy'],
      preparationTime: 20,
      calories: 380,
      servingSize: '1 Dosa + Potato Palya + Sambar & Chutney',
      freshBatch: {
        totalPortions: 35,
        availablePortions: 9,
        soldPortions: 26,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.8,
      numReviews: 28,
      tags: ['Dosa', 'Benne Dosa', 'Breakfast'],
    }),

    // 6. Soft Whole Wheat Phulka Roti Pack (Set of 5)
    Food.create({
      seller: sellers[0]._id,
      kitchenName: sellers[0].kitchenName,
      name: 'Tawa Soft Whole Wheat Phulka (Set of 5)',
      description: 'Puffed direct flame-toasted 100% Sharbati whole wheat phulkas brushed with pure cow ghee. Delivered warm in insulated foil wrap.',
      price: 60,
      category: categories[2]._id,
      categoryName: categories[2].name,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['100% MP Sharbati Wheat Flour', 'Desi Ghee', 'Purified Water', 'Pinch of Sea Salt'],
      allergens: ['Gluten', 'Dairy'],
      preparationTime: 15,
      calories: 340,
      servingSize: '5 Fresh Warm Phulkas',
      freshBatch: {
        totalPortions: 50,
        availablePortions: 28,
        soldPortions: 22,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.8,
      numReviews: 31,
      tags: ['Chapati', 'Phulka', 'Daily Essential'],
    }),

    // 7. Garden Fresh Vegetable Dum Pulao with Mint Raita
    Food.create({
      seller: sellers[2]._id,
      kitchenName: sellers[2].kitchenName,
      name: 'Fragrant Homestyle Veg Dum Pulao',
      description: 'Aged long-grain basmati rice cooked gently with sweet peas, tender carrots, french beans, whole cardamom & bay leaf. Paired with chilled boondi cucumber raita.',
      price: 140,
      category: categories[3]._id,
      categoryName: categories[3].name,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Basmati Rice', 'Green Peas', 'French Beans', 'Carrots', 'Mint', 'Coriander', 'Curd Raita'],
      allergens: ['Dairy'],
      preparationTime: 30,
      calories: 450,
      servingSize: '500g Container + Mint Raita + Roasted Papad',
      freshBatch: {
        totalPortions: 20,
        availablePortions: 6,
        soldPortions: 14,
        batchDate: new Date(),
        isActive: true,
      },
      rescueDeal: {
        isRescueDeal: true,
        originalPrice: 140,
        discountedPrice: 85,
        remainingPortions: 4,
        pickupDeadline: '08:30 PM',
        active: true,
      },
      isAvailable: true,
      rating: 4.7,
      numReviews: 18,
      tags: ['Pulao', 'Comfort Lunch', 'Healthy Rice'],
      isFeatured: true,
    }),

    // 8. Ammi's Authentic Chicken Dum Biryani
    Food.create({
      seller: sellers[4]._id,
      kitchenName: sellers[4].kitchenName,
      name: "Ammi's Handi Chicken Dum Biryani",
      description: 'Tender chicken pieces marinated overnight in brown onions, hand-ground garam masala & curd, layered with saffron milk infused long basmati and slow-cooked in handi.',
      price: 220,
      category: categories[3]._id,
      categoryName: categories[3].name,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      isVeg: false,
      ingredients: ['Farm Fresh Chicken', 'Basmati Rice', 'Kashmiri Saffron', 'Fried Onions (Birista)', 'Curd', 'Mint & Coriander', 'Desi Ghee'],
      allergens: ['Dairy'],
      preparationTime: 40,
      calories: 720,
      servingSize: '650g Handi + Mirchi Ka Salan + Raita',
      freshBatch: {
        totalPortions: 30,
        availablePortions: 7,
        soldPortions: 23,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 56,
      tags: ['Biryani', 'Non-Veg', 'Dum Biryani', 'Weekend Special'],
      isFeatured: true,
    }),

    // 9. Mandya Style Soft Ragi Mudde with Bassaru & Palya
    Food.create({
      seller: sellers[5]._id,
      kitchenName: sellers[5].kitchenName,
      name: 'Mandya Ragi Mudde with Aromatic Bassaru & Palya',
      description: 'Traditional piping hot finger millet ball (Ragi Mudde) served with nutritious boiled greens extract saaru (Bassaru), seasoned dill-dal stir fry (Palya) and ghee.',
      price: 110,
      category: categories[4]._id,
      categoryName: categories[4].name,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Organic Ragi Flour', 'Toor Dal', 'Mixed Greens', 'Garlic', 'Coriander Seeds', 'Dry Coconut', 'Desi Ghee'],
      allergens: ['Dairy'],
      preparationTime: 25,
      calories: 380,
      servingSize: '1 Large Ragi Mudde + Bassaru Bowl + Palya',
      freshBatch: {
        totalPortions: 25,
        availablePortions: 10,
        soldPortions: 15,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.8,
      numReviews: 22,
      tags: ['Ragi Mudde', 'Healthy Millet', 'Superfood', 'Village Food'],
      isFeatured: true,
    }),

    // 10. Country Chicken Curry with Ragi Mudde
    Food.create({
      seller: sellers[5]._id,
      kitchenName: sellers[5].kitchenName,
      name: 'Nati Koli Saaru (Country Chicken) with Ragi Mudde',
      description: 'Rustic rustic village style country chicken curry cooked with stone-ground shallots, dry coconut and pepper, served alongside 1 piping hot Ragi Mudde.',
      price: 210,
      category: categories[4]._id,
      categoryName: categories[4].name,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isVeg: false,
      ingredients: ['Nati Koli (Free-range Chicken)', 'Ragi', 'Shallots', 'Black Pepper', 'Cinnamon', 'Coconut'],
      allergens: [],
      preparationTime: 35,
      calories: 610,
      servingSize: '1 Ragi Mudde + Thick Chicken Gravy (3 pcs)',
      freshBatch: {
        totalPortions: 15,
        availablePortions: 4,
        soldPortions: 11,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.8,
      numReviews: 17,
      tags: ['Non-Veg', 'Nati Koli', 'Country Chicken'],
    }),

    // 11. Brahmin Style Dal Tadka, Rasam & Sona Masoori Rice
    Food.create({
      seller: sellers[2]._id,
      kitchenName: sellers[2].kitchenName,
      name: 'Satvik Dal Tadka, Mysore Rasam & Rice Combo',
      description: 'Yellow lentil dal tempered with cumin, hing & mustard, paired with spicy sweet Mysore tomato rasam, warm steamed rice, sandige fryums & curd.',
      price: 115,
      category: categories[1]._id,
      categoryName: categories[1].name,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Toor Dal', 'Sona Masoori Rice', 'Tomatoes', 'Tamarind', 'Cumin & Mustard', 'Asafoetida (Hing)', 'Curd'],
      allergens: ['Dairy'],
      preparationTime: 20,
      calories: 440,
      servingSize: 'Warm Rice (400g) + Dal + Rasam + Curd + Sandige',
      freshBatch: {
        totalPortions: 30,
        availablePortions: 13,
        soldPortions: 17,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 38,
      tags: ['Dal Chawal', 'Satvik', 'Comfort Food', 'Daily Lunch'],
    }),

    // 12. Neer Dosa with Malnad Tomato Curry
    Food.create({
      seller: sellers[3]._id,
      kitchenName: sellers[3].kitchenName,
      name: 'Delicate Neer Dosa with Coconut Chutney & Gojju (4 pcs)',
      description: 'Paper thin, melt-in-mouth rice crepes from the coastal hills, served with spiced sweet-tangy pineapple tomato gojju and fresh grated coconut chutney.',
      price: 95,
      category: categories[0]._id,
      categoryName: categories[0].name,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Raw Rice', 'Grated Coconut', 'Rock Salt', 'Tomatoes', 'Mustard Seeds'],
      allergens: [],
      preparationTime: 20,
      calories: 310,
      servingSize: '4 Neer Dosas + Tomato Gojju + Coconut Chutney',
      freshBatch: {
        totalPortions: 20,
        availablePortions: 8,
        soldPortions: 12,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.7,
      numReviews: 21,
      tags: ['Neer Dosa', 'Coastal Karnataka', 'Gluten Free'],
    }),

    // 13. Homemade Bele Obbattu / Puran Poli (Pack of 3)
    Food.create({
      seller: sellers[0]._id,
      kitchenName: sellers[0].kitchenName,
      name: 'Handcrafted Bele Obbattu (Holige) with Ghee (Pack of 3)',
      description: 'Thin, melt-in-mouth sweet flatbread stuffed with chana dal, organic jaggery and green cardamom filling, roasted on slow flame with pure cow ghee.',
      price: 110,
      category: categories[5]._id,
      categoryName: categories[5].name,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Chana Dal (Bengal Gram)', 'Organic Jaggery', 'Maida & Wheat Dough', 'Cardamom Powder', 'Cow Ghee'],
      allergens: ['Gluten', 'Dairy'],
      preparationTime: 15,
      calories: 520,
      servingSize: '3 Sweet Obbattus + Ghee Dip',
      freshBatch: {
        totalPortions: 25,
        availablePortions: 12,
        soldPortions: 13,
        batchDate: new Date(),
        isActive: true,
      },
      rescueDeal: {
        isRescueDeal: true,
        originalPrice: 110,
        discountedPrice: 70,
        remainingPortions: 5,
        pickupDeadline: '09:30 PM',
        active: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 29,
      tags: ['Sweets', 'Obbattu', 'Festival Special', 'Dessert'],
      isFeatured: true,
    }),

    // 14. Pure Ghee Mysore Pak (250g Box)
    Food.create({
      seller: sellers[1]._id,
      kitchenName: sellers[1].kitchenName,
      name: 'Melt-in-Mouth Royal Ghee Mysore Pak (250g)',
      description: 'Traditional porous royal sweet made with aromatic roasted gram flour, sulfur-free sugar syrup and generous splashes of pure Nandini ghee.',
      price: 160,
      category: categories[5]._id,
      categoryName: categories[5].name,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Gram Flour (Besan)', 'Pure Cow Ghee', 'Cane Sugar', 'Cardamom'],
      allergens: ['Dairy'],
      preparationTime: 10,
      calories: 580,
      servingSize: '250g Gift Box (Approx 6-8 thick pieces)',
      freshBatch: {
        totalPortions: 15,
        availablePortions: 6,
        soldPortions: 9,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 34,
      tags: ['Mysore Pak', 'Pure Ghee', 'Sweets'],
    }),

    // 15. Foxtail Millet Khichdi with Roasted Papad
    Food.create({
      seller: sellers[0]._id,
      kitchenName: sellers[0].kitchenName,
      name: 'Navane (Foxtail Millet) Bisi Bele Bath',
      description: 'Wholesome Karnataka hot lentil rice replaced with high-fiber foxtail millet, seasonal veggies, cashews roasted in ghee and spicy tamarind broth.',
      price: 120,
      category: categories[4]._id,
      categoryName: categories[4].name,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      ingredients: ['Foxtail Millet', 'Toor Dal', 'French Beans', 'Carrots', 'Cashews', 'Bisi Bele Bath Masala', 'Ghee'],
      allergens: ['Nuts', 'Dairy'],
      preparationTime: 25,
      calories: 390,
      servingSize: '450g Container + Crispy Boondi + Papad',
      freshBatch: {
        totalPortions: 20,
        availablePortions: 11,
        soldPortions: 9,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.7,
      numReviews: 16,
      tags: ['Millet', 'Bisi Bele Bath', 'Healthy Living', 'Low GI'],
    }),

    // 16. Mangalore Style Fish Curry (Gassi) with Boiled Rice
    Food.create({
      seller: sellers[3]._id,
      kitchenName: sellers[3].kitchenName,
      name: 'Mangalore Anjal (King Fish) Curry with Red Boiled Rice',
      description: 'Coastal style tangy coconut-tamarind fish curry cooked with fresh Byadgi chillies and whole spices, served with wholesome Kuchalakki (boiled red rice).',
      price: 240,
      category: categories[1]._id,
      categoryName: categories[1].name,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      isVeg: false,
      ingredients: ['King Fish (Surmai)', 'Red Boiled Rice', 'Grated Coconut', 'Byadgi Chillies', 'Kudampuli (Tamarind)', 'Fenugreek'],
      allergens: ['Fish'],
      preparationTime: 35,
      calories: 590,
      servingSize: '2 Thick Fish Steaks Gravy + Red Rice',
      freshBatch: {
        totalPortions: 12,
        availablePortions: 3,
        soldPortions: 9,
        batchDate: new Date(),
        isActive: true,
      },
      isAvailable: true,
      rating: 4.9,
      numReviews: 27,
      tags: ['Coastal', 'Fish Curry', 'Mangalore Gassi'],
    }),
  ]);

  console.log('[Seed] Creating demo discount coupons...');
  await Coupon.create([
    {
      code: 'SMART50',
      description: 'Get 50% discount up to ₹100 on your homemade order',
      discountType: 'percentage',
      discountValue: 50,
      minOrderAmount: 150,
      maxDiscount: 100,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
    },
    {
      code: 'HOMELOVE',
      description: 'Flat ₹60 off on authentic home kitchen orders above ₹200',
      discountType: 'flat',
      discountValue: 60,
      minOrderAmount: 200,
      maxDiscount: 60,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
    },
    {
      code: 'FIRSTBITE',
      description: 'Welcome offer! 30% off up to ₹75 on your first order',
      discountType: 'percentage',
      discountValue: 30,
      minOrderAmount: 100,
      maxDiscount: 75,
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 2000,
    },
  ]);

  console.log('[Seed] Creating sample orders with live tracking history...');
  const order1 = await Order.create({
    orderNumber: 'SB-882104-321',
    customer: customer1._id,
    seller: sellers[0]._id,
    items: [
      {
        food: foods[0]._id,
        name: foods[0].name,
        price: foods[0].price,
        quantity: 2,
        image: foods[0].image,
        isVeg: true,
      },
      {
        food: foods[12]._id,
        name: foods[12].name,
        price: foods[12].price,
        quantity: 1,
        image: foods[12].image,
        isVeg: true,
      },
    ],
    orderType: 'delivery',
    deliveryAddress: {
      street: '#42, 3rd Cross, Green Glen Layout',
      locality: 'Bellandur',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103',
      phone: '9845123456',
    },
    itemsTotal: 370,
    discountAmount: 50,
    couponCode: 'SMART50',
    deliveryFee: 35,
    platformFee: 5,
    taxAmount: 16,
    totalAmount: 376,
    paymentStatus: 'paid',
    paymentMethod: 'simulated_upi',
    orderStatus: 'preparing',
    timeline: [
      { status: 'placed', note: 'Order placed by customer.', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { status: 'confirmed', note: 'Kitchen accepted order.', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
      { status: 'preparing', note: 'Home chef is rolling hot Jowar rottis on tawa.', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
    ],
    estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000),
  });

  const order2 = await Order.create({
    orderNumber: 'SB-773412-892',
    customer: customer1._id,
    seller: sellers[4]._id,
    items: [
      {
        food: foods[7]._id,
        name: foods[7].name,
        price: foods[7].price,
        quantity: 1,
        image: foods[7].image,
        isVeg: false,
      },
    ],
    orderType: 'delivery',
    deliveryAddress: {
      street: '#42, 3rd Cross, Green Glen Layout',
      locality: 'Bellandur',
      city: 'Bangalore',
      pincode: '560103',
      phone: '9845123456',
    },
    itemsTotal: 220,
    discountAmount: 0,
    deliveryFee: 35,
    platformFee: 5,
    taxAmount: 11,
    totalAmount: 271,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    orderStatus: 'delivered',
    timeline: [
      { status: 'placed', note: 'Order placed.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { status: 'confirmed', note: 'Kitchen accepted.', timestamp: new Date(Date.now() - 2.8 * 60 * 60 * 1000) },
      { status: 'preparing', note: 'Dum handi sealed.', timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000) },
      { status: 'ready', note: 'Packed in thermal bag.', timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000) },
      { status: 'out_for_delivery', note: 'Delivery executive picked up.', timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000) },
      { status: 'delivered', note: 'Delivered piping hot.', timestamp: new Date(Date.now() - 1.0 * 60 * 60 * 1000) },
    ],
    reviewSubmitted: true,
  });

  console.log('[Seed] Creating demo reviews...');
  await Review.create([
    {
      customer: customer1._id,
      food: foods[7]._id,
      seller: sellers[4]._id,
      order: order2._id,
      rating: 5,
      comment: 'Absolutely spectacular authentic dum biryani! The chicken was so juicy and saffron fragrance made it feel like eating at a royal wedding.',
      chefReply: {
        reply: 'Shukriya Rahul! So glad you enjoyed our family recipe!',
        repliedAt: new Date(),
      },
    },
    {
      customer: customer2._id,
      food: foods[0]._id,
      seller: sellers[0]._id,
      rating: 5,
      comment: 'Authentic Uttara Karnataka taste! The Yennegai had the exact rustic flavor my grandmother used to make in Belgaum.',
      chefReply: {
        reply: 'Thank you Pooja beta! Always happy to cook for our SmartBite family.',
        repliedAt: new Date(),
      },
    },
  ]);

  console.log('[Seed] Creating sample daily meal subscriptions (FEATURE 2)...');
  await Subscription.create({
    customer: customer1._id,
    seller: sellers[0]._id,
    planTitle: 'Uttara Karnataka Daily Homestyle Lunch',
    mealType: 'lunch',
    planDuration: 'weekly',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deliveryTimeSlot: '12:30 PM - 01:15 PM',
    deliveryAddress: {
      street: '#42, 3rd Cross, Green Glen Layout',
      locality: 'Bellandur',
      city: 'Bangalore',
      pincode: '560103',
      phone: '9845123456',
    },
    pricePerMeal: 120,
    totalMeals: 7,
    deliveredMeals: 2,
    totalAmount: 840,
    status: 'active',
    dietaryNotes: 'Please send less spicy on Wednesdays.',
  });

  console.log('[Seed] Creating sample support tickets...');
  await SupportTicket.create({
    ticketId: 'TKT-1001',
    user: customer1._id,
    subject: 'Question regarding weekend meal subscription delivery slot',
    category: 'order_issue',
    priority: 'low',
    status: 'resolved',
    messages: [
      {
        sender: customer1._id,
        senderRole: 'customer',
        message: 'Can I shift my Sunday lunch tiffin delivery from 12:30 PM to 01:30 PM?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        sender: adminUser._id,
        senderRole: 'admin',
        message: 'Hello Rahul! Yes, we have coordinated with Sunitha Amma’s kitchen. Your Sunday delivery is scheduled for 01:30 PM.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('========================================================');
  console.log('✅ SmartBite Database Successfully Seeded!');
  console.log('========================================================');
  console.log('Demo Credentials:');
  console.log('👉 ADMIN:     admin@smartbite.com     / smartbite123');
  console.log('👉 SELLER:    seller@smartbite.com    / smartbite123');
  console.log('👉 CUSTOMER:  customer@smartbite.com  / smartbite123');
  console.log('========================================================');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
