var VError, router, nconf,auth, Calendar;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');

router
.route('/calendars')
.post(auth.can('changeCalendar'))
.post(function createCalendar(request, response, next) {
  'use strict';

  var calendar;
  calendar = new Calendar({
    'year' : request.param('year')
  });
  return calendar.save(function createdCalendar(error) {
    if (error) {
      error = new VError(error, 'error creating calendar');
      return next(error);
    }
    return response.status(201).end();
  });
});

router
.route('/calendars')
.get(function listCalendar(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Calendar.find();
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedCalendar(error, calendars) {
    if (error) {
      error = new VError(error, 'error finding calendars');
      return next(error);
    }
    return response.status(200).send(calendars);
  });
});

router
.route('/calendars/:calendar')
.get(function getCalendar(request, response) {
  'use strict';

  var calendar;
  calendar = request.calendar;
  return response.status(200).send(calendar);
});

router
.route('/calendars/:calendar')
.put(auth.can('changeCalendar'))
.put(function updateCalendar(request, response, next) {
  'use strict';

  var calendar;
  calendar = request.calendar;
  calendar.year = request.param('year');
  return calendar.save(function updatedCalendar(error) {
    if (error) {
      error = new VError(error, 'error updating calendar: "$s"', request.params.calendar);
      return next(error);
    }
    return response.status(200).end();
  });
});

router
.route('/calendars/:calendar')
.delete(auth.can('changeCalendar'))
.delete(function removeCalendar(request, response, next) {
  'use strict';

  var calendar;
  calendar = request.calendar;
  return calendar.remove(function removedCalendar(error) {
    if (error) {
      error = new VError(error, 'error removing calendar: "$s"', request.params.calendar);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('calendar', function findCalendar(request, response, next, id) {
  'use strict';

  var query;
  query = Calendar.findOne();
  query.where('year').equals(id);
  query.exec(function foundCalendar(error, calendar) {
    if (error) {
      error = new VError(error, 'error finding calendar: "$s"', calendar);
      return next(error);
    }
    if (!calendar) {
      return response.status(404).end();
    }
    request.calendar = calendar;
    return next();
  });
});

module.exports = router;