const isPatient = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'PATIENT') {
        return res.status(403).json({ message: "Forbidden: Patient access only" });
    }
    next();
};

export { isPatient };
