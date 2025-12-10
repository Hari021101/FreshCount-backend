import { db } from '../config/firebase.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = db.collection('products');
    
    if (categoryId) {
      // When filtering by category, don't use orderBy to avoid composite index requirement
      query = query.where('categoryId', '==', categoryId);
    } else {
      // Only order by name when showing all products
      query = query.orderBy('name');
    }
    
    const productsSnapshot = await query.get();
    let products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If filtering by category, sort in memory instead
    if (categoryId) {
      products = products.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productDoc = await db.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      id: productDoc.id,
      ...productDoc.data()
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, categoryId, unitType, openingStock } = req.body;

    // Validate required fields
    if (!name || !categoryId || !unitType || openingStock === undefined) {
      return res.status(400).json({
        message: 'Name, categoryId, unitType, and openingStock are required'
      });
    }

    // Validate unit type
    const validUnits = ['kg', 'gram', 'litre', 'ml', 'unit', 'piece'];
    if (!validUnits.includes(unitType)) {
      return res.status(400).json({
        message: `Invalid unit type. Valid types: ${validUnits.join(', ')}`
      });
    }

    // Verify category exists
    const categoryDoc = await db.collection('categories').doc(categoryId).get();
    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productRef = db.collection('products').doc();
    await productRef.set({
      name,
      categoryId,
      unitType,
      openingStock: Number(openingStock),
      currentStock: Number(openingStock), // Initially same as opening stock
      createdAt: new Date().toISOString(),
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: productRef.id,
        name,
        categoryId,
        unitType,
        openingStock: Number(openingStock),
        currentStock: Number(openingStock)
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, categoryId, unitType, openingStock } = req.body;

    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {};
    
    if (name) updateData.name = name;
    if (categoryId) {
      // Verify category exists
      const categoryDoc = await db.collection('categories').doc(categoryId).get();
      if (!categoryDoc.exists) {
        return res.status(404).json({ message: 'Category not found' });
      }
      updateData.categoryId = categoryId;
    }
    if (unitType) {
      const validUnits = ['kg', 'gram', 'litre', 'ml', 'unit', 'piece'];
      if (!validUnits.includes(unitType)) {
        return res.status(400).json({
          message: `Invalid unit type. Valid types: ${validUnits.join(', ')}`
        });
      }
      updateData.unitType = unitType;
    }
    if (openingStock !== undefined) {
      updateData.openingStock = Number(openingStock);
    }
    
    updateData.updatedAt = new Date().toISOString();

    await productRef.update(updateData);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product has stock movements
    const movementsSnapshot = await db.collection('stock_movements')
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (!movementsSnapshot.empty) {
      return res.status(400).json({
        message: 'Cannot delete product with existing stock movements'
      });
    }

    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productRef.delete();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// Calculate closing stock for a product
export const getProductClosingStock = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = productDoc.data();
    
    // Get all stock movements for this product
    const movementsSnapshot = await db.collection('stock_movements')
      .where('productId', '==', productId)
      .orderBy('createdAt', 'asc')
      .get();

    let totalIn = 0;
    let totalOut = 0;

    movementsSnapshot.docs.forEach(doc => {
      const movement = doc.data();
      if (movement.type === 'IN') {
        totalIn += movement.quantity;
      } else if (movement.type === 'OUT') {
        totalOut += movement.quantity;
      }
    });

    const closingStock = productData.openingStock + totalIn - totalOut;

    res.json({
      productId,
      openingStock: productData.openingStock,
      currentStock: productData.currentStock,
      closingStock,
      totalIn,
      totalOut
    });
  } catch (error) {
    console.error('Get closing stock error:', error);
    res.status(500).json({ message: 'Server error calculating closing stock' });
  }
};
