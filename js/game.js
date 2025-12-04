/**
 * Juego del Impostor - Sistema de Categorías con Palabra Secreta
 * Archivo principal con toda la lógica del juego
 */

// ==========================================
// BANCO DE PALABRAS POR CATEGORÍAS
// ==========================================

const WORD_BANK = {
    frutas: ["Manzana", "Banano", "Fresa", "Mango", "Naranja", "Piña", "Uva", "Pera", "Melón", "Sandía"],
    deportes: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Atletismo", "Ciclismo", "Voleibol", "Béisbol", "Golf", "Boxeo"],
    artistas: ["Bad Bunny", "Shakira", "Mozart", "Picasso", "Michael Jackson", "Beyoncé", "Leonardo da Vinci", "Frida Kahlo", "Elvis Presley", "Madonna"],
    paises: ["Ecuador", "México", "España", "Argentina", "Colombia", "Chile", "Perú", "Brasil", "Venezuela", "Uruguay"],
    lugares: ["Playa", "Montaña", "Parque", "Aeropuerto", "Restaurante", "Biblioteca", "Hospital", "Escuela", "Estadio", "Centro Comercial"],
    objetos: ["Celular", "Laptop", "Reloj", "Mochila", "Gafas", "Llaves", "Bolso", "Cartera", "Audífonos", "Cámara"],
    animales: ["Perro", "Gato", "León", "Elefante", "Tigre", "Jirafa", "Mono", "Delfín", "Águila", "Tortuga"]
};

// ==========================================
// VARIABLES GLOBALES DEL JUEGO
// ==========================================

let gameState = {
    // Configuración inicial
    selectedCategory: '',
    categoryName: '',
    numPlayers: 0,

    // Estado del juego
    secretWord: '',
    players: [], // Array con objetos {id, role: 'civil'|'impostor'}
    currentPlayerIndex: 0,
    impostorId: null,

    // Votación
    votes: [], // Array con los votos de cada jugador
    votingComplete: false
};

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================

const elements = {
    // Pantallas
    setupScreen: document.getElementById('setup-screen'),
    gameScreen: document.getElementById('game-screen'),
    votingScreen: document.getElementById('voting-screen'),
    resultsScreen: document.getElementById('results-screen'),

    // Setup
    categorySelect: document.getElementById('category-select'),
    startGameBtn: document.getElementById('start-game-btn'),

    // Juego
    currentPlayer: document.getElementById('current-player'),
    selectedCategory: document.getElementById('selected-category'),
    playerCard: document.getElementById('player-card'),
    cardContent: document.getElementById('card-content'),
    nextPlayerBtn: document.getElementById('next-player-btn'),
    startVotingBtn: document.getElementById('start-voting-btn'),

    // Votación
    votingButtons: document.getElementById('voting-buttons'),
    showResultsBtn: document.getElementById('show-results-btn'),

    // Resultados
    resultCategory: document.getElementById('result-category'),
    secretWord: document.getElementById('secret-word'),
    impostorName: document.getElementById('impostor-name'),
    civiliansList: document.getElementById('civilians-list'),
    gameOutcome: document.getElementById('game-outcome'),
    playAgainBtn: document.getElementById('play-again-btn')
};

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Función para obtener un elemento aleatorio de un array
 * @param {Array} array - Array del cual obtener elemento aleatorio
 * @returns {*} Elemento aleatorio del array
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Función para cambiar entre pantallas
 * @param {string} screenId - ID de la pantalla a mostrar
 */
function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Mostrar la pantalla deseada
    document.getElementById(screenId).classList.add('active');
}

/**
 * Función para obtener el nombre de la categoría con emoji
 * @param {string} categoryKey - Clave de la categoría
 * @returns {string} Nombre de la categoría con emoji
 */
function getCategoryDisplayName(categoryKey) {
    const categoryNames = {
        frutas: '🍎 Frutas',
        deportes: '⚽ Deportes',
        artistas: '🎤 Artistas',
        paises: '🌍 Países',
        lugares: '📍 Lugares',
        objetos: '🧸 Objetos',
        animales: '🐶 Animales'
    };
    return categoryNames[categoryKey] || categoryKey;
}

