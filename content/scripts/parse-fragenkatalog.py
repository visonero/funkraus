#!/usr/bin/env python3
"""Parse the official BNetzA question catalogue PDF into JSON.

Usage: PYTHONPATH=<dir with pypdf> python3 parse-fragenkatalog.py
In the official catalogue the correct answer is always option A; `options[0]` is therefore
the correct answer and must be shuffled at import/render time.
"""
import json, re, sys
import pypdf

SRC = "content/sources/BNetzA-Pruefungsfragen-BZF-2024.pdf"
OUT = "content/questions/fragenkatalog-2024.json"

text = "\n".join(p.extract_text() for p in pypdf.PdfReader(SRC).pages)
text = text[text.index("1 Welche zwischenstaatliche"):]
lines = [l.rstrip() for l in text.split("\n")]
lines = [l for l in lines if not l.startswith("Prüfungsfragen im Prüfungsteil") and not l.startswith("Stand: 2024")]

questions, current, expected = [], None, 1
for line in lines:
    m = re.match(rf"^{expected}(?:\s+(.*))?$", line)
    if m:
        current = {"id": expected, "raw": [m.group(1) or ""]}
        questions.append(current)
        expected += 1
    elif current is not None:
        current["raw"].append(line)

result = []
for q in questions:
    stem, opts, cur = [], {}, None
    for line in q["raw"]:
        nxt = "ABCD"[len(opts)] if len(opts) < 4 else None
        om = re.match(rf"^({nxt})(?:\s+(.*))?$", line) if nxt else None
        if om:
            cur = om.group(1)
            opts[cur] = (om.group(2) or "").strip()
        elif cur:
            opts[cur] += " " + line.strip()
        else:
            stem.append(line.strip())
    question = " ".join(s for s in stem if s).strip()
    result.append({"id": q["id"], "question": question, "options": [re.sub(r"\s+", " ", opts.get(k, "")).strip() for k in "ABCD"]})

bad = [q["id"] for q in result if not q["question"] or any(not o for o in q["options"])]
print(f"parsed {len(result)} questions; problems: {bad}")
json.dump({"source": "Bundesnetzagentur, Prüfungsfragen BZF II / BZF I, gültig ab 01.05.2024",
           "correctOptionInSource": "A", "questions": result}, open(OUT, "w"), ensure_ascii=False, indent=1)
