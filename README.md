# svg-modify

Modify SVG by JSON.

> ________________________

Svg-modify helps you to resize SVG-images, colorize them and make a number of variations of one file.

It may be useful if you need to prepare SVG images for convertation to PNG.

## Getting Started

```shell
npm install svg-modify --save-dev
```

## Usage

This'll change SVG without renaming:

```js
var folderOptions = {
    "arrow-up": { // <--- name of file
        "width": "187"
        },
    "home": { // <--- name of file
        "height": "42"
    }
};

var changesParams = {
    "inputFolder": "sources/",  // <--- folder with source files
    "outputFolder": "result/", // <--- place for changed files
    "folderOptions": folderOptions
};

modify.makeChanges(changesParams);
```

If you need to colorize transparent SVG, add `defaultColor`:

```js
var changesParams = {
    "inputFolder": "sources/",
    "outputFolder": "result/",
    "folderOptions": folderOptions,
    "defaultColor": "hotpink" // <--- color
};
```

This'll change SVG without renaming too.

If you need not colorize though there are colors in the config, use this:

```js
var changesParams = {
    "inputFolder": "sources/",
    "outputFolder": "result/",
    "folderOptions": folderOptions,
    "colorize": false
};
```

It's useful for resizing SVG without coloring it.

### Creating modifications of one file

Set list of variations:

```js
var folderOptions = {
        "arrow-up": [{
                "width": "50"
            }, {
                "color": "green"
            }, {
                "width": "150",
                "color": "steelblue"
            }],
        "home": [{
                "width": "150"
            }, {
                "width": "170",
                "color": "teal"
            }, {
                "height": "62",
                "color": "yellowgreen"
        }]
    };
```
This'll create a number of variations with names like these:

```html
arrow-up--w50.svg
arrow-up--green.svg
arrow-up--w150--steelblue.svg
home--w150.svg
...
```

## Release History

0.0.6 - Add ability to use `colorize: false` if images needn't be colorized though colors in config are exist

0.0.5 - Now fill color correctly overrides with color from config

0.0.4 - Add ability colorize without additional configs


