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
 */
function postTweet(wordOfTheDay) {
	console.log("Last WOTD was " + lastWordOfTheDay);
	console.log("New WOTD is " + newWordOfTheDay);

	// console.log("The WOTD is " + wordOfTheDay);

	// console.log('Sleeping...');
	// sleep.sleep(30);

	// Use the File System (fs) package to ready local .gif file for use	
	var b64content = fs.readFileSync('./daily.gif', { encoding: 'base64' });

	// Upload the media as a new Tweet
	T.post('media/upload', { media_data: b64content }, uploaded);

	/** Callback function for T.post after uploading media */
	function uploaded(err, data, response) {
		// Numeric ID that identifies the newly uploaded media
		var id = data.media_id_string;

		// The content of the tweet (the GIF will serve as media)
		var tweet = { 
			status: 'The word of the day is \"' + lastWordOfTheDay + '\"', 
			media_ids: [id]
		};

		// Now to finally post the tweet
		T.post('statuses/update', tweet, tweeted);
	}

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

	    download(gifURL, "daily.gif", callback(wordOfTheDay));
	    
	    // Create an http 'get' request to save the GIF locally
		function download(url, dest, callback) {
		var file = fs.createWriteStream(dest);
		var request = http.get(url, function(response) {
		    response.pipe(file);
		    file.on('finish', function() {
		      file.close(callback);  // close() is async, call cb after close completes.
		    });
		  }).on('error', function(err) { // Handle errors
		  	console.log("Error!");
		    fs.unlink(dest); // Delete the file async. (But we don't check the result)
		    if (callback) callback(err.message);
		  });
		};
	  }
	});
};