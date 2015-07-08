#!/bin/bash
scp -r bootstrap custom dist plugins vendors *.html pi@domoticz.local:/home/pi/domoticz/www/tablet
