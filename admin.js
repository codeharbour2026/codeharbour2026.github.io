import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const STATUSES = ["pending", "in_progress", "completed", "cancelled"];

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

function showBox(el, message, ok) {
    el.textContent = message;
    el.classList.add("show");
    el.classList.toggle("ok", ok);
    el.classList.toggle("err", !ok);
}

// ---------- Orders ----------

async function loadOrders() {
    const tbody = document.getElementById("ordersBody");
    const empty = document.getElementById("ordersEmpty");
    tbody.innerHTML = "";

    const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(email)")
        .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
        empty.classList.add("show");
        return;
    }
    empty.classList.remove("show");

    data.forEach(function (order) {
        const tr = document.createElement("tr");
        const statusOptions = STATUSES.map(function (s) {
            return `<option value="${s}"${s === order.status ? " selected" : ""}>${s.replace("_", " ")}</option>`;
        }).join("");

        tr.innerHTML = `
            <td>${escapeHtml(order.profiles ? order.profiles.email : "—")}</td>
            <td>${escapeHtml(order.service)}</td>
            <td>${order.price ? "$" + order.price : "—"}</td>
            <td><select class="status-select" data-order-id="${order.id}">${statusOptions}</select></td>
            <td>${new Date(order.created_at).toLocaleDateString("en-AU")}</td>
            <td><a href="admin-order.html?id=${order.id}">Open thread</a></td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".status-select").forEach(function (select) {
        select.addEventListener("change", async function () {
            await supabase
                .from("orders")
                .update({ status: select.value, updated_at: new Date().toISOString() })
                .eq("id", select.dataset.orderId);
        });
    });
}

const newOrderForm = document.getElementById("newOrderForm");
const newOrderError = document.getElementById("newOrderError");
const newOrderStatus = document.getElementById("newOrderStatus");

newOrderForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    newOrderError.classList.remove("show");
    newOrderStatus.classList.remove("show");

    const email = document.getElementById("clientEmail").value.trim();
    const service = document.getElementById("orderService").value.trim();
    const price = document.getElementById("orderPrice").value;
    const notes = document.getElementById("orderNotes").value.trim();

    const { data: userId, error: lookupError } = await supabase.rpc("admin_lookup_user_id", { lookup_email: email });

    if (lookupError || !userId) {
        showBox(newOrderError, "No account found for that email — ask them to sign up first.", false);
        return;
    }

    const { error: insertError } = await supabase.from("orders").insert([{
        user_id: userId,
        service: service,
        price: price ? Number(price) : null,
        notes: notes || null
    }]);

    if (insertError) {
        showBox(newOrderError, "Couldn't create the order: " + insertError.message, false);
        return;
    }

    showBox(newOrderStatus, "Order created.", true);
    newOrderForm.reset();
    loadOrders();
});

// Prefill the new-order form from an enquiry row
function wireCreateOrderButtons() {
    document.querySelectorAll("[data-create-order]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.getElementById("clientEmail").value = btn.dataset.email || "";
            document.getElementById("orderService").value = btn.dataset.service || "";
            document.getElementById("clientEmail").scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
}

// ---------- Enquiries ----------

async function loadEnquiries() {
    const tableBody = document.getElementById("enquiriesBody");
    const emptyState = document.getElementById("emptyState");
    tableBody.innerHTML = "";

    const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
        emptyState.classList.add("show");
        return;
    }
    emptyState.classList.remove("show");

    data.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + escapeHtml(row.name) + "</td>" +
            "<td><a href=\"mailto:" + escapeHtml(row.email) + "\">" + escapeHtml(row.email) + "</a></td>" +
            "<td>" + escapeHtml(row.service || "—") + "</td>" +
            "<td>" + escapeHtml(row.message) + "</td>" +
            "<td>" + new Date(row.created_at).toLocaleString("en-AU") + "</td>" +
            "<td><button type=\"button\" class=\"btn-nav\" data-create-order data-email=\"" + escapeHtml(row.email) + "\" data-service=\"" + escapeHtml(row.service || "") + "\">Create order</button></td>";
        tableBody.appendChild(tr);
    });

    wireCreateOrderButtons();
}

// ---------- Unread badge (live) ----------

async function refreshUnreadBadge() {
    const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_role", "client")
        .eq("read", false);

    const badge = document.getElementById("unreadBadge");
    const link = document.getElementById("unreadLink");
    badge.textContent = count || 0;
    link.style.display = count ? "inline-flex" : "none";

    if (count) {
        const { data } = await supabase
            .from("messages")
            .select("order_id")
            .eq("sender_role", "client")
            .eq("read", false)
            .order("created_at", { ascending: true })
            .limit(1);
        if (data && data[0]) {
            link.href = "admin-order.html?id=" + data[0].order_id;
        }
    }
}

// ---------- Init ----------

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
        await supabase.auth.signOut();
        window.location.href = "login.html";
        return;
    }

    document.getElementById("whoami").textContent = session.user.email;

    await Promise.all([loadOrders(), loadEnquiries(), refreshUnreadBadge()]);

    supabase
        .channel("admin-unread")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages" },
            function (payload) {
                if (payload.new.sender_role === "client") refreshUnreadBadge();
            }
        )
        .subscribe();
}

document.getElementById("signOutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "login.html";
});

init();
