// Script zur Verbrauchsueberwachung von elektrischen Geraeten ueber ioBroker
const version = "version 0.3.4 beta, 20.08.2020, letztes update 01.09.2020";
const erstellt = "s. feldkamp"

/* Changelog
Version 0.1 Script erstellt
Version 0.1.5 erste Tests und buxfixes
Version 0.2.0 alexa und telegram hinzugefuegt
Version 0.2.1 bugfixes
Version 0.3.0 berechnung fuer Geraete eingefuegt und timeout entfernt
Version 0.3.1 unterschiedliche Telegramnutzer sind nun moeglich
Version 0.3.2 mehrere Alexa IDs sind nun moeglich
Version 0.3.3 objekterstellung ueberarbeitet und feste Werte hinzugefuegt
Version 0.3.4 Berechnung wurde nochmals ueberarbeitet
Version 0.4.0 Berechnung fuer den Startwert eingefuegt

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
*/
let arrGeraeteInput = [
  //{geraeteName:"Trockner", energyMessure: 'linkeddevices.0.Plugs.Innen.HWR.Trockner.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.HWR.Trockner.POWER',},
  //{geraeteName:"Waschmaschine", energyMessure: 'linkeddevices.0.Plugs.Innen.HWR.Waschmaschine.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.HWR.Waschmaschine.POWER'},
  //{geraeteName:"Geschirrspueler", energyMessure: 'linkeddevices.0.Plugs.Innen.Kueche.Geschirrspueler.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.Kueche.Geschirrspueler.POWER'},
  {geraeteName:"Computer", energyMessure: 'linkeddevices.0.Plugs.Innen.Buero.PC.ENERGY_Power', energyPower:'linkeddevices.0.Plugs.Innen.Buero.PC.POWER'},
  //{geraeteName:"Wasserkocher", energyMessure: '', energyPower:''},
  {geraeteName:"Test", energyMessure: "0_userdata.0.Verbrauch.Test.testWert"},
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
  constructor(obj, typ, startValue, endValue, startCount, endCount){
    // Attribute
    // Vorgaben
    // DPs
    this.geraeteName = obj.geraeteName ;
    this.energyMessure = obj.energyMessure;
    this.energyPower = obj.energyPower;
    // Strings
    this.einheit = "Watt";
    this.pfadZustand = "";
    this.pfadVerbrauchLive = "";
    this.startnachrichtText = "folgendes Geraet wurde gestartet: " +  typ ;
    this.endenachrichtText = "folgendes Geraet hat den Vorgang beendet: " + typ ;
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
    this.verbrauch = 0;
    this.gestartet = 0;
    this.resultStart = 0;
    this.resultEnd = 0;
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

arrGeraeteInput.forEach (function (obj) {  // array mit objekten aus class erstellen
  let objekt;
  let i = obj;
  // Objekt bauen (obj, name, startVal, endVal, startCount, endCount)
  switch (i.geraeteName) {
    case 'Waschmaschine':
    const WaMa = new Geraet(obj, i.geraeteName, 30, 5, 2, 70);
    arrGeraete.push(WaMa);
    break;
    case 'Trockner':
    const Trockner = new Geraet(obj, i.geraeteName, 120, 10, 3, 50);
    arrGeraete.push(Trockner);
    break;
    case 'Geschirrspueler':
    const GS = new Geraet(obj, unescape("Geschirrsp%FCler%0A"), 20, 5, 2, 100);
    arrGeraete.push(GS);
    break;
    case 'Computer':
    const Computer = new Geraet(obj, i.geraeteName, 20, 5, 2, 10);
    arrGeraete.push(Computer);
    break;
    case 'Wasserkocher':
    const WaKo = new Geraet(obj, i.geraeteName, 10, 5, 1, 2);
    arrGeraete.push(WaKo);
    break;
    case 'Test':
    const Test = new Geraet(obj, unescape("T%E4st%0A"), 5, 1, 1, 10);
    arrGeraete.push(Test);
    break;
    default:
    console.warn("Geraetename wurde nicht erkannt, bitte die Schreibweise ueberpruefen oder Geraet ist unbekannt")
    break;
  }
});

// Dps erstellen
arrGeraeteInput.forEach(function(obj, index){
  let i = (standardPfad + obj.geraeteName + ".Zustand" )
  createState(i, "initialisiere Zustand", JSON.parse('{"type":"string"}'), function () {
  });
  let j = (standardPfad + obj.geraeteName + ".Verbrauch aktuell" )
  createState(j, 0.0, JSON.parse('{"type":"string"}'), function () {
  });
  let k = (standardPfad + obj.geraeteName + ".Zustand Schalter" )
  createState(k, false, JSON.parse('{"type":"boolean"}'), function () {
  });
  arrGeraete[index].pfadZustand = i;
  arrGeraete[index].pfadVerbrauchLive = j;
  arrGeraete[index].pfadZustandSchalter = k;
});

userTelegramIni (arrTelegramUser); //Telegramuser erstellen
idAlexa (arrAlexaID);    // alexa IDs erstellen

// Auswertung
arrGeraete.forEach(function(obj, index, arr){
  let i = obj;
  let j = index;
  let name = obj.geraeteName
  on({id: obj.energyMessure, change: "any"}, function (obj, index, arr) { //trigger auf obj.energyMessure
    let wertNeu = obj.state.val;
    let wertAlt = obj.oldState.val;
    arrGeraete[j].verbrauch = wertNeu;
    if (wertNeu > i.startValue && i.gestartet == 0 ) {
      calcStart (i, wertNeu) //Startwert berechnen und ueberpruefen
      if (i.resultStart > i.startValue) {
        i.gestartet = 1; // Vorgang gestartet
        i.startZeit = (new Date().getTime()); // Startzeit loggen
        if (i.startnachricht && !i.startnachrichtVersendet) { // Start Benachrichtigung aktiv?
          i.message = i.startnachrichtText; // Start Benachrichtigung aktiv
          message(i);
        };
        i.startnachrichtVersendet = true; // Startnachricht wurde versendet
        i.endenachrichtVersendet = false; // Ende Benachrichtigung freigeben
      }
    };
    if (i.gestartet) {
      calcEnd (i, wertNeu);
      console.debug(i.geraeteName + " Berechnung gestartet")
    };
    if (wertNeu > i.endValue && i.gestartet) { // Wert > endValue und Verbrauch lag 1x ueber startValue
      setState(arrGeraete[j].pfadZustand, "in Betrieb" , true); // Status in DP schreiben
    } else if (i.gestartet && i.arrAbbruch.length >= i.endCount && i.resultEnd < i.endValue ) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
      i.gestartet = 0; // vorgang beendet
      setState(arrGeraete[j].pfadZustand, "Vorgang beendet / standby" , true); // Status in DP schreiben
      i.endZeit = (new Date().getTime()); // ende Zeit loggen
      if (i.endenachricht && !i.endenachrichtVersendet && i.startnachrichtVersendet ) {  // Ende Benachrichtigung aktiv?
        i.message = i.endenachrichtText; // Ende Benachrichtigung aktiv
        message(i);
      }
      i.endenachrichtVersendet = true;
      i.startnachrichtVersendet = false;
    } else if (!i.gestartet) {
      setState(arrGeraete[j].pfadZustand, "Vorgang beendet / standby" , true);
      i.arrAbbruch = []; // array wieder leeren
    }
    setState(arrGeraete[j].pfadVerbrauchLive, wertNeu + " " + i.einheit, true);
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
    console.debug("array von: " + i.geraeteName + " " + i.arrStart)
  } else {
    for (let counter = 0; counter < i.arrStart.length; counter++) {
      zahl = parseFloat(i.arrStart[counter]);
      ergebnisTemp = ergebnisTemp + zahl;
    };
    i.resultStart = Math.round((ergebnisTemp / parseFloat(i.arrStart.length)*10)/10);
    i.arrStart.shift() + i.arrStart.push(wertNeu)
    console.debug("Ergebnis " + i.geraeteName + ": " + i.resultStart + " " + i.einheit)
  };
};

function calcEnd (i, wertNeu) { // Calculate values ​​for operation "END"
  let zahl;
  let ergebnisTemp = 0;
  if (i.arrAbbruch.length < i.endCount) {
    i.arrAbbruch.push(wertNeu);
    console.debug("array von: " + i.geraeteName + " " + i.arrAbbruch)
  } else {
    for (let counter = 0; counter < i.arrAbbruch.length; counter++) {
      zahl = parseFloat(i.arrAbbruch[counter]);
      ergebnisTemp = ergebnisTemp + zahl;
    };
    i.resultEnd = Math.round((ergebnisTemp / parseFloat(i.arrAbbruch.length)*10)/10);
    i.arrAbbruch.shift() + i.arrAbbruch.push(wertNeu)
    console.debug("Ergebnis " + i.geraeteName + ": " + i.resultEnd + " " + i.einheit)
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
