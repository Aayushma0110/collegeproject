const isPatient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;
    console.log(req.user.role);

    if (role !== 'PATIENT') {
        return res.status(403).json({ message: "Forbidden: Patient access only" });
    }
    next();
};

export { isPatient };
