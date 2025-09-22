import { motion } from "framer-motion";

function Loader({ className }) {
  return (
    <div
      className={`z-[100] w-screen h-screen fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Minimalistic Loading Animation */}
        <motion.div
          className="relative w-12 h-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dot 1 */}
          <motion.div
            className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full"
            animate={{
              y: [0, 8, 0],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
          />

          {/* Dot 2 */}
          <motion.div
            className="absolute top-0 left-[18px] w-3 h-3 bg-white rounded-full"
            animate={{
              y: [0, 8, 0],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />

          {/* Dot 3 */}
          <motion.div
            className="absolute top-0 left-[36px] w-3 h-3 bg-white rounded-full"
            animate={{
              y: [0, 8, 0],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          className="mt-6 text-sm font-light uppercase tracking-widest text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          DIABOLICALXME
        </motion.div>
      </div>
    </div>
  );
}

export { Loader };
