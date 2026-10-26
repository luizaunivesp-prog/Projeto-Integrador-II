# Projeto Integrador II - Quadro Kanban - Rotina EMEB

Aplicação web com banco de dados para organizar o dia a dia de uma comunidade escolar: cadastro de alunos, professores, equipe de apoio e administração, e um quadro interativo (Kanban) para alocar as pessoas nos ambientes (salas de recursos e pátio).

Projeto desenvolvido para o Projeto Integrador II da UNIVESP.

Funcionalidades
* Cadastro, listagem e remoção de alunos, professores, equipe de apoio e administração
* Quadro Kanban de organização diária: arrastar e soltar cartões entre os ambientes
* Alocações do Kanban salvas no banco de dados (continuam no lugar ao recarregar a página)
* Histórico de observações pedagógicas por aluno (atualmente salvo no navegador)

Tecnologias
* Backend	Python, Flask, Flask-CORS
* Banco de dados	SQLite, com Flask-SQLAlchemy (ORM)
* Frontend	React, Vite, Tailwind CSS
* Kanban	@hello-pangea/dnd
  
Estrutura do projeto
projeto_integrador/
├── backend/
│   ├── app.py              # API Flask e modelos do banco
│   └── requirements.txt    # dependências Python
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config.js       # URL da API (variável VITE_API_URL)
│   │   └── components/     # Kanban, CrudGenerico, CalendarioGlob
│   └── package.json
└── README.md

Banco de dados
* Cinco tabelas: Aluno, Professor, Equipe e Administracao (cadastros) e AlocacaoDiaria, que se liga a Aluno, Professor e Equipe por chaves estrangeiras (relacionamento 1:N).

Como rodar localmente
Pré-requisitos: Python 3.9+, Node.js (LTS) e Git.
1. Clonar o repositório
bash
git clone https://github.com/luizaunivesp-prog/Projeto-Integrador-II.git
cd Projeto-Integrador-II
2. Backend (terminal 1)
bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows (PowerShell: .\venv\Scripts\Activate.ps1)
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python app.py
O backend sobe em http://localhost:5005 e cria o arquivo do banco automaticamente.
3. Frontend (terminal 2)
bash
cd frontend
npm install
npm run dev
Acesse http://localhost:5173 no navegador.
Nas próximas vezes, basta ativar o venv e rodar python app.py (backend) e npm run dev (frontend). Não precisa repetir a instalação.

Principais rotas da API
* Método	Rota	Descrição
GET	/api/menu	Itens do menu da aplicação
GET, POST	/api/alunos	Lista e cadastra alunos
DELETE	/api/alunos/<id>	Remove um aluno
GET, POST	/api/professores	Lista e cadastra professores
DELETE	/api/professores/<id>	Remove um professor
GET, POST	/api/equipe	Lista e cadastra equipe de apoio
DELETE	/api/equipe/<id>	Remove um membro da equipe
GET, POST	/api/administracao	Lista e cadastra administração
DELETE	/api/administracao/<id>	Remove um registro de administração
GET, POST	/api/alocacoes	Lista (filtro opcional ?data=AAAA-MM-DD) e cria alocações
DELETE	/api/alocacoes/<id>	Remove uma alocação

Publicação (deploy)
* Backend: serviço web (ex.: Render) com Root Directory backend, build pip install -r requirements.txt e start python app.py. Defina FLASK_DEBUG=false.
* Frontend: Vercel ou Netlify com Root Directory frontend. Defina a variável VITE_API_URL com a URL pública do backend (sem barra no final).

Limitações conhecidas e próximos passos
* Histórico de observações pedagógicas ainda salvo no navegador (migrar para o banco)
* Sem autenticação de usuários
* Banco SQLite em hospedagem gratuita pode ser reiniciado (avaliar PostgreSQL)

Equipe:
ALESSANDRO MASSEU, 2015547
ALINE BENEDICTO SOARES, 24200287
GABRIELL FELIPPE LEAL BARBOZA, 24220788
LUAN HENRIQUE CANDIDO DE ARAUJO, 23214291
LUIZA SANTOS LOPES, 24200047
RAFAEL RODRIGUES PENA, 24218331
ROSANGELA GALDINO, 23215076