
export interface BibleStory {
  id: string;
  title: string;
  reference: string;
  category: 'OT' | 'NT';
}

const STORAGE_KEY_READ_STORIES = 'lumina_read_stories_ids';

export const BIBLE_STORIES: BibleStory[] = [
  // Old Testament - Beginnings & Patriarchs
  { id: 'creation', title: 'The Creation', reference: 'Genesis 1-2', category: 'OT' },
  { id: 'fall', title: 'The Fall of Man', reference: 'Genesis 3', category: 'OT' },
  { id: 'cain_abel', title: 'Cain and Abel', reference: 'Genesis 4:1-16', category: 'OT' },
  { id: 'noah', title: 'Noah\'s Ark', reference: 'Genesis 6-9', category: 'OT' },
  { id: 'tower_babel', title: 'Tower of Babel', reference: 'Genesis 11:1-9', category: 'OT' },
  { id: 'abraham_call', title: 'Call of Abraham', reference: 'Genesis 12:1-9', category: 'OT' },
  { id: 'sodom', title: 'Sodom and Gomorrah', reference: 'Genesis 19', category: 'OT' },
  { id: 'isaac_sacrifice', title: 'Binding of Isaac', reference: 'Genesis 22', category: 'OT' },
  { id: 'jacob_ladder', title: 'Jacob\'s Ladder', reference: 'Genesis 28:10-22', category: 'OT' },
  { id: 'jacob_wrestle', title: 'Jacob Wrestles God', reference: 'Genesis 32:22-32', category: 'OT' },
  { id: 'joseph_coat', title: 'Joseph and the Coat', reference: 'Genesis 37', category: 'OT' },
  
  // Exodus & Wilderness
  { id: 'moses_basket', title: 'Birth of Moses', reference: 'Exodus 2:1-10', category: 'OT' },
  { id: 'burning_bush', title: 'The Burning Bush', reference: 'Exodus 3', category: 'OT' },
  { id: 'plagues', title: 'The Ten Plagues', reference: 'Exodus 7-12', category: 'OT' },
  { id: 'red_sea', title: 'Parting of the Red Sea', reference: 'Exodus 14', category: 'OT' },
  { id: 'golden_calf', title: 'The Golden Calf', reference: 'Exodus 32', category: 'OT' },
  { id: 'balaam', title: 'Balaam\'s Donkey', reference: 'Numbers 22:21-39', category: 'OT' },
  
  // Promised Land & Judges
  { id: 'rahab', title: 'Rahab and the Spies', reference: 'Joshua 2', category: 'OT' },
  { id: 'jericho', title: 'Walls of Jericho', reference: 'Joshua 6', category: 'OT' },
  { id: 'sun_stand_still', title: 'The Sun Stands Still', reference: 'Joshua 10:1-15', category: 'OT' },
  { id: 'deborah_barak', title: 'Deborah and Barak', reference: 'Judges 4-5', category: 'OT' },
  { id: 'gideon', title: 'Gideon\'s Army', reference: 'Judges 7', category: 'OT' },
  { id: 'jephthah_daughter', title: 'Jephthah\'s Vow', reference: 'Judges 11', category: 'OT' },
  { id: 'samson', title: 'Samson and Delilah', reference: 'Judges 16', category: 'OT' },
  { id: 'ruth', title: 'Ruth and Boaz', reference: 'Ruth 1-4', category: 'OT' },
  
  // Kings & Prophets
  { id: 'hannah_prayer', title: 'Hannah\'s Prayer', reference: '1 Samuel 1-2', category: 'OT' },
  { id: 'samuel_call', title: 'The Lord Calls Samuel', reference: '1 Samuel 3', category: 'OT' },
  { id: 'david_jonathan', title: 'David and Jonathan', reference: '1 Samuel 18-20', category: 'OT' },
  { id: 'david_goliath', title: 'David and Goliath', reference: '1 Samuel 17', category: 'OT' },
  { id: 'david_bathsheba', title: 'David and Bathsheba', reference: '2 Samuel 11', category: 'OT' },
  { id: 'solomon_wisdom', title: 'Solomon\'s Wisdom', reference: '1 Kings 3', category: 'OT' },
  { id: 'elijah_ravens', title: 'Elijah Fed by Ravens', reference: '1 Kings 17:1-6', category: 'OT' },
  { id: 'elijah_widow', title: 'Elijah and the Widow', reference: '1 Kings 17:7-24', category: 'OT' },
  { id: 'elijah_prophets', title: 'Elijah on Mt. Carmel', reference: '1 Kings 18', category: 'OT' },
  { id: 'elijah_whisper', title: 'The Still Small Voice', reference: '1 Kings 19', category: 'OT' },
  { id: 'naboth_vineyard', title: 'Naboth\'s Vineyard', reference: '1 Kings 21', category: 'OT' },
  { id: 'elijah_chariot', title: 'Elijah Taken to Heaven', reference: '2 Kings 2', category: 'OT' },
  { id: 'elisha_bears', title: 'Elisha and the Bears', reference: '2 Kings 2:23-25', category: 'OT' },
  { id: 'widow_oil', title: 'The Widow\'s Oil', reference: '2 Kings 4:1-7', category: 'OT' },
  { id: 'shunammite', title: 'The Shunammite Woman', reference: '2 Kings 4:8-37', category: 'OT' },
  { id: 'naaman', title: 'Naaman Healed', reference: '2 Kings 5', category: 'OT' },
  { id: 'hezekiah_prayer', title: 'Hezekiah\'s Prayer', reference: '2 Kings 19', category: 'OT' },
  { id: 'josiah_scroll', title: 'Josiah Finds the Law', reference: '2 Kings 22', category: 'OT' },
  { id: 'esther', title: 'Esther Saves Her People', reference: 'Esther 4-7', category: 'OT' },
  { id: 'job', title: 'The Suffering of Job', reference: 'Job 1-2, 42', category: 'OT' },
  
  // Exile
  { id: 'fiery_furnace', title: 'The Fiery Furnace', reference: 'Daniel 3', category: 'OT' },
  { id: 'writing_wall', title: 'Writing on the Wall', reference: 'Daniel 5', category: 'OT' },
  { id: 'daniel_lions', title: 'Daniel in the Lions\' Den', reference: 'Daniel 6', category: 'OT' },
  { id: 'ezra_reading', title: 'Ezra Reads the Law', reference: 'Nehemiah 8', category: 'OT' },
  { id: 'nehemiah_wall', title: 'Nehemiah Rebuilds Walls', reference: 'Nehemiah 1-6', category: 'OT' },
  { id: 'jonah', title: 'Jonah and the Whale', reference: 'Jonah 1-2', category: 'OT' },
  
  // New Testament - Gospels
  { id: 'nativity', title: 'The Birth of Jesus', reference: 'Luke 2:1-20', category: 'NT' },
  { id: 'magi', title: 'The Wise Men', reference: 'Matthew 2:1-12', category: 'NT' },
  { id: 'boy_jesus', title: 'Boy Jesus at Temple', reference: 'Luke 2:41-52', category: 'NT' },
  { id: 'baptism', title: 'Baptism of Jesus', reference: 'Matthew 3', category: 'NT' },
  { id: 'temptation', title: 'Temptation in Wilderness', reference: 'Matthew 4:1-11', category: 'NT' },
  { id: 'wedding_cana', title: 'Water into Wine', reference: 'John 2:1-11', category: 'NT' },
  { id: 'nicodemus', title: 'Jesus and Nicodemus', reference: 'John 3:1-21', category: 'NT' },
  { id: 'samaritan_woman', title: 'Woman at the Well', reference: 'John 4:1-42', category: 'NT' },
  { id: 'pool_bethesda', title: 'Healing at Bethesda', reference: 'John 5:1-15', category: 'NT' },
  { id: 'calming_storm', title: 'Calming the Storm', reference: 'Mark 4:35-41', category: 'NT' },
  { id: 'legion', title: 'Jesus Heals Demon-Possessed', reference: 'Mark 5:1-20', category: 'NT' },
  { id: 'jairus_daughter', title: 'Jairus\' Daughter', reference: 'Mark 5:21-43', category: 'NT' },
  { id: 'feeding_5000', title: 'Feeding the 5000', reference: 'John 6:1-14', category: 'NT' },
  { id: 'walking_water', title: 'Walking on Water', reference: 'Matthew 14:22-33', category: 'NT' },
  { id: 'syrophoenician', title: 'Syrophoenician Woman', reference: 'Mark 7:24-30', category: 'NT' },
  { id: 'transfiguration', title: 'The Transfiguration', reference: 'Matthew 17:1-9', category: 'NT' },
  { id: 'good_samaritan', title: 'The Good Samaritan', reference: 'Luke 10:25-37', category: 'NT' },
  { id: 'mary_martha', title: 'Mary and Martha', reference: 'Luke 10:38-42', category: 'NT' },
  { id: 'prodigal_son', title: 'The Prodigal Son', reference: 'Luke 15:11-32', category: 'NT' },
  { id: 'ten_lepers', title: 'The Ten Lepers', reference: 'Luke 17:11-19', category: 'NT' },
  { id: 'pharisee_tax', title: 'Pharisee and Tax Collector', reference: 'Luke 18:9-14', category: 'NT' },
  { id: 'rich_young_ruler', title: 'Rich Young Ruler', reference: 'Mark 10:17-31', category: 'NT' },
  { id: 'lazarus', title: 'Raising of Lazarus', reference: 'John 11', category: 'NT' },
  { id: 'zacchaeus', title: 'Zacchaeus the Tax Collector', reference: 'Luke 19:1-10', category: 'NT' },
  { id: 'widows_mite', title: 'The Widow\'s Mite', reference: 'Mark 12:41-44', category: 'NT' },
  { id: 'triumphal_entry', title: 'The Triumphal Entry', reference: 'Matthew 21:1-11', category: 'NT' },
  { id: 'money_changers', title: 'Cleansing the Temple', reference: 'Matthew 21:12-17', category: 'NT' },
  { id: 'last_supper', title: 'The Last Supper', reference: 'Luke 22:7-38', category: 'NT' },
  { id: 'gesthemane', title: 'Garden of Gethsemane', reference: 'Matthew 26:36-56', category: 'NT' },
  { id: 'peter_denial', title: 'Peter\'s Denial', reference: 'Luke 22:54-62', category: 'NT' },
  { id: 'crucifixion', title: 'The Crucifixion', reference: 'Luke 23:26-49', category: 'NT' },
  { id: 'thief_cross', title: 'The Thief on the Cross', reference: 'Luke 23:39-43', category: 'NT' },
  { id: 'resurrection', title: 'The Resurrection', reference: 'John 20', category: 'NT' },
  { id: 'emmaus', title: 'Road to Emmaus', reference: 'Luke 24:13-35', category: 'NT' },
  { id: 'doubting_thomas', title: 'Doubting Thomas', reference: 'John 20:24-29', category: 'NT' },
  { id: 'peter_restoration', title: 'Peter\'s Restoration', reference: 'John 21:15-19', category: 'NT' },
  { id: 'ascension', title: 'The Ascension', reference: 'Acts 1:1-11', category: 'NT' },
  
  // Early Church
  { id: 'pentecost', title: 'Day of Pentecost', reference: 'Acts 2', category: 'NT' },
  { id: 'lame_beggar', title: 'Peter Heals Lame Beggar', reference: 'Acts 3:1-10', category: 'NT' },
  { id: 'ananias', title: 'Ananias and Sapphira', reference: 'Acts 5:1-11', category: 'NT' },
  { id: 'stephen', title: 'Stoning of Stephen', reference: 'Acts 7', category: 'NT' },
  { id: 'philip_ethiopian', title: 'Philip and Ethiopian', reference: 'Acts 8:26-40', category: 'NT' },
  { id: 'saul_conversion', title: 'Conversion of Saul', reference: 'Acts 9:1-19', category: 'NT' },
  { id: 'dorcas', title: 'Peter Raises Dorcas', reference: 'Acts 9:36-43', category: 'NT' },
  { id: 'peter_cornelius', title: 'Peter and Cornelius', reference: 'Acts 10', category: 'NT' },
  { id: 'peter_escape', title: 'Peter Escapes Prison', reference: 'Acts 12:1-19', category: 'NT' },
  { id: 'paul_barnabas', title: 'Paul and Barnabas', reference: 'Acts 13-14', category: 'NT' },
  { id: 'council_jerusalem', title: 'Council at Jerusalem', reference: 'Acts 15', category: 'NT' },
  { id: 'lydia', title: 'Lydia\'s Conversion', reference: 'Acts 16:11-15', category: 'NT' },
  { id: 'paul_silas', title: 'Paul and Silas in Prison', reference: 'Acts 16:16-40', category: 'NT' },
  { id: 'paul_athens', title: 'Paul in Athens', reference: 'Acts 17:16-34', category: 'NT' },
  { id: 'priscilla_aquila', title: 'Priscilla and Aquila', reference: 'Acts 18:1-4, 24-28', category: 'NT' },
  { id: 'ephesus_riot', title: 'Riot in Ephesus', reference: 'Acts 19:23-41', category: 'NT' },
  { id: 'eutychus', title: 'Eutychus Raised', reference: 'Acts 20:7-12', category: 'NT' },
  { id: 'shipwreck', title: 'Paul\'s Shipwreck', reference: 'Acts 27', category: 'NT' },
  { id: 'paul_rome', title: 'Paul in Rome', reference: 'Acts 28', category: 'NT' },
];

