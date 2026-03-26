-- Migration: Enrich all 57 recipes with ingredients, steps, prep/cook time, and servings
-- Date: 2026-03-26

BEGIN;

-- ============================================================
-- BREAKFAST (13 recipes)
-- ============================================================

-- 1. Avocat farci aux oeufs
UPDATE recipes SET
  ingredients_fr = '["2 avocats murs", "4 oeufs", "1 c. a soupe d''huile d''olive", "Sel et poivre", "Piment d''Espelette", "Quelques brins de ciboulette"]',
  ingredients_en = '["2 ripe avocados", "4 eggs", "1 tbsp olive oil", "Salt and pepper", "Espelette pepper", "A few chive sprigs"]',
  steps_fr = '["Prechauffer le four a 200C.", "Couper les avocats en deux et retirer le noyau.", "Creuser legerement chaque moitie pour agrandir le trou.", "Casser un oeuf dans chaque moitie d''avocat.", "Enfourner 12 a 15 minutes jusqu''a ce que le blanc soit pris.", "Assaisonner de sel, poivre, piment d''Espelette et ciboulette ciselee."]',
  steps_en = '["Preheat oven to 200C/400F.", "Cut avocados in half and remove the pit.", "Scoop out a bit of flesh to enlarge the hole.", "Crack an egg into each avocado half.", "Bake 12-15 minutes until the whites are set.", "Season with salt, pepper, Espelette pepper and chopped chives."]',
  prep_time_min = 5,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Avocat farci aux oeufs';

-- 2. Bowl acai
UPDATE recipes SET
  ingredients_fr = '["100g de puree d''acai surgelee", "1 banane", "100ml de lait d''amande", "30g de granola", "50g de fruits rouges frais", "1 c. a soupe de graines de chia", "1 c. a cafe de miel"]',
  ingredients_en = '["100g frozen acai puree", "1 banana", "100ml almond milk", "30g granola", "50g fresh mixed berries", "1 tbsp chia seeds", "1 tsp honey"]',
  steps_fr = '["Mixer la puree d''acai avec la moitie de la banane et le lait d''amande.", "Verser dans un bol.", "Couper le reste de la banane en rondelles.", "Disposer les fruits rouges, le granola et les rondelles de banane sur le dessus.", "Saupoudrer de graines de chia et arroser de miel."]',
  steps_en = '["Blend acai puree with half the banana and almond milk.", "Pour into a bowl.", "Slice the remaining banana.", "Top with berries, granola and banana slices.", "Sprinkle with chia seeds and drizzle with honey."]',
  prep_time_min = 10,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Bowl açaï';

-- 3. Oeufs brouilles au bacon
UPDATE recipes SET
  ingredients_fr = '["4 oeufs", "4 tranches de bacon", "1 c. a soupe de beurre", "2 c. a soupe de creme fraiche", "Sel et poivre", "Ciboulette ciselee"]',
  ingredients_en = '["4 eggs", "4 bacon slices", "1 tbsp butter", "2 tbsp heavy cream", "Salt and pepper", "Chopped chives"]',
  steps_fr = '["Faire griller le bacon dans une poele a feu moyen jusqu''a ce qu''il soit croustillant.", "Battre les oeufs avec la creme fraiche, le sel et le poivre.", "Faire fondre le beurre dans une poele a feu doux.", "Verser les oeufs et remuer doucement a la spatule jusqu''a consistance cremeuse.", "Servir les oeufs brouilles avec le bacon et parsemer de ciboulette."]',
  steps_en = '["Cook bacon in a pan over medium heat until crispy.", "Whisk eggs with cream, salt and pepper.", "Melt butter in a pan over low heat.", "Pour in eggs and stir gently with a spatula until creamy.", "Serve scrambled eggs with bacon and sprinkle with chives."]',
  prep_time_min = 5,
  cook_time_min = 10,
  servings = 2
WHERE name_fr = 'Oeufs brouillés au bacon';

-- 4. Oeufs poches toast complet
UPDATE recipes SET
  ingredients_fr = '["2 oeufs frais", "2 tranches de pain complet", "1 c. a cafe de vinaigre blanc", "10g de beurre", "Sel et poivre", "Quelques feuilles de roquette"]',
  ingredients_en = '["2 fresh eggs", "2 slices whole wheat bread", "1 tsp white vinegar", "10g butter", "Salt and pepper", "A few arugula leaves"]',
  steps_fr = '["Porter une casserole d''eau a fremissement et ajouter le vinaigre.", "Creer un tourbillon dans l''eau et y casser delicatement un oeuf.", "Pocher 3 minutes puis retirer avec une ecumoire. Repeter pour le second oeuf.", "Faire griller les tranches de pain et les beurrer.", "Deposer les oeufs poches sur les toasts avec la roquette.", "Assaisonner de sel et poivre."]',
  steps_en = '["Bring a pot of water to a gentle simmer and add vinegar.", "Create a whirlpool in the water and gently crack an egg into it.", "Poach for 3 minutes then remove with a slotted spoon. Repeat for the second egg.", "Toast the bread slices and butter them.", "Place poached eggs on toast with arugula.", "Season with salt and pepper."]',
  prep_time_min = 5,
  cook_time_min = 8,
  servings = 1
WHERE name_fr = 'Oeufs pochés toast complet';

-- 5. Omelette aux legumes
UPDATE recipes SET
  ingredients_fr = '["3 oeufs", "1/2 poivron rouge", "50g de champignons", "1 petite tomate", "30g d''epinards frais", "1 c. a soupe d''huile d''olive", "Sel et poivre", "Herbes de Provence"]',
  ingredients_en = '["3 eggs", "1/2 red bell pepper", "50g mushrooms", "1 small tomato", "30g fresh spinach", "1 tbsp olive oil", "Salt and pepper", "Herbes de Provence"]',
  steps_fr = '["Couper le poivron, les champignons et la tomate en petits des.", "Faire revenir les legumes dans l''huile d''olive 3-4 minutes.", "Battre les oeufs avec le sel, le poivre et les herbes.", "Verser les oeufs sur les legumes et cuire a feu moyen.", "Ajouter les epinards, plier l''omelette en deux quand les bords sont pris.", "Cuire encore 1-2 minutes et servir."]',
  steps_en = '["Dice the bell pepper, mushrooms and tomato.", "Saute vegetables in olive oil for 3-4 minutes.", "Beat eggs with salt, pepper and herbs.", "Pour eggs over vegetables and cook over medium heat.", "Add spinach, fold the omelette in half when edges are set.", "Cook 1-2 more minutes and serve."]',
  prep_time_min = 10,
  cook_time_min = 8,
  servings = 1
WHERE name_fr = 'Omelette aux légumes';

-- 6. Overnight oats fruits rouges
UPDATE recipes SET
  ingredients_fr = '["60g de flocons d''avoine", "150ml de lait d''amande", "80g de yaourt grec", "1 c. a soupe de graines de chia", "80g de fruits rouges (frais ou surgeles)", "1 c. a cafe de miel", "1 c. a cafe d''extrait de vanille"]',
  ingredients_en = '["60g rolled oats", "150ml almond milk", "80g Greek yogurt", "1 tbsp chia seeds", "80g mixed berries (fresh or frozen)", "1 tsp honey", "1 tsp vanilla extract"]',
  steps_fr = '["Melanger les flocons d''avoine, le lait, le yaourt, les graines de chia et la vanille dans un bocal.", "Ajouter le miel et bien remuer.", "Couvrir et placer au refrigerateur toute la nuit (minimum 6h).", "Au matin, melanger et ajouter les fruits rouges sur le dessus.", "Ajouter un filet de miel supplementaire si desire."]',
  steps_en = '["Mix oats, milk, yogurt, chia seeds and vanilla in a jar.", "Add honey and stir well.", "Cover and refrigerate overnight (minimum 6 hours).", "In the morning, stir and top with mixed berries.", "Drizzle with extra honey if desired."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Overnight oats fruits rouges';

-- 7. Pancakes au cream cheese (keto)
UPDATE recipes SET
  ingredients_fr = '["60g de cream cheese (fromage a tartiner)", "3 oeufs", "1 c. a soupe de farine d''amande", "1 c. a cafe d''erythritol", "1/2 c. a cafe de cannelle", "1 c. a soupe de beurre pour la cuisson", "30g de creme fouettee"]',
  ingredients_en = '["60g cream cheese", "3 eggs", "1 tbsp almond flour", "1 tsp erythritol", "1/2 tsp cinnamon", "1 tbsp butter for cooking", "30g whipped cream"]',
  steps_fr = '["Mixer le cream cheese, les oeufs, la farine d''amande, l''erythritol et la cannelle jusqu''a obtenir une pate lisse.", "Faire chauffer le beurre dans une poele a feu moyen.", "Verser des petites louches de pate et cuire 2 minutes par cote.", "Repeter jusqu''a epuisement de la pate.", "Servir avec la creme fouettee."]',
  steps_en = '["Blend cream cheese, eggs, almond flour, erythritol and cinnamon until smooth.", "Heat butter in a pan over medium heat.", "Pour small ladles of batter and cook 2 minutes per side.", "Repeat until all batter is used.", "Serve topped with whipped cream."]',
  prep_time_min = 5,
  cook_time_min = 10,
  servings = 1
WHERE name_fr = 'Pancakes au cream cheese';

-- 8. Pancakes proteines
UPDATE recipes SET
  ingredients_fr = '["1 banane mure", "2 oeufs", "30g de whey proteine vanille", "40g de flocons d''avoine", "1 c. a cafe de levure chimique", "100ml de lait d''amande", "1 c. a cafe d''huile de coco"]',
  ingredients_en = '["1 ripe banana", "2 eggs", "30g vanilla whey protein", "40g rolled oats", "1 tsp baking powder", "100ml almond milk", "1 tsp coconut oil"]',
  steps_fr = '["Mixer la banane, les oeufs, la whey, les flocons d''avoine, la levure et le lait jusqu''a obtenir une pate lisse.", "Faire chauffer l''huile de coco dans une poele antiadhesive.", "Verser des cercles de pate (environ 10cm) et cuire 2-3 minutes par cote.", "Repeter jusqu''a epuisement de la pate.", "Servir avec des fruits frais ou un filet de sirop d''erable."]',
  steps_en = '["Blend banana, eggs, whey, oats, baking powder and milk until smooth.", "Heat coconut oil in a non-stick pan.", "Pour batter circles (about 10cm) and cook 2-3 minutes per side.", "Repeat until all batter is used.", "Serve with fresh fruit or a drizzle of maple syrup."]',
  prep_time_min = 5,
  cook_time_min = 12,
  servings = 2
