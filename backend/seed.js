import bcrypt from 'bcryptjs';
import { db } from './config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminRef = db.collection('users').doc();
    await adminRef.set({
      email: 'admin@freshcount.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Admin created: admin@freshcount.com / admin123');

    // Create Staff User
    console.log('👤 Creating staff user...');
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffRef = db.collection('users').doc();
    await staffRef.set({
      email: 'staff@freshcount.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'staff',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Staff created: staff@freshcount.com / staff123\n');

    // Create Categories
    console.log('📁 Creating categories...');
    const categories = [
      { name: 'Flour', description: 'All types of flour and baking ingredients' },
      { name: 'Snacks', description: 'Packaged snacks and ready-to-eat items' },
      { name: 'Veg', description: 'Fresh vegetables' },
      { name: 'Fruits', description: 'Fresh fruits' },
      { name: 'Packing', description: 'Packaging materials and containers' },
      { name: 'Groceries', description: 'General grocery items' },
      { name: 'Others', description: 'Miscellaneous items' }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const categoryRef = db.collection('categories').doc();
      await categoryRef.set({
        ...category,
        createdAt: new Date().toISOString(),
        createdBy: adminRef.id
      });
      categoryIds[category.name] = categoryRef.id;
      console.log(`   ✓ ${category.name}`);
    }
    console.log('');

    // Create Sample Products
    console.log('📦 Creating sample products...');
    const products = [
      { name: 'Wheat Flour', categoryName: 'Flour', unitType: 'kg', openingStock: 100 },
      { name: 'All Purpose Flour', categoryName: 'Flour', unitType: 'kg', openingStock: 50 },
      { name: 'Rice Flour', categoryName: 'Flour', unitType: 'kg', openingStock: 30 },
      
      { name: 'French Fries (Frozen)', categoryName: 'Snacks', unitType: 'kg', openingStock: 25 },
      { name: 'Potato Chips', categoryName: 'Snacks', unitType: 'unit', openingStock: 50 },
      
      { name: 'Tomato', categoryName: 'Veg', unitType: 'kg', openingStock: 40 },
      { name: 'Onion', categoryName: 'Veg', unitType: 'kg', openingStock: 50 },
      { name: 'Potato', categoryName: 'Veg', unitType: 'kg', openingStock: 60 },
      { name: 'Carrot', categoryName: 'Veg', unitType: 'kg', openingStock: 20 },
      
      { name: 'Apple', categoryName: 'Fruits', unitType: 'kg', openingStock: 30 },
      { name: 'Banana', categoryName: 'Fruits', unitType: 'kg', openingStock: 25 },
      { name: 'Orange', categoryName: 'Fruits', unitType: 'kg', openingStock: 35 },
      
      { name: 'Plastic Containers', categoryName: 'Packing', unitType: 'unit', openingStock: 200 },
      { name: 'Food Wrap', categoryName: 'Packing', unitType: 'unit', openingStock: 15 },
      { name: 'Paper Bags', categoryName: 'Packing', unitType: 'unit', openingStock: 500 },
      
      { name: 'Cooking Oil', categoryName: 'Groceries', unitType: 'litre', openingStock: 50 },
      { name: 'Salt', categoryName: 'Groceries', unitType: 'kg', openingStock: 20 },
      { name: 'Sugar', categoryName: 'Groceries', unitType: 'kg', openingStock: 40 },
      
      { name: 'Napkins', categoryName: 'Others', unitType: 'unit', openingStock: 100 },
      { name: 'Cleaning Supplies', categoryName: 'Others', unitType: 'unit', openingStock: 30 }
    ];

    const productIds = [];
    for (const product of products) {
      const productRef = db.collection('products').doc();
      await productRef.set({
        name: product.name,
        categoryId: categoryIds[product.categoryName],
        unitType: product.unitType,
        openingStock: product.openingStock,
        currentStock: product.openingStock,
        createdAt: new Date().toISOString(),
        createdBy: adminRef.id
      });
      productIds.push({ id: productRef.id, name: product.name });
      console.log(`   ✓ ${product.name} (${product.openingStock} ${product.unitType})`);
    }
    console.log('');

    // Create Sample Stock Movements
    console.log('📊 Creating sample stock movements...');
    const movements = [
      { productName: 'Wheat Flour', type: 'IN', quantity: 20 },
      { productName: 'Tomato', type: 'IN', quantity: 10 },
      { productName: 'Onion', type: 'OUT', quantity: 5 },
      { productName: 'Cooking Oil', type: 'IN', quantity: 15 },
      { productName: 'Apple', type: 'OUT', quantity: 3 }
    ];

    for (const movement of movements) {
      const product = productIds.find(p => p.name === movement.productName);
      if (product) {
        const movementRef = db.collection('stock_movements').doc();
        await movementRef.set({
          productId: product.id,
          type: movement.type,
          quantity: movement.quantity,
          unitType: products.find(p => p.name === movement.productName).unitType,
          notes: 'Sample stock movement',
          createdBy: staffRef.id,
          createdByName: 'staff@freshcount.com',
          createdAt: new Date().toISOString()
        });

        // Update product current stock
        const productRef = db.collection('products').doc(product.id);
        const productDoc = await productRef.get();
        const currentStock = productDoc.data().currentStock;
        const newStock = movement.type === 'IN' 
          ? currentStock + movement.quantity 
          : currentStock - movement.quantity;
        
        await productRef.update({ currentStock: newStock });
        
        console.log(`   ✓ ${movement.productName}: ${movement.type} ${movement.quantity}`);
      }
    }

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Admin: admin@freshcount.com / admin123');
    console.log('   Staff: staff@freshcount.com / staff123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
