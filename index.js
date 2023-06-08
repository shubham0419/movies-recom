const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const axios = require("axios");

mongoose
  .connect("mongodb://127.0.0.1:27017/movies-recomm")
  .then(() => console.log("connection open!"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}))

app.get("/",async (req, res) => {
  const movies = await Movie.find({});
  res.render("index", { movies });
});

app.post("/",async (req, res) => {
  const {searchText} = req.body;
  console.log(searchText);
  await Movie.deleteMany({});
  axios
    .get(`https://api.tvmaze.com/search/shows?q=${searchText}`)
    .then((result) => {
      let movies = result.data;
      movies.forEach((movie) => {
        if (movie.show.image !== null && movie.show.runtime) {
          Movie.create({
            name: movie.show.name,
            runtime: movie.show.runtime,
            year: movie.show.premiered,
            image: movie.show.image.medium,
          });
        }
      });

      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:3000`)
);
