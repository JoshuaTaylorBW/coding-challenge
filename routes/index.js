var express = require('express');
var router = express.Router();
var request = require('request');

const pgp = require('pg-promise')();

const cn = 'postgres://joshuasparks:coolpass@localhost:5432/movie_search'

const db = pgp(cn);

let sco;

//TODO: make a .env
let apiData;

router.get('/', function(req, res, next) {
	request('https://api.themoviedb.org/3/discover/movie?primary_release_year=2019&sort_by=vote_average.desc&api_key=cd08a8523960d990bdd28aae872f5ff3&vote_count.gte=100', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	apiData = JSON.parse(body).results	
	    // console.log(apiData);
	    console.log(apiData.length);
	  }
	})	

	db.connect()
		.then(obj => {
			sco = obj;
			return sco.any("SELECT * FROM Movies");
		}).then(data => {
			console.log(data)
			if(data.length == 0) {
				//TODO: make this a foreach
				for(var i = 0; i < apiData.length; i++) {
					sco.one('INSERT INTO Movies(id, title, year, genre) VALUES($1, $2, $3, $4)', [i, apiData[i].title, (apiData[i].release_date.split("-")[0]), "poop"], event => event.id)
						.then(data => {
							console.log(data);
						})
				}
			}
		})
		.catch(error => {
			console.log(error);
		})
		.finally(() => {
			if(sco) {
				sco.done();
			}
		})

  res.render('index', { title: 'Express' });
});

router.get('/info', function(req, res) {
	res.render('info', { title: 'Express' });	
}) 

module.exports = router;
