var Y = require('yuitest'),
    Assert = Y.Assert,
    Client = require('../lib/client'),
    Server = require('../lib/server'),
    clientInstance,
    serverInstance;

Y.TestRunner.add(new Y.TestCase({

    name : 'Client/Server Integration Test',

    tearDown: function () {
        if (serverInstance) {
            serverInstance.stop();
        }
    },

    'Can retrieve a value from a real server': function () {
        var test = this;

        serverInstance = new Server({
            'foo': 'bar'
        });

        serverInstance.start(function (url) {
            clientInstance = new Client(url);
            clientInstance.get('foo', function (error, value) {
                test.resume(function () {
                    Assert.isNull(error);
                    Assert.areEqual('bar', value);
                });
            });
        });
        test.wait(100);
    },

    'Can fail to retrieve a value from a real server': function () {
        var test = this;

        serverInstance = new Server();

        serverInstance.start(function (url) {
            clientInstance = new Client(url.slice(0, -1) + 'a');
            clientInstance.get('foo', function (error, value) {
                test.resume(function () {
                    Assert.areEqual('Error: Unable to get value of "foo" - Invalid Nonce', error.toString());
                    Assert.isUndefined(value);
                });
            });
        });
        test.wait(100);
    },

    'Can set a value on a real server': function () {
        var test = this;

        serverInstance = new Server();

        serverInstance.start(function (url) {
            clientInstance = new Client(url);
            clientInstance.set('foo', 'bar', function (error1) {
                clientInstance.get('foo', function (error2, value) {
                    test.resume(function () {
                        Assert.isNull(error1);
                        Assert.isNull(error2);
                        Assert.areEqual('bar', value);
                    });
                });
            });
        });
        test.wait(100);
    },

    'Can fail to set a value on a real server': function () {
        var test = this;

        serverInstance = new Server();

        serverInstance.start(function (url) {
            clientInstance = new Client(url.slice(0, -1) + 'a');
            clientInstance.set('foo', 'bar', function (error, value) {
                test.resume(function () {
                    Assert.areEqual('Error: Unable to set value of "foo" - Invalid Nonce', error.toString());
                    Assert.isUndefined(value);
                });
            });
        });
        test.wait(100);
    }
}));
