// Script zur Verbrauchsueberwachung von elektrischen Geraeten ueber ioBroker
const version = "version 0.4.2 beta, 20.08.2020, letztes update 06.09.2020, 16:30 Uhr, S Feldkamp auf Stand 0.4.2";
const erstellt = "s. feldkamp"

/* Changelog
Version 0.0.1
-Script erstellt

Version 0.1
-erste Tests und buxfixes
-alexa und telegram hinzugefuegt
-bugfixes
-berechnung fuer Geraete eingefuegt und timeout entfernt
-unterschiedliche Telegramnutzer sind nun moeglich
-mehrere Alexa IDs sind nun moeglich
-objekterstellung ueberarbeitet und feste Werte hinzugefuegt
-Berechnung wurde nochmals ueberarbeitet
-Berechnung fuer den Startwert eingefuegt
-Auswertung und objekterstellung ueberarbeitet

Version 0.2
-Fehler in der Berechnung behoben
-kleinere Fehler behoben

Version 0.3
- Laufzeit eingefuegt
- kleine Optimierungen eingefuegt bei if()-Abfragen

Version 0.3.1
- Whatsapp Benachrichtung eingefuegt
- objekterstellung angepasst, states werden nun vorher auf Vorhandensein geprueft
- logmeldungen eingefuegt, wenn states fehlen und erstellt werden

Version 0.4.0
- automatisches Ausschalten von Aktoren nach Beendigung des Vorgangs implementiert
- Berechnung für StartCalc angepasst

Version 0.4.1
- Fehler behoben, dass getObject einen log Fehler ausgibt, wenn autoOff = false
- Erkennunsgenauigkeit der Geräte etwas verbessert
- Fehler behoben, dass Geräte nicht immer ausgeschaltet werden

Version 0.4.2
- Fehler, dass zu viele Log Meldungen angezeigt werden, behoben

*****************************************************
**************** Benutzereingaben  ******************
****************************************************/

// Für weitere Hinweise zum Anlegen eines Gerätes bitte die readme lesen !

let standardPfad ="0_userdata.0.Verbrauch."; // kann angepasst werden, standardPfad ist 0_userdata.0.Verbrauch.
let startNachricht = true; // Nachricht bei Geraetestart erhalten?
let endeNachricht = true; // Nachricht bei Geraetevorgang ende erhalten?
let telegram = false; // Nachricht per Telegram?
let arrTelegramUser =["", "", ""] // hier koennen die Empfaenger eingegeben werden. einfach den namen zwischen "" einegeben und mit "," trennen
let alexa = false; // Nachricht per Alexa?
let arrAlexaID = ["ID1", "", ""]; // ID´s von Alexa eingeben -> nicht vergessen alexa eine Zeile höher auf true zu ändern!
let whatsapp = false; // Nachricht per WhatsApp?
let startText = "folgendes Geraet wurde gestartet: "; // Nachricht START
let endText = "folgendes Geraet hat den Vorgang beendet: "; // Nachricht ENDE

let arrGeraeteInput = [
  {geraeteName:"Trockner", geraeteTyp: "dryer", autoOff: false, energyMessure: 'linkeddevices.0.Plugs.Innen.HWR.Trockner.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.HWR.Trockner.POWER'},
  //{geraeteName:"Test", geraeteTyp: "test", autoOff: true, energyMessure: "0_userdata.0.Verbrauch.Test.testWert", energyPower: "linkeddevices.0.Shelly.Innen.Licht.Schlafzimmer.Switch"},
]

/****************************************************
*** ab hier darf nichts mehr geaendert werden !!! ***
****************************************************/

// var erzeuegen
let userTelegram = "";
let entwickler = false;

// array erzeugen
let arrGeraete = [];
let arrUsedAlexaIDs = [];

console.debug(version);
console.debug(erstellt);

