const express             = require("express"),
    app                   = express(),
    router                = express.Router({mergeParams: true}),
    methodOverride        = require("method-override"),
    Office                = require("../models/office"),
    Driver                = require("../models/driver"),
    Event                = require("../models/event"),
    flash                 = require("connect-flash"),
    NodeGeocoder           = require("node-geocoder"),
    dotenv                = require("dotenv");

dotenv.config();

app.use(methodOverride("_method"));
app.use(flash());

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
let geocoder = NodeGeocoder(options);

router.get("/new", isLoggedIn, function(req, res){
    res.render("./offices/new", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Dodaj termin", driver_id: req.params.driver_id});
})

router.post("/", isLoggedIn, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        console.log(data[0])
        let street = data[0].streetName + " " + data[0].streetNumber;
        console.log(street)
        let newOffice = new Office({
            name: req.body.name,
            what: req.body.what,
            additional: req.body.additional,
            postalCode: data[0].zipcode,
            city: data[0].city,
            location: data[0].formattedAddress,
            lat: data[0].latitude,
            lng: data[0].longitude,
            openingHours: req.body.openingHours,
            street: street
        })
        Office.create(newOffice, function(err, office){
            if(err){
                console.log(err);
            } else {
                
                Driver.findById(req.params.driver_id, function(err, driver){
                    if(err){
                        console.log(err);
                    } else {
                        driver.carOffices.push(office);
                        driver.save();
                        res.redirect("/contact");
                    }
                });
            }
        })
    });
    
})
router.get("/:office_id", function(req, res){
    Office.findById(req.params.office_id, function(err, office){
        if(err){
            console.log(err);
        } else {
            Event.find({type: 'car'}).populate(["course", "office"]).sort({date: 1}).limit(6).exec(function(err, events){
                if(err){
                    console.log(err);
                } else {
                    res.render("./offices/show", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Mapka biura", office:office, user: req.user, events});
                }
            })
        }
    })
});

router.get("/:office_id/edit", isLoggedIn, function(req, res){
    Office.findById(req.params.office_id, function(err, office){
        if(err){
            console.log(err);
        } else {
           
            res.render("./offices/edit", {currentUser: req.user,header:"Driver Nauka Jazdy | Samochody | Edytuj biuro", office:office, driver_id: req.params.driver_id});
        }
    })
});

router.put("/:office_id", isLoggedIn, function(req, res){
    geocoder.geocode(req.body.office.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        Office.findByIdAndUpdate(req.params.office_id, req.body.office, function(err, updatedoffice){
            if(err){
                console.log(err);
            } else {
                let street = data[0].streetName + " " + data[0].streetNumber;
                console.log(street)
                updatedoffice.location = data[0].formattedAddress;
                updatedoffice.lat = data[0].latitude;
                updatedoffice.lng = data[0].longitude;
                updatedoffice.zipcode = data[0].zipcode;
                updatedoffice.city =  data[0].city;
                updatedoffice.street = street;
                updatedoffice.save();
                res.redirect("/contact");
            }
        });
    });
   
});

router.get("/:office_id/delete", isLoggedIn, function(req, res){
    Office.findByIdAndRemove(req.params.office_id, function(err, office){
        if(err){
            console.log(err)
        } else {
            res.redirect("/contact")
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