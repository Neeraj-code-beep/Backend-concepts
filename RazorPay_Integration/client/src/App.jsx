import axios from 'axios';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PaymentButton from './PaymentButton';

const App = () => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:5000/api/products/get-item',
        );

        setProduct(data.product);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);

  const formatCurrency = (amount, currency) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 0,
      }).format(amount / 100);
    } catch {
      return `${amount.toLocaleString('en-IN')}`;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 grid place-items-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-slate-400"
        >
          Loading product...
        </motion.div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950 grid place-items-center">
        <p className="text-sm text-red-400">Unable to load product.</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      {/* Product Card */}
      <motion.article
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
        }}
        whileHover={{
          y: -10,
          scale: 1.015,
        }}
        className="
          relative
          z-10
          w-full
          max-w-sm
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/[0.07]
          shadow-2xl
          shadow-black/40
          backdrop-blur-xl
        "
      >
        {/* Image */}
        <div className="relative m-3 h-52 overflow-hidden rounded-2xl">
          <motion.img
            src={product.image}
            alt={product.title}
            whileHover={{ scale: 1.08 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className="h-full w-full object-cover"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Category */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="
              absolute
              left-3
              top-3
              rounded-full
              border
              border-white/20
              bg-black/40
              px-3
              py-1
              text-xs
              font-medium
              text-white
              backdrop-blur-md
            "
          >
            {product.category}
          </motion.span>
        </div>

        {/* Product Details */}
        <div className="px-5 pb-5 pt-2">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              text-xl
              font-semibold
              tracking-tight
              text-white
            "
          >
            {product.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="
              mt-2
              line-clamp-2
              text-sm
              leading-6
              text-slate-400
            "
          >
            {product.description}
          </motion.p>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 flex items-end gap-2"
          >
            <span className="text-3xl font-bold tracking-tight text-white">
              {formatCurrency(
                product.price?.amount ?? 0,
                product.price?.currency,
              )}
            </span>

            <span className="mb-1 text-xs text-slate-500">
              {product.price?.currency}
            </span>
          </motion.div>

          {/* Buy Button */}
          <PaymentButton />

          {/* Payment Text */}
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Secure checkout powered by Razorpay
          </p>
        </div>
      </motion.article>
    </main>
  );
};

export default App;
