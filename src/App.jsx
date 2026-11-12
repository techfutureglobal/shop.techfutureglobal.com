import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopContext, ShopProvider } from './context/ShopContext';
import './index.css';
import './components/MobileResponsive.css';

// --- Error Boundary for Lazy Component Failures ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Oops! Something went wrong loading this page.</h2>
          <p>Please check your connection and try refreshing.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Refresh Now
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Helper for Lazy Loading with Retry (Handles network glitches) ---
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Lazy import failed, retrying...", error);
      // Optional: Refresh the page if it's a version mismatch/disconnected
      window.location.reload();
      throw error;
    }
  });
};

// --- Lazy Load Pages for Progressive Rendering ---
const Home = lazyWithRetry(() => import('./pages/Home'));
const ProductDetails = lazyWithRetry(() => import('./pages/ProductDetails'));
const Shop = lazyWithRetry(() => import('./pages/Shop'));
const CategoriesPage = lazyWithRetry(() => import('./pages/CategoriesPage'));
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const DynamicPage = lazyWithRetry(() => import('./pages/DynamicPage'));
const StorePage = lazyWithRetry(() => import('./pages/StorePage'));

// Admin Pages
const AdminLayout = lazyWithRetry(() => import('./pages/Admin/AdminLayout'));
const AdminLogin = lazyWithRetry(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazyWithRetry(() => import('./pages/Admin/Dashboard'));
const ProductManager = lazyWithRetry(() => import('./pages/Admin/ProductManager'));
const CategoryManager = lazyWithRetry(() => import('./pages/Admin/CategoryManager'));
const SiteEditor = lazyWithRetry(() => import('./pages/Admin/SiteEditor'));
const MenuEditor = lazyWithRetry(() => import('./pages/Admin/MenuEditor'));
const SellerList = lazyWithRetry(() => import('./pages/Admin/SellerList'));
const ResellerList = lazyWithRetry(() => import('./pages/Admin/ResellerList'));
const RegistrationApprovals = lazyWithRetry(() => import('./pages/Admin/RegistrationApprovals'));
const OfficialStore = lazyWithRetry(() => import('./pages/Admin/OfficialStore'));
const OrderManager = lazyWithRetry(() => import('./pages/Admin/OrderManager'));
const PageManager = lazyWithRetry(() => import('./pages/Admin/PageManager'));
const PageBuilder = lazyWithRetry(() => import('./pages/Admin/PageBuilder'));
const WithdrawalList = lazyWithRetry(() => import('./pages/Admin/WithdrawalList'));
const StockManagement = lazyWithRetry(() => import('./pages/Admin/StockManagement'));
const CourierSettings = lazyWithRetry(() => import('./pages/Admin/CourierSettings'));
const PaymentSettings = lazyWithRetry(() => import('./pages/Admin/PaymentSettings'));
const FinancialSettings = lazyWithRetry(() => import('./pages/Admin/FinancialSettings'));
const ChatManager = lazyWithRetry(() => import('./pages/Admin/ChatManager'));
const EmergencyServiceManager = lazyWithRetry(() => import('./pages/Admin/EmergencyServiceManager'));

// Seller/Reseller/Customer
const SellerLayout = lazyWithRetry(() => import('./pages/Seller/SellerLayout'));
const SellerDashboard = lazyWithRetry(() => import('./pages/Seller/SellerDashboard'));
const ResellerLayout = lazyWithRetry(() => import('./pages/Reseller/ResellerLayout'));
const ResellerDashboard = lazyWithRetry(() => import('./pages/Reseller/ResellerDashboard'));
const CustomerLayout = lazyWithRetry(() => import('./pages/Customer/CustomerLayout'));
const CustomerDashboard = lazyWithRetry(() => import('./pages/Customer/CustomerDashboard'));
const PublicShop = lazyWithRetry(() => import('./pages/Reseller/PublicShop'));
const ResellerMarketplace = lazyWithRetry(() => import('./pages/Reseller/ResellerMarketplace'));
const ResellerPageEditor = lazyWithRetry(() => import('./pages/Reseller/ResellerPageEditor'));


import ChatWidget from './components/ChatWidget';
import StoreChatBoxes from './components/StoreChatBoxes';
import CartDrawer from './components/CartDrawer';
import BrandLoader from './components/BrandLoader';

// Fallback Loader for Suspense
const SuspenseLoader = () => (
  <BrandLoader fullScreen={false} message="Loading page..." showRefresh={false} />
);

const AppRoutes = () => {
  const { isLoading } = React.useContext(ShopContext);

  if (isLoading) {
    return <BrandLoader fullScreen={true} message="Synchronizing real-time data..." showRefresh={true} />;
  }

  return (
    <Router>
      <div className="App">
        <CartDrawer />
        <ChatWidget />
        <StoreChatBoxes />
        <Routes>
          <Route path="/" element={<Suspense fallback={<SuspenseLoader />}><Home /></Suspense>} />
          <Route path="/login" element={<Suspense fallback={<SuspenseLoader />}><AuthPage /></Suspense>} />
          <Route path="/signup" element={<Suspense fallback={<SuspenseLoader />}><AuthPage /></Suspense>} />
          <Route path="/product/:id" element={<Suspense fallback={<SuspenseLoader />}><ProductDetails /></Suspense>} />
          <Route path="/shop" element={<Suspense fallback={<SuspenseLoader />}><Shop /></Suspense>} />
          <Route path="/categories" element={<Suspense fallback={<SuspenseLoader />}><CategoriesPage /></Suspense>} />
          <Route path="/checkout" element={<Suspense fallback={<SuspenseLoader />}><Checkout /></Suspense>} />
          <Route path="/cart" element={<Suspense fallback={<SuspenseLoader />}><Checkout /></Suspense>} />
          <Route path="/p/:slug" element={<Suspense fallback={<SuspenseLoader />}><DynamicPage /></Suspense>} />

          <Route path="/seller" element={<Suspense fallback={<SuspenseLoader />}><SellerLayout /></Suspense>}>
            <Route index element={<SellerDashboard />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="couriers" element={<CourierSettings />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="store" element={<OfficialStore />} />
            <Route path="withdrawals" element={<WithdrawalList />} />
            <Route path="payments" element={<PaymentSettings />} />
            <Route path="chats" element={<ChatManager />} />
          </Route>

          {/* Reseller Routes */}
          <Route path="/reseller" element={<Suspense fallback={<SuspenseLoader />}><ResellerLayout /></Suspense>}>
            <Route index element={<ResellerDashboard />} />
            <Route path="dashboard" element={<ResellerDashboard />} />
            <Route path="marketplace" element={<ResellerMarketplace />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="couriers" element={<CourierSettings />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="store" element={<OfficialStore />} />
            <Route path="landing-page" element={<ResellerPageEditor />} />
            <Route path="withdrawals" element={<WithdrawalList />} />
            <Route path="payments" element={<PaymentSettings />} />
            <Route path="chats" element={<ChatManager />} />
          </Route>
          <Route path="/shop/:idOrSlug" element={<Suspense fallback={<SuspenseLoader />}><PublicShop /></Suspense>} />
          <Route path="/store/:sellerId" element={<Suspense fallback={<SuspenseLoader />}><StorePage /></Suspense>} />

          {/* Customer Routes */}
          <Route path="/customer" element={<Suspense fallback={<SuspenseLoader />}><CustomerLayout /></Suspense>}>
            <Route index element={<CustomerDashboard />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Suspense fallback={<SuspenseLoader />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<SuspenseLoader />}><AdminLayout /></Suspense>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="couriers" element={<CourierSettings />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="menus" element={<MenuEditor />} />
            <Route path="pages" element={<PageManager />} />
            <Route path="pages/new" element={<PageBuilder />} />
            <Route path="pages/edit/:id" element={<PageBuilder />} />
            <Route path="editor" element={<SiteEditor />} />
            <Route path="sellers" element={<SellerList />} />
            <Route path="resellers" element={<ResellerList />} />
            <Route path="approvals" element={<RegistrationApprovals />} />
            <Route path="store" element={<OfficialStore />} />
            <Route path="withdrawals" element={<WithdrawalList />} />
            <Route path="payments" element={<PaymentSettings />} />
            <Route path="financial" element={<FinancialSettings />} />
            <Route path="chats" element={<ChatManager />} />
            <Route path="emergency" element={<EmergencyServiceManager />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <AppRoutes />
      </ShopProvider>
    </ErrorBoundary>
  );
}

export default App;
