import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShopContext } from '../context/ShopContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaFacebookF, FaGoogle, FaIdCard, FaMoneyBillWave, FaPhoneAlt, FaUniversity } from 'react-icons/fa';
import { uploadToImgBB } from '../utils/imgbb';
import './AuthPage.css';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, siteConfig, user } = useContext(ShopContext);
    const { header } = siteConfig || {};

    // Determine mode from path
    const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'login');
    const [form, setForm] = useState({
        account: '',
        password: '',
        name: '',
        role: 'customer',
        phone_number: '',
        nid_number: '',
        payment_method: '',
        payment_details: ''
    });
    const [nidFront, setNidFront] = useState(null);
    const [nidBack, setNidBack] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMode(location.pathname === '/signup' ? 'signup' : 'login');
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!form.account || !form.password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        if (mode === 'signup') {
            if (!form.name) {
                setError('Please enter your full name');
                setLoading(false);
                return;
            }
            if (!form.phone_number) {
                setError('Please enter your mobile number');
                setLoading(false);
                return;
            }
            if (!nidFront || !nidBack) {
                setError('Please upload both Front and Back photos of your NID');
                setLoading(false);
                return;
            }
            if (!form.nid_number) {
                setError('Please enter your NID Number');
                setLoading(false);
                return;
            }
            if (!form.payment_method) {
                setError('Please select a payment method');
                setLoading(false);
                return;
            }
            if (!form.payment_details) {
                setError('Please provide your payment details (Account Number or Bank Info)');
                setLoading(false);
                return;
            }
        }

        try {
            // 0. QUICK LOGIN FOR TEST ACCOUNTS
            if (mode === 'login') {
                if (form.account === 'admin' || form.account === 'superadmin@gmail.com' || form.account === 'admin@ebaybd.com') {
                    // Normalize to real registered Firebase admin account
                    form.account = 'admin@ebaybd.com';
                    if (form.password === 'aponadminbd' || form.password === 'admin1234') {
                        form.password = '12345678';
                    }
                } else if ((form.account === 'seller' && form.password === 'seller') || (form.account === 'reseller' && form.password === 'reseller')) {
                    let mockProfile = { id: 'mock-id', full_name: 'Mock User', role: 'customer' };
                    if (form.account === 'seller') mockProfile = { id: 's1', full_name: 'Global Admin Shop', role: 'seller', email: 'seller@ebaybd.com' };
                    else if (form.account === 'reseller') mockProfile = { id: 'r1', full_name: 'Demo Reseller', role: 'reseller', email: 'reseller@ebaybd.com' };

                    login(mockProfile);
                    if (mockProfile.role === 'seller') navigate('/seller/dashboard');
                    else if (mockProfile.role === 'reseller') navigate('/reseller/dashboard');
                    return;
                }
            }

            if (mode === 'login') {
                const userCredential = await signInWithEmailAndPassword(auth, form.account, form.password);
                const firebaseUser = userCredential.user;

                const profileRef = doc(db, 'profiles', firebaseUser.uid);
                const profileSnap = await getDoc(profileRef);
                
                let profile = {};
                if (profileSnap.exists()) {
                    profile = profileSnap.data();
                } else {
                    console.error('Profile not found in Firestore');
                }

                if (profile.status === 'pending') {
                    await signOut(auth);
                    throw new Error('Your account is still pending admin approval. Please wait until your account is approved.');
                }

                login({ ...firebaseUser, ...profile });

                if (profile?.role === 'admin') navigate('/admin');
                else if (profile?.role === 'seller') navigate('/seller/dashboard');
                else if (profile?.role === 'reseller') navigate('/reseller/dashboard');
                else navigate('/customer/dashboard');
            } else {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, form.account, form.password);
                const firebaseUser = userCredential.user;

                if (firebaseUser) {
                    // Upload NID images to ImgBB
                    let nidFrontUrl = '';
                    let nidBackUrl = '';
                    try {
                        nidFrontUrl = await uploadToImgBB(nidFront);
                        nidBackUrl = await uploadToImgBB(nidBack);
                    } catch (imgErr) {
                        console.error(imgErr);
                        throw new Error('Failed to upload NID images. Please try again.');
                    }

                    // Create Profile Record with PENDING status
                    const currentRole = form.role || 'customer';
                    const profilePayload = {
                        id: firebaseUser.uid,
                        full_name: form.name,
                        email: firebaseUser.email,
                        role: currentRole,
                        phone: form.phone_number,
                        nid_number: form.nid_number,
                        nid_front_url: nidFrontUrl,
                        nid_back_url: nidBackUrl,
                        payment_method: form.payment_method,
                        payment_details: form.payment_details,
                        status: 'pending', // Requires admin approval
                        store_name: currentRole !== 'customer' ? `${form.name}'s Shop` : null,
                        created_at: new Date().toISOString()
                    };

                    try {
                        const profileRef = doc(db, 'profiles', firebaseUser.uid);
                        await setDoc(profileRef, profilePayload);
                    } catch (profError) {
                        console.error('Database profile error:', profError);
                    }

                    // Log them out immediately because they are pending
                    await signOut(auth);
                    
                    alert('Registration successful! Your account is currently pending Admin approval. You will be able to log in once approved.');
                    setMode('login');
                } else {
                    throw new Error('Signup failed: No user data returned.');
                }
            }
        } catch (err) {
            console.error('Auth overall error:', err);
            setError(err.message || 'An unexpected error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <Header />
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{mode === 'login' ? 'Login' : 'Create Account'}</h1>
                        <p>{mode === 'login' ? 'Welcome back! Please enter your details.' : 'Join us today and start shopping.'}</p>
                    </div>

                    <form className="auth-form" onSubmit={handleAuth}>
                        {error && <div className="error-banner">{error}</div>}

                        {mode === 'signup' && (
                            <>
                                <div className="form-input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter your mobile number"
                                        value={form.phone_number}
                                        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={form.account}
                                onChange={(e) => setForm({ ...form, account: e.target.value })}
                                required
                            />
                        </div>

                        {mode === 'signup' && (
                            <>
                                <div className="form-input-group">
                                    <label>NID Verification Images</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>Front Side</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setNidFront(e.target.files[0])}
                                                required
                                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>Back Side</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setNidBack(e.target.files[0])}
                                                required
                                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-input-group">
                                    <label>NID Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your NID number"
                                        value={form.nid_number}
                                        onChange={(e) => setForm({ ...form, nid_number: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-input-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={form.payment_method}
                                        onChange={(e) => setForm({ ...form, payment_method: e.target.value, payment_details: '' })}
                                        required
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="bKash">bKash</option>
                                        <option value="Rocket">Rocket</option>
                                        <option value="Nagad">Nagad</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                {form.payment_method && (
                                    <div className="form-input-group fade-in">
                                        <label>{form.payment_method === 'Bank Transfer' ? 'Bank Account Details' : `${form.payment_method} Number`}</label>
                                        {form.payment_method === 'Bank Transfer' ? (
                                            <textarea
                                                placeholder="Enter your bank name, branch, and account number..."
                                                value={form.payment_details}
                                                onChange={(e) => setForm({ ...form, payment_details: e.target.value })}
                                                required
                                                rows="3"
                                                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                            ></textarea>
                                        ) : (
                                            <input
                                                type="tel"
                                                placeholder={`Enter your ${form.payment_method} number`}
                                                value={form.payment_details}
                                                onChange={(e) => setForm({ ...form, payment_details: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="form-input-group">
                                    <label>User Type</label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="seller">Seller</option>
                                        <option value="reseller">Reseller</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="form-input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                        </button>

                        <div className="auth-divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-login-grid">
                            <button type="button" className="social-btn-item">
                                <FaGoogle className="social-icon" /> Google
                            </button>
                            <button type="button" className="social-btn-item">
                                <FaFacebookF className="social-icon" /> Facebook
                            </button>
                        </div>

                        <div className="auth-footer">
                            {mode === 'login' ? (
                                <p>Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span></p>
                            ) : (
                                <p>Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AuthPage;
