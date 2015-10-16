Domotica = {
	// Initialization function
	dashboard: {
		init: function() {
			// Set local for moment.js
			moment.locale("nl");
			
			this.defaultUI.init();
			
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
			Domotica.initialization.enableScenes();
			
			if(Domotica.sonos)
				Domotica.sonos.initialize();
			
			if(Domotica.chromecast)
				Domotica.chromecast.initialize();
		},
		
		defaultUI: {
			init: function() {
				this.switches();
				this.dimmerSwitches();
				this.heaters();
			},
			loadingOverlay: function(el) {
				el.append( 
					$( "<div>" ).addClass( "overlay loading" )
						.append( $( "<i>" ).addClass( "fa fa-refresh fa-spin" ) ) 
				);
					
			},
			switches: function() {
				$( ".switch.default-ui").each(function(idx,el) {
					// Add icon
					$(el).prepend( 
						$("<span>" ).addClass( "info-box-icon" )
							.append( $( "<i>" ).addClass( "fa fa-lightbulb-o") )
					);
					
					// Add content itself. Title is given in an element with class title, or in a data-attribute
					var title = $(el).find( ".title" );
					
					if( title.length == 0 ) {
						title = $( "<span>" ).text( $(el).data( "title" ) );
					}
					
					var content = $( "<div>" )
						.addClass( "info-box-content" )
						.append( title.addClass( "info-box-text" ) )
						.append( $( "<span>" ).addClass( "info-box-number domoticz-status" ) )
						.append( $( "<div>" ).addClass( "progress" ) )
						.append( $( "<span>" ).addClass( "progress-description lastUpdate" ) )
						
					$(el).append(content);
					
					// Add overlay
					Domotica.dashboard.defaultUI.loadingOverlay($(el));
				});
			},
			
			// Add dimmer functionality for dimmer switches
			dimmerSwitches: function() {
				// Dimmer switches are normal switches as well, and as such are already converted
				$( ".dimmer-switch.default-ui").each(function(idx,el) {
					// Replace 'last updated' item with slider
					$(el).find( ".lastUpdate" ).replaceWith( 
						$( "<div>" ).addClass( "progress value-slider" ).attr( "id", "dimmer-" + $(el).data( "domoticz-id" ) ) 
					);
				});
			},
			
			// Add heater functionality
			heaters: function() {
				$( ".heater.default-ui").each(function(idx,el) {
					// Add icon
					$(el).prepend( 
						$("<span>" ).addClass( "info-box-icon" ).addClass( "bg-" + $(el).data( "color" ) )
							.append( $( "<i>" ).addClass( "ion ion-flame") )
					);
					
					// Add content itself. Title is given in an element with class title, or in a data-attribute
					var title = $(el).find( ".title" );
					
					if( title.length == 0 ) {
						title = $( "<span>" ).text( $(el).data( "title" ) );
					}
					
					var content = $( "<div>" )
						.addClass( "info-box-content" )
						.append( title.addClass( "info-box-text" ) )
						.append( $( "<span>" ).addClass( "info-box-number temperature" ) )
						.append( $( "<br />" ).addClass( "visible-xs" ) )
						.append( $( "<div>" ).addClass( "progress" ) )
						.append( $( "<div>" ).addClass( "progress value-slider" ).attr( "id", "dimmer-" + $(el).data( "domoticz-id" ) ) )
						
					// Add updown buttons for small screens
					content.append( 
						$( "<div>" ).addClass( "btn-group updown-buttons visible-xs" )
							.append( $( "<button type='button'>" ).addClass( "btn btn-default up" ).append( $( "<i>" ).addClass( "fa fa-chevron-up" ) ) )
							.append( $( "<button type='button'>" ).addClass( "btn btn-default down" ).append( $( "<i>" ).addClass( "fa fa-chevron-down" ) ) )
					);
				
					$(el).append(content);
					
					// Add overlay
					Domotica.dashboard.defaultUI.loadingOverlay($(el));
				});
				
			}
			
		}
		
	},
	
	initialization: {
		// Enable switches
		enableSwitches: function() {
			// Add a switch event for onclick
			$(".switch").on("click", function(e) {
				var currentStatus = $(this).data("status")
				var newStatus = !currentStatus;
				
				Domotica.domoticz.change.normalSwitch($(this).data("domoticz-id"), newStatus);
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
				})
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".dimmer-switch .slider").on("click", function(e) {
				return false;
			});
		},
		
		// Enable scenes
		enableScenes: function() {
			// Add a switch event for onclick
			$(".scene").on("click", function(e) {
				Domotica.domoticz.change.scene($(this).data("domoticz-id"), "On");
				$(this)
					.fadeTo('fast', 0.6)
					.fadeTo('fast', 1.0);
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