// ==========================================
// FUNCIONES DE INICIALIZACIÓN
// ==========================================

/**
 * Función para inicializar el juego
 */
function initializeGame() {
    setupEventListeners();
    resetGameState();
}

/**
 * Función para configurar todos los event listeners
 */
function setupEventListeners() {
    // Selector de categoría
    elements.categorySelect.addEventListener('change', handleCategoryChange);

    // Botones de número de jugadores
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePlayerSelection(btn));
    });

    // Botón de iniciar juego
    elements.startGameBtn.addEventListener('click', startGame);

    // Carta del jugador (para revelar)
    elements.playerCard.addEventListener('click', revealCard);

    // Botón siguiente jugador
    elements.nextPlayerBtn.addEventListener('click', nextPlayer);

    // Botón iniciar votación
    elements.startVotingBtn.addEventListener('click', startVoting);

    // Botón mostrar resultados
    elements.showResultsBtn.addEventListener('click', showResults);

    // Botón jugar de nuevo
    elements.playAgainBtn.addEventListener('click', resetGame);
}

/**
 * Función para resetear el estado del juego
 */
function resetGameState() {
    gameState = {
        selectedCategory: '',
        categoryName: '',
        numPlayers: 0,
        secretWord: '',
        players: [],
        currentPlayerIndex: 0,
        impostorId: null,
        votes: [],
        votingComplete: false
    };

    // Resetear UI
    elements.categorySelect.value = '';
    elements.startGameBtn.disabled = true;
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    elements.playerCard.classList.remove('flipped');
}

// ==========================================
// FUNCIONES DE CONFIGURACIÓN
// ==========================================

/**
 * Manejar el cambio de categoría seleccionada
 */
function handleCategoryChange() {
    gameState.selectedCategory = elements.categorySelect.value;
    gameState.categoryName = getCategoryDisplayName(gameState.selectedCategory);
    updateStartButton();
}

/**
 * Manejar la selección de número de jugadores
 * @param {HTMLElement} button - Botón seleccionado
 */
function handlePlayerSelection(button) {
    // Remover selección previa
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Seleccionar el botón actual
    button.classList.add('selected');
    gameState.numPlayers = parseInt(button.dataset.players);
    updateStartButton();
}

/**
 * Actualizar el estado del botón de inicio
 */
function updateStartButton() {
    const canStart = gameState.selectedCategory && gameState.numPlayers > 0;
    elements.startGameBtn.disabled = !canStart;
}

// ==========================================
// FUNCIONES DEL JUEGO PRINCIPAL
// ==========================================

/**
 * Función para iniciar el juego
 */
function startGame() {
    // Elegir palabra secreta aleatoria de la categoría seleccionada
    const words = WORD_BANK[gameState.selectedCategory];
    gameState.secretWord = getRandomElement(words);

    // Crear array de jugadores
    gameState.players = [];
    for (let i = 1; i <= gameState.numPlayers; i++) {
        gameState.players.push({
            id: i,
            role: 'civil' // Por defecto todos son civiles
        });
    }

    // Elegir impostor aleatoriamente
    gameState.impostorId = Math.floor(Math.random() * gameState.numPlayers) + 1;
    const impostorPlayer = gameState.players.find(p => p.id === gameState.impostorId);
    if (impostorPlayer) {
        impostorPlayer.role = 'impostor';
    }

    // Mostrar pantalla de juego
    showScreen('game-screen');
    updateGameUI();
}

/**
 * Actualizar la interfaz del juego
 */
function updateGameUI() {
    elements.selectedCategory.textContent = `Categoría: ${gameState.categoryName}`;
    elements.currentPlayer.textContent = `Turno del Jugador ${gameState.players[gameState.currentPlayerIndex].id}`;
}

/**
 * Función para revelar la carta del jugador actual
 */
function revealCard() {
    const card = elements.playerCard;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Voltear la carta
    card.classList.add('flipped');

    // Mostrar contenido según el rol
    if (currentPlayer.role === 'impostor') {
        elements.cardContent.textContent = 'ERES EL IMPOSTOR 😈';
        elements.cardContent.className = 'impostor';
    } else {
        elements.cardContent.textContent = `TU PALABRA ES: ${gameState.secretWord}`;
        elements.cardContent.className = 'civil';
    }

    // Deshabilitar el click después de revelar
    card.style.pointerEvents = 'none';

    // Mostrar botón siguiente después de un delay
    setTimeout(() => {
        elements.nextPlayerBtn.style.display = 'inline-block';
    }, 1000);
}

