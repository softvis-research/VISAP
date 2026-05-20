/**
 * LegendController.js
 * Renders the VISAP legend (Elemente + Aufrufbeziehungen) into the DOM.
 * No external frameworks – pure Vanilla JS.
 *
 * Usage in index.html:
 *   <div id="visap-legend"></div>
 *   <script src="scripts/Legend/LegendController.js"></script>
 *   LegendController.init();
 */

var LegendController = (function () {

    // ── Data ────────────────────────────────────────────────────────────────

    var ELEMENTS = [
        {
            label: "Package",
            color: "#9E9E9E",
            dot: "circle",
            children: []
        },
        {
            label: "Class",
            color: "#D4A017",
            dot: "square",
            children: [
                { label: "Lokale Klasse",    icon: "swatch", color: "#F0D080" },
                { label: "Methode",          icon: "method" },
                { label: "Klassen-Attribut", icon: "attr"   }
            ]
        },
        {
            label: "Interface",
            color: "#C0392B",
            dot: "square",
            children: [
                { label: "Lokales Interface", icon: "swatch", color: "#F1948A" },
                { label: "Methode",           icon: "method" },
                { label: "Klassen-Attribut",  icon: "attr"   }
            ]
        },
        {
            label: "Report",
            color: "#2980B9",
            dot: "square",
            children: [
                { label: "QuellCode",         icon: "swatch", color: "#85C1E9", circle: true },
                { label: "Formroutine",       icon: "method" },
                { label: "Globales-Attribut", icon: "attr"   }
            ]
        },
        {
            label: "Funktionsgruppe",
            color: "#C39BD3",
            dot: "square",
            children: [
                { label: "Funktionsbaustein", icon: "method" },
                { label: "Gruppenattribut",   icon: "attr"   }
            ]
        }
    ];

    var RELATIONS = [
        {
            label: "Straßenbeziehung",
            style: "solid",
            entries: [
                { label: "calls",    color: "#27AE60" },
                { label: "isCalled", color: "#E91E8C" }
            ]
        },
        {
            label: "Straßenbeziehung",
            style: "curved",
            entries: [
                { label: "calls",    color: "#2C3E9E" },
                { label: "isCalled", color: "#E53935" }
            ]
        }
    ];


    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls)  node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    function makeDot(color, shape) {
        var dot = el("span", "legend-dot");
        dot.style.background = color;
        if (shape === "circle") dot.style.borderRadius = "50%";
        return dot;
    }

    function makeIcon(child) {
        if (child.icon === "swatch") {
            var s = el("span", "legend-swatch");
            s.style.background = child.color || "#ccc";
            if (child.circle) s.style.borderRadius = "50%";
            return s;
        }
        if (child.icon === "method") return el("span", "legend-icon legend-icon--method");
        if (child.icon === "attr")   return el("span", "legend-icon legend-icon--attr");
        return el("span");
    }


    function buildElementGroup(group) {
        var wrapper = el("div", "legend-group");
        var header  = el("div", "legend-group__header");
        header.appendChild(makeDot(group.color, group.dot));
        header.appendChild(el("span", "legend-group__label", group.label));

        if (group.children.length) {
            var chevron  = el("span", "legend-chevron", "▾");
            var children = el("div", "legend-group__children legend-group__children--open");

            header.appendChild(chevron);

            group.children.forEach(function (child) {
                var row = el("div", "legend-item");
                row.appendChild(makeIcon(child));
                row.appendChild(el("span", "legend-item__label", child.label));
                children.appendChild(row);
            });

            header.addEventListener("click", function () {
                var open = children.classList.toggle("legend-group__children--open");
                chevron.textContent = open ? "▾" : "▸";
            });

            wrapper.appendChild(header);
            wrapper.appendChild(children);
        } else {
            wrapper.appendChild(header);
        }

        return wrapper;
    }

    function buildRelationGroup(rel) {
        var wrapper = el("div", "legend-relation-group");
        var header  = el("div", "legend-relation-group__header");
        var icon    = el("span", "legend-relation-group__icon", rel.style === "curved" ? "⌒" : "—");
        header.appendChild(icon);
        header.appendChild(el("span", "", rel.label));
        wrapper.appendChild(header);

        rel.entries.forEach(function (entry) {
            var row    = el("div", "legend-relation-row");
            var swatch = el("span", "legend-relation-swatch");
            swatch.style.background = entry.color;
            row.appendChild(swatch);
            row.appendChild(el("span", "legend-relation-row__label", entry.label));
            wrapper.appendChild(row);
        });

        return wrapper;
    }

    function buildSection(title, contentFn, items) {
        var section = el("div", "legend-section");
        var header  = el("div", "legend-section__header");
        var chevron = el("span", "legend-chevron", "▾");
        header.appendChild(el("span", "", title));
        header.appendChild(chevron);

        var body = el("div", "legend-section__body legend-section__body--open");
        items.forEach(function (item) { body.appendChild(contentFn(item)); });

        header.addEventListener("click", function () {
            var open = body.classList.toggle("legend-section__body--open");
            chevron.textContent = open ? "▾" : "▸";
        });

        section.appendChild(header);
        section.appendChild(body);
        return section;
    }

    function buildToggle(panel) {
        var btn = document.createElement("button");
        btn.id = "legend-toggle";
        btn.title = "Legende ein-/ausblenden";
        btn.textContent = "☰";

        btn.addEventListener("click", function () {
            var collapsed = panel.classList.toggle("legend-collapsed");
            document.body.classList.toggle("legend-collapsed", collapsed);
            btn.textContent = collapsed ? "☰" : "✕";
        });

        return btn;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function init(containerId) {
        var panel = document.getElementById(containerId || "visap-legend");
        if (!panel) {
            console.warn("LegendController: #" + (containerId || "visap-legend") + " not found.");
            return;
        }

        panel.innerHTML = "";

        // Toggle button
        panel.appendChild(buildToggle(panel));

        // Scrollable content wrapper
        var content = document.createElement("div");
        content.id = "legend-content";
        content.classList.add("legend-root");

        content.appendChild(buildSection("Elemente",           buildElementGroup,  ELEMENTS));
        content.appendChild(buildSection("Aufrufbeziehungen",  buildRelationGroup, RELATIONS));

        panel.appendChild(content);
    }

    return { init: init };

})();