WHERE name_fr = 'Pancakes protéinés';

-- 9. Porridge banane beurre de cacahuete
UPDATE recipes SET
  ingredients_fr = '["60g de flocons d''avoine", "200ml de lait demi-ecreme", "1 banane mure", "1 c. a soupe de beurre de cacahuete", "1 c. a cafe de miel", "1 pincee de cannelle", "1 c. a soupe de graines de lin"]',
  ingredients_en = '["60g rolled oats", "200ml semi-skimmed milk", "1 ripe banana", "1 tbsp peanut butter", "1 tsp honey", "A pinch of cinnamon", "1 tbsp flax seeds"]',
  steps_fr = '["Verser les flocons d''avoine et le lait dans une casserole.", "Cuire a feu moyen en remuant regulierement pendant 5 minutes.", "Ecraser la moitie de la banane et l''incorporer au porridge.", "Verser dans un bol et ajouter le beurre de cacahuete et le miel.", "Couper le reste de la banane en rondelles et disposer sur le dessus.", "Saupoudrer de cannelle et de graines de lin."]',
  steps_en = '["Pour oats and milk into a saucepan.", "Cook over medium heat, stirring regularly for 5 minutes.", "Mash half the banana and stir into the porridge.", "Pour into a bowl and add peanut butter and honey.", "Slice remaining banana and arrange on top.", "Sprinkle with cinnamon and flax seeds."]',
  prep_time_min = 5,
  cook_time_min = 5,
  servings = 1
WHERE name_fr = 'Porridge banane beurre de cacahuète';

-- 10. Pudding de chia coco (keto)
UPDATE recipes SET
  ingredients_fr = '["30g de graines de chia", "200ml de lait de coco", "1 c. a cafe d''erythritol", "1 c. a cafe d''extrait de vanille", "20g de noix de coco rapee", "10g de copeaux de chocolat noir 90%"]',
  ingredients_en = '["30g chia seeds", "200ml coconut milk", "1 tsp erythritol", "1 tsp vanilla extract", "20g shredded coconut", "10g 90% dark chocolate shavings"]',
  steps_fr = '["Melanger les graines de chia, le lait de coco, l''erythritol et la vanille dans un bol.", "Bien remuer pour eviter les grumeaux.", "Couvrir et refrigerer au moins 4 heures ou toute la nuit.", "Au moment de servir, remuer et garnir de noix de coco rapee.", "Ajouter les copeaux de chocolat noir."]',
  steps_en = '["Mix chia seeds, coconut milk, erythritol and vanilla in a bowl.", "Stir well to avoid lumps.", "Cover and refrigerate at least 4 hours or overnight.", "When ready to serve, stir and top with shredded coconut.", "Add dark chocolate shavings."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Pudding de chia coco';

-- 11. Smoothie bowl proteine
UPDATE recipes SET
  ingredients_fr = '["30g de whey proteine vanille", "1 banane congelee", "100g d''epinards frais", "150ml de lait d''amande", "30g de granola", "1 c. a soupe de beurre d''amande", "50g de myrtilles"]',
  ingredients_en = '["30g vanilla whey protein", "1 frozen banana", "100g fresh spinach", "150ml almond milk", "30g granola", "1 tbsp almond butter", "50g blueberries"]',
  steps_fr = '["Mixer la whey, la banane congelee, les epinards et le lait d''amande jusqu''a obtenir une consistance epaisse.", "Verser dans un bol.", "Disposer le granola, le beurre d''amande et les myrtilles sur le dessus.", "Servir immediatement."]',
  steps_en = '["Blend whey, frozen banana, spinach and almond milk until thick.", "Pour into a bowl.", "Top with granola, almond butter and blueberries.", "Serve immediately."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Smoothie bowl protéiné';

-- 12. Tartines avocat saumon fume
UPDATE recipes SET
  ingredients_fr = '["2 tranches de pain complet", "1 avocat mur", "80g de saumon fume", "1 c. a cafe de jus de citron", "1 c. a soupe de fromage frais", "Sel et poivre", "Graines de sesame", "Aneth frais"]',
  ingredients_en = '["2 slices whole wheat bread", "1 ripe avocado", "80g smoked salmon", "1 tsp lemon juice", "1 tbsp cream cheese", "Salt and pepper", "Sesame seeds", "Fresh dill"]',
  steps_fr = '["Faire griller les tranches de pain.", "Ecraser l''avocat a la fourchette avec le jus de citron, le sel et le poivre.", "Tartiner le fromage frais sur les toasts.", "Ajouter la puree d''avocat par-dessus.", "Disposer les tranches de saumon fume.", "Garnir de graines de sesame et d''aneth."]',
  steps_en = '["Toast the bread slices.", "Mash avocado with a fork, lemon juice, salt and pepper.", "Spread cream cheese on the toasts.", "Add the avocado mash on top.", "Arrange smoked salmon slices.", "Garnish with sesame seeds and dill."]',
  prep_time_min = 10,
  cook_time_min = 2,
  servings = 1
WHERE name_fr = 'Tartines avocat saumon fumé';

-- 13. Yaourt grec granola
UPDATE recipes SET
  ingredients_fr = '["200g de yaourt grec nature", "40g de granola", "1 c. a soupe de miel", "50g de fruits frais de saison (fraises, myrtilles)", "1 c. a cafe de graines de courge"]',
  ingredients_en = '["200g plain Greek yogurt", "40g granola", "1 tbsp honey", "50g fresh seasonal fruit (strawberries, blueberries)", "1 tsp pumpkin seeds"]',
  steps_fr = '["Verser le yaourt grec dans un bol.", "Ajouter le granola sur le dessus.", "Couper les fruits frais et les disposer joliment.", "Saupoudrer de graines de courge.", "Arroser de miel et servir."]',
  steps_en = '["Pour Greek yogurt into a bowl.", "Add granola on top.", "Cut fresh fruits and arrange nicely.", "Sprinkle with pumpkin seeds.", "Drizzle with honey and serve."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Yaourt grec granola';

-- ============================================================
-- DINNER (14 recipes)
-- ============================================================

-- 14. Blanquette de poulet allegee
UPDATE recipes SET
  ingredients_fr = '["300g de blancs de poulet", "2 carottes", "1 poireau", "100g de champignons de Paris", "200ml de creme legere 15%", "1 c. a soupe de farine", "1 cube de bouillon de volaille", "1 feuille de laurier", "Sel et poivre"]',
  ingredients_en = '["300g chicken breast", "2 carrots", "1 leek", "100g button mushrooms", "200ml light cream 15%", "1 tbsp flour", "1 chicken bouillon cube", "1 bay leaf", "Salt and pepper"]',
  steps_fr = '["Couper le poulet en morceaux et les legumes en rondelles.", "Faire revenir le poulet dans une cocotte avec un filet d''huile 5 minutes.", "Ajouter les legumes, le laurier et couvrir d''eau avec le bouillon cube.", "Laisser mijoter 20 minutes a feu doux.", "Melanger la farine avec la creme et l''incorporer a la preparation.", "Cuire encore 5 minutes en remuant jusqu''a epaississement. Assaisonner et servir."]',
  steps_en = '["Cut chicken into pieces and vegetables into rounds.", "Brown chicken in a pot with a drizzle of oil for 5 minutes.", "Add vegetables, bay leaf and cover with water and bouillon cube.", "Simmer for 20 minutes on low heat.", "Mix flour with cream and stir into the pot.", "Cook 5 more minutes, stirring until thickened. Season and serve."]',
  prep_time_min = 15,
  cook_time_min = 30,
  servings = 2
WHERE name_fr = 'Blanquette de poulet allégée';

-- 15. Crevettes a l'ail et beurre (keto)
UPDATE recipes SET
  ingredients_fr = '["250g de crevettes decortiquees", "30g de beurre", "4 gousses d''ail emincees", "1 c. a soupe de persil frais hache", "1 c. a soupe de jus de citron", "1 pincee de piment rouge broye", "Sel et poivre"]',
  ingredients_en = '["250g peeled shrimp", "30g butter", "4 garlic cloves, minced", "1 tbsp fresh parsley, chopped", "1 tbsp lemon juice", "A pinch of red pepper flakes", "Salt and pepper"]',
  steps_fr = '["Faire fondre le beurre dans une grande poele a feu moyen-vif.", "Ajouter l''ail et le piment, faire revenir 30 secondes.", "Ajouter les crevettes et cuire 2-3 minutes de chaque cote.", "Arroser de jus de citron.", "Parsemer de persil frais, assaisonner et servir immediatement."]',
  steps_en = '["Melt butter in a large pan over medium-high heat.", "Add garlic and red pepper flakes, saute for 30 seconds.", "Add shrimp and cook 2-3 minutes per side.", "Squeeze lemon juice over the shrimp.", "Sprinkle with fresh parsley, season and serve immediately."]',
  prep_time_min = 10,
  cook_time_min = 6,
  servings = 2
WHERE name_fr = 'Crevettes à l''ail et beurre';

