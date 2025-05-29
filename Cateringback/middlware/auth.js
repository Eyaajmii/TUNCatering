const jwt=require("jsonwebtoken")

function generateAccesToken(username, role, TypePersonnel = null,Matricule = null,roleTunisair = null,email=null) {
  return jwt.sign({ username, role ,TypePersonnel,Matricule,roleTunisair,email}, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized"});
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user=user;
        next();
    });
}
module.exports = {generateAccesToken,authenticateToken};