var express = require('express');
var router = express.Router();
var request = require('request-promise');

const pgp = require('pg-promise')();

const cn = 'postgres://joshuasparks:coolpass@localhost:5432/movie_search'

const db = pgp(cn);

let sco;


router.get('/:movieId', function(req, res, next) {
	let movieData;

	db.connect()
		.then(obj => {
			sco = obj;
			return sco.one("SELECT * FROM Movies where id = '" + req.params.movieId + "'");
		}).then(data => {
			movieData = data;
			res.render('view', { title: 'Express', movieData: movieData});
		})
})

router.post('/:movieId', function (req, res) {
	db.connect()
		.then(obj => {
		sco = obj;
		return sco.one("UPDATE Movies SET title = '" + req.body.title + "', description = '" + req.body.description + "', popularity = " + req.body.popularity + ", language = '" + req.body.language + "' where id = '" + req.params.movieId + "'");
	}).catch(error => {
		console.log(error)
	})
    res.send('Post page');
});


router.get('/language/:languageCode', function(req, res, next) {
	db.connect().then(obj => {
		return obj.any(selectQuery("language", "=", "'en'"))
	}).then(moviesList => {
		res.render('index', {title: ("language is " + req.params.languageCode), databaseData: moviesList})
	})
})

router.get('/popularity_greater_than/:popularityAmount', function(req, res, next) {
	db.connect().then(obj => {
		return obj.any(selectQuery("popularity", ">", req.params.popularityAmount))
	}).then(moviesList => {
		res.render('index', {title: ("popularity is greater than " + req.params.popularityAmount), databaseData: moviesList})
	})
})

router.get('/popularity_less_than/:popularityAmount', function(req, res, next) {
	db.connect().then(obj => {
		return obj.any(selectQuery("popularity", "<", req.params.popularityAmount))
	}).then(moviesList => {
		res.render('index', {title: ("popularity is less than " + req.params.popularityAmount), databaseData: moviesList})
	})
})

router.get('/vote_average_greater_than/:voteAverageAmount', function(req, res, next) {
	db.connect().then(obj => {
		return obj.any(selectQuery("vote_average", ">", req.params.voteAverageAmount))
	}).then(moviesList => {
		res.render('index', {title: ("vote average higher than" + req.params.voteAverageAmount), databaseData: moviesList})
	})
})

router.get('/vote_average_less_than/:voteAverageAmount', function(req, res, next) {
	db.connect().then(obj => {
		return obj.any(selectQuery("vote_average", "<", req.params.voteAverageAmount))
	}).then(moviesList => {
		res.render('index', {title: ("vote_average is less than" + req.params.voteAverageAmount), databaseData: moviesList})
	})
})

function selectQuery(sortByKey, comparison, sortByValue) {
	return "SELECT * FROM Movies where " + sortByKey + " " + comparison + " " + sortByValue	
}


function logMovies(sortByKey, comparison, sortByValue) {
	return new Promise((resolve, reject) => {
	  	db.connect()
			.then(sco => {	
				console.log("here")
				sco.one("SELECT * FROM Movies where " + sortByKey + " " + comparison + " " + sortByValue).then(data => console.log(data))
			}).catch(error => {
				console.log(error);
			})
  	});
}



module.exports = router;