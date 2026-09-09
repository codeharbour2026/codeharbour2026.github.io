import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const statusSelect = document.getElementById("statusSelect");

let userId = null;

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

function renderMessage(msg) {
    const mine = msg.sender_role === "admin";
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + (mine ? "mine" : "theirs");
    bubble.innerHTML = `
        ${escapeHtml(msg.body)}
        <span class="chat-meta">${mine ? "You" : "Client"} · ${new Date(msg.created_at).toLocaleString("en-AU")}</span>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function init() {
    if (!orderId) {
        window.location.href = "admin.html";
        return;
    }

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
        await supabase.auth.signOut();
        window.location.href = "login.html";
        return;
    }

    userId = session.user.id;
    document.getElementById("whoami").textContent = session.user.email;

    const { data: order, error } = await supabase
        .from("orders")
        .select("*, profiles(email)")
        .eq("id", orderId)
        .single();

    if (error || !order) {
        document.getElementById("orderTitle").textContent = "Order not found";
        chatForm.style.display = "none";
        statusSelect.style.display = "none";
        return;
    }

    document.getElementById("orderTitle").textContent = order.service;
    document.getElementById("orderMeta").textContent =
        (order.profiles ? order.profiles.email : "Unknown client") +
        " · Opened " + new Date(order.created_at).toLocaleDateString("en-AU") +
        (order.price ? " · $" + order.price : "");
    document.getElementById("orderNotes").textContent = order.notes || "";
    statusSelect.value = order.status;

    statusSelect.addEventListener("change", async function () {
        await supabase
            .from("orders")
            .update({ status: statusSelect.value, updated_at: new Date().toISOString() })
            .eq("id", orderId);
    });

    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

    (messages || []).forEach(renderMessage);

    // Mark client messages as read now that admin is viewing them
    await supabase
        .from("messages")
        .update({ read: true })
        .eq("order_id", orderId)
        .eq("sender_role", "client")
        .eq("read", false);

    supabase
        .channel("admin-order-" + orderId)
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: "order_id=eq." + orderId },
            function (payload) {
                renderMessage(payload.new);
                if (payload.new.sender_role === "client") {
                    supabase.from("messages").update({ read: true }).eq("id", payload.new.id).then(function () {});
                }
            }
        )
        .subscribe();
}

chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const body = chatInput.value.trim();
    if (!body || !orderId || !userId) return;

    chatInput.value = "";

    const { error } = await supabase.from("messages").insert([{
        order_id: Number(orderId),
        sender_id: userId,
        sender_role: "admin",
        body: body
    }]);

    if (error) console.error(error);
});

document.getElementById("signOutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "login.html";
});

init();
