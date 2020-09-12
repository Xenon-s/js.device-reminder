// Script zur Verbrauchsueberwachung von elektrischen Geraeten ueber ioBroker
const version = "version 1.2.1, letztes update 12.09.2020, 15:30 Uhr, S Feldkamp auf Stand 1.2.1";
const erstellt = "s. feldkamp"

/****************************************************
**************** Benutzereingaben  ******************
****************************************************/

/* Bitte unbedingt die readme lesen!! */

const standardPfad = "0_userdata.0.Verbrauch."; // kann angepasst werden, standardPfad ist 0_userdata.0.VerbrauchV2.

const arrGeraeteInput = [
    /*Gerätebezeichnung und Typ*/
    /* von hier*/
    {
        geraeteName: "Test",                                    // Gerätename
        geraeteTyp: "test",                                     // Gerätetyp
        /*Datenpunkte*/
        currentConsumption: '0_userdata.0.Testwert',            // DP aktueller Verbrauch 
        switchPower: '0_userdata.0.virtueller_Taster',          // DP switch on/off
        /*Benutzervorgaben*/
        autoOff: true,                                          // abschalten, nach Ende?
        startActive: true,                                      // Startnachricht senden?
        startMessage: 'Test wurde gestartet',                   // startnachricht
        endActive: true,                                        // Endnachricht senden?
        endMessage: 'Gerät ist fertig',                         // endnachricht
        telegram: true,                                         // telegram aktivieren ?
        telegramUser: ["Name","Name 2"],                        // telegram User (Wichtig: Nur tatsächlich existierende Namen eintragen, keine Leerfelder)
        alexa: false,                           // alexa aktiv?
        alexaID: ["DF56GFDDS15FD15G"],          // alexa IDs (Wichtig: Nur tatsächlich existierende IDs eintragen, keine Leerfelder)
        whatsapp: false,                        // whatsapp aktivieren?
        whatsappID: ["+4901234567890"]          // whatsapp IDs (Wichtig: Nur tatsächlich existierende Nummern eintragen, keine Leerfelder)
    },
    /*bis hier kopieren*/
];


/* Bei updates muss erst ab hier kopiert und einegfügt werden, somit braucht man seine Geräteliste nicht jedes mal neu erstellen*/

// array erzeugen
const arrGeraete = [];

//Klasse erstellen
class Geraet {
    constructor(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, startValue, endValue, startCount, endCount) {
        // Attribute
        // Vorgaben
        // DPs
        this.currentConsumption = obj.currentConsumption;
        this.switchPower = obj.switchPower;
        // script intern
        this.pfadZustand = zustand;
        this.pfadVerbrauchLive = verbrauchAktuell;
        this.pfadZustandSchalter = zustandSchalter;
        // Strings
        this.geraeteName = obj.geraeteName;
        this.geraeteTyp = obj.geraeteTyp;
        this.startnachrichtText = obj.startMessage;
        this.endenachrichtText = obj.endMessage;
        this.einheit = "Watt";
        // boolean
        this.startnachrichtVersendet = false;
        this.endenachrichtVersendet = false;
        this.gestartet = false;
        // boolean Benutzervorgaben
        this.startnachricht = obj.startActive;
        this.endenachricht = obj.endActive;
        this.telegram = obj.telegram;
        this.whatsapp = obj.whatsapp;
        this.alexa = obj.alexa;
        this.autoOff = obj.autoOff;
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

        // Methoden
        if (obj.telegram) {
            console.debug("telegram true");
            this.telegramUser = userTelegramIni(obj);
        };

        if (obj.alexa) {
            console.debug("alexa true");
            this.alexaID = idAlexa(obj);
        };

        if (obj.whatsapp) {
            console.debug("whatsapp true");
            this.whatsappID = idWhatsapp(obj);
        };

    };
};

