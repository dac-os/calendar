var VError, router, nconf, auth, slug, AcademicPeriod;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
AcademicPeriod = require('../models/academicPeriod');

/**
 * @api {post} /academic-periods Creates a new AcademicPeriod.
 * @apiName createAcademicPeriod
 * @apiVersion 1.0.0
 * @apiGroup calendar
 * @apiPermission changeAcademicPeriod
 * @apiDescription
 * When creating a new academic period the user must send the number of the period, period type, year, 
 * begin date and end date. The number of the period, period type and year are used for identifying and must
 * be unique in the system. If a existing number of the period, period type and year is sent to this method, 
 * a 409 error will be raised. And if no number of period, period type, year, begin date or end date is
 * sent, a 400 error will be raised.
 *
 * @apiParam {Number} period Academic Period number.
 * @apiParam {String} periodType Academic Period type.
 * @apiParam {Number} year Academic Period year.
 * @apiParam {Date}   beginDate Academic Period begin date.
 * @apiParam {Date}   endDate Academic Period end date.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "periodNumber": "required",
 *   "periodType": "required",
 *   "year": "required",
 *   "beginDate": "required",
 *   "endDate": "required"
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
.route('/academic-periods')
.post(auth.can('changeAcademicPeriod'))
.post(function createAcademicPeriod(request, response, next) {
  'use strict';

  var academicPeriod;
  academicPeriod = new AcademicPeriod({
    'slug'        : slug(request.param('periodNumber')+request.param('periodType','').toUpperCase()
      +request.param('year')),
    'periodNumber' : request.param('periodNumber'),
    'periodType' : request.param('periodType','').toUpperCase(),
    'year' : request.param('year'),
    'beginDate' : request.param('beginDate'),
    'endDate' : request.param('endDate')
  });
  return academicPeriod.save(function createdAcademicPeriod(error) {
    if (error) {
      error = new VError(error, 'error creating academic period');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /academic-periods List all system academic periods.
 * @apiName listAcademicPeriod
 * @apiVersion 1.0.0
 * @apiGroup academicPeriod
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all academic periods in the database. The data is returned in pages of 
 * length 20. If no page is passed, the system will assume the requested page is page 0, otherwise the 
 * desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (academicPeriod) {Number} periodNumber Academic Period number.
 * @apiSuccess (academicPeriod) {String} periodType Academic Period type.
 * @apiSuccess (academicPeriod) {Number} year Academic Period year.
 * @apiSuccess (calendar) {Date} beginDate Calendar begin date.
 * @apiSuccess (calendar) {Date} endDate Calendar end date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "slug" : "1S2014",
 *   "periodNumber": 1,
 *   "periodType": "S",
 *   "year": 2014,
 *   "beginDate": "2014-07-01T12:22:25.058Z",
 *   "endDate": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/academic-periods')
.get(function listAcademicPeriod(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = AcademicPeriod.find();
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedAcademicPeriod(error, academicPeriods) {
    if (error) {
      error = new VError(error, 'error finding academic periods');
      return next(error);
    }
    return response.status(200).send(academicPeriods);
  });
});

/**
 * @api {get} /academic-periods/:academicPeriod Get academic period information.
 * @apiName getAcademicPeriod
 * @apiVersion 1.0.0
 * @apiGroup academicPeriod
 * @apiPermission none
 * @apiDescription
 * This method returns a single academic period details, the academic period slug must be passed in the uri to 
 * identify the requested academic period. If no academic period with the requested slug was found, 
 * a 404 error will be raised.
 *
 * @apiSuccess {String} slug Academic period slug.
 * @apiSuccess {Number} periodNumber Academic period number.
 * @apiSuccess {String} periodType Academic period type.
 * @apiSuccess {Number} year Academic period year.
 * @apiSuccess {Date} beginDate Academic period begin date.
 * @apiSuccess {Date} endDate Academic period end date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "slug" : "1S2014",
 *   "periodNumber": 1,
 *   "periodType": "S",
 *   "year": 2014,
 *   "beginDate": "2014-07-01T12:22:25.058Z",
 *   "endDate": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/academic-periods/:academicPeriod')
.get(function getCalendar(request, response) {
  'use strict';

  var academicPeriod;
  academicPeriod = request.academicPeriod;
  return response.status(200).send(academicPeriod);
});

/**
 * @api {put} /academic-periods/:academicPeriod Updates academic period information.
 * @apiName updateAcademicPeriod
 * @apiVersion 1.0.0
 * @apiGroup academicPeriod
 * @apiPermission changeAcademicPeriod
 * @apiDescription
 * When updating a academic period the user must send the academic period number, type, year, begin date and 
 * end date. If a existing number, type ande year which is not the originals academic period number, 
 * type and year is sent to this method, a 409 error will be raised. And if no number, type, year, begin date 
 * or end date is sent, a 400 error will be raised. If no academic period with the requested slug was found, 
 * a 404 error will be raised.
 *
 * @apiSuccess {Number} periodNumber Academic period number.
 * @apiSuccess {String} periodType Academic period type.
 * @apiSuccess {Number} year Academic period year.
 * @apiSuccess {Date} beginDate Academic period begin date.
 * @apiSuccess {Date} endDate Academic period end date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "periodNumber": "required",
 *   "periodType": "required",
 *   "year": "required",
 *   "beginDate": "required",
 *   "endDate": "required"
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
.route('/academic-periods/:academicPeriod')
.put(auth.can('changeAcademicPeriod'))
.put(function updateAcademicPeriod(request, response, next) {
  'use strict';

  var academicPeriod;
  academicPeriod = request.academicPeriod;
  academicPeriod.slug = slug(request.param('periodNumber')+request.param('periodType','').toUpperCase()
      +request.param('year'));
  academicPeriod.periodNumber = request.param('periodNumber');
  academicPeriod.periodType = request.param('periodType');
  academicPeriod.year = request.param('year');
  academicPeriod.beginDate = request.param('beginDate');
  academicPeriod.endDate = request.param('endDate');
  return academicPeriod.save(function updatedAcademicPeriod(error) {
    if (error) {
      error = new VError(error, 'error updating academic period: "$s"', request.params.academicPeriod);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /academic-periods/:academicPeriod Removes academic period.
 * @apiName removeAcademicPeriod
 * @apiVersion 1.0.0
 * @apiGroup academicPeriod
 * @apiPermission changeAcademicPeriod
 * @apiDescription
 * This method removes a academic period from the system. If no academic period with the requested slug 
 * was found, a 404 error will be raised.
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
.route('/academic-periods/:academicPeriod')
.delete(auth.can('changeAcademicPeriod'))
.delete(function removeAcademicPeriod(request, response, next) {
  'use strict';

  var academicPeriod;
  academicPeriod = request.academicPeriod;
  return academicPeriod.remove(function removedAcademicPeriod(error) {
    if (error) {
      error = new VError(error, 'error removing academic period: "$s"', request.params.academicPeriod);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('academicPeriod', function findAcademicPeriod(request, response, next, id) {
  'use strict';

  var query;
  query = AcademicPeriod.findOne();
  query.where('slug').equals(id);
  query.exec(function foundAcademicPeriod(error, academicPeriod) {
    if (error) {
      error = new VError(error, 'error finding academic period: "$s"', academicPeriod);
      return next(error);
    }
    if (!academicPeriod) {
      return response.status(404).end();
    }
    request.academicPeriod = academicPeriod;
    return next();
  });
});

module.exports = router;