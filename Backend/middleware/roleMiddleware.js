// Function that returns a middleware function
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // The 'protect' middleware must run FIRST to attach req.user
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authorized, no user role found.' });
        }

        // Check if the user's role is included in the allowedRoles array
        const isAllowed = allowedRoles.includes(req.user.role);

        if (isAllowed) {
            next(); // Role is authorized, proceed to the route handler
        } else {
            // Forbidden status code
            res.status(403).json({ 
                message: `Forbidden: User role (${req.user.role}) is not authorized for this action.` 
            });
        }
    };
};

module.exports = { authorize };
