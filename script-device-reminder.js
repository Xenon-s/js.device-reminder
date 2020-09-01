// Script zur Verbrauchsueberwachung von elektrischen Geraeten ueber ioBroker
const version = "version 0.1 beta, 20.08.2020, letztes update 01.09.2020, 17 Uhr, S Feldkamp auf Stand 0.1";
const erstellt = "s. feldkamp"

/* Changelog
Version 0.0.1
Script erstellt

Version 0.1
erste Tests und buxfixes
alexa und telegram hinzugefuegt
bugfixes
berechnung fuer Geraete eingefuegt und timeout entfernt
unterschiedliche Telegramnutzer sind nun moeglich
mehrere Alexa IDs sind nun moeglich
objekterstellung ueberarbeitet und feste Werte hinzugefuegt
Berechnung wurde nochmals ueberarbeitet
Berechnung fuer den Startwert eingefuegt
Auswertung und objekterstellung ueberarbeitet

******************************************************************************************************************************************************

Dieses Script dient dazu, eine variable Anzahl an Geraeten zu ueberwachen und bei eintreten eines Ereignisses eine Meldung auszugeben.
In der Beta Phase muss man im array "Input" seine Geraete noch von Hand hinzufuegen, dass wird sich spaeter noch aendern. Dazu einfach die folgende Zeile kopieren
und in das arrGeraeteInput einfuegen.

{geraeteName:"GERAETENAME", energyMessure: 'DATENPUNKT VERBRAUCH', energyPower:'DATENPUNKT SWITCH ON/OFF'},

"GERAETENAME" kann durch einen beliebigen Namen ersetzt werden (keine Umlaute!)
'DATENPUNKT VERBRAUCH' Hier muss der DP ausgewaehlt werden, welcher den Verbrauch misst
'DATENPUNKT SWITCH ON/OFF' Hier wird der Switch ausgewaehlt, der das Geraet AN/AUS schaltet -> aktuell noch nicht implementiert

Die Datenpunkte zur Anzeige in VIS werden automatisch standardmaessig unter "0_userdata.0.Verbrauch." angelegt.

*/

// Benutzereingaben, koennen individuell angepasst werden
// standardpfad fuer zustandsausgabe
let standardPfad ="0_userdata.0.Verbrauch."; // kann angepasst werden
let startNachricht = true; // Nachricht bei Geraetestart erhalten?
let endeNachricht = true; // Nachricht bei Geraetevorgang ende erhalten?
let telegram = true; // Nachricht per Telegram?
let arrTelegramUser =["Steffen", "", ""] // hier koennen die Empfaenger eingegeben werden. einfach den namen zwischen "USER1" einegeben und mit "," trennen
let alexa = false; // Nachricht per Alexa?
let arrAlexaID = ["ID1", "ID2", "ID3"]; // ID von Alexa eingeben
let startText = "folgendes Geraet wurde gestartet: "; // Nachricht START
let endText = "folgendes Geraet hat den Vorgang beendet: "; // Nachricht ENDE


/* array INPUT -> muss zur Zeit noch von Hand angepasst werden
Der Name kann frei gewaehlt werden. Neu ist jedoch, dass man einen Geraetetyp auswaehlen muss.
"Trockner" -> dryer
"Waschmaschine" -> wama
"Geschirrspueler" -> diwa
"Computer" -> computer
"Wasserkocher" -> wako
"Test" -> test
Die Geraete werden spaeter ueber ein dropdown in einer html Liste ausgewaehlt, zur Zeit einfach haendisch ein/auskommentieren mit "//"

Es muss natuerlich weiterhin der energyMessure und der eneryPower angepasst werden,
wobei energyPower aktuell weiterhin nicht implentiert ist, dass kommt noch!
*/
let arrGeraeteInput = [
  {geraeteName:"Trockner", geraeteTyp: "dryer", energyMessure: 'linkeddevices.0.Plugs.Innen.HWR.Trockner.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.HWR.Trockner.POWER',},
  {geraeteName:"Waschmaschine", geraeteTyp: "wama", energyMessure: 'linkeddevices.0.Plugs.Innen.HWR.Waschmaschine.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.HWR.Waschmaschine.POWER'},
  {geraeteName:"Geschirrspüler", geraeteTyp: "diwa", energyMessure: 'linkeddevices.0.Plugs.Innen.Kueche.Geschirrspueler.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.Kueche.Geschirrspueler.POWER'},
  {geraeteName:"Computer", geraeteTyp: "computer", energyMessure: 'linkeddevices.0.Plugs.Innen.Buero.PC.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.Buero.PC.POWER'},
  //{geraeteName:"Wasserkocher", geraeteTyp: "wako", energyMessure: '', energyPower:''},
  {geraeteName:"Test", geraeteTyp: "test", energyMessure: "0_userdata.0.Verbrauch.Test.testWert"},
]

