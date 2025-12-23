const User = require('../models/User');
const { validateRegister, validateLogin } = require('../utils/validation');

// @desc    Register user
exports.register = async (req, res, next) => {
    try {
        const { error } = validateRegister(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { name, email, password, role } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
exports.login = async (req, res, next) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    console.log('JWT_SECRET used for sign:', process.env.JWT_SECRET);
    const token = user.getSignedJwtToken();
    console.log('Generated Token:', token);
    res.status(statusCode).json({
        success: true,
        token
    });
};
