Domotica = {
	// Initialization function
	dashboard: {
		init: function() {
			// Make sure the UI responds to user interaction
			this.bindUIActions();
			
			// Start updating all boxes
			Domotica.update();
		},
		
		// Bind actions to UI events
		bindUIActions: function() {
			Domotica.initialization.enableSwitches();
			Domotica.initialization.enableHeaters();
			Domotica.initialization.enableVolumeSliders();
			Domotica.initialization.enableSunscreen();
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
			$(".dimmer-switch .value-slider").on("click", function(e) {
				return false;
			});
		},
		
		// Enable heaters
		enableHeaters: function() {
			// Enable dimmer slider
			$(".heater").each(function() {
				var slider = $(this).find(".value-slider").slider({
					min:10,
					max:26,
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
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".heater .value-slider").on("click", function(e) {
				return false;
			});
		},
	
		// Enable volume
		enableVolumeSliders: function() {
			// Enable dimmer slider
			$(".media .value-slider").slider({
				min:0,
				max:10,
				handle: 'round'
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".media .value-slider").on("click", function(e) {
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
		this.domoticz.update();
		this.weather.update();
		this.moon.update();
	},
	
};
