import os

f1 = r'c:\Users\HP\StudioProjects\flutter_application_1\lib\screens\dossiers\formulaire\appel_projet\etape1_infos.dart'
with open(f1, 'r', encoding='utf-8') as f:
    c1 = f.read()

c1 = c1.replace("FDLabel('Secteur d'activité')", "FDLabel('Secteur d\\'activité')")
c1 = c1.replace("FDChampTexte('Activité de l'entreprise', _activiteCtrl, 'Décrivez l'activité principale de votre structure...')", "FDChampTexte('Activité de l\\'entreprise', _activiteCtrl, 'Décrivez l\\'activité principale de votre structure...')")

with open(f1, 'w', encoding='utf-8') as f:
    f.write(c1)

f2 = r'c:\Users\HP\StudioProjects\flutter_application_1\lib\screens\dossiers\formulaire\appel_projet\etape2_details.dart'
with open(f2, 'r', encoding='utf-8') as f:
    c2 = f.read()

c2 = c2.replace("FDChampTexte('Impacts économiques', _impactsCtrl, 'Création ou renforcement d'emplois attendus...')", "FDChampTexte('Impacts économiques', _impactsCtrl, 'Création ou renforcement d\\'emplois attendus...')")
c2 = c2.replace("Text('Ajoutez au moins 1 membre d'équipe.'", "Text('Ajoutez au moins 1 membre d\\'équipe.'")

with open(f2, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Fixed quotes in etape1 and etape2.')
