bgsrcset.js
=========
---
This javascript plugin is based on the magical [srcset spec] [1], and attempts to bring the same functionality to the more flexible CSS background image.

The implementation tries to match spec as much as physically possible, although at the moment it is restricted to matching browser width, not height. This will hopefully be tackled in a future release.

---
Version
----

1.0

Features
----

  - full browser support, starting at IE8
  - callback on image load
  - standalone and lightweight


Basic Implementation
----

```sh

/*
 * Selector based on querySelectorAll
 * .class
 * #id
 * tag
 */

var bgss = new bgsrcset('.bgimg');

```
And the HTML
```sh

<div class='bgimg' 
     bg-srcset='small1x.jpg 320w, 
                med1x.jpg 768w, 
                null 912w,
                large1x.jpg 1x, 
                large2x.jpg 2x'>
</div>

```

Some key points
  - Can check for retina (1x, 2x)
  - Images without specified width are considered 'full' width
  - Unlike actual srcset, you can use **null** to set a width set where no bg image is used
  - If you need a no-js fallback or a placeholder until the proper image loads, it can be easily done in CSS.


Using the Callback
--------------

```sh
var bgss = new bgsrcset('.bgimg', function(data){
    data.node.className += ' loaded'; //add a loaded class to div
    console.log(data.srcset); //log full srcset details
});

```
The callback contains variables for targeting the element as well as giving access to all the srcset information.

Examples
----

An example usage can be found [here] [2].

[1]:http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/
[2]:http://codepen.io/jessekernaghan/pen/wGjtC