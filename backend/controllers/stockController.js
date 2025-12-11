import { db } from '../config/firebase.js';

// Get all stock movements
export const getAllStockMovements = async (req, res) => {
  try {
    const { productId, type, startDate, endDate } = req.query;
    
    let query = db.collection('stock_movements');
    
    if (productId) {
      query = query.where('productId', '==', productId);
    }
    
    if (type && (type === 'IN' || type === 'OUT')) {
      query = query.where('type', '==', type);
    }
    
    const movementsSnapshot = await query.orderBy('createdAt', 'desc').get();
    let movements = movementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by date if provided
    if (startDate || endDate) {
      movements = movements.filter(movement => {
        const movementDate = new Date(movement.createdAt);
        if (startDate && movementDate < new Date(startDate)) return false;
        if (endDate && movementDate > new Date(endDate)) return false;
        return true;
      });
    }

    res.json({ movements });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Server error fetching stock movements' });
  }
};

// Create stock movement (Staff can only create IN, Admin can create both IN and OUT)
export const createStockMovement = async (req, res) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    // Validate required fields
    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({
        message: 'productId, type, and quantity are required'
      });
    }

    // Validate type
    if (type !== 'IN' && type !== 'OUT') {
      return res.status(400).json({
        message: 'Type must be either IN or OUT'
      });
    }

    // Staff can only add stock (IN), not remove (OUT)
    if (req.user.role === 'staff' && type === 'OUT') {
      return res.status(403).json({
        message: 'Staff can only add stock (IN). Contact admin for stock removal.'
      });
    }

    // Verify product exists
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = productDoc.data();
    const numQuantity = Number(quantity);

    // Validate quantity is positive
    if (numQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // For OUT movements, check if we have enough stock
    if (type === 'OUT' && productData.currentStock < numQuantity) {
      return res.status(400).json({
        message: `Insufficient stock. Current stock: ${productData.currentStock}`
      });
    }

    // Create stock movement
    const movementRef = db.collection('stock_movements').doc();
    await movementRef.set({
      productId,
      type,
      quantity: numQuantity,
      unitType: productData.unitType,
      notes: notes || '',
      createdBy: req.user.userId,
      createdByName: req.user.email,
      createdAt: new Date().toISOString()
    });

    // Update product's current stock
    const newCurrentStock = type === 'IN' 
      ? productData.currentStock + numQuantity
      : productData.currentStock - numQuantity;

    await productRef.update({
      currentStock: newCurrentStock,
      lastUpdated: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Stock movement created successfully',
      movement: {
        id: movementRef.id,
        productId,
        type,
        quantity: numQuantity,
        currentStock: newCurrentStock
      }
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ message: 'Server error creating stock movement' });
  }
};

// Get stock movement by ID
export const getStockMovement = async (req, res) => {
  try {
    const { movementId } = req.params;
    const movementDoc = await db.collection('stock_movements').doc(movementId).get();

    if (!movementDoc.exists) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }

    res.json({
      id: movementDoc.id,
      ...movementDoc.data()
    });
  } catch (error) {
    console.error('Get stock movement error:', error);
    res.status(500).json({ message: 'Server error fetching stock movement' });
  }
};

// Delete stock movement (Admin only) - This will reverse the stock change
export const deleteStockMovement = async (req, res) => {
  try {
    const { movementId } = req.params;

    const movementRef = db.collection('stock_movements').doc(movementId);
    const movementDoc = await movementRef.get();

    if (!movementDoc.exists) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }

    const movementData = movementDoc.data();

    // Get the product and reverse the stock change
    const productRef = db.collection('products').doc(movementData.productId);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const productData = productDoc.data();
      const reversedStock = movementData.type === 'IN'
        ? productData.currentStock - movementData.quantity
        : productData.currentStock + movementData.quantity;

      await productRef.update({
        currentStock: reversedStock,
        lastUpdated: new Date().toISOString()
      });
    }

    // Delete the movement
    await movementRef.delete();

    res.json({ message: 'Stock movement deleted successfully' });
  } catch (error) {
    console.error('Delete stock movement error:', error);
    res.status(500).json({ message: 'Server error deleting stock movement' });
  }
};

// Get stock summary (useful for dashboard)
export const getStockSummary = async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    
    const summary = {
      totalProducts: productsSnapshot.size,
      lowStockProducts: [],
      outOfStockProducts: [],
      totalStockValue: 0
    };

    productsSnapshot.docs.forEach(doc => {
      const product = doc.data();
      if (product.currentStock === 0) {
        summary.outOfStockProducts.push({
          id: doc.id,
          name: product.name,
          categoryId: product.categoryId
        });
      } else if (product.currentStock < product.openingStock * 0.2) { // Less than 20% of opening stock
        summary.lowStockProducts.push({
          id: doc.id,
          name: product.name,
          currentStock: product.currentStock,
          openingStock: product.openingStock,
          categoryId: product.categoryId
        });
      }
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ message: 'Server error fetching stock summary' });
  }
};
