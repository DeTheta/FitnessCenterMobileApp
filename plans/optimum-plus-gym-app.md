# Optimum Plus — Gym Member Mobile App (Clickable Prototype)

## Goal
A premium, energetic, light-first mobile app UI for **Optimum Plus** gym members, built in the existing React 19 + Vite + Tailwind v4 scaffold. Four core screens connected by a bottom tab bar, with mock data and local state so bookings actually update spots, quotas, and the Home "upcoming" list. No backend, no persistence beyond the session.

## Decisions (confirmed)
- **Theme:** light-first. Crisp white surfaces, deep black type and hero cards, vibrant orange as the single accent. Strictly these three hues plus neutral tints of black/white (greys derived from black at opacity) — no other colors, including status colors (use black/orange/grey for "full", "few left", etc.).
- **Presentation:** on viewports ≥ 640px, render a centered phone frame (~390×844, rounded 48px, black bezel, soft shadow) on a subtle off-white/grey backdrop with a small Optimum Plus wordmark beside it. Below 640px, the app goes full-bleed with no frame.
- **Interactivity:** clickable prototype, React state only, mock data.
- **Brand:** "Optimum Plus" — wordmark "OPTIMUM+" with the "+" in orange.

## Design system
- **Colors** (Tailwind v4 `@theme` tokens in `src/index.css`):
  - `--color-brand: #FF5A1F` (vibrant orange), `--color-brand-ink: #E04A12` (pressed), `--color-ink: #0A0A0A` (deep black), `--color-paper: #FFFFFF`, `--color-mist: #F4F4F2` (off-white section bg). Greys via `ink/60`, `ink/10`, etc.
- **Typography** (public Google Fonts via a CSS2 `@import url(...)` as the first line of `index.css`, followed by `@import 'tailwindcss';`):
  - Display: **Barlow Condensed** 700/800 (uppercase, tight tracking, sometimes italic for energy) — screen titles, big numbers, class names on hero cards.
  - Body/UI: **Inter** 400/500/600/700.
  - Theme tokens `--font-display`, `--font-sans`; base `body` font set in `@layer base`.
- **Shape & depth:** radii 20–28px on cards, pill buttons/chips, hairline borders `ink/8`, very soft shadows; black cards for emphasis (hero / next class), orange for primary CTAs and active states.
- **Icons:** `lucide-react` (add as dependency). No emojis.
- **Motion:** CSS transitions only (tab switch fade/slide, bottom-sheet slide-up, button press scale 0.97, progress-bar fill). Respect `prefers-reduced-motion`. No motion library needed.
- **Imagery:** invoke the `make/unsplash` skill during implementation to pick high-quality photos for: workout program thumbnails (~8), trainer portraits (~5), class cards (~6), and a Home hero. Store URLs in the mock data files. Each image gets a black gradient overlay where text sits on it; use `loading="lazy"` and an `ink/10` placeholder background.

## File structure
```
src/
  App.tsx                    // PhoneFrame + AppShell, tab state, booking state provider
  index.css                  // font import, tailwind, @theme tokens, base layer, scrollbar hiding, keyframes
  state/BookingContext.tsx   // React context + useReducer for classes/trainers/bookings/toast
  data/classes.ts            // class sessions over next 7 days
  data/trainers.ts           // trainers, quotas, slots
  data/workouts.ts           // programs + exercises
  data/user.ts               // member name, avatar, stats
  lib/dates.ts               // 7-day strip generation, formatting helpers (relative to today)
  components/
    PhoneFrame.tsx           // desktop frame vs mobile full-bleed + fake status bar
    TabBar.tsx               // 4 tabs, floating pill style, orange active indicator
    ScreenHeader.tsx
    BottomSheet.tsx          // reusable sheet w/ backdrop, slide-up, Esc/backdrop close, focus trap-lite
    Toast.tsx
    Chip.tsx, Button.tsx, SpotsMeter.tsx, Avatar.tsx, DateStrip.tsx, EmptyState.tsx
  screens/
    HomeScreen.tsx
    ClassesScreen.tsx
    TrainersScreen.tsx
    WorkoutsScreen.tsx
    WorkoutDetailSheet.tsx
```
No router: navigation is `activeTab` state (`'home' | 'classes' | 'trainers' | 'workouts'`) plus sheet state. Each screen scrolls inside the frame's content area; scroll position resets to top on tab change. Cross-screen links (e.g. Home "See all") call `setTab`.

