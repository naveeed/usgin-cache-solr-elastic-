var assert = require('assert'),
    vows = require('vows'),
    server = require('./cswServer'),
    wfsServer = require('./wfsServer'),
    cache = require('../cache'),
    harvest = require('../harvest'),
    
    testConfig = {dbName: 'usgin-cache-test', dbUrl: 'http://localhost:5984'}, 
    db = cache(false, testConfig);
    harvester = harvest(false, testConfig);

    var tests = {
    	'setup test csw server': {
    		topic: function () {
    			server.start(this.callback);
    		},
            'setup test wfs server' : {
                topic: function () {
                    wfsServer.start(this.callback);
                },
                'make a db connection': {
                    topic: function () {
                        db.setup(this.callback);
                    },
                    'db connected': function (err, response) {
                        assert.isNull(err);
                    },
                    'clear db': {
                        topic: function () {
                            db.clear(this.callback);
                        },
                        'db cleared': function (err, repsonse) {
                            assert.isNull(err);
                        },
                        'get record by id': {
                            topic: function () {
                                db.getRecordById('http://localhost:3011/csw', '00570e7187459885e5c18c3a5f498d5d', this.callback);
                            },
                            'and works': function (err, response) {
                                assert.isNull(err);
                            },
                            'and gatherCapabilities': {
                                topic: function () {
                                    harvester.gatherCapabilities(this.callback);
                                },
                                'and it worked': function (err) {
                                    assert(!err);
                                },
                                'and test it all together': {
                                    topic: function () {
                                        var featuretype = "aasg:BoreholeLithInterval",
                                            maxfeatures = 10;
                                        harvester.gatherFeatures(featuretype, maxfeatures, this.callback);
                                    },
                                    'did not fail': function (err) {
                                        assert(!err);
                                    },
                                    'and see if getfeature worked': {
                                        topic: function () {
                                            db.db.view('usgin-cache', 'requests', {key: 'getfeature', reduce: false}, this.callback);
                                        },
                                        'has features in db': function (err, response) {
                                            assert(response.rows.length, 1);
                                        },
                                        'and see if getcapabilities worked': {
                                            topic: function () {
                                                db.db.view('usgin-cache', 'requests', {key: 'getcapabilities', reduce: false}, this.callback);
                                            },
                                            'has features in db': function (err, response) {
                                                assert(response.rows.length, 1);
                                            },
                                            'turn off wfs server': {
                                                topic: function () {
                                                    wfsServer.stop(this.callback);
                                                },
                                                'turn off csw server': {
                                                    topic: function () {
                                                        server.stop(this.callback);
                                                    },
                                                    'worked': function (err, response) {
                                                        assert.isNull(err);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }                            
                            }
                        }
                    }
                }
            }
    	}
    };

if (require.main === module) {
  vows.describe('The Harvest Module').addBatch(tests).export(module);
} else {
  module.exports = tests;
}