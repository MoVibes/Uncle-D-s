# Uncle D's Good Eats - Project Context

## Project Overview

This project is an interactive map of 81 curated restaurants in the Louisville, KY metro area (including surrounding areas within ~90 minutes of downtown Louisville). The map is designed with branding inspired by Uncle D's BBQ menu aesthetic.

**Live Site:** https://movibes.github.io/Uncle-D-s/

**GitHub Repo:** https://github.com/MoVibes/Uncle-D-s

---

## Files & Locations

### Local Project Folder
`/Users/moses/Documents/1. Master Drive/0 - AI + Vibes/Uncle D's Good Eats/`

Contains:
- `index.html` - The complete Leaflet map (this is deployed to GitHub Pages)
- `louisville_restaurants_ClaudeCorrected.xlsx` - Master spreadsheet with 81 verified restaurant addresses
- `restaurants_geocoded.json` - All restaurants with lat/lng coordinates
- `Uncle D's.jpeg` - Brand reference image (olive-gold, forest green, cream color scheme)
- `PROJECT_CONTEXT.md` - This file
- `IMPLEMENTATION_PLANS.md` - Detailed plans for Mapbox and PWA implementations

### GitHub Repository
The repo contains:
- `index.html` - Original Leaflet version (root)
- `app/` - New Mapbox + PWA version (subdirectory)
  - `app/index.html` - Mapbox GL JS implementation
  - `app/manifest.json` - PWA manifest
  - `app/sw.js` - Service worker for offline caching
  - `app/icons/` - PWA app icons (SVG)

The Excel and JSON files are local only.

### Live URLs
- **Leaflet version:** https://movibes.github.io/Uncle-D-s/
- **Mapbox version:** https://movibes.github.io/Uncle-D-s/app/

---

## Restaurant Data

### Summary
- **81 total restaurants**
- Mix of cuisines: BBQ, Soul Food, Mexican/Latin, African, Ethiopian, Somali, Caribbean, Vietnamese, Japanese, Mediterranean, Korean, Indian, and more
- Geographic coverage: Louisville metro + Radcliff, Bardstown, Shelbyville, Vine Grove, Southern Indiana (New Albany, Jeffersonville, Charlestown, Oldenburg)

### Multi-Location Restaurants (listed as separate entries)
- Dixie Chicken (2 locations)
- Hokkaido Ramen & Sushi (2 locations)
- Imanka Somali Restaurant (2 locations)
- La Catrina (2 locations in Southern Indiana)
- La Guanaquita (2 locations)
- Mirage Mediterranean (2 locations)
- Restaurant Guatelinda (2 locations)
- Veronica's Mexican (2 locations)

### Closed/Removed Restaurants
These were verified as closed and removed from the list:
- Sue's Touch of Country
- Catfish Haven Lake Bar & Grill
- The Cottage Inn

### Address Corrections Made
During verification, several addresses were corrected:
- Tacos Juanito: W Ormsby Ave → 5601 Preston Hwy
- Tacos Guerra: Preston Hwy → 8601 National Turnpike
- Jin Doshirak: S 2nd St → 211 S 5th St
- FABD Smokehouse → 3204 Frankfort Ave
- Gorilla Bob's Grub: 8533 → 8503 Terry Rd
- Taqueria El Mexicano: 6310 → 7611 Preston Hwy
- La Catrina: Was incorrectly listed in Louisville, actually in New Albany & Jeffersonville, IN
- Eat at The Spot: Corrected to 865 S Dixie Blvd, Radcliff, KY

---

## Technical Implementation

### Current: Leaflet.js (Static HTML)

**Stack:**
- Leaflet.js 1.9.4 for mapping
- CartoDB Light basemap tiles (free, no API key)
- Pure HTML/CSS/JS (no build step)
- Google Fonts: Archivo Black, Inter

