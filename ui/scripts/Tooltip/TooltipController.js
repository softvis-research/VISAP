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
    // Der Metrik Controller ist bewusst in mehrere kurze Tooltips aufgeteilt:
    // Jeder Bereich erklärt nur seine eigenen Bedienelemente.
    var TOOLTIPS = {
        metricController: 'Kopfzeile des Metrik Controllers:' +
            '<ul class="tooltip-list">' +
            '<li><b>View</b> – gespeicherte Ansicht laden</li>' +
            '<li><b>Config</b> – aktuelle Einstellung als View sichern</li>' +
            '<li><b>+ Layer</b> – weitere Metrik zusätzlich darstellen</li>' +
            '<li><b>Start</b> – Einstellungen auf das Modell anwenden</li>' +
            '<li><b>&#x21BA;</b> – Eingaben zurücksetzen</li>' +
            '<li><b>Dim</b> – Transparenz bei der Navigation ein/aus</li>' +
            '</ul>',

        metricSection: 'Welche Kennzahl dargestellt wird.<br/>' +
            '<b>Start</b> und <b>End</b> grenzen den Wertebereich ein – beim Auswählen der ' +
            'Metrik werden der kleinste und größte Wert des Modells eingetragen. ' +
            'Hervorgehoben wird alles, was in diesem Bereich liegt.',

        mappingSection: 'Wie die Treffer im Modell dargestellt werden: Farbe, Farbverlauf, ' +
            'Transparenz, Pulsation, Blinken oder Rotation.<br/>' +
            'Je nach Auswahl erscheinen die passenden Felder, z. B. die Farbe oder die Periode in ms.',

        navigator: 'Navigieren Sie zwischen den betroffenen Paketen Ihrer ' +
            'Auswahl. Nutzen Sie daf\u00fcr die Pfeiltasten, um direkt zum ' +
            'jeweiligen Quellcode-Objekt zu springen.',

        searchFenster: 'Objekte im Modell finden:' +
            '<ul class="tooltip-list">' +
            '<li><b>Suche</b> \u2013 Name eingeben, Vorschl\u00e4ge kommen aus dem Modell</li>' +
            '<li><b>Paket</b> / <b>\u00dcbergeordnet</b> / <b>Untergeordnet</b> \u2013 Auswahl eingrenzen, wenn der Name unbekannt ist; die Felder bauen aufeinander auf</li>' +
            '<li><b>Start</b> \u2013 Suche ausf\u00fchren, Treffer im Navigator durchschalten</li>' +
            '<li><b>&#x21BA;</b> \u2013 Eingaben und Markierungen zur\u00fccksetzen</li>' +
            '<li><b>Dim</b> \u2013 Transparenz bei der Navigation ein/aus</li>' +
            '</ul>'
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
    // Wird erst aufgerufen, wenn der Tooltip sichtbar ist – nur dann sind
    // Breite und Höhe bekannt und die Platzierung sitzt wirklich am Button.
    function positionTooltip(tip, btn) {
        var margin = 12;
        var gap = 14;
        var btnRect = btn.getBoundingClientRect();
        var tipWidth = tip.offsetWidth || 280;
        var tipHeight = tip.offsetHeight || 120;

        // Mittig über dem Button statt linksbündig – so gehört der Tooltip sichtbar dazu
        var left = btnRect.left + btnRect.width / 2 - tipWidth / 2;
        var top = btnRect.top - tipHeight - gap;

        // Innerhalb des Fensters halten
        left = Math.min(Math.max(left, margin), Math.max(window.innerWidth - tipWidth - margin, margin));

        // Wenn kein Platz oben (z.B. Panel oben angedockt): unter den Button
        if (top < margin) {
            top = btnRect.bottom + gap;
            tip.classList.add("tooltip-arrow-top");
        } else {
            tip.classList.remove("tooltip-arrow-top");
        }

        tip.style.top  = top + "px";
        tip.style.left = left + "px";

        // Pfeil auf den Button ausrichten, auch wenn der Tooltip am Rand verschoben wurde
        var arrowLeft = btnRect.left + btnRect.width / 2 - left - 7;
        arrowLeft = Math.min(Math.max(arrowLeft, 14), Math.max(tipWidth - 28, 14));
        tip.style.setProperty("--tooltip-arrow-left", arrowLeft + "px");
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

        // Layer im Metrik Controller werden dynamisch auf- und abgebaut –
        // eine alte Registrierung derselben ID darf nicht doppelt im DOM landen
        unregister(tooltipId);

        var tip = createTooltipEl(tooltipId, content, false);

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var isVisible = tip.classList.contains("tooltip-visible");

            // Alle anderen schließen
            closeAll();

            if (!isVisible) {
                // Erst sichtbar machen, dann messen und platzieren
                tip.classList.add("tooltip-visible");
                positionTooltip(tip, btn);
            }
        });

        registered.push(tip);
    }

    /**
     * Entfernt einen Tooltip wieder – z.B. wenn sein Layer gelöscht wird.
     * @param {string} tooltipId – ID des Tooltip-Elements
     */
    function unregister(tooltipId) {
        registered = registered.filter(function (tip) {
            return tip.id !== tooltipId;
        });

        var existing = document.getElementById(tooltipId);
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }
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
        unregister: unregister,
        texts: TOOLTIPS
    };

})();