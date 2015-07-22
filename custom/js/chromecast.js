// Code to handle Chromecast players
Domotica.chromecast = {
	// Variable to store the interval
	interval: null,
	
	// Caching the current status to determine when to update
	currentStatus: null,

	// Initialize the Sonos widget
	initialize: function() {
		// Enable volume slider
		var slider = $(".chromecast .value-slider").slider({
			min:0,
			max:100,
			handle: 'round'
		});
		
		slider.on("slideStop", function(e) {
			Domotica.chromecast.change.volume(e.value);
			Domotica.chromecast.update();
		});
		
		// Enable control buttons
		$(".chromecast .controls .play").on("click", Domotica.chromecast.change.play);
		$(".chromecast .controls .pause").on("click", Domotica.chromecast.change.pause);
		$(".chromecast .controls .next").on("click", Domotica.chromecast.change.next);
		$(".chromecast .controls .prev").on("click", Domotica.chromecast.change.previous);
	},
	
	// Main method for updating the status of all boxes 
	// that are associated with the sonos data
	update: function() {
		var that = Domotica.chromecast;
		
		// If the system is waiting to update again, cancel the 
		// interval. We will restart the interval again at the end
		// of the meeting
		if( that.interval ) {
			clearInterval(that.interval);
		}
		
		// Handle updates to todays weather
		that.query("fullstatus", {}, function(data) {
			that.updateWidget.status(data);
			
			// Make sure to start updating again 
			if( Domotica.chromecast.currentStatus == "PLAYING" || Domotica.chromecast.currentStatus == "UNKNOWN" ) {
				updateFrequency = Domotica.settings.chromecast.updateFrequencyWhilePlaying;
			} else {
				updateFrequency = Domotica.settings.chromecast.updateFrequencyWhileStopped;
			}

			// If there is an interval waiting, clear the interval first, to prevent 
			// many updates at once
			if( that.interval ) {
				clearInterval(that.interval);
			}
			
			that.interval = setInterval(that.update, updateFrequency);
		});
		
	},
	
	// Methods to update widgets on the screen, based on 
	// data from weather station
	updateWidget: {
		status: function(data) {
			var element = $(".chromecast");
			
			// Store status in cache
			Domotica.chromecast.currentStatus = Domotica.chromecast.translate.status(data);
			
			switch(Domotica.chromecast.currentStatus) {
				case "PLAYING":
					this.updateTrack(element, data);
					this.setIcon(element, "fa-ios-film-outline");
					
					// Update controls
					element.find( ".controls .play" ).hide();
					element.find( ".controls .pause" ).show();
					
					break;
				case "PAUSED":
					this.updateTrack(element, data);
					this.setIcon(element, "fa-pause");
					
					// Update controls
					element.find( ".controls .play" ).show();
					element.find( ".controls .pause" ).hide();
					
					break;
				case "STOPPED":
				case "IDLE":
					this.updateTrack(element, null);
					this.setIcon(element, "fa-stop");
					
					// Update controls
					element.find( ".controls .play" ).show();
					element.find( ".controls .pause" ).hide();
					
					break;
			}
			
			// Update albumart
			this.updateAlbumArt(element, data.media);
			
			// Update volume control
			Domotica.ui.setSliderValue(element, data.cast.volume_level * 100 );
			
			// Hide the loading spinner
			element.find( ".loading" ).remove();
		},
		
		setIcon: function(element, icon) {
			element.find(".info-box-icon i").removeClass().addClass("fa").addClass(icon);
		},
		updateTrack: function(element, state) {
			element.find( ".info-box-text" ).text( (state && state.cast && state.cast.display_name) ? state.cast.display_name : "Gestopt" );
			element.find( ".info-box-number" ).text( (state && state.media && state.media.media_metadata && state.media.media_metadata.title) ? state.media.media_metadata.title : "." );
			
			var progress
			if( state && state.media && state.media.current_time ) {
				progress = Domotica.chromecast.translate.progress(state.media.current_time, state.media.duration);
			} else {
				progress = 0;
			}
			
			var progressBar = element.find( ".progress" ).empty();
			
			if(progress) {
				progressBar.append(
						$("<div>").addClass( "progress-bar" ).css( "width", "" + Math.round( progress * 100 ) + "%" )
				);
			}
		},
		
		updateAlbumArt: function(element, media) {
			var icon = element.find( ".info-box-icon" );
			if( media && media.media_metadata && media.media_metadata.images ) {
				icon.css( "background-image", "url(" + media.media_metadata.images[0].url + ")" );
				icon.addClass( "with-image" );
			} else {
				icon.css( "background-image", "none" );
				icon.removeClass( "with-image" );
			}
		}
	},
	
	change: {
		volume: function(newVolume) {
			// Handle updates to todays weather
			var that = Domotica.chromecast;
			that.execute("volume", {volume: newVolume}, that.update);
		},
		
		play: function() {
			var that = Domotica.chromecast;
			that.execute("play", {}, that.update);
		},
		
		pause: function() {
			var that = Domotica.chromecast;
			that.execute("pause", {}, that.update);
		},
		
		next: function() {
			var that = Domotica.chromecast;
			that.execute("skip", {}, that.update);
		},
	},
	
	// Translate values or words from the weather response into
	// a format useful for the user
	translate: {
		progress: function( position, duration ) {
			return position / duration;
		},
		status: function(data) {
			return (data && data.media && data.media.player_state) ? data.media.player_state : "STOPPED";
		}
	},
	
	query: function(method, parameters, callback) {
		return this.call($.get, method, parameters, callback);
	},
	
	execute: function(method, parameters, callback) {
		return this.call($.post, method, parameters, callback);
	},
	
	// Basic method to send data to the webinterface
	call: function(ajaxFunc, method, parameters, callback) {
		var url = Domotica.settings.chromecast.baseUrl + "/" + method;

		if( typeof( parameters) == "undefined" ) {
			parameters = {};
		}
		
		// Actually do the call and call the callback
		ajaxFunc( url, parameters, function(data, textStatus, jqXHR) {
			if( typeof(callback) != "undefined" ) {
				callback(data);
			}
		});
	}
};