/*
*****************************************************
*****************************************************
*** ab hier darf nichts mehr geaendert werden !!! ***
*****************************************************
*****************************************************
*/

// var erzeuegen
let userTelegram = "";

// array erzeugen
let arrGeraete = [];
let arrUsedAlexaIDs = [];

//Klasse erstellen
class Geraet {
  constructor(obj, zustand, verbrauchAktuell, zustandSchalter, startValue, endValue, startCount, endCount){
    // Attribute
    // Vorgaben
    // DPs
    this.geraeteName = obj.geraeteName ;
    this.energyMessure = obj.energyMessure;
    this.energyPower = obj.energyPower;
    // Strings
    this.geraeteTyp = obj.geraeteTyp;
    this.einheit = "Watt";
    this.pfadZustand = zustand;
    this.pfadVerbrauchLive = verbrauchAktuell;
    this.startnachrichtText = startText +  obj.geraeteName ;
    this.endenachrichtText = endText + obj.geraeteName ;
    this.pfadAlexa = "" ;
    // boolean
    this.startnachrichtVersendet = false;
    this.endenachrichtVersendet = false;
    this.pfadZustandSchalter = false;
    this.gestartet = false;
    // boolean Benutzervorgaben
    this.startnachricht = startNachricht;
    this.endenachricht = endeNachricht;
    this.telegram = telegram;
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
    this.gesamtZeit = 0;
    // array
    this.arrStart = [];
    this.arrAbbruch = [];
    // Methode
  };
};

// Objekte erstellen
arrGeraeteInput.forEach (function (obj) {  // array mit objekten aus class erstellen
  //DPs erstellen
  let zustand = (standardPfad + obj.geraeteName + ".Zustand" )
  createState(zustand, "initialisiere Zustand", JSON.parse('{"type":"string"}'), function () {
  });
  let verbrauchAktuell = (standardPfad + obj.geraeteName + ".Verbrauch aktuell" )
  createState(verbrauchAktuell, 0.0, JSON.parse('{"type":"string"}'), function () {
  });
  let zustandSchalter = (standardPfad + obj.geraeteName + ".Zustand Schalter" )
  createState(zustandSchalter, false, JSON.parse('{"type":"boolean"}'), function () {
  });
  // Objekt bauen (obj, startVal, endVal, startCount, endCount)
  console.debug(obj)
  switch (obj.geraeteTyp) {
    case 'wama':
    const WaMa = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 30, 5, 2, 70);
    arrGeraete.push(WaMa);
    break;
    case 'dryer':
    const Trockner = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 120, 10, 3, 50);
    arrGeraete.push(Trockner);
    break;
    case 'diwa':
    const GS = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 20, 5, 2, 100);
    arrGeraete.push(GS);
    break;
    case 'computer':
    const Computer = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 20, 5, 2, 10);
    arrGeraete.push(Computer);
    break;
    case 'wako':
    const WaKo = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 10, 5, 1, 2);
    arrGeraete.push(WaKo);
    break;
    case 'test':
    const Test = new Geraet(obj, zustand, verbrauchAktuell, zustandSchalter, 5, 1, 2, 3);
    arrGeraete.push(Test);
    break;
    default:
    console.warn("Geraetename wurde nicht erkannt, bitte die Schreibweise ueberpruefen oder Geraet ist unbekannt")
    break;
  }
});

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
    console.debug(i);
    if (wertNeu > i.startValue && i.gestartet == false ) {
      console.debug("Start " + i.arrStart);
      console.debug("Ende" + i.arrAbbruch);
      calcStart (i, wertNeu) //Startwert berechnen und ueberpruefen
      if (i.resultStart > i.startValue && i.resultStart != null && i.arrStart.length >= i.startCount && i.gestartet == false) {
        i.gestartet = true; // Vorgang gestartet
        i.startZeit = (new Date().getTime()); // Startzeit loggen
        setState(i.pfadZustand, "in Betrieb" , true); // Status in DP schreiben
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
    };
    if (i.gestartet) { // wurde geraet gestartet?
      calcEnd (i, wertNeu); // endeberechnung durchfuehren
      console.debug(i.geraeteName + " Berechnung gestartet")
    };
    if (i.resultEnd > i.endValue && i.resultEnd != null && i.gestartet) { // Wert > endValue und Verbrauch lag 1x ueber startValue
      setState(i.pfadZustand, "in Betrieb" , true); // Status in DP schreiben
    } else if (i.resultEnd < i.endValue && i.resultEnd != null && i.gestartet && i.arrAbbruch.length >= i.endCount) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
      i.gestartet = false; // vorgang beendet
      setState(i.pfadZustand, "Standby" , true); // Status in DP schreiben
      i.endZeit = (new Date().getTime()); // ende Zeit loggen
      i.arrStart = []; // array wieder leeren
      i.arrAbbruch = []; // array wieder leeren
      if (i.endenachricht && !i.endenachrichtVersendet && i.startnachrichtVersendet ) {  // Ende Benachrichtigung aktiv?
        i.message = i.endenachrichtText; // Ende Benachrichtigung aktiv
        message(i);
      }
      i.endenachrichtVersendet = true;
      i.startnachrichtVersendet = false;
    };
    setState(i.pfadVerbrauchLive, wertNeu + " " + i.einheit, true);
  });
});

