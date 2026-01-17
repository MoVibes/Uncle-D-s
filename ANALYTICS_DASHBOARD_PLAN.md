# Custom Analytics Dashboard Plan

This document outlines a detailed plan for building a custom analytics dashboard for Uncle D's Good Eats using Supabase as the backend.

---

## Why Custom Analytics?

GoatCounter provides basic traffic metrics, but a custom solution allows:
- **Restaurant-specific insights** - Which spots are most popular?
- **Search behavior** - What are people looking for?
- **User engagement** - Map vs. List preference, directions requests
- **Branded dashboard** - Uncle D's themed admin interface
- **Full data ownership** - Export, backup, and analyze as needed

---

## What Data Can We Track?

### 1. Page Views (Basic)
| Metric | Description |
|--------|-------------|
| `page_view` | Each time someone loads the site |
| `version` | Which version (Leaflet or Mapbox/PWA) |
| `referrer` | Where they came from |
| `user_agent` | Browser/device info |
| `timestamp` | When it happened |

### 2. Restaurant Interactions (Custom)
| Event | Description | Value |
|-------|-------------|-------|
| `restaurant_click` | User clicked a marker or card | Restaurant name |
| `popup_open` | Popup was opened | Restaurant name |
| `directions_click` | User clicked "Directions" | Restaurant name |
| `view_on_map_click` | User clicked "View" (Google Maps) | Restaurant name |
| `card_click` | Clicked restaurant card in list | Restaurant name |

### 3. Search Behavior
| Event | Description | Value |
|-------|-------------|-------|
| `search` | User typed in search box | Search query |
| `search_result_click` | Clicked a search result | Restaurant name |
| `search_no_results` | Search returned no matches | Search query |

### 4. Feature Usage
| Event | Description | Value |
|-------|-------------|-------|
| `view_switch` | Toggled between Map/List | `map` or `list` |
| `sort_change` | Changed sort option | `name`, `address`, or `proximity` |
| `location_request` | Requested geolocation | `granted`, `denied`, or `error` |
| `pwa_install` | Installed as PWA | - |

### 5. Session Data
| Metric | Description |
|--------|-------------|
| `session_id` | Unique ID per visit (UUID) |
| `session_start` | When session began |
| `session_duration` | How long they stayed |
| `pages_viewed` | Number of interactions |

### 6. Frustration & Friction Signals
| Event | Description | Detection Logic |
|-------|-------------|-----------------|
| `rage_click` | User rapidly clicked same area | 3+ clicks within 2 seconds |
| `dropdown_click` | Clicked sort dropdown | Track each click attempt |
| `dropdown_change` | Dropdown value changed | Compare with `dropdown_click` count |
| `dead_click` | Clicked non-interactive element | Click event on unexpected target |
| `quick_bounce` | Left within 10 seconds | Session duration < 10s, minimal events |
| `search_abandon` | Searched but didn't click result | Search event → no result click → session end |
| `js_error` | JavaScript error occurred | window.onerror handler |

**Key Insight:** If a session has multiple `dropdown_click` events without `dropdown_change`, that user hit the iOS Safari bug.

---

## Technical Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Uncle D's     │────▶│    Supabase     │◀────│  Admin Dashboard│
│   Website       │     │   (PostgreSQL)  │     │   (HTML/JS)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Track events          Store data           View & analyze
```

### Components

1. **Tracking Code** - JavaScript added to the site that sends events to Supabase
2. **Supabase Backend** - PostgreSQL database with REST API
3. **Admin Dashboard** - Password-protected page to view analytics

---

## Supabase Setup

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up (free)
2. Create new project (e.g., "uncle-ds-analytics")
3. Note your:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Database Schema

```sql
-- Events table (main analytics data)
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_value TEXT,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    app_version TEXT  -- 'leaflet' or 'mapbox'
);

-- Index for fast queries
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_session_id ON events(session_id);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON events
    FOR INSERT WITH CHECK (true);

-- Only allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON events
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Step 3: Create Views for Common Queries

```sql
-- Daily page views
CREATE VIEW daily_views AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as views,
    COUNT(DISTINCT session_id) as unique_visitors
FROM events
WHERE event_type = 'page_view'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Popular restaurants (last 30 days)
CREATE VIEW popular_restaurants AS
SELECT
    event_value as restaurant,
    COUNT(*) as clicks
FROM events
WHERE event_type IN ('restaurant_click', 'popup_open', 'directions_click')
    AND created_at > NOW() - INTERVAL '30 days'
GROUP BY event_value
ORDER BY clicks DESC
LIMIT 20;

-- Popular searches (last 30 days)
CREATE VIEW popular_searches AS
SELECT
    event_value as search_term,
    COUNT(*) as count
FROM events
WHERE event_type = 'search'
    AND created_at > NOW() - INTERVAL '30 days'
    AND event_value IS NOT NULL
    AND event_value != ''
GROUP BY event_value
ORDER BY count DESC
LIMIT 20;

-- Feature usage breakdown
CREATE VIEW feature_usage AS
SELECT
    event_type,
    event_value,
    COUNT(*) as count
FROM events
WHERE event_type IN ('view_switch', 'sort_change', 'location_request')
    AND created_at > NOW() - INTERVAL '30 days'
GROUP BY event_type, event_value
ORDER BY count DESC;
```

---

## Tracking Code Implementation

### Tracking Module (add to site)

