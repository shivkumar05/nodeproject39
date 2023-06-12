const jwt = require("jsonwebtoken");

//******************[authentication]************************//

const jwtValidation = async function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    if (token) {
      jwt.verify(token, "project", (err, decoded) => {
        if (err) {
          return res.status(401).send({
            status: false,
            message: "Authentication Failed",
          });
        } else {
          req.token = decoded;
          next();
        }
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

//******************[authorization]******************//

const authorization = async function (req, res, next) {
  try {
    let userLoggedIn = req.token.userId;
    let userId = req.params.userId;

    if (userLoggedIn != userId) {
      return res.status(403).send({
        status: false,
        message: "authorization failed",
      });
    }
    next();
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

module.exports = { jwtValidation, authorization };