-- 16. Entrecote au beurre persille (keto)
UPDATE recipes SET
  ingredients_fr = '["1 entrecote de 250g", "30g de beurre mou", "2 gousses d''ail hachees", "2 c. a soupe de persil frais hache", "1 c. a soupe d''huile d''olive", "Sel et poivre", "Fleur de sel"]',
  ingredients_en = '["1 ribeye steak 250g", "30g softened butter", "2 garlic cloves, minced", "2 tbsp fresh parsley, chopped", "1 tbsp olive oil", "Salt and pepper", "Fleur de sel"]',
  steps_fr = '["Preparer le beurre persille en melangeant le beurre mou, l''ail et le persil. Reserver au frais.", "Sortir la viande du refrigerateur 30 minutes avant cuisson.", "Huiler et assaisonner genereusement l''entrecote de sel et poivre.", "Saisir dans une poele tres chaude 3-4 minutes de chaque cote pour une cuisson a point.", "Laisser reposer 3 minutes puis deposer le beurre persille sur la viande.", "Servir avec une pincee de fleur de sel."]',
  steps_en = '["Prepare herb butter by mixing softened butter, garlic and parsley. Refrigerate.", "Take meat out of the fridge 30 minutes before cooking.", "Oil and generously season the steak with salt and pepper.", "Sear in a very hot pan 3-4 minutes per side for medium doneness.", "Let rest 3 minutes then place herb butter on the steak.", "Serve with a pinch of fleur de sel."]',
  prep_time_min = 10,
  cook_time_min = 8,
  servings = 1
WHERE name_fr = 'Entrecôte au beurre persillé';

-- 17. Filet de cabillaud puree maison
UPDATE recipes SET
  ingredients_fr = '["2 filets de cabillaud (150g chacun)", "400g de pommes de terre", "30g de beurre", "100ml de lait chaud", "1 c. a soupe d''huile d''olive", "1 citron", "Sel, poivre et muscade", "Persil frais"]',
  ingredients_en = '["2 cod fillets (150g each)", "400g potatoes", "30g butter", "100ml warm milk", "1 tbsp olive oil", "1 lemon", "Salt, pepper and nutmeg", "Fresh parsley"]',
  steps_fr = '["Eplucher et cuire les pommes de terre dans l''eau salee 20 minutes.", "Ecraser les pommes de terre avec le beurre, le lait chaud et la muscade.", "Assaisonner les filets de cabillaud de sel, poivre et jus de citron.", "Cuire les filets dans l''huile d''olive a feu moyen 4 minutes de chaque cote.", "Servir le poisson sur un lit de puree.", "Garnir de persil frais et d''un quartier de citron."]',
  steps_en = '["Peel and cook potatoes in salted water for 20 minutes.", "Mash potatoes with butter, warm milk and nutmeg.", "Season cod fillets with salt, pepper and lemon juice.", "Cook fillets in olive oil over medium heat 4 minutes per side.", "Serve fish on a bed of mashed potatoes.", "Garnish with fresh parsley and a lemon wedge."]',
  prep_time_min = 15,
  cook_time_min = 25,
  servings = 2
WHERE name_fr = 'Filet de cabillaud purée maison';

-- 18. Gratin de courgettes au poulet
UPDATE recipes SET
  ingredients_fr = '["250g de blancs de poulet", "2 courgettes moyennes", "100g de creme legere", "80g de gruyere rape", "1 oignon", "1 gousse d''ail", "1 c. a soupe d''huile d''olive", "Sel, poivre et thym"]',
  ingredients_en = '["250g chicken breast", "2 medium zucchinis", "100g light cream", "80g grated Gruyere cheese", "1 onion", "1 garlic clove", "1 tbsp olive oil", "Salt, pepper and thyme"]',
  steps_fr = '["Prechauffer le four a 180C.", "Couper le poulet en des et les courgettes en rondelles.", "Faire revenir le poulet avec l''oignon et l''ail dans l''huile d''olive 5 minutes.", "Disposer les courgettes et le poulet dans un plat a gratin.", "Verser la creme, assaisonner et couvrir de gruyere rape.", "Enfourner 25 minutes jusqu''a ce que le dessus soit dore."]',
  steps_en = '["Preheat oven to 180C/350F.", "Cut chicken into cubes and zucchinis into rounds.", "Saute chicken with onion and garlic in olive oil for 5 minutes.", "Arrange zucchini and chicken in a baking dish.", "Pour cream over, season and top with grated Gruyere.", "Bake 25 minutes until golden on top."]',
  prep_time_min = 15,
  cook_time_min = 30,
  servings = 2
WHERE name_fr = 'Gratin de courgettes au poulet';

-- 19. Omelette champignons fromage
UPDATE recipes SET
  ingredients_fr = '["4 oeufs", "150g de champignons de Paris", "60g de gruyere rape", "1 c. a soupe de beurre", "1 echalote emincee", "Sel et poivre", "Persil frais"]',
  ingredients_en = '["4 eggs", "150g button mushrooms", "60g grated Gruyere cheese", "1 tbsp butter", "1 shallot, sliced", "Salt and pepper", "Fresh parsley"]',
  steps_fr = '["Emincer les champignons et faire revenir avec l''echalote dans le beurre 5 minutes.", "Battre les oeufs avec le sel et le poivre.", "Verser les oeufs dans la poele sur les champignons.", "Cuire a feu moyen 3-4 minutes.", "Saupoudrer de gruyere rape, plier l''omelette en deux.", "Cuire encore 1 minute et servir parsemee de persil."]',
  steps_en = '["Slice mushrooms and saute with shallot in butter for 5 minutes.", "Beat eggs with salt and pepper.", "Pour eggs into the pan over the mushrooms.", "Cook over medium heat 3-4 minutes.", "Sprinkle with grated Gruyere, fold the omelette in half.", "Cook 1 more minute and serve garnished with parsley."]',
  prep_time_min = 10,
  cook_time_min = 10,
  servings = 2
WHERE name_fr = 'Omelette champignons fromage';

-- 20. Pave de thon quinoa
UPDATE recipes SET
  ingredients_fr = '["2 paves de thon frais (150g chacun)", "150g de quinoa", "1 avocat", "1 c. a soupe de sauce soja", "1 c. a soupe d''huile de sesame", "1 c. a cafe de graines de sesame", "1 citron vert", "Sel et poivre"]',
  ingredients_en = '["2 fresh tuna steaks (150g each)", "150g quinoa", "1 avocado", "1 tbsp soy sauce", "1 tbsp sesame oil", "1 tsp sesame seeds", "1 lime", "Salt and pepper"]',
  steps_fr = '["Rincer et cuire le quinoa selon les instructions du paquet.", "Badigeonner les paves de thon d''huile de sesame et de sauce soja.", "Saisir le thon dans une poele tres chaude 1-2 minutes de chaque cote (laisser rose au centre).", "Couper l''avocat en tranches et arroser de jus de citron vert.", "Servir le thon sur le quinoa avec l''avocat.", "Parsemer de graines de sesame."]',
  steps_en = '["Rinse and cook quinoa according to package instructions.", "Brush tuna steaks with sesame oil and soy sauce.", "Sear tuna in a very hot pan 1-2 minutes per side (keep pink in center).", "Slice avocado and drizzle with lime juice.", "Serve tuna on quinoa with avocado.", "Sprinkle with sesame seeds."]',
  prep_time_min = 10,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Pavé de thon quinoa';

-- 21. Poivrons farcis keto
UPDATE recipes SET
  ingredients_fr = '["4 demi-poivrons (2 poivrons coupes en deux)", "200g de viande hachee de boeuf", "80g de mozzarella rapee", "1 petite courgette rapee", "1 oignon hache", "2 gousses d''ail", "1 c. a soupe de concentre de tomate", "Sel, poivre et origan"]',
  ingredients_en = '["4 bell pepper halves (2 peppers cut in half)", "200g ground beef", "80g shredded mozzarella", "1 small zucchini, grated", "1 onion, chopped", "2 garlic cloves", "1 tbsp tomato paste", "Salt, pepper and oregano"]',
  steps_fr = '["Prechauffer le four a 190C.", "Faire revenir l''oignon, l''ail et la viande hachee 5 minutes.", "Ajouter la courgette rapee, le concentre de tomate et les assaisonnements.", "Farcir chaque demi-poivron avec la preparation.", "Couvrir de mozzarella rapee.", "Enfourner 25 minutes jusqu''a ce que les poivrons soient tendres et le fromage dore."]',
  steps_en = '["Preheat oven to 190C/375F.", "Saute onion, garlic and ground beef for 5 minutes.", "Add grated zucchini, tomato paste and seasonings.", "Stuff each pepper half with the mixture.", "Top with shredded mozzarella.", "Bake 25 minutes until peppers are tender and cheese is golden."]',
  prep_time_min = 15,
  cook_time_min = 30,
  servings = 2
WHERE name_fr = 'Poivrons farcis keto';

-- 22. Poulet brocoli creme (keto)
UPDATE recipes SET
  ingredients_fr = '["300g de blancs de poulet", "250g de brocoli en fleurettes", "150ml de creme epaisse", "50g de parmesan rape", "2 gousses d''ail emincees", "1 c. a soupe d''huile d''olive", "Sel, poivre et muscade"]',
  ingredients_en = '["300g chicken breast", "250g broccoli florets", "150ml heavy cream", "50g grated Parmesan", "2 garlic cloves, minced", "1 tbsp olive oil", "Salt, pepper and nutmeg"]',
  steps_fr = '["Couper le poulet en morceaux et assaisonner.", "Faire dorer le poulet dans l''huile d''olive 5 minutes puis reserver.", "Cuire le brocoli a la vapeur 5 minutes.", "Dans la meme poele, faire revenir l''ail puis ajouter la creme et le parmesan.", "Remettre le poulet et le brocoli dans la sauce.", "Assaisonner de muscade, melanger et servir."]',
  steps_en = '["Cut chicken into pieces and season.", "Brown chicken in olive oil for 5 minutes then set aside.", "Steam broccoli for 5 minutes.", "In the same pan, saute garlic then add cream and Parmesan.", "Return chicken and broccoli to the sauce.", "Season with nutmeg, mix and serve."]',
  prep_time_min = 10,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Poulet brocoli crème';

