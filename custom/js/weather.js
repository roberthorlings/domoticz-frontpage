// Code to handle weather forecasts
Domotica.weather = {
	// Variable to store the interval
	interval: null,
	
	// Default update frequency in ms.
	// Please note that several boxes are updated
	// when the user clicks on a button
	updateFrequency: 30 * 60 * 1000,

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
		this.call({}, function(data) {
			that.updateWidget.weatherList(data);
		});
		
		// Make sure to start updating again 
		this.interval = setInterval(this.updateFrequency, this.update);
	},
	
	// Methods to update widgets on the screen, based on 
	// data from weather station
	updateWidget: {
		weatherList: function(data) {
			var weatherList = $(".weather-list");
			
			// Update generic weather
			$.each(data.main, function(idx, value) {
				weatherList.find( "li.generic-weather ." + idx).text(Math.round(value));
			});
			weatherList.find( "li.generic-temperature .product-description").text(data.weather.description);
			
			// Update wind
			weatherList.find( ".weather-wind .label" ).text(  Domotica.weather.translate.wind.direction(data.wind.deg) + " " + Domotica.weather.translate.wind.speed(data.wind.speed) )
		}
	},
	
	// Translate values or words from the weather response into
	// a format useful for the user
	translate: {
		wind: {
			direction: function(degrees) {
				var index = Math.round(degrees / 22.5);
				var directions = ["N", "NNO", "NO", "ONO", "O", "OZO", "ZO", "ZZO", "Z", "ZZW", "ZW", "WZW", "W", "WNW", "NW", "NNW", "N" ];
				return directions[index];
			},
			
			speed: function(speed) {
				if( speed <= 0.2 ) return 0;
				if( speed <= 1.5 ) return 1;
				if( speed <= 3.3 ) return 2;
				if( speed <= 5.4 ) return 3;
				if( speed <= 7.9 ) return 4;
				if( speed <= 10.7 ) return 5;
				if( speed <= 13.8 ) return 6;
				if( speed <= 17.1 ) return 7;
				if( speed <= 20.7 ) return 8;
				if( speed <= 24.4 ) return 9;
				if( speed <= 28.4 ) return 10;
				if( speed <= 32.6 ) return 11;
				
				return 12;
			}
		},
		text: function(value) {
			switch(value) {
				case "On": return "Aan";
				case "Off": return "Uit";
				default: return value;
			}
		},
	},
	
	// Basic method to retrieve weather information
	call: function(parameters, callback) {
		var url = "http://api.openweathermap.org/data/2.5/weather";

		if( typeof( parameters) == "undefined" ) {
			parameters = {};
		}
		
		// City ID of Houten
		parameters.id = 2753557;
		
		// Metric units and Dutch language
		parameters.units = "metric";
		parameters.lang = "nl";
		
		// Actually do the call and call the callback
		$.get( url, parameters, function(data, textStatus, jqXHR) {
			if( typeof(callback) != "undefined" ) {
				callback(data);
			}
		});
	}
};