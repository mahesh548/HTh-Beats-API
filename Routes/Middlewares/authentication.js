const jwt = require("jsonwebtoken");
const Users = require("../../Database/Models/Users");
const auth = async (req, res, next) => {
  if (req.path.startsWith("/api/meta/")) {
    return next();
  }
  if (!req?.headers?.authorization)
    return res.status(401).json({ status: false, auth: false });
  const session = req.headers?.authorization.split(" ")[1];

  if (!session) return res.status(401).json({ status: false, auth: false });
  const secrate = process.env.SECRATE;
  try {
    const user = jwt.verify(session, secrate);

    const realUser = await Users.findOne({
      id: user.id,
      session: user.session,
      email: user.email,
    });
    if (!realUser) return res.status(401).json({ status: false, auth: false });

    const refreshedToken = jwt.sign(
      {
        id: realUser.id,
        email: realUser.email,
        session: realUser.session,
      },
      secrate,
      { expiresIn: "30d" }
    );

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
