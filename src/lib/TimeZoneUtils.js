/**
 * TimeZoneUtils - Utility for handling UTC+0800 timezone operations
 * Provides consistent timezone handling for promo dates and times
 */

class TimeZoneUtils {
    /**
     * Target timezone: UTC+0800 (Indonesia - Jakarta/Makassar)
     */
    static TIMEZONE = 'Asia/Jakarta';
    static TIMEZONE_OFFSET = '+08:00';

    /**
     * Get current date/time in UTC+0800 timezone
     * @returns {Date} Current date in UTC+0800
     */
    static now() {
        return new Date(new Date().toLocaleString("en-US", { timeZone: this.TIMEZONE }));
    }

    /**
     * Convert any date to UTC+0800 timezone
     * @param {Date|string} date - Date to convert
     * @returns {Date} Date in UTC+0800 timezone
     */
    static toTimezone(date) {
        if (!date) return null;
        const inputDate = new Date(date);
        return new Date(inputDate.toLocaleString("en-US", { timeZone: this.TIMEZONE }));
    }

    /**
     * Check if a promo is currently active based on start and end dates
     * @param {Date|string} startDate - Promo start date
     * @param {Date|string} endDate - Promo end date
     * @returns {boolean} Whether promo is currently active
     */
    static isPromoActive(startDate, endDate) {
        const now = this.now();
        
        // If no start date, consider it started
        const start = startDate ? this.toTimezone(startDate) : null;
        // If no end date, consider it never ending
        const end = endDate ? this.toTimezone(endDate) : null;

        // Check if current time is within promo period
        const afterStart = !start || now >= start;
        const beforeEnd = !end || now <= end;

        return afterStart && beforeEnd;
    }

    /**
     * Format date for display in Indonesia timezone
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    static formatForDisplay(date, options = {}) {
        if (!date) return '';
        
        const defaultOptions = {
            timeZone: this.TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        return new Date(date).toLocaleString('id-ID', { ...defaultOptions, ...options });
    }

    /**
     * Parse date string and ensure it's in UTC+0800
     * @param {string} dateString - Date string to parse
     * @returns {Date|null} Parsed date in UTC+0800 or null if invalid
     */
    static parseDate(dateString) {
        if (!dateString) return null;
        
        try {
            // If the date string doesn't have timezone info, assume it's in UTC+0800
            let date = new Date(dateString);
            
            // If parsing failed, return null
            if (isNaN(date.getTime())) return null;
            
            // Convert to our target timezone
            return this.toTimezone(date);
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return null;
        }
    }
}

export { TimeZoneUtils };