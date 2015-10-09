Domotica.settings = {
	location: {
		lat: 52,
		lon: 5
	},
		
	domoticz: {
		// Base URL to communicate with Domoticz. Inlucdes the json.htm 
		baseUrl: "http://192.168.178.21:8080/json.htm",
		
		// Default update frequency in ms.
		// Please note that several boxes are updated
		// when the user clicks on a button
		updateFrequency: 10000,
		
		// Roomplan number to retrieve information for
		// This roomplan should contain all devices to 
		// be updated on the dashboard
		plan: 2,
	},
	weather: {
		// Base URL to communicate with OpenWeatherMap
		baseUrl: "http://api.openweathermap.org/data/2.5/",

		// OpenWeatherMap city ID to use for weather info
		cityId: 2753557,
		
		// Default update frequency in ms.
		updateFrequency: 30 * 60 * 1000,
		
		// Number of days to show the forecast for
		daysToForecast: 3,
		
		// API key needed to access openweathermap
		// See http://openweathermap.org/appid
		apiKey: ""
	},
	moon: {
		// Default update frequency in ms.
		updateFrequency: 12 * 60 * 60 * 1000,
	},
	sonos: {
		// Base URL to communicate with the Sonos webinterface
		// See 
		baseUrl: "http://192.168.178.21/sonos/index.php",
		
		// Default update frequency in ms.
		updateFrequencyWhileStopped: 10000,
		updateFrequencyWhilePlaying: 5000,
	},
	chromecast: {
		// Base URL to communicate with the Chromecast webinterface
		baseUrl: "http://192.168.178.21/chromecast",
		
		// Default update frequency in ms.
		updateFrequencyWhileStopped: 10000,
		updateFrequencyWhilePlaying: 4000,
	},
	
}