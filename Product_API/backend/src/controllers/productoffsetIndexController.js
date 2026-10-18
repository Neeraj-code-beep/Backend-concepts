import Product from '../models/product.js';

// Controller for offset pagination with an index-compatible sort.
// The compound index is defined in the Product model.
const getProductsWithIndexedOffset = async (req, res) => {
  try {
    // Read pagination parameters, using defaults when omitted.
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // Validate the page number before querying the database.
    if (!Number.isSafeInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Restrict the page size to prevent excessively large responses.
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    // Calculate the number of products to skip.
    const skip = (page - 1) * limit;

    // Reject offsets that exceed JavaScript's safe integer range.
    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: 'Requested page is too large',
      });
    }

    // Match the sort order to the compound index:
    // { createdAt: 1, _id: 1 }
    //
    // MongoDB can use this index to provide the sorted results
    // when the query planner determines it is appropriate.
    const [products, totalProducts] = await Promise.all([
      Product.find()
        .sort({ createdAt: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      Product.countDocuments().exec(),
    ]);

    // Calculate pagination metadata for the client.
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    // Keep internal error details in server logs.
    console.error('Error while fetching indexed products:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export { getProductsWithIndexedOffset };
