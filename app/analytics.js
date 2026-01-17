/**
 * Uncle D's Custom Analytics
 * Tracks user interactions, frustration signals, and session data
 */
const UncleAnalytics = {
    supabaseUrl: 'https://hdbhohbmroxfbolgaqaf.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYmhvaGJtcm94ZmJvbGdhcWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjQzNjksImV4cCI6MjA4NDIwMDM2OX0.9gsO-nC02l80KNWyqxfU8mGOOLJfRYAPl_Yo0CdGYRM',
    sessionId: null,
    appVersion: 'mapbox',
    sessionStart: null,
    eventCount: 0,

    // Frustration detection
    clickHistory: [],
    lastDropdownClick: 0,
    dropdownClickCount: 0,
    dropdownChangeCount: 0,

    /**
     * Initialize analytics
     */
    init() {
        // Generate or retrieve session ID
        this.sessionId = sessionStorage.getItem('ud_session') || crypto.randomUUID();
        sessionStorage.setItem('ud_session', this.sessionId);

        this.sessionStart = Date.now();

        // Track page view
        this.track('page_view');

        // Set up error tracking
        this.setupErrorTracking();

        // Set up rage click detection
        this.setupRageClickDetection();

        // Track session end
        this.setupSessionEndTracking();

        console.log('Uncle D\'s Analytics initialized');
    },

    /**
     * Send event to Supabase
     */
    async track(eventType, eventValue = null) {
        this.eventCount++;

        const payload = {
            session_id: this.sessionId,
            event_type: eventType,
            event_value: eventValue,
            page_url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            app_version: this.appVersion
        };

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.log('Analytics tracking failed:', response.status);
            }
        } catch (err) {
            // Silent fail - don't break the app for analytics
            console.log('Analytics error:', err.message);
        }
    },

    /**
     * Set up JavaScript error tracking
     */
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.track('js_error', `${event.message} at ${event.filename}:${event.lineno}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.track('js_error', `Unhandled promise: ${event.reason}`);
        });
    },

    /**
     * Detect rage clicks (3+ clicks in same area within 2 seconds)
     */
    setupRageClickDetection() {
        document.addEventListener('click', (event) => {
            const now = Date.now();
            const clickData = {
                x: event.clientX,
                y: event.clientY,
                time: now,
                target: event.target.tagName
            };

            // Keep only clicks from last 2 seconds
            this.clickHistory = this.clickHistory.filter(c => now - c.time < 2000);
            this.clickHistory.push(clickData);

            // Check for rage clicks (3+ clicks near same spot)
            const recentClicks = this.clickHistory.filter(c => {
                const dx = Math.abs(c.x - clickData.x);
                const dy = Math.abs(c.y - clickData.y);
                return dx < 50 && dy < 50;
            });

            if (recentClicks.length >= 3) {
                const target = event.target.closest('[class]')?.className || event.target.tagName;
                this.track('rage_click', target.substring(0, 100));
                // Reset to avoid repeated triggers
                this.clickHistory = [];
            }
        });
    },

    /**
     * Track session end and duration
     */
    setupSessionEndTracking() {
        const trackSessionEnd = () => {
            const duration = Math.round((Date.now() - this.sessionStart) / 1000);

            // Quick bounce detection (less than 10 seconds, minimal interaction)
            if (duration < 10 && this.eventCount <= 1) {
                // Use sendBeacon for reliability on page unload
                this.sendBeacon('quick_bounce', `${duration}s`);
            } else {
                this.sendBeacon('session_end', `${duration}s, ${this.eventCount} events`);
            }
        };

        // Track on page hide (works better than unload on mobile)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                trackSessionEnd();
            }
        });

        // Fallback for desktop
        window.addEventListener('beforeunload', trackSessionEnd);
    },

    /**
     * Send beacon (for unload events - more reliable than fetch)
     */
    sendBeacon(eventType, eventValue) {
        const payload = {
            session_id: this.sessionId,
            event_type: eventType,
            event_value: eventValue,
            page_url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            app_version: this.appVersion
        };

        navigator.sendBeacon(
            `${this.supabaseUrl}/rest/v1/events?apikey=${this.supabaseKey}`,
            JSON.stringify(payload)
        );
    },

    // ========== Convenience Methods ==========

    trackRestaurantClick(name) {
        this.track('restaurant_click', name);
    },

    trackPopupOpen(name) {
        this.track('popup_open', name);
    },

    trackDirectionsClick(name) {
        this.track('directions_click', name);
    },

    trackViewOnMapClick(name) {
        this.track('view_on_map_click', name);
    },

    trackSearch(query) {
        if (query && query.trim().length > 0) {
            this.track('search', query.trim().substring(0, 100));
        }
    },

    trackSearchNoResults(query) {
        this.track('search_no_results', query.trim().substring(0, 100));
    },

    trackSearchResultClick(name) {
        this.track('search_result_click', name);
    },

    trackViewSwitch(view) {
        this.track('view_switch', view);
    },

    trackSortChange(sortBy) {
        this.dropdownChangeCount++;
        this.track('sort_change', sortBy);
    },

    trackLocationRequest(result) {
        this.track('location_request', result);
    },

    // ========== Dropdown Frustration Detection ==========

    trackDropdownClick() {
        const now = Date.now();
        this.dropdownClickCount++;
        this.track('dropdown_click', 'sort');

        // Check for frustration: multiple clicks without change
        // If more than 3 clicks without a change in 5 seconds, that's frustration
        if (this.dropdownClickCount > 3 &&
            this.dropdownClickCount > this.dropdownChangeCount + 2) {
            this.track('dropdown_frustration', `${this.dropdownClickCount} clicks, ${this.dropdownChangeCount} changes`);
            // Reset counters
            this.dropdownClickCount = 0;
            this.dropdownChangeCount = 0;
        }

        this.lastDropdownClick = now;
    },

    // Reset dropdown tracking periodically (after 5 seconds of no clicks)
    resetDropdownTracking() {
        if (Date.now() - this.lastDropdownClick > 5000) {
            this.dropdownClickCount = 0;
            this.dropdownChangeCount = 0;
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UncleAnalytics.init());
} else {
    UncleAnalytics.init();
}

// Export for use in main app
window.UncleAnalytics = UncleAnalytics;