-- 23. Poulet curry coco riz
UPDATE recipes SET
  ingredients_fr = '["300g de blancs de poulet", "200ml de lait de coco", "150g de riz basmati", "2 c. a soupe de pate de curry jaune", "1 oignon", "1 poivron rouge", "100g de pois chiches en boite", "1 c. a soupe d''huile de coco", "Coriandre fraiche"]',
  ingredients_en = '["300g chicken breast", "200ml coconut milk", "150g basmati rice", "2 tbsp yellow curry paste", "1 onion", "1 red bell pepper", "100g canned chickpeas", "1 tbsp coconut oil", "Fresh cilantro"]',
  steps_fr = '["Cuire le riz basmati selon les instructions.", "Couper le poulet en des, l''oignon et le poivron en lanières.", "Faire revenir le poulet dans l''huile de coco 5 minutes.", "Ajouter l''oignon, le poivron et la pate de curry, cuire 3 minutes.", "Verser le lait de coco et les pois chiches, laisser mijoter 15 minutes.", "Servir le curry sur le riz et garnir de coriandre fraiche."]',
  steps_en = '["Cook basmati rice according to instructions.", "Cut chicken into cubes, onion and pepper into strips.", "Saute chicken in coconut oil for 5 minutes.", "Add onion, pepper and curry paste, cook 3 minutes.", "Pour in coconut milk and chickpeas, simmer 15 minutes.", "Serve curry over rice and garnish with fresh cilantro."]',
  prep_time_min = 15,
  cook_time_min = 25,
  servings = 2
WHERE name_fr = 'Poulet curry coco riz';

-- 24. Saumon au four legumes rotis
UPDATE recipes SET
  ingredients_fr = '["2 paves de saumon (150g chacun)", "1 courgette", "1 poivron rouge", "200g de tomates cerises", "1 oignon rouge", "2 c. a soupe d''huile d''olive", "2 gousses d''ail", "1 citron", "Sel, poivre et herbes de Provence"]',
  ingredients_en = '["2 salmon fillets (150g each)", "1 zucchini", "1 red bell pepper", "200g cherry tomatoes", "1 red onion", "2 tbsp olive oil", "2 garlic cloves", "1 lemon", "Salt, pepper and Herbes de Provence"]',
  steps_fr = '["Prechauffer le four a 200C.", "Couper les legumes en morceaux et les disposer sur une plaque.", "Arroser d''huile d''olive, assaisonner d''herbes, sel et poivre.", "Enfourner les legumes 15 minutes.", "Deposer les paves de saumon sur les legumes, arroser de jus de citron.", "Remettre au four 12-15 minutes jusqu''a ce que le saumon soit cuit."]',
  steps_en = '["Preheat oven to 200C/400F.", "Cut vegetables into chunks and arrange on a baking sheet.", "Drizzle with olive oil, season with herbs, salt and pepper.", "Roast vegetables for 15 minutes.", "Place salmon fillets on top of vegetables, squeeze lemon juice over.", "Return to oven for 12-15 minutes until salmon is cooked through."]',
  prep_time_min = 15,
  cook_time_min = 30,
  servings = 2
WHERE name_fr = 'Saumon au four légumes rôtis';

-- 25. Soupe de lentilles corail
UPDATE recipes SET
  ingredients_fr = '["200g de lentilles corail", "1 oignon", "2 carottes", "2 gousses d''ail", "400ml de bouillon de legumes", "200ml de lait de coco", "1 c. a cafe de curcuma", "1 c. a cafe de cumin", "1 c. a soupe d''huile d''olive", "Jus d''un demi-citron"]',
  ingredients_en = '["200g red lentils", "1 onion", "2 carrots", "2 garlic cloves", "400ml vegetable broth", "200ml coconut milk", "1 tsp turmeric", "1 tsp cumin", "1 tbsp olive oil", "Juice of half a lemon"]',
  steps_fr = '["Rincer les lentilles corail a l''eau froide.", "Faire revenir l''oignon, les carottes et l''ail dans l''huile d''olive 5 minutes.", "Ajouter les epices, les lentilles et le bouillon.", "Laisser mijoter 20 minutes jusqu''a ce que les lentilles soient fondantes.", "Ajouter le lait de coco et mixer grossierement.", "Assaisonner et servir avec un filet de jus de citron."]',
  steps_en = '["Rinse red lentils under cold water.", "Saute onion, carrots and garlic in olive oil for 5 minutes.", "Add spices, lentils and broth.", "Simmer 20 minutes until lentils are tender.", "Add coconut milk and roughly blend.", "Season and serve with a squeeze of lemon juice."]',
  prep_time_min = 10,
  cook_time_min = 25,
  servings = 3
WHERE name_fr = 'Soupe de lentilles corail';

-- 26. Stir-fry boeuf nouilles
UPDATE recipes SET
  ingredients_fr = '["200g de boeuf (bavette ou rumsteck)", "200g de nouilles aux oeufs", "1 poivron rouge", "1 carotte", "100g de brocoli", "3 c. a soupe de sauce soja", "1 c. a soupe de sauce huitre", "1 c. a soupe d''huile de sesame", "2 gousses d''ail", "1 morceau de gingembre frais (2cm)"]',
  ingredients_en = '["200g beef (flank or rump steak)", "200g egg noodles", "1 red bell pepper", "1 carrot", "100g broccoli", "3 tbsp soy sauce", "1 tbsp oyster sauce", "1 tbsp sesame oil", "2 garlic cloves", "1 piece fresh ginger (2cm)"]',
  steps_fr = '["Cuire les nouilles selon les instructions et egoutter.", "Couper le boeuf en fines lamelles et les legumes en julienne.", "Saisir le boeuf dans l''huile de sesame a feu tres vif 2 minutes puis reserver.", "Faire sauter les legumes avec l''ail et le gingembre 3 minutes.", "Ajouter les nouilles, le boeuf, la sauce soja et la sauce huitre.", "Melanger vivement 2 minutes et servir."]',
  steps_en = '["Cook noodles according to instructions and drain.", "Slice beef into thin strips and julienne the vegetables.", "Sear beef in sesame oil over very high heat for 2 minutes then set aside.", "Stir-fry vegetables with garlic and ginger for 3 minutes.", "Add noodles, beef, soy sauce and oyster sauce.", "Toss vigorously for 2 minutes and serve."]',
  prep_time_min = 15,
  cook_time_min = 12,
  servings = 2
WHERE name_fr = 'Stir-fry boeuf nouilles';

-- 27. Tacos poulet maison
UPDATE recipes SET
  ingredients_fr = '["250g de blancs de poulet", "4 tortillas de ble", "1 avocat", "1 tomate", "50g de cheddar rape", "1/2 oignon rouge", "1 c. a soupe d''huile d''olive", "1 c. a cafe de paprika", "1 c. a cafe de cumin", "Jus d''un citron vert", "Coriandre fraiche", "Creme fraiche"]',
  ingredients_en = '["250g chicken breast", "4 wheat tortillas", "1 avocado", "1 tomato", "50g shredded cheddar", "1/2 red onion", "1 tbsp olive oil", "1 tsp paprika", "1 tsp cumin", "Juice of 1 lime", "Fresh cilantro", "Sour cream"]',
  steps_fr = '["Couper le poulet en lamelles et assaisonner de paprika, cumin, sel et poivre.", "Cuire le poulet dans l''huile d''olive 6-8 minutes.", "Preparer le guacamole en ecrasant l''avocat avec le citron vert et l''oignon.", "Couper la tomate en des.", "Chauffer les tortillas 30 secondes de chaque cote.", "Garnir les tortillas de poulet, guacamole, tomate, cheddar et coriandre."]',
  steps_en = '["Slice chicken and season with paprika, cumin, salt and pepper.", "Cook chicken in olive oil for 6-8 minutes.", "Prepare guacamole by mashing avocado with lime and onion.", "Dice the tomato.", "Warm tortillas 30 seconds per side.", "Fill tortillas with chicken, guacamole, tomato, cheddar and cilantro."]',
  prep_time_min = 15,
  cook_time_min = 10,
  servings = 2
WHERE name_fr = 'Tacos poulet maison';

-- 28. Wok crevettes legumes
UPDATE recipes SET
  ingredients_fr = '["200g de crevettes decortiquees", "1 poivron rouge", "1 carotte", "100g de pois mange-tout", "100g de chou chinois", "2 c. a soupe de sauce soja", "1 c. a soupe de sauce huitre", "1 c. a soupe d''huile de sesame", "2 gousses d''ail", "1 c. a cafe de gingembre rape"]',
  ingredients_en = '["200g peeled shrimp", "1 red bell pepper", "1 carrot", "100g snow peas", "100g Chinese cabbage", "2 tbsp soy sauce", "1 tbsp oyster sauce", "1 tbsp sesame oil", "2 garlic cloves", "1 tsp grated ginger"]',
  steps_fr = '["Couper tous les legumes en fines lamelles.", "Chauffer l''huile de sesame dans un wok a feu vif.", "Saisir les crevettes 2 minutes puis reserver.", "Faire sauter les legumes avec l''ail et le gingembre 3-4 minutes.", "Remettre les crevettes, ajouter la sauce soja et la sauce huitre.", "Melanger 1 minute et servir immediatement."]',
  steps_en = '["Cut all vegetables into thin strips.", "Heat sesame oil in a wok over high heat.", "Sear shrimp for 2 minutes then set aside.", "Stir-fry vegetables with garlic and ginger for 3-4 minutes.", "Return shrimp, add soy sauce and oyster sauce.", "Toss for 1 minute and serve immediately."]',
  prep_time_min = 15,
  cook_time_min = 8,
  servings = 2
WHERE name_fr = 'Wok crevettes légumes';

-- ============================================================
-- LUNCH (16 recipes)
-- ============================================================

