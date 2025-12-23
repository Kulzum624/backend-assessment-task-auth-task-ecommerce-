const express = require('express');
const {
    getCategories,
    createCategory,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getCart,
    addToCart,
    placeOrder
} = require('../controllers/ecommerce');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);

// User routes
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.post('/orders', protect, placeOrder);

// Admin routes
router.post('/categories', protect, authorize('admin'), createCategory);
router.post('/products', protect, authorize('admin'), createProduct);
router.put('/products/:id', protect, authorize('admin'), updateProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
