import jwt from 'jsonwebtoken';

const generateToken = (userOrId, role) => {
    // Support both generateToken(user) and generateToken(id, role)
    const payload = typeof userOrId === 'object' 
        ? { id: userOrId.id, email: userOrId.email, role: userOrId.role }
        : { id: userOrId, role: role };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '100h'
    });
    return token;
};
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }

};
export { generateToken, verifyToken };
