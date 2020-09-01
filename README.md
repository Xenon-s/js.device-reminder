# js.device-reminder: beta Script für ioBroker 
Dies ist ein beta-script zur Ermittlung und Auswertung von elektrischen Verbrauchen, die mittels Schalt-Mess-Aktoren in ioBroker überwacht werden.

This is a beta script for the determination and evaluation of electrical consumption, which is monitored by means of switching / measuring actuators in ioBroker.

# Was sollte beachtet werden? / What should be considered?
Der refresh Intervall vom "Verbrauchswert(heißt bei den meisten Geräten "energy")" sollte nicht mehr als 10 Sekunden betragen, da es sonst zu sehr stark verzögerten Meldungen kommen kann.
Befehl in der Tasmota Konsole : TelePeriod 10

The refresh interval of the "Consumption value (called" energy "for most devices)" should not be more than 10 seconds, as otherwise messages can be very delayed.
Command in the Tasmota console: TelePeriod 10

# Welche Geräte können zur Zeit überwacht werden? / Which devices can currently be monitored?
Waschmaschine,
Trockner,
Geschirrspüler,
Wasserkocher,
Computer,
Test -> falls man ein Gerät testen möchte, welches nicht in der oben genannten Liste auftaucht

Washer dryer,
dishwasher,
Washing machine,
computer,
test -> if you want to test a device that does not appear in the list above

more will follow ...

weitere werden folgen ...

# Was ist möglich? / What is possible?
Benachrichtigung beim Gerätestart
Benachrichtigung beim Vorgangsende des jeweiligen Gerätestart
Telegram-Benachrichtigung (mehrere IDs sind möglich)
Alexa-Benachrichtigung (mehrere IDs sind möglich)

Notification at device start
Notification at the end of the process of the respective device start
Telegram notification (multiple IDs are possible)
Alexa notification (multiple IDs are possible)

# Anleitung / manual
Ein neues JS Script in iobroker erstellen und das Script aus "script-device-reminder.js" kopieren und einfügen.

'DATENPUNKT VERBRAUCH' Hier muss der DP ausgewaehlt werden, welcher den Verbrauch misst
'DATENPUNKT SWITCH ON/OFF' Hier wird der Switch ausgewaehlt, der das Geraet AN/AUS schaltet -> aktuell noch nicht implementiert

Die Datenpunkte zur Anzeige in VIS werden automatisch standardmaessig unter "0_userdata.0.Verbrauch." angelegt.

/* array INPUT -> muss zur Zeit noch von Hand angepasst werden
NEU: Es darf nicht mehr der name geandert werden! Es sind derzeit nur folgende Geraete nutzbar (Namen muessen genau uebernommen werden):
"Trockner"
"Waschmaschine"
"Geschirrspueler"
"Computer"
"Test"
Die Geraete werden spaeter ueber ein dropdown in einer html Liste ausgewaehlt, zur Zeit einfach haendisch ein/auskommentieren mit "//"

Es muss natuerlich weiterhin der energyMessure und der eneryPower angepasst werden,
wobei energyPower aktuell weiterhin nicht implentiert ist, dass kommt noch!


Create a new JS script in iobroker and copy and paste the script from "script-device-reminder.js".

'DATA POINT CONSUMPTION' Here the DP must be selected which measures the consumption
'DATA POINT SWITCH ON / OFF' Here the switch that switches the device ON / OFF is selected -> not yet implemented

The data points for display in VIS are automatically set to "0_userdata.0.Verbrauch." created.

/ * array INPUT -> has to be adjusted by hand at the moment NEW: The name can no longer be changed! Only the following devices can currently be used (names must be adopted exactly): "Dryer" "Washing machine" "Dishwasher" "Computer" "Test" The devices are later selected via a dropdown in an html list, at the moment simply comment on / out by hand With "//"

Of course, the energyMessure and the eneryPower still have to be adjusted, although energyPower is still not currently implemented, that is yet to come!

# Changelog
0.0.1
(Steffen Feldkamp) initial release

# License
MIT License

Copyright (c) 2020 Steffen Feldkamp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