-- 29. Bowl saumon teriyaki riz
UPDATE recipes SET
  ingredients_fr = '["200g de pave de saumon", "150g de riz a sushi", "1 avocat", "100g d''edamame", "1 carotte rapee", "3 c. a soupe de sauce teriyaki", "1 c. a soupe de graines de sesame", "1 oignon vert", "Algue nori emietee"]',
  ingredients_en = '["200g salmon fillet", "150g sushi rice", "1 avocado", "100g edamame", "1 grated carrot", "3 tbsp teriyaki sauce", "1 tbsp sesame seeds", "1 green onion", "Crumbled nori seaweed"]',
  steps_fr = '["Cuire le riz a sushi selon les instructions.", "Mariner le saumon dans 2 c. a soupe de sauce teriyaki 10 minutes.", "Cuire le saumon dans une poele chaude 3-4 minutes de chaque cote.", "Dresser le riz dans un bol, ajouter l''avocat tranche, la carotte et les edamame.", "Deposer le saumon sur le riz et napper du reste de sauce teriyaki.", "Garnir de graines de sesame, oignon vert et nori."]',
  steps_en = '["Cook sushi rice according to instructions.", "Marinate salmon in 2 tbsp teriyaki sauce for 10 minutes.", "Cook salmon in a hot pan 3-4 minutes per side.", "Arrange rice in a bowl, add sliced avocado, carrot and edamame.", "Place salmon on rice and drizzle with remaining teriyaki sauce.", "Garnish with sesame seeds, green onion and nori."]',
  prep_time_min = 15,
  cook_time_min = 20,
  servings = 2
WHERE name_fr = 'Bowl saumon teriyaki riz';

-- 30. Buddha bowl lentilles
UPDATE recipes SET
  ingredients_fr = '["100g de lentilles vertes", "100g de quinoa", "1 patate douce", "100g de pois chiches en boite", "50g de roquette", "1/2 avocat", "2 c. a soupe de tahini", "1 c. a soupe de jus de citron", "1 c. a soupe d''huile d''olive", "Sel, poivre et cumin"]',
  ingredients_en = '["100g green lentils", "100g quinoa", "1 sweet potato", "100g canned chickpeas", "50g arugula", "1/2 avocado", "2 tbsp tahini", "1 tbsp lemon juice", "1 tbsp olive oil", "Salt, pepper and cumin"]',
  steps_fr = '["Cuire les lentilles et le quinoa separement selon les instructions.", "Couper la patate douce en des, assaisonner et rotir au four a 200C pendant 20 minutes.", "Egoutter et rincer les pois chiches.", "Preparer la sauce en melangeant le tahini, le citron et un peu d''eau.", "Assembler le bowl avec le quinoa, les lentilles, la patate douce, les pois chiches, la roquette et l''avocat.", "Arroser de sauce tahini et servir."]',
  steps_en = '["Cook lentils and quinoa separately according to instructions.", "Dice sweet potato, season and roast at 200C/400F for 20 minutes.", "Drain and rinse chickpeas.", "Prepare dressing by mixing tahini, lemon and a bit of water.", "Assemble the bowl with quinoa, lentils, sweet potato, chickpeas, arugula and avocado.", "Drizzle with tahini sauce and serve."]',
  prep_time_min = 15,
  cook_time_min = 25,
  servings = 2
WHERE name_fr = 'Buddha bowl lentilles';

-- 31. Burger sans pain (laitue) (keto)
UPDATE recipes SET
  ingredients_fr = '["200g de steak hache de boeuf", "4 grandes feuilles de laitue iceberg", "2 tranches de cheddar", "2 tranches de tomate", "1/2 oignon rouge en rondelles", "2 cornichons tranches", "1 c. a soupe de moutarde", "1 c. a soupe de ketchup sans sucre", "Sel et poivre"]',
  ingredients_en = '["200g ground beef patties", "4 large iceberg lettuce leaves", "2 cheddar slices", "2 tomato slices", "1/2 red onion, sliced into rings", "2 sliced pickles", "1 tbsp mustard", "1 tbsp sugar-free ketchup", "Salt and pepper"]',
  steps_fr = '["Former 2 steaks haches et les assaisonner genereusement.", "Cuire les steaks dans une poele chaude 3-4 minutes de chaque cote.", "Deposer une tranche de cheddar sur chaque steak en fin de cuisson.", "Laver et secher les feuilles de laitue.", "Assembler : laitue, sauce, steak au fromage, tomate, oignon et cornichons.", "Recouvrir d''une seconde feuille de laitue et servir."]',
  steps_en = '["Form 2 beef patties and season generously.", "Cook patties in a hot pan 3-4 minutes per side.", "Place a cheddar slice on each patty at the end of cooking.", "Wash and dry lettuce leaves.", "Assemble: lettuce, sauce, cheese patty, tomato, onion and pickles.", "Cover with a second lettuce leaf and serve."]',
  prep_time_min = 10,
  cook_time_min = 8,
  servings = 2
WHERE name_fr = 'Burger sans pain (laitue)';

-- 32. Chili con carne
UPDATE recipes SET
  ingredients_fr = '["250g de boeuf hache", "200g de haricots rouges en boite", "400g de tomates concassees en boite", "1 oignon", "2 gousses d''ail", "1 poivron rouge", "2 c. a soupe de concentre de tomate", "1 c. a cafe de cumin", "1 c. a cafe de paprika", "1/2 c. a cafe de piment de Cayenne", "1 c. a soupe d''huile d''olive", "Coriandre fraiche"]',
  ingredients_en = '["250g ground beef", "200g canned kidney beans", "400g canned crushed tomatoes", "1 onion", "2 garlic cloves", "1 red bell pepper", "2 tbsp tomato paste", "1 tsp cumin", "1 tsp paprika", "1/2 tsp cayenne pepper", "1 tbsp olive oil", "Fresh cilantro"]',
  steps_fr = '["Faire revenir l''oignon, l''ail et le poivron dans l''huile d''olive 5 minutes.", "Ajouter le boeuf hache et cuire jusqu''a ce qu''il soit dore.", "Incorporer le concentre de tomate, le cumin, le paprika et le piment.", "Ajouter les tomates concassees et les haricots rouges egouttes.", "Laisser mijoter a feu doux 25-30 minutes.", "Servir garni de coriandre fraiche."]',
  steps_en = '["Saute onion, garlic and pepper in olive oil for 5 minutes.", "Add ground beef and cook until browned.", "Stir in tomato paste, cumin, paprika and cayenne.", "Add crushed tomatoes and drained kidney beans.", "Simmer on low heat for 25-30 minutes.", "Serve garnished with fresh cilantro."]',
  prep_time_min = 15,
  cook_time_min = 35,
  servings = 3
WHERE name_fr = 'Chili con carne';

-- 33. Courgetti bolognaise (keto)
UPDATE recipes SET
  ingredients_fr = '["2 grandes courgettes", "200g de boeuf hache", "200g de sauce tomate (sans sucre)", "1 oignon", "2 gousses d''ail", "1 c. a soupe d''huile d''olive", "30g de parmesan rape", "Sel, poivre et origan", "Basilic frais"]',
  ingredients_en = '["2 large zucchinis", "200g ground beef", "200g tomato sauce (no sugar added)", "1 onion", "2 garlic cloves", "1 tbsp olive oil", "30g grated Parmesan", "Salt, pepper and oregano", "Fresh basil"]',
  steps_fr = '["Realiser des spaghettis de courgettes a l''aide d''un spiraliseur.", "Faire revenir l''oignon et l''ail dans l''huile d''olive.", "Ajouter le boeuf hache et cuire 5 minutes.", "Incorporer la sauce tomate et l''origan, mijoter 15 minutes.", "Faire sauter les courgetti 2 minutes dans une poele a part.", "Servir la bolognaise sur les courgetti avec le parmesan et le basilic."]',
  steps_en = '["Spiralize zucchinis into spaghetti shapes.", "Saute onion and garlic in olive oil.", "Add ground beef and cook 5 minutes.", "Stir in tomato sauce and oregano, simmer 15 minutes.", "Saute zoodles for 2 minutes in a separate pan.", "Serve bolognese over zoodles with Parmesan and basil."]',
  prep_time_min = 10,
  cook_time_min = 22,
  servings = 2
WHERE name_fr = 'Courgetti bolognaise';

-- 34. Dahl de lentilles riz
UPDATE recipes SET
  ingredients_fr = '["200g de lentilles corail", "150g de riz basmati", "1 oignon", "2 gousses d''ail", "1 morceau de gingembre frais (2cm)", "400ml de lait de coco", "1 c. a cafe de curcuma", "1 c. a cafe de garam masala", "1 c. a soupe d''huile de coco", "Coriandre fraiche", "Jus d''un demi-citron"]',
  ingredients_en = '["200g red lentils", "150g basmati rice", "1 onion", "2 garlic cloves", "1 piece fresh ginger (2cm)", "400ml coconut milk", "1 tsp turmeric", "1 tsp garam masala", "1 tbsp coconut oil", "Fresh cilantro", "Juice of half a lemon"]',
  steps_fr = '["Rincer les lentilles et cuire le riz separement.", "Faire revenir l''oignon, l''ail et le gingembre dans l''huile de coco 3 minutes.", "Ajouter les epices et cuire 1 minute.", "Incorporer les lentilles et le lait de coco, couvrir d''eau si necessaire.", "Mijoter 20 minutes jusqu''a ce que les lentilles soient fondantes.", "Servir sur le riz avec la coriandre et le jus de citron."]',
  steps_en = '["Rinse lentils and cook rice separately.", "Saute onion, garlic and ginger in coconut oil for 3 minutes.", "Add spices and cook 1 minute.", "Add lentils and coconut milk, top up with water if needed.", "Simmer 20 minutes until lentils are tender.", "Serve over rice with cilantro and lemon juice."]',
  prep_time_min = 10,
  cook_time_min = 25,
  servings = 3
WHERE name_fr = 'Dahl de lentilles riz';

