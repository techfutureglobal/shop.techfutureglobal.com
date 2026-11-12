import React, { useState, useContext } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const { login, siteConfig } = useContext(ShopContext);
    const { header } = siteConfig || {};
    const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
    const [form, setForm] = useState({
        account: '',
        password: '',
        name: '',
        code: '',
        role: 'customer'
    });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };

    const handleAuth = async () => {
        if (!form.account || !form.password) {
            setError('Please enter both account and password');
            return;
        }

        if (mode === 'signup' && form.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (mode === 'login') {
            // Check for mock credentials first
            if ((form.account === 'seller' && form.password === 'seller') ||
                (form.account === 'reseller' && form.password === 'reseller') ||
                (form.account === 'superadmin@gmail.com' && form.password === 'admin1234') ||
                (form.account === 'admin' && form.password === 'aponadminbd')) {

                let mockUser = { id: 'mock-id', account: form.account, role: '' };
                if (form.account === 'seller') mockUser.role = 'seller';
                else if (form.account === 'reseller') mockUser.role = 'reseller';
                else if (form.account === 'admin') {
                    mockUser.role = 'admin';
                    mockUser.id = '00000000-0000-0000-0000-000000000000'; // Fixed Super Admin ID
                    mockUser.full_name = 'Super Admin';
                }

                const res = login(mockUser);
                if (res.success) {
                    onClose();
                    if (res.role === 'seller') window.location.href = '/seller/dashboard';
                    else if (res.role === 'reseller') window.location.href = '/reseller/dashboard';
                    else if (res.role === 'admin') window.location.href = '/admin';
                    return;
                }
            }

            let firebaseUser;
            try {
                const userCredential = await signInWithEmailAndPassword(auth, form.account, form.password);
                firebaseUser = userCredential.user;
            } catch (err) {
                setError(err.message);
                return;
            }

            // Fetch profile
            const profileSnap = await getDoc(doc(db, 'profiles', firebaseUser.uid));
            const profile = profileSnap.exists() ? profileSnap.data() : {};

            const userData = { ...firebaseUser, ...profile };
            login(userData); // Update local context
            onClose();

            if (profile.role === 'seller') window.location.href = '/seller/dashboard';
            else if (profile.role === 'reseller') window.location.href = '/reseller/dashboard';
            else window.location.href = '/';
        } else {
            // LOGIN or SIGNUP
            let firebaseUser;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, form.account, form.password);
                firebaseUser = userCredential.user;
            } catch (err) {
                setError(err.message);
                return;
            }

            if (firebaseUser) {
                // Create/Update profile
                const currentRole = form.role || 'customer';
                const profilePayload = {
                    id: firebaseUser.uid,
                    full_name: form.name,
                    role: currentRole,
                    store_name: currentRole !== 'customer' ? `${form.name}'s Shop` : null
                };

                try {
                    await setDoc(doc(db, 'profiles', firebaseUser.uid), profilePayload, { merge: true });
                } catch (profileError) {
                    console.error('Error syncing profile:', profileError);
                }

                login({ ...firebaseUser, role: currentRole, full_name: form.name });
                onClose();
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-book-container" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={onClose}>
                    <IoCloseOutline />
                </span>

                <div className={`auth-book ${mode === 'signup' ? 'is-flipped' : ''}`}>
                    {/* --- LOGIN PAGE (FRONT) --- */}
                    <div className="book-page front">
                        <div className="page-content">
                            <div className="auth-tabs">
                                <button className="tab-btn active">Login</button>
                                <button className="tab-btn" onClick={() => setMode('signup')}>Sign Up</button>
                            </div>

                            <div className="auth-body">
                                <div className="welcome-section">
                                    {(header?.logoImage && header.logoImage.trim() !== '') && (
                                        <img src={header.logoImage} alt="Logo" className="auth-logo" />
                                    )}
                                    <h2>Welcome Back</h2>
                                    <p>Please login to your {header?.logoText || 'Ebaybd'}</p>
                                </div>

                                {error && <p className="error-msg">{error}</p>}

                                <div className="form-group">
                                    <label>Email or Phone</label>
                                    <input
                                        type="text"
                                        placeholder="your@email.com"
                                        value={form.account}
                                        onChange={(e) => setForm({ ...form, account: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>

                                <div className="forgot-pass">Forgot Password?</div>

                                <button className="auth-primary-btn" onClick={handleAuth}>
                                    LOGIN
                                </button>

                                <div className="auth-divider">
                                    <span>Or login with</span>
                                </div>

                                <div className="social-grid">
                                    <button className="social-btn facebook"><FaFacebookF /> Login</button>
                                    <button className="social-btn google"><FaGoogle /> Google</button>
                                </div>

                                <p className="switch-text">
                                    Don't have an account? <span onClick={() => setMode('signup')}>Register now</span>
                                </p>
                            </div>
                        </div>
                        <div className="page-shadow"></div>
                    </div>

                    {/* --- SIGNUP PAGE (BACK) --- */}
                    <div className="book-page back">
                        <div className="page-content">
                            <div className="auth-tabs">
                                <button className="tab-btn" onClick={() => setMode('login')}>Login</button>
                                <button className="tab-btn active">Sign Up</button>
                            </div>

                            <div className="auth-body">
                                <div className="welcome-section">
                                    {(header?.logoImage && header.logoImage.trim() !== '') && (
                                        <img src={header.logoImage} alt="Logo" className="auth-logo" />
                                    )}
                                    <h2>Create Account</h2>
                                    <p>Join our marketplace today</p>
                                </div>

                                {error && <p className="error-msg">{error}</p>}

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter full name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="seller">Seller</option>
                                            <option value="reseller">Reseller</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email or Phone</label>
                                    <input
                                        type="text"
                                        placeholder="your@email.com"
                                        value={form.account}
                                        onChange={(e) => setForm({ ...form, account: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>

                                <button className="auth-primary-btn" onClick={handleAuth}>
                                    CREATE ACCOUNT
                                </button>

                                <div className="auth-divider">
                                    <span>Or join with</span>
                                </div>

                                <div className="social-grid">
                                    <button className="social-btn facebook"><FaFacebookF /> Facebook</button>
                                    <button className="social-btn google"><FaGoogle /> Google</button>
                                </div>

                                <p className="switch-text">
                                    Already have an account? <span onClick={() => setMode('login')}>Login here</span>
                                </p>
                            </div>
                        </div>
                        <div className="page-shadow"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
