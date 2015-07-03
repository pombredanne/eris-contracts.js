/**
 * @file pipes.js
 * @fileOverview Base class for the pipe.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module pipe/pipes
 */
'use strict';

var devPipe = require('./dev_pipe');
var lsPipe = require('./local_signer_pipe');
var pipe = require('./pipe');

/**
 * @constructor
 */
exports.DevPipe = devPipe;

/**
 *
 * @constructor
 */
exports.LocalSignerPipe = lsPipe;

/**
 *
 * @constructor
 */
exports.PipeBase = pipe;