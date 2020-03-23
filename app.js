const express             = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    bodyParser            = require("body-parser"),
    multer                = require("multer"),
    cloudinary            = require("cloudinary"),
    async                 = require("async"),
    xoauth2               = require("xoauth2"),
    nodemailer            = require("nodemailer"),
    methodOverride        = require("method-override"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

const courseSchema = new mongoose.Schema({
   
    category: String,
    additionalPrice: Number,
    price: Number,
    
    characteristics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Characteristic"
    }],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Event"
        }
    ]
});

let Course = mongoose.model("Course", courseSchema);

const characteristicSchema = new mongoose.Schema({
    text: String
});

let Characteristic = mongoose.model("Characteristic", characteristicSchema);


const gallerySchema = new mongoose.Schema({
    title: String,
    profile: String,
    pictures:Array
})

let Gallery = mongoose.model("Gallery", gallerySchema)

const applicationSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Event"
    },
    isApplicated: Boolean
    
});

let Application = mongoose.model("Application", applicationSchema);

const announcementSchema = new mongoose.Schema({
    text: String
});

let Announcement = mongoose.model("Announcement", announcementSchema);

const eventSchema = new mongoose.Schema({
    city: String,
    time: String,
    date: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }
});

let Event = mongoose.model("Event", eventSchema);

const driverSchema = new mongoose.Schema({
    username: String,
    password: String
});
driverSchema.plugin(passportLocalMongoose);
let Driver = mongoose.model("Driver", driverSchema);

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})


cloudinary.config({ 
    cloud_name: 'syberiancats', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Driver.authenticate()));
passport.serializeUser(Driver.serializeUser());
passport.deserializeUser(Driver.deserializeUser());




app.get("/", function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            Announcement.find({}, function(err, announcements){
                if(err){
                    console.log(err)
                } else {
                    res.render("index", {currentUser: req.user, header:"Driver Nauka Jazdy | Strona Główna", events: events, announcements: announcements});
                }
            });
           
        }
    })
   
})

app.get("/about", function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("about", {currentUser: req.user, header:"Driver Nauka Jazdy | O Nas", events:events});
           
        }
    })
    
})

app.get("/contact", function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("contact", {currentUser: req.user, header:"Driver Nauka Jazdy | Kontakt", events:events});
           
        }
    })
    
})

app.get("/gallery", function(req, res){
    Gallery.find({}, function(err, galleries){
        if(err){
            console.log(err);
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./gallery/index", {currentUser: req.user,header:"Driver Nauka Jazdy | Galeria", events:events, galleries: galleries});
                   
                }
            })
          
        }
    })
    

});



app.get("/gallery/new", isLoggedIn, function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("./gallery/new", {currentUser: req.user, header:"Driver Nauka Jazdy | Dodaj galerię", events:events});
           
        }
    })
    
});

app.get("/gallery/:id", function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./gallery/show", {currentUser: req.user, header:"Driver Nauka Jazdy | Galeria | " + gallery.title, events:events, gallery: gallery});
                   
                }
            })
            
        }
    });
})

app.post("/gallery", upload.single("profile"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Gallery.create({title: req.body.title, profile:result.secure_url, pictures:[]}, function(err,createdGallery){
            if(err){
                console.log(err);
            } else {
                res.redirect("/gallery/" + createdGallery._id);
            }
        })
    });
    
});

app.get("/gallery/:id/edit", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./gallery/edit", {currentUser: req.user, header:"Driver Nauka Jazdy | Galeria | " + gallery.title + " | Edytuj tytuł",gallery: gallery, events:events});
                   
                }
            })
            
        }
    });
});

app.put("/gallery/:id", isLoggedIn, function(req, res){
    Gallery.findByIdAndUpdate(req.params.id, req.body.gallery, function(err, updatedGallery){
        if(err){
            console.log(err)
        } else {
            res.redirect("/gallery/" + updatedGallery._id)
        }
    })
});

app.get("/gallery/:id/delete", isLoggedIn, function(req, res){
    Gallery.findByIdAndRemove(req.params.id, function(err, deletedGallery){
        if(err){
            console.log(err)
        } else {
            res.redirect("/gallery")
        }
    })
})

app.get("/gallery/:id/add/picture", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./gallery/addP", {currentUser: req.user,header:"Driver Nauka Jazdy | Galeria | " + gallery.title + " | Dodaj zdjęcie", events:events, gallery: gallery});
                   
                }
            })
            
        }
    });
})

app.post("/gallery/:id/add/picture", upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Gallery.findById(req.params.id, function(err, gallery){
            if(err){
                console.log(err)
            } else {
                gallery.pictures.push(result.secure_url);
                gallery.save();
                res.redirect("/gallery/" + gallery._id)
            }
        });
    });
   
})

app.get("/gallery/:id/edit/profile", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./gallery/editP", {currentUser: req.user,header:"Driver Nauka Jazdy | Galeria | " + gallery.title + " | Edytuj zdjęcie główne", events:events, gallery: gallery});
                   
                }
            })
            
        }
    });
})

