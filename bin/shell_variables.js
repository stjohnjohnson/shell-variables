#!/usr/bin/env node

var parser = require('nomnom'),
    util = require('util'),
    cmdLine = require('../lib/cmd_line');

/**
 * Exit the process
 *
 * @method exitCallback
 * @param  {Integer}    code   Exit Code to return
 * @param  {String}     output Text to output
 */
function exitCallback(code, output) {
    if (output) {
        util.print(output);
    }
    console.log();
    process.exit(code);
}

parser.script('shell_variables.js');
parser.option('server', {
    required: true,
    help: 'URL of the server, usually $(VARIABLE_TUNNEL_URL)',
    default: process.env.VARIABLE_TUNNEL_URL
});
parser.option('timeout', {
    help: 'Timeout in milliseconds',
    default: 5000
});
parser.option('json', {
    flag: true,
    required: true,
    help: 'Return everything in JSON format',
    default: false
});

parser.command('get')
    .option('field', {
        position: 1,
        help: 'dot-notation field to retrieve value',
        required: true,
        type: 'string'
    })
    .callback(cmdLine.get.bind(null, exitCallback))
    .help('retrieve data from the variable tunnel');

parser.command('set')
    .option('field', {
        position: 1,
        help: 'dot-notation field to write values to',
        required: true,
        type: 'string'
    })
    .option('value', {
        position: 2,
        help: 'value to set (if not provided, reads from STDIN)',
        type: 'string'
    })
    .option('format', {
        help: 'Force the set value into specific formats (json, boolean, float, integer, string)',
        default: 'string',
        choices: ['json', 'boolean', 'float', 'integer', 'string']
    })
    .callback(cmdLine.set.bind(null, exitCallback))
   .help('write data to the variable tunnel (accepts pipes)');

parser.nom();
