/* ============================================================
   MISSION CONFIG  —  edit this file to update the facts.
   Anything marked TODO is a guess or a blank you should fill in.
   ============================================================ */

window.MISSION = {

  missionary: {
    firstName: "Tyler",
    lastName: "Waters",
    title: "Elder",
    get fullName() { return this.title + " " + this.firstName + " " + this.lastName; },
    email: "tyler.waters@missionary.org",
    portrait: "photos/tyler.jpg",            // drop his mission photo here
    tagline: "Two years sharing the gospel under the bright sun of northeast Brazil.",
    homeWard: "Axtell",
    farewellDate: ""                         // TODO: optional, YYYY-MM-DD
  },

  mission: {
    name: "Brazil Natal Mission",
    shortName: "Natal",
    country: "Brazil",
    language: "Portuguese",
    languageNative: "Português",
    presidentName: "President Allen C. Ostergar III and Sister Cathy Ostergar",
    // The Mission page's "mission president" section. bio is in our own words from
    // the source; the section stays hidden while names or bio are empty.
    // Tyler's mission is over, so this is the couple who led it for most of his time there
    // (Nov 2023 – June 2025). The Generosos took over in July 2025, for his last few months.
    president: {
      names: "President Allen C. Ostergar III and Sister Cathy Ostergar",
      since: "2022-07-01",                   // began July 2022 (Church News, March 2022)
      until: "2025-06-30",                   // succeeded by the Generosos on or about July 1, 2025
      photo: "",                             // optional: a photo of them, e.g. one he sends
      bio: [
        "President and Sister Ostergar came to Natal from the Capistrano Ward in the San Clemente California Stake, and they have five children. They led the mission for nearly all of Tyler's time there, from before he arrived in November 2023 until July 2025.",
        "President Ostergar was born in Provo, Utah, and served his own mission in the Brazil Brasília Mission. He has been a seminary teacher, a counselor in a stake presidency, a bishop, a high councilor and a ward mission leader. Sister Ostergar was born in Long Beach, California. She has served as a ward Relief Society president, a ward Young Women president and a counselor in a stake Young Women presidency.",
        "For Tyler's last few months, President João C. Generoso and Sister Suellen H. Generoso of Ponta Grossa, Brazil, led the mission."
      ],
      source: { label: "Church News", url: "https://www.thechurchnews.com/callings/2022-03-04/new-mission-leaders-will-serve-in-ecuador-brazil-bolivia-mexico-argentina-philippines-244515" }
    },
    officeAddress: [                         // TODO: confirm the full street address from the mission office
      "Brazil Natal Mission",
      "Brazil"
    ],
    mapCenter: [-5.795, -35.209],            // Natal, Rio Grande do Norte
    mapZoom: 7,
    // Rough box around Rio Grande do Norte, where the mission is centred.
    // Decorative only.
    boundsHint: [[-4.8, -38.6], [-7.0, -34.9]]
  },

  dates: {
    mtcStart: "2023-10-08",                  // entered the Provo MTC
    manilaMtcStart: "",                      // no second MTC known; set this only if he goes to one (key name kept for the code)
    fieldStart: "2023-11-24",                // arrives in the field
    release: "2025-09-22",                   // expected release / homecoming
    transferLength: 6                        // weeks per transfer
  },

  links: {
    // The shared album he links in his emails
    googlePhotos: ""                         // TODO: add the Google Photos album link when there is one
  },

  /* ------------------------------------------------------------
     GOOGLE MAPS
     Paste your Maps JavaScript API key below and the map page turns
     on. See "Setting up the map" in README.md for how to get one.
     Until a key is here, the page shows a friendly notice instead of
     a broken map. The key is visible in the page source — that is
     normal for Google Maps — so restrict it by website in the Google
     Cloud console once the site is deployed.
     ------------------------------------------------------------ */
  maps: {
    apiKey: "AIzaSyAFgOVCbW4-VKrasthQZ4g2PvMfPcQm0J4",           // <-- paste the key between the quotes
    defaultZoom: 17,      // how close the map starts. 15 = neighbourhood, 18 = rooftops
    mapType: "hybrid"     // "hybrid" = satellite with street names, "satellite" = imagery only
  },

  /* ------------------------------------------------------------
     AREAS — add a new entry every time he gets transferred.
     Set `current: true` on exactly one, and give the previous one
     an `end` date. Look up lat/lng by searching the town on
     Google Maps and copying the two numbers from the URL.
     ------------------------------------------------------------ */
  areas: [
    {
      name: "Provo MTC",
      region: "Provo, Utah, USA",
      type: "mtc",
      start: "2023-10-08",
      end: "2023-11-24",                     // left for Brazil (fieldStart)
      lat: 40.259166,
      lng: -111.645602,
      zoom: 17,                              // optional: overrides maps.defaultZoom for this area
      companion: "",
      note: "",
      current: false                         // he's home; his field areas get added as past letters are imported

    }
  ]
};
