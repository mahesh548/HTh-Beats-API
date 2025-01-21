const jwt = require("jsonwebtoken");
const Users = require("../../Database/Models/Users");
const utils = require("../../utils");
const auth = async (req, res, next) => {
  if (!req?.headers?.authorization)
    return res.status(401).json({ status: false, auth: false });
  const session = req.headers?.authorization.split(" ")[1];

  if (!session) return res.status(401).json({ status: false, auth: false });
  const secrate = process.env.SECRATE;
  try {
    const user = jwt.verify(session, secrate);
    const isExpired = utils.dura(user.iat * 1000).min > 5;
    const realUser = await Users.findOne({ id: user.id });
    if (realUser.session != session && isExpired)
      return res.status(401).json({ status: false, auth: false });

    delete user.iat;
    const refreshedToken = jwt.sign(user, secrate);
    realUser.session = refreshedToken;
    realUser.save();
    req.body.user = user;
    //setting session token into headers
    res.setHeader("Access-Control-Expose-Headers", "session");
    res.setHeader("session", refreshedToken);

    next();
  } catch (error) {
    return res.status(401).json({ status: false, auth: false });
  }
};
module.exports = auth;
