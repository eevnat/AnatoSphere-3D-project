// AnatoSphere 3D – anatomy knowledge base
// b = beginner text, a = advanced text. Each has: what / where / does
// layer: skin | muscle | organ | vessel | bone

export type Level = { what: string; where: string; does: string }
export type Structure = {
  id: string
  name: string
  system: string
  layer: 'skin' | 'muscle' | 'organ' | 'vessel' | 'bone'
  parent?: string
  aka?: string[]
  say?: string
  b: Level
  a: Level
  parts?: string[]
  facts?: string[]
  rel?: string[]
  clue?: string
}

export const systems = [
  { id: 'skeletal', name: 'Skeletal', icon: 'fa-bone', color: '#e8dcc0', blurb: 'The framework of bones that holds you up, protects organs and lets you move.' },
  { id: 'muscular', name: 'Muscular', icon: 'fa-dumbbell', color: '#d9534f', blurb: 'Muscles pull on bones to create every movement you make.' },
  { id: 'circulatory', name: 'Circulatory', icon: 'fa-heart-pulse', color: '#e0314b', blurb: 'The heart and blood vessels deliver oxygen and nutrients to every cell.' },
  { id: 'respiratory', name: 'Respiratory', icon: 'fa-lungs', color: '#f29bb0', blurb: 'Brings oxygen into the body and removes carbon dioxide.' },
  { id: 'digestive', name: 'Digestive', icon: 'fa-utensils', color: '#e9a23b', blurb: 'Breaks food into nutrients your body can absorb and use.' },
  { id: 'nervous', name: 'Nervous', icon: 'fa-brain', color: '#f3c66b', blurb: 'The body\'s control and communication network.' },
  { id: 'urinary', name: 'Urinary', icon: 'fa-droplet', color: '#e8d34d', blurb: 'Filters waste out of the blood and removes it as urine.' },
  { id: 'endocrine', name: 'Endocrine & Immune', icon: 'fa-flask', color: '#a78bfa', blurb: 'Glands that send chemical messages (hormones) plus organs that help fight infection.' },
  { id: 'integumentary', name: 'Skin', icon: 'fa-hand', color: '#e7b99a', blurb: 'Your skin – the body\'s largest organ and protective outer layer.' },
]

