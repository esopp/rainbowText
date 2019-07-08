/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */


/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}


/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('controlpanel')
      .setTitle('Rainbow Text');
  DocumentApp.getUi().showSidebar(ui);
}

var colors = [
  {r: 255, g: 0, b:0, name: 'red'}, 
  {r: 255, g: 165, b:0, name: 'orange'},
  {r: 255, g: 255, b: 0, name: 'yellow'},
  {r: 0, g: 128, b: 0, name: 'green'},
  {r: 0, g: 0, b: 255, name: 'blue'},
  {r: 75, g: 0, b: 130, name: 'indigo'},
  {r: 128, g: 0, b: 128, name: 'violet'}
]

/**
* generate a color spectrum with X steps between each hard-coded 
* value in the colors array.
* @param {int} steps Number of colors between each hardcoded value in the colors array. 
**/
function generateSpectrumArray (steps) {
  var getHex = function (color) { 
    var decimal = (color.r * 65536) + (color.g * 256) + color.b;
    var hex = decimal.toString(16);
    while (hex.length < 6) hex = '0' + hex;
    hex = '#' + hex;
    return hex;
  }
  var hexColorsToReturn = [];
  for (var i = 0; i < colors.length - 1; i++) {
    var c1 = colors[i];
    var c2 = colors[i+1];
    hexColorsToReturn.push(getHex(c1));
    for (var step = 1; step <= steps; step++ ){
      var tempColor = {};
      var stepFraction = 1 / (steps + 1);
      tempColor.r = c1.r + ((c2.r - c1.r) * stepFraction * step);
      tempColor.g = c1.g + ((c2.g - c1.g) * stepFraction * step);
      tempColor.b = c1.b + ((c2.b - c1.b) * stepFraction * step);
    }
  }
  hexColorsToReturn.push(getHex(colors[colors.length -1]));
  return hexColorsToReturn;
}

/**
 * Gets the full text of the document and changes it to rainbow colors
 *
 * @param {int} steps Number of colors between each hardcoded value in the colors array. 
 * @param {string} dest The two-letter short form for the destination language.
 * @param {boolean} savePref Whether to automatically change text to rainbow on opening the add-on 
 * @return {boolean} Returns true upon success.
 */
function changeToRainbow (steps, savePref) {
  var body = DocumentApp.getActiveDocument().getBody();
  var text = body.editAsText();
  var spectrum = generateSpectrumArray(steps);
  var spec_index = {i: 0, countUp: true};
  for (var i = 0; i < text.getText().length; i++) {
    text.setForegroundColor(i, i, spectrum[spec_index.i]);
    if (spec_index.countUp) spec_index.i += 1;
    else spec_index.i -=1;
    if (spec_index.i == spectrum.length - 1) spec_index.countUp = false;
    if (spec_index.i == 0) spec_index.countUp = true;
  }
  body.editAsText().setBackgroundColor("#ddddff")
  var pref = 'false';
  if (savePref) pref = 'true';
   PropertiesService.getUserProperties()
        .setProperty('rainbowPref', savePref);
  
  if (!text.getText().length) throw new Error('Type something in the document.');
  return true;
}


/**
 * Gets the stored user preference for converting to rainbowText by default
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @return {Boolean} The user's default rainbow text preference, if it exists.
 */
function getPreferences() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('rainbowPref');
}