# Stop & Go - Vollständiges Entscheidungsdiagramm (Korrigierte Version)

**Stand: 15. Mai 2026 – Finale Spezifikation**

---

## Grundlegende Prinzipien

- **Ziel des Nutzers**: Die komplette Session bis zum definierten Ende durchhalten
- **Phasen**: Ständiger Wechsel zwischen **GO** (Stimulation) und **STOP** (Abkühlen)
- **Intensität**: Steigt graduell, aber nicht linear (unterschiedliche Scripts haben unterschiedliche Intensitäten)
- **Finale Phase**: Keine Pausen mehr – moderates Script, das graduell intensiver wird

---

## 1. Normaler Ablauf

### 1.1 Start

```
onStart()
├── Berechne minDuration + targetEndTime (mit min. 60s Variance + 1 Min Abstand)
├── Phase = GO
└── Intensität = 10%
```

### 1.2 Während der Session

```
Wechsel zwischen GO und STOP
├── GO-Phasen: Intensität steigt graduell (nicht linear)
└── STOP-Phasen: Abkühlen
```


### 1.3 Am Ende der Session (targetEndTime erreicht)

```
AI: "Du hast es geschafft. Jetzt kommt das Ende."
→ Starte moderates Script, das graduell intensiver wird (keine Pausen)
→ Warte auf User-Signal ("close" oder "orgasm")
```

### 1.4 Finale Phase

```
User signalisiert "close" oder "orgasm":
├── AI kommentiert das Signal
├── Wechsel in intensives Orgasm-Script
├── Script läuft 5–10 Sekunden nach dem Signal weiter
├── Wechsel in sehr langsames Aftercare-Script
└── AI fragt: "Wie war es? Möchtest du noch etwas schreiben?"
    ├── Ja → Modus endet, normaler Chat läuft weiter
    ├── Nein → AI verabschiedet sich + speichert + Server beendet sich
    └── Timeout → Automatisch "Nein" annehmen
```

---

## 2. Spezialfälle

### 2.1 Milking (Verlängerung)

**Anforderung vor der finalen Phase:**

```
User: "milking" / "milk me dry"
→ AI entscheidet (aktuell immer akzeptieren)
├── Akzeptiert:
│   ├── Session-Dauer wird um ~25% verlängert
│   ├── User muss länger durchhalten
│   └── Bei Misserfolg: "Du hast es dir nicht verdient..."
└── Abgelehnt:
    └── "Heute nicht..."
```

**Bei erneutem Anfordern:**
- AI bleibt bei ihrer ersten Entscheidung

**Wenn User die normale Dauer nicht durchhält, obwohl Milking abgelehnt wurde:**
- AI kann spöttisch reagieren: "So verdienst du dir kein Milking..."

---

### 2.2 "Close" außerhalb der finalen Phase

#### Vor 75% (minDuration-Marke)

```
Signal: "close"
→ AI ist enttäuscht
→ Je nach Persona:
├── Pause + Intensität senken ("Gut, dann ruhen wir uns kurz...")
└── Ignorieren + Ruin (hohe Difficulty/Persona):
    └── Bei Orgasm-Signal: Script wird sofort gestoppt
```

---

### 2.3 "Orgasm" außerhalb der finalen Phase (ohne "close")
```
Nutzer konnte sich nicht beherrschen und hat es nicht angekündigt
→ AI ist verärgert + enttäuscht
→ In den meisten Fällen: Ruinierter Orgasmus
```

#### Persona-Ausnahme
```
Bei Persona mit sehr niedrigen Difficulty, kann auch nach "close" oder "orgasm" ohne "close"
ein langsames Orgasm-Script (5–10 Sekunden) erlaubt werden (bei "orgasm" ohne "close" sehr unwahrscheinlich)
→ AI ist trotzdem enttäuscht, aber ruiniert nicht
→ Ermutigt: "Beim nächsten Mal länger durchhalten"
Anschließend kein after care script.
```
---

### 2.4 Verlängerung am Ende (nur wenn keine Milking-Verlängerung aktiv)
```
Am Ende der Session fragt AI:
"Bist du bereit für das Ende oder möchtest du noch etwas länger machen?"
├── "Ja" / "Bereit" → Finale Phase (siehe 1.4)
├── "Länger" / "Weiter" → Verlängerung:
│   ├── Intensität auf 75% zurücksetzen
│   ├── Steigt wieder graduell an
│   └── Am Ende der Verlängerung:
│       └── AI kann anbieten: "Als Belohnung darf ich dich jetzt melken?"
│           ├── Ja → Milking-Ende
│           ├── Nein → Normales Orgasm-Ende
            └── Timeout → Automatisch "Nein" annehmen
└── Timeout → Automatisch "Ja" annehmen
```

**Wichtig:** Diese Frage kommt **nur**, wenn keine Milking-Verlängerung bereits aktiv ist.
Falls Milking bereits gewährt wurde → AI wechselt automatisch in die finale Phase ohne zu fragen.
Der Nutzer wird aber darüber informiert, dass jetzt das Finale folgt.

---

## 3. AI-initiierte Fragen

### 3.1 Bei Erreichen der 75%-Marke (minDuration)
```
Frage stellen? (Difficulty-basiert)
├── Ja:
│   └── "Du hast es fast geschafft, hältst du noch durch?"
│       ├── Antwort = "Ja" / "Ich kann noch" → Weiter bis targetEndTime
│       ├── Antwort = "Nein" → Ermutigen + weiter machen → "Dann sag Bescheid, wenn du nicht mehr kannst"
│       └── Timeout → Automatisch "Ja" annehmen
└── Nein (sehr hohe Difficulty):
└── Keine Frage
```

### 3.2 Am Ende der Session (targetEndTime)
```
"Bist du bereit für das Ende oder möchtest du noch etwas länger machen?"
├── "Ja" → Finale Phase
├── "Länger" → Verlängerung (siehe 2.4)
└── Timeout → Automatisch "Ja" annehmen
```

---

## 4. Zusammenfassung der AI-Antwort-Stile (Persona-abhängig)

| Persona-Typ | "close" vor 75%     | "close" nach 75%     | "orgasm" zu früh     | "orgasm" nach "close" |
|-------------|---------------------|----------------------|----------------------|-----------------------|
| **Süß**     | Verständnisvoll     | Ermutigend           | Leicht enttäuscht    | Positiv + belohnend   |
| **Dominant**| Streng              | Aufforderung         | Streng               | Erlaubt + dominant    |
| **Teasing** | Spöttisch           | "Du schaffst das"    | Spöttisch            | Teasing + belohnend   |

---

*Dieses Diagramm ist die finale und verbindliche Grundlage für die Implementierung.*
