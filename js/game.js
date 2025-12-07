// ===================================
// JUEGO DEL IMPOSTOR
// Archivo: game.js
// ===================================

/**
 * Objeto principal que contiene toda la lógica del juego
 */
const game = {
    
    // ===================================
    // BANCO DE PALABRAS POR CATEGORÍA
    // ===================================
    
    /**
     * Cada categoría tiene un array de palabras secretas posibles
     */
    wordBank: {
        frutas: ["Manzana", "Banano", "Fresa", "Mango", "Piña", "Sandía", "Uva", "Pera"],
        deportes: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Voleibol", "Béisbol", "Golf", "Atletismo"],
        artistas: ["Bad Bunny", "Shakira", "Mozart", "Picasso", "Frida Kahlo", "Beethoven", "Leonardo da Vinci", "Dalí"],
        paises: ["Ecuador", "México", "España", "Argentina", "Colombia", "Perú", "Chile", "Brasil"],
        lugares: ["Playa", "Montaña", "Parque", "Aeropuerto", "Museo", "Biblioteca", "Estadio", "Cine"],
        objetos: ["Celular", "Laptop", "Reloj", "Mochila", "Lentes", "Botella", "Libro", "Audífonos"],
        animales: ["Perro", "Gato", "León", "Elefante", "Tigre", "Delfín", "Águila", "Jirafa"]
    },

    // ===================================
    // ICONOS PARA CADA CATEGORÍA
    // ===================================
    
    /**
     * Emojis que representan visualmente cada categoría
     */
    categoryIcons: {
        frutas: "🍎",
        deportes: "⚽",
        artistas: "🎤",
        paises: "🌍",
        lugares: "📍",
        objetos: "🧸",
        animales: "🐶"
    },

    // ===================================
    // VARIABLES DE ESTADO DEL JUEGO
    // ===================================
    
    players: [],              // Array con los nombres de todos los jugadores
    currentTurnIndex: 0,      // Índice del jugador actual (0 a n-1)
    impostorIndex: -1,        // Índice del jugador que es el impostor
    selectedCategory: "frutas", // Categoría seleccionada actualmente
    secretWord: "",           // Palabra secreta elegida para la partida

    // ===================================
    // FUNCIÓN: Actualizar icono de categoría
    // ===================================
    
    /**
     * Actualiza el icono visual cuando se cambia la categoría en el selector
     */
    updateCategoryIcon() {
        const select = document.getElementById('categorySelect');
        const icon = document.getElementById('categoryIcon');
        const category = select.value;
        
        // Actualizar el icono en la interfaz
        icon.textContent = this.categoryIcons[category];
        
        // Guardar la categoría seleccionada
        this.selectedCategory = category;
    },

    // ===================================
    // FUNCIÓN: Añadir jugador
    // ===================================
    
    /**
     * Añade un nuevo jugador a la lista
     * Valida que el nombre no esté vacío ni duplicado
     */
    addPlayer() {
        const input = document.getElementById('playerName');
        const name = input.value.trim();

        if (name === "") {
            alert("Por favor ingresa un nombre");
            return;
        }

        if (this.players.includes(name)) {
            alert("Este jugador ya existe");
            return;
        }

        this.players.push(name);
        input.value = "";

        // ✅ GUARDAR EN LOCALSTORAGE
        localStorage.setItem("players", JSON.stringify(this.players));

        this.renderPlayerList();
    },

    // ===================================
    // FUNCIÓN: Eliminar jugador
    // ===================================
    
    /**
     * Elimina un jugador de la lista por su índice
     * @param {number} index - Índice del jugador a eliminar
     */
    removePlayer(index) {
        this.players.splice(index, 1);

        // ✅ ACTUALIZAR LOCALSTORAGE
        localStorage.setItem("players", JSON.stringify(this.players));

        this.renderPlayerList();
    },

    // ===================================
    // FUNCIÓN: Renderizar lista de jugadores
    // ===================================
    
    /**
     * Actualiza la interfaz con la lista actual de jugadores
     * Muestra cada jugador con un botón para eliminarlo
     */
    renderPlayerList() {
        const list = document.getElementById('playerList');
        
        // Si no hay jugadores, mostrar mensaje
        if (this.players.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">No hay jugadores añadidos</p>';
            return;
        }

        // Generar HTML para cada jugador
        list.innerHTML = this.players.map((player, index) => `
            <div class="player-item">
                <span><strong>${index + 1}.</strong> ${player}</span>
                <button class="remove-btn" onclick="game.removePlayer(${index})">X</button>
            </div>
        `).join('');
    },

    // ===================================
    // FUNCIÓN: Seleccionar palabra secreta
    // ===================================
    
    /**
     * Elige una palabra aleatoria del banco de la categoría seleccionada
     */
    selectSecretWord() {
        const words = this.wordBank[this.selectedCategory];
        const randomIndex = Math.floor(Math.random() * words.length);
        this.secretWord = words[randomIndex];
    },

    // ===================================
    // FUNCIÓN: Iniciar el juego
    // ===================================
    
    /**
     * Inicia una nueva partida:
     * - Valida que haya suficientes jugadores
     * - Selecciona el impostor aleatoriamente
     * - Elige la palabra secreta
     * - Comienza los turnos
     */
    startGame() {
        // Validar que haya al menos 3 jugadores
        if (this.players.length < 3) {
            alert("Se necesitan al menos 3 jugadores para jugar");
            return;
        }

        // Seleccionar impostor aleatorio
        this.impostorIndex = Math.floor(Math.random() * this.players.length);

        // Seleccionar palabra secreta de la categoría
        this.selectSecretWord();

        // Reiniciar el índice de turno
        this.currentTurnIndex = 0;

        // Cambiar a pantalla de turno
        this.showScreen('turnScreen');
        this.showCurrentPlayer();
    },

    // ===================================
    // FUNCIÓN: Mostrar jugador actual
    // ===================================
    
    /**
     * Muestra el nombre del jugador que está en turno
     */
    showCurrentPlayer() {
        const playerName = this.players[this.currentTurnIndex];
        document.getElementById('currentPlayer').textContent = playerName;
    },

    // ===================================
    // FUNCIÓN: Revelar rol del jugador
    // ===================================
    
    /**
     * Muestra la carta de rol del jugador actual
     * Si es impostor: muestra mensaje especial SIN palabra
     * Si es civil: muestra la palabra secreta
     */
    revealRole() {
        const card = document.getElementById('roleCard');
        const btn = document.getElementById('nextBtn');
        const isImpostor = this.currentTurnIndex === this.impostorIndex;
        const isLastPlayer = this.currentTurnIndex === this.players.length - 1;

        if (isImpostor) {
            card.className = 'card impostor';
            card.innerHTML = `
                <h2>😈 ERES EL IMPOSTOR 😈</h2>
                <p class="impostor-text">¡No conoces la palabra secreta!</p>
                <div class="category-display">
                    ${this.categoryIcons[this.selectedCategory]} Categoría: ${this.selectedCategory.charAt(0).toUpperCase() + this.selectedCategory.slice(1)}
                </div>
                <p style="margin-top: 20px;">Intenta descubrir la palabra sin que te descubran</p>
            `;
        } else {
            card.className = 'card';
            card.innerHTML = `
                <h2>👤 ERES UN CIVIL</h2>
                <div class="category-display">
                    ${this.categoryIcons[this.selectedCategory]} Categoría: ${this.selectedCategory.charAt(0).toUpperCase() + this.selectedCategory.slice(1)}
                </div>
                <p style="margin: 20px 0;">TU PALABRA ES:</p>
                <div class="secret-word">${this.secretWord}</div>
                <p style="margin-top: 20px;">¡Encuentra al impostor!</p>
            `;
        }

        // ✅ Si es el último jugador, cambiar botón
        if (isLastPlayer) {
            btn.textContent = "📊 Ver Resultados";
        } else {
            btn.textContent = "➡️ Siguiente Jugador";
        }

        this.showScreen('revealScreen');
    },

    // ===================================
    // FUNCIÓN: Siguiente turno
    // ===================================
    
    /**
     * Avanza al siguiente jugador
     * Si ya terminaron todos, muestra los resultados
     */
    nextTurn() {
        this.currentTurnIndex++;

        // Verificar si aún quedan jugadores por mostrar
        if (this.currentTurnIndex < this.players.length) {
            // Mostrar el siguiente turno
            this.showScreen('turnScreen');
            this.showCurrentPlayer();
        } else {
            // Todos vieron su rol, mostrar resultados
            this.showResults();
        }
    },

    // ===================================
    // FUNCIÓN: Mostrar resultados
    // ===================================
    
    /**
     * Muestra la pantalla final con:
     * - Categoría jugada
     * - Palabra secreta
     * - Quién fue el impostor
     * - Quiénes fueron los civiles
     */
    showResults() {
        const content = document.getElementById('resultsContent');
        
        // Obtener el nombre del impostor usando el índice guardado
        const impostorName = this.players[this.impostorIndex];
        
        // Filtrar todos los jugadores excepto el impostor para obtener civiles
        const civilians = this.players.filter((_, index) => index !== this.impostorIndex);

        // Obtener nombre de categoría capitalizado
        const categoryName = this.selectedCategory.charAt(0).toUpperCase() + this.selectedCategory.slice(1);

        // Generar HTML de resultados con verificación
        content.innerHTML = `
            <h3>${this.categoryIcons[this.selectedCategory]} Categoría Jugada</h3>
            <p><strong>${categoryName}</strong></p>

            <h3>🔑 Palabra Secreta</h3>
            <p><strong>${this.secretWord}</strong></p>

            <h3>😈 El Impostor Era</h3>
            <p class="impostor-reveal" style><strong>${impostorName}</strong></p>

            <h3>👥 Los Civiles Fueron</h3>
            ${civilians.map(name => `<p><strong>${name}</strong></p>`).join('')}
        `;

        // Mostrar pantalla de resultados
        this.showScreen('resultsScreen');
    },

    // ===================================
    // FUNCIÓN: Mostrar pantalla
    // ===================================
    
    /**
     * Cambia entre las diferentes pantallas del juego
     * @param {string} screenId - ID de la pantalla a mostrar
     */
    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar la pantalla solicitada
        document.getElementById(screenId).classList.add('active');
    },

    // ===================================
    // FUNCIÓN: Reiniciar juego
    // ===================================
    
    /**
     * Reinicia completamente el juego:
     * - Limpia todos los jugadores
     * - Resetea la categoría
     * - Limpia la palabra secreta
     * - Vuelve a la pantalla inicial
     */
    resetGame() {
    this.currentTurnIndex = 0;
    this.impostorIndex = -1;
    this.secretWord = "";

    // ✅ NO BORRAR jugadores
    document.getElementById('playerName').value = "";

    this.showScreen('setupScreen');
}

};

// ===================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ===================================

/**
 * Cuando la página carga, inicializar los elementos visuales
 */
game.renderPlayerList();
game.updateCategoryIcon();

window.onload = () => {
    const savedPlayers = localStorage.getItem("players");

    if (savedPlayers) {
        game.players = JSON.parse(savedPlayers);
        game.renderPlayerList();
    }

    game.updateCategoryIcon();
};
