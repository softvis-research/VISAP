/**
 * NavigatorController.js
 * Steuert ausschließlich das Navigator-UI oben in der Mitte.
 * Komplett getrennte Komponente (Shared Service für Suche und Metriken).
 * * Ablegen unter: ui/scripts/Navigator/NavigatorController.js
 */

var NavigatorController = (function () {

    // ── Hilfsfunktion zur Elementerstellung ──────────────────────────────────
    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls)  node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    // ── Navigator-Struktur aufbauen ──────────────────────────────────────────
    function buildNavigator(containerId) {
        var container = document.getElementById(containerId || "visap-navigator");
        if (!container) {
            console.warn("NavigatorController: #" + (containerId || "visap-navigator") + " not found.");
            return;
        }
        container.innerHTML = "";

        // 1. HEADER (Titel + Fragezeichen-Hilfe)
        var header = el("div", "navigator-header");
        var title = el("span", "navigator-title", "Navigator");

        var helpBtn = el("button", "visap-help-btn");
        helpBtn.id = "navigator-help-btn";
        helpBtn.title = "Hilfe";
        helpBtn.textContent = "?";

        header.appendChild(title);
        header.appendChild(helpBtn);

        // 2. NAME (Zentrales blaues Namensschild)
        var nameTag = el("span", "");
        nameTag.id = "navigator-name";
        nameTag.textContent = "Name"; // Platzhalter

        // 3. CONTROLS (Pfeiltasten + Ergebniszähler)
        var controls = el("div", "navigator-controls");

        var prevBtn = el("button", "navigator-arrow");
        prevBtn.innerHTML = "&#9664;"; // Linker Dreieckspfeil (◀)
        prevBtn.title = "Vorheriges Objekt";

        var counter = el("span", "");
        counter.id = "navigator-counter";
        counter.textContent = "1 / 1"; // Platzhalter

        var nextBtn = el("button", "navigator-arrow");
        nextBtn.innerHTML = "&#9654;"; // Rechter Dreieckspfeil (▶)
        nextBtn.title = "Nächstes Objekt";

        controls.appendChild(prevBtn);
        controls.appendChild(counter);
        controls.appendChild(nextBtn);

        // Alle Sektionen in den Hauptcontainer einfügen
        container.appendChild(header);
        container.appendChild(nameTag);
        container.appendChild(controls);
    }

    // ── Öffentliche Schnittstelle (API) ───────────────────────────────────────
    function init(navigatorId) {
        buildNavigator(navigatorId);

        // Tooltip für den Navigator registrieren
        if (typeof TooltipController !== "undefined") {
            TooltipController.register("navigatorTooltip", "navigator-help-btn", "navigator");
        }
    }

    /**
     * Macht den Navigator sichtbar und befüllt ihn mit dynamischen Daten.
     * Kann sowohl vom SearchController als auch vom MetricController aufgerufen werden!
     * * @param {string} name  - Name des aktuell fokussierten Elements
     * @param {number} index - Aktuelle Position (1-basiert)
     * @param {number} total - Gesamtzahl der Treffer
     */
    function show(name, index, total) {
        var nav = document.getElementById("visap-navigator");
        if (!nav) return;
        nav.classList.add("navigator-visible");

        var nameEl = document.getElementById("navigator-name");
        var counterEl = document.getElementById("navigator-counter");

        if (nameEl) nameEl.textContent = name || "—";
        if (index && total) {
            counterEl.textContent = index + " / " + total;
        }
    }

    /**
     * Versteckt den Navigator wieder im UI.
     */
    function hide() {
        var nav = document.getElementById("visap-navigator");
        if (nav) nav.classList.remove("navigator-visible");
    }

    return {
        init: init,
        show: show,
        hide: hide
    };

})();