export const getSmartRandomStory = (): BibleStory => {
  // 1. Get Read History (IDs of stories generated via this button)
  let readIds: string[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_READ_STORIES);
    readIds = stored ? JSON.parse(stored) : [];
  } catch (e) {
    readIds = [];
  }

  // 2. Get Favorites (Best effort check from local storage to avoid duplicates)
  // We try to match story references to favorited references
  let favoriteRefs: string[] = [];
  try {
    // Check both guest and potential mock cloud keys
    const localFavs = localStorage.getItem('lumina_favorites');
    const cloudFavs = localStorage.getItem('lumina_cloud_mock_favs');
    
    const extractRefs = (json: string | null) => {
        if (!json) return [];
        const parsed = JSON.parse(json);
        return parsed.map((f: any) => f.verseReference);
    };

    favoriteRefs = [...extractRefs(localFavs), ...extractRefs(cloudFavs)];
  } catch (e) {
    // ignore
  }

  // 3. Filter stories
  // Exclude if ID is in readIds OR if the story reference is in favorites
  let availableStories = BIBLE_STORIES.filter(s => {
    const isRead = readIds.includes(s.id);
    // Loose check: if the story reference is exactly in favorites, or if the title is in favorites
    // This is an approximation.
    const isFavorited = favoriteRefs.some(ref => ref && (ref.includes(s.reference) || ref.includes(s.title)));
    
    return !isRead && !isFavorited;
  });

  // 4. Reset if all have been read/favorited
  if (availableStories.length === 0) {
    // If exhausted, we reset the "read" history, but we still try to respect favorites if possible
    // unless EVERYTHING is favorited, then we just reset to full list.
    
    readIds = [];
    localStorage.removeItem(STORAGE_KEY_READ_STORIES);
    
    // Try filtering only by favorites
    availableStories = BIBLE_STORIES.filter(s => {
         const isFavorited = favoriteRefs.some(ref => ref && (ref.includes(s.reference) || ref.includes(s.title)));
         return !isFavorited;
    });

    // If still empty (user favorited EVERYTHING), just use full list
    if (availableStories.length === 0) {
        availableStories = [...BIBLE_STORIES];
    }
  }

  // 5. Pick random
  const randomIndex = Math.floor(Math.random() * availableStories.length);
  const selectedStory = availableStories[randomIndex];

  // 6. Mark as read (add ID to list)
  readIds.push(selectedStory.id);
  localStorage.setItem(STORAGE_KEY_READ_STORIES, JSON.stringify(readIds));

  return selectedStory;
};

