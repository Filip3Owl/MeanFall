// MeanFall — Lore & Story
// The narrative spine of the game. Statistics is the lost art that once
// kept the world balanced; now the Distorção (the Distortion) corrupts
// reality by breaking distributions. The hero must restore the curves.

export const STORY = {
    title: 'A Queda da Média',
    subtitle: 'Uma jornada estatística contra o caos',
    prologueLines: [
        'Há eras, o mundo seguia a {{accent:Curva}} — toda criatura, toda chuva, toda guerra obedecia a leis precisas.',
        'A {{accent:Sociedade dos Estatísticos}} mantinha o equilíbrio: mediam, projetavam, previam.',
        'Então veio a {{bad:Distorção}}. Eventos impossíveis começaram a se repetir. {{rare:P-valores}} enlouqueceram.',
        'Os {{bad:monstros}}, antes raros, agora seguem distribuições corrompidas. Os {{rare:outliers}} tomaram o trono.',
        'Você é o {{good:último aprendiz}} da Ordem. Sua missão: derrotar a {{bad:Distorção}} usando a única arma que sobrou — o {{accent:conhecimento estatístico}}.',
        'Cada criatura derrotada é uma {{good:equação resolvida}}. Cada livro lido, um {{good:teorema recuperado}}.',
        'O destino do mundo está na sua {{accent:amostra}}...',
    ],

    chapters: [
        {
            id: 'ch_village',
            area: 'village',
            title: 'I — O Despertar na Vila',
            text: 'A Vila dos Dados foi a primeira a cair. Wisps Tipológicos vagam confusos, sem saber se são qualitativos ou quantitativos. Restaure a ordem aprendendo a CLASSIFICAR.',
        },
        {
            id: 'ch_meadows',
            area: 'meadows',
            title: 'II — Os Prados sem Centro',
            text: 'As Medidas Centrais foram esquecidas. Sem média, mediana ou moda, as criaturas não sabem onde está o centro de si mesmas. Reencontre o equilíbrio.',
        },
        {
            id: 'ch_forest',
            area: 'forest',
            title: 'III — A Floresta Dispersa',
            text: 'Tudo aqui se espalha sem controle. A Variância tornou-se um prisma vivo que fragmenta qualquer ordem. Domine a DISPERSÃO antes que ela te domine.',
        },
        {
            id: 'ch_plains',
            area: 'plains',
            title: 'IV — As Planícies do Acaso',
            text: 'A Probabilidade enlouqueceu. Eventos impossíveis acontecem; eventos certos falham. Restaure as leis do acaso.',
        },
        {
            id: 'ch_mountains',
            area: 'mountains',
            title: 'V — As Montanhas Tortas',
            text: 'A curva normal se quebrou em assimetrias monstruosas. As Montanhas guardam o segredo da padronização — encontre o Z perdido.',
        },
        {
            id: 'ch_dungeon',
            area: 'dungeon',
            title: 'VI — O Calabouço da Distorção',
            text: 'Aqui dorme o Lich do P-valor, fonte da Distorção. Apenas quem dominou a Inferência pode julgar suas hipóteses. Vença, e o mundo voltará à curva.',
        },
    ],

    epilogue: [
        'A Distorção foi rejeitada. p < α.',
        'A curva volta a se desenhar nos céus.',
        'Você se tornou o novo Mestre Estatístico.',
    ],
};

export const TUTORIAL_TIPS = [
    { id: 't_move',     trigger: 'start',          text: 'Use WASD ou setas para se mover. Aproxime-se de NPCs e pressione ESPAÇO para conversar.' },
    { id: 't_combat',   trigger: 'first_monster',  text: 'Para atacar uma criatura, encoste nela. Você responderá perguntas de estatística — acerte para causar dano!' },
    { id: 't_books',    trigger: 'first_book',     text: 'Você encontrou um LIVRO! Pressione B para abrir a Biblioteca e estudá-lo. Livros lidos concedem XP e bônus permanentes.' },
    { id: 't_portal',   trigger: 'near_portal',    text: 'Portais conectam regiões, mas exigem MAESTRIA mínima na área anterior e nível suficiente. Continue derrotando monstros e respondendo corretamente para subir de nível e desbloquear o próximo portal.' },
    { id: 't_quest',    trigger: 'quest_received', text: 'Você recebeu uma missão! Pressione Q para ver o diário. Missões concluídas concedem grandes recompensas.' },
    { id: 't_levelup',  trigger: 'first_levelup',  text: 'Subiu de nível! A cada 3 níveis você recebe um ponto de atributo. Pressione C para distribuir.' },
    { id: 't_shop',     trigger: 'near_merchant',  text: 'Comerciantes (avental verde, $) compram seus itens e vendem novos. Espaço perto deles abre a loja.' },
];
