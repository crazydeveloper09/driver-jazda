const express               = require("express"),
    app                     = express(),
    mongoose                = require("mongoose"),
    Driver                  = require("./models/driver"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    passport                = require("passport"),
    announcementRoutes      = require("./routes/announcement"),
    applicationRoutes       = require("./routes/application"),
    characteristicRoutes    = require("./routes/characteristic"),
    courseRoutes            = require("./routes/course"),
    installmentRoutes             = require("./routes/installment"),
    eventRoutes             = require("./routes/event"),
    driverRoutes             = require("./routes/driver"),
    linksRoutes             = require("./routes/links"),
    officesRoutes             = require("./routes/office"),
    subpageRoutes             = require("./routes/subpage"),
    messageRoutes             = require("./routes/message"),
    listRoutes             = require("./routes/list"),
    listElementRoutes             = require("./routes/listElement"),
    apiRoutes           = require("./routes/api"),
    galleryRoutes           = require("./routes/gallery"),
    indexRoutes             = require("./routes/index"),
    LocalStrategy           = require("passport-local"),
	  methodOverride        = require("method-override"),
    bodyParser              = require("body-parser"),
    flash                   = require("connect-flash");

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});





app.use(flash());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

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



app.use("/gallery",galleryRoutes);
app.use("/courses/:course_id/installments",installmentRoutes);
app.use("/courses/:course_id/events",eventRoutes);
app.use("/courses",courseRoutes);
app.use("/courses/:course_id/characteristics",characteristicRoutes);
app.use("/applications",applicationRoutes);
app.use("/announcements",announcementRoutes);
app.use("/driver",driverRoutes);
app.use("/driver/:driver_id/offices",officesRoutes);
app.use("/links",linksRoutes);
app.use("/subpages",subpageRoutes);
app.use("/subpages/:subpage_id/messages",messageRoutes);
app.use("/subpages/:subpage_id/lists",listRoutes);
app.use("/subpages/:subpage_id/lists/:list_id/listElements",listElementRoutes);
app.use("/api", apiRoutes);
app.use(indexRoutes);


app.listen(process.env.PORT);