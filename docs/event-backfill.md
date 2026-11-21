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
