var Y = require('yuitest'),
    Assert = Y.Assert,
    Server = require('../lib/server'),
    request = require('request');

Y.TestRunner.add(new Y.TestCase({

    name : 'Server Test',

    'Can create a server': function () {
        var instance = new Server();
        Assert.isObject(instance);
        Assert.areEqual(40, instance.nonce.length);
    },

    'Can retrieve/set values in a server': function () {
        var instance = new Server({
            foo: 'bar',
            bar: 'bat',
            inception: {
                one: {
                    two: {
                        three: 'bwaaaahhhnn'
                    }
                }
            }
        });

        Assert.isObject(instance);
        Assert.areEqual('bwaaaahhhnn', instance.get('inception.one.two.three'));
        Assert.areEqual('must go deeper', instance.set('inception.one.two.three', 'must go deeper'));
        Assert.areEqual('must go deeper', instance.get('inception.one.two.three'));

        Assert.areEqual('bat', instance.get('bar'));
        Assert.areEqual('drink', instance.set('bar', 'drink'));
        Assert.areEqual('drink', instance.get('bar'));

        Assert.areEqual('bar', instance.get('foo'));
        Assert.areEqual('map', instance.set('foo', 'map'));
        Assert.areEqual('map', instance.get('foo'));

        Assert.areEqual(undefined, instance.get('bond'));
        Assert.areEqual('james', instance.set('bond', 'james'));
        Assert.areEqual('james', instance.get('bond'));

        Assert.areEqual(undefined, instance.get('hero.superman'));
        Assert.areEqual('clarkkent', instance.set('hero.superman', 'clarkkent'));
        Assert.areEqual('clarkkent', instance.get('hero.superman'));

        Assert.isUndefined(instance.set(''));
    },

    'Can set large values in a server': function () {
        var test = this,
            instance = new Server({
                foo: 'bar'
            }),
            largepayload = [];

        for (var i = 0; i < 100000; i++) {
            largepayload.push(i);
        }

        instance.start(function (url) {
            test.resume(function () {
                request.post({
                    url: url + 'foo',
                    json: {
                        key: 'foo',
                        value: largepayload
                    }
                }, function (error, req, body) {
                    test.resume(function () {
                        Assert.isNull(error);
                        Assert.areEqual(200, req.statusCode);
                    });
                });
                test.wait(100);
            });
        });
        test.wait(100);
    },

    'Can start/stop server': function () {
        var test = this,
            instance = new Server();

        instance.start(function (url) {
            test.resume(function () {
                Assert.isTrue(Array.isArray(url.match(/http:\/\/127.0.0.1:\d+\/\w{40}\//)));
                instance.stop(function (error) {
                    test.resume(function () {
                        Assert.isUndefined(error);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    },

    'Can get data from server': function () {
        var test = this,
            instance = new Server({
            foo: 'bar',
            bar: 'bat',
            inception: {
                one: {
                    two: {
                        three: 'bwaaaahhhnn'
                    }
                }
            }
        });

        instance.start(function (url) {
            test.resume(function () {
                request.get({
                    url: url + 'foo',
                    json: true
                }, function (error, req, body) {
                    test.resume(function () {
                        Assert.isNull(error);
                        Assert.areEqual('bar', body.value);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    },

    'Can set data to server': function () {
        var test = this,
            instance = new Server({
            foo: 'bar',
            bar: 'bat',
            inception: {
                one: {
                    two: {
                        three: 'bwaaaahhhnn'
                    }
                }
            }
        });

        instance.start(function (url) {
            test.resume(function () {
                request.post({
                    url: url + 'foo',
                    json: {
                        key: 'foo',
                        value: 'test'
                    }
                }, function (error) {
                    test.resume(function () {
                        Assert.isNull(error);
                        request.get({
                            url: url + 'foo',
                            json: true
                        }, function (error, req, body) {
                            test.resume(function () {
                                Assert.isNull(error);
                                Assert.areEqual('test', body.value);
                            });
                        });
                        test.wait(100);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    },

    'Will fail if immutable': function () {
        var test = this,
            instance = new Server({
                foo: 'bar',
                bar: 'bat',
                inception: {
                    one: {
                        two: {
                            three: 'bwaaaahhhnn'
                        }
                    }
                }
            }, 30000, true);

        instance.start(function (url) {
            test.resume(function () {
                request.post({
                    url: url + 'foo',
                    json: {
                        key: 'foo',
                        value: 'test'
                    }
                }, function (error) {
                    test.resume(function () {
                        Assert.isNull(error);
                        request.post({
                            url: url + 'foo',
                            json: {
                                key: 'foo',
                                value: 'test'
                            }
                        }, function (error, req, body) {
                            test.resume(function () {
                                Assert.isNull(error);
                                Assert.areEqual('Unable to save data: Data is immutable', body);
                                Assert.areEqual(500, req.statusCode);
                            });
                        });
                        test.wait(100);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    },

    'Will fail if bad nonce': function () {
        var test = this,
            instance = new Server({
            foo: 'bar',
            bar: 'bat',
            inception: {
                one: {
                    two: {
                        three: 'bwaaaahhhnn'
                    }
                }
            }
        });

        instance.start(function (url) {
            test.resume(function () {
                url = 'http://127.0.0.1:' + instance.port + '/fakenonce/';
                request.post({
                    url: url + 'foo',
                    json: 'test',
                }, function (error, req, body) {
                    test.resume(function () {
                        Assert.isNull(error);
                        Assert.areEqual('Invalid Nonce', body);
                        Assert.areEqual(403, req.statusCode);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    },


    'Will fail if bad data': function () {
        var test = this,
            instance = new Server({
            foo: 'bar',
            bar: 'bat',
            inception: {
                one: {
                    two: {
                        three: 'bwaaaahhhnn'
                    }
                }
            }
        });

        instance.start(function (url) {
            test.resume(function () {
                request.post({
                    url: url + 'foo',
                    body: '{{{{'
                }, function (error, req, body) {
                    test.resume(function () {
                        Assert.isNull(error);
                        Assert.areEqual('Unable to save data: Unexpected token {', body);
                        Assert.areEqual(500, req.statusCode);
                    });
                });
                test.wait(100);
            });
        });

        test.wait(100);
    }
}));
