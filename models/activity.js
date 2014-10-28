var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'code'       : {
    'type'     : String,
    'required' : true,
    'unique'   : true
  },
  'name' : {
    'type'     : String,
    'required' : true
  },
  'reset'	   : {
	'type'	   : Boolean,
	'required' : true,
	'default'  : false
  },
  'required'   : {
	'type'	   : Boolean,
	'required' : true,
	'default'  : false
  },
  'previous'    : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Activity'
  },
  'next'    : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Activity'
  }
}, {
  'collection' : 'activities',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.plugin(jsonSelect, {
  '_id'       : 0,
  'code'	  : 1,
  'name' 	  : 1,
  'reset' 	  : 1,
  'required'  : 1,
  'previous'  : 1,
  'next' 	  : 1,
});

schema.pre('save', function setCalendarUpdatedAt(next) {
  'use strict';
  console.log(1);
  next();
});

schema.pre('save', function setCalendarUpdatedAt(next) {
  'use strict';
  console.log(2);
  next();
});

module.exports = mongoose.model('Activity', schema);