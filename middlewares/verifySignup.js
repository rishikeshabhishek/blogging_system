const UserModel = require("../models/UserModel");

exports.checkDuplicateEntries = (req, res, next) => {
    UserModel.findOne({
        userName: req.body.username
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            return;
        }
        if (user) {
            req.flash("message", "Username Already Exists");
            req.flash("alert", "alert-danger");
            return res.redirect("register");
            // console.log("Username Already Exists");
            // return;
        }
        UserModel.findOne({
            email: req.body.email
        }).exec((err, email) => {
            if (err) {
                console.log(err);
                return;
            }
            if (email) {
                req.flash("message", "Email Already Exists");
                req.flash("alert", "alert-danger");
                return res.redirect("register");

                // console.log("Email already exist...");
                // return;
            }
            UserModel.findOne({
                    contact: req.body.contact
                }).exec((err, contact) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (contact) {
                        req.flash("message", "Phone Number Already Exists");
                        req.flash("alert", "alert-danger");
                        return res.redirect("register");
                    }
                    const password = req.body.password;
                    const confirm = req.body.confirmpassword;
                    if (password !== confirm) {
                        req.flash("message", "Password & Confirm Password Are Not Matched");
                        req.flash("alert", "alert-danger");
                        return res.redirect("register");
                    }
                    next();
                })
                // next();


        })
    })
}