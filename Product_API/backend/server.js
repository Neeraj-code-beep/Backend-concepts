import dotenv from 'dotenv';
import app from './src/app.js';
import connectToDB from './src/db/db.js';

dotenv.config();
const port = 5000;

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