/*
*****************************************************
************ functions and calculations  ************
*****************************************************
*/

function calcStart (i, wertNeu) { // Calculate values ​​for operation "START"
  let zahl;
  let ergebnisTemp = 0;
  if (i.arrStart.length < i.startCount) {
    i.arrStart.push(wertNeu);
    console.debug("START " + "array von: " + i.geraeteName + " " + i.arrStart)
    console.debug(i.arrStart.length + " " + i.startCount)
  } else {
    for (let counter = 0; counter < i.arrStart.length; counter++) {
      zahl = parseFloat(i.arrStart[counter]);
      ergebnisTemp = ergebnisTemp + zahl;
    };
    i.arrStart.push(wertNeu);
    i.resultStart = Math.round((ergebnisTemp / parseFloat(i.arrStart.length)*10)/10);
    console.debug("Ergebnis " + i.geraeteName + ": " + i.resultStart + " " + i.einheit)
    i.arrStart.shift();
  };
};

function calcEnd (i, wertNeu) { // Calculate values ​​for operation "END"
  let zahl;
  let ergebnisTemp = 0;
  if (i.arrAbbruch.length < i.endCount) {
    i.arrAbbruch.push(wertNeu);
    console.debug("array von: " + i.geraeteName + " " + i.arrAbbruch);
    console.debug("ENDE array von: " + i.arrAbbruch.length + " " + i.endCount);
  } else {
    for (let counter = 0; counter < i.arrAbbruch.length; counter++) {
      zahl = parseFloat(i.arrAbbruch[counter]);
      ergebnisTemp = ergebnisTemp + zahl;
    };
    i.arrAbbruch.push(wertNeu);
    i.resultEnd = Math.round((ergebnisTemp / parseFloat(i.arrAbbruch.length)*10)/10);
    i.arrAbbruch.shift();
    console.debug(i.geraeteName + " " + i.arrAbbruch);
  };
};

function userTelegramIni (arrTelegramUser) { // "user telegram" ermitteln
  let arrTemp = [];
  for (let counter = 0; counter < arrTelegramUser.length; counter++) {
    if (arrTelegramUser[counter] !== "" && arrTelegramUser[counter] !== null) {
      arrTemp.push(arrTelegramUser[counter]);
    };
  };
  userTelegram = arrTemp.join(',');
  console.debug(userTelegram);
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
  console.debug(arrUsedAlexaIDs);
  if (i.telegram) {
    sendTo("telegram", "send", {
      text: i.message,
      user: userTelegram
    });
  };
  if (i.alexa) {    // alexa quatschen lassen
    for (let counter = 0; counter < arrUsedAlexaIDs.length; counter++) {
      console.debug()
      setState(arrUsedAlexaIDs[counter], i.message);
    };
  };
};
