import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCRK_SmAwKXEV73lLEQyD-iV4OINoN70o",
  authDomain: "ebaybd-dee4d.firebaseapp.com",
  projectId: "ebaybd-dee4d",
  storageBucket: "ebaybd-dee4d.firebasestorage.app",
  messagingSenderId: "1021079410863",
  appId: "1:1021079410863:web:7d090076138cfbe56bdc5a",
  measurementId: "G-WVY94NZ1HF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDatabase() {
    console.log("🚀 Initializing complete database schema and default records in Firestore...");

    try {
        // 1. SITE CONFIG (Document ID: '1')
        console.log("📦 1. Setting up 'site_config' collection...");
        await setDoc(doc(db, "site_config", "1"), {
            config: {
                siteTitle: "Ebaybd",
                themeColor: "#f2422b",
                buttonColor: "#f2422b",
                fontSize: "14px",
                header: {
                    logoText: "Ebaybd",
                    logoImage: "",
                    topBarLinks: [
                        { id: "1", text: "Save More on App", url: "#" },
                        { id: "2", text: "Sell on Ebaybd", url: "/seller" },
                        { id: "3", text: "Customer Care", url: "#" }
                    ],
                    middleBarLinks: []
                },
                footer: {
                    logoImage: "",
                    description: "Ebaybd is Bangladesh's leading multi-vendor and reseller e-commerce ecosystem.",
                    contact: {
                        address: "Dhaka, Bangladesh",
                        email: "support@ebaybd.com",
                        phone: "+880 1700-000000",
                        whatsapp: "+880 1700-000000"
                    },
                    appLinks: {
                        playStore: "#",
                        appStore: "#"
                    },
                    socials: {
                        facebook: "https://facebook.com",
                        youtube: "https://youtube.com",
                        instagram: "https://instagram.com",
                        twitter: "https://twitter.com"
                    },
                    column1: {
                        title: "Customer Care",
                        links: [
                            { id: "1", text: "Help Center", url: "#" },
                            { id: "2", text: "How to Buy", url: "#" },
                            { id: "3", text: "Returns & Refunds", url: "#" },
                            { id: "4", text: "Contact Us", url: "#" }
                        ]
                    },
                    column2: {
                        title: "Quick Links",
                        links: [
                            { id: "1", text: "About Us", url: "#" },
                            { id: "2", text: "Careers", url: "#" },
                            { id: "3", text: "Terms & Conditions", url: "#" },
                            { id: "4", text: "Privacy Policy", url: "#" }
                        ]
                    },
                    column3: {
                        title: "Ebaybd Services",
                        links: [
                            { id: "1", text: "Reseller Program", url: "/reseller" },
                            { id: "2", text: "Seller Center", url: "/seller" },
                            { id: "3", text: "Affiliate Hub", url: "/reseller" }
                        ]
                    },
                    copyright: `© ${new Date().getFullYear()} Ebaybd. All rights reserved.`,
                    backgroundImage: "",
                    textColor: "#ffffff",
                    headerColor: "#f2422b"
                },
                heroSlider: [
                    { id: "hs1", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=450", url: "/shop" },
                    { id: "hs2", image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=1200&h=450", url: "/shop" }
                ],
                heroAd: {
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500&h=600",
                    url: "/shop"
                },
                homeBanners: [
                    { id: "1", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=600", url: "/shop" },
                    { id: "2", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600", url: "/shop" }
                ],
                emergencyBanners: [
                    { id: "eb1", image: "", url: "#" },
                    { id: "eb2", image: "", url: "#" }
                ],
                emergencyServices: [
                    { id: 1, name: "MEDICAL", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 2, name: "EMERGENCY HOSPITAL", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 3, name: "FIRE SERVICE", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 4, name: "AMBULANCE", img: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 5, name: "BLOOD BANK", img: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 6, name: "DISASTER MANAGEMENT", img: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=200&h=200", url: "#" },
                    { id: 7, name: "CRISIS SUPPORT", img: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&q=80&w=200&h=200", url: "#" }
                ],
                menus: [],
                menuLocations: { topBar: "", primary: "", footerCol1: "", footerCol2: "", footerCol3: "" },
                dynamicPages: [],
                courierConfig: {
                    steadfast: { enabled: true, apiKey: "", secretKey: "", baseUrl: "https://portal.steadfast.com.bd/api/v1" },
                    pathao: { enabled: false, apiKey: "", secretKey: "", baseUrl: "https://api-hermes.pathao.com" }
                },
                financialSettings: {
                    sellerCommission: 5,
                    resellerCommission: 10,
                    minWithdrawal: 500,
                    autoApprove: false
                },
                aiPrompt: "You are an intelligent shopping assistant for Ebaybd. Help customers find products, explain details, and answer store questions politely in Bengali.",
                aiApiKey: ""
            }
        }, { merge: true });
        console.log("✅ 'site_config' initialized.");

        // 2. PAYMENT GATEWAYS
        console.log("💳 2. Setting up 'platform_payment_gateways' collection...");
        const gateways = [
            { id: "bkash", provider: "bkash", is_active: true, mode: "sandbox", merchant_number: "01712345678", account_type: "Merchant", app_key: "", app_secret: "", username: "", password: "" },
            { id: "nagad", provider: "nagad", is_active: false, mode: "sandbox", merchant_number: "", account_type: "Merchant", merchant_id: "", public_key: "", private_key: "" },
            { id: "rocket", provider: "rocket", is_active: false, mode: "sandbox", merchant_number: "", account_type: "Merchant", merchant_id: "", secret_key: "" },
            { id: "uddoktapay", provider: "uddoktapay", is_active: false, mode: "sandbox", app_key: "", base_url: "https://sandbox.uddoktapay.com" }
        ];
        for (const g of gateways) {
            await setDoc(doc(db, "platform_payment_gateways", g.id), g, { merge: true });
        }
        console.log("✅ 'platform_payment_gateways' initialized.");

        // 3. CATEGORIES
        console.log("📂 3. Setting up 'categories' collection...");
        const initialCategories = [
            {
                id: "cat_fashion",
                name: "Fashion & Apparel",
                img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400",
                subcategories: [
                    { title: "Men's Clothing", items: ["T-Shirts", "Shirts", "Pants", "Jackets"] },
                    { title: "Women's Fashion", items: ["Sarees", "Kurtis", "Gowns", "Bags"] }
                ],
                created_at: new Date().toISOString()
            },
            {
                id: "cat_electronics",
                name: "Electronics & Gadgets",
                img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400",
                subcategories: [
                    { title: "Audio & Accessories", items: ["AirPods", "Earphones", "Bluetooth Speakers"] },
                    { title: "Smart Devices", items: ["Smartwatches", "Power Banks", "Chargers"] }
                ],
                created_at: new Date().toISOString()
            },
            {
                id: "cat_home",
                name: "Home & Lifestyle",
                img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400",
                subcategories: [
                    { title: "Kitchenware", items: ["Cookware", "Blenders", "Utensils"] },
                    { title: "Decor", items: ["Wall Art", "Lamps", "Clocks"] }
                ],
                created_at: new Date().toISOString()
            }
        ];
        for (const cat of initialCategories) {
            await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
        }
        console.log("✅ 'categories' initialized.");

        // 4. SAMPLE PRODUCTS
        console.log("🛍️ 4. Setting up 'products' collection...");
        const sampleProducts = [
            {
                id: "prod_airpods_pro",
                title: "Wireless Bluetooth Earbuds Pro",
                price: 1450,
                original_price: 2800,
                discount: "48% OFF",
                image: "https://images.unsplash.com/photo-1588423770674-f2855ee476e7?auto=format&fit=crop&q=80&w=500",
                images: [
                    "https://images.unsplash.com/photo-1588423770674-f2855ee476e7?auto=format&fit=crop&q=80&w=500",
                    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=500"
                ],
                description: "Crystal clear sound with Active Noise Cancellation and deep bass.",
                stock: 50,
                sold: 14,
                category_id: "cat_electronics",
                is_flash_sale: true,
                is_just_for_you: true,
                is_new_arrival: true,
                has_variants: true,
                variants: [
                    { id: "v1", name: "White", price: 1450, stock: 30, image: "https://images.unsplash.com/photo-1588423770674-f2855ee476e7?auto=format&fit=crop&q=80&w=500" },
                    { id: "v2", name: "Midnight Black", price: 1550, stock: 20, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=500" }
                ],
                variant_config: { attributes: ["Color"] },
                created_at: new Date().toISOString()
            },
            {
                id: "prod_smartwatch",
                title: "Smart Fitness Watch Ultra",
                price: 2200,
                original_price: 3900,
                discount: "44% OFF",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500",
                images: [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500"
                ],
                description: "Heart rate monitor, step tracker, waterproof with HD AMOLED screen.",
                stock: 35,
                sold: 8,
                category_id: "cat_electronics",
                is_flash_sale: true,
                is_just_for_you: true,
                is_new_arrival: false,
                has_variants: false,
                variants: [],
                created_at: new Date().toISOString()
            },
            {
                id: "prod_sneakers",
                title: "Men's Urban Breathable Sneakers",
                price: 1850,
                original_price: 3200,
                discount: "42% OFF",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500",
                images: [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500"
                ],
                description: "Lightweight and cushioned running shoes for daily comfort.",
                stock: 40,
                sold: 22,
                category_id: "cat_fashion",
                is_flash_sale: false,
                is_just_for_you: true,
                is_new_arrival: true,
                has_variants: true,
                variants: [
                    { id: "v_sz_40", name: "Size 40", price: 1850, stock: 15 },
                    { id: "v_sz_41", name: "Size 41", price: 1850, stock: 15 },
                    { id: "v_sz_42", name: "Size 42", price: 1850, stock: 10 }
                ],
                variant_config: { attributes: ["Size"] },
                created_at: new Date().toISOString()
            }
        ];
        for (const prod of sampleProducts) {
            await setDoc(doc(db, "products", prod.id), prod, { merge: true });
        }
        console.log("✅ 'products' initialized.");

        // 5. MASTER SUPER ADMIN PROFILE & WALLET
        console.log("👑 5. Setting up 'profiles' & 'wallets' structure...");
        await setDoc(doc(db, "profiles", "admin_master_profile"), {
            full_name: "Super Admin",
            email: "admin@ebaybd.com",
            role: "admin",
            status: "approved",
            store_name: "Ebaybd Official Store",
            store_logo: "",
            store_banner: "",
            withdrawal_accounts: { bkash: "01712345678", nagad: "", rocket: "", bank: {} },
            created_at: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(db, "wallets", "admin_master_profile"), {
            user_id: "admin_master_profile",
            balance: 0,
            pending: 0,
            total_withdrawn: 0,
            transactions: [],
            updated_at: new Date().toISOString()
        }, { merge: true });
        console.log("✅ 'profiles' and 'wallets' initialized.");

        console.log("\n🎉 ALL COLLECTIONS & REQUIRED COLUMNS INITIALIZED SUCCESSFULLY IN FIRESTORE!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err);
        process.exit(1);
    }
}

initializeDatabase();
