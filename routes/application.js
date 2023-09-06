const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    methodOverride        = require("method-override"),
    Event                = require("../models/event"),
    Course                = require("../models/course"),
    Application                = require("../models/application"),
    flash                 = require("connect-flash"),
    xoauth2               = require("xoauth2"),
    nodemailer            = require("nodemailer"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());




router.get("/search", isLoggedIn, (req, res) => {
    const regex = new RegExp(escapeRegex(req.query.name), 'gi');
    Application.find({name: regex}).populate([{ 
        path: 'event',
        populate: {
          path: 'office',
          model: 'Office'
        } 
     }, "course"]).exec((err, applications) => {
        if(err){
            console.log(err);
        } else {
           
            res.render("./applications/search", {applications: applications, currentUser: req.user, param: req.query.name, header: `Driver Nauka Jazdy | Samochody | Zapisy na kursy | Wyszukiwanie po parametrze ${req.query.name}`})
                   
                
            
        }
    })
})

router.get("/courses/:course_id", isLoggedIn, function(req, res){
    console.log(req.params.course_id)
    Course.findById(req.params.course_id, (err, course) => {
        if(err){
            console.log(err);
        } else {
            console.log(course)
            Application.find({course: course._id}).populate([{ 
                path: 'event',
                populate: {
                  path: 'office',
                  model: 'Office'
                } 
             }, "course"]).exec((err,applications) => {
                if(err){
                    console.log(err);
                } else {
                    
                    res.render("./applications/category", {applications: applications, currentUser: req.user, param: course.category, header: `Driver Nauka Jazdy | Samochody | Zapisy na kursy | Wyszukiwanie po parametrze ${course.category}`})
                           
                        
                    
                }
            })
        }
    })
})

router.get("/new", function(req, res){
    Event.findById(req.query.event_id).populate(["course", "office"]).exec(function(err, event){
        if(err){
            console.log(err);
        } else {
            res.render("./applications/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Motocykle | Zapisz się na kurs", event:event});
        }
    });
    
});

router.get("/", isLoggedIn, function(req, res){
    Application.find({}).populate(["course", { 
        path: 'event',
        populate: {
          path: 'office',
          model: 'Office'
        } 
     }]).exec(function(err, applications){
        if(err){
            console.log(err);
        } else {
            console.log(applications)
            res.render("./applications/index", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Zapisy na kurs",applications:applications, events:applications});
                
            
        }
    })
});

router.post("/", function(req, res){
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
                    async function sendMail(application) {
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
                            subject: "Zapis na kurs prawa jazdy kategorii " + application.course.category,
                            text: 'Witaj ' + application.name + ', \n\n' + 
                            'Właśnie zapisaliśmy Cię na kurs prawa jazdy kategorii ' + application.course.category +
                            '. Poczekaj na potwierdzenie zapisu z dodatkowymi informacjami.' +
                            'Pozdrawiamy,' + '\n' + 'Zespół Driver jazda'  
                        };
                        smtpTransport.sendMail(mailOptions, function(err){
                            req.flash("success", "Twoja aplikacja na kurs została wysłana. Za niedługo przyjdzie email z potwierdzeniem i dalszymi instrukcjami");
                            res.redirect("/")
                            done(err, 'done');
                        });
                    }
                    sendMail(createdApplication);
                }
            })
        }
    })
})



router.get("/:id/delete", isLoggedIn, function(req, res){
    Application.findByIdAndRemove(req.params.id, function(err, deletedApplication){
        if(err){
            console.log(err);
        } else {
            res.redirect("/applications")
        }
    })
});

router.post("/:id/accepted", isLoggedIn, function(req, res, next){
    
            Application.findById(req.params.id).populate(["course", { 
                path: 'event',
                populate: {
                  path: 'office',
                  model: 'Office'
                } 
             }]).exec(function(err, application){
                if(!application){
                    req.flash('error', 'Nie znaleźliśmy takiej aplikacji. Spróbuj ponownie');
                    return res.redirect("/applications");
                }
                async function sendMail(application) {
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
                        ' do biura w miejscowości ' + application.event.office.city + ' z numerem PKK, żebyśmy mogli dokończyć procedurę zapisu.' +
                        ' Dostaniesz wtedy również dodatkowe materiały np. płytę z pytaniami do egzaminu.' + '\n\n' +
                        'Pozdrawiamy,' + '\n' + 'Zespół Driver jazda'  
                    };
                    smtpTransport.sendMail(mailOptions, function(err){
                        req.flash("success", "Email został wysłany na adres " + application.email);
                        done(err, 'done');
                    });
                }
                sendMail(application);
                application.isApplicated = true;
                application.save();
                res.redirect('/applications');
            });
       
        
   
});

function isLoggedIn(req, res, next) {
    console.log(req.user)
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/subpages/strona-główna");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;