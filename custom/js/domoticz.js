// Code to handle domoticz boxes
Domotica.domoticz = {
	// Variable to store the interval
	interval: null,
	
	// Default update frequency in ms.
	// Please note that several boxes are updated
	// when the user clicks on a button
	updateFrequency: 10000,

	// Main method for updating the status of all boxes 
	// that are associated with dommoticz
	update: function() {
		var that = this;
		
		// If the system is waiting to update again, cancel the 
		// interval. We will restart the interval again at the end
		// of the meeting
		if( this.interval ) {
			clearInterval(this.interval);
		}
		
		// Handle updates
		this.call("devices", { plan: 2 }, function(data) {
			// For now, only handle 'results' part
			$.each(data.result, function(idx, result) {
				var id = result.idx;
				
				// Lookup the element for this id
				element = $("[data-domoticz-id=" + id + "]");
				
				// If the element is not present, this device id not to be shown
				if( element.length == 0 ) 
					return;
				
				if(element.hasClass("dimmer-switch")) {
					that.updateWidget.dimmerSwitch(element, result);
				} else if(element.hasClass("switch")) {
					that.updateWidget.normalSwitch(element, result);
				} else if(element.hasClass("heater")) {
					that.updateWidget.heater(element, result);
				} else {
					that.updateWidget.generic(element, result);
				}
			});
		});
		
		// TODO: Update 'last updated' date
		
		// Make sure to start updating again 
		this.interval = setInterval(this.updateFrequency, this.update);
	},
	
	change: {
		normalSwitch: function(id, status) {
			console.log( "Update switch " + id + " to " + status );
			Domotica.domoticz.call( "command", { param: "switchlight", idx: id, switchcmd: status ? "On" : "Off" } );
		},
		dimmerSwitch: function(id, value) {
			console.log( "Update dimmer switch " + id + " to " + value );
		},
		heater: function(id, value) {
			console.log( "Update heater " + id + " to " + value );
		},
		sunscreen: function(id, status) {
			console.log( "Update sunscreen " + id + " to " + status );
		}
	},
	
	// Methods to update widgets on the screen, based on 
	// data from domoticz
	updateWidget: { 
		dimmerSwitch: function(element, result) {
			// Update the slider to show the dimmer value
			Domotica.ui.setSliderValue(element, result.Level);
			
			// Also do updating for normal switches
			this.normalSwitch(element, result);
		},
		normalSwitch: function(element, result) {
			// Update the status text
			var status = Domotica.domoticz.translate(result.Status);
			element.find(".domoticz-status" ).text(status);
			
			// Update the lightbulb
			Domotica.ui.toggleSwitch(element, result.Status == "On");
			
			// Also do generic updating
			this.generic(element, result);
		},
		heater: function(element, result) {
			// Update the slider to show the dimmer value
			Domotica.ui.setSliderValue(element, result.Level);
			
			// Also do generic updating
			this.generic(element, result);
		},
		
		// Generic update method
		generic: function(element, result) {
			element.find( ".lastUpdate" ).text( "Laatste update: " + result.LastUpdate );
		},
	},
	
	// Translate values or words from the domoticz response into
	// a format useful for the user
	translate: function(value) {
		switch(value) {
			case "On": return "Aan";
			case "Off": return "Uit";
			default: return value;
		}
	},
	
	// Basic method to send commands to Domoticz
	call: function(type, parameters, callback) {
		var url = "http://192.168.178.21:8080/json.htm";
		if( typeof( parameters) == "undefined" ) {
			parameters = {};
		}
		
		// Add type to parameters
		parameters.type = type;
		
		// Actually do the call and call the callback
		$.get( url, parameters, function(data, textStatus, jqXHR) {
			if( typeof(callback) != "undefined" ) {
				callback(data);
			}
		});
	}
};