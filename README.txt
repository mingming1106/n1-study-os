N1 Study OS v3.3 — Chinese-first / reading-safe audio / progress backup

Fixes:
- Word audio speaks the database kana reading, not ambiguous kanji.
- Example audio uses furigana markup when available.
- Chinese-first UI; English source glosses are folded as auxiliary when no verified Chinese gloss exists.
- SRS progress is persisted in localStorage with review history.
- Export/import progress JSON for backup and device migration.

Upload all files to the ROOT of the existing GitHub repository and commit.

V3.3 changes
- Persistent flashcard position: current word/deck position survives refresh and reopening.
- Learned cards are not restarted as New from index 0; the next unseen card is selected after rating.
- Study-session counters are stored alongside SRS history.
- Chinese-first dictionary architecture retained; English glosses are auxiliary only when no Chinese match is available.
- Pronunciation continues to speak the stored kana reading, not ambiguous kanji text.

Dictionary attribution / licensing
- OpenJLPT: CC BY-SA 4.0; N1 community level estimates, not an official JLPT vocabulary list.
- Tomoshi open data / JMdict-derived Chinese layers: CC BY-SA 4.0 where applicable; credit EDRDG and Tomoshi (Y1Z). See upstream NOTICE/LICENSE for details.
