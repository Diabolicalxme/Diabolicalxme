// React polyfill to ensure React hooks are available globally
// This prevents "Cannot read properties of undefined (reading 'useLayoutEffect')" errors

(function() {
  'use strict';
  
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Create a placeholder React object if it doesn't exist
  if (!window.React) {
    window.React = {};
  }
  
  // Add placeholder hooks that will be replaced when React loads
  const hooks = [
    'useLayoutEffect',
    'useEffect', 
    'useState',
    'useRef',
    'useCallback',
    'useMemo',
    'useContext',
    'useReducer',
    'useImperativeHandle',
    'useDebugValue',
    'useDeferredValue',
    'useId',
    'useInsertionEffect',
    'useSyncExternalStore',
    'useTransition'
  ];
  
  hooks.forEach(function(hook) {
    if (!window.React[hook]) {
      window.React[hook] = function() {
        console.warn('React hook ' + hook + ' called before React was loaded');
        return undefined;
      };
    }
  });
  
  // Add other React methods that might be needed
  if (!window.React.createElement) {
    window.React.createElement = function() {
      console.warn('React.createElement called before React was loaded');
      return null;
    };
  }
  
  if (!window.React.forwardRef) {
    window.React.forwardRef = function(fn) {
      console.warn('React.forwardRef called before React was loaded');
      return fn;
    };
  }
  
  if (!window.React.memo) {
    window.React.memo = function(component) {
      console.warn('React.memo called before React was loaded');
      return component;
    };
  }
})();
