const Food = require('../models/Food');
const SellerProfile = require('../models/SellerProfile');
const Category = require('../models/Category');

// @desc    Get all foods with search, filter, and pagination
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isVeg,
      minPrice,
      maxPrice,
      minRating,
      seller,
      isRescueDeal,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    let query = { isAvailable: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }
    }

    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true' || isVeg === true;
    }

    if (seller) {
      query.seller = seller;
    }

    if (isRescueDeal === 'true' || isRescueDeal === true) {
      query['rescueDeal.isRescueDeal'] = true;
      query['rescueDeal.active'] = true;
      query['rescueDeal.remainingPortions'] = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'time') sortOption = { preparationTime: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Food.countDocuments(query);

    const foods = await Food.find(query)
      .populate('seller', 'kitchenName rating verificationStatus address isKitchenOpen logo')
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      foods,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('seller', 'kitchenName tagline bio address rating numReviews verificationStatus logo banner isKitchenOpen operatingHours phone')
      .populate('category', 'name slug description');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private (Seller/Admin)
exports.createFood = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Seller profile required' });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      isVeg,
      ingredients,
      allergens,
      preparationTime,
      calories,
      servingSize,
      freshBatchPortions,
      tags,
    } = req.body;

    const portions = Number(freshBatchPortions) || 20;

    const food = await Food.create({
      seller: seller ? seller._id : req.body.seller,
      kitchenName: seller ? seller.kitchenName : 'SmartBite Kitchen',
      name,
      description,
      price: Number(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isVeg: isVeg === undefined ? true : isVeg,
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map((s) => s.trim()) : []),
      allergens: Array.isArray(allergens) ? allergens : (allergens ? allergens.split(',').map((s) => s.trim()) : []),
      preparationTime: Number(preparationTime) || 30,
      calories: Number(calories) || 350,
      servingSize: servingSize || '1 Portion',
      freshBatch: {
        totalPortions: portions,
        availablePortions: portions,
        soldPortions: 0,
        batchDate: new Date(),
        isActive: true,
      },
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((s) => s.trim()) : []),
    });

    res.status(201).json({
      success: true,
      food,
      message: 'New dish added to your kitchen menu successfully!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private (Seller/Admin)
exports.updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (req.user.role !== 'admin') {
      const seller = await SellerProfile.findOne({ user: req.user._id });
      if (!seller || food.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to edit this food item.' });
      }
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
      success: true,
      food,
      message: 'Food item updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private (Seller/Admin)
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (req.user.role !== 'admin') {
      const seller = await SellerProfile.findOne({ user: req.user._id });
      if (!seller || food.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this food item.' });
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update FreshBatch portions (FEATURE 1: FRESHBATCH)
// @route   PUT /api/foods/:id/freshbatch
// @access  Private (Seller)
exports.updateFreshBatch = async (req, res, next) => {
  try {
    const { totalPortions, availablePortions } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller || food.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (totalPortions !== undefined) {
      food.freshBatch.totalPortions = Number(totalPortions);
    }
    if (availablePortions !== undefined) {
      food.freshBatch.availablePortions = Number(availablePortions);
    }
    food.freshBatch.soldPortions = Math.max(0, food.freshBatch.totalPortions - food.freshBatch.availablePortions);
    food.freshBatch.batchDate = new Date();

    await food.save();

    res.status(200).json({
      success: true,
      freshBatch: food.freshBatch,
      message: `FreshBatch portions updated for ${food.name}: ${food.freshBatch.availablePortions} available.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Food Rescue Deals (FEATURE 3: FOOD RESCUE DEALS)
// @route   GET /api/foods/rescue-deals
// @access  Public
exports.getRescueDeals = async (req, res, next) => {
  try {
    const deals = await Food.find({
      'rescueDeal.isRescueDeal': true,
      'rescueDeal.active': true,
      'rescueDeal.remainingPortions': { $gt: 0 },
      isAvailable: true,
    }).populate('seller', 'kitchenName address rating logo phone');

    res.status(200).json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create/Toggle Food Rescue Deal (FEATURE 3: FOOD RESCUE DEALS)
// @route   POST /api/foods/:id/rescue-deal
// @access  Private (Seller)
exports.createRescueDeal = async (req, res, next) => {
  try {
    const { discountedPrice, remainingPortions, pickupDeadline, active } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller || food.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const isActive = active !== undefined ? active : true;

    food.rescueDeal = {
      isRescueDeal: isActive,
      originalPrice: food.price,
      discountedPrice: Number(discountedPrice) || Math.round(food.price * 0.6), // 40% off default
      remainingPortions: Number(remainingPortions) || 5,
      pickupDeadline: pickupDeadline || '09:00 PM',
      active: isActive,
    };

    await food.save();

    res.status(200).json({
      success: true,
      rescueDeal: food.rescueDeal,
      message: isActive ? `Food Rescue Deal activated for ${food.name} at ₹${food.rescueDeal.discountedPrice}!` : 'Deal deactivated.',
    });
  } catch (err) {
    next(err);
  }
};
