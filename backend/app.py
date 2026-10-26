# Arquivo: backend/app.py
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# ==========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ==========================================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///escola.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ==========================================
# MODELOS (Tabelas Bancos de Dados)
# ==========================================


class Aluno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(50), nullable=False, unique=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.String(20), nullable=False)
    turma = db.Column(db.String(50), nullable=False)
    necessidade_especial = db.Column(db.String(100))
    medicamentos_regulares = db.Column(db.String(200))
    contato_emergencia = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "matricula": self.matricula, "nome_completo": self.nome_completo,
            "data_nascimento": self.data_nascimento, "turma": self.turma,
            "necessidade_especial": self.necessidade_especial,
            "medicamentos_regulares": self.medicamentos_regulares,
            "contato_emergencia": self.contato_emergencia
        }


class Professor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rf_cpf = db.Column(db.String(50), nullable=False, unique=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    disciplina = db.Column(db.String(100), nullable=False)
    turno_trabalho = db.Column(db.String(50), nullable=False)
    telefone_contato = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "rf_cpf": self.rf_cpf, "nome_completo": self.nome_completo,
            "disciplina": self.disciplina, "turno_trabalho": self.turno_trabalho,
            "telefone_contato": self.telefone_contato
        }


class Equipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rf_cpf = db.Column(db.String(50), nullable=False, unique=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    turno_trabalho = db.Column(db.String(50), nullable=False)
    telefone_contato = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "rf_cpf": self.rf_cpf, "nome_completo": self.nome_completo,
            "cargo": self.cargo, "turno_trabalho": self.turno_trabalho,
            "telefone_contato": self.telefone_contato
        }


class Administracao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rf_cpf = db.Column(db.String(50), nullable=False, unique=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    funcao = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "rf_cpf": self.rf_cpf, "nome_completo": self.nome_completo,
            "funcao": self.funcao, "email": self.email
        }


class AlocacaoDiaria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_alocacao = db.Column(db.String(20), nullable=False)
    local_ambiente = db.Column(db.String(100), nullable=False)
    observacao_do_turno = db.Column(db.Text)
    aluno_id = db.Column(db.Integer, db.ForeignKey('aluno.id'))
    professor_id = db.Column(db.Integer, db.ForeignKey('professor.id'))
    equipe_id = db.Column(db.Integer, db.ForeignKey('equipe.id'))

    # relationship() não cria coluna nova no banco: é um atalho do SQLAlchemy
    # para acessar o objeto Aluno/Professor/Equipe relacionado diretamente,
    # sem precisar fazer uma consulta separada.
    aluno = db.relationship('Aluno')
    professor = db.relationship('Professor')
    equipe = db.relationship('Equipe')

    def to_dict(self):
        return {
            "id": self.id,
            "data_alocacao": self.data_alocacao,
            "local_ambiente": self.local_ambiente,
            "observacao_do_turno": self.observacao_do_turno,
            "aluno_id": self.aluno_id,
            "professor_id": self.professor_id,
            "equipe_id": self.equipe_id,
            # nomes já resolvidos, prontos para exibir no card do Kanban
            "aluno_nome": self.aluno.nome_completo if self.aluno else None,
            "professor_nome": self.professor.nome_completo if self.professor else None,
            "equipe_nome": self.equipe.nome_completo if self.equipe else None,
        }

# ==========================================
# ROTAS DA API (Endpoints)
# ==========================================


@app.route('/api/menu', methods=['GET'])
def get_menu():
    menu_items = [
        {"id": 'cadastros', "title": 'Cadastros', "description": 'Gerencie os registros do sistema.',
            "submenus": ['Administração', 'Professores', 'Equipe', 'Alunos']},
        {"id": 'calendario', "title": 'Calendário Global', "description": 'Integração com Toast UI Calendar para eventos.',
         "submenus": ['Ver Calendário', 'Adicionar Evento']},
        {"id": 'organizacao', "title": 'Organização Diária',
         "description": 'Quadro Kanban para alocação de salas e profissionais.', "submenus": ['Acessar Quadro', 'Gerenciar Salas']}
    ]
    return jsonify(menu_items)

# --- ROTAS PARA ALUNOS ---


