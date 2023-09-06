const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    methodOverride        = require("method-override"),
    Driver                = require("../models/driver"),
    Office                = require("../models/office"),
    Event                = require("../models/event"),
    Announcement                = require("../models/announcement"),
    flash                 = require("connect-flash"),
    async                 = require("async"),
    passport              = require("passport"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/", function(req, res){
   
    res.redirect('/subpages/strona-główna');
               
   
})
router.get("/home", (req, res) => {
    
    Announcement.find({}, function(err, announcements){
        if(err){
            console.log(err)
        } else {
                    
            res.render("index", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Strona Główna", announcements: announcements});
        }
    });
})
router.get("/about", function(req, res){
    
    res.render("about", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | O Nas"});
           
       
    
})

router.get("/contact", function(req, res){
    
    Driver.findOne({username: 'Admin'}).populate(["carOffices", "pictures"]).exec((err, user) => {
        if(err) {
            console.log(err)
        } else {
            Event.find({type: 'car'}).populate(["course", "office"]).sort({date: 1}).limit(6).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("contact", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Kontakt", user:user, events: events});
                }
            })
            
        }
    })
        
    
})

router.get("/login", function(req, res){
    res.render("login", {header:"Driver Nauka Jazdy | Samochody | Logowanie"});
});

router.get("/register", function(req, res){
    res.render("register", {header:"Driver Nauka Jazdy | Samochody | Rejestracja"})
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/subpages/strona-główna",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {

});
router.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/subpages/strona-główna');
    });
});

router.post("/register", function(req, res){
    
   
        let newDriver = new Driver({
            username: req.body.username
            
        });
        Driver.register(newDriver, req.body.password, function(err, user) {
            if(err) {
                
                return res.render("register");
            } 
            passport.authenticate("local")(req, res, function() {
                
                res.redirect("/login");
            });
        });
    });
   


router.get("/pkk", function(req, res){
    res.render("pkk", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | PKK"});
})


router.post("/feedback", function(req, res, next){
    async.waterfall([
        function(done) {
            const mailgun = require("mailgun-js");
            const DOMAIN = 'websiteswithpassion.pl';
            const mg = mailgun({apiKey: process.env.API_MAILGUN, domain: DOMAIN, host: "api.eu.mailgun.net"});
            const data = {
                to: 'sz.mazurek@wp.pl',
                from: req.body.from,
                subject: req.body.topic,
                text: req.body.text + '\n\n' +
                'Dane kontaktowe: \n' + 
                'Imię i nazwisko: ' + req.body.name + '\n' +
                'Email: ' + req.body.from + '\n' +
                'Nr telefonu: ' +  req.body.phone
            };
            mg.messages().send(data, function (err, body) {
                req.flash("success", "Wysłano zapytanie do osoby kontaktowej");
                done(err, 'done');
            });
            
           
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/');
    });
});

router.get("*", (req, res) => {
    res.render("error", {
        header: "Error 404"
    })
})

module.exports = router;