**Features:**
- Custom forest-green map markers
- Search/filter functionality with dropdown results
- Popups with "View" (Google Maps) and "Directions" buttons
- **Restaurant descriptions** - Each restaurant has a brief description with cuisine type, signature dishes, and notable features
- **Map/List toggle view** - switch between map and scrollable list
- **List view features:**
  - Scrollable restaurant cards with descriptions
  - Sort by Name or Address
  - Click card to jump to map location
  - Map button and Directions button on each card
- Mobile-responsive design
- Loading animation with branded logo
- Uncle D's color theme (olive-gold #A89968, forest green #3D5A3D, cream #FAF9F6)

**Logo/Branding:**
- Stacked logo lockup on desktop:
  ```
     UNCLE D'S
    ────★────
    GOOD EATS
  ```
- Inline logo on mobile: `UNCLE D'S ★ GOOD EATS`
- "Uncle D's" in Archivo Black (forest green)
- "Good Eats" in Inter with letter-spacing (cream color)
- Star divider with decorative lines (desktop) or standalone (mobile)
- Consistent star icon across all screen sizes

**Geocoding:**
- Used geopy with Nominatim (OpenStreetMap) for address → lat/lng conversion
- Some addresses with suite numbers required simplified queries
- 3 addresses needed manual coordinate estimation based on zip codes

### How to Modify the Restaurant List

Edit the `restaurants` array in `index.html` (starts around line 920):

```javascript
{
  "name": "Restaurant Name",
  "address": "123 Main St, Louisville, KY 40202",
  "lat": 38.2527,
  "lng": -85.7585,
  "description": "Brief description of cuisine, signature dishes, and notable features."
}
```

**To get lat/lng for a new restaurant:**
1. Go to Google Maps
2. Search for the restaurant
3. Right-click on the location → "What's here?"
4. Copy the coordinates that appear

**After editing, deploy changes:**
```bash
cd "/Users/moses/Documents/1. Master Drive/0 - AI + Vibes/Uncle D's Good Eats"
git add index.html
git commit -m "Description of changes"
git push
```
Site updates in ~1 minute.

---

## Alternative Implementations Discussed

### Option 2: Mapbox GL JS
- More modern, vector-based maps with beautiful styling
- Smooth animations and 3D capabilities
- Requires free Mapbox account and API key
- Free tier: 50,000 map loads/month
- Same data format as Leaflet (easy to migrate)

### Option 3: Progressive Web App (PWA)
- Can be "installed" on phone home screen like native app
- Works offline (if data is cached)
- Could add admin interface for editing restaurants via form
- More complex setup

### Option 4: Google My Maps
- Easiest for non-technical editing
- Can import from spreadsheet
- Built-in Google Maps integration
- Limited customization

---

## Hosting

**Current:** GitHub Pages (free)
- Repo: https://github.com/MoVibes/Uncle-D-s
- Live URL: https://movibes.github.io/Uncle-D-s/
- Deploys automatically when you push to `main` branch

**Alternatives:**
- Netlify (free) - drag and drop deployment
- Vercel (free) - similar to Netlify

---

## Design Reference

