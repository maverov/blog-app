const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

// First step in configuring Mongoose -> We need to connect to a DB.
mongoose.connect("mongodb://localhost/blog_app", { useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine", "ejs");
// Telling express to server our static files (public folder)
app.use(express.static("public"));
// Setting up Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Mongoose/Model Schema + Configuration
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
const Blog = mongoose.model("Blog", blogSchema)

// Blog.create({
//     title: "Test Blog",
//     image: "http://is2.4chan.org/biz/1575890365055.jpg",
//     body: "HELLO THIS IS A BLOG POST"
// });

// RESTful Routes
app.get("/", (req, res) => {
    res.redirect("/blogs");
})

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, results) => {
        if (err) {
            console.log(err)
        } else {
            res.render("index", { blogPosts: results })
        }
    })
});

// GET ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
})

// POST ROUTE
app.post("/blogs", (req, res) => {
    const title = req.body.blog.title;
    const image = req.body.blog.image;
    const body = req.body.blog.body;

    // Create new Blog Post with Mongoose
    Blog.create({
        title: title,
        image: image,
        body: body
    }, (err, newBlogPost) => {
        if (err) {
            console.log(err);
            res.render("new");
        } else {
            console.log(newBlogPost);
            res.redirect("/");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    // The .findById() method takes 2 arguments: the id of the db item, and a callback function
    Blog.findById(req.params.id, (err, blogPost) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            console.log("BLOG POST FOUND");
            res.render("show", { blogPost: blogPost });
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    // Find blog by ID
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("edit", { foundBlog: foundBlog });
        }
    })
})

// UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    // NEW METHOD => Blog.findByIdAndUpdate()
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
})

app.listen(3000, () => {
    console.log("Server started.")
    console.log("Listening on port 3000.")
})