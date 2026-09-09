// ---------- Mobile nav toggle ----------
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

// Note: contact/quote form submission is handled by enquiry-form.js
// (it posts to Supabase) on pages that load it — not here.

// ---------- Currency helper ----------
function formatPrice(n) {
    return "$" + n.toLocaleString("en-AU");
}
