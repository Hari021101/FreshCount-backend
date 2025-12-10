import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  
  const { user } = useAuth();
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', categoryId: '', unitType: 'unit', openingStock: 0
  });
  const [stockForm, setStockForm] = useState({
    type: 'IN', quantity: '', notes: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value) setSearchParams({ category: value });
    else setSearchParams({});
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
      } else {
        await api.post('/products', productForm);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', categoryId: '', unitType: 'unit', openingStock: 0 });
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    try {
      await api.post('/stock', {
        productId: selectedProductForStock.id,
        ...stockForm
      });
      setIsStockModalOpen(false);
      setSelectedProductForStock(null);
      setStockForm({ type: 'IN', quantity: '', notes: '' });
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating stock');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const openEditModal = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const openStockModal = (product) => {
    setSelectedProductForStock(product);
    setStockForm(prev => ({ ...prev, unitType: product.unitType }));
    setIsStockModalOpen(true);
  };

  return (
    <Layout>
      <div>
        <div className="products-header">
          <div className="products-title-section">
            <h2>Inventory</h2>
            <p>Manage products and stock levels</p>
          </div>
          <div className="products-actions">
            <select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/products/add')}
                className="btn btn-primary nowrap"
              >
                + New Product
              </button>
            )}
          </div>
        </div>

        <div className="products-table-wrapper">
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Opening Stock</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">Loading inventory...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No products found.</td></tr>
                ) : (
                  products.map(product => {
                    const category = categories.find(c => c.id === product.categoryId);
                    const isLowStock = product.currentStock < (product.openingStock * 0.2);
                    const isOutOfStock = product.currentStock <= 0;

                    return (
                      <tr key={product.id}>
                        <td className="font-medium text-slate-900">{product.name}</td>
                        <td>
                          <span className="badge badge-blue">
                            {category?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="text-muted lowercase">{product.unitType}</td>
                        <td className="text-muted">{product.openingStock}</td>
                        <td>
                          <span className={`font-bold ${isOutOfStock ? 'text-red' : isLowStock ? 'text-yellow' : 'text-green'}`}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge badge-red">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="badge badge-yellow">Low Stock</span>
                          ) : (
                            <span className="badge badge-green">In Stock</span>
                          )}
                        </td>
                        <td>
                          <div className="product-actions">
                            <button 
                              onClick={() => openStockModal(product)}
                              className="btn btn-success text-xs py-1 px-3"
                            >
                              + Stock
                            </button>

                            {user?.role === 'admin' && (
                              <>
                                <button 
                                  onClick={() => openEditModal(product)}
                                  className="product-action-btn text-blue-500 hover:text-blue-600"
                                  title="Edit"
                                >
                                  ✎
                                </button>

                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="product-action-btn text-red-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  🗑
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal (Create/Edit) */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleProductSubmit} className="form-stack">
          <div>
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              value={productForm.name}
              onChange={e => setProductForm({...productForm, name: e.target.value})}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="form-grid">
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={productForm.categoryId}
                onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories
                  .sort((a, b) => {
                    if (a.name === 'Others') return 1;
                    if (b.name === 'Others') return -1;
                    return a.name.localeCompare(b.name);
                  })
                  .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Unit Type</label>
              <select
                className="form-input"
                value={productForm.unitType}
                onChange={e => setProductForm({...productForm, unitType: e.target.value})}
                required
              >
                <option value="unit">Unit</option>
                <option value="kg">Kg</option>
                <option value="gram">Gram</option>
                <option value="litre">Litre</option>
                <option value="ml">Ml</option>
                <option value="piece">Piece</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="form-label">Opening Stock</label>
            <input
              type="number"
              className="form-input"
              value={productForm.openingStock}
              onChange={e => setProductForm({...productForm, openingStock: e.target.value})}
              placeholder="Enter opening stock quantity"
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Update Stock: ${selectedProductForStock?.name}`}
      >
        <form onSubmit={handleStockSubmit} className="form-stack">
          <div>
            <label className="form-label">Action</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="type"
                  value="IN"
                  checked={stockForm.type === 'IN'}
                  onChange={e => setStockForm({...stockForm, type: e.target.value})}
                />
                <span className="text-green font-medium">Add Stock (IN)</span>
              </label>
              {user?.role === 'admin' && (
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="OUT"
                    checked={stockForm.type === 'OUT'}
                    onChange={e => setStockForm({...stockForm, type: e.target.value})}
                  />
                  <span className="text-red font-medium">Remove Stock (OUT)</span>
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="form-label">Quantity</label>
            <div className="input-group">
              <input
                type="number"
                className="form-input"
                value={stockForm.quantity}
                onChange={e => setStockForm({...stockForm, quantity: e.target.value})}
                required
                min="0.01"
                step="0.01"
                autoFocus
              />
              <span className="text-muted font-medium">{selectedProductForStock?.unitType}</span>
            </div>
          </div>
          <div>
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-input"
              value={stockForm.notes}
              onChange={e => setStockForm({...stockForm, notes: e.target.value})}
              rows="2"
            />
          </div>
          <div className="modal-actions" style={{ borderTop: 'none', marginTop: '0', paddingTop: '0' }}>
            <button type="button" onClick={() => setIsStockModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Update
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Products;
