# Event archive backfill — 22 November 2026

Owner requested backfill from existing group announcements and photos. Public descriptions paraphrase announced logistics, not private conversations. No attendee names, quotes, attendance counts, phone numbers, credentials, group identifiers, invite links, or private photos are included.

## Added seed records

| Event ID | Evidence | Confidence and limits |
| --- | --- | --- |
| vfc-jogja-tycho-2026-06-02 | VFC Jogja announcement on 1 June specifying 2 June, 09:00 WIB, The Bean Garden Palagan; next-day arrival message | Announced date, time, venue and Tycho theme explicit. No attendance or outcomes inferred. |
| vfc-bandung-kcd-2026-10-23 | VFC Bandung announcement on 23 October specifying same-day 13:00 Asia/Jakarta and a map link | Explicit announced logistics. Venue name and occurrence not independently confirmed; retain city and supplied map, describe as an invitation. |
| vfc-swe-growth-diy-2026-10-28 | VFC Jogja announcement on 28 October local time; same-day group photo reviewed privately | Date, 09:00 WIB, Garuda Spark venue and collaboration explicit; photo is consistent with an in-person gathering at Garuda Spark. No identities or headcount inferred. |
| vfc-gsih-sharing-2026-11-11 | VFC Jogja announcement on 10 November; next-day group photo with thank-you caption reviewed privately | Date, 09:00 WIB, Garuda Spark venue and planned sharing explicit. Photo supports gathering, not proof that every agenda item happened. |

## Duplicate protection

Read-only production `/api/events` check returned five published records: `vfc-jogja-bukber-2026`, `vfc-jogja-openclaw-2026-04-13`, `vfc-jakarta-perdana`, `jakartadevs-2`, and `nglathak-ing-bantul`. None of the four added events matched their dates/titles. Existing runtime records remain unchanged. Seed records merge with KV through the existing store contract; KV overrides and deletion markers remain authoritative.

Scope is a bounded backfill, not a complete history. Other photos and forwarded third-party event adverts were not sufficient evidence to create VFC events. Photos were used only for verification and are not republished. Existing cafe image fallback may illustrate the venue, not the event itself.

## Additional cities — same-day owner follow-up

No special “informal” label is used: community meetups count without formal announcements. Photos are evidence alongside surrounding messages, not a basis for guessing identities, precise locations, attendance counts, or start times.

- `vfc-malang-2026-06-19`: 17 June announcement explicitly specifies 19 June 2026, 13:00, Malang and a location link. Described as announced, not independently verified attendance.
- `vfc-bandung-jati-kopi-2026-06-30`: 29 June invitation specifies date, 08:00–20:30 WIB, venue/address and map.
- `vfc-bandung-ruangduduk-2026-07-02`: 1 July invitation specifies date, 08:00–20:30 WIB, venue/address and map.
- `vfc-surabaya-2026-08-07`: same-day invitation specifies 13:00 and central Surabaya map; follow-up encourages joining. Venue name not guessed.
- `vfc-solo-2026-11-06`: same-day meetup coordination, shared location link and arrival replies, then evening photo reviewed privately show a cafe gathering with laptops. Date inferred from this coherent same-day sequence. Exact start time and venue name not established: keep time empty and show it as unrecorded, retaining supplied map.

Kuala Lumpur: locally indexed photo messages and surrounding conversation were found, but the first attempted photo download returned HTTP 403. Conversation spans Kuala Lumpur, Petaling Jaya, Cyberjaya and Melaka; do not attribute all gatherings to Kuala Lumpur based only on the group name. A MyCommIT invitation is not itself evidence of VFC organizing or attending. Further unambiguous evidence is needed before adding a VFC meetup there. This is a source-access/evidence limit, not a requirement for formal organization.

Archive-only seed records can omit an exact time when unknown. Public cards make that explicit; admin form validation still requires a time for newly entered scheduled events. Existing store sorting uses its established midnight fallback for date-only records; midnight is never displayed as the event start.
