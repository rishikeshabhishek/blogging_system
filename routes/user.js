const router = require("express").Router();
const UserController = require("../controllers/UserController");
const verifySignup = require("../middlewares/verifySignup");
const path = require("path");
const multer = require("multer");


// Setup file storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + 'blog' + path.extname(file.originalname));
    }
})

const maxSize = 5 * 1024 * 1024;

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
    limits: {
        fileSize: maxSize
    }
});

router.get("/", UserController.index);
router.get("/register", UserController.register);
router.post("/register", upload.single('image'), [verifySignup.checkDuplicateEntries], UserController.postRegister);
router.get("/login", UserController.viewLogin);
router.get("/post", UserController.userAuth, UserController.post);
router.post("/post", upload.single('image'), UserController.addPost);
router.get("/viewpost/(:slug)", UserController.viewPost);
router.post("/comment", UserController.addComment);

router.get("/contact", UserController.getContact);
router.post("/contact", UserController.contact);
router.post("/login", UserController.login);
router.get("/logout", UserController.logout);
router.get("/forgot", UserController.forgot);
router.post("/getlink", UserController.getLink);
router.get("/resetpassword/(:email)/(:forgottoken)", UserController.resetPassword);
router.post("/resetpassword/(:email)/(:forgottoken)", UserController.reset);
router.post("/fetchproducts", UserController.fetchProducts);
router.get("/managepost", UserController.managePost);
router.get("/updatepost/(:id)", UserController.showUpdatePost);
router.post("/updatepost", upload.single('image'), UserController.updatePost);
router.get("/deletepost/(:id)", UserController.deletePost);
module.exports = router;