const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};

// module.exports = async ({ req, res }) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     req.isAuth = false;
//     return {
//       isAuth: false,
//     };
//   }
//   const token = authHeader.split("Bearer ")[1];
//   let decodedToken;
//   try {
//     decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//   } catch (error) {
//     req.isAuth = false;
//     return {
//       isAuth: false,
//     };
//   }
//   req.userId = decodedToken.userId;
//   req.isAuth = true;
//   return {
//     userId: decodedToken.userId,
//     isAuth: true,
//   };
// };
