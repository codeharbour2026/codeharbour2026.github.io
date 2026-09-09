// Reads WIDGETS (widgets.js) plus ?service=<id> from the URL and builds
// either a checkbox configurator (configurable widgets) or a plain
// bullet summary (fixed-price widgets). Falls back to a service picker
// if the id is missing or unrecognised.

(function () {
    const mount = document.getElementById("quoteMount");
    if (!mount || typeof WIDGETS === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("service");
    const widget = WIDGETS.find(function (w) { return w.id === serviceId; });

    if (!widget) {
        mount.innerHTML = `
            <div class="section-head">
                <h1 style="font-family:'Roboto Slab',serif; font-size:2rem;">Choose a service</h1>
                <p>Pick one below to see pricing and put together a quote.</p>
            </div>
            <div class="service-picker">
                <div class="service-picker-grid" id="pickerGrid"></div>
            </div>
        `;
        const pickerGrid = document.getElementById("pickerGrid");
        WIDGETS.forEach(function (w) {
            const a = document.createElement("a");
            a.href = "quote.html?service=" + encodeURIComponent(w.id);
            a.textContent = w.name;
            pickerGrid.appendChild(a);
        });
        return;
    }

    document.title = widget.name + " quote | TechIndustries";

    const detailHTML = widget.configurable
        ? `
            <div class="feature-list" id="featureList"></div>
        `
        : `
            <ul class="bullet-list">
                ${widget.bullets.map(function (b) { return "<li>" + b + "</li>"; }).join("")}
            </ul>
        `;

    mount.innerHTML = `
        <div class="quote-layout">
            <div>
                <div class="quote-service-head">
                    <span class="code-chip">${widget.code}</span>
                    <h1 style="font-family:'Roboto Slab',serif; font-size:1.9rem;">${widget.name}</h1>
                </div>
                <p style="font-size:1.05rem;">${widget.blurb}</p>
                ${detailHTML}
            </div>
            <div class="price-summary">
                <h3>Your estimate</h3>
                <div class="line">
                    <span>Base price</span>
                    <span>${formatPrice(widget.basePrice)}</span>
                </div>
                <div id="extraLines"></div>
                <div class="line total">
                    <span>Total (${widget.priceUnit.replace("starting", "est.")})</span>
                    <span class="total-value" id="totalValue">${formatPrice(widget.basePrice)}</span>
                </div>
                <a href="#requestForm" class="btn btn-primary">Request this quote</a>
            </div>
        </div>
    `;

    if (widget.configurable) {
        const featureList = document.getElementById("featureList");
        const extraLines = document.getElementById("extraLines");
        const totalValue = document.getElementById("totalValue");

        widget.features.forEach(function (f) {
            const row = document.createElement("label");
            row.className = "feature-row";
            row.innerHTML = `
                <span class="feature-label">
                    <input type="checkbox" data-price="${f.price}" data-label="${f.label}">
                    ${f.label}
                </span>
                <span class="feature-add">+${formatPrice(f.price)}</span>
            `;
            featureList.appendChild(row);
        });

        function recalc() {
            const checked = Array.from(featureList.querySelectorAll("input:checked"));
            const extra = checked.reduce(function (sum, box) {
                return sum + Number(box.dataset.price);
            }, 0);

            extraLines.innerHTML = checked.map(function (box) {
                return `<div class="line"><span>${box.dataset.label}</span><span>+${formatPrice(Number(box.dataset.price))}</span></div>`;
            }).join("");

            totalValue.textContent = formatPrice(widget.basePrice + extra);

            const notesField = document.getElementById("details");
            if (notesField) {
                const featureNote = checked.length
                    ? "Selected extras: " + checked.map(function (b) { return b.dataset.label; }).join(", ") + "."
                    : "";
                notesField.dataset.autoNote = featureNote;
            }
        }

        featureList.addEventListener("change", recalc);
    }

    const serviceField = document.getElementById("service");
    if (serviceField) {
        Array.from(serviceField.options).forEach(function (opt) {
            if (opt.value === widget.name) opt.selected = true;
        });
    }
})();
