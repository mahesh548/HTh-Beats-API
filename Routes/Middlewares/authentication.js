const jwt = require("jsonwebtoken");
const Users = require("../../Database/Models/Users");
const auth = async (req, res, next) => {
  const { session } = req.cookies;

  if (!session) return res.status(401).json({ status: false, auth: false });
  const secrate = process.env.SECRATE;
  try {
    const user = jwt.verify(session, secrate);
    delete user?.iat;

    const realUser = await Users.findOne({ id: user.id, session: session });
    if (!realUser) return res.status(401).json({ status: false, auth: false });

    const refreshedToken = jwt.sign(user, secrate);
    realUser.session = refreshedToken;
    realUser.save();
    req.body.user = user;
    res.cookie("session", refreshedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    next();
  } catch (error) {
    return res.status(401).json({ status: false, auth: false });
  }
};
module.exports = auth;
