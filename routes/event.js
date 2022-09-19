
const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    Event                = require("../models/event"),
    Office                = require("../models/office"),
    Course                = require("../models/course"),
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
            Office.find({type: 'car'}, (err, offices) => {
                if(err){
                    console.log(err)
                } else {
                    res.render("./events/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj termin", course: course, offices: offices});
                }
            })
        }
    })
})

router.post("/", isLoggedIn, function(req, res){
    Event.create({ city: req.body.city, time: req.body.time, date: req.body.date, type: 'car'}, function(err, event){
        if(err){
            console.log(err);
        } else {
            event.course = req.params.course_id;
            event.office = req.body.office;
            event.save();
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err);
                } else {
                    course.events.push(event._id);
                    course.save();
                    res.redirect("/courses/" + course.category);
                }
            });
        }
    })
})


router.get("/:event_id/edit", isLoggedIn, function(req, res){
    Event.findById(req.params.event_id).populate("office").exec(function(err, event){
        if(err){
            console.log(err);
        } else {
            Course.findById(req.params.course_id, function(err, course){
                if(err){
                    console.log(err)
        
                } else {
                    Office.find({type: 'car'}, (err, offices) => {
                        if(err){
                            console.log(err)
                        } else {
                            res.render("./events/edit", {
                                currentUser: req.user,
                                header:"Driver Nauka Jazdy | Samochody | Edytuj termin", 
                                event:event, 
                                course: course,
                                offices: offices,
                            });
                        }
                    })
                }
            })
        }
    })
});

router.put("/:event_id", isLoggedIn, function(req, res){
    Event.findByIdAndUpdate(req.params.event_id, req.body.event, function(err, updatedEvent){
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

router.get("/:event_id/delete", isLoggedIn, function(req, res){
    Event.findByIdAndRemove(req.params.event_id, function(err, event){
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