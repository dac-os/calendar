var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema

schema = new Schema({
  'slug'     : {
    'type'     : String,
    'required' : true
  },
  'event'    : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Event',
    'required' : true
  },
  'beginDate': {
    'type'     : Date,
    'required' : true
  },
   'endDate' : {
    'type'     : Date,
    'required' : true
  },
  'calendar' : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Calendar',
    'required' : true
  }
}, {
  'collection' : 'eventPeriods',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'calendar' : 1,
  'event'    : 1
}, {
  'unique' : true
});


schema.plugin(jsonSelect, {
  '_id'        : 0,
  'slug'       : 1,
  'event'      : 1,
  'beginDate'  : 1,
  'endDate'    : 1,
  'calendar'   : 1,
});

module.exports = mongoose.model('EventPeriod', schema);