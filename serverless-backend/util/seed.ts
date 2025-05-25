import mongoose from 'mongoose';
import { Role,Category,Sizes,Colors } from '../../serverless-backend/types'


const MONGO_URI = 'mongodb://root:root@mongo:27017/my-db?authSource=admin';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, enum: Object.values(Role), default: Role.BUYER },
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  brand: String,
  images: [String],
  rating: { type: Number, min: 0, max: 5 },
  colors: {type : String, enum: Object.values(Colors), default: Colors.RED},
  sizes: {type : String, enum: Object.values(Sizes), default: Sizes.S},
  category: { type: String, enum: Object.values(Category), default: Category.ELECTRONICS },
  stock: Number,
  features: [String],
});

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 0, max: 5 },
  comment: String,
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Review = mongoose.model('Review', reviewSchema);

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
        { firstName: 'admin', lastName: 'admin', email: 'admin@ucll.be', password: 'admin123', role: Role.ADMIN },
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

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    const products = [
      { name: 'Laptop', description: 'High performance laptop', price: 1200, brand: 'BrandA', images: ['image1.jpg'], rating: 4.5, colors: Colors.RED, sizes: Sizes.M, category: Category.ELECTRONICS, stock: 10, features: ['16GB RAM', '512GB SSD'] },
      { name: 'T-shirt', description: 'Comfortable cotton t-shirt', price: 20, brand: 'BrandB', images: ['image2.jpg'], rating: 4.0, colors: Colors.GREEN, sizes: Sizes.L, category: Category.CLOTHING, stock: 50, features: ['100% Cotton'] },
      { name: 'Smartphone', description: 'Latest model smartphone', price: 800, brand: 'BrandC', images: ['image3.jpg'], rating: 4.8, colors: Colors.BLUE, sizes: Sizes.S, category: Category.ELECTRONICS, stock: 30, features: ['128GB Storage', '12MP Camera'] },
    ];

    await Product.insertMany(products);
    console.log('🌱 Seeded products');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

const seedReviews = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Review.deleteMany({});
    console.log('🧹 Cleared existing reviews');

    const reviews = [
      { productId: '6812052993654848e7351353', userId: '6812052993654848e7351357', rating: 5, comment: 'Great product!' },
      { productId: '6812052993654848e7351355', userId: '6812052993654848e735135b', rating: 3, comment: 'It\'s okay.' },
    ];

    await Review.insertMany(reviews);
    console.log('🌱 Seeded reviews');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
seedProducts();
seedReviews();
