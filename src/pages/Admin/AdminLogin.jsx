import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import './AdminLogin.css';

const AdminLogin = () => {
    const { login, user, siteConfig } = useContext(ShopContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            let loginEmail = email.trim();
            let loginPass = password;

            // Handle shortcut usernames by mapping to real registered Firebase admin account
            if (loginEmail === 'admin' && loginPass === 'aponadminbd') {
                loginEmail = 'admin@ebaybd.com';
                loginPass = '12345678';
            } else if (loginEmail === 'superadmin@gmail.com' && loginPass === 'admin1234') {
                loginEmail = 'admin@ebaybd.com';
                loginPass = '12345678';
            }

            // 1. Authenticate with real Firebase Auth
            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPass);
            } catch (authError) {
                // If admin account doesn't exist yet, try creating it automatically
                if (loginEmail === 'admin@ebaybd.com' && authError.code === 'auth/user-not-found') {
                    try {
                        const { createUserWithEmailAndPassword } = await import('firebase/auth');
                        userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPass);
                    } catch (createErr) {
                        setError(authError.code === 'auth/invalid-credential' ? 'Invalid email or password.' : authError.message);
                        setLoading(false);
                        return;
                    }
                } else {
                    setError(authError.code === 'auth/invalid-credential' ? 'Invalid email or password.' : authError.message);
                    setLoading(false);
                    return;
                }
            }

            const firebaseUser = userCredential.user;

            // 2. Fetch or create admin profile in Firestore
            const profileRef = doc(db, 'profiles', firebaseUser.uid);
            const profileSnap = await getDoc(profileRef);

            let profileData = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: 'Super Admin',
                role: 'admin'
            };

            if (profileSnap.exists()) {
                profileData = { ...profileData, ...profileSnap.data() };
            } else {
                await setDoc(profileRef, profileData, { merge: true });
            }

            if (profileData.role !== 'admin') {
                setError('Access Denied: You do not have admin privileges.');
                setLoading(false);
                return;
            }

            // 3. Success - Set full authenticated user state
            login({ ...firebaseUser, ...profileData });
            navigate('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-box">
                <div className="admin-login-header">
                    {siteConfig?.header?.logoImage && (
                        <img src={siteConfig.header.logoImage} alt="Logo" style={{ height: '40px', marginBottom: '15px' }} />
                    )}
                    <h2>{siteConfig?.header?.logoText || 'EbayBD'} Admin</h2>
                    <p>Enter your admin email and password to continue.</p>
                </div>
                {error && <div className="admin-error-msg">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ebaybd.com"
                        />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input
                            type={showPass ? "text" : "password"}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={{ paddingRight: '40px' }}
                        />
                        <span
                            className="pass-eye"
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </span>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
