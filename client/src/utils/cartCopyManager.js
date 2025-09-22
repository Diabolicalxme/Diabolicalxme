// Cart copy state management to prevent duplicate copying during authentication
let cartCopyState = {
  isInProgress: false,
  hasCompleted: false,
  userId: null,
  timestamp: null
};

const CART_COPY_FLAG_PREFIX = 'tempCartCopied_';
const CART_COPY_TIMESTAMP_PREFIX = 'tempCartCopyTime_';

/**
 * Check if cart copy has been completed for a user
 * @param {string} userId - User ID
 * @returns {boolean} Whether cart copy has been completed
 */
export const hasCartCopyCompleted = (userId) => {
  if (!userId) return false;
  
  try {
    // Check localStorage flag
    const flag = localStorage.getItem(`${CART_COPY_FLAG_PREFIX}${userId}`);
    const timestamp = localStorage.getItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`);
    
    if (!flag || !timestamp) return false;
    
    // Check if the flag is recent (within last 24 hours)
    const copyTime = parseInt(timestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - copyTime > twentyFourHours) {
      // Flag is old, remove it and return false
      localStorage.removeItem(`${CART_COPY_FLAG_PREFIX}${userId}`);
      localStorage.removeItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`);
      return false;
    }
    
    return flag === 'true';
  } catch (error) {
    console.error('Error checking cart copy completion:', error);
    return false;
  }
};

/**
 * Start cart copy process
 * @param {string} userId - User ID
 * @returns {boolean} Whether copy process can start (false if already in progress or completed)
 */
export const startCartCopy = (userId) => {
  if (!userId) return false;
  
  try {
    // Check if already completed
    if (hasCartCopyCompleted(userId)) {
      return false;
    }
    
    // Check if already in progress
    if (cartCopyState.isInProgress && cartCopyState.userId === userId) {
      return false;
    }
    
    // Start copy process
    cartCopyState = {
      isInProgress: true,
      hasCompleted: false,
      userId: userId,
      timestamp: Date.now()
    };
    
    return true;
  } catch (error) {
    console.error('Error starting cart copy:', error);
    return false;
  }
};

/**
 * Complete cart copy process
 * @param {string} userId - User ID
 * @param {boolean} success - Whether the copy was successful
 */
export const completeCartCopy = (userId, success = true) => {
  if (!userId) return;
  
  try {
    // Update in-memory state
    cartCopyState = {
      isInProgress: false,
      hasCompleted: success,
      userId: userId,
      timestamp: Date.now()
    };
    
    if (success) {
      // Set localStorage flag to prevent future copying
      localStorage.setItem(`${CART_COPY_FLAG_PREFIX}${userId}`, 'true');
      localStorage.setItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
    } else {
      console.log('Cart copy failed for user:', userId);
    }
  } catch (error) {
    console.error('Error completing cart copy:', error);
  }
};

/**
 * Reset cart copy state (call on logout)
 * @param {string} userId - User ID (optional, if not provided, resets current state)
 */
export const resetCartCopyState = (userId = null) => {
  try {
    // Reset in-memory state
    cartCopyState = {
      isInProgress: false,
      hasCompleted: false,
      userId: null,
      timestamp: null
    };
    
    // If userId provided, remove their localStorage flags
    if (userId) {
      localStorage.removeItem(`${CART_COPY_FLAG_PREFIX}${userId}`);
      localStorage.removeItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`);
    } else {
      console.log('Cart copy state reset');
    }
  } catch (error) {
    console.error('Error resetting cart copy state:', error);
  }
};

/**
 * Get current cart copy state
 * @returns {Object} Current cart copy state
 */
export const getCartCopyState = () => {
  return { ...cartCopyState };
};

/**
 * Check if cart copy is currently in progress
 * @param {string} userId - User ID (optional)
 * @returns {boolean} Whether cart copy is in progress
 */
export const isCartCopyInProgress = (userId = null) => {
  if (userId) {
    return cartCopyState.isInProgress && cartCopyState.userId === userId;
  }
  return cartCopyState.isInProgress;
};

/**
 * Force reset cart copy flag for a user (admin function)
 * @param {string} userId - User ID
 */
export const forceResetCartCopyFlag = (userId) => {
  if (!userId) return;
  
  try {
    localStorage.removeItem(`${CART_COPY_FLAG_PREFIX}${userId}`);
    localStorage.removeItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`);
    
    // Also reset in-memory state if it matches
    if (cartCopyState.userId === userId) {
      cartCopyState = {
        isInProgress: false,
        hasCompleted: false,
        userId: null,
        timestamp: null
      };
    }
    
  } catch (error) {
    console.error('Error force resetting cart copy flag:', error);
  }
};

/**
 * Clean up old cart copy flags (call periodically)
 */
export const cleanupOldCartCopyFlags = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    keys.forEach(key => {
      if (key.startsWith(CART_COPY_TIMESTAMP_PREFIX)) {
        const timestamp = parseInt(localStorage.getItem(key));
        if (now - timestamp > twentyFourHours) {
          // Remove old timestamp and corresponding flag
          const userId = key.replace(CART_COPY_TIMESTAMP_PREFIX, '');
          localStorage.removeItem(key);
          localStorage.removeItem(`${CART_COPY_FLAG_PREFIX}${userId}`);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old cart copy flags:', error);
  }
};

/**
 * Get all users with active cart copy flags (debug function)
 * @returns {Array} Array of user IDs with active flags
 */
export const getActiveCartCopyFlags = () => {
  try {
    const keys = Object.keys(localStorage);
    const activeFlags = [];
    
    keys.forEach(key => {
      if (key.startsWith(CART_COPY_FLAG_PREFIX)) {
        const userId = key.replace(CART_COPY_FLAG_PREFIX, '');
        const flag = localStorage.getItem(key);
        const timestamp = localStorage.getItem(`${CART_COPY_TIMESTAMP_PREFIX}${userId}`);
        
        if (flag === 'true' && timestamp) {
          activeFlags.push({
            userId,
            timestamp: parseInt(timestamp),
            age: Date.now() - parseInt(timestamp)
          });
        }
      }
    });
    
    return activeFlags;
  } catch (error) {
    console.error('Error getting active cart copy flags:', error);
    return [];
  }
};

// Initialize cleanup on module load
if (typeof window !== 'undefined') {
  // Clean up old flags when the module loads
  cleanupOldCartCopyFlags();
  
  // Set up periodic cleanup (every hour)
  setInterval(cleanupOldCartCopyFlags, 60 * 60 * 1000);
}
