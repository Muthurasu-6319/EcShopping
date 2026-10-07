import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Package } from 'lucide-react';
import { getProducts, addProduct } from '../../utils/storage';
import '../admin/AdminDashboard.css';

export default function VendorDashboard({ vendor, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', image: '' });

  useEffect(() => {
    // Load only this vendor's products
    const allProducts = getProducts();
    setProducts(allProducts.filter(p => p.vendorId === vendor.id));
  }, [vendor.id]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    addProduct(vendor, { ...newProduct, price: Number(newProduct.price) });
    // Refresh products
    const allProducts = getProducts();
    setProducts(allProducts.filter(p => p.vendorId === vendor.id));
    setNewProduct({ title: '', price: '', image: '' });
    setShowAddForm(false);
  };

  if (!vendor) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Vendor Panel</h2>
        </div>
        <div style={{ padding: '0 24px', color: '#86efac', fontSize: '14px', marginBottom: '10px' }}>
          Welcome, {vendor.name}
        </div>
        <nav className="admin-nav">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
          <a href="#" className={activeTab === 'products' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}>My Products</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Orders Received</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Earnings</a>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'dashboard' ? 'Vendor Dashboard' : 'My Products'}</h1>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>My Total Sales</h3>
                  <p>₹24,500</p>
                </div>
                <div className="stat-card">
                  <h3>Active Products</h3>
                  <p>{products.filter(p => p.status === 'approved').length}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Approval</h3>
                  <p>{products.filter(p => p.status === 'pending').length}</p>
                </div>
              </div>
              
              <div className="admin-placeholder-box">
                <h2>Welcome to your Vendor Panel</h2>
                <p>You can manage your products, track orders, and view your earnings here.</p>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="admin-vendors-section">
              <div className="vendors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Product Catalog</h2>
                  <p>Add and manage your products</p>
                </div>
                <button 
                  className="approve-btn" 
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddProduct} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3>Add New Product</h3>
                  <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
                    <input 
                      type="text" 
                      placeholder="Product Title" 
                      value={newProduct.title}
                      onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Price (₹)" 
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                      type="url" 
                      placeholder="Image URL" 
                      value={newProduct.image}
                      onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <button type="submit" className="approve-btn">Submit Product</button>
                  <button type="button" className="reject-btn" style={{ marginLeft: '10px' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                  <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                    Note: {vendor.directSelling ? 'Your product will be approved instantly as you have direct selling privileges.' : 'Your product will require admin approval before it appears on the store.'}
                  </p>
                </form>
              )}

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                        </td>
                        <td>{product.title}</td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className={`status-badge status-${product.status}`}>
                            {product.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>You haven't added any products yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
