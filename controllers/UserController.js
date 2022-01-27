const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const CommentModel = require("../models/CommentModel");
const CategoryModel = require("../models/CategoryModel");
const AboutModel = require("../models/AboutModel");
const ContactModel = require("../models/ContactModel");
const BannerModel = require("../models/BannerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require('fs');


exports.userAuth = (req, res, next) => {
    if (req.user) {
        console.log(req.user);
        next();
    } else {
        console.log(req.user);
        res.redirect("login");
    }
}

exports.index = (req, res) => {

    const pager = req.query.page ? req.query.page : 1
    const options = {
        populate: "user",
        page: pager,
        limit: 3,
        sort: '-createdAt',
        collation: {
            locale: 'en',
        },
    };
    PostModel.paginate({}, options).then(data => {
        if (data) {
            console.log(data.docs);
            PostModel.find().populate("user").sort('-createdAt').limit(5).exec((err, result) => {
                console.log("AM", result);
                if (!err) {
                    CategoryModel.find().exec((err, category) => {
                        if (!err) {
                            CommentModel.find().sort('-createdAt').limit(5).then(comment => {
                                BannerModel.find().then(banners => {
                                    res.render("index", {
                                        title: "Abhi's Blog | Home",
                                        data: req.user,
                                        displayData: data,
                                        pager: pager,
                                        result: result,
                                        comment: comment,
                                        category: category,
                                        banner: banners
                                    })
                                })
                            }).catch(err => {
                                console.log(err);
                            })
                        } else {
                            console.log("error while fetching category for index page");
                        }
                    })

                } else {
                    console.log("Something went wrong...");
                }
            })

        } else {
            console.log("Something went wrong...");
        }
    }).catch(err => {
        console.log(err);
    })
}


exports.register = (req, res) => {
    console.log(req.user);
    res.render("register", {
        title: "Abhi's Blog | Register",
        message: req.flash("message"),
        alert: req.flash("alert"),
        data: req.user
    })
}

exports.postRegister = (req, res) => {
    UserModel({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        userName: req.body.username,
        contact: req.body.contact,
        email: req.body.email,
        profilePicture: req.file.filename,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }).save().then(result => {
        console.log("User Added...");
        req.flash("message", "Successfully Registered");
        req.flash("alert", "success-msg");
        res.redirect("register");
    }).catch(err => {
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
        console.log("User Not Added...");
        res.redirect("register");
    })
}



exports.viewLogin = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    res.render("login", {
        title: "Abhi's Blog | Login",
        message: req.flash("message"),
        alert: req.flash("alert"),
        displayData: loginData,
        data: req.user
    })
}

exports.login = (req, res, next) => {
    UserModel.findOne({
        email: req.body.email
    }, (err, data) => {
        if (data) {
            if (data.status) {
                const hashPassword = data.password;
                if (bcrypt.compareSync(req.body.password, hashPassword)) {
                    const token = jwt.sign({
                        id: data._id,
                        username: data.userName,
                        email: data.email
                    }, "abhishek-23051998@", { expiresIn: '5h' });
                    res.cookie("userToken", token);
                    if (req.body.rememberme) {
                        res.cookie('email', req.body.email)
                        res.cookie('password', req.body.password)
                    }
                    console.log(data);
                    res.redirect("post");
                } else {
                    // console.log("Invalid Password...");
                    // res.redirect("/");
                    req.flash("message", "Invalid Password");
                    req.flash("alert", "error-msg");
                    res.redirect("login");
                }
            } else {
                // console.log("Account Is Not Verified");
                req.flash("message", "Account Is Not Verified");
                req.flash("alert", "error-msg");
                res.redirect("login");
            }
        } else {
            // console.log("Invalid Email...");
            // res.redirect("/");
            req.flash("message", "Invalid Email");
            req.flash("alert", "error-msg");
            res.redirect("login");
        }
    })
}

exports.logout = (req, res) => {
    res.clearCookie("userToken");
    res.redirect("login")
}