```javascript
// analytics.js - Uncle D's Custom Analytics
const UncleAnalytics = {
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseKey: 'YOUR_ANON_KEY',
    sessionId: null,
    appVersion: 'mapbox', // or 'leaflet'

    init() {
        // Generate or retrieve session ID
        this.sessionId = sessionStorage.getItem('ua_session') || crypto.randomUUID();
        sessionStorage.setItem('ua_session', this.sessionId);

        // Track page view
        this.track('page_view');
    },

    async track(eventType, eventValue = null) {
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
            await fetch(`${this.supabaseUrl}/rest/v1/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.log('Analytics error:', err);
        }
    },

    // Convenience methods
    trackRestaurantClick(name) { this.track('restaurant_click', name); },
    trackDirectionsClick(name) { this.track('directions_click', name); },
    trackSearch(query) { this.track('search', query); },
    trackViewSwitch(view) { this.track('view_switch', view); },
    trackSortChange(sortBy) { this.track('sort_change', sortBy); }
};

// Initialize on load
UncleAnalytics.init();
```

### Integration Points (where to add tracking calls)

| Location | Event | Code |
|----------|-------|------|
| Marker click | `restaurant_click` | `UncleAnalytics.trackRestaurantClick(name)` |
| Directions button | `directions_click` | `UncleAnalytics.trackDirectionsClick(name)` |
| Search input (debounced) | `search` | `UncleAnalytics.trackSearch(query)` |
| View toggle buttons | `view_switch` | `UncleAnalytics.trackViewSwitch('map')` |
| Sort dropdown change | `sort_change` | `UncleAnalytics.trackSortChange(value)` |

---

## Admin Dashboard

### Option A: Password-Protected Page (Recommended)

Create `/app/admin.html` with Supabase Auth:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Uncle D's Analytics</title>
    <!-- Uncle D's branding styles -->
</head>
<body>
    <div id="login" style="display: none;">
        <h1>Admin Login</h1>
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <button onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display: none;">
        <header>
            <h1>Uncle D's Analytics</h1>
            <button onclick="logout()">Logout</button>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Today's Views</h3>
                <p id="todayViews">--</p>
            </div>
            <div class="stat-card">
                <h3>This Week</h3>
                <p id="weekViews">--</p>
            </div>
            <div class="stat-card">
                <h3>Total Views</h3>
                <p id="totalViews">--</p>
            </div>
        </div>

        <div class="section">
            <h2>Popular Restaurants</h2>
            <table id="popularRestaurants"></table>
        </div>

        <div class="section">
            <h2>Top Searches</h2>
            <table id="topSearches"></table>
        </div>

        <div class="section">
            <h2>Views Over Time</h2>
            <canvas id="viewsChart"></canvas>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Dashboard logic here
    </script>
</body>
</html>
```

### Option B: Secret URL (Simpler)

Create `/app/admin-[random-string].html` that doesn't require login.
- Bookmark the URL
- Less secure, but no auth setup needed
- Fine for personal use

### Dashboard Features

1. **Overview Cards**
   - Today's views / unique visitors
   - This week's views
   - Total all-time views

2. **Popular Restaurants Table**
   - Rank, name, click count
   - Filter by date range

3. **Search Terms Table**
   - What people are searching for
   - "No results" searches (opportunities to add restaurants)

4. **Views Over Time Chart**
   - Line chart showing daily views
   - 7-day / 30-day / all-time toggle

5. **Feature Usage**
   - Map vs. List preference
   - Sort option popularity
   - Location permission grant rate

6. **Real-time Feed**
   - Live stream of recent events
   - Uses Supabase realtime subscriptions
   - Color-coded by event type
   - Shows: timestamp, event type, value, device

7. **Friction Detection Panel**
   - Sessions with rage clicks (highlighted in red)
   - Dropdown frustration detector (clicks without changes)
   - Quick bounces (sessions < 10 seconds)
   - JavaScript errors log
   - Filterable by date range

---

## Implementation Phases

### Phase 1: Backend Setup
- [ ] Create Supabase project
- [ ] Set up database schema
- [ ] Configure Row Level Security
- [ ] Test insert/select via REST API

### Phase 2: Tracking Integration
- [ ] Add analytics.js module to site
- [ ] Integrate tracking calls at key points
- [ ] Test events are being recorded
- [ ] Deploy to GitHub Pages

### Phase 3: Admin Dashboard
- [ ] Create admin.html with Uncle D's branding
- [ ] Implement login with Supabase Auth
- [ ] Build stats cards and tables
- [ ] Add views chart with Chart.js
- [ ] Deploy and test

### Phase 4: Polish
- [ ] Add date range filters
- [ ] Export to CSV functionality
- [ ] Mobile-responsive dashboard
- [ ] Real-time updates (optional)

---

## Cost & Limits

**Supabase Free Tier:**
- 500 MB database storage
- 50,000 monthly active users
- Unlimited API requests
- 2 GB bandwidth

For Uncle D's expected traffic, the free tier should be more than sufficient.

---

## Privacy Considerations

- No personally identifiable information (PII) collected
- Session IDs are random UUIDs, not tied to users
- No cookies required (uses sessionStorage)
- User agent and screen size are generic device info
- Consider adding a privacy note to the site footer

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/analytics.js` | Tracking module |
| `app/admin.html` | Admin dashboard |
| `app/admin.css` | Dashboard styles (Uncle D's themed) |
| `app/admin.js` | Dashboard logic |

---

## Decisions Made

1. **Access method:** Password login (Supabase Auth) ✓
2. **Who needs access:** Just the owner for now (can add more later) ✓
3. **Real-time:** Yes, live event feed ✓
4. **Frustration tracking:** Yes, detect UX friction (rage clicks, dropdown issues) ✓
5. **Historical data:** TBD - default to keeping all data
6. **Alerts:** TBD - can add later if desired

---

## Next Steps

When ready to implement:
1. Create Supabase account and project
2. Run the SQL schema
3. Get project URL and anon key
4. We'll add the tracking code and build the dashboard
