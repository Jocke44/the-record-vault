export interface Track {
  number: number;
  title: string;
}

export type AlbumFormat = "Vinyl" | "CD" | "EP";

export interface Album {
  id: string;
  title: string;
  year: number;
  format: AlbumFormat;
  tracks: Track[];
  coverImage?: string;
}

export interface Band {
  id: string;
  name: string;
  albums: Album[];
  coverImage?: string;
}

export const musicCollection: Band[] = [
  {
    id: "bad-religion",
    name: "Bad Religion",
    albums: [
      {
        id: "age-of-unreason",
        title: "Age of Unreason",
        year: 2019,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Chaos From Within" },
          { number: 2, title: "Lose Your Head" },
          { number: 3, title: "End of History" },
          { number: 4, title: "Age of Unreason" },
          { number: 5, title: "Candidate" },
          { number: 6, title: "Faces of Grief" },
          { number: 7, title: "Old Regime" },
          { number: 8, title: "My Sanity" },
          { number: 9, title: "Do the Paranoid Style" },
          { number: 10, title: "The Approach" },
          { number: 11, title: "Since Now" },
          { number: 12, title: "What Tomorrow Brings" },
          { number: 13, title: "Big Black Dog" },
          { number: 14, title: "Downfall" },
        ],
      },
    ],
  },
  {
    id: "graveyard",
    name: "Graveyard",
    albums: [
      {
        id: "peace",
        title: "Peace",
        year: 2018,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Cold Love" },
          { number: 2, title: "Please Don't" },
          { number: 3, title: "It Ain't Over Yet" },
          { number: 4, title: "See the Day" },
          { number: 5, title: "Bird of Paradise" },
          { number: 6, title: "A Sign of Peace" },
          { number: 7, title: "Low (I Wouldn't Mind)" },
          { number: 8, title: "Walk On" },
          { number: 9, title: "Bukowski" },
          { number: 10, title: "The Fox" },
        ],
      },
    ],
  },
  {
    id: "pearl-jam",
    name: "Pearl Jam",
    albums: [
      {
        id: "ten",
        title: "Ten",
        year: 1991,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Once" },
          { number: 2, title: "Even Flow" },
          { number: 3, title: "Alive" },
          { number: 4, title: "Why Go" },
          { number: 5, title: "Black" },
          { number: 6, title: "Jeremy" },
          { number: 7, title: "Oceans" },
          { number: 8, title: "Porch" },
          { number: 9, title: "Garden" },
          { number: 10, title: "Deep" },
          { number: 11, title: "Release" },
        ],
      },
    ],
  },
  {
    id: "down",
    name: "Down",
    albums: [
      {
        id: "nola",
        title: "NOLA",
        year: 1995,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Temptation's Wings" },
          { number: 2, title: "Lifer" },
          { number: 3, title: "Pillars of Eternity" },
          { number: 4, title: "Rehab" },
          { number: 5, title: "Hail the Leaf" },
          { number: 6, title: "Underneath Everything" },
          { number: 7, title: "Eyes of the South" },
          { number: 8, title: "Jail" },
          { number: 9, title: "Bury Me in Smoke" },
          { number: 10, title: "Stone the Crow" },
          { number: 11, title: "Pray for the Locust" },
          { number: 12, title: "Swan Song" },
        ],
      },
    ],
  },
  {
    id: "katatonia",
    name: "Katatonia",
    albums: [
      {
        id: "sky-void-of-stars",
        title: "Sky Void of Stars",
        year: 2023,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Austerity" },
          { number: 2, title: "Colossal Shade" },
          { number: 3, title: "Opaline" },
          { number: 4, title: "Birds" },
          { number: 5, title: "Author" },
          { number: 6, title: "Atrium" },
          { number: 7, title: "No Beacon to Illuminate" },
          { number: 8, title: "Drab Moon" },
          { number: 9, title: "Impermanence" },
          { number: 10, title: "Sclera" },
          { number: 11, title: "Absconder" },
        ],
      },
    ],
  },
  {
    id: "greta-van-fleet",
    name: "Greta Van Fleet",
    albums: [
      {
        id: "starcatcher",
        title: "Starcatcher",
        year: 2023,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Fate of the Faithful" },
          { number: 2, title: "The Falling Sky" },
          { number: 3, title: "Starcatcher" },
          { number: 4, title: "Sacred the Thread" },
          { number: 5, title: "Meeting the Master" },
          { number: 6, title: "Frozen Light" },
          { number: 7, title: "Waited All Your Life" },
          { number: 8, title: "The Indigo Streak" },
          { number: 9, title: "Farewell for Now" },
        ],
      },
    ],
  },
  {
    id: "clutch",
    name: "Clutch",
    albums: [
      {
        id: "sunrise-on-slaughter-beach",
        title: "Sunrise on Slaughter Beach",
        year: 2022,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Red Alert (Boss Metal Zone)" },
          { number: 2, title: "Slaughter Beach" },
          { number: 3, title: "We Strive for Excellence" },
          { number: 4, title: "Mountain of Bone" },
          { number: 5, title: "Mercy Brown" },
          { number: 6, title: "Skeletons on Mars" },
          { number: 7, title: "Nosferatu Madre" },
          { number: 8, title: "Jackhammer Our Names" },
          { number: 9, title: "Fumbling the Cap" },
          { number: 10, title: "Stiffed" },
        ],
      },
    ],
  },
  {
    id: "wormwood",
    name: "Wormwood",
    albums: [
      {
        id: "the-star",
        title: "The Star",
        year: 2024,
        format: "Vinyl",
        tracks: [
          { number: 1, title: "Stjärnfall" },
          { number: 2, title: "A Distant Glow" },
          { number: 3, title: "Liminal" },
          { number: 4, title: "Galactic Blood" },
          { number: 5, title: "Thousand Doorless Rooms" },
          { number: 6, title: "Suffer Existence" },
          { number: 7, title: "Ro" },
        ],
      },
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    albums: [
      {
        id: "lifesblood",
        title: "Lifesblood",
        year: 2001,
        format: "EP",
        tracks: [
          { number: 1, title: "Lifesblood" },
          { number: 2, title: "Welcoming War" },
          { number: 3, title: "We Built This Come Death" },
          { number: 4, title: "Battle at Sea" },
        ],
      },
    ],
  },
  {
    id: "tool",
    name: "Tool",
    albums: [
      {
        id: "lateralus",
        title: "Lateralus",
        year: 2001,
        format: "CD",
        tracks: [
          { number: 1, title: "The Grudge" },
          { number: 2, title: "Eon Blue Apocalypse" },
          { number: 3, title: "The Patient" },
          { number: 4, title: "Mantra" },
          { number: 5, title: "Schism" },
          { number: 6, title: "Parabol" },
          { number: 7, title: "Parabola" },
          { number: 8, title: "Ticks & Leeches" },
          { number: 9, title: "Lateralus" },
          { number: 10, title: "Disposition" },
          { number: 11, title: "Reflection" },
          { number: 12, title: "Triad" },
          { number: 13, title: "Faaip de Oiad" },
        ],
      },
    ],
  },
];
