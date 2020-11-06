const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    methodOverride        = require("method-override"),
    Event                = require("../models/event"),
    Announcement                = require("../models/announcement"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    
    res.render("./announcements/new", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Dodaj ogłoszenie"});
           
        
    
});

router.post("/", isLoggedIn, function(req, res){
    Announcement.create({text: req.body.text}, function(err){
        if(err){
            console.log(err)
        } else {
            res.redirect("/subpages/strona-główna");
        }
    })
});

router.get("/:id/edit", isLoggedIn, function(req, res){
    Announcement.findById(req.params.id, function(err, announcement){
        if(err){
            console.log(err)
        } else {
           
            res.render("./announcements/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj ogłoszenie", announcement: announcement})
                   
               
            
        }
    })
});

router.put("/:id", isLoggedIn, function(req, res){
    Announcement.findByIdAndUpdate(req.params.id, req.body.announcement, function(err, updatedAnnouncement){
        if(err){
            console.log(err)
        } else {
            res.redirect("/subpages/strona-główna")
        }
    })
})

router.get("/:id/delete", isLoggedIn, function(req, res){
    Announcement.findByIdAndRemove(req.params.id, function(err, updatedAnnouncement){
        if(err){
            console.log(err)
        } else {
            res.redirect("/subpages/strona-główna")
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/subpages/strona-główna");
}

module.exports = router;