// Returns a few static featured stories for the presets
export const getFeaturedStories = (): BibleStory[] => {
    // A mix of popular ones
    const featuredIds = ['david_goliath', 'jonah', 'prodigal_son', 'good_samaritan', 'daniel_lions'];
    return BIBLE_STORIES.filter(s => featuredIds.includes(s.id));
};

export const PRAYER_CHARACTERS = [
  // Old Testament - Patriarchs & Matriarchs
  "Adam", "Eve", "Enoch", "Noah", "Job", "Abraham", "Sarah", "Hagar", "Isaac", "Rebekah", 
  "Jacob", "Leah", "Rachel", "Joseph", "Judah", "Tamar",
  
  // Exodus & Wilderness
  "Moses", "Aaron", "Miriam", "Jochebed", "Zipporah", "Jethro", "Caleb", "Joshua", "Phinehas",
  
  // Judges & Kings
  "Rahab", "Deborah", "Jael", "Gideon", "Samson", "Manoah", "Ruth", "Naomi", "Boaz", 
  "Hannah", "Samuel", "Eli", "Saul", "Jonathan", "David", "Abigail", "Bathsheba", 
  "Solomon", "Queen of Sheba", "Rehoboam", "Asa", "Jehoshaphat", "Hezekiah", "Josiah", 
  "Manasseh (Repentant)", "Zerubbabel",
  
  // Prophets
  "Elijah", "Elisha", "The Shunammite Woman", "Naaman's Servant Girl", "Isaiah", 
  "Jeremiah", "Baruch", "Ebed-Melech", "Ezekiel", "Daniel", "Shadrach", "Meshach", 
  "Abednego", "Hosea", "Gomer", "Joel", "Amos", "Obadiah", "Jonah", "Micah", 
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  
  // Exile & Return
  "Esther", "Mordecai", "Nehemiah", "Ezra", 
  
  // New Testament - Gospels
  "Mary (Mother of Jesus)", "Joseph (Earthly Father)", "John the Baptist", "Elizabeth", 
  "Zechariah (Father of John)", "Simeon", "Anna", "Peter", "Andrew", "James", "John", 
  "Matthew", "Thomas", "Philip", "Bartholomew", "Simon the Zealot", "Judas (Not Iscariot)", 
  "Nathanael", "Nicodemus", "Joseph of Arimathea", "The Samaritan Woman", "The Centurion", 
  "Jairus", "The Woman with the Issue of Blood", "Bartimaeus", "Zacchaeus", 
  "Mary of Bethany", "Martha", "Lazarus", "Mary Magdalene", "Salome", "Joanna", "Susanna",
  "The Syrophoenician Woman", "The Widow with Two Mites", "The Thief on the Cross",
  
  // Acts & Early Church
  "Stephen", "Philip the Evangelist", "The Ethiopian Eunuch", "Cornelius", "Barnabas", 
  "Paul", "Silas", "Timothy", "Titus", "Luke", "Mark", "Lydia", "The Jailer at Philippi", 
  "Priscilla", "Aquila", "Apollos", "Philemon", "Onesimus", "James (Brother of Jesus)", 
  "Jude", "Tabitha (Dorcas)", "Rhoda", "Gamaliel", "Phoebe", "Euodia", "Syntyche", 
  "Epaphroditus", "Gaius", "Demetrius"
];

export const PRAYER_THEMES = [
  "Strength in Adversity",
  "Gratitude and Joy",
  "Guidance and Wisdom",
  "Healing and Restoration",
  "Forgiveness and Grace",
  "Peace in Chaos",
  "Courage to Act",
  "Hope in Darkness",
  "Patience and Waiting",
  "Love and Compassion",
  "Humility and Service",
  "Faith and Trust",
  "Protection and Safety",
  "Purpose and Calling",
  "Comfort in Grief",
  "Renewal and New Beginnings",
  "Justice and Righteousness",
  "Unity and Community",
  "Overcoming Fear",
  "Surrender and Obedience"
];
