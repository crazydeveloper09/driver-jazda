const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    methodOverride        = require("method-override"),
    Event                = require("../models/event"),
    Links              = require("../models/link"),
    flash                 = require("connect-flash"),
    Course              = require("../models/course"),
    Driver              = require("../models/driver"),
    nodemailer            = require("nodemailer"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/events", (req, res) => {
    Event.find({type: 'car'}).populate(["course", "office"]).sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.json(events);
           
        }
    })
});

router.get("/links", (req, res) => {
    Links.find({}, (err, links) => {
        if(err) {
            res.json(err);
        } else {
            res.json(links);
        }
    })
})

router.get("/courses", (req, res) => {
    let course_type = "car"
    Course.find({type:course_type}, (err, courses) => {
        if(err){
            res.json(err);
        } else {
           
            res.json(courses);
        }
    })
})

router.get("/driver", (req, res) => {
    let username = "Admin"
    Driver.findOne({username: username}).populate("carOffices").exec((err, driver) => {
        if(err){
            res.json(err);
        } else {
           
            res.json(driver);
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/");
}

module.exports =router;