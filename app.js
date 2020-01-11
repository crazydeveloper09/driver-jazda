const express = require("express"),
    app       = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("index");
})

app.get("/about", function(req, res){
    res.render("about");
})

app.get("/contact", function(req, res){
    res.render("contact");
})

app.get("/gallery", function(req, res){
    res.render("gallery");
})

app.get("/pkk", function(req, res){
    res.render("pkk");
})

app.get("/pricelist", function(req, res){
    res.render("pricelist");
})

app.get("/offer", function(req, res){
    res.render("offer");
});

app.get("/application", function(req, res){
    res.render("application");
});


app.listen(3000);