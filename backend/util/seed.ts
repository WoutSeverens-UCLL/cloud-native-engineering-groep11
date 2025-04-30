import mongoose from 'mongoose';
import { Role } from '../types'

const MONGO_URI = 'mongodb://root:root@mongo:27017/'; // change if needed

// Define a simple User schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, enum: Object.values(Role), default: Role.BUYER },
});

const User = mongoose.model('User', userSchema);

// Seed function
const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    const users = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@ucll.be', password: 'password123', role: Role.BUYER },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@ucll.be', password: 'password123', role: Role.SELLER },
        { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@ucll.be', password: 'password123', role: Role.ADMIN },
        { firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@ucll.be', password: 'password123', role: Role.SELLER },
        { firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@ucll.be', password: 'password123', role: Role.BUYER },
    ];

    await User.insertMany(users);
    console.log('🌱 Seeded users');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
