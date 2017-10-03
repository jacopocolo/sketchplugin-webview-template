# Sketchplugin webview template

![template example](http://i.imgur.com/4aUeUKq.gif)

## Note: new version coming soon. I figured out a better way. Watch this repository for news.

## What is this?
It’s a simple template for building Sketch plugins using a html page as a interface. The sketchplugin contains two folders: Sketch and Resources.

In the Sketch folder you can find manifest.json — the file with all the metadata that Sketch needs to run the plugin — and script.js, the file that actually has all the functions to run the plugin.
In the Resources folder you can find ui.html, the html file that will be loaded by the plugin. It’s the interface of your plugin and it can both get data from Sketch and return data to Sketch.

## Why did you do this?
While building another Sketch plugin I found that building a plugin interface is — by far — the most difficult thing to do if you are not experienced developing macOS applications. Javascript is enough to code the logic of the plugin but not at all useful when it comes to asking for user input. Any complex interaction needs to be coded in Cocoa or Swift. This template should allow developers familiar only with HTML, CSS, Javascript to build plugins with ease.

## How does this work?
The code in script.js creates a new native window when the onRun function is called. In the window we load a webview that loads the ui.html file and create two native buttons, cancel and Ok. 

## And how do we talk with Sketch?
Passing data from the webview to Sketch is easy, we can call Javascript functions on the webview and return them as values we can use on the plugin side.
Passing data from Sketch to the webview is trickier. I did not manage to get the cocoa function that should check if the webview was loaded to work, so I decided to do a little workaround. When we run the plugin, the script saves a new javascript file on the Resources folder and the webview loads it as an external script, so we can access all the data and the functions that we save in it.
