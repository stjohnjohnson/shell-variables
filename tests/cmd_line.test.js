var Y = require('yuitest'),
    Assert = Y.Assert,
    cmdLine,
    nock = require('nock'),
    sinon = require('sinon'),
    mockery = require('mockery'),
    stdinMock;

Y.TestRunner.add(new Y.TestCase({

    name : 'cmdLine Test',

    setUp: function () {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
        stdinMock = sinon.stub();
        mockery.registerMock('get-stdin', stdinMock);

        cmdLine = require('../lib/cmd_line');
    },

    tearDown: function () {
        mockery.deregisterAll();
        mockery.disable();
        nock.cleanAll();
    },

    'Can retrieve a value via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'json': false
            };

        nock('http://fakeserver/')
            .get('/foo')
            .reply(200, {
                field: 'foo',
                value: 'bar'
            });
        cmdLine.get(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.areEqual('bar', value);
            });
        }, input);
        test.wait(100);
    },

    'Can retrieve a json value via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'json': true
            };

        nock('http://fakeserver/')
            .get('/foo')
            .reply(200, {
                field: 'foo',
                value: [1, 2, 3]
            });
        cmdLine.get(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.areEqual('[1,2,3]', value);
            });
        }, input);
        test.wait(100);
    },

    'Can fail to retrieve a value via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'json': false
            };

        nock('http://fakeserver/')
            .get('/foo')
            .reply(403, 'Invalid Nonce');
        cmdLine.get(function (error, value) {
            test.resume(function () {
                Assert.areEqual(1, error);
                Assert.areEqual('Error: Unable to get value of "foo" - Invalid Nonce', value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': 'bar',
                'format': 'string',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":"bar"}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value from stdin via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'format': 'string',
                'json': false
            };
        stdinMock.yieldsAsync('bar');
        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":"bar"}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value formatted from int via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': '22ab',
                'format': 'integer',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":22}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value formatted from float via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': '22.44ab',
                'format': 'float',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":22.44}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value formatted from boolean via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': 'true',
                'format': 'boolean',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":true}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value formatted from json via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': '[1,2,"a",[4,5]]',
                'format': 'json',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":[1,2,"a",[4,5]]}')
            .reply(200);
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(0, error);
                Assert.isUndefined(value);
            });
        }, input);
        test.wait(100);
    },

    'Can set a value formatted from bad json via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': '[1,2,"a",5]]',
                'format': 'json',
                'json': false
            };

        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(1, error);
                Assert.areEqual('Error: Unable to parse input: SyntaxError: Unexpected token ]', value);
            });
        }, input);
        test.wait(100);
    },

    'Can fail to set a value via cmdline': function () {
        var test = this,
            input = {
                'server': 'http://fakeserver/',
                'field': 'foo',
                'value': '22',
                'format': 'integer',
                'json': false
            };

        nock('http://fakeserver/')
            .post('/foo', '{"key":"foo","value":22}')
            .reply(500, 'Unknown error');
        cmdLine.set(function (error, value) {
            test.resume(function () {
                Assert.areEqual(1, error);
                Assert.areEqual('Error: Unable to set value of "foo" - Unknown error', value);
            });
        }, input);
        test.wait(100);
    }
}));
