const regions = [
  'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine',
  'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou', 'Kolda', 'Ziguinchor', 'Sédhiou'
];

const pays = [
  'Sénégal', 'Mali', 'Côte d\'Ivoire', 'Guinée', 'Mauritanie', 'Gambie', 'France', 'Maroc', 'Tunisie', 'Algérie', 'Canada', 'États-Unis', 'Belgique', 'Suisse'
];

exports.getRegions = (req, res) => {
  try {
    res.status(200).json({ regions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPays = (req, res) => {
  try {
    res.status(200).json({ pays });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
