var request = require('request'),
    url = require('url');

/**
 * Get a value from the Meta server
 *
 * @method getValue
 * @param  {String}   field    Dot-deliminated field to get
 * @param  {Function} callback Function to call when done (error, value)
 */
function getValue (field, callback) {
    request.get({
        url: url.resolve(this.url, field),
        timeout: this.timeout,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200 && body.value) {
            callback(null, body.value);
        } else {
            if (!error) {
                error = body;
            }
            callback(new Error('Unable to get value of "' + field + '" - ' + error.toString()));
        }
    });
}

/**
 * Set a value to the Meta server
 *
 * @method getValue
 * @param  {String}   field    Dot-deliminated field to set
 * @param  {varied}   value    Value to set
 * @param  {Function} callback Function to call when done (error)
 */
function setValue (field, value, callback) {
    request.post({
        url: url.resolve(this.url, field),
        timeout: this.timeout,
        json: {
            key: field,
            value: value
        }
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(null);
        } else {
            if (!error) {
                error = body;
            }
            callback(new Error('Unable to set value of "' + field + '" - ' + error.toString()));
        }
    });
}

/**
 * Meta Client
 *
 * @method Client
 * @param  {String}  [url=$(VARIABLE_TUNNEL_URL)]  URL to Server
 * @param  {Integer} [timeout=5000]            Timeout for Client
 */
function Client(url, timeout) {
    this.url = url || process.env.VARIABLE_TUNNEL_URL;
    this.timeout = timeout || 5000; // 5 second timeout
}

Client.prototype = {
    get: getValue,
    set: setValue
};

module.exports = Client;
