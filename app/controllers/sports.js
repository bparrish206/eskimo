
// # sport

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var paginate = require('express-paginate');

exports = module.exports = function(Sport) {

  function index(req, res, next) {
    Sport.paginate({}, req.query.page, req.query.limit, function(err, pageCount, sports, itemCount) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          res.render('sports', {
            sports: sports,
            pageCount: pageCount,
            itemCount: itemCount
          });
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, sports.length),
            data: sports
          });
        }
      });
    });
  }

  function _new(req, res, next) {
    res.render('sports/new');
  }

  function create(req, res, next) {
    if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
      return next({
        param: 'name',
        message: 'Name is missing or blank'
      });
    }

    Sport.create({
      name: req.body.name
    }, function(err, sport) {
      if (err) {
        return next(err); 
      }

      res.format({
        html: function() {
          req.flash('success', 'Successfully created sport');
          res.redirect('/sports');
        },
        json: function() {
          res.json(sport);
        }
      });
    });
  }

  function show(req, res, next) {
    Sport.findById(req.params.id, function(err, sport) {
      if (err) {
        return next(err);
      }

      if (!sport) {
        return next(new Error('Sport does not exist'));
      }

      res.format({
        html: function() {
          res.render('sports/show', {
            sport: sport
          });
        },
        json: function() {
          res.json(sport);
        }
      });
    });
  }

  function edit(req, res, next) {
    Sport.findById(req.params.id, function(err, sport) {
      if (err) {
        return next(err);
      }

      if (!sport) {
        return next(new Error('Sport does not exist'));
      }

      res.render('sports/edit', {
        sport: sport
      });
    });
  }

  function update(req, res, next) {
    Sport.findById(req.params.id, function(err, sport) {
      if (err) {
        return next(err);
      }

      if (!sport) {
        return next(new Error('Sport does not exist'));
      }

      if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
        return next({
          param: 'name',
          message: 'Name is missing or blank'
        });
      }

      sport.name = req.body.name;
      sport.save(function(err, sport) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully updated sport');
            res.redirect('/sports/' + sport.id);
          },
          json: function() {
            res.json(sport);
          }
        });
      });
    });
  }

  function destroy(req, res, next) {
    Sport.findById(req.params.id, function(err, sport) {
      if (err) {
        return next(err);
      }

      if (!sport) {
        return next(new Error('Sport does not exist'));
      }

      sport.remove(function(err) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully removed sport');
            res.redirect('/sports');
          },
          json: function() {
            // inspired by Stripe's API response for object removals
            res.json({
              id: sport.id,
              deleted: true
            });
          }
        });
      });
    });
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/sport' ];
