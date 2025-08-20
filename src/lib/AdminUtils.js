/**
 * Admin Utilities - Helper functions for admin authentication
 */

let adminStatus = false;

/**
 * Check if current user is admin
 */
export const isAdmin = async () => {
  try {
    // Try to check admin session via API call
    const response = await fetch('/api/admin/session', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      adminStatus = data.success && data.data;
      return adminStatus;
    }
  } catch (error) {
    console.log('Admin check failed:', error);
  }
  
  adminStatus = false;
  return false;
};

/**
 * Get cached admin status (synchronous)
 */
export const getCachedAdminStatus = () => {
  return adminStatus;
};

/**
 * Set admin status (for manual updates)
 */
export const setAdminStatus = (status) => {
  adminStatus = status;
};

/**
 * Clear admin status
 */
export const clearAdminStatus = () => {
  adminStatus = false;
};