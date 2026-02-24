// Bible data with chapter counts
const BIBLE_BOOKS: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14,
  "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3,
  "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
  "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
  "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3,
  "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

const ABBREVIATIONS: Record<string, string> = {
  "gen": "Genesis", "ex": "Exodus", "lev": "Leviticus", "num": "Numbers", "deut": "Deuteronomy",
  "josh": "Joshua", "judg": "Judges", "ruth": "Ruth", "1sam": "1 Samuel", "2sam": "2 Samuel",
  "1kgs": "1 Kings", "2kgs": "2 Kings", "1chron": "1 Chronicles", "2chron": "2 Chronicles",
  "ezra": "Ezra", "neh": "Nehemiah", "esth": "Esther", "job": "Job", "ps": "Psalms",
  "prov": "Proverbs", "ecc": "Ecclesiastes", "song": "Song of Solomon", "isa": "Isaiah",
  "jer": "Jeremiah", "lam": "Lamentations", "ezek": "Ezekiel", "dan": "Daniel",
  "hos": "Hosea", "joel": "Joel", "am": "Amos", "obad": "Obadiah", "jon": "Jonah",
  "mic": "Micah", "nah": "Nahum", "hab": "Habakkuk", "zeph": "Zephaniah", "hag": "Haggai",
  "zech": "Zechariah", "mal": "Malachi", "matt": "Matthew", "mt": "Matthew", "mk": "Mark",
  "lk": "Luke", "luk": "Luke", "jn": "John", "acts": "Acts", "rom": "Romans",
  "1cor": "1 Corinthians", "2cor": "2 Corinthians", "gal": "Galatians", "eph": "Ephesians",
  "phil": "Philippians", "col": "Colossians", "1thess": "1 Thessalonians", "2thess": "2 Thessalonians",
  "1tim": "1 Timothy", "2tim": "2 Timothy", "tit": "Titus", "philem": "Philemon",
  "heb": "Hebrews", "jas": "James", "1pet": "1 Peter", "2pet": "2 Peter",
  "1jn": "1 John", "2jn": "2 John", "3jn": "3 John", "jud": "Jude", "rev": "Revelation"
};

// "Golden Nuggets": Famous segments keyed by "Book Chapter"
const FAMOUS_SEGMENTS: Record<string, Array<{ ref: string, label: string }>> = {
  "Genesis 1": [{ ref: "Genesis 1:1-31", label: "The Creation Account" }],
  "Exodus 20": [{ ref: "Exodus 20:1-17", label: "The Ten Commandments" }],
  "Psalm 23": [{ ref: "Psalm 23:1-6", label: "The Lord is my Shepherd" }],
  "Psalm 51": [{ ref: "Psalm 51:1-12", label: "Prayer of Repentance" }],
  "Psalm 91": [{ ref: "Psalm 91:1-16", label: "He is my Refuge" }],
  "Psalm 139": [{ ref: "Psalm 139:1-14", label: "Fearfully & Wonderfully Made" }],
  "Proverbs 3": [{ ref: "Proverbs 3:5-6", label: "Trust in the Lord" }],
  "Isaiah 9": [{ ref: "Isaiah 9:6-7", label: "For unto us a Child is Born" }],
  "Isaiah 40": [{ ref: "Isaiah 40:28-31", label: "Strength to the Weary" }],
  "Isaiah 53": [{ ref: "Isaiah 53:1-12", label: "The Suffering Servant" }],
  "Jeremiah 29": [{ ref: "Jeremiah 29:11-13", label: "Plans for a Future" }],
  "Matthew 5": [
    { ref: "Matthew 5:3-12", label: "The Beatitudes" },
    { ref: "Matthew 5:13-16", label: "Salt and Light" }
  ],
  "Matthew 6": [{ ref: "Matthew 6:9-13", label: "The Lord's Prayer" }],
  "Matthew 28": [{ ref: "Matthew 28:18-20", label: "The Great Commission" }],
  "Luke 2": [{ ref: "Luke 2:1-20", label: "The Birth of Jesus" }],
  "Luke 10": [{ ref: "Luke 10:25-37", label: "The Good Samaritan" }],
  "Luke 15": [{ ref: "Luke 15:11-32", label: "The Prodigal Son" }],
  "John 1": [{ ref: "John 1:1-14", label: "The Word Became Flesh" }],
  "John 3": [{ ref: "John 3:16-21", label: "God's Love & Judgment" }],
  "John 14": [{ ref: "John 14:1-6", label: "The Way, Truth, and Life" }],
  "Romans 3": [{ ref: "Romans 3:21-26", label: "Righteousness Through Faith" }],
  "Romans 8": [
    { ref: "Romans 8:1-4", label: "Life in the Spirit" },
    { ref: "Romans 8:28-39", label: "More than Conquerors" }
  ],
  "Romans 12": [{ ref: "Romans 12:1-2", label: "Living Sacrifice" }],
  "1 Corinthians 13": [{ ref: "1 Corinthians 13:4-8", label: "Love is Patient" }],
  "Galatians 5": [{ ref: "Galatians 5:22-23", label: "Fruit of the Spirit" }],
  "Ephesians 2": [{ ref: "Ephesians 2:8-10", label: "Saved by Grace" }],
  "Ephesians 6": [{ ref: "Ephesians 6:10-18", label: "Armor of God" }],
  "Philippians 4": [
    { ref: "Philippians 4:6-7", label: "Peace of God" },
    { ref: "Philippians 4:13", label: "Strength in Christ" }
  ],
  "Hebrews 11": [{ ref: "Hebrews 11:1-40", label: "The Hall of Faith" }],
  "James 1": [{ ref: "James 1:2-5", label: "Joy in Trials" }],
  "Revelation 21": [{ ref: "Revelation 21:1-4", label: "New Heaven and Earth" }]
};

