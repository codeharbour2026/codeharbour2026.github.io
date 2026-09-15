import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

document.getElementById("techLink").href = window.SITE_LINKS.techindustries;
document.getElementById("toolsLink").href = window.SITE_LINKS.tools;

async function init() {
    const { data } = await supabase.auth.getSession();
    const heroButtons = document.getElementById("heroButtons");

    if (data.session) {
        heroButtons.innerHTML = `
            <a href="account.html" class="btn btn-primary">Go to my account</a>
        `;
    }
}

init();
