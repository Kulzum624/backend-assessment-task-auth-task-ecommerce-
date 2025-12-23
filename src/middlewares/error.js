const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error(err);

    // Sequelize Unique Constraint Error (e.g., duplicate email)
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = err.errors.map(e => e.message).join(', '); // e.g. "email must be unique"
        error = { message, statusCode: 400 };
    }

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // Sequelize Database Error (generic)
    if (err.name === 'SequelizeDatabaseError') {
        const message = 'Database Error';
        error = { message, statusCode: 500 };
    }

    // Sequelize Connection Error
    if (err.name === 'SequelizeConnectionError') {
        const message = 'Database Connection Failed';
        error = { message, statusCode: 503 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