exports.post = (req, res) => {
    CategoryModel.find().then(result => {
        res.render("post", {
            title: "Abhi's Blog | Post",
            message: req.flash("message"),
            alert: req.flash("alert"),
            data: req.user,
            displayData: result
        })
    })
}

exports.addPost = (req, res) => {
    PostModel.findOne({
        slug: req.body.title.trim().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_').toLowerCase()
    }).exec((err, data) => {
        if (data) {
            req.flash("message", "Post Title Already Exists");
            req.flash("alert", "error-msg");
            console.log("Post Title Already Exists", err);
            res.redirect("post");
        } else {
            PostModel({
                category: req.body.category,
                title: req.body.title,
                subTitle: req.body.subtitle,
                postText: req.body.post,
                image: req.file.filename,
                slug: req.body.title.trim().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, "_").toLowerCase(),
                user: req.user.id
            }).save().then(result => {
                console.log("Post Added...");
                req.flash("message", "Post Added");
                req.flash("alert", "success-msg");
                res.redirect("post");
            }).catch(err => {
                req.flash("message", "Something Went Wrong!!!");
                req.flash("alert", "error-msg");
                console.log("Post Not Added...", err);
                res.redirect("post");
            })
        }
    })
}

exports.viewPost = (req, res) => {
    PostModel.find({ slug: req.params.slug }).populate("category").populate("user").then(result => {
        console.log(result);
        CommentModel.find().populate("post").exec((err, data) => {
            if (!err) {
                console.log(data);

                BannerModel.find().then(banner => {
                    res.render("viewpost", {
                        title: "Abhi's Blog | View Post",
                        displayData: result,
                        data: req.user,
                        message: req.flash("message"),
                        alert: req.flash("alert"),
                        cmnt: data,
                        banner: banner
                    })
                })
            } else {
                console.log(err);
            }
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.addComment = (req, res) => {
    CommentModel({
        post: req.body.post,
        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment
    }).save().then(result => {
        console.log("Comment Added...");
        req.flash("message", "Comment Added Successfully, Wait For Approval");
        req.flash("alert", "success-msg");
        res.redirect(`viewpost/${req.body.slug}`);
    }).catch(err => {
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
        console.log("Comment Not Added...", err);
        res.redirect(`viewpost/${req.body.slug}`);
    })
}



exports.getContact = (req, res) => {
    res.render("contact", {
        title: "Contact Us",
        message: req.flash("message"),
        alert: req.flash("alert"),
        data: req.user
    })
}

exports.contact = (req, res) => {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "my.dev1998@gmail.com",
            pass: "My.Dev1998#@!"
        }
    });
    var mailOptions = {
        from: 'no-reply@abhishek.com',
        to: 'abhishek.majumdar98@gmail.com,webdevabhi4@gmail.com',
        subject: "Query From Abhi's Blogging",
        text: `Greetings From ${req.body.name}
        Query - ${req.body.message}
        Email - ${req.body.email}
        Contact - ${req.body.contact}`
    };
    transporter.sendMail(mailOptions, function(err) {
        if (err) {
            console.log("Techniclal Issue...");
        } else {
            req.flash("message", "Message Sent Successfully...");
            req.flash("alert", "success-msg");
            res.redirect("/contact");
        }
    });
}

exports.forgot = (req, res) => {
    res.render("forgot", {
        title: "Forgot Password",
        data: req.user,
        message: req.flash("message"),
        alert: req.flash("alert"),
    })
}

exports.getLink = (req, res) => {
    UserModel.findOne({ email: req.body.email }, (err, email) => {
        if (err) {
            console.log(err, "error while fetching email for forgot password");
        }
        if (email) {
            console.log(email, "Email found...");
            forgotToken = crypto.randomBytes(16).toString('hex');
            UserModel.findOneAndUpdate({ email: req.body.email }, {
                forgotToken: forgotToken
            }).then(result => {
                console.log("forgotToken set...");
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: "my.dev1998@gmail.com",
                        pass: "My.Dev1998#@!"
                    }
                });
                var mailOptions = {
                    from: 'no-reply@abhisblog.com',
                    to: email.email,
                    subject: 'Reset Password',
                    text: 'Hello ' + email.userName + ',\n\n' + 'Please forgot your password by clicking the link: \nhttp:\/\/' + req.headers.host + '\/resetpassword\/' + email.email + '\/' + forgotToken + '\n\nThank You!\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    if (err) {
                        console.log("Techniclal Issue...");
                    } else {
                        req.flash("message", "A Forgot Email Sent To Your Mail ID.... Please Change Your Password By Click The Link....");
                        req.flash("alert", "success-msg");
                        res.redirect("/forgot");

                    }
                });
            })
        } else {
            console.log("email not found while execute getLink()");
            req.flash("message", "Email Not Found");
            req.flash("alert", "error-msg");
            res.redirect("/forgot");
        }
    })
}

