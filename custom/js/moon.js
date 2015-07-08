// Code to handle moon features
Domotica.moon = {
	// Variable to store the interval
	interval: null,
	
	// Default update frequency in ms.
	updateFrequency: 12 * 60 * 60 * 1000,

	// Main method for updating the status of all boxes 
	// that are associated with the weather
	update: function() {
		var that = this;
		
		// If the system is waiting to update again, cancel the 
		// interval. We will restart the interval again at the end
		// of the meeting
		if( this.interval ) {
			clearInterval(this.interval);
		}
		
		that.updateWidget();
		
		// Make sure to start updating again 
		this.interval = setInterval(this.updateFrequency, this.update);
	},
	
	// Update moon information based on the current date 
	updateWidget: function() {
		var today = new Date();
		var moonPhase = this.calculation.phase(today.getFullYear(), today.getMonth() + 1, today.getDate());
		var description = this.translate.moonPhase.description(moonPhase);
		var icon = this.translate.moonPhase.icon(moonPhase);
		
		$( ".moon .btn .wi" ).removeClass().addClass("wi").addClass(icon);
		$( ".moon .product-description" ).text(description);

	},
	
	calculation: {
		// Compute the phase of the moon, using the Conway algorithm.
		// See http://www.ben-daglish.net/moon.shtml
		phase: function(year, month, day) {
			var r = year % 100;
			r %= 19;
			if (r>9){ r -= 19;}
			r = ((r * 11) % 30) + parseInt(month) + parseInt(day);
			if (month<3){r += 2;}
			r -= ((year<2000) ? 4 : 8.3);
			r = Math.floor(r+0.5)%30;
			return (r < 0) ? r+30 : r;			
		}
	},
	
	// Translate values or words from the weather response into
	// a format useful for the user
	translate: {
		// Convert moonphase into a description or WI icon
		moonPhase: {
			description: function(phase) {
				var descriptions = [
					'Nieuwe maan',
					'Wassende maansikkel',
					'Wassende maansikkel',
					'Wassende maansikkel',
					'Wassende maansikkel',
					'Wassende maansikkel',
					'Wassende maansikkel',
					'Eerste kwartier',
					'Wassende maanbol',
					'Wassende maanbol',
					'Wassende maanbol',
					'Wassende maanbol',
					'Wassende maanbol',
					'Wassende maanbol',
					'Volle maan',
					'Volle maan',
					'Afnemende maanbol',
					'Afnemende maanbol',
					'Afnemende maanbol',
					'Afnemende maanbol',
					'Afnemende maanbol',
					'Afnemende maanbol',
					'Laatste kwartier',
					'Afnemende maansikkel',
					'Afnemende maansikkel',
					'Afnemende maansikkel',
					'Afnemende maansikkel',
					'Afnemende maansikkel',
					'Afnemende maansikkel',
					'Nieuwe maan',
				];
				
				return descriptions[ phase % descriptions.length ];
			},
			
			icon: function(phase) {
				var icons = [
					'wi-moon-new',
					'wi-moon-waxing-cresent-1',
					'wi-moon-waxing-cresent-2',
					'wi-moon-waxing-cresent-3',
					'wi-moon-waxing-cresent-4',
					'wi-moon-waxing-cresent-5',
					'wi-moon-waxing-cresent-6',
					'wi-moon-first-quarter',
					'wi-moon-waxing-gibbous-1',
					'wi-moon-waxing-gibbous-2',
					'wi-moon-waxing-gibbous-3',
					'wi-moon-waxing-gibbous-4',
					'wi-moon-waxing-gibbous-5',
					'wi-moon-waxing-gibbous-6',
					'wi-moon-full',
					'wi-moon-full',
					'wi-moon-waning-gibbous-1',
					'wi-moon-waning-gibbous-2',
					'wi-moon-waning-gibbous-3',
					'wi-moon-waning-gibbous-4',
					'wi-moon-waning-gibbous-5',
					'wi-moon-waning-gibbous-6',
					'wi-moon-3rd-quarter',
					'wi-moon-waning-crescent-1',
					'wi-moon-waning-crescent-2',
					'wi-moon-waning-crescent-3',
					'wi-moon-waning-crescent-4',
					'wi-moon-waning-crescent-5',
					'wi-moon-waning-crescent-6',
					'wi-moon-new'
				];
				
				return icons[ phase % icons.length ];
			}
		}
	},
};