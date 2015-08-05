// Code to handle SONOS players
Domotica.sonos = {
	// Variable to store the interval
	interval: null,
	
	// Caching the current status to determine when to update
	currentStatus: null,

	// Initialize the Sonos widget
	initialize: function() {
		if( !Domotica.settings.sonos ) {
			console.log( "No sonos settings found. Please configure your sonos installation. See settings.example.js.");
			return;
		}
		
		// Enable volume slider
		var slider = $(".music .value-slider").slider({
			min:0,
			max:100,
			handle: 'round'
		});
		
		slider.on("slideStop", function(e) {
			Domotica.sonos.change.volume(e.value);
			Domotica.sonos.update();
		});
		
		// Enable control buttons
		$(".music .controls .play").on("click", Domotica.sonos.change.play);
		$(".music .controls .pause").on("click", Domotica.sonos.change.pause);
		$(".music .controls .next").on("click", Domotica.sonos.change.next);
		$(".music .controls .prev").on("click", Domotica.sonos.change.previous);
	},
	
	// Main method for updating the status of all boxes 
	// that are associated with the sonos data
	update: function() {
		var that = Domotica.sonos;
		
		// If the system is waiting to update again, cancel the 
		// interval. We will restart the interval again at the end
		// of the meeting
		if( that.interval ) {
			clearInterval(that.interval);
		}
		
		// Handle updates to todays weather
		that.query("status", {}, function(data) {
			that.updateWidget.status(data);
			
			// Make sure to start updating again 
			if( Domotica.sonos.currentStatus == "PLAYING" || Domotica.sonos.currentStatus == "TRANSITIONING" ) {
				updateFrequency = Domotica.settings.sonos.updateFrequencyWhilePlaying;
			} else {
				updateFrequency = Domotica.settings.sonos.updateFrequencyWhileStopped;
			}
			
			that.interval = setInterval(that.update, updateFrequency);
		});
		
	},
	
	// Methods to update widgets on the screen, based on 
	// data from weather station
	updateWidget: {
		status: function(data) {
			var element = $(".music");
			
			// Store status in cache
			Domotica.sonos.currentStatus = data.state.name;
			
			switch(data.state.name) {
				case "PLAYING":
					this.updateTrack(element, data.state);
					this.setIcon(element, "fa-music");
					
					// Update controls
					element.find( ".controls .play" ).hide();
					element.find( ".controls .pause" ).show();
					
					break;
				case "PAUSED_PLAYBACK":
					this.updateTrack(element, data.state);
					this.setIcon(element, "fa-pause");
					
					// Update controls
					element.find( ".controls .play" ).show();
					element.find( ".controls .pause" ).hide();
					
					break;
				case "STOPPED":
					this.updateTrack(element, null);
					this.setIcon(element, "fa-stop");
					
					// Update controls
					element.find( ".controls .play" ).show();
					element.find( ".controls .pause" ).hide();
					
					break;
			}
			
			// Update albumart
			this.updateAlbumArt(element, data.state);
			
			// Update volume control
			Domotica.ui.setSliderValue(element, data.volume.level);
			
			// Hide the loading spinner
			element.find( ".loading" ).remove();
		},
		
		setIcon: function(element, icon) {
			element.find(".info-box-icon i").removeClass().addClass("fa").addClass(icon);
		},
		updateTrack: function(element, state) {
			element.find( ".info-box-text" ).text( state ? state.details.artist : "Gestopt" );
			element.find( ".info-box-number" ).text( state ? state.details.title : "." );
			
			var progress
			if( state ) {
				progress = Domotica.sonos.translate.progress(state.details.position, state.details.duration);
			} else {
				progress = 0;
			}
			
			var progressBar = element.find( ".progress" ).empty();
			
			if(state) {
				progressBar.append(
						$("<div>").addClass( "progress-bar" ).css( "width", "" + Math.round( progress * 100 ) + "%" )
				);
			}
		},
		
		updateAlbumArt: function(element, state) {
			var icon = element.find( ".info-box-icon" );
			if( state.details && state.details.albumArt ) {
				icon.css( "background-image", "url(" + state.details.albumArt + ")" );
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
			var that = Domotica.sonos;
			that.execute("volume", {volume: newVolume}, that.update);
		},
		
		play: function() {
			var that = Domotica.sonos;
			that.execute("play", {}, that.update);
		},
		
		pause: function() {
			var that = Domotica.sonos;
			that.execute("pause", {}, that.update);
		},
		
		next: function() {
			var that = Domotica.sonos;
			that.execute("next", {}, that.update);
		},
		
		previous: function() {
			var that = Domotica.sonos;
			that.execute("previous", {}, that.update);
		},
	},
	
	// Translate values or words from the weather response into
	// a format useful for the user
	translate: {
		progress: function( position, duration ) {
			var positionSeconds = this.getSecondsFromTime(position);
			var durationSeconds = this.getSecondsFromTime(duration);
			
			return positionSeconds / durationSeconds;
		},
		
		getSecondsFromTime(time) {
			return time.substr(0, 1) * 3600 + time.substr(2, 2) * 60 + time.substr(5, 2) * 1;
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
		var url = Domotica.settings.sonos.baseUrl + "/" + method;

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