//Klasse erstellen
class Geraet {
  constructor(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, startValue, endValue, startCount, endCount){
    // Attribute
    // Vorgaben
    // DPs
    this.geraeteName = obj.geraeteName ;
    this.energyMessure = obj.energyMessure;
    this.energyPower = obj.energyPower;
    // script intern
    this.pfadZustand = zustand;
    this.pfadDebug = stateDebug;
    this.pfadVerbrauchLive = verbrauchAktuell;
    this.pfadZustandSchalter = zustandSchalter;
    // Strings
    this.geraeteTyp = obj.geraeteTyp;
    this.einheit = "Watt";
    this.startnachrichtText = startText +  obj.geraeteName ;
    this.endenachrichtText = endText + obj.geraeteName ;
    this.pfadAlexa = "" ;
    // boolean
    this.startnachrichtVersendet = false;
    this.endenachrichtVersendet = false;
    this.gestartet = false;
    this.autoOff = obj.autoOff;
    // boolean Benutzervorgaben
    this.startnachricht = startNachricht;
    this.endenachricht = endeNachricht;
    this.telegram = telegram;
    this.whatsapp = whatsapp;
    this.alexa = alexa;
    // number
    this.verbrauch = null;
    this.resultStart = null;
    this.resultEnd = null;
    // Verbrauchswerte
    this.startValue = startValue;
    this.endValue = endValue;
    // Zaehler Abbruchbedingungen
    this.startCount = startCount;
    this.endCount = endCount;
    // timeout
    this.timeout = null;
    this.startZeit = 0;
    this.endZeit = 0;
    this.gesamtZeit = laufzeit;
    // array
    this.arrStart = [];
    this.arrAbbruch = [];
    // Methode
  };
};

// Objekte erstellen
arrGeraeteInput.forEach(function (obj) {  // array mit objekten aus class erstellen
  //DPs erstellen
  let zustand = (standardPfad + obj.geraeteName + ".Zustand");
  let verbrauchAktuell = (standardPfad + obj.geraeteName + ".Verbrauch aktuell");
  let stateDebug = (standardPfad + obj.geraeteName + ".stateDebug");
  let laufzeit = (standardPfad + obj.geraeteName + ".Laufzeit");
  let zustandSchalter = (standardPfad + obj.geraeteName + ".Zustand Schalter");
  if(!getObject(zustand)) {
    createState(zustand, "initialisiere Zustand", JSON.parse('{"type":"string"}'), function () {
    });
    console.log(zustand + " wurde angelegt");
  };
  if(!getObject(verbrauchAktuell)) {
    createState(verbrauchAktuell, 0.0, JSON.parse('{"type":"string"}'), function () {
    });
    console.log(verbrauchAktuell + " wurde angelegt");
  };
  if(!getObject(stateDebug)) {
    createState(stateDebug, 0.0, JSON.parse('{"type":"number"}'), function () {
    });
    console.log(stateDebug + " wurde angelegt");
  };
  if(!getObject(laufzeit)) {
    createState(laufzeit, "00:00:00" , JSON.parse('{"type":"string"}'), function () {
    });
    console.log(laufzeit + " wurde angelegt");
  };
  if(!getObject(zustandSchalter)) {
    createState(zustandSchalter, JSON.parse('{"type":"boolean"}'), function () {
    });
    console.log(zustandSchalter + " wurde angelegt");
  };
  //falls vorhanden, aber Prg neu gestartet wird
  setState(zustand, "initialisiere Zustand", true);
  setState(stateDebug, 0.0, true);
  if (obj.autoOff) { // nur falls autoOff true ist, state holen
    setState(zustandSchalter, getState(obj.energyPower), true);
  };
  // Objekt bauen (obj, ... , startVal, endVal, startCount, endCount)
  console.debug(obj)
  switch (obj.geraeteTyp) {
    case 'wama':
    const WaMa = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 15, 5, 3, 65);
    arrGeraete.push(WaMa);
    break;
    case 'dryer':
    const Trockner = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 120, 10, 5, 60);
    arrGeraete.push(Trockner);
    break;
    case 'diwa':
    const GS = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 15, 4, 2, 120);
    arrGeraete.push(GS);
    break;
    case 'computer':
    const Computer = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 15, 5, 3, 10);
    arrGeraete.push(Computer);
    break;
    case 'wako':
    const WaKo = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 15, 5, 2, 2);
    arrGeraete.push(WaKo);
    break;
    case 'test':
    const Test = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, stateDebug, 50, 10, 3, 3);
    arrGeraete.push(Test);
    break;
    default:
    console.warn("Geraetename wurde nicht erkannt, bitte die Schreibweise ueberpruefen oder Geraet ist unbekannt")
    break;
  }
});

