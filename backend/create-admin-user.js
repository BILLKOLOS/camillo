require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use MONGODB_URI from .env or fallback to localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://camillo:Admin%40camillo2020$2019@camillo.jazlfot.mongodb.net/';

// Admin user details
const adminUser = {
  email: 'Admin@camillo.com',
  name: 'Admin',
  phone: '+254700000000',
  role: 'admin',
  balance: 0,
  password: 'Admin@Camillo2020$2019'
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Check if admin user already exists
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      role: { type: String, enum: ['client', 'admin'], default: 'client' },
      balance: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      password: { type: String, required: true },
    }));

    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      console.log('Balance:', existingAdmin.balance);
      return;
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    console.log('Password hashed successfully!');

    // Create the admin user
    console.log('Creating admin user...');
    const newAdmin = new User({
      email: adminUser.email,
      name: adminUser.name,
      phone: adminUser.phone,
      role: adminUser.role,
      balance: adminUser.balance,
      password: hashedPassword
    });

    await newAdmin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', newAdmin.email);
    console.log('Name:', newAdmin.name);
    console.log('Role:', newAdmin.role);
    console.log('Balance:', newAdmin.balance);
    console.log('Created at:', newAdmin.createdAt);

    console.log('\n🎉 You can now login with:');
    console.log('Email: Admin@camillo.com');
    console.log('Password: Admin@Camillo2020$2019');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('This email already exists in the database.');
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the script
createAdminUser(); 