app.post("/gallery/:id/edit/profile", upload.single("profile"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Gallery.findById(req.params.id, function(err, gallery){
            if(err){
                console.log(err)
            } else {
                gallery.profile = result.secure_url;
                gallery.save();
                res.redirect("/gallery/" + gallery._id)
            }
        });
    });
    
})

app.get("/login", function(req, res){
    res.render("login", {header:"Driver Nauka Jazdy | Logowanie"});
});

app.get("/register", function(req, res){
    res.render("register", {header:"Driver Nauka Jazdy | Rejestracja"})
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {

});
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function(req, res){
    
   
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
   


app.get("/pkk", function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("pkk", {currentUser: req.user, header:"Driver Nauka Jazdy | PKK", events:events});
           
        }
    })
   
})



app.get("/offer/course/:category", function(req, res){
    Course.findOne({category: req.params.category}).populate(["events", "characteristics"]).exec(function(err, course){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./courses/show", {currentUser: req.user,header:"Driver Nauka Jazdy | Oferta | Kategoria " + course.category, events:events, course: course});
                   
                }
            })
            
        }
    })
    
});

app.get("/applications/new", function(req, res){
    Event.findById(req.query.event_id, function(err, event){
        if(err){
            console.log(err);
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./applications/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Zapisz się na kurs", events:events, event:event});
                   
                }
            })
        }
    });
    
});

app.get("/applications", isLoggedIn, function(req, res){
    Application.find({}).populate(["course", "event"]).exec(function(err, applications){
        if(err){
            console.log(err);
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./applications/index", {currentUser: req.user, header:"Driver Nauka Jazdy | Zapisy na kurs",applications:applications, events:events});
                   
                }
            })
            
        }
    })
});

app.post("/applications", function(req, res){
    Application.create(
        {
            name: req.body.name, 
            phone: req.body.phone, 
            email:req.body.email,
            isApplicated: false
        }, function(err, createdApplication){
        if(err){
            console.log(err);
        } else {
            Event.findById(req.body.event, function(err, event){
                if(err){
                    console.log(err);
                } else {
                    createdApplication.event = event._id;
                    createdApplication.course = event.course;
                    createdApplication.save();
                    req.flash("success", "Twoja aplikacja na kurs została wysłana. Za niedługo przyjdzie email z potwierdzeniem i dalszymi instrukcjami");
                    res.redirect("/")
                }
            })
        }
    })
})

app.post("/feedback", function(req, res, next){
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
})

app.get("/application/:id/delete", isLoggedIn, function(req, res){
    Application.findByIdAndRemove(req.params.id, function(err, deletedApplication){
        if(err){
            console.log(err);
        } else {
            res.redirect("/applications")
        }
    })
});

app.post("/application/:id/accepted", isLoggedIn, function(req, res, next){
    async.waterfall([
    
        function(done){
            Application.findById(req.params.id).populate(["course", "event"]).exec(function(err, application){
                if(!application){
                    req.flash('error', 'Nie znaleźliśmy takiej aplikacji. Spróbuj ponownie');
                    return res.redirect("/applications");
                }
               application.isApplicated = true;
                application.save(function(err){
                    done(err, application);
                });
            });
        },
        function(application, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                        type: "OAuth2",
                        user: 'driverjazdapl@gmail.com',
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN
                        
                        
                    
                   
                }
            });
            let mailOptions = {
                to: application.email,
                from: 'Driver jazda',
                subject: "Potwierdzenie zapisu na kurs prawa jazdy kategorii " + application.course.category,
                text: 'Witaj ' + application.name + ', \n\n' + 
                'Właśnie zapisaliśmy Cię na kurs prawa jazdy kategorii ' + application.course.category +
                '. Prosimy przyjdź ' + application.event.date + ' o ' + application.event.time + 
                ' do biura w miejscowości ' + application.event.city + ' z numerem PKK, żebyśmy mogli dokończyć procedurę zapisu.' +
                ' Dostaniesz wtedy również dodatkowe materiały np. płytę z pytaniami do egzaminu.' + '\n\n' +
                'Pozdrawiamy,' + '\n' + 'Zespół Driver jazda'  
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "Email został wysłany na adres " + application.email);
                done(err, 'done');
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/applications');
    });
});



app.get("/courses/new", isLoggedIn, function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("./courses/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Dodaj kurs", events:events});
           
        }
    })
    
});

app.post("/courses", isLoggedIn, function(req, res){
    let newCourse = new Course({
        category: req.body.category, 
        price: req.body.price, 
        additionalPrice: req.body.additionalPrice 
    })
    Course.create(newCourse, function(err, createdCourse){
        if(err){
            console.log(err);
        } else {
            res.redirect("/")
        }
    });
})

