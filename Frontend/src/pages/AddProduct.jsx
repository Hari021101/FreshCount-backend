import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitType: 'unit',
    openingStock: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/products', formData);
      navigate('/products');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating product');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <Layout>
      <div className="add-product-container">
        <div className="add-product-header">
          <h1 className="add-product-title">Add New Product</h1>
          <p className="add-product-subtitle">Create a new product in your inventory</p>
        </div>

        <div className="add-product-card">
          <form onSubmit={handleSubmit} className="add-product-form">
            {/* Basic Information Section */}
            <div className="add-product-section">
              <h2 className="add-product-section-title">Basic Information</h2>
              
              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label className="add-product-form-label">
                    Product Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="add-product-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                  <span className="add-product-form-help">
                    Enter a clear and descriptive name for the product
                  </span>
                </div>
              </div>

              <div className="add-product-form-row two-cols">
                <div className="add-product-form-group">
                  <label className="add-product-form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    className="add-product-form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .sort((a, b) => {
                        if (a.name === 'Others') return 1;
                        if (b.name === 'Others') return -1;
                        return a.name.localeCompare(b.name);
                      })
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="add-product-form-group">
                  <label className="add-product-form-label">
                    Unit Type <span className="required">*</span>
                  </label>
                  <select
                    className="add-product-form-select"
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    required
                  >
                    <option value="unit">Unit</option>
                    <option value="kg">Kilogram (Kg)</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Information Section */}
            <div className="add-product-section">
              <h2 className="add-product-section-title">Stock Information</h2>
              
              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label className="add-product-form-label">
                    Opening Stock <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="add-product-form-input"
                    value={formData.openingStock}
                    onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                    placeholder="Enter opening stock quantity"
                    required
                    min="0"
                    step="1"
                  />
                  <span className="add-product-form-help">
                    Initial stock quantity for this product
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="add-product-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="add-product-btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="add-product-btn-submit"
                disabled={loading}
              >
                {loading ? 'Creating Product...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddProduct;
