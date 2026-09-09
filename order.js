import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const STATUS_LABEL = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled"
};

const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let userId = null;

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

function renderMessage(msg) {
    const mine = msg.sender_role === "client";
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + (mine ? "mine" : "theirs");
    bubble.innerHTML = `
        ${escapeHtml(msg.body)}
        <span class="chat-meta">${mine ? "You" : "Admin"} · ${new Date(msg.created_at).toLocaleString("en-AU")}</span>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function init() {
    if (!orderId) {
        window.location.href = "account.html";
        return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
        window.location.href = "signin.html";
        return;
    }
    userId = session.user.id;

    const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error || !order) {
        document.getElementById("orderTitle").textContent = "Order not found";
        chatForm.style.display = "none";
        return;
    }

    document.getElementById("orderTitle").textContent = order.service;
    const statusEl = document.getElementById("orderStatus");
    statusEl.textContent = STATUS_LABEL[order.status] || order.status;
    statusEl.className = "status-pill status-" + order.status;
    document.getElementById("orderMeta").textContent =
        "Opened " + new Date(order.created_at).toLocaleDateString("en-AU") + (order.price ? " · $" + order.price : "");
    document.getElementById("orderNotes").textContent = order.notes || "";

    // Load existing messages
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

    (messages || []).forEach(renderMessage);

    // Mark admin messages as read now that the client is viewing them
    await supabase
        .from("messages")
        .update({ read: true })
        .eq("order_id", orderId)
        .eq("sender_role", "admin")
        .eq("read", false);

    // Live updates — new messages appear without a refresh
    supabase
        .channel("order-" + orderId)
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: "order_id=eq." + orderId },
            function (payload) {
                renderMessage(payload.new);
                if (payload.new.sender_role === "admin") {
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
        sender_role: "client",
        body: body
    }]);

    if (error) console.error(error);
});

init();
