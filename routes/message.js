const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    Message                = require("../models/message"),
    Subpage               = require("../models/subpage"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    
    res.render("./messages/new", {subpage_id: req.params.subpage_id,currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj ważną informację do podstrony"});
           
        
    
})

router.post("/", isLoggedIn, function(req, res){
    Message.create({text: req.body.text}, function(err, message){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                if(err){
                    console.log(err)
                } else {
                    subpage.message = message._id
                    subpage.save()
                    message.subpage = subpage._id;
                    message.save()
                    res.redirect(`/subpages/${subpage.address}`);
                }
            })
          
            
               
        }
    })
})


router.get("/:message_id/edit", isLoggedIn, function(req, res){
    Message.findById(req.params.message_id, function(err, message){
        if(err){
            console.log(err);
        } else {
            res.render("./messages/edit", {subpage_id: req.params.subpage_id,currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj ważną wiadomość do podstrony", message:message});
        }
    })
});

router.put("/:message_id", isLoggedIn, function(req, res){
    Message.findByIdAndUpdate(req.params.message_id, req.body.message, function(err, updatedmessage){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.redirect(`/subpages/${subpage.address}`);
            })
        }
    });
});

router.get("/:message_id/delete", isLoggedIn, function(req, res){
    Message.findByIdAndRemove(req.params.message_id, function(err, message){
        if(err){
            console.log(err)
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.redirect(`/subpages/${subpage.address}`);
            })
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