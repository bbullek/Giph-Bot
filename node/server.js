console.log('The bot is starting');

/** Import custom functions for working with the Giphy API */
var giphyAPI = require('./giphy_api.js');

/** Import custom dictionary for generating a Word of the Day */
var dict = require('./dict.js');

/** Import the request package for handling data in JSON objects */
var request = require("request");

/** Import fs for saving GIFs from external URLs */
var fs = require("fs");

/** Import the HTTP package for saving GIFs locally */
var http = require('https');

/** Import package allowing for usage of the 'sleep' function */
var sleep = require('sleep');

/** Import the Twit package */
var Twit = require('twit');

global.newWordOfTheDay = 'test';

// Authenticate with OAuth
var config = require('./config'); // File is hidden for security reasons

var T = new Twit(config);

loadGif(postTweet);

// Schedule tweets to post once per day
var numMillisecondsPerDay = 24 * 60 * 60 * 1000;
setInterval(function() { loadGif(postTweet); }, 1000 * 100);

/**
 * Posts a GIF to Twitter!
 * @param wordOfTheDay: A string
 * @param gifURL: A string
 */
function postTweet(wordOfTheDay, gifURL) {
	console.log("Last WOTD was " + lastWordOfTheDay);
	console.log("New WOTD is " + newWordOfTheDay);
	console.log("URL is " + gifURL);

	// The content of the tweet
	var tweet = { 
		status: 'The word of the day is \"' + lastWordOfTheDay + '\": '
				+ gifURL
	};

	// Now to finally post the tweet
	T.post('statuses/update', tweet, tweeted);

	/** Callback function for T.post after posting new status */
	function tweeted(err, data, response) {
		if (err) {
			console.log(err);
		} else {
			console.log("Success!");
		}
	}
};

/**
 * Glues together a few of the functions from the Giphy API to get a
 * URL, parse the resulting JSON objects, and save the chosen gif
 * locally before passing this result to its callback function.
 * @param callback: The function passed the resulting URL
 */
function loadGif(callback) {
	// Select a Word of the Day, which will determine which GIF we load
	wordOfTheDay = dict.getWordOfTheDay();

	/** 
	 * Store two variables for the WOTD at any given time, to offset 
	 * issues with Node.js and synchronization
	 */
	global.lastWordOfTheDay = newWordOfTheDay;
	global.newWordOfTheDay = wordOfTheDay;

	var url = giphyAPI.getURL(wordOfTheDay);

	request({
	  url: url,
	  json: true
	}, function (error, response, body) {
	  if (!error && response.statusCode === 200) {
	    var gifURL = giphyAPI.getGif(body);
	    callback(wordOfTheDay, gifURL);
	  }
	});
};