import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const form = document.getElementById("signupForm");
const errorBox = document.getElementById("signupError");
const statusBox = document.getElementById("signupStatus");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorBox.classList.remove("show");
    statusBox.classList.remove("show");

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";

    if (error) {
        errorBox.textContent = error.message || "Couldn't create that account — try again.";
        errorBox.classList.add("show");
        return;
    }

    if (data.session) {
        // Email confirmation is off in this project — signed in immediately.
        window.location.href = "account.html";
        return;
    }

    // Email confirmation is on — they'll need to click the link first.
    statusBox.textContent = "Account created — check your email to confirm it, then sign in.";
    statusBox.classList.add("show");
    form.reset();
});

// Already signed in? Skip straight to the account page.
supabase.auth.getSession().then(function (result) {
    if (result.data.session) {
        window.location.href = "account.html";
    }
});