export const structures: Structure[] = [
  // ───────────── SKIN ─────────────
  {
    id: 'skin', name: 'Skin', system: 'integumentary', layer: 'skin', aka: ['epidermis', 'dermis', 'body'], say: 'skin',
    b: { what: 'The soft protective covering of your whole body.', where: 'All over the outside of the body.', does: 'Keeps germs out, holds water in, controls temperature with sweat and lets you feel touch, heat and pain.' },
    a: { what: 'The integument: stratified squamous epidermis over a connective-tissue dermis and subcutaneous hypodermis.', where: 'Covers the entire external surface, continuous with mucous membranes at body openings.', does: 'Barrier function, thermoregulation, vitamin D synthesis, sensory reception (mechano-, thermo-, nociceptors).' },
    facts: ['Skin is the largest organ – about 2 m² in an adult.', 'You shed around 30,000–40,000 skin cells every minute.'],
    rel: ['brain'], clue: 'The largest organ, covering the whole body',
  },

  // ───────────── SKELETAL ─────────────
  {
    id: 'skull', name: 'Skull', system: 'skeletal', layer: 'bone', aka: ['cranium', 'head bone'], say: 'skull',
    b: { what: 'The hard bony case of your head.', where: 'In the head, surrounding the brain.', does: 'Protects the brain and shapes the face. It also holds the eyes, ears and teeth.' },
    a: { what: 'Composed of 22 bones: 8 cranial (neurocranium) and 14 facial (viscerocranium), joined by sutures.', where: 'Superior to the vertebral column, articulating with the atlas (C1).', does: 'Encloses the brain within the cranial cavity, houses the special sense organs and forms the openings for the respiratory and digestive tracts.' },
    facts: ['A baby\'s skull has soft spots (fontanelles) so it can squeeze through birth.', 'The only skull bone that moves freely is the jaw (mandible).'],
    rel: ['brain', 'mandible', 'spine'], clue: 'Bony case that protects the brain',
  },
  {
    id: 'mandible', name: 'Mandible (Jaw)', system: 'skeletal', layer: 'bone', aka: ['jaw', 'jawbone', 'mouth'], say: 'MAN-dih-bul',
    b: { what: 'Your lower jaw bone.', where: 'The bottom part of your face.', does: 'Moves up and down so you can chew, talk and bite. It holds your lower teeth.' },
    a: { what: 'The largest and strongest facial bone, U-shaped with a body and two rami.', where: 'Articulates with the temporal bones at the temporomandibular joints (TMJ).', does: 'Mastication and speech; anchors the lower dentition and muscles of mastication.' },
    facts: ['It\'s the only bone in the skull that can move.', 'It is the strongest bone in the face.'],
    rel: ['skull', 'esophagus'], clue: 'The only movable bone in the skull',
  },
  {
    id: 'spine', name: 'Spine (Vertebral Column)', system: 'skeletal', layer: 'bone', aka: ['backbone', 'vertebrae', 'vertebral column', 'vertebra'], say: 'VER-tuh-brul KOL-um',
    b: { what: 'A stack of small bones running down your back.', where: 'Down the middle of the back, from skull to hips.', does: 'Holds your body upright, lets you bend and twist, and protects the spinal cord inside it.' },
    a: { what: '33 vertebrae: 7 cervical, 12 thoracic, 5 lumbar, 5 fused sacral, 4 coccygeal, separated by intervertebral discs.', where: 'Posterior midline from the occiput to the coccyx, with cervical/lumbar lordosis and thoracic/sacral kyphosis.', does: 'Axial support, transmission of body weight, flexible movement, and protection of the spinal cord within the vertebral canal.' },
    facts: ['Giraffes and humans both have 7 neck vertebrae.', 'Its S-shape works like a spring to absorb shock when you walk.'],
    rel: ['spinal_cord', 'skull', 'pelvis', 'ribcage'], clue: 'A column of stacked bones protecting the spinal cord',
  },
  {
    id: 'ribcage', name: 'Rib Cage', system: 'skeletal', layer: 'bone', aka: ['ribs', 'rib', 'thoracic cage'], say: 'rib cayj',
    b: { what: 'A cage made of curved bones called ribs.', where: 'Around your chest.', does: 'Protects the heart and lungs, and moves when you breathe.' },
    a: { what: '12 pairs of ribs: 7 true (vertebrosternal), 3 false (vertebrochondral), 2 floating.', where: 'Thorax, articulating posteriorly with thoracic vertebrae and anteriorly (via costal cartilage) with the sternum.', does: 'Protects thoracic viscera and supports ventilation via intercostal muscle action.' },
    facts: ['Most people have 24 ribs – men and women have the same number.', 'The bottom 2 pairs are "floating" – they don\'t attach at the front.'],
    rel: ['sternum', 'heart', 'lungs', 'spine'], clue: 'Curved bones forming a protective cage around the chest',
  },
  {
    id: 'sternum', name: 'Sternum (Breastbone)', system: 'skeletal', layer: 'bone', aka: ['breastbone', 'breast bone'], say: 'STER-num',
    b: { what: 'A flat bone in the middle of your chest.', where: 'Front center of the chest.', does: 'Connects the ribs at the front and shields the heart.' },
    a: { what: 'Flat bone with three parts: manubrium, body and xiphoid process.', where: 'Anterior midline of the thorax.', does: 'Anchors the costal cartilages and clavicles; site for bone-marrow sampling.' },
    facts: ['During CPR you press on the sternum to squeeze the heart.'],
    rel: ['ribcage', 'clavicle', 'heart'], clue: 'Flat bone in the middle of the chest where ribs meet',
  },
  {
    id: 'clavicle', name: 'Clavicle (Collarbone)', system: 'skeletal', layer: 'bone', aka: ['collarbone', 'collar bone'], say: 'KLAV-ih-kul',
    b: { what: 'A long thin bone across the top of your chest.', where: 'Between the base of the neck and the shoulder, one on each side.', does: 'Connects the arm to the body and keeps the shoulder in place.' },
    a: { what: 'S-shaped long bone forming the anterior part of the pectoral girdle.', where: 'Articulates medially with the manubrium (sternoclavicular joint) and laterally with the acromion (acromioclavicular joint).', does: 'Acts as a strut holding the upper limb away from the trunk; transmits forces from the arm to the axial skeleton.' },
    facts: ['It is one of the most commonly broken bones.', 'It is the first bone to start hardening in a developing baby.'],
    rel: ['sternum', 'humerus'], clue: 'The collarbone',
  },
  {
    id: 'humerus', name: 'Humerus', system: 'skeletal', layer: 'bone', aka: ['upper arm bone', 'arm bone'], say: 'HYOO-mer-us',
    b: { what: 'The long bone in your upper arm.', where: 'Between the shoulder and the elbow.', does: 'Gives your arm its length and strength and lets your shoulder and elbow move.' },
    a: { what: 'Long bone with a proximal head, anatomical and surgical necks, shaft and distal condyles.', where: 'Articulates with the glenoid of the scapula proximally and the radius and ulna distally.', does: 'Lever arm for shoulder and elbow movement; attachment for deltoid, biceps, triceps and rotator cuff.' },
    facts: ['Hitting your "funny bone" is actually hitting the ulnar nerve next to the humerus.'],
    rel: ['radius_ulna', 'biceps', 'deltoid', 'ulnar_nerve'], clue: 'The long bone of the upper arm',
  },
  {
    id: 'radius_ulna', name: 'Radius & Ulna', system: 'skeletal', layer: 'bone', aka: ['radius', 'ulna', 'forearm', 'forearm bones'], say: 'RAY-dee-us and UL-nuh',
    b: { what: 'The two bones of your forearm.', where: 'Between the elbow and the wrist.', does: 'Let you twist your hand palm-up and palm-down.' },
    a: { what: 'Parallel long bones joined by an interosseous membrane; radius lateral, ulna medial.', where: 'Forearm, articulating with the humerus proximally and the carpals distally.', does: 'Pronation and supination via rotation of the radius around the ulna.' },
    facts: ['The radius is on the thumb side; the ulna is on the little-finger side.'],
    rel: ['humerus', 'ulnar_nerve'], clue: 'The two bones of the forearm',
  },
  {
    id: 'pelvis', name: 'Pelvis', system: 'skeletal', layer: 'bone', aka: ['hip bone', 'hips', 'hip', 'sacrum'], say: 'PEL-vis',
    b: { what: 'A bowl-shaped ring of bones at your hips.', where: 'At the bottom of the trunk, connecting the spine to the legs.', does: 'Carries your upper body weight to your legs and protects the bladder and lower organs.' },
    a: { what: 'Pelvic girdle: two hip bones (ilium, ischium, pubis) plus the sacrum and coccyx.', where: 'Inferior trunk; articulates with the sacrum (sacroiliac joints) and femurs (acetabulum).', does: 'Weight transfer, attachment for trunk and lower-limb muscles, protection of pelvic viscera.' },
    facts: ['The female pelvis is usually wider and rounder to allow childbirth.'],
    rel: ['femur', 'spine', 'bladder'], clue: 'Bowl-shaped bones connecting the spine to the legs',
  },
  {
    id: 'femur', name: 'Femur (Thigh Bone)', system: 'skeletal', layer: 'bone', aka: ['thigh bone', 'thighbone', 'leg bone'], say: 'FEE-mur',
    b: { what: 'The long bone in your thigh – the biggest bone in your body.', where: 'Between the hip and the knee.', does: 'Supports your weight when standing and walking and lets the hip and knee move.' },
    a: { what: 'The longest and strongest long bone, with head, neck, greater/lesser trochanters, shaft and condyles.', where: 'Articulates with the acetabulum of the pelvis and the tibia and patella at the knee.', does: 'Weight bearing, locomotion; contains red marrow for blood cell production.' },
    facts: ['The femur is about a quarter of your height.', 'It is stronger than concrete of the same weight.'],
    rel: ['pelvis', 'patella', 'tibia_fibula', 'quadriceps'], clue: 'The longest, strongest bone in the body',
  },
  {
    id: 'patella', name: 'Patella (Kneecap)', system: 'skeletal', layer: 'bone', aka: ['kneecap', 'knee cap', 'knee'], say: 'puh-TEL-uh',
    b: { what: 'A small round bone at the front of your knee.', where: 'In front of the knee joint.', does: 'Protects the knee and helps your thigh muscles straighten the leg.' },
    a: { what: 'The largest sesamoid bone, embedded in the quadriceps tendon.', where: 'Anterior to the femoral condyles.', does: 'Increases the lever arm of the quadriceps for knee extension.' },
    facts: ['Babies are born with kneecaps made of cartilage – they turn to bone around age 3–5.'],
    rel: ['femur', 'quadriceps', 'tibia_fibula'], clue: 'The kneecap',
  },
  {
    id: 'tibia_fibula', name: 'Tibia & Fibula', system: 'skeletal', layer: 'bone', aka: ['tibia', 'fibula', 'shin', 'shin bone', 'lower leg'], say: 'TIB-ee-uh and FIB-yoo-luh',
    b: { what: 'The two bones of your lower leg.', where: 'Between the knee and the ankle.', does: 'The thick tibia (shin bone) carries your weight; the thin fibula supports muscles and the ankle.' },
    a: { what: 'Tibia: medial weight-bearing long bone. Fibula: slender lateral bone for muscle attachment.', where: 'Leg, articulating with the femur (tibia only) and with the talus at the ankle.', does: 'Weight transmission (tibia) and ankle stability (lateral malleolus of fibula).' },
    facts: ['The tibia is the second-longest bone in the body.'],
    rel: ['femur', 'patella', 'gastrocnemius'], clue: 'The two bones of the lower leg (shin)',
  },

  // ───────────── MUSCULAR ─────────────
  {
    id: 'pectoralis', name: 'Pectoralis Major', system: 'muscular', layer: 'muscle', aka: ['chest muscle', 'pecs', 'pectoral'], say: 'pek-tor-AL-is MAY-jer',
    b: { what: 'The big fan-shaped chest muscle.', where: 'Front of the chest, over the ribs.', does: 'Pulls your arm across your body and forward – used in push-ups and hugging.' },
    a: { what: 'Thick fan-shaped muscle with clavicular and sternocostal heads.', where: 'Origin: clavicle, sternum, costal cartilages. Insertion: lateral lip of the bicipital groove of the humerus.', does: 'Adduction, medial rotation and flexion of the humerus at the shoulder.' },
    facts: ['It is the muscle you see working in a bench press.'],
    rel: ['humerus', 'sternum', 'deltoid'], clue: 'The large fan-shaped chest muscle',
  },
  {
    id: 'deltoid', name: 'Deltoid', system: 'muscular', layer: 'muscle', aka: ['shoulder muscle', 'shoulder', 'delts'], say: 'DEL-toyd',
    b: { what: 'The rounded muscle that caps your shoulder.', where: 'Over the shoulder joint.', does: 'Lifts your arm out to the side, forward and back.' },
    a: { what: 'Triangular muscle with anterior, middle and posterior fibres.', where: 'Origin: clavicle, acromion, spine of scapula. Insertion: deltoid tuberosity of the humerus.', does: 'Primary abductor of the arm beyond 15°; assists flexion and extension.' },
    facts: ['Its name comes from the Greek letter delta (Δ) because of its triangle shape.', 'It is a common site for vaccine injections.'],
    rel: ['humerus', 'clavicle', 'pectoralis'], clue: 'The triangular muscle capping the shoulder',
  },
  {
    id: 'biceps', name: 'Biceps Brachii', system: 'muscular', layer: 'muscle', aka: ['biceps', 'bicep', 'arm muscle'], say: 'BY-seps BRAY-kee-eye',
    b: { what: 'The muscle at the front of your upper arm.', where: 'Front of the upper arm.', does: 'Bends your elbow and turns your palm up – like lifting a cup.' },
    a: { what: 'Two-headed muscle (long and short head).', where: 'Origin: supraglenoid tubercle and coracoid process. Insertion: radial tuberosity.', does: 'Flexion of the elbow and powerful supination of the forearm.' },
    facts: ['"Biceps" means "two heads" – it starts as two parts.', 'Muscles can only pull, never push; the triceps straightens the arm.'],
    rel: ['humerus', 'radius_ulna'], clue: 'Front upper-arm muscle that bends the elbow',
  },
  {
    id: 'rectus_abdominis', name: 'Rectus Abdominis', system: 'muscular', layer: 'muscle', aka: ['abs', 'six pack', 'abdominal muscles', 'stomach muscles'], say: 'REK-tus ab-DOM-ih-nis',
    b: { what: 'The "six-pack" muscle of your belly.', where: 'Front of the abdomen, from ribs to pelvis.', does: 'Bends your body forward (like a sit-up) and protects the organs inside.' },
    a: { what: 'Paired strap muscle divided by tendinous intersections, enclosed in the rectus sheath.', where: 'Origin: pubic crest/symphysis. Insertion: xiphoid process and costal cartilages 5–7.', does: 'Trunk flexion, increases intra-abdominal pressure (forced expiration, defecation).' },
    facts: ['Everyone has a "six-pack" – it\'s just usually covered by fat.'],
    rel: ['ribcage', 'pelvis', 'small_intestine'], clue: 'The "six-pack" muscle of the belly',
  },
  {
    id: 'quadriceps', name: 'Quadriceps', system: 'muscular', layer: 'muscle', aka: ['quads', 'thigh muscle', 'quadriceps femoris'], say: 'KWAD-rih-seps',
    b: { what: 'A group of four big muscles at the front of your thigh.', where: 'Front of the thigh.', does: 'Straightens your knee – used for walking, kicking, jumping and standing up.' },
    a: { what: 'Rectus femoris, vastus lateralis, vastus medialis and vastus intermedius.', where: 'Anterior thigh, converging on the quadriceps tendon, patella and patellar ligament.', does: 'Knee extension; rectus femoris also flexes the hip.' },
    facts: ['It is one of the strongest muscle groups in the body.', 'Tapping below the kneecap triggers the knee-jerk reflex via the quadriceps.'],
    rel: ['femur', 'patella'], clue: 'Four muscles at the front of the thigh that straighten the knee',
  },
  {
    id: 'gastrocnemius', name: 'Gastrocnemius (Calf)', system: 'muscular', layer: 'muscle', aka: ['calf', 'calf muscle'], say: 'gas-trok-NEE-mee-us',
    b: { what: 'The big muscle at the back of your lower leg – your calf.', where: 'Back of the lower leg.', does: 'Lifts your heel so you can stand on tiptoe, walk, run and jump.' },
    a: { what: 'Two-headed superficial muscle of the posterior leg.', where: 'Origin: femoral condyles. Insertion: calcaneus via the Achilles (calcaneal) tendon.', does: 'Plantarflexion of the ankle and flexion of the knee.' },
    facts: ['It connects to the Achilles tendon, the thickest tendon in the body.'],
    rel: ['tibia_fibula', 'femur', 'sciatic_nerve'], clue: 'The calf muscle that lets you stand on tiptoe',
  },

  // ───────────── CIRCULATORY ─────────────
  {
    id: 'heart', name: 'Heart', system: 'circulatory', layer: 'organ', aka: ['cardiac', 'cardio'], say: 'hart',
    b: { what: 'A strong muscular pump about the size of your fist.', where: 'In the chest, between the lungs, tilted slightly to the left.', does: 'Pumps blood all around your body, carrying oxygen and food to every cell, about 100,000 times a day.' },
    a: { what: 'Four-chambered muscular organ (myocardium) enclosed in the pericardium.', where: 'Middle mediastinum, apex at the left 5th intercostal space, mid-clavicular line.', does: 'Dual pump: the right side drives pulmonary circulation, the left side drives systemic circulation; electrical rhythm set by the SA node.' },
    parts: ['right_atrium', 'left_atrium', 'right_ventricle', 'left_ventricle', 'aortic_arch', 'pulmonary_trunk', 'superior_vena_cava'],
    facts: ['Your heart beats about 35 million times a year.', 'It pumps around 7,500 litres of blood every day.', 'The heart has its own electrical system – it can beat even outside the body for a short time.'],
    rel: ['lungs', 'aorta', 'vena_cava', 'ribcage'], clue: 'A fist-sized muscular pump that moves blood',
  },
  {
    id: 'right_atrium', name: 'Right Atrium', system: 'circulatory', layer: 'organ', parent: 'heart', aka: ['RA'], say: 'AY-tree-um',
    b: { what: 'The upper right room of the heart.', where: 'Top right part of the heart.', does: 'Collects used (low-oxygen) blood coming back from the body.' },
    a: { what: 'Thin-walled receiving chamber containing the sinoatrial (SA) node.', where: 'Right superior heart; receives the SVC, IVC and coronary sinus.', does: 'Receives deoxygenated systemic venous return and passes it to the RV through the tricuspid valve.' },
    facts: ['The heart\'s natural pacemaker (SA node) lives in the right atrium.'],
    rel: ['right_ventricle', 'superior_vena_cava', 'vena_cava'], clue: 'Heart chamber that receives low-oxygen blood from the body',
  },
  {
    id: 'right_ventricle', name: 'Right Ventricle', system: 'circulatory', layer: 'organ', parent: 'heart', aka: ['RV'], say: 'VEN-trih-kul',
    b: { what: 'The lower right pumping room of the heart.', where: 'Bottom right (front) part of the heart.', does: 'Pumps used blood to the lungs to pick up fresh oxygen.' },
    a: { what: 'Crescent-shaped chamber with trabeculae carneae and moderator band.', where: 'Forms most of the anterior (sternocostal) surface of the heart.', does: 'Ejects deoxygenated blood through the pulmonary valve into the pulmonary trunk (low-pressure circuit).' },
    facts: ['Its wall is thinner than the left ventricle because the lungs are close by.'],
    rel: ['right_atrium', 'pulmonary_trunk', 'lungs'], clue: 'Heart chamber that pumps blood to the lungs',
  },
  {
    id: 'left_atrium', name: 'Left Atrium', system: 'circulatory', layer: 'organ', parent: 'heart', aka: ['LA'], say: 'AY-tree-um',
    b: { what: 'The upper left room of the heart.', where: 'Top left, at the back of the heart.', does: 'Receives fresh, oxygen-rich blood coming from the lungs.' },
    a: { what: 'Smooth-walled posterior chamber receiving four pulmonary veins.', where: 'Forms most of the base (posterior surface) of the heart.', does: 'Passes oxygenated blood to the LV through the mitral (bicuspid) valve.' },
    facts: ['Atrial fibrillation – an irregular heartbeat – often starts near the left atrium.'],
    rel: ['left_ventricle', 'lungs'], clue: 'Heart chamber that receives oxygen-rich blood from the lungs',
  },
  {
    id: 'left_ventricle', name: 'Left Ventricle', system: 'circulatory', layer: 'organ', parent: 'heart', aka: ['LV'], say: 'VEN-trih-kul',
    b: { what: 'The strongest pumping room of the heart.', where: 'Bottom left part of the heart, forming its pointed tip.', does: 'Pushes oxygen-rich blood out to the whole body through the aorta.' },
    a: { what: 'Thick-walled (~1 cm) conical chamber forming the cardiac apex.', where: 'Left inferior heart, posterior and to the left of the RV.', does: 'Generates systemic pressure (~120 mmHg) to eject blood through the aortic valve.' },
    facts: ['Its wall is about three times thicker than the right ventricle.', 'The "beat" you feel on your chest is the tip of the left ventricle.'],
    rel: ['left_atrium', 'aortic_arch', 'aorta'], clue: 'The strongest heart chamber, pumping blood to the whole body',
  },
  {
    id: 'aortic_arch', name: 'Aortic Arch', system: 'circulatory', layer: 'vessel', parent: 'heart', aka: ['arch of aorta'], say: 'ay-OR-tik arch',
    b: { what: 'The curved start of the body\'s biggest artery.', where: 'Rising from the top of the heart and curving back like a candy cane.', does: 'Carries oxygen-rich blood away from the heart and sends branches to the head and arms.' },
    a: { what: 'Continuation of the ascending aorta giving off the brachiocephalic trunk, left common carotid and left subclavian arteries.', where: 'Superior mediastinum at the level of the T4 vertebra.', does: 'Distributes systemic arterial blood; contains baroreceptors that sense blood pressure.' },
    facts: ['Pressure sensors in the arch help your brain control blood pressure every second.'],
    rel: ['left_ventricle', 'aorta', 'carotid'], clue: 'The candy-cane curve of the main artery above the heart',
  },
  {
    id: 'pulmonary_trunk', name: 'Pulmonary Trunk', system: 'circulatory', layer: 'vessel', parent: 'heart', aka: ['pulmonary artery', 'pulmonary arteries'], say: 'PUL-muh-nair-ee',
    b: { what: 'The large tube that takes blood from the heart to the lungs.', where: 'Top front of the heart, splitting into left and right branches.', does: 'Carries used blood to the lungs to collect oxygen.' },
    a: { what: 'Short wide vessel bifurcating into right and left pulmonary arteries.', where: 'Arises from the RV infundibulum, anterior to the ascending aorta.', does: 'Conducts deoxygenated blood – the only arteries in adults carrying low-oxygen blood.' },
    facts: ['Pulmonary arteries are the only arteries that carry low-oxygen blood.'],
    rel: ['right_ventricle', 'lungs'], clue: 'Vessel carrying blood from the heart to the lungs',
  },
  {
    id: 'superior_vena_cava', name: 'Superior Vena Cava', system: 'circulatory', layer: 'vessel', parent: 'heart', aka: ['SVC'], say: 'VEE-nuh KAY-vuh',
    b: { what: 'A large vein bringing blood back from the upper body.', where: 'Above the right side of the heart.', does: 'Returns used blood from the head, neck and arms into the right atrium.' },
    a: { what: 'Valveless great vein formed by union of the brachiocephalic veins.', where: 'Right superior mediastinum, draining into the RA.', does: 'Venous return from structures superior to the diaphragm (except lungs and heart).' },
    rel: ['right_atrium', 'vena_cava'], clue: 'Large vein returning blood from the upper body',
  },
  {
    id: 'aorta', name: 'Descending Aorta', system: 'circulatory', layer: 'vessel', aka: ['aorta', 'main artery', 'abdominal aorta'], say: 'ay-OR-tuh',
    b: { what: 'The body\'s main artery – the biggest blood pipe.', where: 'Running down the back of the chest and belly, in front of the spine.', does: 'Carries oxygen-rich blood from the heart to the organs and legs.' },
    a: { what: 'Thoracic and abdominal aorta, elastic artery ~2.5 cm diameter.', where: 'Posterior mediastinum, through the aortic hiatus (T12), bifurcating at L4 into the common iliac arteries.', does: 'Systemic distribution via intercostal, celiac, mesenteric, renal and gonadal branches.' },
    facts: ['It is about as wide as a garden hose.'],
    rel: ['aortic_arch', 'femoral_artery', 'kidneys'], clue: 'The body\'s largest artery',
  },
  {
    id: 'vena_cava', name: 'Inferior Vena Cava', system: 'circulatory', layer: 'vessel', aka: ['vena cava', 'IVC', 'big vein'], say: 'VEE-nuh KAY-vuh',
    b: { what: 'The body\'s largest vein.', where: 'Running up the right side of the belly to the heart.', does: 'Brings used blood from the legs and belly back to the heart.' },
    a: { what: 'Large valveless vein formed by the union of the common iliac veins at L5.', where: 'Right of the aorta, passing through the diaphragm at T8 into the RA.', does: 'Venous return from the lower limbs, pelvis and abdomen.' },
    facts: ['It is the largest vein in the human body.'],
    rel: ['right_atrium', 'liver', 'kidneys'], clue: 'The largest vein, returning blood from the lower body',
  },
  {
    id: 'carotid', name: 'Carotid Arteries', system: 'circulatory', layer: 'vessel', aka: ['carotid', 'neck artery'], say: 'kuh-ROT-id',
    b: { what: 'Two arteries in your neck.', where: 'Either side of the neck – where you can feel a pulse.', does: 'Carry oxygen-rich blood up to the brain and face.' },
    a: { what: 'Common carotid arteries dividing into internal and external carotids at C3–C4.', where: 'Within the carotid sheath alongside the internal jugular vein and vagus nerve.', does: 'Supply the brain (internal carotid) and face/scalp (external carotid); carotid sinus senses blood pressure.' },
    facts: ['You can check your pulse by gently pressing beside your windpipe.'],
    rel: ['aortic_arch', 'brain'], clue: 'Neck arteries supplying the brain',
  },
  {
    id: 'femoral_artery', name: 'Femoral Arteries', system: 'circulatory', layer: 'vessel', aka: ['femoral artery', 'leg artery', 'iliac'], say: 'FEM-er-ul',
    b: { what: 'The main arteries of the legs.', where: 'Running down the inner thighs.', does: 'Carry oxygen-rich blood to the leg muscles.' },
    a: { what: 'Continuation of the external iliac arteries beyond the inguinal ligament.', where: 'Femoral triangle, then adductor canal, becoming the popliteal artery.', does: 'Primary arterial supply to the lower limb; common access route for heart catheterisation.' },
    rel: ['aorta', 'quadriceps', 'femur'], clue: 'Main arteries of the legs',
  },

  // ───────────── RESPIRATORY ─────────────
  {
    id: 'larynx', name: 'Larynx (Voice Box)', system: 'respiratory', layer: 'organ', aka: ['voice box', 'adams apple', 'vocal cords'], say: 'LAIR-inks',
    b: { what: 'Your voice box.', where: 'Top of the windpipe, in the front of the neck.', does: 'Makes sound when air passes over the vocal cords, and closes to stop food going into the lungs.' },
    a: { what: 'Cartilaginous framework (thyroid, cricoid, arytenoid cartilages, epiglottis) housing the vocal folds.', where: 'Anterior neck at C3–C6, between pharynx and trachea.', does: 'Phonation, airway protection during swallowing (epiglottis), and regulation of airflow.' },
    facts: ['The "Adam\'s apple" is the front of the thyroid cartilage of the larynx.'],
    rel: ['trachea', 'thyroid', 'esophagus'], clue: 'The voice box',
  },
  {
    id: 'trachea', name: 'Trachea (Windpipe)', system: 'respiratory', layer: 'organ', aka: ['windpipe', 'airway'], say: 'TRAY-kee-uh',
    b: { what: 'Your windpipe – a tube for air.', where: 'Front of the neck, running down into the chest.', does: 'Carries air from your throat down to your lungs.' },
    a: { what: 'Fibrocartilaginous tube with 16–20 C-shaped hyaline cartilage rings, lined with ciliated pseudostratified epithelium.', where: 'From C6 to the carina at T4/T5, anterior to the oesophagus.', does: 'Conducts air; mucociliary escalator clears inhaled particles.' },
    facts: ['C-shaped rings keep it open; the open side lets your food pipe expand when you swallow.'],
    rel: ['larynx', 'lungs', 'esophagus'], clue: 'The windpipe carrying air to the lungs',
  },
  {
    id: 'lungs', name: 'Lungs', system: 'respiratory', layer: 'organ', aka: ['lung', 'pulmonary'], say: 'lungz',
    b: { what: 'Two spongy, air-filled organs.', where: 'In the chest, on either side of the heart, protected by the ribs.', does: 'Take oxygen from the air into your blood and remove carbon dioxide when you breathe out.' },
    a: { what: 'Paired organs: right lung (3 lobes), left lung (2 lobes, cardiac notch), containing ~300–500 million alveoli.', where: 'Thoracic cavity within the pleural sacs, apex above the clavicle, base on the diaphragm.', does: 'Gas exchange across the alveolar-capillary membrane; also filters small clots and helps regulate pH.' },
    parts: ['right_lung', 'left_lung', 'bronchi'],
    facts: ['Spread out, the inner surface of your lungs would cover half a tennis court.', 'The left lung is smaller to make room for the heart.'],
    rel: ['trachea', 'heart', 'diaphragm', 'ribcage'], clue: 'Spongy organs where oxygen enters the blood',
  },
  {
    id: 'right_lung', name: 'Right Lung', system: 'respiratory', layer: 'organ', parent: 'lungs', say: 'right lung',
    b: { what: 'The larger lung, on your right side.', where: 'Right side of the chest.', does: 'Exchanges oxygen and carbon dioxide. It has 3 sections (lobes).' },
    a: { what: 'Three lobes (superior, middle, inferior) separated by horizontal and oblique fissures.', where: 'Right pleural cavity, superior to the liver.', does: 'Gas exchange; receives ~55% of ventilation.' },
    rel: ['left_lung', 'bronchi', 'liver'], clue: 'The larger, three-lobed lung',
  },
  {
    id: 'left_lung', name: 'Left Lung', system: 'respiratory', layer: 'organ', parent: 'lungs', say: 'left lung',
    b: { what: 'The smaller lung, on your left side.', where: 'Left side of the chest, wrapped around the heart.', does: 'Exchanges oxygen and carbon dioxide. It has 2 lobes and a dip for the heart.' },
    a: { what: 'Two lobes (superior, inferior) with the cardiac notch and lingula.', where: 'Left pleural cavity.', does: 'Gas exchange; accommodates the heart via the cardiac impression.' },
    rel: ['right_lung', 'heart', 'bronchi'], clue: 'The smaller, two-lobed lung with a notch for the heart',
  },
  {
    id: 'bronchi', name: 'Bronchi', system: 'respiratory', layer: 'organ', parent: 'lungs', aka: ['bronchus', 'bronchial tubes'], say: 'BRONG-kye',
    b: { what: 'The two branches of the windpipe.', where: 'Where the windpipe splits, going into each lung.', does: 'Carry air into each lung, then branch again and again like a tree.' },
    a: { what: 'Right and left main bronchi branching into lobar, segmental bronchi and bronchioles (the bronchial tree).', where: 'From the carina at T4/T5 into each lung hilum.', does: 'Air conduction; the right main bronchus is wider and more vertical (common site for inhaled objects).' },
    facts: ['The airways branch about 23 times before reaching the air sacs.'],
    rel: ['trachea', 'right_lung', 'left_lung'], clue: 'Two branches of the windpipe entering the lungs',
  },
  {
    id: 'diaphragm', name: 'Diaphragm', system: 'respiratory', layer: 'organ', aka: ['breathing muscle'], say: 'DY-uh-fram',
    b: { what: 'A dome-shaped sheet of muscle under the lungs.', where: 'Between the chest and the belly.', does: 'Moves down to pull air into the lungs and relaxes up to push it out. It is your main breathing muscle.' },
    a: { what: 'Musculotendinous dome with a central tendon, innervated by the phrenic nerve (C3–C5).', where: 'Separates the thoracic and abdominal cavities; openings for the IVC (T8), oesophagus (T10) and aorta (T12).', does: 'Primary muscle of inspiration – contraction flattens the dome and expands thoracic volume.' },
    facts: ['Hiccups are sudden spasms of the diaphragm.', '"C3, 4, 5 keeps the diaphragm alive" – the nerve roots that control it.'],
    rel: ['lungs', 'liver', 'stomach'], clue: 'Dome-shaped main breathing muscle under the lungs',
  },

  // ───────────── DIGESTIVE ─────────────
  {
    id: 'esophagus', name: 'Esophagus (Food Pipe)', system: 'digestive', layer: 'organ', aka: ['oesophagus', 'food pipe', 'gullet'], say: 'ih-SOF-uh-gus',
    b: { what: 'A muscular tube for food.', where: 'From the throat, behind the windpipe, down to the stomach.', does: 'Squeezes swallowed food down to the stomach in waves (even if you\'re upside down!).' },
    a: { what: '~25 cm muscular tube; upper third skeletal muscle, lower third smooth muscle.', where: 'From C6 (pharynx) through the posterior mediastinum and the diaphragm at T10 to the cardia of the stomach.', does: 'Peristaltic transport of the food bolus; lower oesophageal sphincter prevents reflux.' },
    facts: ['Food takes about 7 seconds to travel down.', 'Heartburn is stomach acid leaking up into the esophagus.'],
    rel: ['stomach', 'trachea', 'larynx'], clue: 'Muscular tube carrying food to the stomach',
  },
  {
    id: 'stomach', name: 'Stomach', system: 'digestive', layer: 'organ', aka: ['gastric', 'belly'], say: 'STUM-uk',
    b: { what: 'A stretchy, J-shaped bag of muscle.', where: 'Upper left side of the belly, under the ribs.', does: 'Stores food and mixes it with acid and enzymes to turn it into a soupy mixture.' },
    a: { what: 'J-shaped organ with cardia, fundus, body and pylorus; rugae allow expansion.', where: 'Left upper quadrant/epigastrium, inferior to the diaphragm.', does: 'Mechanical churning; HCl and pepsin begin protein digestion; produces intrinsic factor for B12 absorption.' },
    facts: ['Stomach acid is strong enough to dissolve metal – a mucus layer protects the lining.', 'It can stretch to hold about 1–1.5 litres.'],
    rel: ['esophagus', 'small_intestine', 'liver', 'pancreas'], clue: 'J-shaped bag that churns food with acid',
  },
  {
    id: 'liver', name: 'Liver', system: 'digestive', layer: 'organ', aka: ['hepatic'], say: 'LIV-er',
    b: { what: 'A large, reddish-brown organ – the body\'s chemical factory.', where: 'Upper right side of the belly, under the ribs.', does: 'Cleans toxins from the blood, makes bile to digest fat, and stores energy and vitamins.' },
    a: { what: 'Largest internal organ (~1.5 kg) with right, left, caudate and quadrate lobes; functional unit is the hepatic lobule.', where: 'Right upper quadrant, beneath the right hemidiaphragm.', does: 'Metabolism, detoxification, bile synthesis, glycogen storage, plasma-protein and clotting-factor production; dual blood supply (hepatic artery + portal vein).' },
    facts: ['It is the only organ that can regrow – even from 25% of its tissue.', 'It performs over 500 different jobs.'],
    rel: ['gallbladder', 'stomach', 'small_intestine', 'vena_cava'], clue: 'Largest internal organ that cleans the blood and makes bile',
  },
  {
    id: 'gallbladder', name: 'Gallbladder', system: 'digestive', layer: 'organ', aka: ['gall bladder', 'bile'], say: 'GAWL-blad-er',
    b: { what: 'A small green pouch.', where: 'Tucked under the liver on the right side.', does: 'Stores bile from the liver and squeezes it out to help digest fatty food.' },
    a: { what: 'Pear-shaped sac (fundus, body, neck) holding ~50 ml of concentrated bile.', where: 'Gallbladder fossa on the inferior surface of the liver.', does: 'Concentrates and releases bile via the cystic and common bile ducts in response to cholecystokinin (CCK).' },
    facts: ['You can live without it – bile then drips straight from the liver.'],
    rel: ['liver', 'small_intestine', 'pancreas'], clue: 'Small pouch that stores bile',
  },
  {
    id: 'pancreas', name: 'Pancreas', system: 'digestive', layer: 'organ', aka: ['pancreatic', 'insulin'], say: 'PAN-kree-us',
    b: { what: 'A long, soft gland behind the stomach.', where: 'Behind the stomach, across the back of the belly.', does: 'Makes digestive juices to break down food and the hormone insulin to control blood sugar.' },
    a: { what: 'Mixed gland with head, neck, body and tail; exocrine acini and endocrine islets of Langerhans.', where: 'Retroperitoneal, head in the C-loop of the duodenum, tail near the spleen.', does: 'Exocrine: amylase, lipase, proteases and bicarbonate. Endocrine: insulin (β-cells), glucagon (α-cells), somatostatin (δ-cells).' },
    facts: ['It belongs to two systems: digestive and endocrine.', 'Problems with insulin from the pancreas cause diabetes.'],
    rel: ['stomach', 'small_intestine', 'spleen', 'gallbladder'], clue: 'Gland that makes insulin and digestive juices',
  },
  {
    id: 'small_intestine', name: 'Small Intestine', system: 'digestive', layer: 'organ', aka: ['intestine', 'bowel', 'gut', 'duodenum', 'jejunum', 'ileum'], say: 'in-TES-tin',
    b: { what: 'A very long, folded tube.', where: 'Coiled up in the middle of the belly.', does: 'Finishes digesting food and absorbs most of the nutrients into the blood.' },
    a: { what: '~6 m tube: duodenum, jejunum and ileum, lined with villi and microvilli.', where: 'Central and lower abdomen, suspended by the mesentery (duodenum is retroperitoneal).', does: 'Chemical digestion with pancreatic enzymes and bile; absorption of nutrients, water and electrolytes.' },
    facts: ['It is about 6 metres long – but called "small" because it is narrow.', 'Its tiny finger-like villi give it the surface area of a small apartment.'],
    rel: ['stomach', 'large_intestine', 'pancreas', 'liver'], clue: 'Long coiled tube where most nutrients are absorbed',
  },
  {
    id: 'large_intestine', name: 'Large Intestine', system: 'digestive', layer: 'organ', aka: ['colon', 'large bowel', 'rectum', 'cecum'], say: 'in-TES-tin',
    b: { what: 'A wide tube that frames the small intestine.', where: 'Around the edges of the belly, ending at the rectum.', does: 'Absorbs water from leftover food and forms waste (poop) to leave the body.' },
    a: { what: '~1.5 m: caecum, ascending, transverse, descending and sigmoid colon, rectum and anal canal; haustra and taeniae coli.', where: 'Frames the abdomen from the right iliac fossa to the pelvis.', does: 'Water and electrolyte absorption, vitamin K and B production by gut flora, faecal storage and elimination.' },
    facts: ['Trillions of helpful bacteria live here.', 'Food leftovers can spend 12–48 hours here.'],
    rel: ['small_intestine', 'appendix'], clue: 'Wide tube that absorbs water and forms waste',
  },
  {
    id: 'appendix', name: 'Appendix', system: 'digestive', layer: 'organ', aka: ['vermiform appendix'], say: 'uh-PEN-diks',
    b: { what: 'A small finger-shaped pouch.', where: 'Lower right belly, attached to the start of the large intestine.', does: 'May store good gut bacteria and help the immune system. If it gets infected, it causes appendicitis.' },
    a: { what: 'Vermiform appendix, a blind tube rich in lymphoid tissue.', where: 'Posteromedial caecum; surface marking at McBurney\'s point.', does: 'Gut-associated lymphoid tissue (GALT); possible reservoir for commensal flora.' },
    facts: ['It is about 8–10 cm long.'],
    rel: ['large_intestine'], clue: 'Small finger-shaped pouch on the large intestine',
  },

  // ───────────── NERVOUS ─────────────
  {
    id: 'brain', name: 'Brain', system: 'nervous', layer: 'organ', aka: ['cerebrum', 'mind', 'cerebral'], say: 'brayn',
    b: { what: 'The control center of your body.', where: 'Inside your skull.', does: 'Thinks, remembers, feels emotions, and controls movement, breathing and heartbeat.' },
    a: { what: '~1.4 kg organ with ~86 billion neurons: cerebrum (two hemispheres, four lobes), cerebellum and brainstem.', where: 'Cranial cavity, surrounded by meninges and cerebrospinal fluid.', does: 'Integration of sensory input, motor output, cognition, memory, language, emotion and autonomic control.' },
    parts: ['frontal_lobe', 'parietal_lobe', 'temporal_lobe', 'occipital_lobe', 'cerebellum', 'brainstem'],
    facts: ['It uses about 20% of your body\'s energy.', 'The brain itself feels no pain.', 'It is about 75% water.'],
    rel: ['skull', 'spinal_cord', 'carotid'], clue: 'The control center inside the skull',
  },
  {
    id: 'frontal_lobe', name: 'Frontal Lobe', system: 'nervous', layer: 'organ', parent: 'brain', say: 'FRUN-tul lohb',
    b: { what: 'The front part of the brain.', where: 'Behind your forehead.', does: 'Helps you plan, decide, solve problems, control behaviour and move your muscles.' },
    a: { what: 'Largest lobe, containing the prefrontal cortex, primary motor cortex (precentral gyrus) and Broca\'s area.', where: 'Anterior to the central sulcus, superior to the lateral sulcus.', does: 'Executive function, voluntary motor control, speech production, personality.' },
    facts: ['It is the last part of the brain to fully mature – around age 25.'],
    rel: ['parietal_lobe', 'temporal_lobe'], clue: 'Brain region for planning, decisions and movement',
  },
  {
    id: 'parietal_lobe', name: 'Parietal Lobe', system: 'nervous', layer: 'organ', parent: 'brain', say: 'puh-RY-uh-tul lohb',
    b: { what: 'The top-middle part of the brain.', where: 'Under the top of your head.', does: 'Makes sense of touch, temperature and pain, and knows where your body is in space.' },
    a: { what: 'Contains the primary somatosensory cortex (postcentral gyrus).', where: 'Posterior to the central sulcus, anterior to the parieto-occipital sulcus.', does: 'Somatosensation, spatial awareness, proprioception and sensory integration.' },
    rel: ['frontal_lobe', 'occipital_lobe'], clue: 'Brain region that processes touch and body position',
  },
  {
    id: 'temporal_lobe', name: 'Temporal Lobes', system: 'nervous', layer: 'organ', parent: 'brain', aka: ['temporal lobe'], say: 'TEM-por-ul lohb',
    b: { what: 'The side parts of the brain.', where: 'Behind your temples, near your ears.', does: 'Handles hearing, understanding language and making memories.' },
    a: { what: 'Contains the primary auditory cortex, Wernicke\'s area, hippocampus and amygdala (medially).', where: 'Inferior to the lateral (Sylvian) fissure.', does: 'Auditory processing, language comprehension, memory formation, emotion.' },
    rel: ['frontal_lobe', 'brainstem'], clue: 'Brain regions for hearing and memory',
  },
  {
    id: 'occipital_lobe', name: 'Occipital Lobe', system: 'nervous', layer: 'organ', parent: 'brain', say: 'ok-SIP-ih-tul lohb',
    b: { what: 'The back part of the brain.', where: 'At the back of your head.', does: 'Turns signals from your eyes into the pictures you see.' },
    a: { what: 'Contains the primary visual cortex (V1) around the calcarine sulcus.', where: 'Posterior pole of the cerebral hemispheres.', does: 'Visual processing: colour, motion, form and depth.' },
    facts: ['You see with your brain – the eyes only collect light.'],
    rel: ['parietal_lobe', 'cerebellum'], clue: 'Brain region that processes vision',
  },
  {
    id: 'cerebellum', name: 'Cerebellum', system: 'nervous', layer: 'organ', parent: 'brain', aka: ['little brain'], say: 'ser-uh-BEL-um',
    b: { what: 'The "little brain" at the back.', where: 'Under the back of the brain, above the neck.', does: 'Controls balance, coordination and smooth movement – like riding a bike.' },
    a: { what: 'Two hemispheres joined by the vermis, with a highly folded cortex (folia).', where: 'Posterior cranial fossa, inferior to the occipital lobes, separated by the tentorium cerebelli.', does: 'Motor coordination, balance, motor learning and timing.' },
    facts: ['It holds over half of all the brain\'s neurons, despite being only 10% of its size.'],
    rel: ['brainstem', 'occipital_lobe'], clue: 'The "little brain" controlling balance and coordination',
  },
  {
    id: 'brainstem', name: 'Brainstem', system: 'nervous', layer: 'organ', parent: 'brain', aka: ['brain stem', 'medulla', 'pons'], say: 'BRAYN-stem',
    b: { what: 'The stalk connecting the brain to the spinal cord.', where: 'At the base of the brain.', does: 'Runs automatic jobs like breathing, heartbeat and swallowing.' },
    a: { what: 'Midbrain, pons and medulla oblongata; origin of cranial nerves III–XII.', where: 'Between the diencephalon and the spinal cord at the foramen magnum.', does: 'Vital autonomic centres (cardiovascular, respiratory), relay of ascending/descending tracts, arousal (reticular formation).' },
    rel: ['spinal_cord', 'cerebellum'], clue: 'Brain stalk that controls breathing and heartbeat',
  },
  {
    id: 'spinal_cord', name: 'Spinal Cord', system: 'nervous', layer: 'organ', aka: ['spinal nerve cord'], say: 'SPY-nul kord',
    b: { what: 'A thick bundle of nerves – the body\'s information highway.', where: 'Inside the spine, from the brain down the back.', does: 'Carries messages between the brain and the body, and handles quick reflexes by itself.' },
    a: { what: 'Cylindrical CNS tract with central grey matter and peripheral white matter; 31 pairs of spinal nerves.', where: 'Vertebral canal from the foramen magnum to L1–L2 (conus medullaris), continuing as the cauda equina.', does: 'Conduction of sensory and motor pathways; integration of spinal reflex arcs.' },
    facts: ['It ends around the waist – below that, nerves hang like a horse\'s tail (cauda equina).', 'Signals travel along it at up to 120 m/s.'],
    rel: ['spine', 'brainstem', 'sciatic_nerve', 'ulnar_nerve'], clue: 'Nerve highway running inside the spine',
  },
  {
    id: 'sciatic_nerve', name: 'Sciatic Nerve', system: 'nervous', layer: 'vessel', aka: ['sciatic', 'leg nerve'], say: 'sy-AT-ik nerv',
    b: { what: 'The longest and thickest nerve in the body.', where: 'From the lower back through the buttock and down the back of each leg.', does: 'Carries signals for feeling and movement in the legs.' },
    a: { what: 'Formed from L4–S3 roots of the sacral plexus; divides into tibial and common fibular nerves.', where: 'Exits via the greater sciatic foramen, descends in the posterior thigh.', does: 'Motor supply to hamstrings and all muscles below the knee; sensation to most of the leg and foot.' },
    facts: ['It is about as thick as your thumb.', '"Sciatica" is pain caused by pressure on this nerve.'],
    rel: ['spinal_cord', 'gastrocnemius'], clue: 'The longest, thickest nerve in the body',
  },
  {
    id: 'ulnar_nerve', name: 'Ulnar Nerve', system: 'nervous', layer: 'vessel', aka: ['funny bone', 'arm nerve'], say: 'UL-ner nerv',
    b: { what: 'A nerve that runs down your arm to your hand.', where: 'Along the inside of the arm, past the elbow to the little finger.', does: 'Lets you feel your ring and little fingers and control small hand muscles.' },
    a: { what: 'Terminal branch of the medial cord of the brachial plexus (C8–T1).', where: 'Posterior to the medial epicondyle of the humerus, then into the forearm and Guyon\'s canal.', does: 'Innervates most intrinsic hand muscles and the medial 1½ fingers.' },
    facts: ['Banging your "funny bone" is actually hitting this nerve.'],
    rel: ['humerus', 'radius_ulna', 'spinal_cord'], clue: 'The "funny bone" nerve',
  },

  // ───────────── URINARY ─────────────
  {
    id: 'kidneys', name: 'Kidneys', system: 'urinary', layer: 'organ', aka: ['kidney', 'renal'], say: 'KID-neez',
    b: { what: 'Two bean-shaped organs.', where: 'Back of the belly, either side of the spine, just under the ribs.', does: 'Filter waste and extra water out of your blood to make urine, and balance salts.' },
    a: { what: 'Paired retroperitoneal organs, ~1 million nephrons each, with cortex, medulla (pyramids) and renal pelvis.', where: 'T12–L3; the right kidney sits slightly lower because of the liver.', does: 'Filtration, reabsorption and secretion; regulate fluid, electrolytes, acid-base and blood pressure (renin); produce erythropoietin and active vitamin D.' },
    facts: ['They filter about 180 litres of blood every day.', 'You can live a healthy life with just one kidney.'],
    rel: ['ureters', 'adrenal_glands', 'aorta', 'bladder'], clue: 'Bean-shaped organs that filter blood to make urine',
  },
  {
    id: 'ureters', name: 'Ureters', system: 'urinary', layer: 'organ', aka: ['ureter'], say: 'YOOR-uh-terz',
    b: { what: 'Two thin tubes.', where: 'From each kidney down to the bladder.', does: 'Carry urine from the kidneys to the bladder.' },
    a: { what: 'Muscular tubes (~25–30 cm) with three natural narrowings.', where: 'Retroperitoneal, along psoas major, crossing the pelvic brim at the iliac bifurcation.', does: 'Peristaltic urine transport; oblique entry into the bladder prevents reflux.' },
    facts: ['Kidney stones often get stuck at the narrow points of the ureters.'],
    rel: ['kidneys', 'bladder'], clue: 'Tubes carrying urine from kidneys to bladder',
  },
  {
    id: 'bladder', name: 'Urinary Bladder', system: 'urinary', layer: 'organ', aka: ['bladder', 'urine'], say: 'BLAD-er',
    b: { what: 'A stretchy, balloon-like bag.', where: 'Low in the belly, behind the pubic bone.', does: 'Stores urine until you are ready to go to the toilet.' },
    a: { what: 'Hollow muscular organ (detrusor muscle) with a trigone.', where: 'Pelvic cavity, posterior to the pubic symphysis.', does: 'Urine storage (~400–600 ml) and voiding via the micturition reflex.' },
    facts: ['You usually feel the urge to go at about 200–300 ml.'],
    rel: ['ureters', 'kidneys', 'pelvis'], clue: 'Balloon-like bag that stores urine',
  },

  // ───────────── ENDOCRINE / IMMUNE ─────────────
  {
    id: 'thyroid', name: 'Thyroid Gland', system: 'endocrine', layer: 'organ', aka: ['thyroid'], say: 'THY-royd',
    b: { what: 'A butterfly-shaped gland in your neck.', where: 'Front of the neck, below the Adam\'s apple.', does: 'Makes hormones that control how fast your body uses energy (metabolism).' },
    a: { what: 'Two lobes joined by an isthmus; follicles produce T3/T4, parafollicular C-cells produce calcitonin.', where: 'Anterior neck at C5–T1, isthmus over tracheal rings 2–4.', does: 'Regulates basal metabolic rate, growth and development; calcitonin lowers blood calcium.' },
    facts: ['It needs iodine from food to make its hormones.'],
    rel: ['larynx', 'trachea'], clue: 'Butterfly-shaped neck gland controlling metabolism',
  },
  {
    id: 'adrenal_glands', name: 'Adrenal Glands', system: 'endocrine', layer: 'organ', aka: ['adrenal', 'adrenaline'], say: 'uh-DREE-nul',
    b: { what: 'Two small triangle-shaped glands.', where: 'Sitting on top of each kidney like hats.', does: 'Make adrenaline for "fight or flight" and other hormones that help handle stress.' },
    a: { what: 'Cortex (zona glomerulosa, fasciculata, reticularis) and medulla (chromaffin cells).', where: 'Retroperitoneal, superomedial to each kidney.', does: 'Cortex: aldosterone, cortisol, androgens. Medulla: adrenaline and noradrenaline.' },
    facts: ['Adrenaline is why your heart races when you\'re scared.'],
    rel: ['kidneys'], clue: 'Glands on top of the kidneys that make adrenaline',
  },
  {
    id: 'spleen', name: 'Spleen', system: 'endocrine', layer: 'organ', aka: ['splenic'], say: 'spleen',
    b: { what: 'A soft, purple, fist-sized organ.', where: 'Upper left belly, behind the stomach, under the ribs.', does: 'Filters the blood, removes old blood cells and helps fight infections.' },
    a: { what: 'Largest lymphoid organ with red pulp (blood filtration) and white pulp (lymphoid tissue).', where: 'Left hypochondrium, deep to ribs 9–11.', does: 'Removal of senescent RBCs, immune surveillance, storage of platelets and monocytes.' },
    facts: ['You can live without your spleen, but you\'re more prone to some infections.'],
    rel: ['stomach', 'pancreas', 'left_lung'], clue: 'Organ that filters blood and fights infection',
  },
]

