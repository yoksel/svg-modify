var svgmodify = {};

var path = require('path'),
    grunt = require('grunt');


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
    // remove xml tad and doctype
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
 * @param {Object} data - new attributes of SVG-element
 * @returns {Object} remapped attributes
 */
function changeAttrs(attrsObj, data) {

    for (var key in data) {
        var oldWidth, newWidth, oldHeight, newHeight;

        if (key === "width") {
            oldWidth = parseFloat(attrsObj["width"]);
            newWidth = parseFloat(data["width"]);
            oldHeight = parseFloat(attrsObj["height"]);
            newHeight = newWidth / oldWidth * oldHeight;

            attrsObj["height"] = newHeight + "px";
            attrsObj[key] = data[key] + "px";
        } else if (key === "height") {
            oldHeight = parseFloat(attrsObj["height"]);
            newHeight = parseFloat(data["height"]);

            oldWidth = parseFloat(attrsObj["width"]);
            newWidth = newHeight / oldHeight * oldWidth;

            attrsObj["width"] = newWidth + "px";
            attrsObj[key] = data[key] + "px";
        }
    }
    return attrsObj;
}

/**
 * @param {string} input - Input SVG
 * @param {string} fileName for getting data from config
 * @returns {string} new tag "svg"
 */
function rebuildSvgHead(input, newData) {
    var out = "";
    var svgKeys = ["version", "xmlns", "width", "height", "viewBox"];

    var attrsObj = getSVGAttrs(input);

    if (newData) {
        attrsObj = changeAttrs(attrsObj, newData);
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
 * @param {string} from - Input path
 * @param {string} to - Output path
 * @param {Object} config - params to replace in file
 * @returns {string} svg with new sizes and color
 */
function changeSVG(input, from, to, config) {
    var out = "";
    var svgTail = "</svg>";

    console.log("config");
    console.log(config);

    var folder = getFolder(from);

    var fileName = path.basename(from, ".svg");
    var fileNameExt = path.basename(from);

    input = clearInput(input);

    var svgHead = rebuildSvgHead(input, config);
    var svgBody = getSVGBody(input);
    svgBody = changeColor(svgBody, config, folder);

    out = svgHead + svgBody + svgTail;

    console.log("to + fileNameExt, out");
    grunt.file.write(to + fileNameExt, out);
}

/**
 * @param {string} input - Input SVG
 * @returns {string} colored svg
 */
function changeColor(input, config, folder) {
    var out = input;
    var shapeColor = ""; //config[folder].color;
    // set default color

    if (config && config.color) {
        shapeColor = config.color;
    }

    // colorize shapes if we have color
    if (shapeColor) {
        out = "<g fill=\"" + shapeColor + "\">" + out + "</g>";
    }

    return out;
}

svgmodify.resize = function(params) {

    var sources = params.sources;
    var config = params.config;
    var outputFolder = params.outputFolder;

    console.log("config");
    console.log(config);

    sources.forEach(function(filePath) {
        var folder = getFolder(filePath);

        console.log(folder);

        var destPath = outputFolder + folder + "/";
        var fileName = path.basename(filePath, ".svg");
        var folderDefaults = config[folder]["default-sizes"];
        var fileHasDefaults = false;

        if (folderDefaults != undefined) {
            var fileDefaults = folderDefaults[fileName];
            if (fileDefaults != undefined) {
                // folder has defaults, file has SIZE
                fileHasDefaults = true;
                fileDefaults["addColor"] = false;
            }
        }

        if (fileHasDefaults) {
            changeSVG(grunt.file.read(filePath), filePath, destPath, fileDefaults);
        } else {
            grunt.file.copy(filePath, destPath + "/" + path.basename(filePath));
        }

    });

    var newSources = grunt.file.expand(outputFolder + "/**/*.svg");
    return newSources;
};

svgmodify.makeChanges = function(inputFolder, outputFolder, config) {

    var sources = grunt.file.expand(inputFolder + "**/*.svg");

    sources.forEach(function(filePath) {
        var folder = getFolder(filePath);
        var destPath = outputFolder + folder + "/";
        var fileContent = grunt.file.read(filePath);
        var fileName = path.basename(filePath, ".svg")
        var fileOptions = config[fileName];

        changeSVG(fileContent, filePath, destPath, fileOptions);
    });

};

module.exports = svgmodify;