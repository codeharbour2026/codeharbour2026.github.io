import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");

async function isAdmin(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    return !error && data && data.role === "admin";
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorBox.classList.remove("show");

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
        errorBox.textContent = "Sign-in failed — check your email and password.";
        errorBox.classList.add("show");
        return;
    }

    const admin = await isAdmin(data.user.id);

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";

    if (!admin) {
        await supabase.auth.signOut();
        errorBox.textContent = "That account doesn't have admin access.";
        errorBox.classList.add("show");
        return;
    }

    window.location.href = "admin.html";
});

// Already signed in as an admin? Skip straight to the dashboard.
supabase.auth.getSession().then(async function (result) {
    const session = result.data.session;
    if (session && (await isAdmin(session.user.id))) {
        window.location.href = "admin.html";
    }
});
