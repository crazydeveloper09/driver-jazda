const express             = require("express"),
    app                   = express(),
    multer                = require("multer"),
    cloudinary            = require("cloudinary"),
    router                = express.Router(),
    Event                = require("../models/event"),
    Picture                = require("../models/picture"),
    Gallery                = require("../models/gallery"),
    methodOverride        = require("method-override"),
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

router.get("/", function(req, res){
    Gallery.find({$and:[{$or:[{type:'car'}, {type:'all'}]}]}, function(err, galleries){
        if(err){
            console.log(err);
        } else {
            res.render("./gallery/index", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Galeria", galleries: galleries});
        }
    })
    

});



router.get("/new", isLoggedIn, function(req, res){
    
    res.render("./gallery/new", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Dodaj galerię",});
           
        
    
});

router.get("/:id", function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            res.render("./gallery/show", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Galeria | " + gallery.title, gallery: gallery});
        }
    });
})

router.post("/", upload.single("profile"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Gallery.create({title: req.body.title, profile:result.secure_url, pictures:[], type: req.body.type}, function(err,createdGallery){
            if(err){
                console.log(err);
            } else {
                res.redirect("/gallery/" + createdGallery._id);
            }
        })
    });
    
});

router.get("/:id/edit", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            res.render("./gallery/edit", {currentUser: req.user, header:"Driver Nauka Jazdy | Samochody | Galeria | " + gallery.title + " | Edytuj tytuł",gallery: gallery});
        }
    });
});

router.put("/:id", isLoggedIn, function(req, res){
    Gallery.findByIdAndUpdate(req.params.id, req.body.gallery, function(err, updatedGallery){
        if(err){
            console.log(err)
        } else {
            res.redirect("/gallery/" + updatedGallery._id)
        }
    })
});

router.get("/:id/delete", isLoggedIn, function(req, res){
    Gallery.findByIdAndRemove(req.params.id, function(err, deletedGallery){
        if(err){
            console.log(err)
        } else {
            res.redirect("/gallery")
        }
    })
})

router.get("/pictures/:picture_id/delete", isLoggedIn, function(req, res){
    Picture.findByIdAndRemove(req.params.picture_id, function(err, deletedPicture){
        if(err){
            console.log(err)
        } else {
            res.redirect("back")
        }
    })
})

router.get("/:id/add/picture", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            res.render("./gallery/addP", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Galeria | " + gallery.title + " | Dodaj zdjęcie", gallery: gallery});
        }
    });
})

router.post("/:id/add/picture", upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Gallery.findById(req.params.id, function(err, gallery){
            if(err){
                console.log(err)
            } else {
                Picture.create({link: result.secure_url}, (err, createdPicture) => {
                    gallery.pictures.push(createdPicture);
                    gallery.save();
                    res.redirect("/gallery/" + gallery._id)
                })
                
            }
        });
    });
   
})

router.get("/:id/edit/profile", isLoggedIn, function(req, res){
    Gallery.findById(req.params.id, function(err, gallery){
        if(err){
            console.log(err)
        } else {
            res.render("./gallery/editP", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Galeria | " + gallery.title + " | Edytuj zdjęcie główne", gallery: gallery});
        }
    });
})

router.post("/:id/edit/profile", upload.single("profile"), function(req, res){
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

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect("/subpages/strona-główna");
}


module.exports = router;