-- 35. Poke bowl saumon
UPDATE recipes SET
  ingredients_fr = '["150g de saumon frais (qualite sashimi)", "150g de riz a sushi", "1/2 avocat", "1/2 concombre", "50g d''edamame", "1 carotte rapee", "2 c. a soupe de sauce soja", "1 c. a soupe d''huile de sesame", "1 c. a cafe de graines de sesame", "1 oignon vert"]',
  ingredients_en = '["150g fresh salmon (sashimi grade)", "150g sushi rice", "1/2 avocado", "1/2 cucumber", "50g edamame", "1 grated carrot", "2 tbsp soy sauce", "1 tbsp sesame oil", "1 tsp sesame seeds", "1 green onion"]',
  steps_fr = '["Cuire le riz a sushi et le laisser refroidir.", "Couper le saumon en des de 2cm.", "Mariner le saumon dans la sauce soja et l''huile de sesame 10 minutes.", "Couper l''avocat et le concombre en tranches.", "Assembler le bowl : riz, saumon, avocat, concombre, carotte et edamame.", "Garnir de graines de sesame et d''oignon vert cisele."]',
  steps_en = '["Cook sushi rice and let it cool.", "Cut salmon into 2cm cubes.", "Marinate salmon in soy sauce and sesame oil for 10 minutes.", "Slice avocado and cucumber.", "Assemble the bowl: rice, salmon, avocado, cucumber, carrot and edamame.", "Garnish with sesame seeds and sliced green onion."]',
  prep_time_min = 20,
  cook_time_min = 15,
  servings = 1
WHERE name_fr = 'Poké bowl saumon';

-- 36. Poulet grille riz brocoli
UPDATE recipes SET
  ingredients_fr = '["300g de blancs de poulet", "200g de riz basmati", "250g de brocoli en fleurettes", "2 c. a soupe d''huile d''olive", "1 citron", "2 gousses d''ail", "1 c. a cafe de paprika", "Sel et poivre", "Herbes de Provence"]',
  ingredients_en = '["300g chicken breast", "200g basmati rice", "250g broccoli florets", "2 tbsp olive oil", "1 lemon", "2 garlic cloves", "1 tsp paprika", "Salt and pepper", "Herbes de Provence"]',
  steps_fr = '["Mariner le poulet avec l''huile d''olive, le citron, l''ail, le paprika et les herbes.", "Cuire le riz basmati selon les instructions.", "Cuire le brocoli a la vapeur 5-6 minutes.", "Griller le poulet dans une poele ou au grill 6-7 minutes de chaque cote.", "Laisser reposer le poulet 3 minutes puis trancher.", "Servir le poulet avec le riz et le brocoli."]',
  steps_en = '["Marinate chicken with olive oil, lemon, garlic, paprika and herbs.", "Cook basmati rice according to instructions.", "Steam broccoli for 5-6 minutes.", "Grill chicken in a pan or on the grill 6-7 minutes per side.", "Let chicken rest 3 minutes then slice.", "Serve chicken with rice and broccoli."]',
  prep_time_min = 10,
  cook_time_min = 20,
  servings = 2
WHERE name_fr = 'Poulet grillé riz brocoli';

-- 37. Pates completes poulet pesto
UPDATE recipes SET
  ingredients_fr = '["200g de pates completes", "250g de blancs de poulet", "3 c. a soupe de pesto au basilic", "50g de tomates sechees", "30g de parmesan rape", "1 c. a soupe d''huile d''olive", "Quelques feuilles de basilic frais", "Sel et poivre"]',
  ingredients_en = '["200g whole wheat pasta", "250g chicken breast", "3 tbsp basil pesto", "50g sun-dried tomatoes", "30g grated Parmesan", "1 tbsp olive oil", "A few fresh basil leaves", "Salt and pepper"]',
  steps_fr = '["Cuire les pates completes selon les instructions, egoutter en reservant un peu d''eau de cuisson.", "Couper le poulet en lamelles et assaisonner.", "Faire dorer le poulet dans l''huile d''olive 6-7 minutes.", "Melanger les pates avec le pesto et un peu d''eau de cuisson.", "Ajouter le poulet et les tomates sechees coupees en morceaux.", "Servir avec le parmesan rape et le basilic frais."]',
  steps_en = '["Cook whole wheat pasta according to instructions, drain reserving some cooking water.", "Slice chicken into strips and season.", "Brown chicken in olive oil for 6-7 minutes.", "Toss pasta with pesto and a splash of cooking water.", "Add chicken and chopped sun-dried tomatoes.", "Serve with grated Parmesan and fresh basil."]',
  prep_time_min = 10,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Pâtes complètes poulet pesto';

-- 38. Quinoa bowl veggie
UPDATE recipes SET
  ingredients_fr = '["150g de quinoa", "1 patate douce", "100g de pois chiches en boite", "1/2 avocat", "50g de roquette", "1 betterave cuite", "2 c. a soupe d''huile d''olive", "1 c. a soupe de vinaigre balsamique", "1 c. a soupe de graines de tournesol", "Sel et poivre"]',
  ingredients_en = '["150g quinoa", "1 sweet potato", "100g canned chickpeas", "1/2 avocado", "50g arugula", "1 cooked beetroot", "2 tbsp olive oil", "1 tbsp balsamic vinegar", "1 tbsp sunflower seeds", "Salt and pepper"]',
  steps_fr = '["Cuire le quinoa selon les instructions.", "Couper la patate douce en des, assaisonner et rotir au four a 200C pendant 20 minutes.", "Egoutter les pois chiches et les faire griller au four avec un filet d''huile.", "Couper la betterave en des et l''avocat en tranches.", "Assembler le bowl avec tous les ingredients sur la roquette.", "Assaisonner d''huile d''olive, vinaigre balsamique et graines de tournesol."]',
  steps_en = '["Cook quinoa according to instructions.", "Dice sweet potato, season and roast at 200C/400F for 20 minutes.", "Drain chickpeas and roast in the oven with a drizzle of oil.", "Dice beetroot and slice avocado.", "Assemble the bowl with all ingredients on the arugula.", "Dress with olive oil, balsamic vinegar and sunflower seeds."]',
  prep_time_min = 15,
  cook_time_min = 25,
  servings = 2
WHERE name_fr = 'Quinoa bowl veggie';

-- 39. Salade Cesar au poulet grille
UPDATE recipes SET
  ingredients_fr = '["200g de blanc de poulet", "1 laitue romaine", "50g de croûtons", "40g de parmesan en copeaux", "3 c. a soupe de sauce Cesar", "1 c. a soupe d''huile d''olive", "Jus d''un demi-citron", "Sel et poivre"]',
  ingredients_en = '["200g chicken breast", "1 romaine lettuce", "50g croutons", "40g Parmesan shavings", "3 tbsp Caesar dressing", "1 tbsp olive oil", "Juice of half a lemon", "Salt and pepper"]',
  steps_fr = '["Assaisonner le poulet de sel, poivre et jus de citron.", "Griller le poulet dans l''huile d''olive 6-7 minutes de chaque cote.", "Laisser reposer 3 minutes puis couper en tranches.", "Laver et couper la romaine en morceaux.", "Melanger la salade avec la sauce Cesar et les croutons.", "Disposer le poulet tranche et les copeaux de parmesan sur le dessus."]',
  steps_en = '["Season chicken with salt, pepper and lemon juice.", "Grill chicken in olive oil 6-7 minutes per side.", "Let rest 3 minutes then slice.", "Wash and chop romaine into pieces.", "Toss salad with Caesar dressing and croutons.", "Arrange sliced chicken and Parmesan shavings on top."]',
  prep_time_min = 10,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Salade César au poulet grillé';

-- 40. Salade Cesar poulet (keto)
UPDATE recipes SET
  ingredients_fr = '["200g de blanc de poulet", "1 laitue romaine", "40g de parmesan en copeaux", "2 tranches de bacon", "2 c. a soupe d''huile d''olive", "1 c. a soupe de mayonnaise", "1 c. a soupe de jus de citron", "1 gousse d''ail ecrasee", "1 c. a cafe de moutarde de Dijon", "Sel et poivre"]',
  ingredients_en = '["200g chicken breast", "1 romaine lettuce", "40g Parmesan shavings", "2 bacon slices", "2 tbsp olive oil", "1 tbsp mayonnaise", "1 tbsp lemon juice", "1 garlic clove, crushed", "1 tsp Dijon mustard", "Salt and pepper"]',
  steps_fr = '["Preparer la sauce en melangeant la mayonnaise, l''huile, le citron, l''ail et la moutarde.", "Griller le poulet assaisonne dans une poele 6-7 minutes de chaque cote.", "Faire griller le bacon jusqu''a ce qu''il soit croustillant.", "Laisser reposer le poulet puis couper en tranches.", "Melanger la romaine coupee avec la sauce.", "Garnir de poulet, bacon emiette et copeaux de parmesan."]',
  steps_en = '["Prepare dressing by mixing mayonnaise, oil, lemon, garlic and mustard.", "Grill seasoned chicken in a pan 6-7 minutes per side.", "Cook bacon until crispy.", "Let chicken rest then slice.", "Toss chopped romaine with the dressing.", "Top with chicken, crumbled bacon and Parmesan shavings."]',
  prep_time_min = 10,
  cook_time_min = 15,
  servings = 2
WHERE name_fr = 'Salade César poulet';

-- 41. Salade de saumon avocat (keto)
UPDATE recipes SET
  ingredients_fr = '["150g de pave de saumon", "1 avocat", "100g de mesclun", "1/2 concombre", "50g de tomates cerises", "2 c. a soupe d''huile d''olive", "1 c. a soupe de jus de citron", "1 c. a cafe d''aneth seche", "Sel et poivre"]',
  ingredients_en = '["150g salmon fillet", "1 avocado", "100g mixed greens", "1/2 cucumber", "50g cherry tomatoes", "2 tbsp olive oil", "1 tbsp lemon juice", "1 tsp dried dill", "Salt and pepper"]',
  steps_fr = '["Assaisonner le saumon de sel, poivre et aneth.", "Cuire le saumon dans une poele 4 minutes de chaque cote.", "Couper l''avocat en tranches et le concombre en rondelles.", "Couper les tomates cerises en deux.", "Dresser le mesclun dans une assiette, ajouter les legumes et le saumon emiette.", "Assaisonner d''huile d''olive et de jus de citron."]',
  steps_en = '["Season salmon with salt, pepper and dill.", "Cook salmon in a pan 4 minutes per side.", "Slice avocado and cucumber.", "Halve the cherry tomatoes.", "Arrange mixed greens on a plate, add vegetables and flaked salmon.", "Dress with olive oil and lemon juice."]',
  prep_time_min = 10,
  cook_time_min = 8,
  servings = 1
