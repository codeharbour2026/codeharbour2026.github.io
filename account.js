import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

async function init() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
        window.location.href = "signin.html";
        return;
    }

    document.getElementById("accountEmail").textContent = session.user.email;
    document.getElementById("detailEmail").textContent = session.user.email;
    document.getElementById("detailSince").textContent = new Date(session.user.created_at).toLocaleDateString("en-AU");
}

document.getElementById("signOutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "index.html";
});

init();
