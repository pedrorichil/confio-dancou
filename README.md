# Confiô, Dançou! 🎲

**Um jogo de estratégia social, confiança e traição para 5 a 10 jogadores, baseado no clássico Dilema do Prisioneiro da Teoria dos Jogos.**

Este projeto é uma exploração interativa de como a cooperação e o conflito emergem em um sistema social. Mais do que um jogo, é um experimento educativo sobre tomada de decisão, comportamento de grupo e as consequências da confiança (ou da falta dela).

---

## O Conceito Educativo: Teoria dos Jogos e o Dilema do Prisioneiro

A Teoria dos Jogos é um ramo da matemática que estuda como indivíduos racionais tomam decisões em situações estratégicas. O "Dilema do Prisioneiro" é o seu exemplo mais famoso.

### O Dilema Clássico (2 Jogadores)

Imagine dois criminosos capturados e mantidos em celas separadas. A polícia não tem provas suficientes para uma condenação pesada, a menos que um deles confesse. A polícia oferece a ambos o mesmo acordo, sem que um saiba a decisão do outro:

* **Se você trair seu parceiro (dedurar) e ele ficar em silêncio (cooperar),** você sai livre e ele pega 10 anos de prisão.
* **Se ambos ficarem em silêncio (cooperarem um com o outro),** ambos pegam apenas 1 ano por uma acusação menor.
* **Se ambos se traírem,** ambos pegam 5 anos de prisão.

O dilema é que, de uma perspectiva puramente individual e egoísta, trair é sempre a melhor opção. Não importa o que o outro faça, você sempre se sai melhor traindo. No entanto, se ambos seguirem essa lógica "racional", ambos se dão mal (5 anos), enquanto poderiam ter conseguido um resultado muito melhor cooperando (1 ano).

### O Dilema do Prisioneiro *Repetido* e o Jogo em Grupo

"Confiô, Dançou!" eleva este conceito a um novo patamar:

1.  **Repetição:** O jogo não acontece apenas uma vez, mas em múltiplas rodadas. Isso introduz conceitos como **reputação**, **vingança** e a possibilidade de construir (ou destruir) a **confiança** ao longo do tempo. Estratégias como "Olho por Olho" (começar cooperando e depois imitar a jogada anterior do oponente) se tornam viáveis.

2.  **Dinâmica de Grupo:** Em vez de um duelo 1x1, as decisões são tomadas em grupo e a pontuação é baseada no que a **maioria** fez. Isso cria um novo tipo de paranoia: você não precisa se preocupar com um único oponente, mas com a "vontade do povo". A traição se torna mais tentadora, pois é mais fácil se esconder na multidão.

O jogo se torna um microcosmo da sociedade: a cooperação sustentada gera a maior prosperidade para o grupo, mas a tentação do ganho individual de curto prazo é uma ameaça constante que pode levar todos a um resultado medíocre.

---

## Como Jogar

O objetivo é simples: ter a maior pontuação ao final de 10 rodadas.

### A Escolha

A cada rodada, todos os jogadores escolhem secretamente uma de duas ações:
* 🤝 **Cooperar:** Você confia na maioria.
* 🔪 **Trair:** Você tenta explorar a confiança da maioria para ganho pessoal.

### Sistema de Pontuação

Sua pontuação depende da sua escolha E da escolha da maioria:

| Sua Ação | Escolha da Maioria | Seus Pontos na Rodada | Análise |
| :--- | :--- | :--- | :--- |
| 🤝 **Cooperar** | A maioria **Coopera** | **+3** | O cenário ideal de confiança mútua. |
| 🤝 **Cooperar** | A maioria **Trai** | **0** | Você confiou e... dançou. |
| 🔪 **Trair** | A maioria **Coopera** | **+5** | O ganho máximo, às custas dos outros. |
| 🔪 **Trair** | A maioria **Trai** | **+1** | Caos generalizado, ganho mínimo. |

### Mecânicas Especiais

Para apimentar as coisas, o jogo inclui:
* 🕵️‍♂️ **Traidor Secreto:** Em certas rodadas, um jogador recebe a missão secreta de sabotar o grupo.
* ⚡ **Eventos Aleatórios (Ruído):** O sistema pode, aleatoriamente, inverter a jogada de um jogador, criando desconfiança.
* 🤖 **Inteligência Artificial:** Bots com diferentes personalidades (Anjo, Demônio, Rancoroso) podem ser adicionados para preencher as salas.

---

## Visão Geral da Tecnologia

* **Backend:** Python 3, FastAPI, WebSockets
* **Frontend:** React (JavaScript), CSS puro

---

## Como Executar o Projeto

Você precisará do Node.js (com npm) e do Python instalados.

### 1. Backend

Abra um terminal na raiz do projeto.

```bash
# Navegue até a pasta do backend
cd confio-dancou-backend

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt  # (Certifique-se de ter um requirements.txt ou instale "fastapi[all]")

# Rode o servidor
uvicorn app.main:app --port 8001 --reload

O backend estará rodando em `http://127.0.0.1:8001`.

### 2\. Frontend

Abra um **segundo** terminal na raiz do projeto.

```bash
# Navegue até a pasta do frontend
cd confio-dancou-frontend

# Instale as dependências
npm install

# Rode a aplicação de desenvolvimento
npm start
```

O jogo estará acessível no seu navegador em `http://localhost:3000`.

-----

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Autor

Criado por Pedro Richil
