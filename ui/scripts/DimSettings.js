/**
 * DimSettings.js
 * Gemeinsamer Zustand für das "Dim"-Feature (Abdunkeln nicht relevanter Elemente).
 *
 * Sowohl die Suche (SearchController) als auch der Metrik Controller
 * (MetricController) dimmen bei der Navigation den Hintergrund. Beide teilen
 * sich hier den Ein-/Aus-Schalter und die Transparenzstufen, damit die Anzeige
 * konsistent bleibt und jede Dim-Checkbox in der UI dasselbe steuert.
 */

var DimSettings = (function () {

    // Transparenz = 1 - Deckkraft. Wichtig: Der Hintergrund muss DEUTLICH
    // transparenter sein als die Treffer, sonst hebt sich das Ergebnis nicht ab.
    var TRANSPARENCY = {
        background: 0.75,  // nicht relevante Elemente (Deckkraft 0.25)
        inactiveHit: 0.0,  // gefundene, aber nicht aktive Elemente (voll deckend, sonst wirkt das helle Rot wie gedimmt)
        activeHit: 0.0     // aktuell im Navigator ausgewähltes Element
    };

    // Hervorhebungsfarben der Treffer. Das aktive Element bleibt Rot, die
    // übrigen Treffer ein helles Rot derselben Farbfamilie. Der Helligkeits-
    // unterschied zum aktiven Rot bleibt auch unter simulierter Protanopie,
    // Deuteranopie und Tritanopie deutlich; hellere bzw. dunklere Rottöne
    // kollidieren mit lokalen Interfaces, Mehrfachauswahl oder Klassendistrikten.
    var HIGHLIGHT_COLOR = {
        inactiveHit: "#ffb3b3", // gefundene, aber nicht aktive Elemente
        activeHit: "red"        // aktuell im Navigator ausgewähltes Element
    };

    var enabled = true;
    var listeners = [];

    function isEnabled() {
        return enabled;
    }

    function setEnabled(value) {
        var next = !!value;
        if (next === enabled) return;
        enabled = next;

        listeners.forEach(function (listener) {
            try {
                listener(enabled);
            } catch (e) {
                console.warn("DimSettings - listener failed", e);
            }
        });
    }

    /**
     * Registriert einen Callback, der bei jeder Änderung des Dim-Schalters
     * aufgerufen wird. Gibt eine Funktion zum Abmelden zurück.
     */
    function subscribe(listener) {
        if (typeof listener !== "function") return function () {};
        listeners.push(listener);
        return function () {
            var index = listeners.indexOf(listener);
            if (index !== -1) listeners.splice(index, 1);
        };
    }

    /**
     * Verdrahtet eine Checkbox mit dem gemeinsamen Zustand:
     * Klick -> Zustand ändern, Zustand ändert sich -> Checkbox nachziehen.
     * So bleiben mehrere Dim-Checkboxen (Suche, Metrik) synchron.
     */
    function bindCheckbox(checkbox) {
        if (!checkbox) return;

        checkbox.checked = enabled;
        checkbox.addEventListener("change", function () {
            setEnabled(this.checked);
        });

        subscribe(function (value) {
            if (checkbox.checked !== value) checkbox.checked = value;
        });
    }

    return {
        transparency: TRANSPARENCY,
        highlightColor: HIGHLIGHT_COLOR,
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        subscribe: subscribe,
        bindCheckbox: bindCheckbox
    };

})();