// ───────────── ANATOMY JOURNEYS ─────────────
// step.to = structure id where the particle travels to.
// step.follow = follow the curve of a tube-shaped structure (optionally reversed)
export const journeys = [
  {
    id: 'food', name: 'Food Journey', icon: 'fa-burger', color: '#f4a63a',
    intro: 'Follow a bite of food from your mouth all the way through your digestive system.',
    steps: [
      { to: 'mandible', title: 'Mouth', text: 'Teeth chew food into small pieces and saliva starts digesting starch. The tongue rolls it into a soft ball called a bolus.' },
      { to: 'esophagus', follow: true, title: 'Esophagus', text: 'You swallow. Waves of muscle (peristalsis) squeeze the food down the esophagus in about 7 seconds.' },
      { to: 'stomach', follow: true, title: 'Stomach', text: 'The stomach churns food with strong acid and enzymes for 2–4 hours, turning it into a soupy mix called chyme.' },
      { to: 'liver', hold: true, title: 'Liver & Gallbladder help', text: 'The liver makes bile, stored by the gallbladder. Bile breaks fat into tiny droplets – like dish soap on grease.' },
      { to: 'pancreas', hold: true, title: 'Pancreas helps', text: 'The pancreas adds powerful digestive juices that break down proteins, fats and carbohydrates.' },
      { to: 'small_intestine', follow: true, title: 'Small Intestine', text: 'Over ~6 metres, nutrients are absorbed through millions of tiny villi into the blood. This takes 3–5 hours.' },
      { to: 'large_intestine', follow: true, title: 'Large Intestine', text: 'Water is absorbed and helpful bacteria work on the leftovers, forming solid waste that leaves through the rectum.' },
    ],
  },
  {
    id: 'blood', name: 'Blood Journey', icon: 'fa-droplet', color: '#e0314b',
    intro: 'Learn how blood flows through the heart: body → heart → lungs → heart → body.',
    steps: [
      { to: 'vena_cava', follow: true, reverse: false, title: 'Return from the body', text: 'Used blood, low in oxygen, travels up the inferior vena cava from the legs and belly.' },
      { to: 'right_atrium', title: 'Right Atrium', text: 'Blood enters the right atrium – the collecting room for blood coming back from the body.' },
      { to: 'right_ventricle', title: 'Right Ventricle', text: 'It drops through the tricuspid valve into the right ventricle, which squeezes it out.' },
      { to: 'pulmonary_trunk', title: 'Pulmonary Trunk', text: 'The right ventricle pumps blood through the pulmonary trunk toward the lungs.' },
      { to: 'lungs', at: 'right_lung', title: 'Lungs', text: 'In the lungs, blood drops off carbon dioxide and picks up fresh oxygen. It turns bright red!' },
      { to: 'left_atrium', title: 'Left Atrium', text: 'Oxygen-rich blood returns to the heart, entering the left atrium.' },
      { to: 'left_ventricle', title: 'Left Ventricle', text: 'It passes the mitral valve into the left ventricle – the strongest chamber.' },
      { to: 'aortic_arch', follow: true, title: 'Aortic Arch', text: 'A powerful squeeze sends blood up into the aortic arch. Branches carry blood to the brain and arms.' },
      { to: 'aorta', follow: true, title: 'To the body', text: 'The aorta carries oxygen-rich blood down to every organ. The full loop takes about 1 minute!' },
    ],
  },
  {
    id: 'breath', name: 'Breathing Journey', icon: 'fa-wind', color: '#7cc6f2',
    intro: 'Follow a breath of air from your nose deep into your lungs and back out.',
    steps: [
      { to: 'larynx', title: 'Nose & Throat', text: 'Air enters through the nose, where it is warmed, moistened and filtered by tiny hairs, then passes the larynx (voice box).' },
      { to: 'trachea', follow: true, title: 'Trachea', text: 'Air travels down the windpipe. Rings of cartilage keep it open like a vacuum-cleaner hose.' },
      { to: 'bronchi', title: 'Bronchi', text: 'The windpipe splits into two bronchi – one for each lung – which keep branching like an upside-down tree.' },
      { to: 'lungs', at: 'right_lung', title: 'Alveoli', text: 'Air reaches 300+ million tiny air sacs (alveoli). Oxygen crosses into the blood; carbon dioxide crosses out.', breathe: true },
      { to: 'diaphragm', title: 'Diaphragm', text: 'The diaphragm moves down to suck air in, and relaxes upward to push air out. You do this ~20,000 times a day.', breathe: true },
    ],
  },
  {
    id: 'nerve', name: 'Nerve Signal Journey', icon: 'fa-bolt', color: '#f3d36b',
    intro: 'You touch something hot! Follow the signal through a reflex arc and up to the brain.',
    steps: [
      { to: 'ulnar_nerve', follow: true, reverse: true, title: 'Touch!', text: 'Sensors in your fingertip detect heat. An electrical signal races up the nerve in your arm.' },
      { to: 'spinal_cord', title: 'Spinal Cord', text: 'The signal reaches the spinal cord. For speed, the cord sends a reflex command straight back – no brain needed!' },
      { to: 'biceps', title: 'Reflex', text: 'Your biceps contracts and yanks your hand away – in about 50 milliseconds.' },
      { to: 'brainstem', title: 'Up to the brain', text: 'Meanwhile, the signal climbs the spinal cord through the brainstem.' },
      { to: 'parietal_lobe', title: 'Parietal Lobe', text: 'The parietal lobe processes the sensation – NOW you feel "Ouch, hot!"' },
      { to: 'frontal_lobe', title: 'Frontal Lobe', text: 'The frontal lobe decides what to do next: "Be careful with that pan!" and learns from it.' },
    ],
  },
]
