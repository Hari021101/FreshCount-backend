import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StockHistory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [movementsRes, productsRes] = await Promise.all([
        api.get('/stock'),
        api.get('/products')
      ]);
      
      // Create a map of product IDs to names for easy lookup
      const productMap = {};
      productsRes.data.products.forEach(p => {
        productMap[p.id] = p;
      });
      setProducts(productMap);
      setMovements(movementsRes.data.movements);
    } catch (error) {
      console.error('Error fetching stock history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will REVERSE the stock change.')) {
      try {
        await api.delete(`/stock/${id}`);
        fetchHistory();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stock History</h2>
          <p className="text-slate-500">View all stock adjustments and movements</p>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                  <th>User</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">Loading history...</td></tr>
                ) : movements.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No records found.</td></tr>
                ) : (
                  movements.map(movement => {
                    const product = products[movement.productId];
                    const isIn = movement.type === 'IN';
                    
                    return (
                      <tr key={movement.id}>
                        <td className="text-slate-500 font-mono text-sm">
                          {new Date(movement.createdAt).toLocaleString()}
                        </td>
                        <td className="font-medium text-slate-900">
                          {product ? product.name : 'Unknown Product'}
                        </td>
                        <td>
                          <span className={`badge ${isIn ? 'badge-green' : 'badge-red'}`}>
                            {movement.type}
                          </span>
                        </td>
                        <td className="font-bold text-slate-900">
                          {isIn ? '+' : '-'}{movement.quantity} {movement.unitType}
                        </td>
                        <td className="text-slate-500 truncate max-w-[200px]">
                          {movement.notes || '-'}
                        </td>
                        <td className="text-blue-500 text-sm">
                          {movement.createdByName || 'Unknown'}
                        </td>
                        {user?.role === 'admin' && (
                          <td>
                            <button 
                              onClick={() => handleDelete(movement.id)}
                              className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete & Reverse"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockHistory;
