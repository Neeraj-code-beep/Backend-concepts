import Product from '../models/product.js';

// Controller for normal offset-based pagination.
// It allows clients to request products page by page
// instead of fetching every product in a single request.
const getProducts = async (req, res) => {
  try {
    // Read page and limit from the URL query parameters.
    // Example: /api/products?page=2&limit=10
    //
    // If the client doesn't provide these values,
    // default to page 1 and 10 products per page.
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // Validate the page number before querying the database.
    // Page numbers start at 1, and decimal or negative values
    // would make pagination behave incorrectly.
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Validate how many products the client wants per page.
    // The maximum limit protects the API from requests that
    // attempt to retrieve too many products at once.
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    // Calculate how many products should be skipped.
    //
    // Page 1, limit 10 -> skip 0 products
    // Page 2, limit 10 -> skip 10 products
    // Page 3, limit 10 -> skip 20 products
    //
    // This is the core idea behind offset pagination.
    const skip = (page - 1) * limit;

    // Fetch the requested page of products.
    //
    // sort() defines a consistent order so products can be
    // divided into predictable pages. _id acts as a tie-breaker
    // when multiple products have the same createdAt timestamp.
    //
    // skip() ignores products belonging to earlier pages.
    // limit() restricts the number of products returned.
    //
    // This is normal offset pagination. The database may need
    // to scan past skipped records as the offset increases.
    const productsPromise = Product.find()
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit);

    // Count all matching products so the API can calculate
    // the total number of pages and pagination metadata.
    // countDocuments() without a filter counts all products.
    const totalProductsPromise = Product.countDocuments();

    // Run the product query and count query concurrently.
    // Promise.all() lets both operations execute without
    // waiting for one to finish before starting the other.
    const [products, totalProducts] = await Promise.all([
      productsPromise,
      totalProductsPromise,
    ]);

    // Calculate the number of pages required for all products.
    // Math.ceil() rounds up when the last page is only partially full.
    const totalPages = Math.ceil(totalProducts / limit);

    // Tell the client whether another page exists.
    const hasNextPage = page < totalPages;

    // A previous page exists when the current page is after page 1.
    const hasPreviousPage = page > 1;

    // Return the products along with metadata that helps
    // the frontend build pagination controls.
    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    // Log the actual error on the server for debugging.
    // Don't expose internal error details to the API client.
    console.error('Error while fetching products:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export { getProducts };
