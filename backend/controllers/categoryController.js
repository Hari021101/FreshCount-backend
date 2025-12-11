import { db } from '../config/firebase.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categoriesSnapshot = await db.collection('categories').orderBy('name').get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryDoc = await db.collection('categories').doc(categoryId).get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      id: categoryDoc.id,
      ...categoryDoc.data()
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error fetching category' });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await db.collection('categories')
      .where('name', '==', name)
      .get();

    if (!existingCategory.empty) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const categoryRef = db.collection('categories').doc();
    await categoryRef.set({
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: categoryRef.id,
        name,
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const categoryRef = db.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date().toISOString();

    await categoryRef.update(updateData);

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category has products
    const productsSnapshot = await db.collection('products')
      .where('categoryId', '==', categoryId)
      .get();

    if (!productsSnapshot.empty) {
      return res.status(400).json({
        message: 'Cannot delete category with existing products. Please delete or reassign products first.'
      });
    }

    const categoryRef = db.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await categoryRef.delete();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
