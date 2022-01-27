const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const userAuth = require("./middlewares/userAuth");
const adminAuth = require("./middlewares/adminAuth");

app.use(session({
    cookie: {
        maxAge: 60000
    },
    secret: "abhishek230598",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({
    extended: true
}));

const dbDriver = "mongodb+srv://abhishek:rKbKhmexljtap0Rh@cluster0.jwma6.mongodb.net/abhiblog";

app.use(userAuth.authJwt);
app.use(adminAuth.authJwt);


const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

app.use(userRouter);
app.use("/admin", adminRouter);


const port = process.env.PORT || 1998;


mongoose.connect(dbDriver, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    app.listen(port, () => {
        console.log(`Db is connected`);
        console.log(`Server is running on http://localhost:${port}`);
    })
}).catch(err => {
    console.log(err);
})