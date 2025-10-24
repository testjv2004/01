javascript:(function(){
    // Mapeamento de cores
    const coresMap = {
        0: { nome: 'Branco', cor: 'white', texto: 'black' },
        1: { nome: '🟥 Vermelho', cor: '#ff3c59', texto: 'white' },
        2: { nome: '⬛ Preto', cor: '#1d2027', texto: 'white' },
    };

    // Função para obter o nome da cor
    const getCorNome = num => {
        const data = coresMap[num];
        return data ? data.nome : 'Desconhecido';
    };

    // Função para obter os dados da cor (cor e texto)
    const getCorPorNumero = num => {
        if (num === 0) return coresMap[0];
        return num >= 1 && num <= 7 ? coresMap[1] : coresMap[2];
    };

    // Função para criar um tile de resultado
    const criarTile = numero => {
        const corData = getCorPorNumero(numero);
        const tile = document.createElement('div');
        tile.className = 'tile-wrapper';
        tile.style.cssText = `
            min-width: 28px; height: 28px; border-radius: 6px;
            background-color: ${corData.cor}; display: flex;
            justify-content: center; align-items: center;
            font-size: 14px; font-weight: bold;
            color: ${corData.texto}; margin: 0 4px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        `;
        tile.textContent = numero;
        return tile;
    };

    let lastResultId = null;
    let loadingInterval;
    const loadingMessages = [
        'Iniciando conexão segura...',
        'Bypass firewall...',
        'Acessando dados da roleta...',
        'Decifrando algoritmo...'
    ];

    // Remove o menu existente se houver
    if (document.getElementById('apiTestMenu')) {
        document.getElementById('apiTestMenu').remove();
    }

    // Cria o elemento principal do menu
    const menu = document.createElement('div');
    menu.id = 'apiTestMenu';
    menu.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 90%; max-width: 300px; /* Reduzindo a largura máxima */
        background-color: #2a2a2a; color: white; font-family: sans-serif;
        border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.7);
        padding: 20px; z-index: 999999;
        display: flex; flex-direction: column; gap: 10px;
        max-height: 80vh; overflow-y: auto;
        position: relative; /* Necessário para posicionar o botão X */
    `;

    // Conteúdo HTML do menu
    menu.innerHTML = `
        <h2 style="margin:0 0 15px;text-align:center;color:#00ff00;">🧪 I.a Double 00</h2>
        <button id="closeApiMenu" style="
            position: absolute; top: 10px; right: 10px;
            background-color: #444; color: white; border: none;
            width: 28px; height: 28px; border-radius: 50%; /* Botão X redondo */
            font-size: 16px; font-weight: bold; cursor: pointer;
            display: flex; justify-content: center; align-items: center;
            transition: background-color 0.2s ease;
        ">X</button>
        <div id="statusMessageDiv" style="text-align: center; margin-bottom: 10px; color: #ccc; min-height: 20px;"></div>
        <div id="apiResults" style="
            background-color:#1a1a1a; padding:10px; border-radius:8px;
            min-height:40px; height:auto; display:flex; justify-content:flex-end;
            align-items:center; gap:5px; overflow-x:hidden; overflow-y:hidden;
            white-space:nowrap; border:1px solid #444; flex-direction:row-reverse;
        ">
            <!-- Tiles de resultado serão inseridos aqui -->
        </div>
        <div id="suggestionBox" style="
            text-align:center; font-size:16px; padding:10px; border-radius:8px;
            font-weight:bold; color:white; background-color:#ff3c59; /* Cor inicial */
            cursor:pointer; transition:transform 0.2s ease, background-color 0.2s ease;
            margin-top: 10px; /* Espaçamento acima do botão */
        ">
            Aguardando entrada...
        </div>
    `;
    document.body.appendChild(menu);

    // Referências aos elementos do DOM
    const statusMessageDiv = document.getElementById('statusMessageDiv');
    const apiResultsDiv = document.getElementById('apiResults');
    const suggestionBox = document.getElementById('suggestionBox');
    const closeButton = document.getElementById('closeApiMenu');

    let fetchInterval;

    // Inicia a animação de carregamento
    const startLoadingAnimation = () => {
        let msgIndex = 0;
        statusMessageDiv.textContent = loadingMessages[msgIndex];
        loadingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            statusMessageDiv.textContent = loadingMessages[msgIndex];
        }, 400);
    };

    // Para a animação de carregamento
    const stopLoadingAnimation = () => {
        clearInterval(loadingInterval);
        statusMessageDiv.textContent = ''; // Limpa a mensagem após carregar
    };

    // Função principal para buscar e exibir os dados
    const fetchAndDisplayData = async () => {
        // Só mostra a animação de carregamento se a div de resultados estiver vazia
        // ou se for a primeira vez que está buscando
        if (apiResultsDiv.children.length === 0 || !lastResultId) {
            startLoadingAnimation();
        }

        try {
            const response = await fetch('https://blaze.bet.br/api/singleplayer-originals/originals/roulette_games/recent/1');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            stopLoadingAnimation(); // Para a animação de carregamento

            if (data && data.length > 0) {
                const latestResult = data[0];

                // Verifica se o resultado é novo para evitar atualizações desnecessárias
                if (latestResult.id !== lastResultId) {
                    lastResultId = latestResult.id;

                    // Se for a primeira carga, preenche com os 6 últimos
                    if (apiResultsDiv.children.length === 0) {
                        const lastSixResults = data.slice(0, 6);
                        // Inverte para adicionar na ordem correta (mais antigo primeiro para flex-direction: row-reverse)
                        lastSixResults.reverse().forEach(item => {
                            apiResultsDiv.appendChild(criarTile(item.roll));
                        });
                    } else {
                        // Se já tem tiles, adiciona o novo e remove o mais antigo
                        apiResultsDiv.prepend(criarTile(latestResult.roll)); // Adiciona o novo à direita
                        if (apiResultsDiv.children.length > 6) {
                            apiResultsDiv.removeChild(apiResultsDiv.lastChild); // Remove o mais antigo da esquerda
                        }
                    }

                    // Lógica de sugestão de aposta
                    let currentSuggestionText = 'Aguardando entrada...';
                    let currentSuggestionBgColor = '#444';

                    if (latestResult.roll >= 1 && latestResult.roll <= 7) { // Vermelho
                        currentSuggestionText = '👉 Entrar no Preto';
                        currentSuggestionBgColor = '#1d2027'; // Preto
                    } else if (latestResult.roll >= 8) { // Preto
                        currentSuggestionText = '👉 Entrar no Vermelho';
                        currentSuggestionBgColor = '#ff3c59'; // Vermelho
                    } else { // Branco (0)
                        currentSuggestionText = '👉 Sem sugestão';
                        currentSuggestionBgColor = '#444';
                    }
                    suggestionBox.textContent = currentSuggestionText;
                    suggestionBox.style.background = currentSuggestionBgColor;
                }
            } else {
                statusMessageDiv.textContent = 'Nenhum resultado encontrado.';
                apiResultsDiv.innerHTML = ''; // Limpa os tiles se não houver dados
            }
        } catch (error) {
            stopLoadingAnimation();
            statusMessageDiv.textContent = `Erro ao carregar dados: ${error.message}`;
            console.error('Erro ao carregar dados da API:', error);
        }
    };

    // Event listener para o botão Fechar (X)
    closeButton.addEventListener('click', () => {
        clearInterval(fetchInterval); // Para a atualização automática
        menu.remove(); // Remove o menu da tela
    });

    // Inicia a busca de dados e a atualização automática
    fetchAndDisplayData(); // Primeira chamada imediata
    fetchInterval = setInterval(fetchAndDisplayData, 2000); // Atualiza a cada 2 segundos
})();
