# European Summer 2027

A travel brochure website for our trip: Vienna → Montenegro → Albania → Corfu, 24 July – 27 August 2027.

React 19 · Tailwind CSS 4 · d3-geo/d3-zoom map · esbuild · installable PWA.

## Run it

```bash
npm install
npm run dev        # build + serve on http://localhost:5173
npm run build      # checks the itinerary, then builds to dist/
npm run check      # date, weekday and night-count checks only
npm run verify:photos   # checks every photo exists on Wikimedia Commons, writes photo-credits.json
```

## Deploy to Vercel

1. Push this folder to a GitHub repository (or run `npx vercel` in it).
2. In Vercel, **Add New → Project**, import the repo. `vercel.json` already sets the build command (`npm run build`) and output folder (`dist`).
3. Share the URL. On iPhone/iPad: open it in Safari → Share → **Add to Home Screen**.

## Editing content

Everything lives in two files:

- `src/data/trip.js` — dates, hotels, booking links, statuses, attractions, Google Maps links, journeys (mode, duration, notes, sources), and the Greece section.
- `src/data/photos.js` — every photo, its caption and alt text.

Statuses (`STATUS` at the top of `trip.js`) describe what is actually known: `Confirmed accommodation`, `Selected accommodation`, `Booking needs verification`, `Accommodation TBA`, `Transport TBC`, `Estimated duration`, and so on.

When the Greek itinerary is decided, add new entries to `destinations` after Corfu (copy an existing one), give Corfu its `checkOut`/`nights`, and update `greece`.

Run `npm run check` after changing dates; it confirms the stays connect and total 34 nights.

## Adding hotel photos

Hotel photos are placeholders because Booking.com images are not licensed for reuse.

- **Preview on your device:** open the site with `#owner` at the end of the URL. Each hotel gets an “Add photos to preview” button. These stay in your browser only.
- **Publish:** put the files in `public/photos/hotels/<destination-id>/` (for example `public/photos/hotels/kotor/balcony.jpg`) and list them in that hotel’s `photos` array:

```js
photos: [
  { src: '/photos/hotels/kotor/balcony.jpg', caption: 'Balcony over the bay' },
  '/photos/hotels/kotor/bedroom.jpg',
],
```

Only use photos you took or have the owner’s permission to use. Resize to about 1600px wide first.

## Photos & credits

Destination photos are hot-linked from Wikimedia Commons (free licences). Author and licence are read live from the Commons API and shown in the lightbox and the “Show full credits” list. `#owner` shows a review grid of every photo so you can confirm each one matches its caption.

## Offline

After the first visit the page, itinerary, map and the photos you have already viewed are cached and work without a connection. Google Maps, booking links and photos you haven’t opened yet need internet.

## Privacy

No booking references, contact details or documents are stored in the site. Keep it that way: everything in `src/` is public once deployed. See `VERIFICATION.md` for the private checklist (it is not part of the built site).
