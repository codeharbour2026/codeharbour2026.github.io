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
        id: "tech-support",
        code: "TS",
        name: "Tech Support",
        blurb: "Hands-on help for the devices you rely on every day.",
        basePrice: 20,
        priceUnit: "starting / callout",
        configurable: false,
        bullets: [
            "Setup for laptops, phones & printers",
            "Troubleshooting slow or crashing devices",
            "Software installs & updates",
            "Home Wi-Fi & network fixes"
        ]
    },
    {
        id: "web-design",
        code: "WD",
        name: "Website Design",
        blurb: "A site built around what your visitors actually need to do.",
        basePrice: 150,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "multi-page", label: "Multiple pages (up to 5)", price: 100 },
            { id: "database", label: "Database included (accounts, listings, etc.)", price: 150 },
            { id: "ecommerce", label: "Online store / payments", price: 200 },
            { id: "booking", label: "Booking or appointment system", price: 80 },
            { id: "seo", label: "Search engine (SEO) setup", price: 60 },
            { id: "copywriting", label: "Content written for you", price: 70 }
        ]
    },
    {
        id: "maintenance",
        code: "WM",
        name: "Website Maintenance",
        blurb: "Keep an existing site current, secure and fast.",
        basePrice: 40,
        priceUnit: "starting / month",
        configurable: false,
        bullets: [
            "Security & software updates",
            "Content and image changes",
            "Uptime checks & backups",
            "Fast turnaround on issues"
        ]
    },
    {
        id: "cybersecurity",
        code: "CS",
        name: "Cybersecurity & Data Protection",
        blurb: "Lock down accounts, devices and home or office networks.",
        basePrice: 120,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "audit", label: "Full network security audit", price: 90 },
            { id: "antivirus", label: "Antivirus & firewall setup (per device)", price: 25 },
            { id: "password-mgr", label: "Password manager setup for your team", price: 40 },
            { id: "backup-encrypt", label: "Encrypted backup setup", price: 60 }
        ]
    },
    {
        id: "cloud-backup",
        code: "CB",
        name: "Cloud & Backup Solutions",
        blurb: "Store, sync and back up your files without losing sleep.",
        basePrice: 60,
        priceUnit: "starting / month",
        configurable: false,
        bullets: [
            "Automated daily backups",
            "Cloud storage setup & sync",
            "File recovery when things go wrong",
            "Storage sized to what you actually need"
        ]
    },
    {
        id: "app-development",
        code: "AD",
        name: "App Development",
        blurb: "Custom software or a mobile app built for your workflow.",
        basePrice: 500,
        priceUnit: "starting",
        configurable: true,
        features: [
            { id: "ios", label: "iOS app", price: 300 },
            { id: "android", label: "Android app", price: 300 },
            { id: "backend", label: "Backend & database", price: 250 },
            { id: "push", label: "Push notifications", price: 80 }
        ]
    }
];
