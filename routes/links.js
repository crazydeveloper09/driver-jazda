const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    Link                = require("../models/link"),
    Event                = require("../models/event"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    
    res.render("./links/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj polecany link"});
           
        
    
})

router.post("/", isLoggedIn, function(req, res){
    Link.create({ title: req.body.title, href: req.body.href}, function(err, link){
        if(err){
            console.log(err);
        } else {
            
          
            res.redirect("/home");
               
        }
    })
})


router.get("/:link_id/edit", isLoggedIn, function(req, res){
    Link.findById(req.params.link_id, function(err, link){
        if(err){
            console.log(err);
        } else {
            res.render("./links/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj polecany link", link:link});
        }
    })
});

router.put("/:link_id", isLoggedIn, function(req, res){
    Link.findByIdAndUpdate(req.params.link_id, req.body.link, function(err, updatedlink){
        if(err){
            console.log(err);
        } else {
            res.redirect("/subpages/strona-główna");
        }
    });
});

router.get("/:link_id/delete", isLoggedIn, function(req, res){
    Link.findByIdAndRemove(req.params.link_id, function(err, link){
        if(err){
            console.log(err)
        } else {
            res.redirect("back")
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