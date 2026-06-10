/**
 * SearchController.js
 * Suchfeld + kaskadierende Filter + Autocomplete für VISAP.
 * Datenquelle: model.getAllEntities() (aus Model.js).
 * * Hierarchie (Korrekt nach ABAP-Struktur):
 * Namespace (Paket)
 * └─ Class / Report / Interface / FunctionGroup (Übergeordnet)
 * └─ Method / FormRoutine / FunctionModule / Attribute (Untergeordnet)
 */

var SearchController = (function () {

    // ── Typen-Klassifizierung ────────────────────────────────────────────────
    var TYPE_NAMESPACE  = ["Namespace"];
    var TYPE_TOP        = ["Class", "Report", "Interface", "FunctionGroup"];
    var TYPE_SUB        = ["Method", "FormRoutine", "FunctionModule", "Attribute"];

    var allEntities = [];

    // Aktuell gewählte Filter-IDs
    var selectedPaket   = "";
    var selectedTop     = "";
    var selectedSub     = "";

    // Speicher für den sauberen visuellen Reset
    var lastSearchResults = [];
    var lastNonMatchedEntities = [];

    // ── Helpers ───────────────────────────────────────────────────────────────
    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls)  node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    function getEntities() {
        if (allEntities.length === 0) {
            if (typeof model !== "undefined" && typeof model.getAllEntities === "function") {
                var entityMap = model.getAllEntities();
                if (entityMap && entityMap.size > 0) {
                    allEntities = Array.from(entityMap.values());
                }
            }
        }
        return allEntities;
    }

    function entitiesByType(types) {
        return getEntities().filter(function(e) {
            return types.indexOf(e.type) !== -1;
        });
    }

    function entitiesByTypeAndParent(types, parentId) {
        return getEntities().filter(function(e) {
            var hasCorrectType = types.indexOf(e.type) !== -1;
            var belongsToParent = (!parentId || (e.belongsTo && e.belongsTo.id === parentId));
            return hasCorrectType && belongsToParent;
        });
    }

    // ── Select-Optionen & Autocomplete befüllen ───────────────────────────────
    function fillSelect(selectEl, items, placeholder) {
        selectEl.innerHTML = "";
        var ph = el("option", "", placeholder || "— auswählen —");
        ph.value = "";
        selectEl.appendChild(ph);

        items.sort(function(a, b) { return (a.name || "").localeCompare(b.name || ""); });

        items.forEach(function(item) {
            var typePrefix = (TYPE_SUB.indexOf(item.type) !== -1) ? "[" + item.type + "] " : "";
            var opt = el("option", "", typePrefix + (item.name || "Unbenannt"));
            opt.value = item.id;
            selectEl.appendChild(opt);
        });
        selectEl.disabled = items.length === 0;
    }

    function clearSelect(selectEl, placeholder) {
        selectEl.innerHTML = "";
        var ph = el("option", "", placeholder || "— auswählen —");
        ph.value = "";
        selectEl.appendChild(ph);
        selectEl.disabled = true;
    }

    function populateAutocomplete() {
        var dl = document.getElementById("search-autocomplete-list");
        if (!dl) return;
        dl.innerHTML = "";

        var entities = getEntities();
        var uniqueNames = [];

        // Eindeutige Namen extrahieren
        entities.forEach(function(e) {
            if (e.name && uniqueNames.indexOf(e.name) === -1) {
                uniqueNames.push(e.name);
            }
        });

        // Alphabetisch sortieren
        uniqueNames.sort(function(a, b) { return a.localeCompare(b); });

        // Optionen in die Datalist einfügen
        uniqueNames.forEach(function(name) {
            var opt = el("option");
            opt.value = name;
            dl.appendChild(opt);
        });
    }

    // ── Kaskadierendes Filter-Update ──────────────────────────────────────────
    function updateTopSelect() {
        var topSel = document.getElementById("search-sel-top");
        if (!topSel) return;

        if (selectedPaket) {
            fillSelect(topSel, entitiesByTypeAndParent(TYPE_TOP, selectedPaket), "— übergeordnetes Objekt —");
        } else {
            fillSelect(topSel, entitiesByType(TYPE_TOP), "— übergeordnetes Objekt —");
        }

        selectedTop = "";
        selectedSub = "";
        clearSelect(document.getElementById("search-sel-sub"), "— untergeordnetes Element —");
    }

    function updateSubSelect() {
        var subSel = document.getElementById("search-sel-sub");
        if (!subSel) return;

        if (selectedTop) {
            fillSelect(subSel, entitiesByTypeAndParent(TYPE_SUB, selectedTop), "— untergeordnetes Element —");
        } else {
            clearSelect(subSel, "— untergeordnetes Element —");
        }

        selectedSub = "";
    }

    // ── Freitext-Suche ────────────────────────────────────────────────────────
    function applyTextFilter(text) {
        var lower = text.toLowerCase().trim();
        if (!lower) return getEntities();
        return getEntities().filter(function(e) {
            return e.name && e.name.toLowerCase().indexOf(lower) !== -1;
        });
    }

    // ── Suchergebnisse ermitteln ──────────────────────────────────────────────
    function collectResults() {
        var textInput  = document.getElementById("search-input-text");
        var textQuery  = textInput ? textInput.value : "";
        var targetId = selectedSub || selectedTop || selectedPaket;
        var results = [];

        if (targetId) {
            results = getEntities().filter(function(e) {
                return e.id === targetId || (e.belongsTo && e.belongsTo.id === targetId);
            });
            if (textQuery.trim()) {
                var lower = textQuery.toLowerCase();
                results = results.filter(function(e) {
                    return e.name && e.name.toLowerCase().indexOf(lower) !== -1;
                });
            }
        } else if (textQuery.trim()) {
            results = applyTextFilter(textQuery);
        } else {
            results = getEntities();
        }

        var seen = {};
        return results.filter(function(e) {
            if (seen[e.id]) return false;
            seen[e.id] = true;
            return true;
        });
    }

    // ── Zentrale Funktion für den visuellen Reset ─────────────────────────────
    function clearVisuals() {
        if (typeof events !== "undefined" && events.selected && lastSearchResults.length > 0) {
            events.selected.off.publish({ entities: lastSearchResults });
        }

        if (typeof canvasManipulator !== "undefined") {
            if (lastSearchResults.length > 0) {
                canvasManipulator.resetColorOfEntities(lastSearchResults, { name: "SearchController" });
                canvasManipulator.resetTransparencyOfEntities(lastSearchResults, { name: "SearchController" });
            }
            if (lastNonMatchedEntities.length > 0) {
                canvasManipulator.resetTransparencyOfEntities(lastNonMatchedEntities, { name: "SearchController" });
            }
        }

        lastSearchResults = [];
        lastNonMatchedEntities = [];
    }

    // ── Reset-Funktion ────────────────────────────────────────────────────────
    function resetSearch() {
        var textInput = document.getElementById("search-input-text");
        if (textInput) textInput.value = "";

        selectedPaket = "";
        selectedTop = "";
        selectedSub = "";

        var paketSel = document.getElementById("search-sel-paket");
        if (paketSel) paketSel.value = "";

        populatePaketSelect();
        clearSelect(document.getElementById("search-sel-sub"), "— untergeordnetes Element —");

        clearVisuals();

        if (typeof NavigatorController !== "undefined") {
            NavigatorController.hide();
        }
    }

    // ── Start-Button: Suche ausführen & Navigator triggern ────────────────────
    function executeSearch() {
        var results = collectResults();

        clearVisuals();

        if (results.length === 0) {
            if (typeof NavigatorController !== "undefined") NavigatorController.hide();
            alert("Die Suche ergab leider keine Treffer.");
            return;
        }

        if (typeof NavigatorController !== "undefined") {
            // Übergabe der Callback-Funktion an den Navigator für dynamisches Hovern
            NavigatorController.load(results, function(activeEntity, allResults) {

                clearVisuals();

                lastSearchResults = allResults;
                lastNonMatchedEntities = getEntities().filter(function(e) {
                    return allResults.indexOf(e) === -1;
                });

                if (typeof canvasManipulator !== "undefined") {
                    var inactiveResults = allResults.filter(function(e) { return e.id !== activeEntity.id; });

                    // A) Hintergrund leicht transparent machen
                    canvasManipulator.changeTransparencyOfEntities(lastNonMatchedEntities, 0.4, { name: "SearchController" });

                    // B) Inaktive Treffer: Orange, voll sichtbar
                    canvasManipulator.changeColorOfEntities(inactiveResults, "orange", { name: "SearchController" });
                    canvasManipulator.changeTransparencyOfEntities(inactiveResults, 0.0, { name: "SearchController" });

                    // C) Aktives Element: Rot, voll sichtbar
                    canvasManipulator.changeColorOfEntities([activeEntity], "red", { name: "SearchController" });
                    canvasManipulator.changeTransparencyOfEntities([activeEntity], 0.0, { name: "SearchController" });
                }

                // E) KAMERA-FLUG
                if (typeof events !== "undefined" && events.selected) {
                    events.selected.on.publish({ entities: [activeEntity] });
                }
            });
        }
    }

    // ── Panel UI aufbauen ─────────────────────────────────────────────────────
    function buildToggle(panel) {
        var btn = el("button");
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

        var helpBtn = el("button", "visap-help-btn", "?");
        helpBtn.id = "search-help-btn";
        helpBtn.title = "Hilfe";
        header.appendChild(helpBtn);

        return header;
    }

    function buildFieldRow(labelText, inputEl) {
        var row = el("div", "search-field-row");
        row.appendChild(el("span", "search-field-label", labelText));
        row.appendChild(inputEl);
        return row;
    }

    function buildTextInput() {
        var wrapper = el("div");
        wrapper.style.width = "100%";

        var inp = el("input", "search-input");
        inp.type = "text";
        inp.id   = "search-input-text";
        inp.placeholder = "Suchbegriff …";
        inp.setAttribute("list", "search-autocomplete-list"); // HTML5 Datalist Verknüpfung

        var dl = el("datalist");
        dl.id = "search-autocomplete-list";

        wrapper.appendChild(inp);
        wrapper.appendChild(dl);
        return wrapper;
    }

    function buildSelect(id, placeholder) {
        var wrapper = el("div", "search-select-wrapper");
        var sel = el("select", "search-select");
        sel.id = id;
        sel.disabled = true;

        var ph = el("option", "", placeholder || "— auswählen —");
        ph.value = "";
        sel.appendChild(ph);

        wrapper.appendChild(sel);
        return wrapper;
    }

    function buildContent() {
        var content = el("div", "");
        content.id = "search-content";

        content.appendChild(buildFieldRow("Suche", buildTextInput()));
        content.appendChild(el("div", "search-divider"));

        content.appendChild(buildFieldRow("Paket", buildSelect("search-sel-paket", "— Paket —")));
        content.appendChild(buildFieldRow("Übergeordnetes\nQuellCode-Objekt", buildSelect("search-sel-top", "— übergeordnetes Objekt —")));
        content.appendChild(buildFieldRow("Untergeordnetes\nElement", buildSelect("search-sel-sub", "— Methode, Attribut, etc. —")));

        var footer = el("div", "search-footer");
        footer.style.display = "flex";
        footer.style.alignItems = "center";
        footer.style.justifyContent = "center";

        var startBtn = el("button", "");
        startBtn.id = "search-start-btn";
        startBtn.textContent = "Start";
        startBtn.addEventListener("click", executeSearch);

        var resetBtn = el("button", "");
        resetBtn.id = "search-reset-btn";
        resetBtn.innerHTML = "&#x21BA;"; // ↻-Symbol
        resetBtn.title = "Suche zurücksetzen";
        resetBtn.addEventListener("click", resetSearch);

        footer.appendChild(startBtn);
        footer.appendChild(resetBtn);
        content.appendChild(footer);

        return content;
    }

    function bindSelectEvents() {
        var selects = ["search-sel-paket", "search-sel-top", "search-sel-sub"].map(function(id) {
            return document.getElementById(id);
        });

        if (selects[0]) selects[0].addEventListener("change", function() { selectedPaket = this.value; updateTopSelect(); });
        if (selects[1]) selects[1].addEventListener("change", function() { selectedTop = this.value; updateSubSelect(); });
        if (selects[2]) selects[2].addEventListener("change", function() { selectedSub = this.value; });
    }

    function populatePaketSelect() {
        var paketSel = document.getElementById("search-sel-paket");
        if (!paketSel) return;

        fillSelect(paketSel, entitiesByType(TYPE_NAMESPACE), "— Paket —");

        var topSel = document.getElementById("search-sel-top");
        if (topSel) {
            fillSelect(topSel, entitiesByType(TYPE_TOP), "— übergeordnetes Objekt —");
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────
    function init(searchId) {
        var panel = document.getElementById(searchId || "visap-search");
        if (!panel) return;

        panel.innerHTML = "";
        panel.appendChild(buildHeader(panel));
        panel.appendChild(buildContent());

        bindSelectEvents();

        var dataCheckInterval = setInterval(function() {
            try {
                if (getEntities().length > 0) {
                    clearInterval(dataCheckInterval);
                    populatePaketSelect();
                    populateAutocomplete(); // Befüllt die Autocomplete-Liste
                }
            } catch (err) {
                console.warn("SearchController wartet auf Model...", err);
            }
        }, 200);

        if (typeof TooltipController !== "undefined") {
            TooltipController.register("searchTooltip", "search-help-btn", "searchFenster");
        }
    }

    return {
        init: init
    };

})();