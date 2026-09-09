/*
 * WIDGETS — every service on the site is one object in this array.
 *
 * To ADD a service: copy an existing object, give it a unique "id", and add it to the array.
 * To REMOVE a service: delete its object. Nothing else needs to change —
 * the Services grid and the Quote page both read from this file automatically.
 *
 * "configurable: true" widgets get a checkbox feature list with live pricing on the quote page.
 * "configurable: false" widgets show a plain bullet list and a fixed starting price instead.
 */

const WIDGETS = [
    {
        id: "website-creation",
        code: "WC",
        name: "Website Creation",
        blurb: "A modern website built for your business, project or organisation.",
        basePrice: 150,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "extra-pages", label: "Extra pages (up to 5 total)", price: 50 },
            { id: "contact-form", label: "Contact form", price: 30 },
            { id: "gallery", label: "Photo gallery", price: 25 },
            { id: "mobile", label: "Mobile optimisation", price: 20 },
            { id: "custom-design", label: "Custom design & branding", price: 60 },
            { id: "blog", label: "News or blog section", price: 40 }
        ]
    },
    {
        id: "business-website",
        code: "BW",
        name: "Business Website",
        blurb: "A professional website designed to showcase your business.",
        basePrice: 250,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "team-page", label: "Team or staff page", price: 30 },
            { id: "testimonials", label: "Customer testimonials section", price: 25 },
            { id: "google-maps", label: "Google Maps integration", price: 20 },
            { id: "quote-form", label: "Quote request form", price: 40 },
            { id: "seo-setup", label: "Basic SEO setup", price: 50 },
            { id: "analytics", label: "Website analytics setup", price: 25 }
        ]
    },
    {
        id: "online-store",
        code: "OS",
        name: "Online Store",
        blurb: "Sell products online with a simple, easy-to-manage store.",
        basePrice: 350,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "payments", label: "Payment gateway setup", price: 75 },
            { id: "extra-products", label: "Additional product setup", price: 40 },
            { id: "discount-codes", label: "Discount & coupon system", price: 30 },
            { id: "accounts", label: "Customer accounts", price: 50 },
            { id: "inventory", label: "Inventory tracking", price: 50 },
            { id: "shipping", label: "Shipping configuration", price: 40 }
        ]
    },
    {
        id: "website-maintenance",
        code: "WM",
        name: "Website Maintenance",
        blurb: "Keep your website updated and running smoothly.",
        basePrice: 30,
        priceUnit: "starting / month",
        configurable: true,
        features: [
            { id: "content-updates", label: "Monthly content updates", price: 15 },
            { id: "priority-support", label: "Priority support", price: 20 },
            { id: "backups", label: "Regular backups", price: 10 },
            { id: "monitoring", label: "Website monitoring", price: 10 },
            { id: "reports", label: "Monthly performance report", price: 10 }
        ]
    },
    {
        id: "hosting-setup",
        code: "HS",
        name: "Website Hosting Setup",
        blurb: "Get your website online with hosting and domain configuration.",
        basePrice: 40,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "domain", label: "Domain connection", price: 15 },
            { id: "ssl", label: "SSL certificate setup", price: 15 },
            { id: "migration", label: "Website migration", price: 30 },
            { id: "email", label: "Business email setup", price: 25 }
        ]
    },
    {
        id: "contact-systems",
        code: "CF",
        name: "Contact & Enquiry Systems",
        blurb: "Allow customers to contact you and manage enquiries.",
        basePrice: 40,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "email-alerts", label: "Email notifications", price: 10 },
            { id: "dashboard", label: "Enquiry dashboard", price: 40 },
            { id: "database", label: "Database storage", price: 30 },
            { id: "spam-protection", label: "Spam protection", price: 15 },
            { id: "attachments", label: "File upload support", price: 20 }
        ]
    },
    {
        id: "tech-support",
        code: "TS",
        name: "Tech Support",
        blurb: "Help with common technology problems at home or for small businesses.",
        basePrice: 20,
        priceUnit: "starting / session",
        configurable: true,
        features: [
            { id: "printer", label: "Printer setup", price: 10 },
            { id: "wifi", label: "Wi-Fi troubleshooting", price: 15 },
            { id: "software", label: "Software installation", price: 10 },
            { id: "device-setup", label: "New device setup", price: 15 },
            { id: "data-transfer", label: "Data transfer", price: 20 }
        ]
    },
    {
        id: "school-community",
        code: "SC",
        name: "School & Community Websites",
        blurb: "Affordable websites for clubs, teams and community groups.",
        basePrice: 120,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "calendar", label: "Event calendar", price: 25 },
            { id: "gallery", label: "Photo gallery", price: 20 },
            { id: "signup", label: "Member signup form", price: 30 },
            { id: "newsletter", label: "Newsletter signup", price: 20 },
            { id: "downloads", label: "Document downloads", price: 15 }
        ]
    }
];
