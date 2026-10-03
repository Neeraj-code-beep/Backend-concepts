import { faker } from '@faker-js/faker';
import Product from '../src/models/product.js';
import connectToDB from '../src/db/db.js';

const categories = [
  'electronics',
  'grocery',
  'clothing',
  'books',
  'home',
  'sports',
  'beauty',
];

const brands = [
  'Apple',
  'Samsung',
  'ASUS',
  'Sony',
  'Dell',
  'HP',
  'Nike',
  'Adidas',
  'LG',
  'Lenovo',
];

const generateProducts = (count) => {
  return Array.from({ length: count }, () => ({
    name: faker.commerce.productName(),

    description: faker.commerce.productDescription(),

    category: faker.helpers.arrayElement(categories),

    brand: faker.helpers.arrayElement(brands),

    price: Number(
      faker.commerce.price({
        min: 100,
        max: 100000,
      }),
    ),

    rating: faker.number.float({
      min: 0,
      max: 5,
      fractionDigits: 1,
    }),

    stock: faker.number.int({
      min: 0,
      max: 500,
    }),
  }));
};

const seedProducts = async () => {
  try {
    console.log('Connecting to database...');

    await connectToDB();

    console.log('Database connected');

    const products = generateProducts(50);

    console.log('Products generated:', products.length);

    await Product.insertMany(products);

    console.log(`${products.length} products inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error while seeding products:', error);

    process.exit(1);
  }
};

seedProducts();
