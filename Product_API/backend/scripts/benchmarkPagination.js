import dotenv from 'dotenv';
import Product from '../src/models/product.js';
import connectToDB from '../src/db/db.js';

dotenv.config();

console.log(process.env.MONGO_URL);

const benchmarkPagination = async () => {
  try {
    await connectToDB();

    const explain = await Product.find()
      .sort({ createdAt: 1, _id: 1 })
      .skip(10)
      .limit(10)
      .explain('executionStats');

    console.log(
      JSON.stringify(
        {
          winningPlan: explain.queryPlanner.winningPlan,
          executionStats: {
            executionTimeMillis: explain.executionStats.executionTimeMillis,

            totalDocsExamined: explain.executionStats.totalDocsExamined,

            totalKeysExamined: explain.executionStats.totalKeysExamined,

            nReturned: explain.executionStats.nReturned,
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exitCode = 1;
  } finally {
    // Close the database connection after the experiment.
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
  }
};

benchmarkPagination();
