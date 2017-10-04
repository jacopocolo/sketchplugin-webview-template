# Sketchplugin webview template

![template example](http://i.imgur.com/4aUeUKq.gif)

## What is this?
It’s a simple template for building Sketch plugins using a html page as a interface. The sketchplugin contains two folders: Sketch and Resources.

In the Sketch folder you can find manifest.json — the file with all the metadata that Sketch needs to run the plugin — and script.js, the file that actually has all the functions to run the plugin. In the Sketch folder you’ll also find Matt Curtis’ [MochaJSDelegate](https://github.com/matt-curtis/MochaJSDelegate), the library necessary to allow communication between Sketch and the UI.   
In the Resources folder you can find ui.html, the html file that will be loaded by the plugin. It’s the interface of your plugin and it can both get data from Sketch and return data to Sketch.

## Why did you do this?
While building another Sketch plugin I found that building a plugin interface is — by far — the most difficult thing to do if you are not experienced developing macOS applications. Javascript is enough to code the logic of the plugin but not at all useful when it comes to asking for user input. Any complex interaction needs to be coded in Cocoa or Swift. This template should allow developers familiar only with HTML, CSS, Javascript to build plugins with ease.

## How does this work?
The code in script.js creates a new native window when the onRun function is called. In the window we load a webview that loads the ui.html file.

### How do we communicate with the UI?
Matt Curtis’ [MochaJSDelegate](https://github.com/matt-curtis/MochaJSDelegate) allows us to verify that the UI has fully loaded and call Javascript functions in the HTML file from Sketch. In example: `windowObject.evaluateWebScript('functionFromHtml('+valueFromSketch+')');` calls the functionFromHtml function from the HTML file, with the parameter valueFromSketch.
In the template, this function is used to populate the “Artboards in page” field when the webview is loaded.

### How do we communicate with Sketch?
Via [window.location.hash](https://developer.mozilla.org/en-US/docs/Web/API/Window/location). From Sketch we are able to observe the window location hash of the webview. This means that we can update it from the webview itself and pass commands and values to Sketch. In the template the UI has a function called `updateHash(command, parameter, value)` that allows us to pass a pure command like: `updateHash('close')` or a command with parameter and value, like: `updateHash('addArtboard', 'artboardName', 'Mark')`.
The plugin observes these changes with `"webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {}`. More specifically, with `var locationHash = windowObject.evaluateWebScript("window.location.hash");` and `var hash = parseHash(locationHash);`. The hash variable is an object that contains the latest command, parameter and value coming from the webview. I use commands just to check what block of code to execute and parmeters and values to grab inputs from the UI. In the template, in example the updateHash above has the addArtboard command and passes 'Mark' as a value of artboardName.

I tried to account for basic use cases with the updateHash and parseHash functions but feel free to modify them as needed or use your own methods to update the hash and parse the hash from Sketch.
