import mongoose from 'mongoose';
import Product from '../models/product.js';

// Phase 3: Cursor-based pagination.
// Instead of skipping earlier records, this controller
// starts after the position identified by the cursor.
const getProductsWithCursor = async (req, res) => {
  try {
    // Default to 10 products when limit is not provided.
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    // Validate the requested page size.
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    // The first request has no cursor.
    // Later requests provide the cursor returned by the previous page.
    let cursorDate = null;
    let cursorId = null;

    if (req.query.cursor !== undefined) {
      const cursor = req.query.cursor;

      // Query parameters should contain a single string cursor.
      if (typeof cursor !== 'string' || cursor.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cursor must be a non-empty string',
        });
      }

      let decodedCursor;

      // Decode the cursor and parse its JSON payload.
      // Malformed cursor values should produce a client error.
      try {
        decodedCursor = JSON.parse(
          Buffer.from(cursor, 'base64url').toString('utf8'),
        );
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor format',
        });
      }

      // Validate both values needed to locate the next position.
      if (
        !decodedCursor ||
        typeof decodedCursor.createdAt !== 'string' ||
        typeof decodedCursor.id !== 'string' ||
        !/^[a-f\d]{24}$/i.test(decodedCursor.id)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor data',
        });
      }

      cursorDate = new Date(decodedCursor.createdAt);

      if (
        Number.isNaN(cursorDate.getTime()) ||
        cursorDate.toISOString() !== decodedCursor.createdAt
      ) {
        return res.status(400).json({
          success: false,
          message: 'Cursor contains an invalid timestamp',
        });
      }

      cursorId = new mongoose.Types.ObjectId(decodedCursor.id);
    }

    // Start with an empty filter for the first page.
    const filter = {};

    if (cursorDate && cursorId) {
      // Find products strictly after the cursor.
      // The _id condition handles products sharing the same timestamp.
      filter.$or = [
        { createdAt: { $gt: cursorDate } },
        {
          createdAt: cursorDate,
          _id: { $gt: cursorId },
        },
      ];
    }

    // Fetch one extra product to determine whether another page exists.
    // This avoids a separate countDocuments() query.
    const fetchedProducts = await Product.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    // The extra product is only used to detect another page.
    const hasNextPage = fetchedProducts.length > limit;
    const products = fetchedProducts.slice(0, limit);

    // Build the next cursor from the last product we actually return.
    let nextCursor = null;

    if (hasNextPage && products.length > 0) {
      const lastProduct = products[products.length - 1];

      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: lastProduct.createdAt.toISOString(),
          id: lastProduct._id.toString(),
        }),
      ).toString('base64url');
    }

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('Error while fetching cursor-paginated products:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export { getProductsWithCursor };
