const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams:true}),
    methodOverride        = require("method-override"),
    Event                = require("../models/event"),
	Course                = require("../models/course"),
    Characteristic                = require("../models/characteristic"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

router.get("/new", isLoggedIn, function(req, res){
    Course.findById(req.params.course_id, function(err, course){
        if(err){
            console.log(err)

        } else {
            res.render("./characteristic/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj cechę charakterystyczną", course: course});
        }
    })
   
           
        
   
});

router.post("/", isLoggedIn, function(req, res){
    Characteristic.create({text:req.body.text}, function(err, createdCharacteristic){
        if(err){
            console.log(err)
        } else {
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err)

                } else {
                    course.characteristics.push(createdCharacteristic);
                    course.save();
                    res.redirect("/courses/" + course.category)
                }
            })
           
        }
    });
})

router.get("/:characteristic_id/edit", isLoggedIn, function(req, res){
    Characteristic.findById(req.params.characteristic_id, function(err, characteristic){
        if(err){
            console.log(err);
        } else {
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err)
                } else {
                    res.render("./characteristic/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj cechę charakterystyczną",  characteristic:characteristic, course:course});
                }
            })
            
        }
    })

})

router.put("/:characteristic_id", isLoggedIn, function(req, res){
    Characteristic.findByIdAndUpdate(req.params.characteristic_id, req.body.characteristic, function(err, updatedCharacteristic){
        if(err){
            console.log(err);
        } else {
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err)

                } else {
                   
                    res.redirect("/courses/" + course.category)
                }
            })
            
        }
    });
});
router.get("/:characteristic_id/delete", isLoggedIn, function(req, res){
    Characteristic.findByIdAndRemove(req.params.characteristic_id, function(err, characteristic){
        if(err){
            console.log(err)
        } else {
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err)

                } else {
                   
                    res.redirect("/courses/" + course.category)
                }
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