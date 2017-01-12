// giphy_api.js
// ============
module.exports = {

  /** The host URL */
  api: "http://api.giphy.com/v1/gifs/trending?",

  /** The public beta key */
  apiKey: "&api_key=dc6zaTOxFJmzC",

  /** The query; the + character for phrases consisting of 2+ words */
  query: "&tag=???",

  /** 
   * True if the user wants to load from Giphy's entire collection; false
   * if they want to limit their search to the query */
  searchAll: true,

  /** 
   * True if the very first 'top trending' gif should always be selected;
   * false if the gif should be randomly selected.
   */
  alwaysSelectFirstGif: true,

  /** The number of gifs loaded by default when querying trending gifs. */
  numTrendingGifs: 25,

  /**
   * Creates the URL for the Giphy request.
   * @return A string
   */
  getURL: function() {
    var url = this.api + this.apiKey;
    if (!this.searchAll) url += this.query;
    return url;
  },

  /**
   * Given the body of a collection of JSON objects created by the Giphy API,
   * selects randomly from the selection (of top trending gifs) and returns
   * its URL. This gif can then be rendered in a webpage, uploaded elsewhere,
   * etc.
   * @param data: The JSON data, retrieved beforehand by the Node request package
   * @return The URL of a randomly selected trending gif
   */
  getGif: function(data) {
    var index = 0;
    if (!this.alwaysSelectFirstGif) {
      var index = Math.floor(Math.random() * (this.numTrendingGifs - 1));
    }
    console.log('Index is ' + index);
    var gif = data['data'][index]['images']['fixed_height']['url'];
    console.log(gif);
    return gif;
  }
};
