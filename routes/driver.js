const express             = require("express"),
    app                   = express(),
    router                = express.Router(),
    multer                = require("multer"),
    cloudinary            = require("cloudinary"),
    methodOverride        = require("method-override"),
    Driver                = require("../models/driver"),
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



router.get("/:id/edit", isLoggedIn, function(req, res){
    Driver.findById(req.params.id, function(err, driver){
        if(err){
            console.log(err); 
        } else {
           
            res.render("./driver/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj użytkownika", driver: driver});
                   
               
            
        }
    })
});

router.put("/:id", isLoggedIn, function(req, res){
    Driver.findByIdAndUpdate(req.params.id, req.body.driver, function(err, updateddriver){
        if(err){
            console.log(err)
        } else {
            res.redirect("/contact");
        }
    });
});

router.get("/:id/add/picture", isLoggedIn, function(req, res){
    Driver.findById(req.params.id, function(err, driver){
        if(err){
            console.log(err)
        } else {
            res.render("./driver/addP", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | " + driver.username + " | Dodaj zdjęcie", driver: driver});
        }
    });
})

router.post("/:id/add/picture", upload.single("picture"), function(req, res){
    if(req.file) {
        cloudinary.uploader.upload(req.file.path, function(result) {
            Driver.findById(req.params.id, function(err, driver){
                if(err){
                    console.log(err)
                } else {
                    Picture.create({link: result.secure_url}, (err, createdPicture) => {
                        driver.pictures.push(createdPicture);
                        driver.save();
                        res.redirect("/contact")
                    })
                }
            });
        });
    } else {
        req.flash("error", "Wybierz plik")
        res.redirect(`/driver/${req.params.id}/add/picture`)
    }
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/subpages/strona-główna");
}

module.exports = router;