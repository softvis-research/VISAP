/**
 * SearchController.js
 * Renders the VISAP Suchfeld into the DOM.
 * No external frameworks – pure Vanilla JS.
 * Bereinigte Fassung ohne Navigator (getrennte Zuständigkeit).
 * * Ablegen unter: ui/scripts/SearchBar/SearchController.js
 */

var SearchController = (function () {

    // ── Helpers ──────────────────────────────────────────────────────────────

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls)  node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    // ── Panel aufbauen ───────────────────────────────────────────────────────

    function buildToggle(panel) {
        var btn = document.createElement("button");
        btn.id = "search-toggle";
        btn.title = "Suche ein-/ausblenden";
        btn.textContent = "☰";

        btn.addEventListener("click", function () {
            var collapsed = panel.classList.toggle("search-collapsed");
            btn.textContent = collapsed ? "☰" : "✕";
        });

        return btn;
    }

    function buildHeader(panel) {
        var header = el("div", "");
        header.id = "search-header";

        header.appendChild(buildToggle(panel));

        var label = el("span", "");
        label.id = "search-header-label";
        label.textContent = "Suche";
        header.appendChild(label);

        var helpBtn = el("button", "");
        helpBtn.id = "search-help-btn";
        helpBtn.title = "Hilfe";
        helpBtn.textContent = "?";
        header.appendChild(helpBtn);

        return header;
    }

    function buildFieldRow(labelText, inputEl) {
        var row = el("div", "search-field-row");
        var lbl = el("span", "search-field-label", labelText);
        row.appendChild(lbl);
        row.appendChild(inputEl);
        return row;
    }

    function buildTextInput(placeholder) {
        var inp = el("input", "search-input");
        inp.type = "text";
        inp.placeholder = placeholder || "";
        return inp;
    }

    function buildSelectWrapper() {
        var wrapper = el("div", "search-select-wrapper");
        var sel = el("select", "search-select");

        // Platzhalter-Option
        var placeholder = el("option", "", "— auswählen —");
        placeholder.value = "";
        sel.appendChild(placeholder);

        wrapper.appendChild(sel);
        return wrapper;
    }

    function buildContent() {
        var content = el("div", "");
        content.id = "search-content";

        // ── Freitext-Suche ──
        content.appendChild(buildFieldRow("Suche", buildTextInput("Suchbegriff …")));

        // Trennlinie
        content.appendChild(el("div", "search-divider"));

        // ── Kaskadierende Filter (Entsprechend der SAP-Struktur) ──
        content.appendChild(buildFieldRow("Paket",                     buildSelectWrapper()));
        content.appendChild(buildFieldRow("Übergeordnetes\nQuellCode-Objekt", buildSelectWrapper()));
        content.appendChild(buildFieldRow("Untergeordnetes\nQuellcode-Objekt", buildSelectWrapper()));
        content.appendChild(buildFieldRow("Attribut",                  buildSelectWrapper()));

        // ── Start-Button ──
        var footer = el("div", "search-footer");
        var startBtn = el("button", "");
        startBtn.id = "search-start-btn";
        startBtn.textContent = "Start";
        footer.appendChild(startBtn);
        content.appendChild(footer);

        return content;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function init(searchId) {
        // Such-Panel initialisieren
        var panel = document.getElementById(searchId || "visap-search");
        if (!panel) {
            console.warn("SearchController: #" + (searchId || "visap-search") + " not found.");
            return;
        }
        panel.innerHTML = "";
        panel.appendChild(buildHeader(panel));
        panel.appendChild(buildContent());

        // Tooltip für das Suchfeld registrieren
        if (typeof TooltipController !== "undefined") {
            TooltipController.register("searchTooltip", "search-help-btn", "searchFenster");
        }
    }

    return {
        init: init
    };

})();