WHERE name_fr = 'Salade de saumon avocat';

-- 42. Steak hache patate douce
UPDATE recipes SET
  ingredients_fr = '["2 steaks haches de boeuf (125g chacun)", "1 grosse patate douce", "100g de haricots verts", "1 c. a soupe d''huile d''olive", "1 c. a cafe de paprika fume", "Sel et poivre", "1 c. a soupe de persil frais hache"]',
  ingredients_en = '["2 beef patties (125g each)", "1 large sweet potato", "100g green beans", "1 tbsp olive oil", "1 tsp smoked paprika", "Salt and pepper", "1 tbsp fresh parsley, chopped"]',
  steps_fr = '["Eplucher la patate douce et la couper en frites.", "Assaisonner de paprika, huile d''olive, sel et poivre, enfourner a 200C pendant 25 minutes.", "Cuire les haricots verts a la vapeur 6-8 minutes.", "Cuire les steaks haches dans une poele chaude 3-4 minutes de chaque cote.", "Dresser les steaks avec les frites de patate douce et les haricots.", "Parsemer de persil frais."]',
  steps_en = '["Peel sweet potato and cut into fries.", "Season with paprika, olive oil, salt and pepper, bake at 200C/400F for 25 minutes.", "Steam green beans for 6-8 minutes.", "Cook beef patties in a hot pan 3-4 minutes per side.", "Plate patties with sweet potato fries and green beans.", "Sprinkle with fresh parsley."]',
  prep_time_min = 10,
  cook_time_min = 25,
  servings = 2
WHERE name_fr = 'Steak haché patate douce';

-- 43. Thon en boite salade composee
UPDATE recipes SET
  ingredients_fr = '["1 boite de thon au naturel (140g egoutte)", "2 oeufs durs", "100g de tomates cerises", "1/2 concombre", "1/4 d''oignon rouge", "50g de mais en boite", "50g de mesclun", "1 c. a soupe d''huile d''olive", "1 c. a soupe de vinaigre de vin", "Sel et poivre"]',
  ingredients_en = '["1 can tuna in water (140g drained)", "2 hard-boiled eggs", "100g cherry tomatoes", "1/2 cucumber", "1/4 red onion", "50g canned corn", "50g mixed greens", "1 tbsp olive oil", "1 tbsp wine vinegar", "Salt and pepper"]',
  steps_fr = '["Cuire les oeufs durs (10 minutes dans l''eau bouillante) et les couper en quartiers.", "Egoutter le thon et l''emietter.", "Couper les tomates cerises en deux, le concombre en rondelles et l''oignon en fines lamelles.", "Disposer le mesclun dans une assiette.", "Ajouter le thon, les oeufs, les legumes et le mais.", "Assaisonner d''huile d''olive, vinaigre, sel et poivre."]',
  steps_en = '["Hard-boil eggs (10 minutes in boiling water) and cut into quarters.", "Drain tuna and flake it.", "Halve cherry tomatoes, slice cucumber and thinly slice onion.", "Arrange mixed greens on a plate.", "Add tuna, eggs, vegetables and corn.", "Dress with olive oil, vinegar, salt and pepper."]',
  prep_time_min = 15,
  cook_time_min = 10,
  servings = 1
WHERE name_fr = 'Thon en boîte salade composée';

-- 44. Wrap dinde avocat
UPDATE recipes SET
  ingredients_fr = '["150g de blanc de dinde", "2 tortillas de ble completes", "1 avocat", "50g de mesclun", "1 tomate", "2 c. a soupe de fromage frais", "1 c. a soupe de jus de citron", "1 c. a cafe de paprika", "Sel et poivre"]',
  ingredients_en = '["150g turkey breast", "2 whole wheat tortillas", "1 avocado", "50g mixed greens", "1 tomato", "2 tbsp cream cheese", "1 tbsp lemon juice", "1 tsp paprika", "Salt and pepper"]',
  steps_fr = '["Assaisonner la dinde de paprika, sel et poivre, puis la griller 5-6 minutes de chaque cote.", "Laisser reposer puis couper en lamelles.", "Ecraser l''avocat avec le jus de citron.", "Tartiner le fromage frais sur les tortillas.", "Ajouter la puree d''avocat, la dinde, le mesclun et la tomate en tranches.", "Rouler les wraps bien serres et couper en deux."]',
  steps_en = '["Season turkey with paprika, salt and pepper, then grill 5-6 minutes per side.", "Let rest then slice into strips.", "Mash avocado with lemon juice.", "Spread cream cheese on tortillas.", "Add avocado mash, turkey, mixed greens and sliced tomato.", "Roll wraps tightly and cut in half."]',
  prep_time_min = 10,
  cook_time_min = 12,
  servings = 2
WHERE name_fr = 'Wrap dinde avocat';

-- ============================================================
-- SNACK (14 recipes)
-- ============================================================

-- 45. Chips de fromage (keto)
UPDATE recipes SET
  ingredients_fr = '["100g de parmesan rape", "1 c. a cafe de paprika", "1/2 c. a cafe de poudre d''ail", "1/2 c. a cafe d''origan"]',
  ingredients_en = '["100g grated Parmesan", "1 tsp paprika", "1/2 tsp garlic powder", "1/2 tsp oregano"]',
  steps_fr = '["Prechauffer le four a 200C.", "Melanger le parmesan avec les epices.", "Deposer des petits tas de fromage sur une plaque recouverte de papier cuisson.", "Aplatir legerement chaque tas.", "Enfourner 5-7 minutes jusqu''a ce que les chips soient dorees.", "Laisser refroidir completement avant de decoller (elles durciront en refroidissant)."]',
  steps_en = '["Preheat oven to 200C/400F.", "Mix Parmesan with spices.", "Place small mounds of cheese on a parchment-lined baking sheet.", "Flatten each mound slightly.", "Bake 5-7 minutes until chips are golden.", "Let cool completely before removing (they will harden as they cool)."]',
  prep_time_min = 5,
  cook_time_min = 7,
  servings = 4
WHERE name_fr = 'Chips de fromage';

-- 46. Cottage cheese ananas
UPDATE recipes SET
  ingredients_fr = '["200g de cottage cheese", "100g d''ananas frais", "1 c. a cafe de miel", "1 c. a cafe de graines de lin"]',
  ingredients_en = '["200g cottage cheese", "100g fresh pineapple", "1 tsp honey", "1 tsp flax seeds"]',
  steps_fr = '["Couper l''ananas en petits des.", "Verser le cottage cheese dans un bol.", "Ajouter les des d''ananas sur le dessus.", "Saupoudrer de graines de lin et arroser de miel."]',
  steps_en = '["Cut pineapple into small cubes.", "Pour cottage cheese into a bowl.", "Add pineapple cubes on top.", "Sprinkle with flax seeds and drizzle with honey."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Cottage cheese ananas';

-- 47. Edamame sel
UPDATE recipes SET
  ingredients_fr = '["200g d''edamame en cosses (surgeles)", "1 c. a cafe de fleur de sel", "1 c. a cafe d''huile de sesame"]',
  ingredients_en = '["200g edamame in pods (frozen)", "1 tsp fleur de sel", "1 tsp sesame oil"]',
  steps_fr = '["Porter une grande casserole d''eau a ebullition.", "Cuire les edamame 4-5 minutes.", "Egoutter et transferer dans un bol.", "Arroser d''huile de sesame et saupoudrer de fleur de sel.", "Servir tiede ou a temperature ambiante."]',
  steps_en = '["Bring a large pot of water to a boil.", "Cook edamame for 4-5 minutes.", "Drain and transfer to a bowl.", "Drizzle with sesame oil and sprinkle with fleur de sel.", "Serve warm or at room temperature."]',
  prep_time_min = 2,
  cook_time_min = 5,
  servings = 2
WHERE name_fr = 'Edamame sel';

-- 48. Energy balls dattes cacao
UPDATE recipes SET
  ingredients_fr = '["100g de dattes Medjool denoyautees", "50g de flocons d''avoine", "2 c. a soupe de cacao en poudre non sucre", "2 c. a soupe de beurre d''amande", "1 c. a soupe de miel", "1 c. a soupe de graines de chia", "1 pincee de sel"]',
  ingredients_en = '["100g pitted Medjool dates", "50g rolled oats", "2 tbsp unsweetened cocoa powder", "2 tbsp almond butter", "1 tbsp honey", "1 tbsp chia seeds", "A pinch of salt"]',
  steps_fr = '["Mixer les dattes jusqu''a obtenir une pate collante.", "Ajouter les flocons d''avoine, le cacao, le beurre d''amande, le miel et le sel.", "Mixer jusqu''a obtenir un melange homogene.", "Incorporer les graines de chia et melanger.", "Former des boules d''environ 2cm avec les mains legerement humides.", "Refrigerer au moins 30 minutes avant de deguster."]',
  steps_en = '["Blend dates until a sticky paste forms.", "Add oats, cocoa, almond butter, honey and salt.", "Blend until mixture is homogeneous.", "Stir in chia seeds and mix.", "Form balls of about 2cm with slightly damp hands.", "Refrigerate at least 30 minutes before serving."]',
  prep_time_min = 15,
  cook_time_min = 0,
  servings = 8
WHERE name_fr = 'Energy balls dattes cacao';

-- 49. Fat bombs chocolat-coco (keto)
UPDATE recipes SET
  ingredients_fr = '["60g d''huile de coco", "30g de beurre de cacao", "2 c. a soupe de cacao en poudre non sucre", "1 c. a soupe d''erythritol", "20g de noix de coco rapee", "1 pincee de sel"]',
  ingredients_en = '["60g coconut oil", "30g cacao butter", "2 tbsp unsweetened cocoa powder", "1 tbsp erythritol", "20g shredded coconut", "A pinch of salt"]',
  steps_fr = '["Faire fondre l''huile de coco et le beurre de cacao au bain-marie.", "Ajouter le cacao en poudre et l''erythritol, bien melanger.", "Verser dans des moules a mini-muffins ou a glaçons.", "Saupoudrer de noix de coco rapee et d''une pincee de sel.", "Placer au congelateur 30 minutes minimum.", "Demouler et conserver au refrigerateur."]',
  steps_en = '["Melt coconut oil and cacao butter in a double boiler.", "Add cocoa powder and erythritol, mix well.", "Pour into mini muffin molds or ice cube trays.", "Sprinkle with shredded coconut and a pinch of salt.", "Freeze for at least 30 minutes.", "Unmold and store in the refrigerator."]',
  prep_time_min = 10,
  cook_time_min = 5,
  servings = 6
