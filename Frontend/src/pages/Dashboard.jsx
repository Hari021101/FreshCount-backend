import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, summaryRes] = await Promise.all([
          api.get('/categories'),
          api.get('/stock/summary')
        ]);
        setCategories(catsRes.data.categories);
        setSummary(summaryRes.data.summary);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner"></div>
          <p className="dashboard-loading-text">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your restaurant inventory</p>
        </div>

        {/* Stats Section */}
        {summary && (
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-card-header">
                <div className="stat-card-icon">📦</div>
              </div>
              <p className="stat-card-label">Total Products</p>
              <p className="stat-card-value">{summary.totalProducts}</p>
            </div>

            <div className="stat-card stat-danger">
              <div className="stat-card-header">
                <div className="stat-card-icon">⚠️</div>
              </div>
              <p className="stat-card-label">Out of Stock</p>
              <p className="stat-card-value">{summary.outOfStockProducts.length}</p>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-card-header">
                <div className="stat-card-icon">📉</div>
              </div>
              <p className="stat-card-label">Low Stock</p>
              <p className="stat-card-value">{summary.lowStockProducts.length}</p>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-card-header">
                <div className="stat-card-icon">✓</div>
              </div>
              <p className="stat-card-label">In Stock</p>
              <p className="stat-card-value">
                {summary.totalProducts - summary.outOfStockProducts.length}
              </p>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="categories-section">
          <h2 className="categories-header">Categories</h2>
          {categories.length === 0 ? (
            <div className="categories-empty">
              <div className="categories-empty-icon">📁</div>
              <p className="categories-empty-text">No categories available</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/products?category=${category.id}`)}
                  className="category-card"
                >
                  <div className="category-card-bg-icon">📁</div>
                  <div className="category-card-content">
                    <h3 className="category-card-title">{category.name}</h3>
                    <p className="category-card-description">
                      {category.description || 'No description available'}
                    </p>
                    <div className="category-card-footer">
                      <span className="category-card-link">View Products</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