// Objekte erstellen
arrGeraeteInput.forEach(function (obj) {  // array mit objekten aus class erstellen
    //DPs erstellen
    let zustand = (standardPfad + obj.geraeteName + ".Zustand");
    let verbrauchAktuell = (standardPfad + obj.geraeteName + ".Verbrauch aktuell");
    let laufzeit = (standardPfad + obj.geraeteName + ".Laufzeit");
    let zustandSchalter = (standardPfad + obj.geraeteName + ".Zustand Schalter");
    if (!getObject(zustand)) {
        createState(zustand, "initialisiere Zustand", JSON.parse('{"type":"string"}'), function () {
        });
        console.debug(zustand + " wurde angelegt");
    };
    if (!getObject(verbrauchAktuell)) {
        createState(verbrauchAktuell, 0.0, JSON.parse('{"type":"string"}'), function () {
        });
        console.debug(verbrauchAktuell + " wurde angelegt");
    };
    if (!getObject(laufzeit)) {
        createState(laufzeit, "00:00:00", JSON.parse('{"type":"string"}'), function () {
        });
        console.debug(laufzeit + " wurde angelegt");
    };
    if (!getObject(zustandSchalter)) {
        createState(zustandSchalter, JSON.parse('{"type":"boolean"}'), function () {
        });
        console.debug(zustandSchalter + " wurde angelegt");
    };
    //falls vorhanden, aber Prg neu gestartet wird
    setState(zustandSchalter, getState(obj.switchPower).val, true);
    if (!getState(obj.switchPower).val) {
        setState(zustand, "ausgeschaltet", true);
    } else {
        setState(zustand, "initialisiere Zustand", true);
    };

    // Objekt bauen (obj, ... , startVal, endVal, startCount, endCount)
    console.debug(obj)
    switch (obj.geraeteTyp) {
        case 'wama':
            const WaMa = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 15, 5, 3, 65);
            arrGeraete.push(WaMa);
            break;
        case 'dryer':
            const Trockner = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 120, 10, 5, 60);
            arrGeraete.push(Trockner);
            break;
        case 'diwa':
            const GS = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 15, 4, 2, 120);
            arrGeraete.push(GS);
            break;
        case 'computer':
            const Computer = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 15, 5, 3, 10);
            arrGeraete.push(Computer);
            break;
        case 'wako':
            const WaKo = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 15, 5, 2, 2);
            arrGeraete.push(WaKo);
            break;
        case 'test':
            const Test = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, zustandSchalter, 50, 10, 3, 3);
            arrGeraete.push(Test);
            break;
        default:
            console.warn("Geraetename wurde nicht erkannt, bitte die Schreibweise ueberpruefen oder Geraet ist unbekannt")
            break;
    };
});

console.debug(arrGeraete);

