var express = require('express');
var router = express.Router();
var request = require('request-promise');

const pgp = require('pg-promise')();

const cn = 'postgres://joshuasparks:coolpass@localhost:5432/movie_search'

const db = pgp(cn);

let sco;

//TODO: make a .env
let apiData;
let databaseData;

router.get('/', function(req, res, next) {

	
	db.connect()
		.then(obj => {
			sco = obj;
			return sco.any("SELECT * FROM Movies");
		}).then(data => {
			if(data.length == 0) {
				request('https://api.themoviedb.org/3/discover/movie?primary_release_year=2019&sort_by=vote_average.desc&api_key=cd08a8523960d990bdd28aae872f5ff3&vote_count.gte=100', function (error, response, body) {
		  			if (!error && response.statusCode == 200) {
						apiData = JSON.parse(body).results
						return JSON.parse(body).results				}
				}).then(newApiData => {
					db.connect()
						.then(obj => {
							sco = obj;
							for(var i = 0; i < apiData.length; i++) {
								sco.none('INSERT INTO Movies(id, title, vote_average, popularity, language, description) VALUES($1, $2, $3, $4, $5, $6)', [i, apiData[i].title, apiData[i].vote_average, apiData[i].popularity, apiData[i].original_language, apiData[i].overview], event => event.id)
								.then(data => {
									// console.log("we got to here...");
								})
								.catch(error => {
									console.log(error);
								})
							}	
						})
				})
			}else{
				databaseData = data;
			}
		})
		.catch(error => {
			console.log(error);
		})
		.finally(() => {
			if(sco) {
				sco.done();
			}
  			res.render('index', { title: 'Movies with high user rating on tMDB', databaseData: databaseData });
		})
})

module.exports = router;
