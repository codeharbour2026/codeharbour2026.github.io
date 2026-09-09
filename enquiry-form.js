import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

function buildMessage() {
    const details = document.getElementById("details");
    if (!details) return "";
    const auto = details.dataset.autoNote;
    return auto ? details.value + "\n\n" + auto : details.value;
}

function showStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("ok", "err");
    status.classList.add("show", ok ? "ok" : "err");
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";

        const serviceField = document.getElementById("service");

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session ? sessionData.session.user.id : null;

        const payload = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            service: serviceField ? serviceField.value : null,
            message: buildMessage().trim() || "(no details added)",
            user_id: userId
        };

        const { error } = await supabase.from("enquiries").insert([payload]);

        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;

        if (error) {
            console.error(error);
            showStatus("Something went wrong sending that — please try again or email us directly.", false);
            return;
        }

        showStatus("Thanks — your enquiry is in. We'll get back to you within one business day.", true);
        form.reset();
    });
}
