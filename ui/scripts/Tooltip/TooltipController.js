/**
 * TooltipController.js
 * Wiederverwendbare Tooltip-Logik für alle VISAP-Controller.
 * Kein Framework – reines Vanilla JS.
 *
 * Ablegen unter: ui/scripts/Tooltip/TooltipController.js
 *
 * Verwendung:
 *   TooltipController.register("metricTooltip",  "metricHelpBtn",  "Text...");
 *   TooltipController.register("navigatorTooltip","navigatorHelpBtn","Text...");
 */

var TooltipController = (function () {

    // ── Tooltip-Texte ────────────────────────────────────────────
    var TOOLTIPS = {
        metricController: 'Wählen Sie eine Metrik und ein Intervall. ' +
            'Standardmäßig werden die Minimal- und Maximalwerte der ausgewählten Metrik verwendet. ' +
            'Bestimmen Sie das visuelle Mapping (z. B. Farbe) und klicken Sie auf „Start“. ' +
            'Das Refresh-Symbol setzt Ihre Eingaben zurück.',

        navigator: 'Navigieren Sie zwischen den betroffenen Paketen Ihrer ' +
            'Auswahl. Nutzen Sie daf\u00fcr die Pfeiltasten, um direkt zum ' +
            'jeweiligen Quellcode-Objekt zu springen.',

        searchFenster: 'Suchen Sie gezielt nach Objekten. Ist der exakte Name ' +
            'unbekannt, k\u00f6nnen Sie die Auswahl \u00fcber die unteren ' +
            'Filter-Felder eingrenzen. Best\u00e4tigen Sie mit \u201eStart\u201c.'
    };

    // ── Interne Registry ─────────────────────────────────────────
    var registered = [];

    // ── Tooltip-Element erstellen ────────────────────────────────
    function createTooltipEl(id, text, arrowTop) {
        var tip = document.createElement("div");
        tip.id = id;
        tip.className = "visap-tooltip" + (arrowTop ? " tooltip-arrow-top" : "");

        // Sauberer HTML-Aufbau mit erzwungener Schriftfarbe und ohne blaues Fokus-Kästchen
        tip.innerHTML = `
            <div style="text-align: right; margin-bottom: 6px; outline: none; user-select: none;">
                <span class="tooltip-close-btn" style="cursor: pointer; color: #f38ba8; font-weight: bold; font-size: 15px; padding: 2px 6px;">&#x2715;</span>
            </div>
            <div style="color: #cdd6f4; outline: none; user-select: none;">
                ${text}
            </div>
        `;

        // Klick-Event für das "X" registrieren
        var closeBtn = tip.querySelector(".tooltip-close-btn");
        closeBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            tip.classList.remove("tooltip-visible");
        });

        document.body.appendChild(tip);
        return tip;
    }

    // ── Tooltip positionieren ────────────────────────────────────
    function positionTooltip(tip, btn) {
        var btnRect = btn.getBoundingClientRect();
        var tipWidth = 280;
        var tipHeight = tip.offsetHeight || 120; // geschätzte Höhe wenn noch nicht sichtbar

        // Controller ist am unteren Rand fixiert → Tooltip erscheint ÜBER dem Button
        var top = btnRect.top - tipHeight - 16;
        var left = btnRect.left;

        // Nicht über den rechten Rand hinaus
        if (left + tipWidth > window.innerWidth - 16) {
            left = window.innerWidth - tipWidth - 16;
        }
        if (left < 8) left = 8;

        // Wenn kein Platz oben (z.B. Panel oben angedockt): unter den Button
        if (top < 8) {
            top = btnRect.bottom + 10;
            tip.classList.add("tooltip-arrow-top");
        } else {
            tip.classList.remove("tooltip-arrow-top");
        }

        tip.style.top  = top + "px";
        tip.style.left = left + "px";
    }

    // ── Öffentliche API ──────────────────────────────────────────

    /**
     * Registriert einen Hilfe-Button mit einem Tooltip.
     * @param {string} tooltipId  – ID des Tooltip-Elements (wird erstellt)
     * @param {string} btnId      – ID des ?-Buttons im DOM
     * @param {string} text       – Tooltip-Text (oder Key aus TOOLTIPS)
     */
    function register(tooltipId, btnId, text) {
        // Text aus Registry oder direkt
        var content = TOOLTIPS[text] || text;

        var btn = document.getElementById(btnId);
        if (!btn) {
            console.warn("TooltipController: Button #" + btnId + " not found.");
            return;
        }

        var tip = createTooltipEl(tooltipId, content, false);

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var isVisible = tip.classList.contains("tooltip-visible");

            // Alle anderen schließen
            closeAll();

            if (!isVisible) {
                positionTooltip(tip, btn);
                tip.classList.add("tooltip-visible");
            }
        });

        registered.push(tip);
    }

    function closeAll() {
        registered.forEach(function (tip) {
            tip.classList.remove("tooltip-visible");
        });
    }

    // Klick außerhalb schließt alle Tooltips
    document.addEventListener("click", closeAll);

    return {
        register: register,
        texts: TOOLTIPS
    };

})();