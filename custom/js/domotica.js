Domotica = {
	// Initialization function
	init: function() {
		// Start updating all boxes
		this.update();
		
		// Make sure the UI responds to user interaction
		this.bindUIActions();
		
		// Initialize the temperature chart
		this.showTemperatureChart();
	},
	
	// Bind actions to UI events
	bindUIActions: function() {
		this.initialization.enableSwitches();
		this.initialization.enableHeaters();
		this.initialization.enableVolumeSliders();
		this.initialization.enableSunscreen();
	},
	
	initialization: {
		// Enable switches
		enableSwitches: function() {
			// Add a switch event for onclick
			$(".switch").on("click", function(e) {
				var currentStatus = $(this).data("status")
				var newStatus = !currentStatus;
				
				// For now, toggle the switch in the UI
				// TODO: remove this UI switching
				Domotica.ui.toggleSwitch($(this), newStatus);
				
				Domotica.domoticz.change.normalSwitch($(this).data("domoticz-id"), newStatus);
				Domotica.domoticz.update();
			});
			
			// Enable dimmer slider
			$(".dimmer-switch").each(function() {
				var slider = $(this).find(".slider").slider({
					min:0,
					max:100,
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
				var slider = $(this).find(".slider").slider({
					min:10,
					max:26,
					step: 0.5,
					handle: 'round'
				});
				
				// Make sure to update domoticz on change
				var heaterId = $(this).data("domoticz-id");
				slider.on( "slideStop", function(e) {
					Domotica.domoticz.change.heater(heaterId, e.value);
					Domotica.domoticz.update();
				});
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".heater .slider").on("click", function(e) {
				return false;
			});
		},
	
		// Enable volume
		enableVolumeSliders: function() {
			// Enable dimmer slider
			$(".media .slider").slider({
				min:0,
				max:10,
				handle: 'round'
			});
			
			// Make sure changing the slider doesn't switch off the lights
			$(".media .slider").on("click", function(e) {
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
	
	showTemperatureChart: function() {
		  // Get context with jQuery - using jQuery's .get() method.
		  var chartCanvas = $("#temperature-chart").get(0).getContext("2d");
		  
		  // This will get the first returned node in the jQuery collection.
		  var salesChart = new Chart(chartCanvas);

		  var salesChartData = {
		    labels: ["January", "February", "March", "April", "May", "June", "July"],
		    datasets: [
		      {
		        label: "Electronics",
		        fillColor: "rgb(210, 214, 222)",
		        strokeColor: "rgb(210, 214, 222)",
		        pointColor: "rgb(210, 214, 222)",
		        pointStrokeColor: "#c1c7d1",
		        pointHighlightFill: "#fff",
		        pointHighlightStroke: "rgb(220,220,220)",
		        data: [65, 59, 80, 81, 56, 55, 40]
		      },
		      {
		        label: "Digital Goods",
		        fillColor: "rgba(60,141,188,0.9)",
		        strokeColor: "rgba(60,141,188,0.8)",
		        pointColor: "#3b8bba",
		        pointStrokeColor: "rgba(60,141,188,1)",
		        pointHighlightFill: "#fff",
		        pointHighlightStroke: "rgba(60,141,188,1)",
		        data: [28, 48, 40, 19, 86, 27, 90]
		      }
		    ]
		  };

		  var salesChartOptions = {
		    //Boolean - If we should show the scale at all
		    showScale: true,
		    //Boolean - Whether grid lines are shown across the chart
		    scaleShowGridLines: false,
		    //String - Colour of the grid lines
		    scaleGridLineColor: "rgba(0,0,0,.05)",
		    //Number - Width of the grid lines
		    scaleGridLineWidth: 1,
		    //Boolean - Whether to show horizontal lines (except X axis)
		    scaleShowHorizontalLines: true,
		    //Boolean - Whether to show vertical lines (except Y axis)
		    scaleShowVerticalLines: true,
		    //Boolean - Whether the line is curved between points
		    bezierCurve: true,
		    //Number - Tension of the bezier curve between points
		    bezierCurveTension: 0.3,
		    //Boolean - Whether to show a dot for each point
		    pointDot: false,
		    //Number - Radius of each point dot in pixels
		    pointDotRadius: 4,
		    //Number - Pixel width of point dot stroke
		    pointDotStrokeWidth: 1,
		    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		    pointHitDetectionRadius: 20,
		    //Boolean - Whether to show a stroke for datasets
		    datasetStroke: true,
		    //Number - Pixel width of dataset stroke
		    datasetStrokeWidth: 2,
		    //Boolean - Whether to fill the dataset with a color
		    datasetFill: true,
		    //String - A legend template
		    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%=datasets[i].label%></li><%}%></ul>",
		    //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
		    maintainAspectRatio: false,
		    //Boolean - whether to make the chart responsive to window resizing
		    responsive: true
		  };

		  //Create the line chart
		  salesChart.Line(salesChartData, salesChartOptions);
		
		

	},
	
	ui: {
		// Set slider value
		setSliderValue: function(element, value) {
			// Update the slider to show the dimmer value
			var sliderElement = element.find(".slider").slider();
			sliderElement.slider("setValue", result.Level);
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
		},
	},
	
	// Generic update method to update everything
	update: function() {
		this.domoticz.update();
		this.weather.update();
	},
	
};

$(function() { Domotica.init(); });