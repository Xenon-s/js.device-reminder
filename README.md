# js.device-reminder: Überwachungsscript für ioBroker (Version 1.0)
Dies ist ein Script zur Ermittlung und Auswertung von beliebig vielen elektrischen Verbrauchen, die mittels Schalt-Mess-Aktoren in ioBroker überwacht werden. Bei Erreichen des Start oder Endzustandes kann man sich zusätzlich benachrichtigen lassen.

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
- WhatsApp-Benachrichtung
- Geräte bei Bedarf abschalten, wenn Vorgang beendet erkannt wurde

# Anleitung
## Script erstellen und Benutzereingaben anpassen
1. Ein neues JS Script in iobroker erstellen und das Script aus "script-device-reminder.js" kopieren und einfügen.
2. Benutzerkonfiguration anpassen (Benachrichtigungen aktivieren, etc.)

### Eigenes Gerät hinzufügen
3. Die gewünschten Geräte hinzufügen wie im folgenden beschrieben:
  - **{geraeteName:"GERÄTENAME", geraeteTyp: "GERÄTETYP", autoOff: false, energyMessure: 'DP Messwert', energyPower:'DP Switch Schalter ON/OFF'},** kopieren und in das Array "arrGeraeteInput" einfügen
  - **'GERAETENAME'** kann durch einen beliebigen Namen ersetzt werden
  - **'GERÄTETYP'**' hier muss ein Gerätetyp aus der Liste unten ausgewählt werden
  - **'autoOff'**' hier kann für das jeweilige Gerät aktiviert werden, ob es nach Beendigung ausgeschaltet werden soll (ja= true / nein = false)
  - **'DATENPUNKT VERBRAUCH'**' Hier muss der DP ausgewaehlt werden, welcher den Verbrauch misst
  - **'DATENPUNKT SWITCH ON/OFF'**' Hier wird der Switch ausgewaehlt, der das Geraet AN/AUS schaltet

- Liste aktuell verfügbarer Gerätetypen (es muss das kürzel eingefügt werden, zb. wama):
1. **Trockner** -> dryer
2. **Waschmaschine** -> wama
3. **Geschirrspueler** -> diwa
4. **Computer** -> computer
5. **Wasserkocher** -> wako
6. **Test**' -> test

- Die Datenpunkte zur Anzeige in VIS werden automatisch standardmaessig unter "0_userdata.0.Verbrauch." angelegt.

# Changelog

#### 09.09.2020 (V 1.0.1)
- (Steffen Feldkamp)
  - debug Einträge entfernt

#### 09.09.2020 (V 1.0)
- (Steffen Feldkamp)
  - Version stable

#### 06.09.2020 (V 0.4.2)
- (Steffen Feldkamp)
  - Fehler, dass zu viele Log Meldungen angezeigt werden, behoben

#### 02.09.2020 (V 0.4.1)
- (Steffen Feldkamp)
  - Fehler behoben, dass getObject einen log Fehler ausgibt, wenn autoOff = false
  - Erkennunsgenauigkeit der Geräte etwas verbessert
  - Fehler behoben, dass Geräte nicht immer ausgeschaltet werden

#### 02.09.2020 (V 0.4)
- (Steffen Feldkamp)
  - automatisches Ausschalten von Aktoren nach Beendigung des Vorgangs implementiert
  - manual angepasst

#### 02.09.2020 (V 0.3)
- (Steffen Feldkamp)
  - Laufzeit eingefuegt
  - kleine Optimierungen eingefuegt bei if()-Abfragen
  - Whatsapp Benachrichtung eingefuegt

#### 02.09.2020 (V 0.2)
- (Steffen Feldkamp)
  - Fehler in der Berechnung, sowie kleinere Fehler behoben

#### 01.09.2020 (V 0.1)
- (Steffen Feldkamp)
  - Bugfixes und änderung der Objekterstellung

#### 01.09.2020 (V 0.0.1)
- (Steffen Feldkamp)
  - initial release

# License
MIT License

Copyright (c) 2020 Steffen Feldkamp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
