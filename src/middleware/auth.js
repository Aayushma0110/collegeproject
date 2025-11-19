import { verifyToken } from "../utils/json.js";
import prisma  from "../utils/prisma-clients.js";


const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });

    }
    try {
        const payload = await verifyToken(token);
        const user = await prisma.user.findUnique({
            where: {
                id: payload.id
            }
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        delete user.password;
        req.user = user;
        //fetch user from database with the given payload id.
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthorized" });
    } 

};

export { auth ,verifyToken}