const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    List                = require("../models/list"),
    Subpage               = require("../models/subpage"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    Subpage.findById(req.params.subpage_id, (err, subpage) => {
        res.render("./lists/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj listę do podstrony",subpage_id: req.params.subpage_id});
    })
   
           
})

router.post("/", isLoggedIn, function(req, res){
    List.create({title: req.body.title}, function(err, list){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                if(err){
                    console.log(err)
                } else {
                    list.subpage = subpage._id;
                    list.save()
                    res.redirect(`/subpages/${subpage.address}`);
                }
            })
          
            
               
        }
    })
})


router.get("/:list_id/edit", isLoggedIn, function(req, res){
    List.findById(req.params.list_id, function(err, list){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.render("./lists/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj tytuł listy", list:list, subpage: subpage});
            })
            
        }
    })
});

router.put("/:list_id", isLoggedIn, function(req, res){
    List.findByIdAndUpdate(req.params.list_id, req.body.list, function(err, updatedlist){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.redirect(`/subpages/${subpage.address}`);
            })
        }
    });
});

router.get("/:list_id/delete", isLoggedIn, function(req, res){
    List.findByIdAndRemove(req.params.list_id, function(err, list){
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