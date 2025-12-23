const Task = require('../models/Task');
const { Op } = require('sequelize');

// @desc    Get all tasks for current user
exports.getTasks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const where = { userId: req.user.id };
        if (req.query.status) {
            where.status = req.query.status;
        }

        const { count, rows: tasks } = await Task.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            total: count,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            },
            data: tasks
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single task
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to access this task' });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new task
exports.createTask = async (req, res, next) => {
    try {
        req.body.userId = req.user.id;
        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update task
exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
        }

        task = await task.update(req.body);

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete task
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
        }

        await task.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
