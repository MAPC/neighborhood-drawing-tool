# Neighborhood Drawing Tool


## What it is

+ Choose what data you want to study.
+ Draw a polygon or circle on a map.
+ Get a beautiful map of your study area.
+ Produce a report of various characteristics of your study area.


## How it works

+ Uses MAPC's Metro Boston DataCommon API to retrieve geographic data and metadata (currently a local implementation: datacommon.io will eventually host the API)
+ When you select a dataset, the map is overlaid with that data.
+ When you draw a polygon or circle as a study area, you'll get all geographies that intersect with your drawing.
+ Soon, there will be a report section that lets you set up and save statistics on your study area.


### Getting Set Up for Development

It's quite simple, really. We're using Browserify to keep the code modular.

+ Clone the repository: `git clone git@github.com/MAPC/neighborhood-drawing-tool`
+ Install Browserify using NPM: `npm install -g browserify`
    + Don't have NPM? Install [Node][node] and [NPM][npm]
    + On a Mac with [Homebrew][brew]:
        + `brew install node`
        + `curl https://npmjs.org/install.sh | sh`
 
[brew]:  http://brew.sh/
[node]:  http://nodejs.org/download/
[npm]:   http://www.joyent.com/blog/installing-node-and-npm/


### Compiling Modular Javascript

Inspiration for the modular design we'd like to achieve: Addy Osmani's post on [Large-Scale JS Architecture][addy].

Eventually we'll get [Grunt][grunt] to run some build tasks for us, but in the meantime, we'll use browserify.

Run `browserify scripts/main.js > scripts/bundle.js` to bundle all main.js with all of its dependencies, since the browser doesn't know how to handle `require` statements yet.

[addy]:  http://addyosmani.com/largescalejavascript/ 
[grunt]: http://gruntjs.com/


### Development Guidelines

+ Write modules. We're aiming for good, decoupled, object-oriented code, even if it's not that, yet.
+ Make edits to modules and to `main.js`. Don't change `bundle.js`, it won't do anything.


### Style

+ If you've got a list of variable statements, or an object with multiple attributes, please start all lines but the first with a comma and space, like the below.

```javascript
var object = { something: "placeholder" }
  , text   = "a phrase"
  , number = 11.001

```