// Reads WIDGETS (widgets.js) and builds one ticket card per service.
// Add/remove a service in widgets.js and it appears here automatically.

(function () {
    const grid = document.getElementById("widgetGrid");
    if (!grid || typeof WIDGETS === "undefined") return;

    WIDGETS.forEach(function (widget) {
        const card = document.createElement("article");
        card.className = "ticket widget-card";

        card.innerHTML = `
            <div class="ticket-ref">
                <span class="code-chip">${widget.code}</span>
                ${widget.name.toUpperCase()}
            </div>
            <p>${widget.blurb}</p>
            <div class="widget-price-row">
                <div class="widget-price">
                    ${formatPrice(widget.basePrice)}
                    <small>${widget.priceUnit}</small>
                </div>
            </div>
            <a class="btn-quote" href="quote.html?service=${encodeURIComponent(widget.id)}">Get a quote</a>
        `;

        grid.appendChild(card);
    });
})();