The color scheme and aesthetic is based on `Uncle D's.jpeg` (a BBQ menu):
- **Header/accents:** Olive gold (#A89968)
- **Primary text/markers:** Forest green (#3D5A3D)
- **Background:** Cream (#FAF9F6)
- **Typography:** Bold, rustic, Southern feel

---

## Future Enhancements to Consider

1. **Cuisine category filters** - Filter by type (BBQ, Mexican, Soul Food, etc.)
2. **Favorites/bookmarks** - Save restaurants locally
3. ~~**User location** - "Near me" functionality~~ ✅ Done (Session 4)
4. **Photos** - Add restaurant images to popups
5. **Ratings/notes** - Personal ratings or notes field
6. ~~**Mapbox upgrade** - For better visual styling~~ ✅ Done (Session 4)
7. ~~**PWA conversion** - For offline access and app-like experience~~ ✅ Done (Session 4)
8. **Fix iOS Safari dropdown delay** - Investigate further why dropdown requires delay after page load
9. ~~**Basic analytics** - Track page views and visitors~~ ✅ Done (Session 5 - GoatCounter)
10. **Custom analytics dashboard** - Track restaurant clicks, searches, and build branded admin page (see `ANALYTICS_DASHBOARD_PLAN.md`)

---

## Commands Reference

**Clone repo (if local files deleted):**
```bash
git clone https://github.com/MoVibes/Uncle-D-s.git
```

**Push changes:**
```bash
git add index.html
git commit -m "Your message"
git push
```

**Geocode a single address (Python):**
```python
from geopy.geocoders import Nominatim
geolocator = Nominatim(user_agent="uncle_ds")
location = geolocator.geocode("123 Main St, Louisville, KY")
print(location.latitude, location.longitude)
```

---

## Session Notes

- Original spreadsheet had some incorrect addresses that were verified via web search
- Search radius expanded to ~90 minutes from downtown Louisville to include surrounding areas
- Some restaurants are in strip malls/plazas with suite numbers that geocoders struggle with
- The spreadsheet is the master record; the JSON and HTML contain derived/geocoded data

### Recent Updates (Session 2)

1. **Added List View**
   - Toggle between Map and List views via buttons in header
   - List shows all restaurants as cards with icon, name, address
   - Cards are clickable - jumps to map view and opens popup
   - Sort dropdown (by Name or Address)
   - Search filters both map and list views

2. **Logo Redesign**
   - Changed from inline to stacked lockup design
   - Added star (★) divider with decorative lines
   - "Good Eats" now centered under "Uncle D's"
   - "Good Eats" uses cream color for contrast against olive-gold header
   - Mobile version switches to inline layout with star separator
   - Tried Kentucky state outline but reverted to star (cleaner look)

3. **Loading Screen Update**
   - Updated to match new logo design
   - Shows stacked logo with star divider

4. **Git Commits Made:**
   - "Add list view with toggle, sorting, and map integration"
   - "Redesign logo lockup with professional branding - stacked layout with divider"
   - "Center Good Eats text and restore cream color"
   - "Revert to star icon, ensure it stays consistent on all screen sizes"

### Recent Updates (Session 3)

1. **Added Restaurant Descriptions**
   - Researched all 81 restaurants via web searches
   - Added brief 1-2 sentence descriptions for each restaurant
   - Descriptions include: cuisine type, signature dishes, history, ratings, notable features
   - Each restaurant object now has a `description` field

2. **Updated Popup Template**
   - Descriptions now appear in map popups above the address
   - Styled with subtle border separator
   - CSS class: `.popup-description`

3. **Updated List Card Template**
   - Descriptions appear in list view cards
   - 2-line truncation to keep cards compact
   - CSS classes: `.card-description`, `.card-address`

4. **Restaurant Data Structure (Updated)**
   ```javascript
   {
     "name": "Restaurant Name",
     "address": "123 Main St, Louisville, KY 40202",
     "lat": 38.2527,
     "lng": -85.7585,
     "description": "Brief description of the restaurant including cuisine type and notable features."
   }
   ```

5. **Git Commits Made:**
   - "Add descriptions for all 81 restaurants"

6. **Implementation Plans Created**
   - Created `IMPLEMENTATION_PLANS.md` with detailed plans for:
     - **Mapbox GL JS Migration** - Vector-based maps, smooth animations, 3D capabilities
     - **PWA Implementation** - Offline support, installable app, service workers
   - Both plans include step-by-step phases, code snippets, and effort estimates

### Recent Updates (Session 4)

1. **Mapbox GL JS Version Created**
   - New version in `/app/` subdirectory (preserves original Leaflet version)
   - Mapbox GL JS v3.0.1 with WebGL rendering
   - Custom branded map style with Uncle D's colors:
     - Cream background (#F5F3EE)
     - Subtle road styling (de-emphasized to not distract from markers)
     - Muted water and park colors
   - GeoJSON + circle layers for markers (WebGL-rendered, syncs perfectly with map zoom/pan)
   - flyTo animations when selecting restaurants
   - Animated popups with scale entrance effect
   - Smooth view transitions between Map and List
   - Mapbox Access Token: `pk.eyJ1IjoibW92aWJlcyIsImEiOiJjbWtoeDJqZ3cwbXl4M2RvbzN3MmsxcGx0In0.RbYtlNcYdyzNPmAJijXN8g`

2. **Progressive Web App (PWA) Implementation**
   - `manifest.json` - App name, colors, icons
   - `sw.js` - Service worker with caching strategies:
     - Static assets cached on install
     - Map tiles cached as user views them
     - Stale-while-revalidate for updates
   - Custom SVG app icons (192px, 512px, maskable)
   - iOS meta tags for Add to Home Screen
   - Installable on Android, iOS, and Desktop
   - Cache version tracking for updates (currently v8)

3. **Proximity & Drive Time Features**
   - Geolocation API to get user's location
   - Haversine formula for straight-line distance calculation
   - Estimated drive time based on distance (~25 mph avg with 1.3x road factor)
   - "Sort by Proximity" option (replaces "Sort by Address")
   - Time badges on list cards (e.g., "~12 min")
   - Time display in popups with loading state
   - Mapbox Directions API for exact drive time on click
   - Location requested only when user selects "Sort by Proximity" (better UX)
   - Platform-specific instructions if location is denied (iOS, Android, Desktop)

4. **UX/UI Improvements**
   - Count badge redesigned (now shows "81 spots" with subtle styling)
   - Focus states for keyboard accessibility
   - ARIA labels on icon buttons
   - Search text highlighting for matches
   - Keyboard navigation in search results (Arrow keys + Enter)
   - Staggered card animations in list view
   - Loading star pulse animation

5. **Bug Fixes**
   - Fixed popup animation (was appearing in wrong position initially)
   - Fixed list-to-map transition (now fades out smoothly)
   - Fixed mobile list view header overlap (increased padding)
   - Fixed loading screen blocking touches (added pointer-events: none)
   - Fixed hidden map blocking touches (added pointer-events: none)
   - Fixed search results blocking touches when hidden
   - Improved iOS Safari dropdown styling (16px font, 44px touch target)

6. **Known Issues**
   - **iOS Safari dropdown delay**: On iOS Safari, the sort dropdown in list view sometimes requires waiting a moment after page load before it responds. Multiple fixes attempted (pointer-events on loading screen, hidden map) but issue persists. Likely related to Mapbox initialization or iOS Safari touch handling.

7. **Git Commits Made:**
   - "Add Mapbox GL JS version with enhanced UX"
   - "Fix mobile list view header overlap"
   - "Add Progressive Web App (PWA) support"
   - "Add proximity sorting and drive time estimates"
   - "Trigger location request on Sort by Proximity click"
   - "Improve location permission handling with device-specific instructions"
   - "Fix iOS Safari dropdown and location issues"
   - "Fix loading screen blocking touches after fade out"
   - "Disable loading screen pointer events immediately on map load"
   - "Disable pointer events on hidden map"

---

## Technical Details (Mapbox Version)

### Map Style
Custom style defined in JavaScript with Uncle D's branding:
```javascript
const mapStyle = {
    version: 8,
    sources: { 'mapbox': { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' } },
    layers: [
        { id: 'background', paint: { 'background-color': '#F5F3EE' } },
        { id: 'water', paint: { 'fill-color': '#C4D4D8' } },
        { id: 'roads-minor', paint: { 'line-color': '#E8E5DD', 'line-opacity': 0.8 } },
        { id: 'roads-major', paint: { 'line-color': '#DDD9CE', 'line-opacity': 0.9 } },
        { id: 'motorway', paint: { 'line-color': '#D5D0C3', 'line-opacity': 0.85 } },
        // ... buildings, labels
    ]
};
```

### Service Worker Cache Versioning
When making changes to the app, bump the cache version in `sw.js`:
```javascript
const CACHE_VERSION = 'v8'; // Increment this
```
This forces browsers to fetch fresh content.

### Geolocation Flow
1. User taps "Sort by Proximity"
2. `getUserLocation()` called
3. Browser prompts for location permission
4. If allowed: calculate distances, sort list, show time badges
5. If denied: show platform-specific instructions, reset to "Sort by Name"

### Mapbox Directions API
Used for exact drive times when clicking on restaurants:
```javascript
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${restaurantLng},${restaurantLat}?access_token=${token}`;
```
Returns driving duration in seconds, displayed as minutes in popup.

---

## Analytics

### GoatCounter (Basic Analytics)
Added in Session 5 for simple traffic tracking.

**Dashboard:** https://uncleds.goatcounter.com

**What it tracks:**
- Page views over time
- Unique visitors
- Referrers (where traffic comes from)
- Browsers & devices
- Screen sizes
- Geographic locations (country/region)

**Implementation:**
- Single script tag added to both `index.html` and `app/index.html`
- No cookies, privacy-friendly, GDPR compliant
- Free for non-commercial use

```html
<script data-goatcounter="https://uncleds.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

### Custom Analytics Dashboard (Planned)
See `ANALYTICS_DASHBOARD_PLAN.md` for detailed implementation plan using Supabase.

---

### Recent Updates (Session 5)

1. **GoatCounter Analytics Added**
   - Created GoatCounter account (code: `uncleds`)
   - Dashboard at https://uncleds.goatcounter.com
   - Added tracking script to both site versions:
     - `/index.html` (Leaflet version)
     - `/app/index.html` (Mapbox version)
   - Tracks: page views, visitors, referrers, devices, locations

2. **Custom Analytics Dashboard Built**
   - **Supabase Project:** `uncle-ds-analytics`
   - **Project URL:** `https://hdbhohbmroxfbolgaqaf.supabase.co`
   - **Admin Email:** `wailers.rolls_0w@icloud.com`

   **Database Schema:**
   - `events` table with: session_id, event_type, event_value, page_url, referrer, user_agent, screen dimensions, app_version
   - Row Level Security enabled (anonymous inserts, authenticated reads)
   - Real-time enabled for live event feed

   **Tracking Module (`app/analytics.js`):**
   - Page views and session tracking
   - Restaurant interactions (clicks, directions, view on map)
   - Search behavior (queries, no results, result clicks)
   - Feature usage (view toggle, sort changes, location requests)
   - Frustration detection:
     - Rage clicks (3+ clicks in same area within 2 seconds)
     - Dropdown frustration (multiple clicks without value change)
     - Quick bounces (sessions < 10 seconds)
     - JavaScript errors

   **Events Tracked:**
   | Event | Description |
   |-------|-------------|
   | `page_view` | Initial page load |
   | `restaurant_click` | Clicked marker or card |
   | `directions_click` | Clicked directions button |
   | `view_on_map_click` | Clicked "View" in popup |
   | `search` | Search query (debounced) |
   | `search_no_results` | Search with no matches |
   | `search_result_click` | Clicked search result |
   | `view_switch` | Toggled map/list view |
   | `sort_change` | Changed sort option |
   | `dropdown_click` | Clicked sort dropdown |
   | `dropdown_frustration` | Multiple clicks without change |
   | `location_request` | Location permission result |
   | `rage_click` | Rapid repeated clicks |
   | `js_error` | JavaScript error occurred |
   | `session_end` | Session ended |
   | `quick_bounce` | Left within 10 seconds |

   **Admin Dashboard (`app/admin.html`):**
   - Password-protected with Supabase Auth
   - Real-time event feed
   - Popular restaurants table
   - Top searches table
   - Friction detection panel
   - Uncle D's branded styling

3. **Files Created/Modified:**
   - `app/analytics.js` - Custom tracking module
   - `app/admin.html` - Admin dashboard with login
   - `app/index.html` - Added tracking calls
   - `app/sw.js` - Bumped to v11, added analytics.js to cache

4. **Git Commits Made:**
   - "Add GoatCounter analytics"
   - "Add custom analytics with Supabase and admin dashboard"
