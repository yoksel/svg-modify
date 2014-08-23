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
    "arrow-up": {
        "width": "187"
        },
    "home": {
        "height": "42"
    }
};

var changesParams = {
    "inputFolder": "sources/",
    "outputFolder": "result/",
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
    "defaultColor": "hotpink"
};
```

This'll change SVG without renaming too.

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


