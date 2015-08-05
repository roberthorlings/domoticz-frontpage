# Domoticz Custom Frontpage
These pages are used as a custom frontpage to control a [Domoticz](http://domoticz.com/)
installation. In combination with the [sonos-web](https://github.com/roberthorlings/sonos-web)
and [chromecast-web](https://github.com/roberthorlings/sonos-web) applications, the interface
can also be used to do simple interactions with sonos and chromecast players.

Currently, the dashboard only supports switches and dimmers in Domoticz properly. Controlling the
sonos device works fine. Controlling the Chromecast device also works fine, but has some delays.

## Getting started
* Checkout this repository to your Domoticz `www` directory.
* Copy `custom/js/settings.example.js` to `custom/js/settings.js` and configure the settings
* Add a rectangular user image to `custom/img/user.jpg`
* Create a roomplan in Domoticz that contains all devices you want to see/control in the dashboard
* Alter the boxes in the html pages to reflect your own setup
** The `class` on a HTML box denotes the type of device. Currently supported types are `switch`, `dimmer-switch` and `heater`. 
** The `data-domoticz-id` on the HTML box denotes the idx of the device in Domoticz to communicate with.

## Libraries used
The frontpage is created using:
* [AdminLTE template](https://almsaeedstudio.com/) by almasaeed2010
* [Bootstrap](http://getbootstrap.com/)
* [Weather icons](http://erikflowers.github.io/weather-icons/)
* [OpenWeatherMap](http://openweathermap.org/)
* [Moon phase algorithm](http://www.ben-daglish.net/moon.shtml) by Ben Daglish