console.debug(arrGeraete);
userTelegramIni (arrTelegramUser); //Telegramuser erstellen
idAlexa (arrAlexaID);    // alexa IDs erstellen

// Auswertung
arrGeraete.forEach(function(obj, index, arr){
  let i = obj;
  let name = obj.geraeteName
  on({id: obj.energyMessure, change: "any"}, function (obj, index, arr) { //trigger auf obj.energyMessure
    let wertNeu = obj.state.val;
    let wertAlt = obj.oldState.val;
    i.verbrauch = wertNeu;
    console.debug(i.energyPower);
    //setState(i.energyPower, false);
    setState(i.pfadZustandSchalter, getState(i.energyPower),true);
    if (wertNeu > i.startValue && i.gestartet == false ) {
      i.startZeit = Date.now(); // Startzeit loggen
      calcStart (i, wertNeu); //Startwert berechnen und ueberpruefen
      if (i.resultStart > i.startValue && i.resultStart != null && i.arrStart.length >= i.startCount && i.gestartet == false) {
        i.gestartet = true; // Vorgang gestartet
        setState(i.pfadZustand, "gestartet" , true); // Status in DP schreiben
        if (i.startnachricht && !i.startnachrichtVersendet) { // Start Benachrichtigung aktiv?
          i.message = i.startnachrichtText; // Start Benachrichtigung aktiv
          message(i);
        };
        i.startnachrichtVersendet = true; // Startnachricht wurde versendet
        i.endenachrichtVersendet = false; // Ende Benachrichtigung freigeben
      } else if (i.resultStart < i.startValue && i.resultStart != null && i.arrStart.length >= i.startCount && i.gestartet == false) {
        i.gestartet = false; // Vorgang gestartet
        setState(i.pfadZustand, "Standby" , true); // Status in DP schreiben
      };
    } else if (wertNeu < (i.startCount/2) && i.arrStart.length != 0 && i.gestartet == false) { // Wert mind > i.startCount/2 & arrStart nicht leer und nicht gestartet, sonst "Abbruch"
      i.arrStart = []; // array wieder leeren
      console.debug("Startphase abgebrochen, array Start wieder geloescht");
      setState(i.pfadZustand, "ausgeschaltet" , true); // Status in DP schreiben
    };
    if (i.gestartet) { // wurde geraet gestartet?
      calcEnd (i, wertNeu); // endeberechnung durchfuehren
    };
    console.debug("Name: " + i.geraeteName + " Ergebnis ENDE: " + i.resultEnd + " Wert ENDE: " + i.endValue + " gestartet: " + i.gestartet + " Arraylength: " + i.arrAbbruch.length + " Zaehler Arr Ende: " + i.endCount)
    if (i.resultEnd > i.endValue && i.resultEnd != null && i.gestartet) { // Wert > endValue und Verbrauch lag 1x ueber startValue
      setState(i.pfadZustand, "in Betrieb" , true); // Status in DP schreiben
      time(i);
    } else if (i.resultEnd < i.endValue && i.resultEnd != null && i.gestartet && i.arrAbbruch.length >= (i.endCount / 2)) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
      i.gestartet = false; // vorgang beendet
      if (i.autoOff && i.energyPower) {
        setState(i.energyPower, false); // Geraet ausschalten, falls angewaehlt
        setState(i.pfadZustand, "ausgeschaltet" , true); // Status in DP schreiben
      } else {
        setState(i.pfadZustand, "Standy" , true); // Status in DP schreiben
      };
      i.endZeit = Date.now(); // ende Zeit loggen
      i.arrStart = []; // array wieder leeren
      i.arrAbbruch = []; // array wieder leeren
      if (i.endenachricht && !i.endenachrichtVersendet && i.startnachrichtVersendet ) {  // Ende Benachrichtigung aktiv?
        i.message = i.endenachrichtText; // Ende Benachrichtigung aktiv
        message(i);
      };
      i.endenachrichtVersendet = true;
      i.startnachrichtVersendet = false;
    };
    setState(i.pfadVerbrauchLive, wertNeu + " " + i.einheit, true);
  });
});

/****************************************************
************ functions and calculations  ************
****************************************************/

