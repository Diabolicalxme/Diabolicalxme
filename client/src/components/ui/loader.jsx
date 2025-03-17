/* import { motion } from "framer-motion";

function Loader({ className }) {

  const petalAnimation = {
    initial: { y: "-10%", opacity: 0 },
    animate: {
      y: "110%",
      opacity: [0.8, 0.5, 0],
      rotate: [0, 30, -30, 0],
    },
    transition: {
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut",
    },
  };

  return (
    <div
      className={`z-50 w-screen h-screen bg-background fixed inset-0 bg-gradient-to-b from-pastel-pink to-pastel-cream flex items-center justify-center overflow-hidden ${className}`}
    >
     
      <motion.div
        className="absolute h-[250px] w-[250px] rounded-full bg-gradient-to-r from-pink-300 via-pastel-gold to-transparent blur-2xl opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

     
      <motion.div
        className="relative h-16 w-16 md:h-24 md:w-24 rounded-full border-[6px] border-t-gold-500 border-b-pink-500 shadow-xl"
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
      >
      
        <motion.div
          className="absolute inset-0 m-auto h-12 w-12 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-pastel-gold via-white to-pink-100 shadow-lg"
          animate={{
            scale: [0.9, 1, 0.9],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >

          <div className="flex items-center justify-center h-full">
            <motion.span
              className="text-pink-500 text-xl md:text-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              🌸
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

     
      <div className="absolute top-2/3 text-xl font-semibold text-maroon-600 animate-pulse">
        Loading boutique elegance...
      </div>

    
     <div className="absolute inset-0 -z-20">
  {[...Array(12)].map((_, i) => {
    
    const safeZone = {
      topMin: 30, // 30% from the top
      topMax: 70, // 70% from the top
      leftMin: 30, // 30% from the left
      leftMax: 70, // 70% from the left
    };

    let top, left;

   
    do {
      top = Math.random() * 100;
      left = Math.random() * 100;
    } while (
      top > safeZone.topMin &&
      top < safeZone.topMax &&
      left > safeZone.leftMin &&
      left < safeZone.leftMax
    );

    return (
      <motion.div
        key={i}
        className="absolute w-6 h-6 text-pink-400"
        style={{
          top: `${top}%`,
          left: `${left}%`,
        }}
        animate={{
          y: ["0%", "-50%", "0%"],
          rotate: [0, 360, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌸
      </motion.div>
    );
  })}
</div>

    </div>
  );
}

export { Loader };
 */



import { motion } from "framer-motion";

function Loader({ className }) {
  return (
    <div
      className={`z-50 w-screen h-screen fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2YzYuNjMgMCAxMiA1LjM3IDEyIDEyaC02YzAgNi42MyA1LjM3IDEyIDEyIDEyIDYuNjMgMCAxMi01LjM3IDEyLTEyaC02eiIgZmlsbD0iIzAwMCIvPjwvZz48L3N2Zz4=')] bg-repeat"></div>
      </div>

      {/* Outer Glow */}
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full bg-gradient-to-r from-black/5 via-black/10 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Logo Container */}
      <div className="relative mb-16">
        {/* Brand Logo or Symbol */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="black"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M40 60C40 48.954 48.954 40 60 40C71.046 40 80 48.954 80 60C80 71.046 71.046 80 60 80"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.path
              d="M60 80C48.954 80 40 71.046 40 60"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
            />
          </svg>
        </motion.div>

        {/* Rotating Elements */}
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 border border-black/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute top-[-10px] left-[-10px] right-[-10px] bottom-[-10px] border border-black/5 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Elegant Loading Text */}
      <div className="relative">
        <motion.div
          className="text-xl md:text-2xl font-light uppercase tracking-[0.3em] text-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          DIABOLICALXME
        </motion.div>

        <motion.div
          className="mt-2 text-sm text-center text-gray-500 font-light tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        >
          Crafting elegance, please wait...
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          className="mt-6 h-[1px] bg-black/20 w-[200px] mx-auto overflow-hidden"
        >
          <motion.div
            className="h-full bg-black"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-black rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { Loader };
