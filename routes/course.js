const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    multer                = require("multer"),
    cloudinary            = require("cloudinary"),
    methodOverride        = require("method-override"),
    Course                = require("../models/course"),
    Picture                = require("../models/picture"),
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());


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


router.get("/new", isLoggedIn, function(req, res){
    res.render("./courses/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj kurs"});
});

router.get("/:category", function(req, res){
    Course.findOne({category: req.params.category}).populate(["events", "characteristics", "installments", "pictures"]).exec(function(err, course){
        if(err){
            console.log(err)
        } else {
            res.render("./courses/show", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Oferta | Kategoria " + course.category, course: course});
        }
    })
    
});




router.post("/", isLoggedIn, function(req, res){
    let newCourse = new Course({
        category: req.body.category, 
        price: req.body.price, 
        additionalPrice: req.body.additionalPrice,
        type: 'car',
        sale: req.body.sale 
    })
    Course.create(newCourse, function(err, createdCourse){
        if(err){
            console.log(err);
        } else {
            res.redirect(`/courses/${createdCourse.category}`)
        }
    });
})

router.get("/:id/edit", isLoggedIn, function(req, res){
    Course.findById(req.params.id, function(err, course){
        if(err){
            console.log(err); 
        } else {
            
            res.render("./courses/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj kurs", course: course});
                   
                
            
        }
    })
});

router.get("/:id/add/picture", isLoggedIn, function(req, res){
    Course.findById(req.params.id, function(err, course){
        if(err){
            console.log(err)
        } else {
            res.render("./courses/addP", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Kursy | " + course.category + " | Dodaj zdjęcie", course: course});
        }
    });
})

router.post("/:id/add/picture", upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Course.findById(req.params.id, function(err, course){
            if(err){
                console.log(err)
            } else {
                Picture.create({link: result.secure_url}, (err, createdPicture) => {
                    course.pictures.push(createdPicture);
                    course.save();
                    res.redirect("/courses" + course.category)
                })
                
            }
        });
    });
   
})

router.post("/:id", isLoggedIn, function(req, res){
    Course.findByIdAndUpdate(req.params.id, req.body.course, function(err, updatedCourse){
        if(err){
            console.log(err)
        } else {
            updatedCourse.type = "car";
            updatedCourse.save();
            res.redirect("/courses/" + updatedCourse.category);
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/subpages/strona-główna");
}

module.exports = router;