/**
 * @file output_formatters.js
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2015
 * @module output_formatters
 */
var BigNumber = require('bignumber.js');
var utils = require('./utils/utils');

module.exports = {

    /**
     * Returns the output as an object with a field 'this.values.name' for each named output param.
     * The raw output is put in 'this.raw'.
     *
     * @param outputSpec
     * @param output
     * @returns {*}
     */
    json : function(outputSpec, output){

        // TODO for now
        if(!(output instanceof Array)){
            output = [output];
        }
        var outputObj = {raw: output};
        if(outputSpec.length !== output.length){
            console.error("Output array length does not match the length specified by the interface.");
            return output;
        }
        var values = {};
        for(var i = 0; i < output.length; i++){
            var name = outputSpec[i].name;
            if(name){
                values[name] = output[i];
            }
        }
        outputObj.values = values;
        return outputObj;
    },

    /**
     * Returns the output an object with a field 'this.values.name' for each named output param.
     * The raw output is put in 'this.raw'.
     *
     * ADDITIONALLY: All BigNumbers in 'this.values' are converted to decimal strings.
     *
     * @param outputSpec
     * @param output
     * @returns {*}
     */
    jsonStrings : function(outputSpec, output){

        if(!(output instanceof Array)){
            output = [output];
        }
        var outputObj = {raw: output};
        if(outputSpec.length !== output.length){
            console.error("Output array length does not match the length specified by the interface.");
            return output;
        }
        var values = {};
        for(var i = 0; i < output.length; i++){
            var name = outputSpec[i].name;
            if(name){
                var val = output[i];
                if(val instanceof BigNumber){
                    val = val.toString(10);
                }
                values[name] = val;
            }
        }
        outputObj.values = values;
        return outputObj;
    },

    /**
     * Returns the output an object with a field 'this.values.name' for each named output param.
     * The raw output is put in 'this.raw'.
     *
     * ADDITIONALLY: All BigNumbers in 'this.values' are converted to numbers, so if
     * you're using numbers outside the range of javascript 'Number', errors will be had.
     *
     * @param outputSpec
     * @param output
     * @returns {*}
     */
    jsonNumbers : function(outputSpec, output){
        if(!(output instanceof Array)){
            output = [output];
        }
        var outputObj = {raw: output};
        if(outputSpec.length !== output.length){
            console.error("Output array length does not match the length specified by the interface.");
            return output;
        }
        var values = {};
        for(var i = 0; i < output.length; i++){
            var name = outputSpec[i].name;
            if(name){
                var val = output[i];
                if(val instanceof BigNumber){
                    val = val.toNumber();
                }
                values[name] = val;
            }
        }
        outputObj.values = values;
        return outputObj;
    },

    /**
     * Takes the 'this.values' object from the object returned by 'formatter', json-stringifies it and returns
     * the string. Useful when passing on to some form of stream.
     *
     * NOTE: Un-named return values will be lost. The raw output is not included as it contains big numbers and such.
     *
     * @param formatter
     * @returns {Function}
     */
    valuesToJsonString : function(formatter){
        return function(outputSpec, output){
            return JSON.stringify(formatter(outputSpec, output).values);
        }
    }
};