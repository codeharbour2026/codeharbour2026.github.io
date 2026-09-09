import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const tableBody = document.getElementById("enquiriesBody");
const emptyState = document.getElementById("emptyState");
const whoami = document.getElementById("whoami");
const signOutBtn = document.getElementById("signOutBtn");

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

async function init() {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profileError || !profile || profile.role !== "admin") {
        // Signed in, but not an admin account — don't leave them on this page.
        await supabase.auth.signOut();
        window.location.href = "login.html";
        return;
    }

    whoami.textContent = session.user.email;

    const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        emptyState.textContent = "Could not load enquiries: " + error.message;
        emptyState.classList.add("show");
        return;
    }

    if (!data || data.length === 0) {
        emptyState.classList.add("show");
        return;
    }

    data.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + escapeHtml(row.name) + "</td>" +
            "<td><a href=\"mailto:" + escapeHtml(row.email) + "\">" + escapeHtml(row.email) + "</a></td>" +
            "<td>" + escapeHtml(row.service || "—") + "</td>" +
            "<td>" + escapeHtml(row.message) + "</td>" +
            "<td>" + new Date(row.created_at).toLocaleString("en-AU") + "</td>";
        tableBody.appendChild(tr);
    });
}

signOutBtn.addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "login.html";
});

init();
