import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const STATUS_LABEL = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled"
};

function orderCard(order) {
    const a = document.createElement("a");
    a.className = "order-card";
    a.href = "order.html?id=" + order.id;
    a.innerHTML = `
        <div class="order-main">
            <h3>${escapeHtml(order.service)}</h3>
            <p>Opened ${new Date(order.created_at).toLocaleDateString("en-AU")}${order.price ? " · $" + order.price : ""}</p>
        </div>
        <div class="order-side">
            <span class="status-pill status-${order.status}">${STATUS_LABEL[order.status] || order.status}</span>
        </div>
    `;
    return a;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

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

    const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    const pendingWrap = document.getElementById("pendingOrders");
    const historyWrap = document.getElementById("historyOrders");

    if (error || !orders || orders.length === 0) {
        document.getElementById("pendingEmpty").style.display = "block";
        document.getElementById("historyEmpty").style.display = "block";
        return;
    }

    const pending = orders.filter(function (o) { return o.status === "pending" || o.status === "in_progress"; });
    const history = orders.filter(function (o) { return o.status === "completed" || o.status === "cancelled"; });

    if (pending.length === 0) {
        document.getElementById("pendingEmpty").style.display = "block";
    } else {
        pending.forEach(function (o) { pendingWrap.appendChild(orderCard(o)); });
    }

    if (history.length === 0) {
        document.getElementById("historyEmpty").style.display = "block";
    } else {
        history.forEach(function (o) { historyWrap.appendChild(orderCard(o)); });
    }
}

document.getElementById("signOutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "index.html";
});

init();
