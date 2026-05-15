# Stop & Go - Vollständiges Entscheidungsdiagramm

## Grundlegende Zustände

- **GO** → Stroker läuft
- **STOP** → Stroker steht still
- **MILKING** → Spezieller intensiver Modus (nach Verlängerung)
- **ENDED** → Modus beendet

---

## 1. Start des Modus

```
onStart()
├── Berechne minDuration = baseDuration - variance (min. 60s)
├── Berechne targetEndTime = minDuration + variance (mind. 1 Min Abstand)
├── Setze Intensität = 10%
└── Phase = GO
```

---

## 2. AI-Frage bei minDuration (75% Intensität)

**Bedingung:** `elapsed >= minDuration && !hasAskedAtMinDuration && Phase != MILKING`

```
Frage stellen?
├── Ja (Difficulty-basiert)
│   ├── AI fragt: "Du hast es fast geschafft, hältst du noch durch?"
│   ├── Warte auf Antwort (mit Timeout)
│   │   ├── Antwort = "Ja" / "Ich kann noch" → Weiter bis targetEndTime
│   │   ├── Antwort = "Nein" / "Nicht mehr lange" → Je nach Difficulty:
│   │   │   ├── Niedrig/Mittel → Ermutigen + weiter machen
│   │   │   └── Hoch → "Dann sag Bescheid, wenn du nicht mehr kannst"
│   │   └── Timeout → Automatisch "Ja" annehmen
│   └── hasAskedAtMinDuration = true
└── Nein (hohe Difficulty)
    └── Keine Frage, einfach weiter bis targetEndTime
```

---

## 3. User meldet "close" / "nah"

### 3.1 Vor minDuration

```
Signal: "close"
→ Phase = STOP
→ Intensität -= 25% (min. 10%)
→ AI sagt etwas wie: "Gut, dann ruhen wir uns kurz aus..."
```

### 3.2 Nach minDuration

#### Fall A: AI hat bei 75% gefragt

```
Signal: "close"
→ Phase = STOP (kurz)
→ AI sagt: "Gut, dann noch etwas länger..." oder "Dann halten wir noch etwas durch"
→ Phase = GO (weiter bis targetEndTime)
```

#### Fall B: AI hat bei 75% **nicht** gefragt

```
Signal: "close"
→ Phase = STOP
→ Intensität leicht senken
→ AI sagt: "Dann ruhen wir uns kurz..." (etwas strenger als bei Fall A)
```

### 3.3 Nach Verlängerung (Milking)

```
Signal: "close"
→ Je nach Persona:
├── Süß / Verständnisvoll → "Gut, dann noch etwas länger..."
└── Dominant / Streng → "Du hast es selbst gewollt..." (etwas strenger)
```

---

## 4. User meldet "orgasm"

### 4.1 Vor minDuration

#### 4.1.1 Kurz nach "close" (während Pause oder laufendem Script)

```
→ AI ist enttäuscht
→ Je nach Difficulty:
├── Niedrig/Mittel → "Schade, aber gut, dass du es gemeldet hast"
└── Hoch → "Das war zu früh..." (möglich: Orgasmus ruinieren)
```

#### 4.1.2 Ohne vorheriges "close"

```
→ AI ist streng
→ Je nach Difficulty:
├── Mittel → "Du hast es nicht gemeldet..."
└── Hoch → Möglichkeit des Ruins (Persona-abhängig)
```

### 4.2 Nach minDuration

#### 4.2.1 Nach "close" + Persona erlaubt es

```
→ AI ist positiv / stolz
→ "Gut gemacht... jetzt darfst du kommen"
→ Phase = MILKING (falls gewünscht) oder normaler Orgasmus
```

#### 4.2.2 Nach "close" + Persona erlaubt es **nicht**

```
→ AI ist enttäuscht
→ "Du hast es nicht geschafft..." (leichte Bestrafung möglich)
```

#### 4.2.3 Ohne vorheriges "close"

```
→ Je nach Difficulty:
├── Niedrig → Neutral-positiv
├── Mittel → Leicht enttäuscht
└── Hoch → Streng ("Du hättest es melden sollen...")
```

### 4.3 Nach Verlängerung (Milking)

#### 4.3.1 User hat Milking angefordert und es **nicht** geschafft

```
→ AI ist enttäuscht + "Du hast es selbst gewollt..."
→ Leichte Bestrafung möglich (Persona-abhängig)
```

#### 4.3.2 User hat Milking **nicht** angefordert und es nicht geschafft

```
→ Normal strenge Reaktion (wie 4.2.3)
```

---

## 5. AI-initiierte Fragen am Ende

### 5.1 Bei Erreichen von targetEndTime

```
AI fragt: "Bist du bereit für das Ende oder möchtest du noch etwas länger machen?"
├── Antwort = "Ja" / "Bereit" → Finale Belohnungsphase
├── Antwort = "Länger" / "Weiter" → Verlängerung (5 Min + Variance)
│   └── Intensität auf 75% zurücksetzen + neu hochfahren
└── Timeout → Automatisch "Ja" annehmen
```

### 5.2 Bei Verlängerungswunsch

```
AI sagt: "Gut, dann noch etwas länger..." (je nach Persona stolz / dominant / süß)
→ Neue targetEndTime = aktuelle Zeit + extensionBaseDuration + Variance
→ Intensität auf 75% zurücksetzen
```

---

## 6. User fragt "milking"

```
User: "milking" / "milk me dry"
→ AI entscheidet (aktuell immer akzeptieren):
├── Akzeptiert → Phase = MILKING
│   ├── Intensität auf 100%
│   ├── Neue Dauer = extensionBaseDuration + Variance
│   └── Bei Misserfolg → spezielle Antwort (siehe 4.3.1)
└── Abgelehnt (später) → "Heute nicht..."
```

---

## 7. Erfolgreiches Durchhalten (ohne "close" zu melden)

```
User hält bis targetEndTime durch, ohne jemals "close" zu signalisieren
→ AI lobt besonders stark
→ "Du hast es ohne ein einziges Mal zu melden geschafft... beeindruckend"
→ Finale Belohnungsphase
```

---

## 8. User bricht aktiv ab

```
User: "stop" / "ich will nicht mehr" / "genug"
→ AI reagiert je nach Persona:
├── Süß → "Gut, dann ist es für heute genug..."
├── Dominant → "Du gibst so schnell auf?"
└── Verständnisvoll → "Okay, dann ruhen wir uns aus..."
→ Phase = ENDED
```

---

## Zusammenfassung der AI-Antwort-Stile (Persona-abhängig)

| Persona-Typ | "close" vor minDuration | "close" nach minDuration | "orgasm" zu früh | "orgasm" nach "close" |
|-------------|--------------------------|---------------------------|------------------|-----------------------|
| **Süß**     | Verständnisvoll + Pause  | Ermutigend                | Leicht enttäuscht| Positiv + belohnend   |
| **Dominant** | Streng + Pause           | Aufforderung durchzuhalten| Streng           | Erlaubt + dominant    |
| **Teasing** | Spöttisch + Pause        | "Du schaffst das schon"   | Spöttisch        | Teasing + belohnend   |

---

*Stand: 15. Mai 2026 – Grundlage für die finale Implementierung*