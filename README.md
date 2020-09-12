# js.device-reminder: Überwachungsscript für ioBroker (Version 1.2.1)
Dies ist ein Script zur Ermittlung und Auswertung von beliebig vielen elektrischen Verbrauchen, die mittels Schalt-Mess-Aktoren in ioBroker überwacht werden. Bei Erreichen des Start oder Endzustandes kann man sich zusätzlich benachrichtigen lassen.

# Was sollte beachtet werden?
Der refresh Intervall vom "Verbrauchswert(heißt bei den meisten Geräten "energy")" sollte nicht mehr als 10 Sekunden betragen, da es sonst zu sehr stark verzögerten Meldungen kommen kann.
Befehl in der Tasmota Konsole : TelePeriod 10 <br>
**Wichtig** Solltet ihr von einer Version **kleiner 1.2.x** kommen: Bevor das Script geladen wird, unter **0_userdata.0.Verbrauch.** schauen, ob der Ordner "Verbrauch" bereits vorhanden ist. Wenn ja, diesen unbedingt löschen und danach das Script starten!

# Welche Geräte können zur Zeit überwacht werden?
- Waschmaschine,
- Trockner,
- Geschirrspüler,
- Wasserkocher,
- Computer,
- Test -> falls man ein Gerät testen möchte, welches nicht in der oben genannten Liste auftaucht <br>
<br>
- weitere werden folgen ...<br>

# Was ist pro Gerät möglich?
- Benachrichtigung beim Gerätestart
- Benachrichtigung beim Vorgangsende des jeweiligen Gerätestart 
- Telegram-Benachrichtigung (mehrere IDs sind möglich) 
- Alexa-Benachrichtigung (mehrere IDs sind möglich) 
- WhatsApp-Benachrichtung 
- Geräte bei Bedarf abschalten, wenn Vorgang beendet erkannt wurde<br>

# Anleitung
## Script erstellen und Benutzereingaben anpassen
1. Ein neues JS Script in iobroker erstellen und das Script aus "script-device-reminder-1-2-x.js" kopieren und einfügen. <br>

  ![erstellung1.jpg](/admin/erstellung1.jpg)
  ![erstellung2jpg](/admin/erstellung2.jpg)<br>

### Eigenes Gerät hinzufügen
2. Die gewünschten Geräte hinzufügen wie im folgenden beschrieben:<br>
  ![erstellung3jpg](/admin/erstellung3.jpg)
  - **'Gerät anlegen'** alles zwischen **/*von hier*/** bis **/*bis hier kopieren*/** kopieren und erneut einfügen. Dies muss für jedes Gerät durchgeführt werden.
  - **'geraeteName'** kann durch einen beliebigen Namen ersetzt werden
  - **'geraeteTyp'** hier muss ein Gerätetyp aus der Liste unten ausgewählt werden
  - **'currentConsumption'** Hier muss der DP ausgewaehlt werden, welcher den Verbrauch misst
  - **'switchPower'** Hier wird der Switch ausgewaehlt, der das Geraet AN/AUS schaltet
  - **'autoOff'** hier kann für das jeweilige Gerät aktiviert werden, ob es nach 
  - **'startActive'** true = Nachricht bei Gerätestart aktiv, false = inaktiv
  - **'startMessage'** individuelle Startnachricht für das Gerät festlegen
  - **'endActive'** true = Nachricht bei Geräteende aktiv, false = inaktiv
  - **'endMessage'** individuelle Endnachricht für das Gerät festlegen
  - **'telegram'** true = telegram aktiv, false = inaktiv
  - **'telegramUser'** ["Name","Name 2"] **Wichtig:** nur existierende Namen verwenden!
  - **'alexa'** true = alexa aktiv, false = inaktiv
  - **'alexaID'** ["DF56GFDDS15FD15G", "DF56GFDD5DS4F565G"] **Wichtig:** nur existierende IDs verwenden!
    ![erstellung4jpg](/admin/erstellung4.jpg)
  - **'whatsapp'** true = whatsapp aktiv, false = inaktiv
  - **'whatsappID'** ["+4901234567890", "+490123626490"] **Wichtig:** nur existierende Nummern verwenden!<br>
<br>

- Liste aktuell verfügbarer Gerätetypen (es muss das kürzel eingefügt werden, zb. wama):
1. **Trockner** -> dryer
2. **Waschmaschine** -> wama
3. **Geschirrspueler** -> diwa
4. **Computer** -> computer
5. **Wasserkocher** -> wako
6. **Test**' -> test <br>

# eigenes Gerät erstellen
Möchte man sich selber ein Gerät konfigurieren, bitte hier weiterlesen: <br>
  Gerätetyp "test" nutzen : <br>

  ![eigenesObjekt.jpg](/admin/eigenesObjekt.jpg) <br>

  entscheidend sind hier die 4 Zahlen in dem roten Kasten:
  1. Schwelle **Startwert**, der überschritten werden muss um **"Gerät gestartet"** zu erkennen
  2. Schwelle **Endwert**, der unterschritten werden muss um **"Gerät fertig"** zu erkennen
  3. Anzahl Werte die aufgezeichnet werden, bevor **"Gerät gestartet"** ermittelt wird. Dies dient, um Spitzen oder Schwankungen bei den Werten abzufangen und beugt Falschmeldungen vor.
  4. Anzahl Werte die aufgezeichnet werden, bevor **"Gerät fertig"** ermittelt wird. Bei Geräten die große Schwankungen im Verbrauch haben, sollte dieser Wert nicht zu gering gewählt werden!

# Datenpunkte für weitere Verwendungen
- Die Datenpunkte zur Anzeige in VIS werden automatisch standardmaessig unter "0_userdata.0.Verbrauch." angelegt. <br>
  ![objekteVIS.jpg](/admin/objekteVIS.jpg) <br>

# Script-Updates einspielen
- Solltet ihr auf eine neue Version des Scriptes updaten wollen, so braucht ihr -wenn nicht anders angegeben- nur den Teil ab <u>**"Bei updates muss erst ab hier kopiert und eingefügt werden, somit braucht man seine Geräteliste nicht jedes mal neu erstellen"**</u> kopieren und neu einfügen. So muss nicht jedes Mal der komplette Gerätepart oben neu angelegt werden.


# Changelog
#### 12.09.2020 (V 1.2.1)
- (Steffen Feldkamp)
  - bugfix bei Zustand der einzelnen Schalter

#### 12.09.2020 (V 1.2.0)
- (Steffen Feldkamp)
  - jedes Gerät ist nun komplett frei konfigurierbar
  - readme angepasst und erweitert

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

Copyright (c) 2020 Steffen Feldkamp<br>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br>

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br>

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.<br>
