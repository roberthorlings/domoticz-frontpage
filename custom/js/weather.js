// Code to handle weather forecasts
Domotica.weather = {
	// Variable to store the interval
	interval: null,

	// Main method for updating the status of all boxes 
	// that are associated with the weather
	update: function() {
		var that = Domotica.weather;
		
		// If the system is waiting to update again, cancel the 
		// interval. We will restart the interval again at the end
		// of the meeting
		if( that.interval ) {
			clearInterval(that.interval);
		}
		
		// Handle updates to todays weather
		this.call("weather", {}, function(data) {
			that.updateWidget.current(data);
		});
		
		// Retrieve forecast for the given number of days (+1 as today is retrieved as well)
		this.call("forecast/daily", {cnt: ( Domotica.settings.weather.daysToForecast + 1 )}, function(data) {
			that.updateWidget.dailyForecast(data);
		});
		
		// Make sure to start updating again 
		that.interval = setInterval(that.update, Domotica.settings.weather.updateFrequency);
	},
	
	// Methods to update widgets on the screen, based on 
	// data from weather station
	updateWidget: {
		generic: function(element, data) {
			// Update icon
			this.icon( element.find( ".generic-temperature .btn .wi" ), data.weather );
			
			// Update generic weather
			$.each(data.main, function(idx, value) {
				element.find( ".generic-weather ." + idx).each(function(i, el) {
					$el = $(el);
					if( $el.hasClass( "intTemperature" ) ) {
						$el.text(Math.round(value));	
					} else {
						$el.text(value);	
					}
				});
			});
			element.find( ".generic-temperature .product-description").text(data.weather[0].description);
			
			// Update wind
			var windSpeed = Domotica.weather.translate.wind.speed(data.wind.speed);
			var windDirection = Domotica.weather.translate.wind.direction(data.wind.deg);
			element.find( ".weather-wind .label" ).text(  windDirection + " " + windSpeed )
			element.find( ".weather-wind .btn .wi" ).removeClass().addClass( "wi" ).addClass( "wi-beafort-" + windSpeed );
			
			// Update sunrise and sunset
			element.find( ".sunrise .label" ).text( Domotica.weather.translate.time(data.sys.sunrise));
			element.find( ".sunset .label" ).text( Domotica.weather.translate.time(data.sys.sunset));
		},
		
		// Updates the forecast for a single day
		forecastForASingleDay: function(element, data) {
			// Update icon
			this.icon( element.find( ".btn .wi" ), data.weather );
			
			// Update temperatures
			$.each(data.temp, function(idx, value) {
				element.find( ".temp_" + idx).text(Math.round(value));
			});

			// Update weather description
			element.find( ".weather-description" ).text( data.weather[0].description );
			
			// Update wind
			element.find( ".wind" ).text(  Domotica.weather.translate.wind.direction(data.deg) + " " + Domotica.weather.translate.wind.speed(data.speed) );
			
			// Update rain forecast
			element.find( ".rain" ).text( ( data.rain ? Math.round(data.rain): "0" ) + " mm");
			
			// Update date
			element.find( ".date" ).text( Domotica.weather.translate.date( data.dt ) );
		},
		
		icon: function(element, data) {
			// For now only handle the first weather condition
			var icon = Domotica.weather.translate.icon(data[0].id);
			element.removeClass()
				.addClass("wi")
				.addClass(icon);
		},
		
		// Updates weather for today  on screen
		current: function(data) {
			this.generic($(".current-weather"), data);
			
			// Hide the loading part
			$( ".current-weather" ).parents( ".box" ).find( ".loading" ).remove();
		},

		// Updates daily forecast on screen
		dailyForecast: function(data) {
			var template = $( ".weather-forecast .template" );
			var that = this;
			
			// Remove all existing forecasts
			$( ".weather-forecast li:not(.template)" ).remove();
			
			$.each( data.list, function(idx, item) {
				// Skip today in the forecasts
				if( idx == 0 )
					return;
				
				// Create a clone of the template
				var element = template.clone().removeClass( "template" );
				
				// Fill the template
				that.forecastForASingleDay(element, item);
				
				// Add the template to the screen
				template.parent().append(element);
			});
			
			// Remove loading icon
			$( ".weather-forecast" ).parents( ".box" ).find( ".loading" ).remove();
		}
	},
	
	// Translate values or words from the weather response into
	// a format useful for the user
	translate: {
		time: function(timestamp) {
			return moment.unix(timestamp).format("HH:mm"); 
		},
		date: function(timestamp) {
			return moment.unix(timestamp).format("D MMM YYYY"); 
		},
		
		pad: function(n) {
		    return (n < 10) ? ("0" + n) : n;
		},
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
		
		// Return a weather icon for a given condition (openweathermap)
		icon: function(conditionId) {
			// For descriptions of the conditionId, see http://openweathermap.org/weather-conditions
			// For all weather icons, see http://erikflowers.github.io/weather-icons/
			// For now, we only return icons for daily conditions
			
			switch(conditionId) {
				// Thunderstorms
				case 200: 
				case 210: 
				case 230: 
					return "wi-storm-showers" ;
				case 201: 
				case 211: 
				case 221: 
				case 231: 
					return "wi-day-sleet-storm"; 
				case 202:
				case 212:
				case 232:
					return "wi-thunderstorm";
				
				// Drizzle
				case 300: 
				case 310: 
					return "wi-sleet" ;
				case 301: 
				case 311: 
				case 321: 
					return "wi-rain-mix"; 
				case 302:
				case 312:
					return "wi-rain-mix";
				case 313:
				case 314:
					return "wi-showers";
					
				// Rain
				case 500:
					return "wi-sprinkle";
				case 501:
					return "wi-rain-mix";
				case 502:
				case 503: 
				case 504:
					return "wi-rain";
				case 511:
					return "wi-hail";
				case 520: 
				case 521: 
				case 522: 
				case 531:
					return "wi-showers" ;

				// Snow
				case 600:
				case 601:
				case 602:
					return "wi-snow";
				case 611:
				case 612:
					return "wi-sleet";
				case 615:
				case 616:
					return "wi-rain-mix";
				case 620:
				case 621:
				case 622:
					return "wi-snow";
				
				// Atmosphere
				case 701:
					return "wi-fog";
				case 711:
					return "wi-smoke";
				case 721:
					return "wi-day-haze";
				case 731:
				case 741:
				case 751:
				case 761:
				case 762:
				case 771:
					return "wi-fog";
				case 781:
					return "wi-tornado";

				// Clouds
				case 800:
					return "wi-day-sunny";
				case 801:
					return "wi-day-sunny-overcast";
				case 802:
					return "wi-day-cloudy";
				case 803:
					return "wi-day-cloudy";
				case 804:
					return "wi-cloudy";
				case 751:
				case 761:
				case 762:
				case 771:
					return "wi-fog";
				case 781:
					return "wi-tornado";
					
				// Extreme
				case 900:
					return "wi-tornado";
				case 901:
					return "wi-day-storm-showers";
				case 902:
					return "wi-hurricane";
				case 903:
					return "wi-snowflake-cold";
				case 904:
					return "wi-hot";
				case 905:
					return "wi-windy";
				case 906:
					return "wi-hail";
					
				// Additional
				case 951:
				case 952:
				case 953:
				case 954:
				case 955:
				case 956:
				case 957:
				case 958:
				case 959:
				case 960:
				case 961:
					return "wi-beaufort-" + (conditionId - 950);
				case 962:
					return "wi-hurricane";
			}
			
			return "";
		}
	},
	
	// Basic method to retrieve weather information
	call: function(method, parameters, callback) {
		var url = Domotica.settings.weather.baseUrl + method;

		if( typeof( parameters) == "undefined" ) {
			parameters = {};
		}
		
		// City ID 
		parameters.id = Domotica.settings.weather.cityId;
		
		// Metric units and Dutch language
		parameters.units = "metric";
		parameters.lang = "nl";
		
		// App ID
		parameters.appid = Domotica.settings.weather.apiKey;
		
		// Actually do the call and call the callback
		$.get( url, parameters, function(data, textStatus, jqXHR) {
			if( typeof(callback) != "undefined" ) {
				callback(data);
			}
		});
	}
};