exports.resetPassword = (req, res) => {
    UserModel.findOne({ forgotToken: req.params.forgottoken }, (err, data) => {
        console.log(data);
        if (!data) {
            req.flash("message", "Reset Password Link May Be Expired");
            req.flash("alert", "error-msg");
            res.redirect("/forgot");
        } else {
            res.render("resetpassword", {
                title: "Reset Password",
                data: data,
                message: req.flash("message"),
                alert: req.flash("alert")
            })
        }
    })
}

exports.reset = (req, res) => {
    if (req.body.password === req.body.confirmpassword) {
        UserModel.findByIdAndUpdate(req.body.id, {
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        }).then(result => {
            console.log("Password Updated...");
            req.flash("message", "Password Updated Successfully");
            req.flash("alert", "success-msg");
            res.redirect("/login");
        }).catch(err => {
            req.flash("message", "Something Went Wrong!!!");
            req.flash("alert", "error-msg");
            console.log("Password Not Changed...");
            res.redirect("/login");
        })
    } else {
        console.log("Password & Confirm Password Not Same");
        req.flash("message", "Password & Confirm Password Not Same");
        req.flash("alert", "error-msg");
        res.redirect("/login");
    }
}

exports.fetchProducts = (req, res) => {
    PostModel.find({ category: req.body.catId }).populate("user").then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err);
    })
}

exports.managePost = (req, res) => {

    PostModel.find().populate("user").exec((err, posts) => {
        if (!err) {
            console.log(req.cookies.email);
            console.log(posts);
            res.render("managepost", {
                title: "Manage Post",
                data: req.user,
                posts: posts,
                flag: req.user.email
            })
        } else {
            console.log(err);
        }
    })
}

exports.showUpdatePost = (req, res) => {
    PostModel.findById(req.params.id).populate("category").then(result => {
        CategoryModel.find().then(category => {
            res.render("updatepost", {
                title: "Update Post",
                data: req.user,
                message: req.flash("message"),
                alert: req.flash("alert"),
                category: category,
                result: result
            })
        })
    })
}

exports.updatePost = (req, res) => {
    PostModel.findByIdAndUpdate(req.body.postid, {
        category: req.body.category,
        title: req.body.title,
        subTitle: req.body.subtitle,
        postText: req.body.post,
        image: req.file.filename,
        slug: req.body.title.trim().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, "_").toLowerCase(),
    }).then(result => {
        fs.unlink('./public/uploads/' + result.image, (err) => {
            if (!err) {
                console.log("Post Updated...");
                req.flash("message", "Post Updated Successfully");
                req.flash("alert", "success-msg")
                res.redirect(`/updatepost/${req.body.postid}`);
            } else {
                console.log('Error When Unlink....')
            }
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.deletePost = (req, res) => {
    PostModel.findByIdAndDelete(req.params.id).then(result => {
        CommentModel.deleteMany({ post: result._id }).then(data => {
            fs.unlink('./public/uploads/' + result.image, (err) => {
                if (!err) {
                    res.redirect("/managepost");
                } else {
                    console.log('Error When Unlink....')
                }
            })
        }).catch(err => {
            console.log(err);
        })
    })
}