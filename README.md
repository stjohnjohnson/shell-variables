# Shell Variable Tunnel

Don't you just hate running multiple shell commands but not being able to properly read any data back other than exit codes and standard out?  No?  Really?  I guess it's a problem most people don't have, but I ended up having.  So I wrote this simple client/server system to be able to read/write variables from Node.JS to/from shell commands.

## Install

shell-variables should be added to your codebase as a dependency.  You can do this with:

``` shell
$ npm install --save shell-variables
```

Alternatively you can manually add it to your package.json file:

``` json
{
  "dependencies" : {
    "shell-variables": "latest"
  }
}
```

then install with:

``` shell
$ npm install
```

## Usage

The purpose of this is to have a service available to all child processes so that they can read/write data.  Here's a simple example where we write back to the Node.JS process:

``` node
var spawn = require('child_process').spawn,
    shellVariables = require('shell-variables'),
    server,
    spawnInstance;

server = new shellVariables.Server({
    foo: 'bar'
});

server.start(function () {
    // Set the "coconut" variable from the command-line
    spawnInstance = spawn('shell_variables.js', ['set', 'coconut', 'monkey'], {
        stdio: 'inherit',
        env: process.env
    });
    spawnInstance.on('close', function (code) {
        console.log('child process exited with code ' + code);
        console.log('value of coconut: ', server.get('coconut'));
        console.log('value of variables: ', server.variables);
        server.stop();
    });
});
```

### Dot Notation

All variables read via the server, client, or cmd-line interface can be accessed at varying levels of depth via dot-notation.  An example of this is here:

``` node
var obj = {
        foo: {
            bar: {
                baz: 15
            }
        }
    };
console.log(server.get('foo.bar.baz'));
// Outputs 15
```

### Server

Creating a new server has two optional arguments:
 - `existingVariables` - Some existing object map
 - `timeout` - Timeout for the service in milliseconds

Four methods are available to use:
 - `start(callback)` - takes a callback that returns the URL of the service
 - `stop(callback)` - takes a callback that returns nothing really
 - `get(field)` - returns the value of that field (dot-notation)
 - `set(field, value)` - sets the value of that field (dot-notation)

Two variables are available as well:
 - `variables` - the current fields and values
 - `url` - the URL of the service

### Client

Creating a client (if you wanted to do so inside a child node process) is easy as well.  It has two optional arguments:
 - `serverUrl` - the URL of the server service (by default read from the environment)
 - `timeout` - Timeout for the service in milliseconds

Two methods are available to use:
 - `get(field)` - returns the value of that field (dot-notation)
 - `set(field, value)` - sets the value of that field (dot-notation)

### Command-line tool

The command-line is just as easy as the client if not more as it includes its own documentation:

``` bash
$ shell_variables.js

Usage: shell_variables.js <command> [options]

command
  get     retrieve data from the variable tunnel
  set     write data to the variable tunnel (accepts pipes)

Options:
   --server    URL of the server, usually $(VARIABLE_TUNNEL_URL)
   --timeout   Timeout in milliseconds  [5000]
   --json      Return everything in JSON format  [false]
```

#### Get

``` bash
$ shell_variables.js get

shell_variables.js get <field> [options]

field     dot-notation field to retrieve value

Options:
   --server    URL of the server, usually $(VARIABLE_TUNNEL_URL)
   --timeout   Timeout in milliseconds  [5000]
   --json      Return everything in JSON format  [false]
```
#### Set

``` bash
$ shell_variables.js set

Usage: shell_variables.js set <field> [value] [options]

field     dot-notation field to write values to
value     value to set (if not provided, reads from STDIN)

Options:
   --server    URL of the server, usually $(VARIABLE_TUNNEL_URL)
   --timeout   Timeout in milliseconds  [5000]
   --json      Return everything in JSON format  [false]
   --format    Force the set value into specific formats (json, boolean, float, integer, string)  [string]

```
## License

[MIT](http://opensource.org/licenses/MIT) © [St. John Johnson](http://stjohnjohnson.com)