## Data model
```ts
type ClassSession = { id; name; category: 'Strength'|'HIIT'|'Cycle'|'Yoga'|'Boxing'|'Pilates';
  dayOffset: number /*0..6 from today*/; start: '07:00'; durationMin; intensity: 1|2|3;
  coach: string; studio: string; capacity: number; booked: number; image: string };
type Trainer = { id; name; specialty: string; tags: string[]; rating: number; years: number;
  image: string; weeklyQuota: number; bookedThisWeek: number;
  slots: { dayOffset: number; time: string; taken: boolean }[]; onFloor: boolean };
type WorkoutProgram = { id; title; category: 'Strength'|'Cardio'|'Mobility'|'Core'|'Full Body';
  level: 'Beginner'|'Intermediate'|'Advanced'; weeks: number; sessionsPerWeek: number;
  minutes: number; image: string; featured?: boolean; description: string;
  exercises: { name; sets: number; reps: string; restSec: number }[] };
type Booking = { id; kind: 'class'|'trainer'; refId; dayOffset; time; title; subtitle; image };
```
Dates are computed relative to the real current day so the schedule always looks live. Seed ~4–6 classes per day across 7 days; some nearly full (1–2 spots), some full, one already booked by the user. Seed 2 existing bookings (1 class, 1 trainer) so Home isn't empty on first load.

## State (BookingContext, useReducer)
- `classes`, `trainers`, `bookings`, `savedWorkoutIds`, `toast`.
- Actions: `BOOK_CLASS(id)` → `booked+1`, add booking; guard against full/duplicate. `CANCEL_CLASS(id)` → reverse. `BOOK_TRAINER(trainerId, slot)` → mark slot taken, `bookedThisWeek+1`, add booking; guard when quota reached or slot taken. `CANCEL_BOOKING(bookingId)` → reverse whichever kind. `TOGGLE_SAVE_WORKOUT(id)`. `SHOW_TOAST(msg)` auto-dismiss after ~2.5s.

## Screens

### 1. Home / Dashboard
- **Greeting header:** small avatar + "Good morning/afternoon/evening," (time-based) and large display name "ALEX". Right: notification bell with orange dot. Below: wordmark-free date line ("Tuesday, 14 May").
- **Weekly streak/stat strip:** black card with three stats (workouts this week, minutes, streak days) in big Barlow numbers, orange highlight on streak; a 7-dot week tracker.
- **Next up (hero):** the soonest booking as a large black card with photo on the right/background, class name, time countdown ("Starts in 2h 15m"), studio + coach, and actions "View" / "Cancel" (cancel confirms in a bottom sheet).
- **Upcoming bookings:** horizontal list of remaining bookings (class + trainer, distinguished by small label chip). Empty state: "No sessions booked" + orange "Book a class" CTA → Classes tab.
- **Quick actions:** 2×2 or row of tiles — Book Class, Find Trainer, Workouts, Check-in QR (QR opens a sheet with a stylized code made from a CSS grid pattern; purely visual).
- **Free programs:** horizontal carousel of 4 featured workout thumbnails with level + duration; "See all" → Workouts tab; tapping opens WorkoutDetailSheet.

### 2. Class Booking
- Title "CLASSES" + subtitle "Book your spot".
- **DateStrip:** 7 days horizontally (day name + date number); selected day is a black pill with orange dot; days with user bookings show a small orange dot.
- **Category chips:** All, Strength, HIIT, Cycle, Yoga, Boxing, Pilates (horizontal scroll, active = orange fill).
- **Optional time-of-day segmented control:** Morning / Afternoon / Evening / All.
- **Class list:** cards grouped by time. Each card: time column (big start time, duration), image thumb, name, coach · studio, intensity (3 flame/bolt icons, filled orange), **SpotsMeter** (segmented/progress bar + "4 of 20 spots left"; "Few spots left" in orange when ≤3; "Full" in grey). Right: button state — "Book" (orange), "Booked ✓" (black with check icon, tap → cancel option), "Waitlist" disabled grey when full.
- **Booking confirmation sheet:** class photo header, details (date, time, duration, studio, coach), spots remaining, policy note ("Free cancellation up to 2h before"), primary "Confirm booking" button. On confirm: sheet closes, toast "You're in! Spot reserved for HIIT Blast", card updates live, Home updates.
- Empty state when filters yield nothing.

