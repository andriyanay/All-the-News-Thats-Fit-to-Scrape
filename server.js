var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var PORT = process.env.PORT || 8080;

var db = require("./models");

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var reqTimer = setTimeout(function wakeUp() {
    request("https://thawing-journey-81728.herokuapp.com", function() {
       console.log("WAKE UP DYNO");
    });
    return reqTimer = setTimeout(wakeUp, 1200000);
 }, 1200000);


// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";

mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);

mongoose.connect("mongodb://localhost/newsArticlesDB", { useNewUrlParser: true });


app.get("/scrape", function (req, res) {
    request("https://www.nytimes.com/section/technology?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=Tech&WT.nav=page", function (error, response, html) {
        var $ = cheerio.load(html);

        $(".story-meta").each(function (i, element) {
            var link = $(element).parent().attr("href");
            var title = $(element).children(".headline").text().trim();
            var summary = $(element).children(".summary").text();

            var result = {
                title: title,
                summary: summary,
                link: link
            }

            db.Article.create(result)
                .then(function (data) {
                    // res.json(data)
                })
                .catch(function (err) {
                    // res.json(err);
                })
        })
    })
})

app.get("/", function(req, res) {
    res.render("index");
})

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (data) {
            res.render("index", { articles: data })
        })
        .catch(function(err) {
            res.send(err);
        })
})

app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (data) {
            res.render("saved", { articles: data })
        })
})

app.post("/favorite/:id", function (req, res) {
    console.log(req.body)
    console.log(req.params.id);

    if (req.body.click === "false") {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } }, { new: true }).then(function (data) {
            res.json(data);
        }).catch(function (err) {
            if (err) throw err
        })
    } else {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false } }, { new: true }).then(function (data) {
            res.json(data);
        }).catch(function (err) {
            if (err) throw err
        })
    }
})

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            if (err) throw err;
        })
})

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body).then(function (data) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { note: data._id } }, { new: true });
    }).then(function (dbUser) {
        res.json(dbUser);
    }).catch(function (err) {
        if (err) throw err;
    })
})


// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});