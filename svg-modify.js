var svgmodify = {};

var path = require('path'),
    grunt = require('grunt');

/**
 * @param {string} filePath
 * @returns {
     string
 }
 name of folder containing file
 */
function getFolder(filePath) {
    var pathArray = filePath.split(path.sep);
    return pathArray[pathArray.length - 2];
}

/**
 * @param {string} input - code of SVG-file
 * @returns {string} clear svg-code
 */
function clearInput(input) {
    var output = input.replace(new RegExp("[\r\n\t]", "g"), "");
    // remove xml tag and doctype
    output = output.replace(new RegExp("(<)(.*?)(xml |dtd)(.*?)(>)", 'g'), "");
    output = output.replace(new RegExp("(<g></g>)", 'g'), "");
    return output;
}

/**
 * @param {string} input - SVG code
 * @returns {Object} attributes of tag "svg"
 */
function getSVGAttrs(input) {
    var svgHeadRx = new RegExp("(<svg)(.*?)(>)", 'g');
    var svgOpenTag = svgHeadRx.exec(input)[0];
    svgOpenTag = svgOpenTag.replace(new RegExp("(<svg )|>", 'g'), "");
    var attrsSrc = svgOpenTag.split("\" ");
    var attrsObj = {};

    attrsSrc.forEach(function(attrStr) {
        var attrArray = attrStr.split("=");

        var attrName = attrArray[0];
        var attrVal = attrArray[1];

        attrVal = attrVal.replace(new RegExp("[\"]", 'g'), "");
        attrsObj[attrName] = attrVal;
    });

    return attrsObj;
}

/**
 * @param {Object} attrsObj - old attributes of SVG-element
 * @param {Object} newAttrsObj - new attributes of SVG-element
 * @returns {Object} remapped attributes
 */
function changeAttrs(attrsObj, newAttrsObj) {

    for (var key in newAttrsObj) {
        var oldWidth, newWidth, oldHeight, newHeight;

        if (key === "width") {
            oldWidth = parseFloat(attrsObj["width"]);
            newWidth = parseFloat(newAttrsObj["width"]);
            oldHeight = parseFloat(attrsObj["height"]);
            newHeight = newWidth / oldWidth * oldHeight;

            attrsObj["height"] = newHeight + "px";
            attrsObj[key] = newAttrsObj[key] + "px";
        } else if (key === "height") {
            oldHeight = parseFloat(attrsObj["height"]);
            newHeight = parseFloat(newAttrsObj["height"]);

            oldWidth = parseFloat(attrsObj["width"]);
            newWidth = newHeight / oldHeight * oldWidth;

            attrsObj["width"] = newWidth + "px";
            attrsObj[key] = newAttrsObj[key] + "px";
        }
    }
    return attrsObj;
}

/**
 * @param {string} input - Input SVG
 * @param {Object} newAttrsObj
 * @returns {string} new tag "svg"
 */
function rebuildSvgHead(input, newAttrsObj) {
    var out = "";
    var svgKeys = ["version", "xmlns", "width", "height", "viewBox"];

    var attrsObj = getSVGAttrs(input);

    if (newAttrsObj) {
        attrsObj = changeAttrs(attrsObj, newAttrsObj);
    }

    for (var i = 0; i < svgKeys.length; i++) {
        var key = svgKeys[i];
        out += " " + key + "=\"" + attrsObj[key] + "\"";
    }
    out = "<svg" + out + ">";

    return out;
}

/**
 * @param {string} input - SVG-code
 * @returns {string} content of SVG-file without tags "svg"
 */
function getSVGBody(input) {
    return input.replace(new RegExp("(<svg|</svg)(.*?)(>)", 'g'), "");
}

/**
 * @param {string} input - Input SVG
 * @param {Object} config - parameters for modifying SVG
 * @returns {string} colored svg
 */
function changeColor(input, config) {
    var out = input;
    var shapeColor = svgmodify.defaultColor; // set default color
    var hasFill = input.indexOf("g fill") > 0;
    var colorize = config["colorize"];
    var defaults = config["defaults"];

    if (colorize === false) {
        return out;
    }

    if (config && config.color) {
        shapeColor = config.color;
    } else if (defaults && defaults.color) {
        shapeColor = defaults.color;
    }

    if (shapeColor && hasFill) {
        out = input.replace(new RegExp("(fill=\")(.*?)(\")", "g"), "fill=\"" + shapeColor + "\"");
    } else if (shapeColor) {
        out = "<g fill=\"" + shapeColor + "\">" + out + "</g>";
    }

    return out;
}

/**
 * @param {string} filePath - input path
 * @param {string} destPath - output path
 * @param {Object} config - params to replace in file
 * @returns {string} svg with new sizes and color
 */
function changeSVG(filePath, destPath, config) {
    var input = grunt.file.read(filePath);
    var out = input;
    var svgTail = "</svg>";

    input = clearInput(input);

    if (config || svgmodify.defaultColor) {

        var folder = getFolder(filePath);

        var svgHead = rebuildSvgHead(input, config);
        var svgBody = getSVGBody(input);
        svgBody = changeColor(svgBody, config, folder);

        out = svgHead + svgBody + svgTail;
    }

    grunt.file.write(destPath, out);
}

/**
 * @param {string} fileName
 * @param {Object} props for modifying file
 * @returns {string} fileName with markers of modifications
 */
svgmodify.fileNameModf = function(fileName, props) {

    var prefixes = {
        "width": "w",
        "height": "h"
    };

    for (var key in props) {
        var prefix = prefixes[key] ? prefixes[key] : "";
        fileName += "--" + prefix;
        fileName += props[key];
    }
    return fileName;
}

/**
 * Modify SVG by options
 * @param {Object} params
 * @param {string} params.inputFolder
 * @param {string} params.outputFolder
 * @param {Object} params.config
 * @param {string} params.defaultColor
 */
svgmodify.makeChanges = function(params) {

    var inputFolder = params.inputFolder,
        outputFolder = params.outputFolder,
        config = params.folderOptions,
        colorize = params.colorize === false ? false : true,
        defaults = params.defaults;

    svgmodify.defaultColor = params.defaultColor;

    var sources = grunt.file.expand(inputFolder + "**/*.svg");

    sources.forEach(function(filePath) {
        var folder = getFolder(filePath),
            destFolder = outputFolder + folder + "/",
            fileName = path.basename(filePath, ".svg"),
            fileNameExt = path.basename(filePath),
            destPath = destFolder + fileNameExt,
            fileOptions = {};

        if (config && config[fileName]) {

            fileOptions = config[fileName];
            fileOptions["colorize"] = colorize;
            if (defaults) {
                fileOptions["defaults"] = defaults;
            }
        }

        if (Array.isArray(fileOptions)) {
            // copy initial file, add default color if exist
            if (svgmodify.defaultColor) {
                if (defaults) {
                    fileOptions["defaults"] = defaults[fileName];
                }
                changeSVG(filePath, destPath, fileOptions);
            } else {
                grunt.file.copy(filePath, destPath);
            }
            // create variations of file
            fileOptions.forEach(function(props) {
                destPath = destFolder + svgmodify.fileNameModf(fileName, props) + ".svg";
                if (defaults) {
                    props["defaults"] = defaults[fileName];
                }
                changeSVG(filePath, destPath, props);
            });
        } else {
            changeSVG(filePath, destPath, fileOptions);
        }
    });
};

module.exports = svgmodify;