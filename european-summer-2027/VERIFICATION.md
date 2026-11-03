# Private verification checklist

Not shown on the website. Last researched: 3 November 2026.

## Bookings to verify

- [ ] **Ksamil – Veranda Hotel by Mirage.** Earlier record shows a booking for **11–13 Aug (2 nights)**. The itinerary now has **11–14 Aug (3 nights)**. Confirm or add the night of 13–14 Aug.
- [ ] Confirm bookings exist for every “Selected accommodation” (Kotor, Budva, Shkodër, Theth, Tirana, Berat, Himarë). The site calls them selected, not confirmed. When a booking is confirmed, change `status` to `STATUS.ACC_CONFIRMED` in `src/data/trip.js`.
- [ ] **Charm Corner Kotor** and the **Tirana Blloku apartment** could not be found by name outside Booking.com, so their name, address and city were not independently confirmed. Open both links and check they are the right listings.
- [ ] Vienna accommodation (TBA).
- [ ] Corfu accommodation and the 13 Greek nights (TBA).

Confirmed by third-party listings (name + town): InTown Guesthouse (Shkodër centre, garden), Guesthouse Marashi (Theth, ~1.1 km from centre), Casa Di Mino (inside Budva Old Town), Villa Arben Elezi (Rruga Dr. Lluka, Mangalem, Berat), Magic Ionian Apartments & Rooms (on Potam Beach, Himarë), Veranda Hotel by Mirage (Lagjia Nr 2, Ksamil, seasonal pool).

## Transport (nothing is booked)

| Date | Leg | Status | Note |
|---|---|---|---|
| 23–24 Jul | Sydney → Singapore → Vienna | TBA | International flights not booked |
| 26 Jul | Vienna → Podgorica, **OS735** | Proposed | Current published schedule shows **12:55 → 14:15** (the brief said ~12:40–14:00). Re-check once the summer 2027 timetable is published, usually around late Jan–Mar 2027. |
| 26 Jul | Podgorica Airport → Kotor | TBC | Transfer or hire car not arranged |
| 29 Jul | Kotor → Budva | TBC | |
| 31 Jul | Budva → Shkodër bus/transfer | TBC | Bus operators seen: Drita Travel, Old Town Travel, Jadran Ekspres, MS Tours (Shkodër→Budva direction). Check Budva→Shkodër times for 2027. |
| 31 Jul | Rental car pick-up in Albania | TBC | Company and pick-up place not chosen. Check the car is allowed on the Theth road. |
| 14 Aug | Rental car return in Sarandë | TBC | One-way return arrangements to confirm |
| 14 Aug | Sarandë → Corfu ferry | TBC | Operators: Finikas Lines, Ionian Seaways. Fast boat ~30 min. **Greece is 1 hour ahead.** 2027 timetable not yet published. |
| 27 Aug | Depart Athens | Planned | |

Road durations are estimates from the sources stored in `src/data/trip.js` (each journey has `sources` with URL and date checked).

## Photos

- [ ] **Hotel photos:** none are on the site. Booking.com photos are copyrighted and not licensed for reuse, so every hotel shows a placeholder with a link to its listing. Options: ask each host for permission to use 3–5 photos, or use your own photos from the trip. To publish them, see README → “Adding hotel photos”.
- [ ] **Destination photos:** 64 photos from Wikimedia Commons were chosen by file title and Commons category, because the research environment couldn’t load the images themselves. Before sharing the link:
  1. Run `npm run verify:photos` to confirm every file exists and get author/licence for each.
  2. Open the deployed site with `#owner` at the end of the URL and check every photo matches its caption. Mark each one `verified: 'visual'` in `src/data/photos.js`.
  3. Pay special attention to: **Blue Eye of Theth** (`theth-blueeye`, must be the Kaprre/Theth pool, not the Sarandë spring), **Ksamil Islands** (`ksamil-islands`), **Buni i Thorës** (`theth-pass`), **Budva after dark** (`budva-night`), **Tirana street life** (`tirana-streets`).
  4. If a photo is wrong, replace its `file` with a better Commons file, or set `src` to your own image in `/public/photos/...`.

## Map

- Road lines follow each road’s real corridor through named towns (Koplik, Bogë, Thorë pass, Lezhë, Lushnjë, Fier, Vlorë, Llogara, Borsh, Sarandë…). They are approximate, not turn-by-turn. Every road leg links to Google Maps directions for the exact route.
- Coastline and borders: Natural Earth 1:10m (public domain).