### 3. Trainer Availability
- Title "TRAINERS" + live indicator ("● 3 on the floor now" with pulsing orange dot).
- Search field + specialty chips (All, Strength, Weight Loss, Mobility, Boxing, Rehab).
- **Trainer cards** (stacked, large): portrait with "On floor" badge, name, specialty, rating + years, tags. **Real-time quota block:** "7 / 10 sessions booked this week" with a bold progress bar (orange; black when nearly full; "Fully booked" state when reached). **Today's/next slots:** horizontal row of time pills (available = white with black border, taken = struck-through grey, selected = orange). "Book session" button (disabled until a slot is selected, disabled + label "Quota reached" if full).
- Small day toggle on each card or globally: Today / Tomorrow / pick from DateStrip (use a compact global DateStrip at top to keep cards simple).
- **Trainer booking sheet:** portrait, selected day/time, session length (60 min), quota after booking, "Confirm session". Updates quota, marks slot taken, adds to Home, toast.

### 4. Workout Library
- Title "WORKOUTS" + "Free programs for members".
- **Featured hero:** one full-width tall image card with gradient, "FEATURED" orange tag, title, weeks × sessions, "Start program" button.
- Search + category chips + level filter (segmented: All/Beginner/Intermediate/Advanced).
- **Grid:** 2 columns of image-forward cards (aspect 3:4) with gradient overlay, title, minutes + level badge, bookmark icon toggle (orange when saved). Optional "Saved" chip to filter saved items.
- **WorkoutDetailSheet** (near full-height): hero image, title, stats row (weeks, sessions/week, minutes, level), description, exercise list (numbered, sets × reps, rest), sticky "Start workout" orange CTA (shows toast "Workout started — let's go" since there is no player) and save toggle.

## Shared UX details
- Tab bar: floating white pill with shadow inside the frame bottom, icons (Home, CalendarDays, Users, Dumbbell) + labels; active = black filled circle w/ orange icon or orange label + indicator. Hit targets ≥ 44px.
- Fake iOS status bar (time, signal, battery icons) only inside the desktop frame; on mobile use `env(safe-area-inset-*)` padding.
- Hide scrollbars in horizontal scrollers; use `snap-x` for carousels.
- Bottom sheets: close via backdrop, drag handle tap, close button, or Escape; `role="dialog"`, `aria-modal`, labelled title; focus moves to the sheet.
- Buttons use semantic `<button>`; icon-only buttons get `aria-label`. Visible focus rings (orange).
- Contrast: orange is used for fills with black or white text chosen for legibility (white text on orange at bold/large sizes; small text uses black on white).

## Edge cases
- Booking a full class or a taken slot is impossible (button disabled; reducer guards too).
- Trainer quota reached → all slot pills disabled, "Fully booked this week" message.
- Cancelling restores spot/quota/slot.
- Duplicate class booking prevented (button shows Booked).
- No bookings → Home empty state; filters with no results → EmptyState with "Clear filters".
- Image load failure → keep `ink/10` placeholder with a centered icon.
- Greeting adapts to time of day; countdown computed from dayOffset + start time (show "Today 18:00" / "Tomorrow 07:00" / weekday).

## Implementation steps
1. `pnpm add lucide-react`.
2. `index.css`: Google Fonts import, tailwind import, `@theme` tokens, base layer, utilities (`no-scrollbar`, keyframes for sheet/toast/pulse, reduced-motion).
3. Run `make/unsplash` skill to source photos; write data files.
4. Build context/reducer, shared components, PhoneFrame + TabBar shell.
5. Build screens in order: Home → Classes → Trainers → Workouts (+ detail sheet).
6. Polish pass: spacing rhythm, empty states, transitions, focus states.

## Verification
- `pnpm build` (typecheck via Vite/TS) succeeds.
- Manual check in the preview: desktop shows phone frame; narrow viewport is full-bleed; all four tabs navigate; booking a class decrements spots and appears on Home; cancelling reverses it; trainer booking updates quota bar and slot; quota-full trainer is non-bookable; workout filters, save toggle, and detail sheet work; Escape/backdrop closes sheets.

## Out of scope
Backend, auth, persistence across reloads, real payments/QR check-in, routing/deep links, a workout player.
