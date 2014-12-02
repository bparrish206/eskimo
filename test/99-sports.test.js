
// # tests - sports

var util = require('util');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var utils = require('./utils');
var async = require('async');
var IoC = require('electrolyte');
var cheerio = require('cheerio');

chai.should();
chai.use(sinonChai);

request = request(app);

// storage for context-specific variables throughout the tests
var context = {};

describe('/sports', function() {

  var Sport = IoC.create('models/sport');

  // Clean DB and add 3 sample sports before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestSports(callback) {
        // Create 3 test sports
        async.timesSeries(3, function(i, _callback) {
          var sport = new Sport({
            name: 'Sport #' + i
          });

          sport.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /sports - should return 200 if sport was created', function(done) {
    request
      .post('/sports')
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'Nifty',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        // Store this id to use later
        context.sportsIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /sports/:id — should return 200 if sports was retrieved', function(done) {
    request
      .get(util.format('/sports/%s', context.sportsIdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        done();
      });
  });

  it('PUT /sports/:id - should return 200 if sports was updated', function(done) {
    request
      .put(util.format('/sports/%s', context.sportsIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'NiftyWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('NiftyWhoa');

        done();
      });
  });

  it('DELETE /sports/:id - should return 200 if sports was deleted', function(done) {
    request
      .del(util.format('/sports/%s', context.sportsIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('deleted');

        // Test the values make sense
        res.body.id.should.equal(context.sportsIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /sports - should return 200 if sports index loads (JSON)', function(done) {
    request
      .get('/sports')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /sports - should return 200 if sports index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/sports')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $sportList = $('table');
        var $sportRows = $sportList.find('tr');

        // Test the values make sense
        $sportList.should.have.length.of(1);
        $sportRows.should.have.length.of.at.least(3);

        done();
      });
  });


});