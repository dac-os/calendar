var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
Schema = mongoose.Schema;

schema = new Schema({
  'year'      : {
    'type'     : Number,
    'required' : true,
    'unique'   : true
  },
  'createdAt' : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt' : {
    'type' : Date
  }
}, {
  'collection' : 'calendars',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.plugin(jsonSelect, {
  '_id'       : 0,
  'year'      : 1,
  'createdAt' : 1,
  'updatedAt' : 1
});

schema.pre('save', function setCalendarUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

schema.pre('remove', function deleteCascadeEvents(next) {
  'use strict';

  async.waterfall([function (next) {
    var Event, query;
    Event = require('./event');
    query = Event.find();
    query.where('calendar').equals(this._id);
    query.exec(next);
  }.bind(this), function (events, next) {
    async.each(events, function (event, next) {
      event.remove(next);
    }.bind(this), next);
  }.bind(this)], next);
});

module.exports = mongoose.model('Calendar', schema);