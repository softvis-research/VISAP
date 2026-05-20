/**
 * NavigatorController.js
 * Steuert das Navigator-UI oben in der Mitte und verwaltet das Durchschalten der Ergebnisse.
 */

var NavigatorController = (function () {

    var items = [];
    var currentIndex = 0;
    var onChangeCallback = null;

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls)  node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    function buildNavigator(containerId) {
        var container = document.getElementById(containerId || "visap-navigator");
        if (!container) return;
        container.innerHTML = "";

        var header = el("div", "navigator-header");
        var title = el("span", "navigator-title", "Navigator");
        var helpBtn = el("button", "visap-help-btn", "?");
        helpBtn.id = "navigator-help-btn";
        helpBtn.title = "Hilfe";
        header.appendChild(title);
        header.appendChild(helpBtn);

        var nameTag = el("span", "");
        nameTag.id = "navigator-name";
        nameTag.textContent = "Name";

        var controls = el("div", "navigator-controls");

        var prevBtn = el("button", "navigator-arrow");
        prevBtn.id = "navigator-prev-btn"; // ID für das Klick-Event hinzugefügt
        prevBtn.innerHTML = "&#9664;";
        prevBtn.title = "Vorheriges Objekt";

        var counter = el("span", "");
        counter.id = "navigator-counter";
        counter.textContent = "1 / 1";

        var nextBtn = el("button", "navigator-arrow");
        nextBtn.id = "navigator-next-btn"; // ID für das Klick-Event hinzugefügt
        nextBtn.innerHTML = "&#9654;";
        nextBtn.title = "Nächstes Objekt";

        controls.appendChild(prevBtn);
        controls.appendChild(counter);
        controls.appendChild(nextBtn);

        container.appendChild(header);
        container.appendChild(nameTag);
        container.appendChild(controls);
    }

    // Geht zum vorherigen Element
    function prev() {
        if (items.length === 0) return;
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
        updateUIAndTriggerCallback();
    }

    // Geht zum nächsten Element
    function next() {
        if (items.length === 0) return;
        currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
        updateUIAndTriggerCallback();
    }

    function updateUIAndTriggerCallback() {
        var nav = document.getElementById("visap-navigator");
        if (!nav) return;

        if (items.length > 0) {
            nav.classList.add("navigator-visible");
            var activeItem = items[currentIndex];

            // Text anpassen
            document.getElementById("navigator-name").textContent = activeItem.name || "Unbenannt";
            document.getElementById("navigator-counter").textContent = (currentIndex + 1) + " / " + items.length;

            // Den aufrufenden Controller (Search oder Metric) informieren, dass sich das Element geändert hat!
            if (typeof onChangeCallback === "function") {
                onChangeCallback(activeItem, items);
            }
        } else {
            hide();
        }
    }

    function init(navigatorId) {
        buildNavigator(navigatorId);

        // Klick-Events für die Pfeile registrieren
        document.getElementById("navigator-prev-btn").addEventListener("click", prev);
        document.getElementById("navigator-next-btn").addEventListener("click", next);

        if (typeof TooltipController !== "undefined") {
            TooltipController.register("navigatorTooltip", "navigator-help-btn", "navigator");
        }
    }

    /**
     * Startet den Navigator mit einer Liste an Ergebnissen.
     * @param {Array} newItems - Die Such- oder Metrikergebnisse
     * @param {Function} callback - Wird aufgerufen, wenn ein neues Element fokussiert wird
     */
    function load(newItems, callback) {
        items = newItems || [];
        currentIndex = 0; // Beim Start immer beim ersten Element beginnen
        onChangeCallback = callback;
        updateUIAndTriggerCallback();
    }

    function hide() {
        var nav = document.getElementById("visap-navigator");
        if (nav) nav.classList.remove("navigator-visible");
        items = [];
        onChangeCallback = null;
    }

    return {
        init: init,
        load: load,
        hide: hide
    };

})();