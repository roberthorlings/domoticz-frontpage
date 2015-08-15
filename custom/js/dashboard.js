Domotica = {
	// Initialization function
	dashboard: {
		init: function() {
			// Set local for moment.js
			moment.locale("nl");
			
			// Make sure the UI responds to user interaction
			this.bindUIActions();
			
			// Start updating all boxes
			Domotica.update();
		},
		
		// Bind actions to UI events
		bindUIActions: function() {
			Domotica.initialization.enableSwitches();
			Domotica.initialization.enableHeaters();
			Domotica.initialization.enableSunscreen();
			
			if(Domotica.sonos)
				Domotica.sonos.initialize();
			
			if(Domotica.chromecast)
				Domotica.chromecast.initialize();
		},
		
	},
	
	initialization: {
		// Enable switches
		enableSwitches: function() {
			// Add a switch event for onclick
			$(".switch").on("click", function(e) {
				var currentStatus = $(this).data("status")
				var newStatus = !currentStatus;
				
				Domotica.domoticz.change.normalSwitch($(this).data("domoticz-id"), newStatus);
				Domotica.domoticz.update();
			});
			
			// Enable dimmer slider
			$(".dimmer-switch").each(function() {
				var slider = $(this).find(".value-slider").slider({
					min:0,
					max:100,
					value: 20,					
					handle: 'round'
				});
				
				var dimmerId = $(this).data("domoticz-id");
				slider.on("slideStop", function(e) {
					Domotica.domoticz.change.dimmerSwitch(dimmerId, e.value);
					Domotica.domoticz.update();
				})
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".dimmer-switch .slider").on("click", function(e) {
				return false;
			});
		},
		
		// Enable heaters
		enableHeaters: function() {
			// Enable dimmer slider
			$(".heater").each(function() {
				var slider = $(this).find(".value-slider").slider({
					min:12,
					max:28,
					step: 0.5,
					handle: 'round',
					value: 19
				});
				
				// Make sure to update domoticz on change
				var heaterId = $(this).data("domoticz-id");
				slider.on( "slideStop", function(e) {
					Domotica.domoticz.change.heater(heaterId, e.value);
					Domotica.domoticz.update();
				});
				
				// Enable buttons
				$(this).find( ".up" ).on( "click", function() {
					var currentSetpoint = $(this).closest( ".btn-group" ).data( "setpoint" );
					
					if( currentSetpoint < 28 )
						Domotica.domoticz.change.heater(heaterId, currentSetpoint + 1);
				});
				$(this).find( ".down" ).on( "click", function() {
					var currentSetpoint = $(this).closest( ".btn-group" ).data( "setpoint" );
					
					if( currentSetpoint > 12 )
						Domotica.domoticz.change.heater(heaterId, currentSetpoint - 1);
				});
				
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".heater .slider").on("click", function(e) {
				return false;
			});
		},
	
		// Enable sunscreen buttons
		enableSunscreen: function() {
			var sunscreen = $(".sunscreen");
			var sunscreenId = sunscreen.data("domoticz-id");
			
			sunscreen.find( ".up" ).on( "click", function() {
				Domotica.domoticz.change.sunscreen(sunscreenId, "up" );
			});
			sunscreen.find( ".down" ).on( "click", function() {
				Domotica.domoticz.change.sunscreen(sunscreenId, "down" );
			});
			
			sunscreen.find(".info-box-icon").on( "click", function() {
				Domotica.domoticz.change.sunscreen(sunscreenId, "stop" );
			});
		}
	},

	ui: {
		// Set slider value
		setSliderValue: function(element, value) {
			// Update the slider to show the dimmer value
			var sliderElement = element.find(".value-slider").slider();
			sliderElement.slider("setValue", value);
		},
	
		// Toggle a switch
		toggleSwitch: function(rootElement, newStatus) {
			var element = rootElement.find( ".info-box-icon i");
			if( newStatus ) {
				element.addClass( "lightbulb-on" );
			} else {
				element.removeClass( "lightbulb-on" );
			}
			
			rootElement.data( "status", newStatus );
		}
		
	},
	
	// Generic update method to update everything
	update: function() {
		if(this.domoticz)
			this.domoticz.update();
		
		if(this.weather)
			this.weather.update();
		
		if(this.moon)
			this.moon.update();
		
		if(this.sonos)
			this.sonos.update();
		
		if(this.chromecast)
			this.chromecast.update();
	},
	
};
