# Neighborhood Drawing Tool

## What it is

+ Choose what data you want to study.
+ Draw a polygon or circle on a map.
+ Get a beautiful map of your study area.
+ Produce a report of various characteristics of your study area.


## How it works

+ Uses the DataCommon API to retrieve geographic data and metadata



### Getting Set Up for Development

It's quite simple, really. We're using Browserify to keep the code modular.

Eventually we'll get [Grunt][grunt] to run some build tasks for us, but in the meantime:

+ Clone the repository: `git clone git@github.com/MAPC/neighborhood-drawing-tool
+ Install Browserify with NPM: `npm install -g browserify`
    + Don't have NPM? Install [Node][node] and [NPM][npm]
    + On a Mac with [Homebrew][brew]:
        + `brew install node`
        + `curl https://npmjs.org/install.sh | sh`
 
[grunt]: http://gruntjs.com/
[brew]:  http://brew.sh/
[node]:  http://nodejs.org/download/
[npm]:   http://www.joyent.com/blog/installing-node-and-npm/



### Development Guidelines

+ Write modules.
+ Make edits to modules and to `main.js`.
+ Run `browserify scripts/main > scripts/bundle` to bundle all main.js with all of its dependencies, since the browser itself doesn't know how to handle `require` statements yet.