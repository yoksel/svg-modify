# svg-modify

Modify SVG by JSON.

> ________________________

## Getting Started

```shell
npm install svg-modify --save-dev
```

### Color and resize your icons

It works for transparent svg only.

You can add **config.json** to folder with icons and define preffered changes of initial svg-files.

Example of config:

```js
{
    // default color for all svg-images, OPTIONAL
    "color": "orangered",
    // set list of default sizes if you need to resize initial svg-images, OPTIONAL
    "default-sizes": {
        // set size for particular icon
        "arrow-up": {
            // set width or height
            "width": "182"
            },
        "home": {
            "height": "42"
        }
    },
    // set list of modifications, OPTIONAL.
    // List is used for creating files modificatios before it turns to PNG-sprite
    "icons": {
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
    }

}
```

You can use any part of config or not use it at all.

For input, output and config examples feel free to look into **test** folder.

### More information

Input:

```html
souces
  └ myicons
    └ mail.svg
      kitten.svg
```

and output:

```html
result
  └ myicons.css
    myicons.png
    myicons.svg
```

myicons.css:

```css
.myicons {
    fill: orangered;
    }
.ie8 .myicons {
    background-image: url(myicons.png);
    }
.myicons--mail {
    width: 182px;
    height: 262px;
    background-position: -192px 0;
    }
.myicons--mail--green {
    width: 182px;
    height: 262px;
    background-position: 0 0;
    fill: green;
    }
...
```

**Usage of svg**

Add SVG-library to the page and add particular icons this way:

```html
<span class="myicons myicons--mail">
  <svg>
    <use xlink:href="#myicons--mail"></use>
  </svg>
</span>
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.1.24 - Fix behavior for folders without config

0.1.20 - Add prefix for sizes to names of files

0.1.16 - Add config for resize SVG-images to default sizes

0.1.15 - Add opening demo page in default browser

0.1.14 - Add icons sizes to demo list

0.1.13 - Add property `fill` to CSS
