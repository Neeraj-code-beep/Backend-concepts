import Product from '../models/product.js';

const getProducts = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;

    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // Validate page
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    const skip = (page - 1) * limit;

    // const products = await Product.find()
    //   .sort({ createdAt: 1 })
    //   .skip(skip)
    //   .limit(limit);

    // const totalProducts = await Product.countDocuments();

    // Now here we are going to make this operations faster....
    const [products, totalProducts] = await Promise.all([
      Product.find().sort({ createdAt: 1, _id: 1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
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
    console.error('Error while fetching products:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export { getProducts };
