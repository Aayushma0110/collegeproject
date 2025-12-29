import { verifyToken } from "../utils/json.js";
import prisma from "../utils/prisma-clients.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const payload = verifyToken(token); // must return { id, role }

    if (!payload?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3️⃣ Fetch user
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 4️⃣ Remove password
    const { password, ...safeUser } = user;

    req.user = safeUser;
    next();

  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
