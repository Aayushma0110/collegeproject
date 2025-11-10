const isAdmin = (req,res,next)=> {
    const Role = req.user.role;
     if (Role!== 'ADMIN'){
        return res.status (403).json({message: "Forbidden"});
     }
     next();
}
export {isAdmin};