app.get("/courses/:id/edit", isLoggedIn, function(req, res){
    Course.findById(req.params.id, function(err, course){
        if(err){
            console.log(err); 
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./courses/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Edytuj kurs", course: course, events:events});
                   
                }
            })
            
        }
    })
});

app.put("/course/:id", isLoggedIn, function(req, res){
    Course.findByIdAndUpdate(req.params.id, req.body.course, function(err, updatedCourse){
        if(err){
            console.log(err)
        } else {
            res.redirect("/offer/course/" + updatedCourse.category);
        }
    });
});

app.get("/courses/:id/events/new", isLoggedIn, function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("./events/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Dodaj termin", events:events, course_id: req.params.id});
           
        }
    })
    
})

app.post("/courses/:id/events", isLoggedIn, function(req, res){
    Event.create({ city: req.body.city, time: req.body.time, date: req.body.date}, function(err, event){
        if(err){
            console.log(err);
        } else {
            event.course = req.params.id;
            event.save();
            Course.findById(req.params.id, function(err, course){
                if(err){
                    console.log(err);
                } else {
                    course.events.push(event);
                    course.save();
                    res.redirect("/offer/course/" + course.category);
                }
            });
        }
    })
})


app.get("/courses/:id/events/:event_id/edit", isLoggedIn, function(req, res){
    Event.findById(req.params.event_id, function(err, event){
        if(err){
            console.log(err);
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./events/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Edytuj termin", events:events, event:event, course_id: req.params.id});
                   
                }
            })
            
        }
    })
});

app.put("/courses/:id/events/:event_id", isLoggedIn, function(req, res){
    Event.findByIdAndUpdate(req.params.event_id, req.body.event, function(err, updatedEvent){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("/courses/:id/events/:event_id/delete", isLoggedIn, function(req, res){
    Event.findByIdAndRemove(req.params.event_id, function(err, event){
        if(err){
            console.log(err)
        } else {
            res.redirect("/")
        }
        
    })
})


app.get("/courses/:id/characteristics/new", isLoggedIn, function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("./characteristic/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Dodaj cechę charakterystyczną", course_id: req.params.id, events:events});
           
        }
    })
   
});

app.post("/courses/:id/characteristics", isLoggedIn, function(req, res){
    Characteristic.create({text:req.body.text}, function(err, createdCharacteristic){
        if(err){
            console.log(err)
        } else {
            Course.findById(req.params.id, function(err, course){
                if(err){
                    console.log(err)

                } else {
                    course.characteristics.push(createdCharacteristic);
                    course.save();
                    res.redirect("/offer/course/" + course.category)
                }
            })
           
        }
    });
})

app.get("/courses/:id/characteristics/:characteristic_id/edit", isLoggedIn, function(req, res){
    Characteristic.findById(req.params.characteristic_id, function(err, characteristic){
        if(err){
            console.log(err);
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./characteristic/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Edytuj cechę charakterystyczną", events:events, characteristic:characteristic, course_id: req.params.id});
                   
                }
            })
            
        }
    })

})

app.put("/courses/:id/characteristics/:characteristic_id", isLoggedIn, function(req, res){
    Characteristic.findByIdAndUpdate(req.params.characteristic_id, req.body.characteristic, function(err, updatedCharacteristic){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});
app.get("/courses/:id/characteristics/:characteristic_id/delete", isLoggedIn, function(req, res){
    Characteristic.findByIdAndRemove(req.params.characteristic_id, function(err, characteristic){
        if(err){
            console.log(err)
        } else {
            res.redirect("/")
        }
        
    })
})

app.get("/announcements/new", isLoggedIn, function(req, res){
    Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
        if(err){
            console.log(err);
        } else {
            res.render("./announcements/new", {currentUser: req.user, header:"Driver Nauka Jazdy | Dodaj ogłoszenie", events:events});
           
        }
    })
    
});

app.post("/announcements", isLoggedIn, function(req, res){
    Announcement.create({text: req.body.text}, function(err){
        if(err){
            console.log(err)
        } else {
            res.redirect("/");
        }
    })
});

app.get("/announcements/:id/edit", isLoggedIn, function(req, res){
    Announcement.findById(req.params.id, function(err, announcement){
        if(err){
            console.log(err)
        } else {
            Event.find({}).populate("course").sort({date: 1}).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./announcements/edit", {currentUser: req.user,events:events,header:"Driver Nauka Jazdy | Edytuj ogłoszenie", announcement: announcement})
                   
                }
            })
            
        }
    })
});

app.put("/announcements/:id", isLoggedIn, function(req, res){
    Announcement.findByIdAndUpdate(req.params.id, req.body.announcement, function(err, updatedAnnouncement){
        if(err){
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
})

app.get("/announcements/:id/delete", isLoggedIn, function(req, res){
    Announcement.findByIdAndRemove(req.params.id, function(err, updatedAnnouncement){
        if(err){
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/");
}

app.listen(process.env.PORT);