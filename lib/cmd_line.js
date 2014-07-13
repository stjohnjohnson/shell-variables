var stdin = require('get-stdin'),
    Client = require('./client');

/**
 * Print output to the user's screen and exit the process
 *
 * @method convertOutput
 * @param  {Function}     callback Function to call when it's all over (exitCode, output)
 * @param  {Boolean}      inJson   Should the output be in JSON?
 * @param  {Error}        error    Error object
 * @param  {Varied}       data     Output from callback
 */
function convertOutput(inJson, callback, error, data) {
    var output = data;

    if (error) {
        output = error.toString();
    }

    if (inJson) {
        output = JSON.stringify(output);
    }

    callback(error ? 1 : 0, output);
}

/**
 * Convert user's input into specified format
 *
 * @method convertInput
 * @param  {String}     input  String passed by user
 * @param  {String}     format Format to convert from/to
 * @return {Varied}            Output requested by user
 * @throws SyntaxError if requested JSON format and is badly formatted
 */
function convertInput(input, format) {
    var output;
    switch (format) {
        case 'integer':
            output = parseInt(input, 10);
            break;
        case 'float':
            output = parseFloat(input);
            break;
        case 'boolean':
            output = (['true', '1'].indexOf(input) > -1);
            break;
        case 'json':
            output = JSON.parse(input);
            break;
        default:
            output = input.toString();
            break;
    }

    return output;
}

/**
 * Async way to parse value from the user
 *  - Triggers callback with value if value is passed
 *  - Triggers callback with stdin if value not passed
 *
 * @method scanValue
 * @param  {String}   [value]  Value from user
 * @param  {Function} callback Callback to trigger (data)
 */
function scanValue(value, callback) {
    if (!value) {
        stdin(callback);
    } else {
        process.nextTick(callback.bind(null, value));
    }
}

/**
 * Get a value from the Meta Tunnel
 *
 * @method getValue
 * @param  {Function} callback        Function to call when it's all over (exitCode, output)
 * @param  {Object}   options
 * @param  {String}   options.server  Server URL
 * @param  {Integer}  options.timeout Timeout in milliseconds
 * @param  {Boolean}  options.json    Should the output be in JSON format?
 * @param  {String}   options.field   Field to get
 */
function getValue(callback, options) {
    var instance = new Client(options.server, options.timeout);
    instance.get(options.field, convertOutput.bind(null, options.json, callback));
}

/**
 * Set a value in the Meta Tunnel
 *
 * @method setValue
 * @param  {Function} callback        Function to call when it's all over (exitCode, output)
 * @param  {Object}   options
 * @param  {String}   options.server  Server URL
 * @param  {Integer}  options.timeout Timeout in milliseconds
 * @param  {Boolean}  options.json    Should the output be in JSON format?
 * @param  {String}   options.field   Field to get
 * @param  {String}   [options.value] Value to set (if not provided, reads from STDIN)
 * @param  {String}   options.format  What format to convert the input from
 */
function setValue(callback, options) {
    var instance = new Client(options.server, options.timeout);
    scanValue(options.value, function (input) {
        try {
            input = convertInput(input, options.format);
        } catch (error) {
            return convertOutput(options.json, callback, new Error('Unable to parse input: ' + error.toString()));
        }
        instance.set(options.field, input, convertOutput.bind(null, options.json, callback));
    });
}

module.exports = {
    get: getValue,
    set: setValue
};