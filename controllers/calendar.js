var VError, router, nconf,auth, Calendar;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
auth = require('dacos-auth-driver');
Calendar = require('../models/calendar');

/**
 * @api {post} /calendars Creates a new calendar.
 * @apiName createCalendar
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission changeCalendar
 * @apiDescription
 * When creating a new calendar the user must send the calendar year. The calendar year is used for identifying and must
 * be unique in the system. If a existing year is sent to this method, a 409 error will be raised. And if no year is
 * sent, a 400 error will be raised.
 *
 * @apiParam {Number} year Calendar year.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 201 Created
 * {}
 */
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

/**
 * @api {get} /calendars List all system calendars.
 * @apiName listCalendar
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all calendars in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (calendar) {Number} year Calendar year.
 * @apiSuccess (calendar) {Date} createdAt Calendar creation date.
 * @apiSuccess (calendar) {Date} updatedAt Calendar last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "year": 2014,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
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

/**
 * @api {get} /calendars/:calendar Get calendar information.
 * @apiName getCalendar
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission none
 * @apiDescription
 * This method returns a single calendar details, the calendar year must be passed in the uri to identify the requested
 * calendar. If no calendar with the requested year was found, a 404 error will be raised.
 *
 * @apiSuccess {Number} year Calendar year.
 * @apiSuccess {Date} createdAt Calendar creation date.
 * @apiSuccess {Date} updatedAt Calendar last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "year": 2014,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/calendars/:calendar')
.get(function getCalendar(request, response) {
  'use strict';

  var calendar;
  calendar = request.calendar;
  return response.status(200).send(calendar);
});

/**
 * @api {put} /calendars/:calendar Updates calendar information.
 * @apiName updateCalendar
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission changeCalendar
 * @apiDescription
 * When updating a calendar the user must send the calendar year. If a existing year which is not the original calendar
 * year is sent to this method, a 409 error will be raised. And if no year is sent, a 400 error will be raised. If no
 * calendar with the requested year was found, a 404 error will be raised.
 *
 * @apiParam {Number} year Calendar year.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 Ok
 * {}
 */
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

/**
 * @api {delete} /calendars/:calendar Removes calendar.
 * @apiName removeCalendar
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission changeCalendar
 * @apiDescription
 * This method removes a calendar from the system. If no calendar with the requested year was found, a 404 error will be
 * raised.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 204 No Content
 * {}
 */
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