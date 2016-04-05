var fileName = "webview-template.sketchplugin"

function onRun(context) {
	//You do whatever you want with with context, I expose these
	ctx = context;
  doc = context.document;
  selection = context.selection;
  page = [doc currentPage];
  view = [doc currentView];
  artboards = [[doc currentPage] artboards];

	var defaults = [NSUserDefaults standardUserDefaults], default_values = [NSMutableDictionary dictionary];

	// Let’s create a window for the ui
	var window = [[NSWindow alloc] init]
	var windowTitle = "Webview template"
	[window setTitle:windowTitle]
  //Let’s create a 500x420 pixels window
	[window setFrame:NSMakeRect(0, 0, 500, 420) display:false]

	//Do you want to pass something from Sketch to the WebView?
	//I tried several different options and I found this to be the easiest:
	//you save a file with the function that you want to run and webview loads it.
	//There should be a function in cocoa to check if the webview is fully loaded
	//but I never managed to get it to work in cocoascript.
	var count = [artboards count]; // example value imported from Sketch
	function saveScript(code) {
	    var string = [NSString stringWithFormat: "%@", code],
	      filePath = "/Users/" + NSUserName() + "/Library/Application Support/com.bohemiancoding.sketch3/Plugins/"+fileName+"/Contents/Resources/script.js";
			[string writeToFile: filePath atomically: true
	      encoding: NSUTF8StringEncoding error: nil];
	}
	//The javascript you want to run in the webview.
	//In this case we set the value of myInout to 10
	saveScript("document.getElementById('myInput').value = '"+count+"'");

  //Let’s set up the path of the html page we want to load
  var filePath = "/Users/" + NSUserName() + "/Library/Application Support/com.bohemiancoding.sketch3/Plugins/"+fileName+"/Contents/Resources/ui.html";

  //Let’s set up a frame for the webview, a little smaller than the window so we have room for controls
  var frame = NSMakeRect(0,60,500,340);
  var url = [NSURL fileURLWithPath:filePath];
  var webView = [[WebView alloc] initWithFrame:frame]
  [[webView mainFrame] loadRequest:[NSURLRequest requestWithURL:[NSURL fileURLWithPath:filePath]]]
  [[window contentView] addSubview:webView]
  [window center]

	// Let’s create a native OK button
	var okButton = [[NSButton alloc] initWithFrame:NSMakeRect(0, 0, 0, 0)]
	var userClickedOK = false
	[okButton setTitle:"  Ok  "]
	[okButton setBezelStyle:NSRoundedBezelStyle]
	[okButton sizeToFit]
	[okButton setFrame:NSMakeRect([window frame].size.width - [okButton frame].size.width - 20, 14, [okButton frame].size.width, [okButton frame].size.height)]
	[okButton setKeyEquivalent:"\r"] // return key
	[okButton setCOSJSTargetFunction:function(sender) {
		userClickedOK = true
		[window orderOut:nil]
		[NSApp stopModal]
	}];

	[[window contentView] addSubview:okButton]

	// Let’s create a native cancel button
	var cancelButton = [[NSButton alloc] initWithFrame:NSMakeRect(0, 0, 0, 0)]
	var userClickedCancel = false
	[cancelButton setTitle:"  Cancel  "]
	[cancelButton setBezelStyle:NSRoundedBezelStyle]
	[cancelButton sizeToFit]
	[cancelButton setFrame:NSMakeRect([okButton frame].origin.x - [cancelButton frame].size.width, 14, [cancelButton frame].size.width, [cancelButton frame].size.height)]
	[cancelButton setKeyEquivalent:@"\033"] // escape key
	[cancelButton setCOSJSTargetFunction:function(sender) {
		userClickedCancel = true
		[window orderOut:nil]
		[NSApp stopModal]
	}]

	[[window contentView] addSubview:cancelButton]

	// get the user input
	[NSApp runModalForWindow:window]

  //On OK button clicked…
	if (!userClickedCancel) {
    //… we run a function on the webview and…
    var userInput = [webView stringByEvaluatingJavaScriptFromString:@"getValue()"];
    //… do something with what that function returns
    log(userInput);
	}

	// let the GC gather these guys (and the targets!)
	okButton = nil;
	cancelButton = nil;
	window = nil;
};
