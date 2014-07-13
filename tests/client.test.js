var Y = require('yuitest'),
    Assert = Y.Assert,
    Client = require('../lib/client'),
    nock = require('nock');

Y.TestRunner.add(new Y.TestCase({

    name : 'Client Test',

    tearDown: function () {
        nock.cleanAll();
    },

    'Can create a Client': function () {
        process.env.VARIABLE_TUNNEL_URL = 'http://fakeurl';
        var instance = new Client();
        Assert.isObject(instance);
        Assert.areEqual(5000, instance.timeout);
        Assert.areEqual('http://fakeurl', instance.url);
    },

    'Can retrieve a value': function () {
        var test = this,
            instance = new Client('http://fakeserver');

        nock('http://fakeserver/')
            .get('/foo')
            .reply(200, {
                field: 'foo',
                value: 'bar'
            });
        Assert.isObject(instance);
        instance.get('foo', function (error, value) {
            test.resume(function () {
                Assert.isNull(error);
                Assert.areEqual('bar', value);
            });
        });
        test.wait(100);
    },

    'Can fail to retrieve a value': function () {
        var test = this,
            instance = new Client('http://fakeserver/');

        nock('http://fakeserver/')
            .get('/foo')
            .reply(403, 'Invalid Nonce');
        Assert.isObject(instance);
        instance.get('foo', function (error, value) {
            test.resume(function () {
                Assert.areEqual('Error: Unable to get value of "foo" - Invalid Nonce', error.toString());
                Assert.isUndefined(value);
            });
        });
        test.wait(100);
    },

    'Can fail to retrieve a value due to timeout': function () {
        var test = this,
            instance = new Client('http://fakeserver/', 10);

        nock('http://fakeserver/')
            .get('/foo')
            .delayConnection(500)
            .reply(403, 'Invalid Nonce');
        Assert.isObject(instance);
        instance.get('foo', function (error, value) {
            test.resume(function () {
                Assert.areEqual('Error: Unable to get value of "foo" - Error: ETIMEDOUT', error.toString());
                Assert.isUndefined(value);
            });
        });
        test.wait(100);
    },

    'Can set a value': function () {
        var test = this,
            instance = new Client('http://fakeserver/');

        nock('http://fakeserver/')
            .post('/foo')
            .reply(200);
        Assert.isObject(instance);
        instance.set('foo', 'bar', function (error) {
            test.resume(function () {
                Assert.isNull(error);
            });
        });
        test.wait(100);
    },

    'Can fail to set a value': function () {
        var test = this,
            instance = new Client('http://fakeserver/');

        nock('http://fakeserver/')
            .post('/foo')
            .reply(500, 'Unknown error');
        Assert.isObject(instance);
        instance.set('foo', 'bar', function (error) {
            test.resume(function () {
                Assert.areEqual('Error: Unable to set value of "foo" - Unknown error', error);
            });
        });
        test.wait(100);
    },

    'Can fail to set a value due to timeout': function () {
        var test = this,
            instance = new Client('http://fakeserver/', 10);

        nock('http://fakeserver/')
            .post('/foo')
            .delayConnection(500)
            .reply(500, 'Unknown error');
        Assert.isObject(instance);
        instance.set('foo', 'bar', function (error) {
            test.resume(function () {
                Assert.areEqual('Error: Unable to set value of "foo" - Error: ETIMEDOUT', error);
            });
        });
        test.wait(100);
    }
}));