@app.route('/api/alunos', methods=['GET', 'POST'])
def gerenciar_alunos():
    if request.method == 'POST':
        dados = request.json
        novo = Aluno(
            matricula=dados.get('matricula'),
            nome_completo=dados.get('nome_completo'),
            data_nascimento=dados.get('data_nascimento'),
            turma=dados.get('turma'),
            necessidade_especial=dados.get('necessidade_especial', ''),
            medicamentos_regulares=dados.get('medicamentos_regulares', ''),
            contato_emergencia=dados.get('contato_emergencia')
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Aluno cadastrado!", "dados": novo.to_dict()}), 201

    return jsonify([item.to_dict() for item in Aluno.query.all()])


@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def deletar_aluno(id):
    aluno = Aluno.query.get(id)
    if aluno:
        db.session.delete(aluno)
        db.session.commit()
        return jsonify({"mensagem": "Aluno removido com sucesso!"}), 200
    return jsonify({"erro": "Aluno não encontrado"}), 404

# --- ROTAS PARA PROFESSORES ---


@app.route('/api/professores', methods=['GET', 'POST'])
def gerenciar_professores():
    if request.method == 'POST':
        dados = request.json
        novo = Professor(
            rf_cpf=dados.get('rf_cpf'),
            nome_completo=dados.get('nome_completo'),
            disciplina=dados.get('disciplina'),
            turno_trabalho=dados.get('turno_trabalho'),
            telefone_contato=dados.get('telefone_contato')
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Professor cadastrado!", "dados": novo.to_dict()}), 201

    return jsonify([item.to_dict() for item in Professor.query.all()])


@app.route('/api/professores/<int:id>', methods=['DELETE'])
def deletar_professor(id):
    professor = Professor.query.get(id)
    if professor:
        db.session.delete(professor)
        db.session.commit()
        return jsonify({"mensagem": "Professor removido com sucesso!"}), 200
    return jsonify({"erro": "Professor não encontrado"}), 404

# --- ROTAS PARA EQUIPE ---


@app.route('/api/equipe', methods=['GET', 'POST'])
def gerenciar_equipe():
    if request.method == 'POST':
        dados = request.json
        novo = Equipe(
            rf_cpf=dados.get('rf_cpf'),
            nome_completo=dados.get('nome_completo'),
            cargo=dados.get('cargo'),
            turno_trabalho=dados.get('turno_trabalho'),
            telefone_contato=dados.get('telefone_contato')
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Membro da equipe cadastrado!", "dados": novo.to_dict()}), 201

    return jsonify([item.to_dict() for item in Equipe.query.all()])


@app.route('/api/equipe/<int:id>', methods=['DELETE'])
def deletar_equipe(id):
    membro = Equipe.query.get(id)
    if membro:
        db.session.delete(membro)
        db.session.commit()
        return jsonify({"mensagem": "Membro da equipe removido com sucesso!"}), 200
    return jsonify({"erro": "Membro não encontrado"}), 404

# --- ROTAS PARA ADMINISTRAÇÃO ---


@app.route('/api/administracao', methods=['GET', 'POST'])
def gerenciar_administracao():
    if request.method == 'POST':
        dados = request.json
        novo = Administracao(
            rf_cpf=dados.get('rf_cpf'),
            nome_completo=dados.get('nome_completo'),
            funcao=dados.get('funcao'),
            email=dados.get('email')
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Administrador cadastrado!", "dados": novo.to_dict()}), 201

    return jsonify([item.to_dict() for item in Administracao.query.all()])


@app.route('/api/administracao/<int:id>', methods=['DELETE'])
def deletar_administracao(id):
    admin = Administracao.query.get(id)
    if admin:
        db.session.delete(admin)
        db.session.commit()
        return jsonify({"mensagem": "Administrador removido com sucesso!"}), 200
    return jsonify({"erro": "Administrador não encontrado"}), 404


# --- ROTAS PARA ALOCAÇÃO DIÁRIA (Kanban) ---


@app.route('/api/alocacoes', methods=['GET', 'POST'])
def gerenciar_alocacoes():
    if request.method == 'POST':
        dados = request.json
        nova = AlocacaoDiaria(
            data_alocacao=dados.get('data_alocacao'),
            local_ambiente=dados.get('local_ambiente'),
            observacao_do_turno=dados.get('observacao_do_turno', ''),
            aluno_id=dados.get('aluno_id'),
            professor_id=dados.get('professor_id'),
            equipe_id=dados.get('equipe_id')
        )
        db.session.add(nova)
        db.session.commit()
        return jsonify({"mensagem": "Alocação registrada!", "dados": nova.to_dict()}), 201

    # ?data=2026-09-14 filtra as alocações de um dia específico (útil pro Kanban)
    data_filtro = request.args.get('data')
    query = AlocacaoDiaria.query
    if data_filtro:
        query = query.filter_by(data_alocacao=data_filtro)
    return jsonify([item.to_dict() for item in query.all()])


@app.route('/api/alocacoes/<int:id>', methods=['DELETE'])
def deletar_alocacao(id):
    alocacao = AlocacaoDiaria.query.get(id)
    if alocacao:
        db.session.delete(alocacao)
        db.session.commit()
        return jsonify({"mensagem": "Alocação removida com sucesso!"}), 200
    return jsonify({"erro": "Alocação não encontrada"}), 404


# ==========================================
# INICIALIZAÇÃO DO SERVIDOR
# ==========================================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # PORT vem definida automaticamente pelo serviço de hospedagem (ex: Render).
    # Localmente, continua usando 5005 como antes.
    porta = int(os.environ.get('PORT', 5005))
    # debug=True só localmente; em produção isso expõe informações sensíveis
    modo_debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=porta, debug=modo_debug)