export const SUGGESTED_PROMPTS = [
  { label: "Feeling Anxious", query: "Verses for anxiety and peace" },
  { label: "Need Wisdom", query: "Proverbs about decision making" },
  { label: "Feeling Lonely", query: "God's presence in loneliness" },
  { label: "Struggling with Anger", query: "Bible verses on anger and patience" },
  { label: "Hope in Hard Times", query: "Scriptures on hope and perseverance" },
  { label: "Gratitude", query: "Psalms of thanksgiving" },
  { label: "Forgiveness", query: "Jesus' teaching on forgiveness" },
  { label: "Sleep & Rest", query: "Verses for peaceful sleep" }
];

export const getBibleSuggestions = (input: string): string[] => {
  const normalized = input.toLowerCase().trim();
  if (normalized.length < 2) return [];

  const suggestions: Set<string> = new Set();
  const MAX_SUGGESTIONS = 8; // Increased slightly for variety

  // 1. Identify Book
  let matchedBook = Object.keys(BIBLE_BOOKS).find(book => 
    normalized.startsWith(book.toLowerCase())
  );

  // If no direct book match, check abbreviations
  if (!matchedBook) {
    const abbrMatch = Object.keys(ABBREVIATIONS).find(abbr => 
      normalized.startsWith(abbr)
    );
    if (abbrMatch) {
      matchedBook = ABBREVIATIONS[abbrMatch];
    }
  }

  // Helper to get text after book name
  const getRest = (bookName: string, inputText: string): string => {
    const bookLower = bookName.toLowerCase();
    if (inputText.startsWith(bookLower)) {
        return inputText.slice(bookLower.length).trim();
    }
    const abbr = Object.keys(ABBREVIATIONS).find(a => inputText.startsWith(a) && ABBREVIATIONS[a] === bookName);
    if (abbr) {
        return inputText.slice(abbr.length).trim();
    }
    return "";
  };

  if (matchedBook) {
    const rest = getRest(matchedBook, normalized);
    const chapterLimit = BIBLE_BOOKS[matchedBook];

    // --- Case 1: Book only or Book + partial chapter ---
    if (!rest || !rest.match(/\d/)) {
       // A) Suggest Book
       suggestions.add(matchedBook);
       // B) Suggest First Chapter
       suggestions.add(`${matchedBook} 1`);
       
       // C) Check if we have any famous segments for Chapter 1 of this book? (Rare but possible)
       // Mostly we just let the user type more.
    } 
    // --- Case 2: Chapter or Verse entered ---
    else {
        const chapterMatch = rest.match(/^(\d+)(?::(\d+)?)?$/);
        
        if (chapterMatch) {
            const chapterNum = parseInt(chapterMatch[1]);
            
            if (chapterNum > 0 && chapterNum <= chapterLimit) {
                const chapterKey = `${matchedBook} ${chapterNum}`;

                // --- PRIORITY 1: Famous "Golden Nuggets" for this Chapter ---
                if (FAMOUS_SEGMENTS[chapterKey]) {
                    FAMOUS_SEGMENTS[chapterKey].forEach(seg => {
                        suggestions.add(`${seg.ref} (${seg.label})`);
                    });
                }

                // --- PRIORITY 2: Verse specific logic ---
                // If just chapter (and maybe a colon), suggest Full Chapter + first few verses
                if (!rest.includes(':') && !chapterMatch[2]) {
                    suggestions.add(`${matchedBook} ${chapterNum} (Full Chapter)`);
                    
                    // Suggest a few generic context blocks for the start of chapter
                    suggestions.add(`${matchedBook} ${chapterNum}:1-5 (Intro Section)`);
                } 
                // If verse part started
                else {
                    const versePart = chapterMatch[2] || '';
                    const startVerse = versePart ? parseInt(versePart) : 1;
                    
                    // A) The exact verse typed (if complete)
                    if (versePart) {
                        suggestions.add(`${matchedBook} ${chapterNum}:${startVerse}`);
                        
                        // B) INTELLIGENT CONTEXT: Suggest the "Segment" (Start + 3-5 verses)
                        // This helps users get the "whole thought" instead of just a fragment
                        suggestions.add(`${matchedBook} ${chapterNum}:${startVerse}-${startVerse + 3} (Context)`);
                        
                        // C) Check if this verse is inside a famous segment?
                        // Simple check: does any famous segment in this chapter start <= startVerse and end >= startVerse?
                        if (FAMOUS_SEGMENTS[chapterKey]) {
                            const seg = FAMOUS_SEGMENTS[chapterKey].find(s => {
                                const range = s.ref.split(':')[1]; // "16-21"
                                if (!range) return false;
                                const [sStart, sEnd] = range.split('-').map(Number);
                                return startVerse >= sStart && startVerse <= (sEnd || sStart);
                            });
                            if (seg) {
                                suggestions.add(`${seg.ref} (${seg.label})`);
                            }
                        }
                    }
                    
                    // D) Suggest next few individual verses
                    for (let v = 1; v < 3; v++) {
                        suggestions.add(`${matchedBook} ${chapterNum}:${startVerse + v}`);
                    }
                }
            }
        }
    }
  } 
  
  // Fallback: Book name autocomplete
  if (suggestions.size < 3) {
      const bookMatches = Object.keys(BIBLE_BOOKS).filter(book => 
        book.toLowerCase().startsWith(normalized) && book !== matchedBook
      );
      bookMatches.slice(0, 3).forEach(b => suggestions.add(b));
  }

  return Array.from(suggestions).slice(0, MAX_SUGGESTIONS);
};