/**
 * Función para pasar al siguiente jugador
 */
function nextPlayer() {
    gameState.currentPlayerIndex++;

    // Si hay más jugadores, continuar
    if (gameState.currentPlayerIndex < gameState.numPlayers) {
        // Resetear carta
        elements.playerCard.classList.remove('flipped');
        elements.playerCard.style.pointerEvents = 'auto';
        elements.cardContent.textContent = '';
        elements.nextPlayerBtn.style.display = 'none';

        updateGameUI();
    } else {
        // Todos los jugadores han visto su carta, mostrar botón de votación
        elements.nextPlayerBtn.style.display = 'none';
        elements.startVotingBtn.style.display = 'inline-block';
    }
}

/**
 * Función para iniciar la votación
 */
function startVoting() {
    showScreen('voting-screen');
    createVotingButtons();
}

/**
 * Crear botones de votación para cada jugador
 */
function createVotingButtons() {
    elements.votingButtons.innerHTML = '';

    for (let i = 1; i <= gameState.numPlayers; i++) {
        const button = document.createElement('button');
        button.className = 'vote-btn';
        button.textContent = `Jugador ${i}`;
        button.dataset.playerId = i;
        button.addEventListener('click', () => selectVote(i, button));
        elements.votingButtons.appendChild(button);
    }
}

/**
 * Función para seleccionar un voto
 * @param {number} playerId - ID del jugador votado
 * @param {HTMLElement} button - Botón seleccionado
 */
function selectVote(playerId, button) {
    // Remover selección previa
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Seleccionar botón actual
    button.classList.add('selected');

    // Guardar voto (simulando que todos votan por el mismo por simplicidad)
    gameState.votes = [];
    for (let i = 1; i <= gameState.numPlayers; i++) {
        gameState.votes.push(playerId);
    }

    gameState.votingComplete = true;
    elements.showResultsBtn.style.display = 'inline-block';
}

// ==========================================
// FUNCIONES DE RESULTADOS
// ==========================================

/**
 * Función para mostrar los resultados finales
 */
function showResults() {
    showScreen('results-screen');

    // Mostrar información del juego
    elements.resultCategory.textContent = gameState.categoryName;
    elements.secretWord.textContent = gameState.secretWord;
    elements.impostorName.textContent = `Jugador ${gameState.impostorId}`;

    // Mostrar lista de civiles
    const civilians = gameState.players
        .filter(p => p.role === 'civil')
        .map(p => `Jugador ${p.id}`)
        .join(', ');
    elements.civiliansList.textContent = civilians;

    // Determinar resultado del juego
    const mostVoted = getMostVotedPlayer();
    const isImpostorCaught = mostVoted === gameState.impostorId;

    if (isImpostorCaught) {
        elements.gameOutcome.textContent = '¡LOS CIVILES HAN GANADO! 🎉';
        elements.gameOutcome.className = 'game-outcome civilians-win';
    } else {
        elements.gameOutcome.textContent = '¡EL IMPOSTOR HA GANADO! 😈';
        elements.gameOutcome.className = 'game-outcome impostor-win';
    }
}

/**
 * Función para obtener el jugador más votado
 * @returns {number} ID del jugador más votado
 */
function getMostVotedPlayer() {
    const voteCount = {};
    gameState.votes.forEach(vote => {
        voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    let maxVotes = 0;
    let mostVotedPlayer = null;

    for (const [playerId, votes] of Object.entries(voteCount)) {
        if (votes > maxVotes) {
            maxVotes = votes;
            mostVotedPlayer = parseInt(playerId);
        }
    }

    return mostVotedPlayer;
}

/**
 * Función para reiniciar el juego completamente
 */
function resetGame() {
    resetGameState();
    showScreen('setup-screen');
}

// ==========================================
// INICIALIZACIÓN DEL JUEGO
// ==========================================

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeGame);
