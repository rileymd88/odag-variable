var qlik = window.require('qlik');
var config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
var baseUrl = (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "api/odag/v1";
var linkList;

define([], function () {

  var myTextBox = {
    ref: "prop.label",
    label: "Button Label",
    type: "string",
    expression: "optional",
    defaultValue: "Button Label"
  };

  function getLinks(appId) {
    return new Promise(function(resolve, reject){
      $.get(baseUrl + '/links/', function (data) {
        return resolve(data.map(function (item) {
          return {
            value: item.id,
            label: item.name
          };
        }));
      })
    })
  }

  var link = {
    ref: "prop.link",
    label: "Select Link",
    type: "string",
    component: "dropdown",
    options: 
      getLinks().then(function(list){
        return list;
      }) 
    
  };

  // Appearance section
  var appearanceSection = {
    uses: "settings",
    items: {
      myTextBox: myTextBox
    }
  };

  var linkSection = {
    // not necessary to define the type, component "expandable-items" will automatically
    // default to "items"
    // type: "items"
    component: "expandable-items",
    label: "Link Selection",
    items: {
        header1: {
            type: "items",
            label: "Select A Link",
            items: {
                link: link
            }
        }
    }
  }

  return {
    type: "items",
    component: "accordion",
    items: {
      appearance: appearanceSection,
      linkSection: linkSection
    }
  };
});