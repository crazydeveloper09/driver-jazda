const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    Installment                = require("../models/installment"),
    Course                = require("../models/course"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    res.render("./installments/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj termin", course_id: req.params.course_id});
})

router.post("/", isLoggedIn, function(req, res){
    Installment.create({ amount: req.body.amount}, function(err, installment){
        if(err){
            console.log(err);
        } else {
            
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err);
                } else {
                    course.installments.push(installment);
                    course.save();
                    res.redirect("/courses/" + course.category);
                }
            });
        }
    })
})


router.get("/:installment_id/edit", isLoggedIn, function(req, res){
    Installment.findById(req.params.installment_id, function(err, installment){
        if(err){
            console.log(err);
        } else {
            res.render("./installments/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj termin", installment:installment, course_id: req.params.course_id});
        }
    })
});

router.put("/:installment_id", isLoggedIn, function(req, res){
    Installment.findByIdAndUpdate(req.params.installment_id, req.body.installment, function(err, updatedinstallment){
        if(err){
            console.log(err);
        } else {
            res.redirect("back");
        }
    });
});

router.get("/:installment_id/delete", isLoggedIn, function(req, res){
    Installment.findByIdAndRemove(req.params.installment_id, function(err, installment){
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