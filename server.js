const express = require('express')
const mongoose = require('mongoose')
const User = require('./model/user.js')
const bcrypt = require('bcrypt')
const { json, response } = require('express')
const jwt = require('jsonwebtoken')
const http = require('https')
const { error } = require('console')


const sessionConfig = {
    secret: 'MYSECRET',
    name: 'appName',
    resave: false,
    saveUninitialized: false,
    cookie : {
      SameSite: 'lax',
    }
  };

require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET
const key = process.env.KEY
const url = process.env.URL
const databaseurl = process.env.DATABASE

mongoose.connect(databaseurl)

const app = express()

sessionConfig.cookie.secure = true;

app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")






function nFormatter(num, digits) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}







app.get("/", function (req, res) {
    res.render("home")
})









app.get("/signup", function (req, res) {
    res.render("signup")
})





app.get("/yay", function (req, res) {
    res.render("yay")
})








app.get("/signin", function (req, res) {
    res.render("signin")
})









app.get("/account/:test1/:username/:test2/:password", async function (req, res) {
    res.setHeader('Set-Cookie','visited=true; Max-Age=3000; SameSite=None; Secure');

    const username = req.params['username'];
    const password = req.params['password'];

    try {
        const response = await User.findOne({ username }).lean()

        if (!response) {
            console.log("invalid username");
            return res.json({ status: 'error', error: "Invalid Username / Password" });
        }
        else if (password == response.password) {

            const token = jwt.sign({
                id: response._id,
                username: response.username
            }, JWT_SECRET)

            // console.log(response.posts);

            var coins = nFormatter(response.coins,1);

            return res.render('account', {
                posts: response.posts,
                usrname: response.username,
                usrcoin: coins
            });
        }
        else {
            console.log("org pass : ", password);
            console.log(response.password);
        }
    }
    catch (err) {
        console.log(err);
    }


    return res.render('home');


    res.render("account")
})


app.get("/dev", function (req, res) {
    res.render("post")
})


















app.post("/api/signup", async function (req, res) {
    // console.log(req.body);

    const { username, password, number } = req.body;
    var status_msg = "OK";
    var err_msg = "";

    try {

        const result = await User.findOne({ username }).lean();

        if (!result) {
            const response = await User.create({
                "username": username,
                "password": password,
                "coins": 0,
                "contact": number
            })
            console.log("User Created");
        }
        else {
            console.log(result);
            status_msg = "Duplicate User";
            err_msg = "11000";
            console.log(JSON.stringify(err));
        }
    }
    catch (err) {
        if (err.code === 11000) {
            status_msg = "Duplicate User";
            err_msg = "11000";
            console.log(JSON.stringify(err));
        }
        else {
            console.log(JSON.stringify(err));
        }
    }
    res.json({ status: status_msg, error: err_msg });
})




app.post("/api/signin", async function (req, res) {
    // console.log(req.body);
    const { username, password } = req.body;

    try {
        const response = await User.findOne({ username }).lean()

        if (!response) {
            console.log("invalid username");
            return res.json({ status: 'error', error: "Invalid Username / Password" });
        }
        else if (password == response.password) {

            const token = jwt.sign({
                id: response._id,
                username: response.username
            }, JWT_SECRET)

            console.log("ok");

            return res.json({ status: 'OK', data: token });
        }
        else {
            console.log("org pass : ", password);
            console.log(response.password);
        }
    }
    catch (err) {
        console.log(err);
    }


    return res.json({ status: 'error', error: "Invalid Username / Password" });
})









app.post("/api/info", async function (req, res) {
    // console.log(req.body);
    const { username } = req.body;

    try {
        const response = await User.findOne({ username }).lean()

        if (!response) {
            console.log("invalid username");
            return res.json({ status: 'error', error: "Invalid Username / Password" });
        }
        else if (response.password) {
            return res.json({ status: 'OK', coins: response.coins, arr: response.posts });
        }
        else {
            console.log("org pass : ", password);
            console.log(response.password);
        }
    }
    catch (err) {
        console.log(err);
    }


    return res.json({ status: 'error', error: "Invalid Username / Password" });
})








app.post("/api/dev", async function (req, res) {
    console.log(req.body);
    var { username, title, content, url } = req.body;


    var temp = [{
        title,
        content,
        url
    }]

    var coin = 10;


    try {
        const response = await User.findOne({ username }).lean()

        if (!response) {
            // console.log("invalid username");
            return res.json({ status: 'error', error: "Invalid Username / Password" });
        }
        else {
            try {
                const result = await User.updateOne({ "username": username }, { $push: { posts: temp }, $inc: { coins: coin } }).lean();

                if (result) {
                    return res.json({ status: 'OK', error: "" , password: response.password });
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    catch (err) {
        console.log(err);
    }


    return res.json({ status: 'error', error: "Invalid Username / Password" });
})




app.post("/api/comment", async function (req, res) {
    // console.log(req.body);
    const { username, postid, comment } = req.body;

    console.log(username, postid, comment);

    try {
        const result = await User.findOne({ "username": username }).lean();
        console.log(result.posts);

        if (!response) {
            console.log("invalid username");
            return res.json({ status: 'error', error: "Invalid Username / Password" });
        }
        else {
            try {
                const response = await User.updateOne({ username }, { $push: { "posts.$[criteria].comment": comment } }, { "arrayFilters": [{ "criteria._id": postid }] }).lean()

                console.log(response);

                if (result) {
                    return res.json({ status: 'OK', error: "" });
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    catch (err) {
        console.log(err);
    }


    return res.json({ status: 'error', error: "Invalid Username / Password" });
})














app.post("/post", async function (req, res) {
    var { title, content, coin } = req.body;
    var prev_coin = 0;

    var temp = [{
        title,
        content
    }]

    console.log(title, content, coin)

    try {
        const response = await User.findOne({ "username": "satvik" }).lean();
        prev_coin = response.coins;
        // 
    }
    catch (err) {
        console.log(err);
    }

    try {
        const response = await User.updateOne({ "username": "satvik" }, { $push: { posts: temp }, $inc: { coins: coin } }).lean();
    }
    catch (err) {
        console.log(err);
    }

    res.send("OK");
})

app.listen(2000, function (err) {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Server running on port 2000")
        console.log("localhost:2000")
    }
});