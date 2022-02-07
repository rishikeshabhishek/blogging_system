const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const CommentModel = require("../models/CommentModel");
const CategoryModel = require("../models/CategoryModel");
const AboutModel = require("../models/AboutModel");
const ContactModel = require("../models/ContactModel");
const BannerModel = require("../models/BannerModel");

exports.adminAuth = (req, res, next) => {
    if (req.admin) {
        console.log(req.admin);
        next();
    } else {
        console.log(req.admin);
        res.redirect("/admin");
    }
}
exports.adminDashboard = (req, res) => {
    if (req.admin) {
        UserModel.find({}, function(err, adminDetails) {
            if (!err) {
                res.render("admin/admin-dashboard", {
                    data: req.admin,
                    details: adminDetails
                })
            } else {
                console.log(err);
            }
        })
    }
}
exports.showIndex = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    res.render("admin", {
        loginData: loginData,
        message: req.flash("message")
    });
}
exports.login = (req, res, next) => {
    UserModel.findOne({
        email: req.body.email
    }, (err, data) => {
        if (data && data.isAdmin === "admin") {
            const hashPassword = data.password;
            if (bcrypt.compareSync(req.body.password, hashPassword)) {
                const token = jwt.sign({
                    id: data._id,
                    email: data.email
                }, "abhishek-23051998@#1!4959", { expiresIn: '5h' });
                res.cookie("adminToken", token);
                if (req.body.rememberme) {
                    res.cookie('email', req.body.email)
                    res.cookie('password', req.body.password)
                }
                console.log(data);
                res.redirect("dashboard");
            } else {
                req.flash("message", "Invalid Password");
                res.redirect("/admin");
            }
        } else {
            req.flash("message", "Invalid Email");
            res.redirect("/admin");
        }
    })
}

exports.posts = (req, res) => {
    PostModel.find().populate("category").populate("user").sort('-createdAt').then(result => {
        console.log(result);
        res.render("admin/posts", {
            title: "Admin | Post",
            data: req.admin,
            displayData: result
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.activePost = (req, res) => {
    PostModel.findByIdAndUpdate(req.params.id, {
        status: true
    }).then(result => {
        console.log("Post Activeted...");
        res.redirect("/admin/posts");
    }).catch(err => {
        console.log(err);
    })
}


exports.deActivePost = (req, res) => {
    PostModel.findByIdAndUpdate(req.params.id, {
        status: false
    }).then(result => {
        console.log("Post Deactiveted...");
        res.redirect("/admin/posts");
    }).catch(err => {
        console.log(err);
    })
}

exports.comments = (req, res) => {
    CommentModel.find().populate("post").then(result => {
        res.render("admin/comments", {
            title: "Admin | Comments",
            data: req.admin,
            displayData: result
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.activeComment = (req, res) => {
    CommentModel.findByIdAndUpdate(req.params.id, {
        status: true
    }).then(result => {
        console.log("Comment Activeted...");
        res.redirect("/admin/comments");
    }).catch(err => {
        console.log(err);
    })
}


exports.deActiveComment = (req, res) => {
    CommentModel.findByIdAndUpdate(req.params.id, {
        status: false
    }).then(result => {
        console.log("Comment Deactiveted...");
        res.redirect("/admin/comments");
    }).catch(err => {
        console.log(err);
    })
}

exports.users = (req, res) => {
    UserModel.find().then(result => {
        res.render("admin/users", {
            title: "Admin | Users",
            data: req.admin,
            displayData: result
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.activeUser = (req, res) => {
    UserModel.findByIdAndUpdate(req.params.id, {
        status: true
    }).then(result => {
        console.log("User Activeted...");
        res.redirect("/admin/users");
    }).catch(err => {
        console.log(err);
    })
}


exports.deActiveUser = (req, res) => {
    UserModel.findByIdAndUpdate(req.params.id, {
        status: false
    }).then(result => {
        console.log("User Deactiveted...");
        res.redirect("/admin/users");
    }).catch(err => {
        console.log(err);
    })
}


exports.logout = (req, res) => {
    res.clearCookie("adminToken")
    res.redirect('/admin')
}

exports.showAddCategory = (req, res) => {
    res.render("admin/addcategory", {
        title: "Admin | Add Category",
        data: req.admin,
        message: req.flash("message"),
        alert: req.flash("alert")
    })
}

exports.addCategory = (req, res) => {
    CategoryModel({
        categoryName: req.body.category
    }).save().then(result => {
        req.flash("message", "Category Added Successfully!!!");
        res.redirect("add-category");
    }).catch(error => {
        console.log("Category Not Added", error);
    })

}

exports.viewCategory = (req, res) => {
    CategoryModel.find().then(data => {
        res.render("admin/view-category", {
            data: req.admin,
            displayData: data
        })
    }).catch(error => {
        console.log(error);
    })
}





exports.showBanner = (req, res) => {
    res.render("admin/banner", {
        title: "Admin | Add Banner",
        data: req.admin
    })
}

exports.postBanner = (req, res) => {
    BannerModel({
        heading: req.body.heading,
        text: req.body.text

    }).save().then(result => {
        console.log("text Added...");

        res.redirect("banner");
    }).catch(err => {

        console.log("text Not Added...", err);
        res.redirect("banner");
    })
}