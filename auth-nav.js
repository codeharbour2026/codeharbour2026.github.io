import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const authArea = document.querySelector(".nav-auth");

async function renderAuthState() {
    if (!authArea) return;

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (session) {
        authArea.innerHTML =
            '<a class="btn-nav" href="account.html">My account</a>' +
            '<button class="btn-nav filled" id="navSignOut" type="button">Sign out</button>';

        document.getElementById("navSignOut").addEventListener("click", async function () {
            await supabase.auth.signOut();
            window.location.href = "index.html";
        });
    } else {
        authArea.innerHTML =
            '<a class="btn-nav" href="signin.html">Sign in</a>' +
            '<a class="btn-nav filled" href="signup.html">Sign up</a>';
    }
}

renderAuthState();
