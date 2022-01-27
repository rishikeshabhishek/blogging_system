const jwt = require("jsonwebtoken");
exports.authJwt = (req, res, next) => {
    if (req.cookies && req.cookies.adminToken) {
        jwt.verify(req.cookies.adminToken, "abhishek-23051998@#1!4959", (err, data) => {
            req.admin = data
                // console.log("fine...", req.admin);

            next()
        })
    } else {
        // console.log("Something went wrong");
        next()
    }
}