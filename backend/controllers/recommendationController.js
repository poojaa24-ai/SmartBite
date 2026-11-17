const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Smart Food Discovery Recommendations (FEATURE 6: SMART FOOD DISCOVERY)
// @route   GET /api/recommendations
// @access  Public (Personalized if JWT token provided)
exports.getRecommendations = async (req, res, next) => {
  try {
    let recommendations = [];
    const userId = req.user ? req.user._id : null;

    let orderedCategoryIds = [];
    let orderedFoodIds = [];
    let userPref = { isVegetarianOnly: false, allergies: [], favoriteCuisines: [] };

    if (userId) {
      const user = await User.findById(userId);
      if (user && user.foodPreferences) {
        userPref = user.foodPreferences;
      }

      // Fetch past 10 completed orders
      const pastOrders = await Order.find({ customer: userId }).sort({ createdAt: -1 }).limit(10);
      pastOrders.forEach((ord) => {
        ord.items.forEach((item) => {
          orderedFoodIds.push(item.food.toString());
        });
      });
    }

    // Base query: available dishes from open kitchens
    let query = { isAvailable: true };

    if (userPref.isVegetarianOnly) {
      query.isVeg = true;
    }

    const candidateFoods = await Food.find(query)
      .populate('seller', 'kitchenName rating address isKitchenOpen logo')
      .populate('category', 'name slug');

    // Score and rank candidates using transparent rule-based algorithm
    const scoredFoods = candidateFoods
      .filter((food) => {
        // Safe filter: Exclude any food with allergens matching user allergies
        if (userPref.allergies && userPref.allergies.length > 0 && food.allergens) {
          const hasAllergen = food.allergens.some((alg) =>
            userPref.allergies.some((userAlg) => userAlg.toLowerCase() === alg.toLowerCase())
          );
          if (hasAllergen) return false;
        }
        return true;
      })
      .map((food) => {
        let score = (food.rating || 4.5) * 10 + Math.min(food.numReviews || 0, 30);
        let reasons = [];

        // Preference match
        if (userPref.favoriteCuisines && food.categoryName) {
          const matchedCuisine = userPref.favoriteCuisines.some((c) =>
            food.categoryName.toLowerCase().includes(c.toLowerCase()) || (food.tags && food.tags.some(t => t.toLowerCase().includes(c.toLowerCase())))
          );
          if (matchedCuisine) {
            score += 25;
            reasons.push('Matches your cuisine preference');
          }
        }

        // FreshBatch availability bonus
        if (food.freshBatch && food.freshBatch.availablePortions > 5) {
          score += 15;
          reasons.push('Fresh batch prepared today');
        }

        // Popular dish
        if (food.rating >= 4.7 && food.numReviews >= 5) {
          score += 20;
          reasons.push('Customer favorite & top rated');
        }

        if (reasons.length === 0) {
          reasons.push('Popular homemade choice near you');
        }

        return {
          food,
          score,
          recommendationReason: reasons.join(' • '),
        };
      });

    // Sort by algorithmic score
    scoredFoods.sort((a, b) => b.score - a.score);

    recommendations = scoredFoods.slice(0, 10).map((item) => ({
      ...item.food.toObject(),
      recommendationReason: item.recommendationReason,
      recommendationScore: Math.round(item.score),
    }));

    res.status(200).json({
      success: true,
      count: recommendations.length,
      algorithm: 'SmartBite Rule-Based Multi-Factor Recommendation Engine v1.0',
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};