function calcStart (i, wertNeu) { // Calculate values ​​for operation "START"
  console.debug("Startwertberechnung wird fuer " + i.geraeteName + " ausgefuehrt")
  let zahl;
  let ergebnisTemp = 0;
  let debug = "";
  i.arrStart.push(wertNeu);
  // Berechnung durchfuehren
  for (let counter = 0; counter < i.arrStart.length; counter++) {
    zahl = parseFloat(i.arrStart[counter]);
    ergebnisTemp = ergebnisTemp + zahl;
  };
  // Ergebnis an obj uebergeben
  i.resultStart = Math.round((ergebnisTemp / parseFloat(i.arrStart.length)*10)/10);
  debug = i.resultStart;
  setState(i.pfadDebug, debug, true); // DEBUG!!
  console.debug("Array Start: " + i.arrStart)
  console.debug("Ergebnis " + i.geraeteName + ": " + i.resultStart + " " + i.einheit)
};

function calcEnd (i, wertNeu) { // Calculate values ​​for operation "END"
  console.debug("Endwertberechnung wird fuer " + i.geraeteName + " ausgefuehrt")
  let zahl;
  let ergebnisTemp = 0;
  let debug = "";
  i.arrAbbruch.push(wertNeu); //neuen Wert ins array schreiben
  // Berechnung durchfuehren
  for (let counter = 0; counter < i.arrAbbruch.length; counter++) {
    zahl = parseFloat(i.arrAbbruch[counter]);
    ergebnisTemp = ergebnisTemp + zahl;
  };
  // Ergebnis an obj uebergeben
  i.resultEnd = Math.round((ergebnisTemp / parseFloat(i.arrAbbruch.length)*10)/10);
  debug = i.resultEnd;
  setState(i.pfadDebug, debug, true); // DEBUG!!
  console.debug("Array Ende Laenge: " + i.arrAbbruch.length + ", endCounter: " + i.endCount)
  console.debug("Array Ende " + i.arrAbbruch)
  console.debug("Ergebnis " + i.geraeteName + ": " + i.resultEnd + " " + i.einheit)
  if (i.arrAbbruch.length > i.endCount) {
    i.arrAbbruch.shift();
  };
};

function time (i) {
  //Laufzeit berechnen
  let diff;
  let time = "00:00:00";
  let vergleichsZeit = Date.now();
  let startZeit = i.startZeit;
  diff = (vergleichsZeit - startZeit);
  time = formatDate(Math.round(diff),"hh:mm:ss");
  setState(i.gesamtZeit, time , true); // Status in DP schreiben
};

/****************************************************
************ Evaluation of the devices  *************
****************************************************/

function dryer (i) {

};

function wama (i) {

};

function diwa (i) {

};

function computer (i) {

};

function wako (i) {

};

function test (i) {

};

/****************************************************
*********** functions messenger services  ***********
****************************************************/

function userTelegramIni (arrTelegramUser) { // "user telegram" ermitteln
  let arrTemp = [];
  for (let counter = 0; counter < arrTelegramUser.length; counter++) {
    if (arrTelegramUser[counter] !== "" && arrTelegramUser[counter] !== null) {
      arrTemp.push(arrTelegramUser[counter]);
    };
  };
  userTelegram = arrTemp.join(',');
};

function idAlexa (arrAlexaID) { // Alexa message ausgeben
  let arrAlexaTemp = [];
  let stringTemp = "";
  for (let counter = 0; counter < arrAlexaID.length; counter++) {
    if (arrAlexaID[counter] !== "" && arrAlexaID[counter] !== null) {
      stringTemp = "alexa2.0.Echo-Devices." + arrAlexaID[counter] + ".Commands.announcement";
      arrAlexaTemp.push(stringTemp);
    };
  };
  arrUsedAlexaIDs = arrAlexaTemp;
};

function message (i) { // telegram nachricht versenden
  if (i.telegram) {
    sendTo("telegram", "send", {
      text: i.message,
      user: userTelegram
    });
  };
  if (i.whatsapp) { // WhatsApp nachricht versenden
    sendTo("whatsapp-cmb", "send", {
      text: i.message
    });
  };
  if (i.alexa) {    // alexa quatschen lassen
    for (let counter = 0; counter < arrUsedAlexaIDs.length; counter++) {
      setState(arrUsedAlexaIDs[counter], i.message);
    };
  };
};
