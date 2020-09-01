# js.device-reminder: beta Script für ioBroker
Dies ist ein beta-script zur Ermittlung und Auswertung von elektrischen Verbrauchen, die mittels Schalt-Mess-Aktoren in ioBroker überwacht werden.

# Was sollte beachtet werden?
Der refresh Intervall vom "Verbrauchswert(heißt bei den meisten Geräten "energy")" sollte nicht mehr als 10 Sekunden betragen, da es sonst zu sehr stark verzögerten Meldungen kommen kann.
Befehl in der Tasmota Konsole : TelePeriod 10

# Welche Geräte können zur Zeit überwacht werden?
- Waschmaschine,
- Trockner,
- Geschirrspüler,
- Wasserkocher,
- Computer,
- Test -> falls man ein Gerät testen möchte, welches nicht in der oben genannten Liste auftaucht

- weitere werden folgen ...

# Was ist möglich?
- Benachrichtigung beim Gerätestart
- Benachrichtigung beim Vorgangsende des jeweiligen Gerätestart
- Telegram-Benachrichtigung (mehrere IDs sind möglich)
- Alexa-Benachrichtigung (mehrere IDs sind möglich)

# Anleitung
- Ein neues JS Script in iobroker erstellen und das Script aus "script-device-reminder.js" kopieren und einfügen.
- 'DATENPUNKT VERBRAUCH' Hier muss der DP ausgewaehlt werden, welcher den Verbrauch misst
- 'DATENPUNKT SWITCH ON/OFF' Hier wird der Switch ausgewaehlt, der das Geraet AN/AUS schaltet -> aktuell noch nicht implementiert
- Die Datenpunkte zur Anzeige in VIS werden automatisch standardmaessig unter "0_userdata.0.Verbrauch." angelegt.

array INPUT -> muss zur Zeit noch von Hand angepasst werden
Der Name kann frei gewaehlt werden. Neu ist jedoch, dass man einen Geraetetyp auswaehlen muss (bitte die Kürzel eintragen! Beispiel: geraeteTyp:"wama")
- "Trockner" -> dryer
- "Waschmaschine" -> wama
- "Geschirrspueler" -> diwa
- "Computer" -> computer
- "Wasserkocher" -> wako
- "Test" -> test
Die Geraete werden spaeter ueber ein dropdown in einer html Liste ausgewaehlt, zur Zeit einfach haendisch ein/auskommentieren mit "//"

Es muss natuerlich weiterhin der energyMessure und der eneryPower angepasst werden, wobei energyPower aktuell weiterhin nicht implentiert ist, dass kommt noch!

# Changelog
#### 01.09.2020 (V 0.1)
- (Steffen Feldkamp) Bugfixes und änderung der Objekterstellung

#### 01.09.2020 (V 0.0.1)
- (Steffen Feldkamp) initial release

# License
MIT License

Copyright (c) 2020 Steffen Feldkamp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
