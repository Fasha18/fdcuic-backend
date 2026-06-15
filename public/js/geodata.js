// ── Countries & Regions Data (Cascading) ──
const GeoData = {
  countries: {
    "Sénégal": ["Dakar","Diourbel","Fatick","Kaffrine","Kaolack","Kédougou","Kolda","Louga","Matam","Saint-Louis","Sédhiou","Tambacounda","Thiès","Ziguinchor"],
    "France": ["Île-de-France","Auvergne-Rhône-Alpes","Provence-Alpes-Côte d'Azur","Occitanie","Nouvelle-Aquitaine","Bretagne","Normandie","Hauts-de-France","Grand Est","Pays de la Loire","Bourgogne-Franche-Comté","Centre-Val de Loire","Corse"],
    "Maroc": ["Casablanca-Settat","Rabat-Salé-Kénitra","Tanger-Tétouan-Al Hoceïma","Fès-Meknès","Marrakech-Safi","Souss-Massa","Oriental","Drâa-Tafilalet","Béni Mellal-Khénifra","Laâyoune-Sakia El Hamra","Guelmim-Oued Noun","Dakhla-Oued Ed-Dahab"],
    "Côte d'Ivoire": ["Abidjan","Yamoussoukro","Bouaké","San-Pédro","Daloa","Korhogo","Man","Gagnoa","Abengourou","Divo"],
    "Mali": ["Bamako","Kayes","Koulikoro","Sikasso","Ségou","Mopti","Tombouctou","Gao","Kidal","Ménaka","Taoudénit"],
    "Burkina Faso": ["Centre","Boucle du Mouhoun","Cascades","Centre-Est","Centre-Nord","Centre-Ouest","Centre-Sud","Est","Hauts-Bassins","Nord","Plateau-Central","Sahel","Sud-Ouest"],
    "Guinée": ["Conakry","Kindia","Boké","Mamou","Labé","Faranah","Kankan","Nzérékoré"],
    "Cameroun": ["Centre","Littoral","Ouest","Nord-Ouest","Sud-Ouest","Adamaoua","Est","Extrême-Nord","Nord","Sud"],
    "Tunisie": ["Tunis","Ariana","Ben Arous","Manouba","Sfax","Sousse","Monastir","Mahdia","Kairouan","Bizerte","Béja","Jendouba","Le Kef","Siliana","Gabès","Médenine","Tataouine","Gafsa","Tozeur","Kébili","Nabeul","Zaghouan","Sidi Bouzid","Kasserine"],
    "Algérie": ["Alger","Oran","Constantine","Annaba","Blida","Batna","Sétif","Tlemcen","Béjaïa","Djelfa","Biskra","Médéa","Mostaganem","Tizi Ouzou","Chlef"],
    "Belgique": ["Bruxelles-Capitale","Flandre","Wallonie"],
    "Canada": ["Québec","Ontario","Colombie-Britannique","Alberta","Manitoba","Saskatchewan","Nouvelle-Écosse","Nouveau-Brunswick","Terre-Neuve-et-Labrador","Île-du-Prince-Édouard"],
    "Suisse": ["Genève","Vaud","Zurich","Berne","Bâle-Ville","Fribourg","Valais","Neuchâtel","Jura","Tessin"],
    "États-Unis": ["New York","Californie","Texas","Floride","Illinois","Pennsylvanie","Ohio","Géorgie","Caroline du Nord","Michigan","New Jersey","Virginie","Washington","Massachusetts","Arizona"],
    "Allemagne": ["Berlin","Bavière","Bade-Wurtemberg","Rhénanie-du-Nord-Westphalie","Hesse","Saxe","Basse-Saxe","Hambourg","Brême","Brandebourg"],
    "Espagne": ["Madrid","Catalogne","Andalousie","Valence","Galice","Pays basque","Castille-et-León","Îles Canaries","Aragon","Murcie"],
    "Italie": ["Lombardie","Latium","Campanie","Sicile","Vénétie","Piémont","Émilie-Romagne","Toscane","Pouilles","Calabre"],
    "Royaume-Uni": ["Angleterre","Écosse","Pays de Galles","Irlande du Nord"],
    "Brésil": ["São Paulo","Rio de Janeiro","Bahia","Minas Gerais","Pernambuco","Ceará","Rio Grande do Sul","Paraná","Amazonas","Pará"],
    "Japon": ["Tokyo","Osaka","Kyoto","Hokkaido","Okinawa","Fukuoka","Hiroshima","Nagoya"],
    "Chine": ["Pékin","Shanghai","Canton","Shenzhen","Chengdu","Hangzhou","Wuhan","Xi'an"],
    "Inde": ["Delhi","Mumbai","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Jaipur"],
    "Afrique du Sud": ["Gauteng","Cap-Occidental","KwaZulu-Natal","Cap-Oriental","État-Libre","Mpumalanga","Limpopo","Nord-Ouest","Cap-Nord"],
    "Nigeria": ["Lagos","Abuja","Kano","Rivers","Oyo","Kaduna","Enugu","Anambra","Delta","Ogun"],
    "Ghana": ["Greater Accra","Ashanti","Western","Eastern","Northern","Central","Volta","Upper East","Upper West","Bono"],
    "Togo": ["Maritime","Plateaux","Centrale","Kara","Savanes"],
    "Bénin": ["Littoral","Atlantique","Ouémé","Zou","Borgou","Alibori","Collines","Atacora","Donga","Mono","Couffo","Plateau"],
    "Niger": ["Niamey","Agadez","Diffa","Dosso","Maradi","Tahoua","Tillabéri","Zinder"],
    "Mauritanie": ["Nouakchott","Nouadhibou","Assaba","Brakna","Gorgol","Guidimaka","Hodh Ech Chargui","Hodh El Gharbi","Inchiri","Tagant","Tiris Zemmour","Trarza","Adrar"],
    "Congo (RDC)": ["Kinshasa","Lubumbashi","Mbuji-Mayi","Kisangani","Kananga","Bukavu","Goma","Matadi"],
    "Congo (Brazzaville)": ["Brazzaville","Pointe-Noire","Dolisie","Nkayi","Ouesso"],
    "Gabon": ["Estuaire","Haut-Ogooué","Moyen-Ogooué","Ngounié","Nyanga","Ogooué-Ivindo","Ogooué-Lolo","Ogooué-Maritime","Woleu-Ntem"],
    "Madagascar": ["Analamanga","Vakinankaratra","Haute Matsiatra","Atsinanana","Boeny","Diana","SAVA"],
    "Rwanda": ["Kigali","Est","Nord","Ouest","Sud"],
    "Autre": ["Autre région"]
  },

  getCountries() {
    return Object.keys(this.countries).sort();
  },

  getRegions(country) {
    return this.countries[country] || [];
  }
};

window.GeoData = GeoData;
