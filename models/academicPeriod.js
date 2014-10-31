var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'slug'        : {
    'type'      : String
  },
  'periodNumber':{
    'type'      : Number,
    'required'  : true
  },
  'periodType'  :{
    'type'      : String,
    'required'  : true
  },
  'year'      : {
    'type'     : Number,
    'required' : true
  },
  'beginDate' :{
    'type'      : Date,
    'required'  : true
  },
  'endDate'   : {
    'type'      : Date,
    'required'  : true
  },
  'createdAt' : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt' : {
    'type' : Date
  }
}, {
  'collection' : 'academicPeriods',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'periodNumber': 1,
  'periodType'  : 1,
  'year'        : 1
}, {
  'unique' : true
});

schema.index({
  'slug': 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'         : 0,
  'slug'        : 1,
  'periodNumber': 1,
  'periodType'  : 1,
  'year'        : 1,
  'beginDate'   : 1,
  'endDate'     : 1,
  'createdAt'   : 1,
  'updatedAt'   : 1
});

schema.pre('save', function setAcademicPeriodUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AcademicPeriod', schema);