import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const form = document.getElementById("signinForm");
const errorBox = document.getElementById("signinError");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorBox.classList.remove("show");

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";

    if (error) {
        errorBox.textContent = "Sign-in failed — check your email and password.";
        errorBox.classList.add("show");
        return;
    }

    window.location.href = "account.html";
});

supabase.auth.getSession().then(function (result) {
    if (result.data.session) {
        window.location.href = "account.html";
    }
});
