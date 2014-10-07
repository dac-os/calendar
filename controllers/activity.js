var VError, router, nconf,auth, Calendar;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
auth = require('dacos-auth-driver');
Activity = require('../models/activity');
