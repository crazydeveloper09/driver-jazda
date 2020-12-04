const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    ListElement                = require("../models/listElement"),
    List                = require("../models/list"),
    Subpage               = require("../models/subpage"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());
router.get("/redirect", isLoggedIn, function(req, res){
    
    
           
    Subpage.findById(req.params.subpage_id, (err, subpage) => {
        res.render("./listElements/redirect", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Przekierowywanie", subpage: subpage, list_id: req.params.list_id});
    })
})

router.get("/new", isLoggedIn, function(req, res){
    List.findById(req.params.list_id, function(err, list) {
        Subpage.findById(req.params.subpage_id, (err, subpage) => {
            res.render("./listElements/new", {list: list, currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj element listy", subpage: subpage, list_id: req.params.list_id});
        })
    })
   
})

router.post("/", isLoggedIn, function(req, res){
    ListElement.create({text: req.body.text}, function(err, listElement){
        if(err){
            console.log(err);
        } else {
            List.findById(req.params.list_id, (err, list) => {
                list.elements.push(listElement);
                list.save();
                Subpage.findById(req.params.subpage_id, (err, subpage) => {
                    if(err){
                        console.log(err)
                    } else {
                        listElement.subpage = subpage._id;
                        listElement.list = list._id;
                        listElement.save()
                        res.redirect(`/subpages/${subpage.address}`);
                    }
                })
            })
        }
    })
})


router.get("/:listElement_id/edit", isLoggedIn, function(req, res){
    ListElement.findById(req.params.listElement_id).populate("list").exec(function(err, listElement){
        if(err){
            console.log(err);
        } else {
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.render("./listElements/edit", {subpage: subpage, list_id: req.params.list_id,currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj element listy", listElement:listElement});
            })
           
        }
    })
});

router.put("/:listElement_id", isLoggedIn, function(req, res){
    ListElement.findByIdAndUpdate(req.params.listElement_id, req.body.listElement, function(err, updatedlistElement){
        if(err){
            console.log(err);
        } else {
            listElement.list = list._id;
            listElement.save()
            Subpage.findById(req.params.subpage_id, (err, subpage) => {
                res.redirect(`/subpages/${subpage.address}`);
            })
            
        }
    });
});

router.get("/:listElement_id/delete", isLoggedIn, function(req, res){
    ListElement.findByIdAndRemove(req.params.listElement_id, function(err, listElement){
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