// Auswertung
arrGeraete.forEach(function (obj, index, arr) {
    let i = obj;
    let name = obj.geraeteName
    on({ id: obj.currentConsumption, change: "any" }, function (obj, index, arr) { //trigger auf obj.currentConsumption
        let wertNeu = obj.state.val;
        let wertAlt = obj.oldState.val;
        i.verbrauch = wertNeu;
        console.debug("Wert Verbrauch START: " + i.resultStart);
        //setState(i.switchPower, false);
        setState(i.pfadZustandSchalter, getState(i.switchPower), true);
        if (wertNeu > i.startValue && i.gestartet == false) {
            i.startZeit = Date.now(); // Startzeit loggen
            calcStart(i, wertNeu); //Startwert berechnen und ueberpruefen
            if (i.resultStart > i.startValue && i.resultStart != null && i.arrStart.length >= i.startCount && i.gestartet == false) {
                i.gestartet = true; // Vorgang gestartet
                setState(i.pfadZustand, "gestartet", true); // Status in DP schreiben
                if (i.startnachricht && !i.startnachrichtVersendet) { // Start Benachrichtigung aktiv?
                    i.message = i.startnachrichtText; // Start Benachrichtigung aktiv
                    message(i);
                };
                i.startnachrichtVersendet = true; // Startnachricht wurde versendet
                i.endenachrichtVersendet = false; // Ende Benachrichtigung freigeben
            } else if (i.resultStart < i.startValue && i.resultStart != null && i.arrStart.length >= i.startCount && i.gestartet == false) {
                i.gestartet = false; // Vorgang gestartet
                setState(i.pfadZustand, "Standby", true); // Status in DP schreiben
            };
        } else if (wertNeu < (i.startCount / 2) && i.arrStart.length != 0 && i.gestartet == false) { // Wert mind > i.startCount/2 & arrStart nicht leer und nicht gestartet, sonst "Abbruch"
            i.arrStart = []; // array wieder leeren
            console.debug("Startphase abgebrochen, array Start wieder geloescht");
            setState(i.pfadZustand, "ausgeschaltet", true); // Status in DP schreiben
        };
        if (i.gestartet) { // wurde geraet gestartet?
            calcEnd(i, wertNeu); // endeberechnung durchfuehren
        };
        console.debug("in Betrieb? Name: " + i.geraeteName + " Ergebnis ENDE: " + i.resultEnd + " Wert ENDE: " + i.endValue + " gestartet: " + i.gestartet + " Arraylength: " + i.arrAbbruch.length + " Zaehler Arr Ende: " + i.endCount)
        if (i.resultEnd > i.endValue && i.resultEnd != null && i.gestartet) { // Wert > endValue und Verbrauch lag 1x ueber startValue
            setState(i.pfadZustand, "in Betrieb", true); // Status in DP schreiben
            time(i);
        } else if (i.resultEnd < i.endValue && i.resultEnd != null && i.gestartet && i.arrAbbruch.length >= (i.endCount / 2)) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
            i.gestartet = false; // vorgang beendet
            if (i.autoOff && i.switchPower) {
                setState(i.switchPower, false); // Geraet ausschalten, falls angewaehlt
                setState(i.pfadZustand, "ausgeschaltet", true); // Status in DP schreiben
                setState(i.pfadZustandSchalter, getState(i.switchPower), true);
            } else {
                setState(i.pfadZustand, "Standby", true); // Status in DP schreiben
            };
            i.endZeit = Date.now(); // ende Zeit loggen
            i.arrStart = []; // array wieder leeren
            i.arrAbbruch = []; // array wieder leeren
            if (i.endenachricht && !i.endenachrichtVersendet && i.startnachrichtVersendet) {  // Ende Benachrichtigung aktiv?
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

function calcStart(i, wertNeu) { // Calculate values ​​for operation "START"
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
    i.resultStart = Math.round((ergebnisTemp / parseFloat(i.arrStart.length) * 10) / 10);
    debug = i.resultStart;
    console.debug("Array Start: " + i.arrStart)
    console.debug("Ergebnis START" + i.geraeteName + ": " + i.resultStart + " " + i.einheit)
};

function calcEnd(i, wertNeu) { // Calculate values ​​for operation "END"
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
    i.resultEnd = Math.round((ergebnisTemp / parseFloat(i.arrAbbruch.length) * 10) / 10);
    debug = i.resultEnd;
    console.debug("Array Ende Laenge: " + i.arrAbbruch.length + ", endCounter: " + i.endCount)
    console.debug("Array Ende " + i.arrAbbruch)
    console.debug("Ergebnis ENDE" + i.geraeteName + ": " + i.resultEnd + " " + i.einheit)
    if (i.arrAbbruch.length > i.endCount) {
        i.arrAbbruch.shift();
    };
};

function time(i) {
    //Laufzeit berechnen
    let diff;
    let time = "00:00:00";
    let vergleichsZeit = Date.now();
    let startZeit = i.startZeit;
    diff = (vergleichsZeit - startZeit);
    time = formatDate(Math.round(diff), "hh:mm:ss");
    setState(i.gesamtZeit, time, true); // Status in DP schreiben
};

/****************************************************
*********** functions messenger services  ***********
****************************************************/

function userTelegramIni(obj) { // "telegram IDs selektieren
    const arrTemp = [];
    let stringTemp;
    if (obj.telegram) {
        for (let counter = 0; counter < obj.telegramUser.length; counter++) {
            if (obj.telegramUser[counter] !== "" && obj.telegramUser[counter] !== null) {
                arrTemp.push(obj.telegramUser[counter]);
            };
        };
        stringTemp = arrTemp.join(',');
        return stringTemp;
    } else {
        return stringTemp;
    };
};

function idAlexa(obj) { // alexa IDs selektieren
    const arrTemp = [];
    let stringTemp = "";
    if (obj.alexa) {
        for (let counter = 0; counter < obj.alexaID.length; counter++) {
            if (obj.alexaID[counter] !== "" && obj.alexaID[counter] !== null) {
                stringTemp = "alexa2.0.Echo-Devices." + obj.alexaID[counter] + ".Commands.announcement";
                arrTemp.push(stringTemp);
            };
        };
        return arrTemp;
    } else {
        return arrTemp;
    };
};

function idWhatsapp(obj) { // whatsapp IDs selektieren
    const arrTemp = [];
    let stringTemp;
    if (obj.whatsapp) {
        for (let counter = 0; counter < obj.whatsappID.length; counter++) {
            if (obj.whatsappID[counter] !== "" && obj.whatsappID[counter] !== null) {
                arrTemp.push(obj.whatsappID[counter]);
            };
        };
        stringTemp = arrTemp.join(',');
        return stringTemp;
    } else {
        return stringTemp;
    };
};

function message(i) { // telegram nachricht versenden
    if (i.telegram) {
        sendTo("telegram", "send", {
            text: i.message,
            user: i.telegramUser
        });
    };
    if (i.whatsapp) { // WhatsApp nachricht versenden
        sendTo("whatsapp-cmb", "send", {
            text: i.message,
            phone: i.whatsappID
        });
    };
    if (i.alexa) {    // alexa quatschen lassen
        for (let counter = 0; counter < i.alexaID.length; counter++) {
            setState(i.alexaID[counter], i.message);
        };
    };
};


