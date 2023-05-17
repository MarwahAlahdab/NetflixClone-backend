"use strict";

const express = require("express");
const server = express();
const data = require("./Movie Data/data.json");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const apiKey = process.env.APIkey;
const PORT = process.env.PORT || 3002

server.use(express.json());
server.use(cors());

// Build the following routes using the GET request:

// Home Page Endpoint: /

// Create a route with a method of get and a path of /. The callback should use the provided JSON data.
// Create a constructor function to ensure your data follow the same format.

server.get("/", (req, res) => {
  let movie = new Movie(data.title, data.poster_path, data.overview);
  res.send(JSON.stringify({ movie }));
});

function Movie(title, poster_path, overview,comment) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
  this.comment = comment;
}

server.get("/favorite", (req, res) => {
  res.send("Welcome to Favorite Page");
});

server.get("/trending", trendingHandler);
server.get("/search/:query", searchingHandler);
server.get("/movie/:id", getByID);
server.get("/movie/:id/credits", getMovieCridets);
server.get("/getMovies", getMovie);
server.post("/movie/addMovie", addMovie);
server.put("/UPDATE/:id", updateMovieHandler);
server.delete("/DELETE/:id", deleteMovieHandler);
server.get("/getMovie", getMovieHandler);


//     Handle errors
// Create a function to handle the server error (status 500)
// Create a function to handle "page not found error" (status 404)

//404 should be before 500
server.get("*", (req, res) => {
  res.status(404).send("Sorry, page not found");
});

server.get("*", (req, res) => {
  res.status(500).send({
    status: 500,
    responseText: "Sorry, something went wrong",
  });
});

server.use(errorHandler);

//lab14

function trendingHandler(req, res) {
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
  try {
    axios
      .get(url)
      .then((result) => {
        let mapResult = result.data.results.map((item) => {
          let singleMovie = new MovieApi(
            item.id,
            item.title,
            item.release_date,
            item.poster_path,
            item.overview
          );
          return singleMovie;
        });
        res.send(mapResult);
      })
      .catch((error) => {
        console.log("something went wrong", error);
        res.status(500).send(error);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}







function searchingHandler(req, res) {
  const movieName = req.params.query;
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US&query=${movieName}`;
  try {
    axios
      .get(url)
      .then((result) => {
        let mapResult = result.data.results.map((item) => {
          let singleMovie = new MovieApi(
            item.id,
            item.title,
            item.release_date,
            item.poster_path,
            item.overview
          );
          return singleMovie;
        });
        res.send(mapResult);
      })
      .catch((error) => {
        console.log("something went wrong", error);
        res.status(500).send(error);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}

// Get movie details by ID

function getByID(req, res) {
  const movieID = req.params.id;
  const url = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}`;
  try {
    axios
      .get(url)
      .then((result) => {
        let singleMovie = new MovieApi(
          result.data.id,
          result.data.title,
          result.data.release_date,
          result.data.poster_path,
          result.data.overview
        );

        res.send(singleMovie);
      })
      .catch((error) => {
        console.log("something went wrong", error);
        res.status(500).send(error);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}

//Get movie credits by ID

function getMovieCridets(req, res) {
  const movieID = req.params.id;
  const url = `https://api.themoviedb.org/3/movie/${movieID}/credits?api_key=${apiKey}`;
  try {
    axios
      .get(url)
      .then((result) => {
        const cast = result.data.cast.map((actor) => actor.name);

        res.send(cast);
      })
      .catch((error) => {
        console.log("something went wrong", error);
        res.status(500).send(error);
      });
  } catch (error) {
    errorHandler(error, req, res);
  }
}

function MovieApi(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}

//Lab 15

const pg = require("pg");
// const connectionString = process.env.DATABASE_URL;
const client = new pg.Client(process.env.DATABASE_URL);

function getMovie(req, res) {
  const sql = "SELECT * FROM movie";
  client
    .query(sql)
    .then((data) => {
      res.send(data.rows);
    })
    .catch(() => {
      errorHandler(error, req, res);
    });
}

function addMovie(req, res) {
  const movie = req.body;
  console.log(movie);
  const sql =
    "INSERT INTO movie (title, release_date, overview, comment) VALUES ($1, $2, $3, $4);";
  const values = [movie.title, movie.release_date, movie.overview, movie.comment];
  client
    .query(sql, values)
    .then((data) => {
      res.status(201).send("Data added successfully!");
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

//Lab 16

function updateMovieHandler(req,res) {
  // create an update request to update your comments for a specific movie in the database.
  const {id} = req.params
  const sql =`UPDATE movie SET comment=$1 WHERE id=${id};`;
  const {comment} = req.body;
  const values = [comment];
  client.query(sql,values).then((data)=>{
    res.send(data.rows) ////////
  }) .catch((error)=>{
    errorHandler(error,req,res)
})
}





///updateComment/:id



function deleteMovieHandler(req,res) {
const id=req.params.id;
const sql= `DELETE FROM movie WHERE id=${id};`;
client.query(sql).then((data)=>{
  res.status(202).send(data)
}).catch((error)=>{
  errorHandler(error,req,res)
})
}


function getMovieHandler(req,res) {
  const id=req.query.id;
  const sql= `SELECT * FROM movie WHERE id=${id};`;
  client.query(sql).then((data)=>{//[id]
    res.send(data.rows)
  }).catch((error)=>{
    errorHandler(error,req,res)
  })
}





function errorHandler(error, req, res) {
  const err = {
    status: 500,
    message: error,
  };
  res.status(500).send(err);
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
});