#!/bin/bash
scp -r bootstrap custom dist plugins vendors *.html manifest.json pi@domoticz.local:/home/pi/domoticz/www/tablet
