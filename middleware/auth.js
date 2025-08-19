const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { User } = require("../model/User")

const domain = "https://dev-e0ha8nb2m6yi1las.us.auth0.com/";
const audience = "https://dev-e0ha8nb2m6yi1las.us.auth0.com/api/v2/";

const baseAuth = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${domain}.well-known/jwks.json`,
    }),
    audience: audience,
    issuer: domain,
    algorithms: ["RS256"],
    requestProperty: "auth",
});


const userAuth = async (req, res, next) => {

    baseAuth(req, res, async (err) => {
        if (err) return res.status(401).json({ message: "Unauthorized", error: err.message });

        try {

            const email =
                req.auth?.["https://devtinder.com/email"] ||
                req.auth?.email;

            if (!email) {
                return res.status(401).json({ message: "Email not found in token" });
            }

            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ message: "User not found in database" });
            }

            req.id = user._id;
            req.user = user;

            next();

        } catch (error) {
            console.error("Auth middleware error:", error);
            res.status(500).json({ message: "Server error in auth middleware" });
        }
    });
};

module.exports = userAuth;
