import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { FaMoneyCheckAlt, FaCheck, FaTimes, FaPlus, FaWallet, FaHistory, FaCog, FaMobileAlt } from 'react-icons/fa';
import PayoutSettings from '../../components/PayoutSettings';

const WithdrawalList = () => {
    const { user, withdrawals, sellers, resellerStores, approveWithdrawal, rejectWithdrawal, getWallet, withdrawMoney } = useContext(ShopContext);

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [activeTab, setActiveTab] = useState('history'); // history, settings
    const [requestData, setRequestData] = useState({ amount: '', method: 'bkash' });

    const isAdmin = user?.role === 'admin';
    const wallet = getWallet(user?.id);

    // Filter withdrawals
    const filteredWithdrawals = isAdmin
        ? withdrawals
        : (withdrawals || []).filter(w => w.userId === user?.id);

    const getUserName = (userId) => {
        const seller = sellers.find(s => s.id === userId);
        if (seller) return seller.storeName + ' (Seller)';
        const reseller = resellerStores.find(rs => rs.userId === userId);
        if (reseller) return reseller.title + ' (Reseller)';
        return 'Unknown User';
    };

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(requestData.amount);
        if (!amountNum || amountNum < 500) return alert('Minimum withdrawal is ৳500');
        if (amountNum > wallet.balance) return alert('Insufficient balance');

        const result = withdrawMoney(amountNum, requestData.method);
        if (result.success) {
            setShowRequestForm(false);
            setRequestData({ amount: '', method: 'bkash' });
            alert('Withdrawal request submitted successfully!');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>
                        {isAdmin ? 'Financial Management' : 'Wallet & Payouts'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        {isAdmin ? 'Oversee platform liquidity and process payout requests.' : 'Track your earnings and manage your withdrawal methods.'}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        className="btn-payout"
                        onClick={() => setShowRequestForm(true)}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        <FaPlus /> Request Payout
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#ecfdf5', color: '#10b981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            <FaWallet />
                        </div>
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Balance</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>৳ {wallet.balance.toLocaleString()}</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Settled Funds <FaCheck size={10} />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#fff7ed', color: '#f59e0b', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            <FaHistory />
                        </div>
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Payouts</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>৳ {(filteredWithdrawals.filter(w => w.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>Processing Request...</div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#eef2ff', color: '#6366f1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            <FaMoneyCheckAlt />
                        </div>
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Withdrawn</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>৳ {wallet.totalWithdrawn.toLocaleString()}</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>Lifetime Earnings</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '12px 10px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'history' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'history' ? '#4f46e5' : '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <FaHistory /> Transaction History
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '12px 10px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'settings' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'settings' ? '#4f46e5' : '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <FaCog /> Payout Accounts
                </button>
            </div>

            {activeTab === 'settings' ? (
                <PayoutSettings isAdmin={isAdmin} />
            ) : (
                <div className="admin-card" style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>
                            {isAdmin ? 'All Platform Requests' : 'Your Withdrawal History'}
                        </div>
                    </div>
                    <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Request ID</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>{isAdmin ? 'Store / User' : 'Method'}</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Date</th>
                                    {isAdmin && <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWithdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '20px 24px', fontWeight: '600', color: '#64748b' }}>#{withdrawal.id}</td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {isAdmin ? (
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{withdrawal.userName || getUserName(withdrawal.userId)}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{withdrawal.userRole}</div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                                        <FaMobileAlt />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>{withdrawal.method}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{withdrawal.accountNumber}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px', fontWeight: '800', color: '#10b981', fontSize: '16px' }}>৳ {withdrawal.amount.toLocaleString()}</td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '30px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                background:
                                                    withdrawal.status === 'Pending' ? '#fffbeb' :
                                                        withdrawal.status === 'Approved' ? '#ecfdf5' : '#fef2f2',
                                                color:
                                                    withdrawal.status === 'Pending' ? '#b45309' :
                                                        withdrawal.status === 'Approved' ? '#047857' : '#b91c1c',
                                                border: '1px solid transparent'
                                            }}>
                                                {withdrawal.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '14px' }}>{withdrawal.date}</td>
                                        {isAdmin && (
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                {withdrawal.status === 'Pending' && (
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => approveWithdrawal(withdrawal.id)}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
                                                            title="Approve"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => rejectWithdrawal(withdrawal.id)}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}
                                                            title="Reject"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredWithdrawals.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ opacity: 0.3, marginBottom: '15px' }}><FaMoneyCheckAlt size={48} /></div>
                                            <div style={{ color: '#64748b', fontWeight: '600' }}>No transactions found.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Request Payout Modal */}
            {showRequestForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Request Payout</h2>
                            <button onClick={() => setShowRequestForm(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>Available Balance:</span>
                            <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '18px' }}>৳ {wallet.balance.toLocaleString()}</span>
                        </div>

                        <form onSubmit={handleRequestSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>Amount to Withdraw (৳)</label>
                                <input
                                    type="number"
                                    value={requestData.amount}
                                    onChange={e => setRequestData({ ...requestData, amount: e.target.value })}
                                    placeholder="Enter amount..."
                                    required
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '16px', fontWeight: '600' }}
                                />
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Min withdrawal: ৳ 500</div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>Payout Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {['bkash', 'nagad', 'rocket'].map(m => (
                                        <div
                                            key={m}
                                            onClick={() => setRequestData({ ...requestData, method: m })}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid',
                                                borderColor: requestData.method === m ? '#4f46e5' : '#e2e8f0',
                                                background: requestData.method === m ? '#f5f3ff' : 'white',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                                fontWeight: '700',
                                                color: requestData.method === m ? '#4f46e5' : '#64748b',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {m}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                                    Payout will be sent to your saved <b>{requestData.method}</b> account.
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                                Confirm Withdrawal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalList;
