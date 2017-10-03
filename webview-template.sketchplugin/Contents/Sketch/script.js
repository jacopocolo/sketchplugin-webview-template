//Let's import the library that allows this
@import "MochaJSDelegate.js";
@import 'utils.js';

function onRun(context) {
  //Since the webview can talk with sketch, we update the context
  //as needed to make sure we have the correct context when we apply changes
  //the updateContext function is in utils.js
  var doc = updateContext().document;

  var userDefaults = NSUserDefaults.standardUserDefaults();

	// create a window
  var title = "webview-template";
  var identifier = "com.jacopocolo.webviewtemplate";
  var threadDictionary = NSThread.mainThread().threadDictionary();

  if (threadDictionary[identifier]) {
        return;
  }

  var windowWidth = 600,
        windowHeight = 450;
    var webViewWindow = NSPanel.alloc().init();
    webViewWindow.setFrame_display(NSMakeRect(0, 0, windowWidth, windowHeight), true);
    webViewWindow.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSResizableWindowMask);
    //Uncomment the next line to define the app bar color with an NSColor
    //webViewWindow.setBackgroundColor(NSColor.whiteColor());
    webViewWindow.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    webViewWindow.standardWindowButton(NSWindowZoomButton).setHidden(true);
    webViewWindow.setTitle(title);
    webViewWindow.setTitlebarAppearsTransparent(true);
    webViewWindow.becomeKeyWindow();
    webViewWindow.setLevel(NSFloatingWindowLevel);
    threadDictionary[identifier] = webViewWindow;
    COScript.currentCOScript().setShouldKeepAround_(true);

    // Add Web View to window
      var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, windowWidth, windowHeight - 24));
      webView.setAutoresizingMask(NSViewWidthSizable|NSViewHeightSizable);
      var windowObject = webView.windowScriptObject();
      var delegate = new MochaJSDelegate({

          "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
              //We call this function when we know that the webview has finished loading
              windowObject.evaluateWebScript("updateInput("+updateContext().document.currentPage().artboards().count()+")");
          }),

          //To get commands from the webView we observe the location hash: if it changes, we do something
          "webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {
              var locationHash = windowObject.evaluateWebScript("window.location.hash");

              //With a regular expression we check if the hash contains one of the strings we are sending from the UI
              //We can't use a simple == because we are also sending a timestamp from the UI to make sure
              //the hash update is registered by the plugin even if we are pressing the same button twice
              if (/#close/.test(locationHash)) {
                  //we perform whatever we want: in this case we perform some cleaning and close the window
                  threadDictionary.removeObjectForKey(identifier);
                  webViewWindow.close();

              } else if (/#update/.test(locationHash)) {
                //Or we can do something more interesting…

                //Like updating the artboard count based on the current contex
                log(updateContext().document.currentPage().artboards().count())
                windowObject.evaluateWebScript("updateInput("+updateContext().document.currentPage().artboards().count()+");");
              }

          })
      });

      webView.setFrameLoadDelegate_(delegate.getClassInstance());
      webView.setMainFrameURL_(context.plugin.urlForResourceNamed("ui.html").path());

      webViewWindow.contentView().addSubview(webView);
      webViewWindow.center();
      webViewWindow.makeKeyAndOrderFront(nil);

      // Close Window
      var closeButton = webViewWindow.standardWindowButton(NSWindowCloseButton);
      closeButton.setCOSJSTargetFunction(function(sender) {
          COScript.currentCOScript().setShouldKeepAround(false);
          threadDictionary.removeObjectForKey(identifier);
          webViewWindow.close();
      });
      closeButton.setAction("callAction:");
  };
