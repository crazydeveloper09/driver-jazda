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
   
    res.render("landing", { header:"Driver Nauka Jazdy | Samochody | Przywitanie"});
               
   
})


router.get("/contact", function(req, res){
    
    Driver.findOne({username: 'admin_maciek'}).populate(["carOffices", "pictures"]).exec((err, user) => {
        if(err) {
            console.log(err)
        } else {
            res.render("contact", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Kontakt", user:user});
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
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {

});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
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
   




router.post("/feedback", function(req, res, next){
    async.waterfall([
        function(done) {
            const mailgun = require("mailgun-js");
            const DOMAIN = 'sandbox10f798efbf804a6fad9949cc98b10ee1.mailgun.org';
            const mg = mailgun({apiKey: process.env.API_MAILGUN, domain: DOMAIN});
            const data = {
                to: 'maciejkuta6@gmail.com',
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

module.exports = router;