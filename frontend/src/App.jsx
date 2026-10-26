// Arquivo: frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import CrudGenerico from './components/CrudGenerico';
import Kanban from './components/Kanban'; 
import CalendarioGlob from './components/CalendarioGlob';
import { API_URL } from './config';
import logoImg from './assets/logoprincipal.png'; 
import { Users, GraduationCap, CalendarDays, LayoutDashboard, Briefcase } from 'lucide-react';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telaAtual, setTelaAtual] = useState('menu'); 
  const [crudAtivo, setCrudAtivo] = useState(null);

  useEffect(() => {
    const buscarDadosDoMenu = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/menu`);
        const dados = await resposta.json();
        setMenuItems(dados);
        setActiveCard(dados[0]);
        setLoading(false);
      } catch (erro) {
        console.error("Erro:", erro);
        setLoading(false);
      }
    };
    buscarDadosDoMenu();
  }, []);

// ==========================================
  // CONFIGURAÇÕES DOS CRUDS (Atualizado para Apresentação Final)
  // ==========================================
  const configuracoesCrud = {
    'Alunos': {
      titulo: 'Alunos', 
      endpoint: 'alunos',
      campos: [
        { name: 'matricula', label: 'Matrícula / RA', tipo: 'text' },
        { name: 'nome_completo', label: 'Nome Completo', tipo: 'text' },
        { name: 'data_nascimento', label: 'Data de Nascimento', tipo: 'date' },
        { name: 'turma', label: 'Turma (Ex: 5º Ano A)', tipo: 'text' },
        { name: 'necessidade_especial', label: 'Necessidade Especial (Ex: TEA)', tipo: 'text' },
        { name: 'medicamentos_regulares', label: 'Medicamentos Regulares', tipo: 'text' },
        { name: 'contato_emergencia', label: 'Contato de Emergência (Telefone)', tipo: 'text' }
      ]
    },
    'Professores': {
      titulo: 'Professores', 
      endpoint: 'professores',
      campos: [
        { name: 'rf_cpf', label: 'RF ou CPF', tipo: 'text' },
        { name: 'nome_completo', label: 'Nome do Professor', tipo: 'text' },
        { name: 'disciplina', label: 'Disciplina', tipo: 'text' },
        { name: 'turno_trabalho', label: 'Turno de Trabalho', tipo: 'text' },
        { name: 'telefone_contato', label: 'Telefone de Contato', tipo: 'text' }
      ]
    },
    'Equipe': {
      titulo: 'Membros da Equipe', 
      endpoint: 'equipe',
      campos: [
        { name: 'rf_cpf', label: 'RF ou CPF', tipo: 'text' },
        { name: 'nome_completo', label: 'Nome do Profissional', tipo: 'text' },
        { name: 'cargo', label: 'Cargo (Ex: Cuidador, Psicólogo)', tipo: 'text' },
        { name: 'turno_trabalho', label: 'Turno de Atuação', tipo: 'text' },
        { name: 'telefone_contato', label: 'Telefone de Contato', tipo: 'text' }
      ]
    },
    'Administração': {
      titulo: 'Administração', 
      endpoint: 'administracao',
      campos: [
        { name: 'rf_cpf', label: 'RF ou CPF', tipo: 'text' },
        { name: 'nome_completo', label: 'Nome do Administrador', tipo: 'text' },
        { name: 'funcao', label: 'Função', tipo: 'text' },
        { name: 'email', label: 'E-mail Institucional', tipo: 'email' }
      ]
    }
  };
  
  // ==========================================
  // ESTILOS DINÂMICOS PARA OS CARDS
  // ==========================================
  const cardStyles = [
    { corBg: 'bg-blue-500/20', corBorda: 'border-blue-400/50', corSombra: 'shadow-[0_0_40px_rgba(96,165,250,0.4)]', corIcone: 'text-blue-400', icone: CalendarDays, brilho: 'from-blue-400/10' },
    { corBg: 'bg-emerald-500/20', corBorda: 'border-emerald-400/50', corSombra: 'shadow-[0_0_40px_rgba(52,211,153,0.4)]', corIcone: 'text-emerald-400', icone: GraduationCap, brilho: 'from-emerald-400/10' },
    { corBg: 'bg-purple-500/20', corBorda: 'border-purple-400/50', corSombra: 'shadow-[0_0_40px_rgba(167,139,250,0.4)]', corIcone: 'text-purple-400', icone: Users, brilho: 'from-purple-400/10' },
    { corBg: 'bg-amber-500/20', corBorda: 'border-amber-400/50', corSombra: 'shadow-[0_0_40px_rgba(251,191,36,0.4)]', corIcone: 'text-amber-400', icone: Briefcase, brilho: 'from-amber-400/10' }
  ];

  const lidarComCliqueSubmenu = (submenuClicado) => {
    if (submenuClicado === 'Acessar Quadro') { 
      setTelaAtual('kanban');
    } else if (submenuClicado === 'Ver Calendário') {
      setTelaAtual('calendario');
    } else if (configuracoesCrud[submenuClicado]) {
      setCrudAtivo(configuracoesCrud[submenuClicado]);
      setTelaAtual('crud');
    } else {
      alert(`A tela de ${submenuClicado} será construída em breve!`);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex justify-center items-center"><h2 className="text-2xl animate-pulse">Carregando...</h2></div>;
  if (!menuItems.length) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex justify-center items-center"><h2 className="text-2xl text-red-400">Erro no servidor.</h2></div>;

  if (telaAtual === 'kanban') return <Kanban onVoltar={() => setTelaAtual('menu')} />;
  if (telaAtual === 'calendario') return <CalendarioGlob onVoltar={() => setTelaAtual('menu')} />;
  if (telaAtual === 'crud' && crudAtivo) {
    return <CrudGenerico titulo={crudAtivo.titulo} endpoint={crudAtivo.endpoint} campos={crudAtivo.campos} onVoltar={() => setTelaAtual('menu')} />;
  }

  // ==========================================
  // TELA PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white font-sans overflow-hidden flex flex-col items-center pt-8">
      
      {/* CABEÇALHO */}
      <header className="w-full flex justify-center items-center mb-10 pb-6 border-b border-white/10">
        <img 
          src={logoImg} 
          alt="Logo Ponto.Cosmópolis.Edu" 
          className="h-64 w-auto object-contain bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 shadow-2xl transition-all duration-300 hover:scale-105" 
        />
      </header>

      {/* TEXTO DO MENU ATIVO */}
      <div className="mb-4 text-center transition-all duration-500 ease-in-out h-24">
        <h2 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
          {activeCard.title}
        </h2>
        <p className="text-xl text-gray-300 font-light">{activeCard.description}</p>
      </div>

      {/* CARDS COLORIDOS COM ÍCONES */}
      <div className="flex gap-8 overflow-x-auto py-10 px-4 w-full justify-center items-center min-h-[400px]">
        {menuItems.map((item, index) => {
          const isActive = activeCard.id === item.id;
          const estilo = cardStyles[index % cardStyles.length];
          const IconeCard = estilo.icone;

          return (
            <button
              key={item.id}
              onMouseEnter={() => setActiveCard(item)}
              onClick={() => setActiveCard(item)}
              className={`
                w-64 h-80 rounded-3xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center p-6 relative overflow-hidden backdrop-blur-xl group
                ${isActive 
                  ? `${estilo.corBg} border border-${estilo.corBorda} ${estilo.corSombra} scale-110` 
                  : 'bg-white/5 border border-white/10 opacity-50 hover:opacity-100 hover:scale-105 hover:bg-white/10'}
              `}
            >
              {/* Efeito de brilho interno no hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${estilo.brilho} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Ícone dinâmico */}
              <IconeCard 
                size={isActive ? 72 : 48} 
                className={`mb-6 transition-all duration-500 ${isActive ? `${estilo.corIcone} animate-bounce drop-shadow-xl` : 'text-gray-400 group-hover:text-gray-200'}`} 
              />
              
              <span className={`text-2xl font-bold tracking-wide relative z-10 text-center ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUBMENUS */}
      <div className="mt-2 flex gap-4 h-12 flex-wrap justify-center">
        {activeCard.submenus.map((submenu, index) => (
          <button 
            key={index} 
            onClick={() => lidarComCliqueSubmenu(submenu)}
            className="px-8 py-3 bg-white/10 hover:bg-blue-500/40 backdrop-blur-md rounded-full text-lg font-bold tracking-wide transition-all duration-300 border border-white/20 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            {submenu}
          </button>
        ))}
      </div>
      
    </div>
  );
}

export default App;