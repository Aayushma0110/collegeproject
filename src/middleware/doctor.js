const isDoctor = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'DOCTOR') {
        return res.status(403).json({ message: "Forbidden: Doctor access only" });
    }
    next();
};

export { isDoctor };
