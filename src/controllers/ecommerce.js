const Product = require('../models/Product');
const Category = require('../models/Category');
const { Cart, CartItem } = require('../models/Cart');
const { Order, OrderItem } = require('../models/Order');
const { sequelize } = require('../config/db');

// CATEGORIES
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

// PRODUCTS
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({ include: [{ model: Category, as: 'category', attributes: ['name'] }] });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
        next(err);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, { include: [{ model: Category, as: 'category', attributes: ['name'] }] });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        await product.update(req.body);
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        await product.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// CART
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({
            where: { userId: req.user.id },
            include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id });
            cart = await Cart.findByPk(cart.id, { include: [{ model: CartItem, as: 'items' }] });
        }
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id });
        }

        let item = await CartItem.findOne({
            where: { cartId: cart.id, productId }
        });

        if (item) {
            item.quantity += (quantity || 1);
            await item.save();
        } else {
            await CartItem.create({
                cartId: cart.id,
                productId,
                quantity: quantity || 1
            });
        }

        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        res.status(200).json({ success: true, data: updatedCart });
    } catch (err) {
        next(err);
    }
};

// ORDER
exports.placeOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const cart = await Cart.findOne({
            where: { userId: req.user.id },
            include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product ? product.name : 'Unknown'}`);
            }

            // Decrement stock
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });

            totalAmount += parseFloat(product.price) * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        const order = await Order.create({
            userId: req.user.id,
            totalAmount
        }, { transaction: t });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                ...itemData,
                orderId: order.id
            }, { transaction: t });
        }

        // Clear cart items
        await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

        await t.commit();

        const completedOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json({ success: true, data: completedOrder });
    } catch (err) {
        await t.rollback();
        next(err);
    }
};
