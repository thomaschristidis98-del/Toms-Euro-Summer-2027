// Photo registry. Every photo on the site comes from this file.
//
// All entries are files on Wikimedia Commons, which only hosts freely licensed
// or public-domain media. Author and licence are read live from the Commons API
// (see src/lib/commons.js) and shown in the lightbox and the credits section, with
// a link to each file page. Run `npm run verify:photos` to confirm every file
// still exists and to write the resolved author/licence into photo-credits.json.
//
// verified:
//   'title'  – the Commons file title or category names the subject and place.
//   'visual' – someone has also looked at the image and confirmed it. Change an
//              entry to 'visual' once you've checked it on the #owner review page.
//
// To use your own photo instead, set `src` to a path in /public (e.g.
// '/photos/kotor/bay.jpg') and fill in `credit` and `license` yourself.

const C = (file, o) => ({ file, source: 'Wikimedia Commons', verified: 'title', ...o });

export const photos = {
  // ── Home & finale ────────────────────────────────────────────────
  'home-hero': C('Albanian_Riviera_from_Llogara_Pass_2015-09-22_(banner).jpg', {
    alt: 'The Albanian Riviera coastline seen from the Llogara Pass, with turquoise sea below green mountains',
    caption: 'The Albanian Riviera from the Llogara Pass',
  }),
  'finale-greece': C('Palaiokastritsa_coast,_Corfu,_Greece.jpg', {
    alt: 'Rocky coves and clear Ionian water along the Paleokastritsa coast of Corfu',
    caption: 'Paleokastritsa coast, Corfu',
  }),

  // ── Vienna ──────────────────────────────────────────────────────
  'vienna-hero': C('A_view_of_the_Schloss_Schönbrunn_Wien.JPG', {
    alt: 'The yellow baroque façade of Schönbrunn Palace in Vienna',
    caption: 'Schönbrunn Palace',
  }),
  'vienna-schonbrunn': C('Gloriette_-_Schönbrunn_Palace_Garden,_Vienna.jpg', {
    alt: 'The Gloriette colonnade on the hill above the Schönbrunn Palace gardens',
    caption: 'The Gloriette, Schönbrunn gardens',
  }),
  'vienna-stephansdom': C('0181-0183a_-_Wien_-_Stephansdom.jpg', {
    alt: 'St Stephen’s Cathedral in Vienna with its Gothic spire and patterned tiled roof',
    caption: 'St Stephen’s Cathedral',
  }),
  'vienna-centre': C('Hofburg_entrance_Michaelerplatz_Vienna.jpg', {
    alt: 'The domed Michaelertor entrance of the Hofburg on Michaelerplatz, Vienna',
    caption: 'Hofburg, Michaelerplatz',
  }),
  'vienna-cafe': C('Café_Central_interior,_Vienna.jpg', {
    alt: 'Vaulted ceilings and marble columns inside Café Central, Vienna',
    caption: 'Café Central',
  }),

  // ── Kotor ───────────────────────────────────────────────────────
  'kotor-hero': C('Kotor_and_Boka_kotorska_-_view_from_city_wall.jpg', {
    alt: 'Kotor’s terracotta roofs and the Bay of Kotor seen from the city walls',
    caption: 'Kotor and the bay from the city walls',
  }),
  'kotor-bay': C('Bay_of_Kotor_2015.JPG', {
    alt: 'The fjord-like Bay of Kotor surrounded by steep limestone mountains',
    caption: 'Bay of Kotor',
  }),
  'kotor-oldtown': C('The_Arms_Square_in_Kotor_(4).JPG', {
    alt: 'The Square of Arms inside Kotor Old Town with its clock tower',
    caption: 'Square of Arms, Kotor Old Town',
  }),
  'kotor-fortress': C('Castillo_de_San_Juan,_Kotor,_Bahía_de_Kotor,_Montenegro,_2014-04-19,_DD_11.JPG', {
    alt: 'The walls of St John’s Fortress climbing the mountainside above Kotor',
    caption: 'St John’s Fortress (San Giovanni)',
  }),
  'kotor-perast': C('Perast_(51649471846).jpg', {
    alt: 'Stone palaces and church bell tower along the waterfront of Perast',
    caption: 'Perast',
  }),
  'kotor-rocks': C('R.K.C._Gospa_od_Škrpjela,_Perast,_Montenegro.jpg', {
    alt: 'The blue-domed church on the islet of Our Lady of the Rocks off Perast',
    caption: 'Our Lady of the Rocks',
  }),
  'kotor-viewpoint': C('View_of_Kotor_bay_and_old_town.jpg', {
    alt: 'Elevated view over Kotor Old Town and the inner bay with mountains behind',
    caption: 'Bay viewpoint above Kotor',
  }),

  // ── Budva ───────────────────────────────────────────────────────
  'budva-hero': C('View_over_the_Old_Town_of_Budva_from_the_Citadel.jpg', {
    alt: 'Rooftops of Budva Old Town seen from the Citadel walls, with the Adriatic beyond',
    caption: 'Budva Old Town from the Citadel',
  }),
  'budva-oldtown': C('Old_Town_Budva,_Montenegro.jpg', {
    alt: 'Walled Old Town of Budva on its peninsula by the sea',
    caption: 'Budva Old Town',
  }),
  'budva-mogren': C('Budva-Muntenegru.plaja_Mogren.jpg', {
    alt: 'Mogren Beach, a sandy cove below cliffs just west of Budva',
    caption: 'Mogren Beach',
  }),
  'budva-svetistefan': C('Sveti_Stefan,_Montenegro.jpg', {
    alt: 'The fortified island village of Sveti Stefan joined to the coast by a sandy isthmus',
    caption: 'Sveti Stefan',
  }),
  'budva-coast': C('Budva,_view_from_Gospostina.jpg', {
    alt: 'Panorama of Budva and its bay from the hills above the town',
    caption: 'Budva Riviera from above',
  }),
  'budva-night': C('Budva_nocu.jpg', {
    alt: 'Budva lit up at night',
    caption: 'Budva after dark',
  }),

  // ── Shkodër ─────────────────────────────────────────────────────
  'shkoder-hero': C('2013-10-03_View_from_Rozafa_Castle,_Shkodër_0271.jpg', {
    alt: 'View from Rozafa Castle over the rivers and plains around Shkodër',
    caption: 'View from Rozafa Castle',
  }),
  'shkoder-rozafa': C('Rozafat_-_Shkoder,_Albania.jpg', {
    alt: 'Stone walls of Rozafa Castle on its hill above Shkodër',
    caption: 'Rozafa Castle',
  }),
  'shkoder-lake': C('Lake_Shkodër_and_the_City_of_Shkoder_2.jpg', {
    alt: 'Lake Shkodër stretching away from the edge of the city',
    caption: 'Lake Shkodër',
  }),
  'shkoder-street': C('Kolë_Idromeno_Street_in_Shkodër_(2021).jpg', {
    alt: 'The pedestrian Kolë Idromeno street in Shkodër lined with restored houses and cafés',
    caption: 'Kolë Idromeno pedestrian street',
  }),
  'shkoder-architecture': C('Shkodër,_Albania_–_Rruga_Gjuhadol_2018-05_01.jpg', {
    alt: 'Historic houses along Rruga Gjuhadol in Shkodër',
    caption: 'Rruga Gjuhadol',
  }),

  // ── Theth ───────────────────────────────────────────────────────
  'theth-hero': C('Scenery_at_Theth_Village_-_Northern_Albania_-_19_(40927652580).jpg', {
    alt: 'Theth village in its green valley beneath the peaks of the Albanian Alps',
    caption: 'Theth valley',
  }),
  'theth-blueeye': C('Syri_kalter_theth.jpg', {
    alt: 'The turquoise pool of the Blue Eye of Theth (Syri i Kaltër) in the mountains near Kaprre',
    caption: 'Blue Eye of Theth',
  }),
  'theth-grunas': C('Waterfall_of_Grunas_in_Theth.jpg', {
    alt: 'Grunas Waterfall dropping down a rock face near Theth',
    caption: 'Grunas Waterfall',
  }),
  'theth-church': C('Kisha_e_Thethit,_2023.jpg', {
    alt: 'The small stone church of Theth in a meadow below the mountains',
    caption: 'Theth Church',
  }),
  'theth-alps': C('Theth_Radohima_MajaArapit.jpg', {
    alt: 'Radohima ridge and Maja e Harapit peak towering over Theth',
    caption: 'Albanian Alps: Radohima and Maja e Harapit',
  }),
  'theth-valley': C('Qender_Theth,_Albania_-_panoramio_-_Petrit_Gjeçaj.jpg', {
    alt: 'The centre of Theth with scattered stone houses in the valley',
    caption: 'Theth village centre',
  }),
  'theth-pass': C('Buni_i_Thores.jpg', {
    alt: 'Mountain landscape at Buni i Thorës, the high pass on the road into Theth',
    caption: 'Buni i Thorës, on the road into Theth',
  }),

  // ── Tirana ──────────────────────────────────────────────────────
  'tirana-hero': C('Skanderbeg_Square,_Tirana_(49593920957).jpg', {
    alt: 'The wide pedestrian expanse of Skanderbeg Square in Tirana',
    caption: 'Skanderbeg Square',
  }),
  'tirana-square': C('Tirana_-_Skanderbeg_Square_(Sheshi_Skënderbej)_-_by_Pudelek.jpg', {
    alt: 'Skanderbeg Square with the Et’hem Bey Mosque and clock tower',
    caption: 'Skanderbeg Square',
  }),
  'tirana-blloku': C('Ish-Blloku_neighborhood_in_Tirana,_Albania.jpg', {
    alt: 'Street in the Blloku neighbourhood of Tirana',
    caption: 'Blloku',
  }),
  'tirana-streets': C('Streets_of_Tirana_2016.jpg', {
    alt: 'Everyday street life in central Tirana',
    caption: 'Tirana street life',
  }),
  'tirana-bunkart': C("Bunk'Art_1,_Tirana,_Albania_(49768620588).jpg", {
    alt: 'Inside Bunk’Art 1, the Cold War bunker turned museum in Tirana',
    caption: 'Bunk’Art 1',
  }),
  'tirana-colour': C('Painted_buildings_in_Tirana_-_panoramio.jpg', {
    alt: 'Apartment blocks in Tirana painted in bold colours and patterns',
    caption: 'Tirana’s painted buildings',
  }),

  // ── Berat ───────────────────────────────────────────────────────
  'berat-hero': C('Berat_UNESCO_2016_Albania.jpg', {
    alt: 'The white Ottoman houses of Berat stacked up the hillside below the castle',
    caption: 'Berat, UNESCO World Heritage',
  }),
  'berat-castle': C('Kalaja,_Berat.JPG', {
    alt: 'Walls of Berat Castle (Kalaja) on the hilltop above the town',
    caption: 'Berat Castle',
  }),
  'berat-mangalem': C('Berat,_Mangalem_quarter,_Albania.JPG', {
    alt: 'Rows of windowed houses in the Mangalem quarter of Berat',
    caption: 'Mangalem quarter',
  }),
  'berat-gorica': C('Berat_-_Gorica_Bridge_(by_Pudelek).JPG', {
    alt: 'The stone-arched Gorica Bridge across the Osum river in Berat',
    caption: 'Gorica Bridge',
  }),
  'berat-ottoman': C('Mangalem_Berat_Albania_2018.3.jpg', {
    alt: 'Ottoman-era houses with many windows in Mangalem, Berat',
    caption: 'Ottoman houses of Mangalem',
  }),
  'berat-hillside': C('Gorica_Berat_Albania_2018.1.jpg', {
    alt: 'The Gorica quarter’s houses rising up the hillside across the river',
    caption: 'Gorica hillside houses',
  }),

  // ── Himarë ──────────────────────────────────────────────────────
  'himare-hero': C('Himara_Potam_Beach_(2)_(banner).jpg', {
    alt: 'Potam Beach in Himarë with clear turquoise water and pebbles',
    caption: 'Potam Beach, Himarë',
  }),
  'himare-waterfront': C('Himara_2021.jpg', {
    alt: 'The waterfront and bay of Himarë on the Albanian Riviera',
    caption: 'Himarë waterfront',
  }),
  'himare-potam': C('Himara_Potam_Beach_(2).jpg', {
    alt: 'Potam Beach in Himarë with sunbeds and calm sea',
    caption: 'Potam Beach',
  }),
  'himare-livadhi': C('Livadhi_Beach,_Himare_-_2020_July.jpg', {
    alt: 'Livadhi Beach north of Himarë in July',
    caption: 'Livadhi Beach',
  }),
  'himare-gjipe': C('Gjipe_Beach,_Albania.JPG', {
    alt: 'Gjipe Beach at the mouth of a canyon between Himarë and Dhërmi',
    caption: 'Gjipe Beach',
  }),
  'himare-dhermi': C('Dhermi_beach.jpg', {
    alt: 'The long beach at Dhërmi on the Albanian Riviera',
    caption: 'Dhërmi',
  }),
  'himare-palermo': C('Kalaja_e_Porto_Palermos_nga_droni_3_-_Shqipëri.jpg', {
    alt: 'Aerial view of Porto Palermo Castle on its small peninsula',
    caption: 'Porto Palermo Castle',
  }),
  'himare-viewpoint': C('Palasa_Beach_and_Nazar_Beach_seen_from_Llogara_Pass,_Albania.jpg', {
    alt: 'Palasa and Nazar beaches far below the Llogara Pass viewpoint',
    caption: 'Riviera viewpoint, Llogara Pass',
  }),

  // ── Ksamil ──────────────────────────────────────────────────────
  'ksamil-hero': C('Ksamil_albanian_riviera.jpg', {
    alt: 'Turquoise water and small islands at Ksamil on the Albanian Riviera',
    caption: 'Ksamil',
  }),
  'ksamil-islands': C('Ksamil.jpg', {
    alt: 'The small wooded islands just off Ksamil',
    caption: 'Ksamil Islands',
  }),
  'ksamil-beach': C('Ksamil_Beach.jpg', {
    alt: 'A Ksamil beach with white sand and shallow clear water',
    caption: 'Ksamil beaches',
  }),
  'ksamil-butrint': C('Butrint_-_Ancient_amphitheatre_(by_Pudelek).JPG', {
    alt: 'The ancient theatre at Butrint archaeological site',
    caption: 'Butrint’s ancient theatre',
  }),
  'ksamil-swim': C('Ksamil_-_Strand_2.jpg', {
    alt: 'Swimmers in shallow turquoise water at Ksamil',
    caption: 'Swimming in Ksamil',
  }),
  'ksamil-harta': C('Gjiri_i_Hartes,_Ksamil.jpg', {
    alt: 'Harta Bay near Ksamil',
    caption: 'Harta Bay, Ksamil',
  }),
  'ksamil-beachlife': C('Ksamil_-_Strand_7.jpg', {
    alt: 'Sunbeds and umbrellas along the shore at Ksamil',
    caption: 'Beach life in Ksamil',
  }),

  // ── Corfu ───────────────────────────────────────────────────────
  'corfu-hero': C('Bay_of_Palaiokastritsa_from_Bellavista.JPG', {
    alt: 'The bays of Paleokastritsa seen from the Bella Vista viewpoint on Corfu',
    caption: 'Paleokastritsa from Bella Vista',
  }),
  'corfu-oldtown': C('Liston_-_Corfu_Old_Town.jpg', {
    alt: 'The arcaded Liston promenade in Corfu Old Town',
    caption: 'The Liston, Corfu Old Town',
  }),
  'corfu-paleo': C('Corfu_Paleokastritsa_Beach_R01.jpg', {
    alt: 'Paleokastritsa beach with green headlands and clear water',
    caption: 'Paleokastritsa',
  }),
  'corfu-timoni': C('View_of_Porto_Timoni_Beach.jpg', {
    alt: 'Porto Timoni’s twin beaches on either side of a narrow isthmus',
    caption: 'Porto Timoni Beach',
  }),
  'corfu-coast': C('Islet_of_Pontikonisi_and_Vlacherna_Monastery_-_Corfu_-_Ionian_Islands_-_Greece_-_27_May_2011.jpg', {
    alt: 'Vlacherna Monastery and the islet of Pontikonisi in the Ionian Sea off Corfu',
    caption: 'Vlacherna and Pontikonisi',
  }),
};
