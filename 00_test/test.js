var format = require('xml-formatter');
var xml = '<root><content><p xml:space="preserve">This is <b>some</b> content.</content></p>';

var formattedXml = format(xml);
console.log(formattedXml);