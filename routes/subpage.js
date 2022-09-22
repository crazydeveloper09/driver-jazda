const express             = require("express"),
    app                   = express(),
    multer                = require("multer"),
    cloudinary            = require("cloudinary"),
    router                = express.Router(),
    methodOverride        = require("method-override"),
    Subpage                = require("../models/subpage"),
    Picture                = require("../models/picture"),
    Message                = require("../models/message"),
    List               = require("../models/list"),
    Element               = require("../models/listElement"),
    Announcement               = require("../models/announcement"),
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
    res.render("./subpages/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj podstronę"});
});

router.get("/:address", function(req, res){
    
    Subpage.findOne({$and:[{address: req.params.address}, {type: 'car'}]}).populate(["message", "pictures"]).exec((err, subpage) => {
        if(err){
            console.log(err)
        } else {
            List.find({subpage: subpage._id}).populate("elements").exec((err, lists) => {
                
                Announcement.find({}, (err, announcements) => {
                    res.render("./subpages/show", {announcements: announcements, currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | " + subpage.name, subpage: subpage, lists: lists});
                })
                
            })
        }
    })
    
});




router.post("/", isLoggedIn, function(req, res){
    let newSubpage = new Subpage({
        title: req.body.title, 
        more: req.body.more,
        name: req.body.name, 
        text: req.body.text,
        address: req.body.name.toLowerCase().split(' ').join('-')
    })
    Subpage.create(newSubpage, function(err, createdSubpage){
        if(err){
            console.log(err);
        } else {
            res.redirect(`/subpages/${createdSubpage.address}`)
        }
    });
})

router.get("/:id/add/picture", isLoggedIn, function(req, res){
    Subpage.findById(req.params.id, function(err, subpage){
        if(err){
            console.log(err)
        } else {
            res.render("./subpages/addP", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | " + subpage.title + " | Dodaj zdjęcie", subpage: subpage});
        }
    });
})

router.post("/:id/add/picture", upload.single("picture"), function(req, res){
    if(req.file) {
        cloudinary.uploader.upload(req.file.path, function(result) {
            Subpage.findById(req.params.id, function(err, subpage){
                if(err){
                    console.log(err)
                } else {
                    Picture.create({link: result.secure_url}, (err, createdPicture) => {
                        subpage.pictures.push(createdPicture);
                        subpage.save();
                        res.redirect("/subpages/" + subpage.address)
                    })
                    
                }
            });
        });
    } else {
        req.flash("error", "Wybierz plik")
        res.redirect(`/subpages/${req.params.id}/add/picture`)
    }
   
})

router.get("/:id/edit", isLoggedIn, function(req, res){
    Subpage.findById(req.params.id, function(err, subpage){
        if(err){
            console.log(err); 
        } else {
            
            res.render("./subpages/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj podstronę", subpage: subpage});
                   
                
            
        }
    })
});

router.post("/:id", isLoggedIn, function(req, res){
    Subpage.findByIdAndUpdate(req.params.id, req.body.subpage, function(err, updatedSubpage){
        if(err){
            console.log(err)
        } else {
            res.redirect("/subpages/" + updatedSubpage.address);
        }
    });
});

router.get("/:id/delete", isLoggedIn, function(req, res){
    Subpage.findByIdAndRemove(req.params.id, function(err, removedSubpage){
        if(err){
            console.log(err)
        } else {
            res.redirect("/subpages/strona-główna");
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