WHERE name_fr = 'Fat bombs chocolat-coco';

-- 50. Fromage blanc fruits rouges
UPDATE recipes SET
  ingredients_fr = '["200g de fromage blanc 0%", "80g de fruits rouges frais (fraises, framboises, myrtilles)", "1 c. a cafe de miel", "1 c. a cafe de graines de lin"]',
  ingredients_en = '["200g fat-free fromage blanc (or quark)", "80g fresh mixed berries (strawberries, raspberries, blueberries)", "1 tsp honey", "1 tsp flax seeds"]',
  steps_fr = '["Verser le fromage blanc dans un bol.", "Laver les fruits rouges et les disposer sur le fromage blanc.", "Arroser de miel.", "Saupoudrer de graines de lin et servir frais."]',
  steps_en = '["Pour fromage blanc into a bowl.", "Wash berries and arrange on top of the fromage blanc.", "Drizzle with honey.", "Sprinkle with flax seeds and serve chilled."]',
  prep_time_min = 5,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Fromage blanc fruits rouges';

-- 51. Guacamole et crudites
UPDATE recipes SET
  ingredients_fr = '["2 avocats murs", "1 tomate", "1/4 d''oignon rouge", "1 gousse d''ail", "Jus d''un citron vert", "1 pincee de piment de Cayenne", "Sel et poivre", "Batonnets de carotte, concombre et celeri"]',
  ingredients_en = '["2 ripe avocados", "1 tomato", "1/4 red onion", "1 garlic clove", "Juice of 1 lime", "A pinch of cayenne pepper", "Salt and pepper", "Carrot, cucumber and celery sticks"]',
  steps_fr = '["Ecraser les avocats a la fourchette dans un bol.", "Couper la tomate en petits des et l''oignon en brunoise.", "Ajouter la tomate, l''oignon, l''ail presse et le jus de citron vert.", "Assaisonner de sel, poivre et piment de Cayenne.", "Bien melanger et ajuster l''assaisonnement.", "Servir avec les batonnets de crudites."]',
  steps_en = '["Mash avocados with a fork in a bowl.", "Dice tomato and finely chop onion.", "Add tomato, onion, pressed garlic and lime juice.", "Season with salt, pepper and cayenne.", "Mix well and adjust seasoning.", "Serve with vegetable sticks."]',
  prep_time_min = 10,
  cook_time_min = 0,
  servings = 4
WHERE name_fr = 'Guacamole et crudités';

-- 52. Houmous crudites
UPDATE recipes SET
  ingredients_fr = '["200g de pois chiches en boite (egouttes)", "2 c. a soupe de tahini (puree de sesame)", "1 gousse d''ail", "Jus d''un citron", "2 c. a soupe d''huile d''olive", "1 c. a cafe de cumin", "Sel et paprika", "Batonnets de carotte, concombre et poivron"]',
  ingredients_en = '["200g canned chickpeas (drained)", "2 tbsp tahini (sesame paste)", "1 garlic clove", "Juice of 1 lemon", "2 tbsp olive oil", "1 tsp cumin", "Salt and paprika", "Carrot, cucumber and bell pepper sticks"]',
  steps_fr = '["Egoutter et rincer les pois chiches.", "Mixer les pois chiches avec le tahini, l''ail, le jus de citron et l''huile d''olive.", "Ajouter le cumin et le sel, mixer jusqu''a obtenir une texture lisse.", "Verser dans un bol et saupoudrer de paprika.", "Arroser d''un filet d''huile d''olive.", "Servir avec les batonnets de crudites."]',
  steps_en = '["Drain and rinse chickpeas.", "Blend chickpeas with tahini, garlic, lemon juice and olive oil.", "Add cumin and salt, blend until smooth.", "Pour into a bowl and sprinkle with paprika.", "Drizzle with a thread of olive oil.", "Serve with vegetable sticks."]',
  prep_time_min = 10,
  cook_time_min = 0,
  servings = 4
WHERE name_fr = 'Houmous crudités';

-- 53. Mix de noix (keto)
UPDATE recipes SET
  ingredients_fr = '["30g d''amandes", "20g de noix de cajou", "20g de noix de pecan", "15g de noix de macadamia", "10g de graines de courge", "1 pincee de sel", "1/2 c. a cafe de paprika fume"]',
  ingredients_en = '["30g almonds", "20g cashews", "20g pecans", "15g macadamia nuts", "10g pumpkin seeds", "A pinch of salt", "1/2 tsp smoked paprika"]',
  steps_fr = '["Prechauffer le four a 160C.", "Melanger toutes les noix et graines dans un bol.", "Assaisonner de sel et paprika fume.", "Etaler sur une plaque de cuisson.", "Torrefier au four 8-10 minutes en remuant a mi-cuisson.", "Laisser refroidir completement avant de deguster."]',
  steps_en = '["Preheat oven to 160C/325F.", "Mix all nuts and seeds in a bowl.", "Season with salt and smoked paprika.", "Spread on a baking sheet.", "Toast in oven 8-10 minutes, stirring halfway.", "Let cool completely before serving."]',
  prep_time_min = 5,
  cook_time_min = 10,
  servings = 2
WHERE name_fr = 'Mix de noix';

-- 54. Muffins banane avoine
UPDATE recipes SET
  ingredients_fr = '["2 bananes mures", "100g de flocons d''avoine", "2 oeufs", "2 c. a soupe de miel", "1 c. a cafe de levure chimique", "1 c. a cafe de cannelle", "50g de pepites de chocolat noir", "1 c. a cafe d''huile de coco"]',
  ingredients_en = '["2 ripe bananas", "100g rolled oats", "2 eggs", "2 tbsp honey", "1 tsp baking powder", "1 tsp cinnamon", "50g dark chocolate chips", "1 tsp coconut oil"]',
  steps_fr = '["Prechauffer le four a 180C.", "Ecraser les bananes et les mixer avec les flocons d''avoine, les oeufs, le miel et la cannelle.", "Ajouter la levure et les pepites de chocolat, melanger.", "Repartir la pate dans un moule a muffins graisse a l''huile de coco.", "Enfourner 18-20 minutes jusqu''a ce que les muffins soient dores.", "Laisser refroidir 5 minutes avant de demouler."]',
  steps_en = '["Preheat oven to 180C/350F.", "Mash bananas and blend with oats, eggs, honey and cinnamon.", "Add baking powder and chocolate chips, mix.", "Divide batter into a muffin tin greased with coconut oil.", "Bake 18-20 minutes until muffins are golden.", "Let cool 5 minutes before removing from tin."]',
  prep_time_min = 10,
  cook_time_min = 20,
  servings = 6
WHERE name_fr = 'Muffins banane avoine';

-- 55. Protein shake banane
UPDATE recipes SET
  ingredients_fr = '["30g de whey proteine vanille", "1 banane", "250ml de lait d''amande", "1 c. a soupe de beurre de cacahuete", "3 glacons"]',
  ingredients_en = '["30g vanilla whey protein", "1 banana", "250ml almond milk", "1 tbsp peanut butter", "3 ice cubes"]',
  steps_fr = '["Eplucher la banane et la couper en morceaux.", "Mettre tous les ingredients dans un blender.", "Mixer a haute vitesse pendant 30-45 secondes.", "Servir immediatement dans un grand verre."]',
  steps_en = '["Peel banana and cut into pieces.", "Put all ingredients in a blender.", "Blend on high speed for 30-45 seconds.", "Serve immediately in a tall glass."]',
  prep_time_min = 3,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Protein shake banane';

-- 56. Rice cakes beurre de cacahuete
UPDATE recipes SET
  ingredients_fr = '["2 galettes de riz", "2 c. a soupe de beurre de cacahuete", "1/2 banane", "1 c. a cafe de miel", "1 c. a cafe de graines de chia"]',
  ingredients_en = '["2 rice cakes", "2 tbsp peanut butter", "1/2 banana", "1 tsp honey", "1 tsp chia seeds"]',
  steps_fr = '["Tartiner chaque galette de riz avec 1 c. a soupe de beurre de cacahuete.", "Couper la banane en fines rondelles.", "Disposer les rondelles de banane sur le beurre de cacahuete.", "Arroser de miel et saupoudrer de graines de chia."]',
  steps_en = '["Spread each rice cake with 1 tbsp peanut butter.", "Slice banana into thin rounds.", "Arrange banana slices on the peanut butter.", "Drizzle with honey and sprinkle with chia seeds."]',
  prep_time_min = 3,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Rice cakes beurre de cacahuète';

-- 57. Yaourt grec miel noix
UPDATE recipes SET
  ingredients_fr = '["200g de yaourt grec nature", "1 c. a soupe de miel", "20g de noix concassees", "10g d''amandes effilees", "1 c. a cafe de graines de lin"]',
  ingredients_en = '["200g plain Greek yogurt", "1 tbsp honey", "20g crushed walnuts", "10g sliced almonds", "1 tsp flax seeds"]',
  steps_fr = '["Verser le yaourt grec dans un bol.", "Arroser genereusement de miel.", "Ajouter les noix concassees et les amandes effilees.", "Saupoudrer de graines de lin.", "Servir frais."]',
  steps_en = '["Pour Greek yogurt into a bowl.", "Drizzle generously with honey.", "Add crushed walnuts and sliced almonds.", "Sprinkle with flax seeds.", "Serve chilled."]',
  prep_time_min = 3,
  cook_time_min = 0,
  servings = 1
WHERE name_fr = 'Yaourt grec miel noix';

COMMIT;
