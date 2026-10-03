import Product from '../models/product.js';

const getProducts = async (req, res) => {
  try {
    // const {page , limit} = req.query;
    // Now lets do in very professional wayyy okie...

    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    // Validation part...

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page mush be a positive integer',
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    console.log(`page:- ${page} , limit:- ${limit}`);

    const skip = (page - 1) * limit;

    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log('Error while fetching products:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export { getProducts };
