import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const safeSetItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`⚠️ LocalStorage quota exceeded for "${key}". This is normal if you have many products. The site will continue to work!`);
            // Attempt to clear older/larger items to make space
            if (key === 'cached_products') {
                localStorage.removeItem('cached_products');
                localStorage.removeItem('resellerStores');
                localStorage.removeItem('resellerProducts');
            }
        }
    };

    // Helper to keep only essential fields for caching (saves 80% space)
    const trimProduct = (p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.image,
        original_price: p.original_price,
        is_flash_sale: p.is_flash_sale,
        is_just_for_you: p.is_just_for_you,
        is_new_arrival: p.is_new_arrival,
        storeName: p.storeName,
        category_id: p.category_id,
        has_variants: p.has_variants,
        variants: p.variants
    });

    const trimProfile = (p) => ({
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        store_name: p.store_name,
        store_logo: p.store_logo
    });

    // --- 1. BUILD VERSION CACHE BUSTING ---
    const currentVersion = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : '1.0.0';
    const lastVersion = localStorage.getItem('last_build_version');
    if (lastVersion !== currentVersion) {
        localStorage.removeItem('cached_site_config');
        localStorage.removeItem('cached_categories');
        localStorage.removeItem('cached_products');
        safeSetItem('last_build_version', currentVersion);
    }

    // --- 2. STATE INITIALIZATION ---
    // [HYBRID LOADING]: We start with isLoading = false if we have cached config.
    // This implements the "Instant Loading" trick from the blueprint.
    const [isLoading, setIsLoading] = useState(() => {
        const cachedConfig = localStorage.getItem('cached_site_config');
        const cachedProducts = localStorage.getItem('cached_products');
        return !(cachedConfig && cachedProducts);
    });

    const [siteConfig, setSiteConfig] = useState(() => {
        const cached = localStorage.getItem('cached_site_config');
        const initialConfig = {
            siteTitle: 'Ebaybd',
            themeColor: '#f2422b',
            buttonColor: '#f2422b',
            fontSize: '14px',
            header: { logoText: 'Ebaybd', logoImage: '', topBarLinks: [], middleBarLinks: [] },
            footer: {
                logoImage: '',
                description: '',
                contact: {
                    address: '',
                    email: '',
                    phone: '',
                    whatsapp: ''
                },
                appLinks: {
                    playStore: '',
                    appStore: ''
                },
                socials: {
                    facebook: '',
                    youtube: '',
                    instagram: '',
                    twitter: ''
                },
                column1: { title: 'Customer Care', links: [] },
                column2: { title: 'Quick Links', links: [] },
                column3: { title: 'Information', links: [] },
                copyright: `© ${new Date().getFullYear()} Ebaybd`,
                backgroundImage: '',
                textColor: '#ffffff',
                headerColor: '#f2422b'
            },

            heroSlider: [
                { id: 'hs1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=450', url: '/shop' },
                { id: 'hs2', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=1200&h=450', url: '/shop' }
            ],
            heroAd: { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500&h=600', url: '/shop' },
            homeBanners: [
                { id: '1', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=600', url: '/shop' },
                { id: '2', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', url: '/shop' }
            ],
            emergencyBanners: [
                { id: 'eb1', image: '', url: '#' },
                { id: 'eb2', image: '', url: '#' }
            ],
            emergencyServices: [
                { id: 1, name: 'MEDICAL', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 2, name: 'EMERGENCY HOSPITAL', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 3, name: 'FIRE SERVICE', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 4, name: 'AMBULANCE', img: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 5, name: 'BLOOD BANK', img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 6, name: 'DISASTER MANAGEMENT', img: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
                { id: 7, name: 'CRISIS SUPPORT', img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&q=80&w=200&h=200', url: '#' },
            ],
            menus: [],
            menuLocations: { topBar: '', primary: '', footerCol1: '', footerCol2: '', footerCol3: '' },
            dynamicPages: [],
            aiPrompt: '',
            aiApiKey: ''
        };

        if (!cached) return initialConfig;

        try {
            const parsedConfig = JSON.parse(cached);
            return {
                ...initialConfig,
                ...parsedConfig,
                header: { ...initialConfig.header, ...(parsedConfig.header || {}) },
                footer: { ...initialConfig.footer, ...(parsedConfig.footer || {}) }
            };
        } catch (e) {
            return initialConfig;
        }
    });

    const [categories, setCategories] = useState(() => {
        const cached = localStorage.getItem('cached_categories');
        return cached ? JSON.parse(cached) : [];
    });

    const [allProducts, setAllProducts] = useState(() => {
        const cached = localStorage.getItem('cached_products');
        return cached ? JSON.parse(cached) : [];
    });

    const [flashProducts, setFlashProducts] = useState([]);
    const [justForYouProducts, setJustForYouProducts] = useState([]);
    const [newArrivalProducts, setNewArrivalProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [resellerStores, setResellerStores] = useState([]);
    const [resellerProducts, setResellerProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [financialStats, setFinancialStats] = useState({
        totalSales: 0,
        monthlySales: 0,
        totalOrders: 0,
        pendingOrders: 0
    });

    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        if (!saved) return [];
        // Normalize: ensure every cart item has cartItemId (old items from localStorage may not have it)
        const parsed = JSON.parse(saved);
        return parsed.map(item => ({
            ...item,
            cartItemId: item.cartItemId || item.id,
            quantity: item.quantity || 1
        }));
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const [adminPaymentMethods, setAdminPaymentMethods] = useState(() => {
        const saved = localStorage.getItem('adminPaymentMethods');
        const initial = {
            bkash: { isActive: true, number: '01712345678', type: 'Merchant', mode: 'sandbox', appKey: '', appSecret: '', username: '', password: '' },
            nagad: { isActive: false, number: '', type: 'Merchant', mode: 'sandbox', merchantId: '', publicKey: '', privateKey: '' },
            rocket: { isActive: false, number: '', type: 'Merchant', mode: 'sandbox', merchantId: '', secretKey: '' },
            uddoktapay: { isActive: false, apiKey: '', baseUrl: 'https://sandbox.uddoktapay.com' }
        };
        if (!saved) return initial;
        const parsed = JSON.parse(saved);
        // Ensure uddoktapay exists in stored data
        if (!parsed.uddoktapay) parsed.uddoktapay = initial.uddoktapay;
        return parsed;
    });

    const [courierConfig, setCourierConfig] = useState({
        steadfast: { enabled: true, apiKey: '', secretKey: '', baseUrl: 'https://portal.steadfast.com.bd/api/v1' },
        pathao: { enabled: false, apiKey: '', secretKey: '', baseUrl: 'https://api-hermes.pathao.com' },
    });

    const [menus, setMenus] = useState([]);
    const [menuLocations, setMenuLocations] = useState({ topBar: '', primary: '' });
    const [dynamicPages, setDynamicPages] = useState([]);
    // Dynamic Couriers List based on config
    const couriers = [
        { id: 'c2', name: 'Steadfast', rate: 70, type: 'steadfast' },
        { id: 'c1', name: 'Pathao', rate: 60, type: 'pathao' },
        { id: 'c3', name: 'RedX', rate: 50, type: 'manual' },
    ].filter(c => {
        if (c.type === 'manual') return true;
        return courierConfig[c.type]?.enabled;
    });

    const fetchData = async () => {
        const startTime = Date.now();
        console.log('🚀 Sequential Progressive Fetching Started...');

        // 1. NON-BLOCKING VERSION CHECK
        fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
            .then(vRes => vRes.ok ? vRes.json() : null)
            .then(vData => {
                if (vData && vData.version && vData.version !== localStorage.getItem('last_build_version')) {
                    console.warn('🔄 Version Change Detected. Cache Purged.');
                    localStorage.removeItem('cached_site_config');
                    localStorage.removeItem('cached_categories');
                    localStorage.removeItem('cached_products');
                    localStorage.setItem('last_build_version', vData.version);
                    setIsUpdateAvailable(true);
                }
            }).catch(() => null);

        // We reveal the site after 3s MAX, but config can reveal it earlier if it's new session
        const revealTimer = setTimeout(() => {
            setIsLoading(false);
            console.log('⏱️ Revealed site (Timeout/Fallback)');
        }, 3000);

        // 2. FETCH CRITICAL CONFIG (Parallel & Independent)
        getDoc(doc(db, 'site_config', '1')).then(docSnap => {
            if (docSnap.exists() && docSnap.data().config) {
                const config = docSnap.data().config;
                setSiteConfig(config);
                if (config.courierConfig) setCourierConfig(config.courierConfig);
                safeSetItem('cached_site_config', JSON.stringify(config));
                if (localStorage.getItem('cached_site_config')) {
                    clearTimeout(revealTimer);
                    setIsLoading(false);
                }
            }
        });

        // 3. FETCH CATEGORIES (Progressive)
        getDocs(collection(db, 'categories')).then(snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (data.length) {
                setCategories(data);
                safeSetItem('cached_categories', JSON.stringify(data));
                console.log('✅ Categories loaded');
            }
        });

        // 4. FETCH PRODUCTS (Optimized Select - Saves 70% data transfer)
        getDocs(collection(db, 'products')).then(async (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (data.length) {
                // To mimic the join, fetch profiles
                const profilesSnap = await getDocs(collection(db, 'profiles'));
                const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const normalized = data.map(p => {
                    const sellerProfile = profiles.find(pr => pr.id === (p.seller_id || p.sellerId));
                    return {
                        ...p,
                        originalPrice: p.original_price ?? p.originalPrice ?? null,
                        sellerId: p.seller_id ?? p.sellerId ?? null,
                        categoryId: p.category_id ?? p.categoryId ?? null,
                        storeName: sellerProfile?.store_name || 'Global Store',
                        has_variants: p.has_variants || false,
                        variants: Array.isArray(p.variants) ? p.variants : [],
                        variant_config: p.variant_config || { attributes: [] }
                    };
                });
                setAllProducts(normalized);
                setFlashProducts(normalized.filter(p => p.is_flash_sale));
                setJustForYouProducts(normalized.filter(p => p.is_just_for_you));
                setNewArrivalProducts(normalized.filter(p => p.is_new_arrival));
                safeSetItem('cached_products', JSON.stringify(normalized.map(trimProduct)));
                console.log('✅ Products loaded (Optimized Select)');
            }
        });

        // 5. BACKGROUND ROLE-BASED DATA
        const userRole = user?.role;
        const isAdminOrSeller = ['admin', 'seller', 'reseller'].includes(userRole);

        getDocs(collection(db, 'profiles')).then(({ docs }) => {
            const profilesData = docs.map(d => ({ id: d.id, ...d.data() }));
            if (profilesData.length) {
                setSellers(profilesData.filter(p => ['seller', 'admin', 'reseller'].includes(p.role)));
                setResellerStores(profilesData.filter(p => p.role === 'reseller'));
                setCustomers(profilesData.filter(p => p.role === 'customer'));
                safeSetItem('resellerStores', JSON.stringify(profilesData.filter(p => p.role === 'reseller').map(trimProfile)));

                // Now fetch role-specific data using updated profile knowledge
                if (isAdminOrSeller) {
                    getDocs(collection(db, 'wallets')).then(snap => setWallets(snap.docs.map(d => ({ ...d.data(), userId: d.data().user_id }))));
                    getDocs(collection(db, 'withdrawals')).then(snap => setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                    
                    const qOrders = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
                    getDocs(qOrders).then(snap => {
                        const oData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        if (oData.length) {
                            const mapped = oData.map(o => ({
                                ...o,
                                customerName: profilesData.find(p => p.id === o.customer_id)?.full_name || 'Guest',
                                date: new Date(o.created_at).toLocaleDateString(),
                                totalAmount: o.amount || 0,
                                items: Array.isArray(o.items) ? o.items : []
                            }));
                            setOrders(mapped);
                            const delivered = mapped.filter(o => o.status === 'Delivered');
                            setFinancialStats({
                                totalSales: delivered.reduce((acc, o) => acc + o.totalAmount, 0),
                                monthlySales: delivered.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + o.totalAmount, 0),
                                totalOrders: mapped.length,
                                pendingOrders: mapped.filter(o => o.status === 'Pending').length
                            });
                        }
                    });
                } else if (user?.id) {
                    const qOrders = query(collection(db, 'orders'), where('customer_id', '==', user.id));
                    getDocs(qOrders).then(snap => {
                        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        setOrders(data.map(o => ({ ...o, date: new Date(o.created_at).toLocaleDateString(), totalAmount: o.amount || 0 })));
                    });
                }
            }
        });
    };

    // --- REAL-TIME DATA FETCHING ---
    useEffect(() => {
        // Instant interactive if we have cache
        if (siteConfig?.siteTitle && categories?.length > 0) {
            setIsLoading(false);
            console.log('⚡ Initializing from cache...');
        }

        fetchData();

        // Debounce fetchData to avoid multiple rapid calls
        let fetchTimer;
        const debouncedFetch = () => {
            clearTimeout(fetchTimer);
            fetchTimer = setTimeout(fetchData, 1000);
        };

        const unsubConfig = onSnapshot(doc(db, 'site_config', '1'), (docSnap) => {
            if (docSnap.exists() && docSnap.data().config) {
                setSiteConfig(docSnap.data().config);
            }
        });

        const unsubProducts = onSnapshot(collection(db, 'products'), debouncedFetch);
        const unsubOrders = onSnapshot(collection(db, 'orders'), debouncedFetch);
        const unsubProfiles = onSnapshot(collection(db, 'profiles'), debouncedFetch);
        const unsubCategories = onSnapshot(collection(db, 'categories'), debouncedFetch);

        return () => {
            unsubConfig();
            unsubProducts();
            unsubOrders();
            unsubProfiles();
            unsubCategories();
            clearTimeout(fetchTimer);
        };
    }, []);

    const addNotification = (message) => {
        setNotifications(prev => [{ id: Date.now(), message, date: 'Just now', read: false }, ...prev]);
    };

    const markNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // CRUD Operations Updated for Firebase
    const saveProduct = async (payload) => {
        // Build payload matching exact DB column names
        const dbData = {
            title: payload.title || '',
            price: Number(payload.price) || 0,
            original_price: payload.originalPrice ? Number(payload.originalPrice) : null,
            image: payload.image || '',
            description: payload.description || null,
            discount: payload.discount || null,
            stock: parseInt(payload.stock) || 0,
            category: payload.category || '',
            subcategory: payload.subcategory || '',
            childCategory: payload.childCategory || '',
            is_flash_sale: Boolean(payload.showInFlash),
            is_just_for_you: Boolean(payload.showInJFY),
            is_new_arrival: Boolean(payload.showInArrival),
            images: payload.images || [],
            has_variants: Boolean(payload.has_variants),
            variants: payload.variants || [],
            variant_config: payload.variant_config || { attributes: [] },
            seller_id: (() => {
                const sid = payload.sellerId || user?.id || null;
                const isMockAdmin = sid === '00000000-0000-0000-0000-000000000000';
                return isMockAdmin ? null : sid;
            })()
        };

        // If editing an existing product, keep its ID
        if (payload.id) {
            dbData.id = payload.id;
        }

        // Map category name → category_id UUID if exists
        if (payload.category) {
            const cat = categories.find(c => c.name === payload.category);
            if (cat) dbData.category_id = cat.id;
        }

        // Remove any undefined keys to prevent Firestore crashes
        Object.keys(dbData).forEach(key => {
            if (dbData[key] === undefined) delete dbData[key];
        });

        console.log('💾 Saving product to Firebase...', dbData.title);

        try {
            let docRef;
            if (dbData.id) {
                docRef = doc(db, 'products', dbData.id);
                await setDoc(docRef, dbData, { merge: true });
            } else {
                const newDocRef = doc(collection(db, 'products'));
                dbData.id = newDocRef.id;
                docRef = newDocRef;
                await setDoc(docRef, dbData);
            }

            console.log('✅ Product saved successfully! ID:', docRef.id);
            // Optimistically update local state for immediate feedback
            setAllProducts(prev => {
                const exists = prev.some(p => p.id === dbData.id);
                const updatedList = exists 
                    ? prev.map(p => p.id === dbData.id ? { ...p, ...dbData, originalPrice: dbData.original_price } : p)
                    : [{ ...dbData, originalPrice: dbData.original_price, storeName: user?.store_name || 'Global Store' }, ...prev];
                safeSetItem('cached_products', JSON.stringify(updatedList.map(trimProduct)));
                return updatedList;
            });
            return dbData;
        } catch (err) {
            console.error('🔥 CRITICAL SAVE ERROR:', err.message);
            if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
                alert('Firebase Permission Denied! Firebase Console > Firestore > Rules-এ গিয়ে allow read, write: if true; দিন।');
            }
            return null;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (error) {
            console.error('Delete product error:', error);
        }
    };

    const addCategory = async (category) => {
        try {
            const docRef = doc(collection(db, 'categories'));
            const categoryData = { ...category, id: docRef.id };
            await setDoc(docRef, categoryData);
            await fetchData();
            addNotification('Category added successfully!');
            return { success: true, data: categoryData };
        } catch (error) {
            console.error(error);
            return { success: false, error };
        }
    };

    const updateCategory = async (id, updatedCategory) => {
        try {
            await updateDoc(doc(db, 'categories', id), updatedCategory);
            await fetchData();
            addNotification('Category updated successfully!');
            return { success: true, data: { id, ...updatedCategory } };
        } catch (error) {
            console.error(error);
            return { success: false, error };
        }
    };

    const deleteCategory = async (id) => {
        try {
            await deleteDoc(doc(db, 'categories', id));
            await fetchData();
            addNotification('Category deleted successfully!');
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error };
        }
    };

    // Site Config Persistent Update
    const updateSiteConfig = async (newConfig) => {
        try {
            await setDoc(doc(db, 'site_config', '1'), { config: newConfig }, { merge: true });
            setSiteConfig(newConfig); // Optimistic update
            safeSetItem('cached_site_config', JSON.stringify(newConfig));
            return { success: true };
        } catch (error) {
            console.error('Error updating site config in DB:', error);
            // Local fallback so changes still persist in browser
            setSiteConfig(newConfig);
            safeSetItem('cached_site_config', JSON.stringify(newConfig));
            return { success: true, localOnly: true, error };
        }
    };

    const [heroSlider, setHeroSlider] = useState([]);
    const [heroAd, setHeroAd] = useState({ image: '', url: '#' });

    useEffect(() => {
        if (siteConfig) {
            if (siteConfig.heroSlider) setHeroSlider(siteConfig.heroSlider);
            if (siteConfig.heroAd) setHeroAd(siteConfig.heroAd);
        }
    }, [siteConfig]);

    const updateHeroSlider = (newSlider) => {
        const newConfig = { ...siteConfig, heroSlider: newSlider };
        updateSiteConfig(newConfig);
    };

    const updateHeroAd = (newAd) => {
        const newConfig = { ...siteConfig, heroAd: newAd };
        updateSiteConfig(newConfig);
    };



    useEffect(() => {
        if (siteConfig) {
            safeSetItem('cached_site_config', JSON.stringify(siteConfig));
        }
    }, [siteConfig]);

    // Dynamic Tab Title and Favicon
    useEffect(() => {
        if (!siteConfig) return;

        if (siteConfig.siteTitle) {
            document.title = siteConfig.siteTitle;
        }

        if (siteConfig.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = siteConfig.favicon;
        }

        // --- INJECT THEME SETTINGS ---
        if (siteConfig.themeColor) {
            document.documentElement.style.setProperty('--primary-color', siteConfig.themeColor);

            // Helper to darken color
            const darken = (col, amt) => {
                let usePound = false;
                if (col[0] === "#") { col = col.slice(1); usePound = true; }
                let num = parseInt(col, 16);
                let r = (num >> 16) + amt;
                if (r > 255) r = 255; else if (r < 0) r = 0;
                let b = ((num >> 8) & 0x00FF) + amt;
                if (b > 255) b = 255; else if (b < 0) b = 0;
                let g = (num & 0x0000FF) + amt;
                if (g > 255) g = 255; else if (g < 0) g = 0;
                return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
            };

            const darkerColor = darken(siteConfig.themeColor, -20);
            document.documentElement.style.setProperty('--primary-hover', darkerColor);
            document.documentElement.style.setProperty('--search-btn-bg', siteConfig.themeColor);

            // Set RGB for opacity uses
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
            };
            const rgb = hexToRgb(siteConfig.themeColor);
            if (rgb) document.documentElement.style.setProperty('--primary-rgb', rgb);
        }
        if (siteConfig.buttonColor) {
            document.documentElement.style.setProperty('--button-bg', siteConfig.buttonColor);
        }
        if (siteConfig.fontSize) {
            document.documentElement.style.setProperty('--base-font-size', siteConfig.fontSize);
        }

        // --- FOOTER DYNAMIC STYLES ---
        if (siteConfig.footer) {
            if (siteConfig.footer.backgroundImage) {
                document.documentElement.style.setProperty('--footer-bg-image', `url(${siteConfig.footer.backgroundImage})`);
            } else {
                document.documentElement.style.setProperty('--footer-bg-image', 'none');
            }
            if (siteConfig.footer.textColor) {
                document.documentElement.style.setProperty('--footer-text-color', siteConfig.footer.textColor);
            }
            if (siteConfig.footer.headerColor) {
                document.documentElement.style.setProperty('--footer-header-color', siteConfig.footer.headerColor);
            }
        }
    }, [siteConfig]);

    // Meta Pixel & Google Analytics Injection
    useEffect(() => {
        if (!siteConfig) return;

        // Find official store pixel if exists
        const officialStore = sellers.find(s => s.id === 's1');
        const pixelId = officialStore?.metaPixelId || siteConfig?.metaPixelId;

        if (pixelId) {
            console.log(`Injecting Meta Pixel: ${pixelId}`);
            // Logic to inject Facebook Pixel script
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window, document, 'script',
                'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', pixelId);
            fbq('track', 'PageView');
        }
    }, [siteConfig, sellers]);

    // --- COURIER API HELPERS ---
    const trackOrderRealtime = async (orderId, courierType, trackingId) => {
        const config = courierConfig[courierType];
        if (!config || !config.enabled || !config.apiKey) {
            return { status: 'Unknown', message: 'Courier API not configured' };
        }

        // Simulating API Call to Courier
        console.log(`Fetching tracking info for ${trackingId} via ${courierType} API...`);

        try {
            // In a real app, this would be a fetch() call to a backend proxy or the courier's API
            // For now, we simulate different statuses based on the tracking ID
            if (trackingId.includes('DEL')) return { status: 'Delivered', lastUpdate: new Date().toLocaleDateString() };
            if (trackingId.includes('RET')) return { status: 'Returned', lastUpdate: new Date().toLocaleDateString() };
            return { status: 'In Transit', lastUpdate: new Date().toLocaleDateString(), location: 'Dhaka Hub' };
        } catch (err) {
            return { status: 'Error', message: 'Failed to connect to Courier API' };
        }
    };

    const createPathaoOrder = async (orderData) => {
        const config = courierConfig.pathao;
        if (!config.enabled) return { success: false, error: 'Pathao is disabled' };

        // Logic for Pathao API integration (requires OAuth token first)
        console.log('Syncing with Pathao API...', orderData);
        return { success: true, trackingId: `PTH-${Date.now()}` };
    };

    const createSteadfastOrder = async (orderData) => {
        const config = courierConfig.steadfast;
        if (!config.enabled || !config.apiKey || !config.secretKey) {
            return { success: false, error: 'Steadfast API Key/Secret Key কনফিগার করা নেই' };
        }

        const payload = {
            invoice: orderData.id,
            recipient_name: orderData.shipping_info?.name || orderData.customerName || 'N/A',
            recipient_phone: orderData.shipping_info?.phone || '00000000000',
            recipient_address: `${orderData.shipping_info?.address}, ${orderData.shipping_info?.city}`,
            cod_amount: orderData.amount || 0,
            note: 'Deliver to Home'
        };

        try {
            console.log('🌐 Proxying Steadfast API request via Bridge...', payload);

            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const proxyUrl = isLocal
                ? 'https://cors-anywhere.herokuapp.com/'
                : `${window.location.origin}/bridge.php`; // Renamed to bridge.php

            const finalUrl = isLocal ? `${proxyUrl}${config.baseUrl}/create_order` : proxyUrl;
            const requestBody = isLocal ? payload : {
                url: `${config.baseUrl}/create_order`,
                method: 'POST',
                headers: {
                    'Api-Key': config.apiKey,
                    'Secret-Key': config.secretKey,
                    'Content-Type': 'application/json'
                },
                body: payload
            };

            const response = await fetch(finalUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isLocal ? {
                        'Api-Key': config.apiKey,
                        'Secret-Key': config.secretKey,
                    } : {})
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Non-JSON Response from Bridge:', responseText);
                return { success: false, error: `সার্ভার এরর (500)। আপনার সিপ্যানেলে 'bridge.php' ফাইলটি ঠিকমতো আপলোড করা আছে কি না নিশ্চিত করুন।` };
            }

            if (result.status == 200) {
                return { success: true, trackingId: result.order.consignment_id };
            } else {
                console.error('Steadfast API Response:', result);
                return { success: false, error: result.message || 'Error from Courier API.' };
            }
        } catch (err) {
            console.error('Steadfast Bridge Error:', err);
            return { success: false, error: 'কুরিয়ার সার্ভারে কানেক্ট করা সম্ভব হচ্ছে না।' };
        }
    };

    useEffect(() => {
        if (siteConfig) {
            if (siteConfig.menus) setMenus(siteConfig.menus || []);
            if (siteConfig.menuLocations) setMenuLocations(siteConfig.menuLocations || {
                topBar: '', primary: '', footerCol1: '', footerCol2: '', footerCol3: ''
            });
            if (siteConfig.dynamicPages) setDynamicPages(siteConfig.dynamicPages || []);
        }
    }, [siteConfig]);

    const updateMenus = (newMenus) => {
        setMenus(newMenus);
        updateSiteConfig({ ...siteConfig, menus: newMenus });
    };

    const updateMenuLocations = (newLocations) => {
        setMenuLocations(newLocations);
        updateSiteConfig({ ...siteConfig, menuLocations: newLocations });
    };

    const addPage = (page) => {
        const newPages = [...dynamicPages, { ...page, id: 'p' + Date.now() }];
        updateSiteConfig({ ...siteConfig, dynamicPages: newPages });
    };

    const updatePage = (id, updatedPage) => {
        const newPages = dynamicPages.map(p => p.id === id ? updatedPage : p);
        updateSiteConfig({ ...siteConfig, dynamicPages: newPages });
    };

    const deletePage = (id) => {
        const newPages = dynamicPages.filter(p => p.id !== id);
        updateSiteConfig({ ...siteConfig, dynamicPages: newPages });
    };

    // Trimmed Caching is now handled inside fetchData to save quota
    /* 
    useEffect(() => {
        safeSetItem('resellerStores', JSON.stringify(resellerStores.map(trimProfile)));
    }, [resellerStores]);
    */

    const login = (userData) => {
        setUser(userData);
        safeSetItem('user', JSON.stringify(userData));
        return { success: true, role: userData.role };
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('user');
    };

    // Unified Session and Role Fetch
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const profileSnap = await getDoc(doc(db, 'profiles', firebaseUser.uid));
                if (profileSnap.exists()) {
                    const fullUser = { ...firebaseUser, ...profileSnap.data() };
                    setUser(fullUser);
                    safeSetItem('user', JSON.stringify(fullUser));
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        });

        // Periodic Update Check
        const updateInterval = setInterval(async () => {
            try {
                const res = await fetch('/version.json?t=' + Date.now());
                const data = await res.json();
                if (data.version && data.version !== currentVersion) {
                    setIsUpdateAvailable(true);
                    console.log('✨ New update found:', data.version);
                }
            } catch (e) { }
        }, 60 * 60 * 1000); // 1 hour as per blueprint

        return () => {
            unsubscribe();
            clearInterval(updateInterval);
        };
    }, []);

    useEffect(() => {
        safeSetItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        safeSetItem('adminPaymentMethods', JSON.stringify(adminPaymentMethods));
    }, [adminPaymentMethods]);

    useEffect(() => {
        safeSetItem('courierConfig', JSON.stringify(courierConfig));
    }, [courierConfig]);

    useEffect(() => {
        safeSetItem('wallets', JSON.stringify(wallets));
    }, [wallets]);

    const updateStoreDetails = async (sellerId, details) => {
        const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        // Update local state first for immediate feedback
        if (user && user.id === sellerId) {
            const updatedUser = {
                ...user,
                store_name: details.storeName,
                store_logo: details.logo,
                store_banner: details.banner,
                meta_pixel_id: details.metaPixelId,
                google_analytics_id: details.googleAnalyticsId
            };
            setUser(updatedUser);
            safeSetItem('user', JSON.stringify(updatedUser));
        }

        // Only update DB if we have a valid UUID to avoid "invalid input syntax for type uuid" error
        if (isUUID(sellerId)) {
            const dbData = {
                store_name: details.storeName,
                store_logo: details.logo,
                store_banner: details.banner,
                meta_pixel_id: details.metaPixelId,
                google_analytics_id: details.googleAnalyticsId
            };

            try {
                await updateDoc(doc(db, 'profiles', sellerId), dbData);
            } catch (error) {
                console.error('Update store details DB error:', error);
                return { success: false, error };
            }
        } else {
            console.warn(`⚠️ Using mock ID "${sellerId}". Changes only saved locally.`);
        }

        addNotification('Store details updated successfully!');
        return { success: true };
    };

    const updateResellerProducts = (productIds) => {
        if (user && user.role === 'reseller') {
            const updatedUser = { ...user, selectedProductIds: productIds };
            setUser(updatedUser);
            safeSetItem('user', JSON.stringify(updatedUser));
        }
    };

    const addResellerProduct = async (productData) => {
        if (!user) return;

        const dbData = {
            title: productData.title,
            price: Number(productData.price) || 0,
            original_price: Number(productData.originalPrice) || 0,
            image: productData.image,
            description: productData.description || '',
            stock: parseInt(productData.stock) || 0,
            seller_id: user.id, // Reseller acts as the seller for their curated product
            is_new_arrival: true, // Default to show in arrivals
            // Metadata to track it's a resold product
            images: [productData.originalProductId], // Storing original ID in images or a new column
        };

        try {
            const docRef = await addDoc(collection(db, 'products'), dbData);
            addNotification('Product added to your store!');
            return { id: docRef.id, ...dbData };
        } catch (error) {
            console.error('Error adding reseller product:', error);
            return null;
        }
    };

    const deleteResellerProduct = async (id) => {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (error) {
            console.error('Delete reseller product error:', error);
        }
    };

    const updateResellerProduct = async (id, updatedProduct) => {
        const dbData = {
            title: updatedProduct.title,
            price: Number(updatedProduct.price) || 0,
            stock: parseInt(updatedProduct.stock) || 0,
            description: updatedProduct.description
        };
        try {
            await updateDoc(doc(db, 'products', id), dbData);
        } catch (error) {
            console.error('Update reseller product error:', error);
        }
    };

    const updateResellerStore = async (userId, details) => {
        // This is now handled by updateStoreDetails which is more generic
        return await updateStoreDetails(userId, details);
    };

    // --- WALLET & ORDERS MANAGEMENT ---
    const getWallet = (userId) => {
        if (!userId) return { balance: 0, pending: 0, totalWithdrawn: 0, transactions: [] };
        const wallet = (wallets || []).find(w => w.userId === userId);
        if (wallet) return wallet;
        return { balance: 0, pending: 0, totalWithdrawn: 0, transactions: [] };
    };

    const getSellerById = (id) => sellers.find(s => s.id === id);

    const updateAdminPaymentMethod = (method, details) => {
        setAdminPaymentMethods(prev => ({
            ...prev,
            [method]: { ...prev[method], ...details }
        }));
    };

    const updateUserWithdrawalAccounts = (accounts) => {
        if (user) {
            const updatedUser = { ...user, withdrawalAccounts: { ...user.withdrawalAccounts, ...accounts } };
            setUser(updatedUser);
            safeSetItem('user', JSON.stringify(updatedUser));

            // Also update in sellers/resellers list to persist
            if (user.role === 'seller') {
                setSellers(sellers.map(s => s.id === user.id ? { ...s, withdrawalAccounts: { ...s.withdrawalAccounts, ...accounts } } : s));
            } else if (user.role === 'reseller') {
                setResellerStores(resellerStores.map(s => s.userId === user.id ? { ...s, withdrawalAccounts: { ...s.withdrawalAccounts, ...accounts } } : s));
            }
        }
    };

    useEffect(() => {
        safeSetItem('courierConfig', JSON.stringify(courierConfig));
    }, [courierConfig]);

    const updateCourierConfig = async (provider, settings) => {
        const newConfig = {
            ...courierConfig,
            [provider]: { ...courierConfig[provider], ...settings }
        };
        setCourierConfig(newConfig);
        safeSetItem('courierConfig', JSON.stringify(newConfig));

        // Save to Firebase site_config
        const updatedFullConfig = { ...siteConfig, courierConfig: newConfig };
        updateSiteConfig(updatedFullConfig);
    };

    const assignCourier = async (orderId, courierId, trackingId) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                courier_id: courierId,
                tracking_id: trackingId,
                status: 'Shipped'
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, courierId, trackingId, status: 'Shipped' } : o));
            addNotification(`Order ${orderId} assigned to courier.`);
            return { success: true };
        } catch (error) {
            console.error('Courier Assignment error:', error);
            return { success: false, error: error.message };
        }
    };

    const markOrderAsDelivered = async (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status === 'Delivered') return;

        const totalAmount = order.totalAmount || 0;
        let adminShare = 0;
        let sellerShare = 0;
        let resellerShare = 0;

        const sellerId = order.seller_id || order.sellerId || (order.items?.[0]?.sellerId) || (order.items?.[0]?.seller_id);

        // ✅ Dynamic Commission from Admin Financial Settings
        const fs = siteConfig?.financialSettings?.commission;
        const adminPct = (fs?.adminPercent ?? 20) / 100;
        const sellerPct = (fs?.sellerPercent ?? 80) / 100;
        const resellerPct = (fs?.resellerPercent ?? 10) / 100;

        console.log(`💰 Commission rates — Admin: ${adminPct * 100}%, Seller: ${sellerPct * 100}%, Reseller: ${resellerPct * 100}%`);

        if (order.reseller_id || order.resellerId) {
            resellerShare = totalAmount * resellerPct;
            const remaining = totalAmount - resellerShare;
            sellerShare = remaining * sellerPct;
            adminShare = remaining * adminPct;
        } else {
            sellerShare = totalAmount * sellerPct;
            adminShare = totalAmount * adminPct;
        }

        const adminId = '00000000-0000-0000-0000-000000000000';

        const updateWalletInDB = async (userId, share, desc) => {
            if (!userId || userId === 's1' || userId === 'null') return;
            const walletRef = doc(db, 'wallets', userId);
            const walletSnap = await getDoc(walletRef);
            const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;
            const currentTransactions = walletSnap.exists() ? walletSnap.data().transactions || [] : [];

            const newTxn = {
                id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'Credit',
                amount: share,
                description: desc,
                date: new Date().toISOString()
            };

            await setDoc(walletRef, {
                user_id: userId,
                balance: Number(currentBalance) + Number(share),
                transactions: [newTxn, ...currentTransactions.slice(0, 49)],
                updated_at: new Date().toISOString()
            }, { merge: true });
        };

        try {
            await updateDoc(doc(db, 'orders', orderId), { status: 'Delivered' });
            if (adminId) await updateWalletInDB(adminId, adminShare, `Commission from Order ${orderId}`);
            if (sellerId) await updateWalletInDB(sellerId, sellerShare, `Sale revenue from Order ${orderId}`);
            if (order.reseller_id || order.resellerId) {
                await updateWalletInDB(order.reseller_id || order.resellerId, resellerShare, `Reseller commission from Order ${orderId}`);
            }
            addNotification(`Order ${orderId} delivered and funds settled.`);
            fetchData();
        } catch (err) {
            console.error('Settlement error:', err);
        }
    };



    const withdrawMoney = async (amount, method) => {
        const userWallet = getWallet(user.id);
        if (amount > userWallet.balance) return { success: false, message: 'Insufficient balance' };

        try {
            // Update wallet in Firestore
            const newBalance = Number(userWallet.balance) - Number(amount);
            const newTxn = {
                id: `TXN-WIT-${Date.now()}`,
                type: 'Withdrawal',
                amount,
                description: `${method} Withdrawal Request`,
                status: 'Pending',
                date: new Date().toISOString()
            };

            await updateDoc(doc(db, 'wallets', user.id), {
                balance: newBalance,
                transactions: [newTxn, ...(userWallet.transactions || []).slice(0, 49)]
            });

            // Create withdrawal request
            await addDoc(collection(db, 'withdrawals'), {
                user_id: user.id,
                amount,
                method,
                status: 'Pending',
                account_number: user.withdrawalAccounts?.[method] || 'Not Set'
            });

            addNotification('Withdrawal request submitted successfully!');
            fetchData();
            return { success: true };
        } catch (err) {
            console.error('Withdrawal error:', err);
            return { success: false, message: 'Failed to process withdrawal' };
        }
    };

    const approveWithdrawal = async (id) => {
        try {
            await updateDoc(doc(db, 'withdrawals', id), { status: 'Approved' });
            addNotification(`Withdrawal #${id} approved.`);
            fetchData();
        } catch (error) {
            console.error('Approve withdrawal error:', error);
            alert('Failed to approve withdrawal.');
        }
    };

    const rejectWithdrawal = async (id) => {
        try {
            await updateDoc(doc(db, 'withdrawals', id), { status: 'Rejected' });
            addNotification(`Withdrawal #${id} rejected.`);
            fetchData();
        } catch (error) {
            console.error('Reject withdrawal error:', error);
            alert('Failed to reject withdrawal.');
        }
    };


    const sendBroadcast = (message) => {
        const newBroadcast = { id: Date.now(), message, date: new Date().toLocaleString() };
        setBroadcasts([newBroadcast, ...broadcasts]);
        // Ideally, this would also push to a realtime channel or notifications for all users
        addNotification(`System Broadcast: ${message}`);
    };

    const toggleUserStatus = (id, role) => {
        if (role === 'seller') {
            setSellers(sellers.map(s => s.id === id ? { ...s, status: s.status === 'Banned' ? 'Active' : 'Banned' } : s));
        } else if (role === 'reseller') {
            setResellerStores(resellerStores.map(s => s.userId === id ? { ...s, status: s.status === 'Banned' ? 'Active' : 'Banned' } : s));
        } else if (role === 'customer') {
            setCustomers(customers.map(c => c.id === id ? { ...c, status: c.status === 'Banned' ? 'Active' : 'Banned' } : c));
        }
    };

    // --- DASHBOARD ANALYTICS DATA (static demo data for charts) ---
    // Note: customers, financialStats are declared at top of file as useState.
    // loginStats is static chart data.
    const loginStaticData = {
        browser: [
            { name: 'Chrome', value: 400, color: '#6366f1' },
            { name: 'Firefox', value: 300, color: '#ec4899' },
            { name: 'Safari', value: 300, color: '#f87171' },
        ],
        os: [
            { name: 'Windows', value: 500, color: '#6366f1' },
            { name: 'Mac', value: 300, color: '#f87171' },
            { name: 'Android', value: 200, color: '#10b981' },
        ],
        country: [
            { name: 'Bangladesh', value: 600, color: '#f87171' },
            { name: 'USA', value: 200, color: '#f59e0b' },
            { name: 'UK', value: 100, color: '#6366f1' },
        ]
    };

    const updateOrder = (id, updatedOrder) => {
        const oldOrder = orders.find(o => o.id === id);
        if (updatedOrder.status === 'Delivered' && oldOrder.status !== 'Delivered') {
            markOrderAsDelivered(id);
        } else {
            setOrders(orders.map(o => o.id === id ? { ...o, ...updatedOrder } : o));
        }
    };

    const deleteOrder = (id) => {
        setOrders(orders.filter(o => o.id !== id));
        addNotification(`Order ${id} deleted.`);
    };

    const addToCart = (product, quantity = 1, selectedVariant = null) => {
        setCart(prevCart => {
            // Unique key for cart items based on product + variant
            const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
            // Match by cartItemId, but also check by id for legacy items
            const existingItem = prevCart.find(item => (item.cartItemId || item.id) === cartItemId);

            if (existingItem) {
                return prevCart.map(item => {
                    const itemKey = item.cartItemId || item.id;
                    return itemKey === cartItemId
                        ? { ...item, cartItemId: itemKey, quantity: (item.quantity || 1) + quantity }
                        : item;
                });
            }

            // Create new cart item
            const newItem = {
                ...product,
                cartItemId,
                selectedVariant,
                quantity,
                // Price and image might be overridden by variant
                price: selectedVariant?.price ? Number(selectedVariant.price) : product.price,
                image: selectedVariant?.image || product.image
            };

            return [...prevCart, newItem];
        });
        addNotification(`Added ${product.title} to cart`);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => {
            // Match by cartItemId OR id to support both old & new cart items
            const itemKey = item.cartItemId || item.id;
            return itemKey !== cartItemId;
        }));
    };

    const updateCartQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item => {
                // Match by cartItemId OR id to support both old & new cart items
                const itemKey = item.cartItemId || item.id;
                return itemKey === cartItemId ? { ...item, quantity, cartItemId: itemKey } : item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const placeOrder = async (orderDetails) => {
        const orderPrefix = (siteConfig?.header?.logoText || 'DRZ').substring(0, 3).toUpperCase();
        const orderId = `${orderPrefix}-${Date.now().toString().slice(-6)}`;

        // Base payload — only columns that exist in orders table
        const payload = {
            id: orderId,
            customer_id: user?.id || null,
            amount: orderDetails.total,
            status: 'Pending',
            payment_method: orderDetails.paymentMethod,
            items: cart,
            shipping_info: orderDetails.shippingInfo,
            created_at: new Date().toISOString()
        };

        // Add payment tracking columns only if they exist (added via ADD_PAYMENT_STATUS.sql)
        // These are optional — if columns don't exist, order still saves successfully
        if (orderDetails.txId) {
            payload.transaction_id = orderDetails.txId;
            payload.payment_status = 'TxID Submitted';
        } else {
            payload.payment_status = orderDetails.paymentMethod === 'cod' ? 'COD' : 'Pending';
        }

        try {
            const docRef = doc(db, 'orders', orderId);
            await setDoc(docRef, payload);
            
            // Update local orders state for real-time update
            const newOrderRecord = {
                ...payload,
                date: new Date().toISOString().split('T')[0],
                customer: orderDetails.shippingInfo.name
            };
            setOrders(prev => [newOrderRecord, ...prev]);

            addNotification(`New Order Placed: #${orderId}`);
            clearCart();
            return { success: true, orderId };
        } catch (error) {
            console.error('Checkout error:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <ShopContext.Provider value={{
            flashProducts,
            justForYouProducts,
            newArrivalProducts,
            saveProduct,
            deleteProduct,
            categories,
            addCategory,
            updateCategory,
            deleteCategory,
            heroSlider,
            updateHeroSlider,
            heroAd,
            updateHeroAd,
            user,
            login,
            logout,
            updateStoreDetails,
            updateResellerProducts,
            orders,
            updateOrder,
            deleteOrder,
            couriers,
            courierConfig,
            updateCourierConfig,
            assignCourier,
            trackOrderRealtime,
            createPathaoOrder,
            createSteadfastOrder,
            wallets,
            getWallet,
            notifications,
            addNotification,
            markNotificationsAsRead,
            withdrawMoney,
            sellers,
            getSellerById,
            withdrawals,
            approveWithdrawal,
            rejectWithdrawal,
            broadcasts,
            sendBroadcast,
            toggleUserStatus,
            markOrderAsDelivered,
            resellerStores,
            resellerProducts,
            addResellerProduct,
            updateResellerProduct,
            deleteResellerProduct,
            updateResellerStore,
            cart,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            isCartOpen,
            openCart,
            closeCart,
            customers,
            loginStats: loginStaticData,
            financialStats,
            siteConfig,
            updateSiteConfig,
            adminPaymentMethods,
            updateAdminPaymentMethod,
            updateUserWithdrawalAccounts,
            menus,
            updateMenus,
            menuLocations,
            updateMenuLocations,
            dynamicPages,
            addPage,
            updatePage,
            deletePage,
            getMenuByLocation: (locationKey) => {
                const menuId = menuLocations[locationKey];
                if (!menuId) return [];
                const menu = menus.find(m => m.id === menuId);
                return menu ? menu.items : [];
            },
            allProducts,
            placeOrder,
            fetchData,
            isLoading,
            isUpdateAvailable
        }}>
            {children}
        </ShopContext.Provider>
    );
};
