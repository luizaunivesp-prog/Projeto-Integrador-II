// Arquivo: frontend/src/components/Kanban.jsx
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, FileText, CheckCircle, X, Plus, Edit2, Clock, User, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';

export default function Kanban({ onVoltar }) {
  const [colunas, setColunas] = useState({
    'disponiveis': { nome: 'Profissionais e Alunos Disponíveis', itens: [] },
    'sala_recursos1': { nome: 'Sala de Recursos 1', itens: [] },
    'sala_recursos2': { nome: 'Sala de Recursos 2', itens: [] },
    'patio': { nome: 'Pátio / Recreação', itens: [] }
  });

  const [carregando, setCarregando] = useState(true);
  
  // Estados do Modal de Diário de Bordo
  const [modalAberto, setModalAberto] = useState(false);
  const [cardSelecionado, setCardSelecionado] = useState(null);
  const [textoRegistro, setTextoRegistro] = useState('');
  const [autorRegistro, setAutorRegistro] = useState('Coordenação');
  const [editandoId, setEditandoId] = useState(null);

  // Data de hoje no formato AAAA-MM-DD (usada como chave das alocações no banco)
  const dataDeHoje = () => new Date().toISOString().split('T')[0];

  // O histórico de observações (diário) continua salvo no navegador por enquanto —
  // é um recurso separado da posição das pessoas no quadro.
  const salvarHistoricoNoNavegador = (colunasAtuais) => {
    const mapaHistoricos = {};
    Object.values(colunasAtuais).forEach(coluna => {
      coluna.itens.forEach(item => {
        if (item.historico && item.historico.length > 0) {
          mapaHistoricos[item.id] = item.historico;
        }
      });
    });
    localStorage.setItem('ponto_cosmopolis_kanban_historico', JSON.stringify(mapaHistoricos));
  };

  // Função que busca dados do Flask (alunos/professores/equipe) e também as
  // alocações de HOJE já salvas no banco, para saber em qual sala cada um está
  const carregarQuadroEAlocacoes = async () => {
    try {
      const [resAlunos, resProfessores, resEquipe, resAlocacoes] = await Promise.all([
         fetch(`${API_URL}/api/alunos`),
         fetch(`${API_URL}/api/professores`),
         fetch(`${API_URL}/api/equipe`),
         fetch(`${API_URL}/api/alocacoes?data=${dataDeHoje()}`)
      ]);

      const alunos = await resAlunos.json();
      const professores = await resProfessores.json();
      const equipe = await resEquipe.json();
      const alocacoes = await resAlocacoes.json();

      // Históricos de observação ainda vêm do navegador
      const historicosSalvos = JSON.parse(localStorage.getItem('ponto_cosmopolis_kanban_historico')) || {};

      // Monta um mapa: "aluno-3" -> { colunaId: 'patio', alocacaoId: 12 }
      // a partir do que já está gravado no banco de dados para hoje
      const mapaAlocacoesDoBanco = {};
      alocacoes.forEach(a => {
        let chave = null;
        if (a.aluno_id) chave = `aluno-${a.aluno_id}`;
        else if (a.professor_id) chave = `prof-${a.professor_id}`;
        else if (a.equipe_id) chave = `equipe-${a.equipe_id}`;
        if (chave) {
          mapaAlocacoesDoBanco[chave] = { colunaId: a.local_ambiente, alocacaoId: a.id };
        }
      });

      const estadoInicialColunas = {
        'disponiveis': { nome: 'Profissionais e Alunos Disponíveis', itens: [] },
        'sala_recursos1': { nome: 'Sala de Recursos 1', itens: [] },
        'sala_recursos2': { nome: 'Sala de Recursos 2', itens: [] },
        'patio': { nome: 'Pátio / Recreação', itens: [] }
      };

      const itensFormatados = [
        ...alunos.map(a => ({ 
          id: `aluno-${a.id}`, 
          conteudo: a.nome_completo, 
          tipo: 'Aluno', 
          detalhe: a.necessidade_especial ? `Apoio: ${a.necessidade_especial}` : `Turma: ${a.turma}`,
          cor: 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-100'
        })),
        ...professores.map(p => ({ 
          id: `prof-${p.id}`, 
          conteudo: p.nome_completo, 
          tipo: 'Professor', 
          detalhe: p.disciplina,
          cor: 'from-emerald-500/20 to-emerald-600/20 border-emerald-400/30 text-emerald-100'
        })),
        ...equipe.map(e => ({ 
          id: `equipe-${e.id}`, 
          conteudo: e.nome_completo, 
          tipo: 'Equipe de Apoio', 
          detalhe: e.cargo,
          cor: 'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-100'
        }))
      ];

      // Distribui os itens nas colunas com base no que está no BANCO DE DADOS
      itensFormatados.forEach(item => {
        item.historico = historicosSalvos[item.id] || [];
        const registroDoBanco = mapaAlocacoesDoBanco[item.id];

        if (registroDoBanco && estadoInicialColunas[registroDoBanco.colunaId]) {
          item.alocacaoId = registroDoBanco.alocacaoId;
          estadoInicialColunas[registroDoBanco.colunaId].itens.push(item);
        } else {
          item.alocacaoId = null;
          estadoInicialColunas['disponiveis'].itens.push(item);
        }
      });

      setColunas(estadoInicialColunas);
      setCarregando(false);
    } catch (erro) {
      console.error("Erro ao carregar dados para o Kanban:", erro);
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarQuadroEAlocacoes();
  }, []);

  // Limpa o Kanban: apaga as alocações de hoje no banco + o histórico salvo no navegador
  const limparQuadroGeral = async () => {
    if(window.confirm("Deseja resetar todas as alocações e históricos do quadro para o padrão?")) {
      setCarregando(true);
      const todosOsItens = Object.values(colunas).flatMap(coluna => coluna.itens);
      await Promise.all(
        todosOsItens
          .filter(item => item.alocacaoId)
          .map(item => fetch(`${API_URL}/api/alocacoes/${item.alocacaoId}`, { method: 'DELETE' }))
      );
      localStorage.removeItem('ponto_cosmopolis_kanban_historico');
      carregarQuadroEAlocacoes();
    }
  };

  // Descobre o tipo (aluno/professor/equipe) e o id real no banco a partir do id do card, ex: "aluno-3"
  const identificarItem = (item) => {
    const [tipo, idTexto] = item.id.split('-');
    const idNumero = Number(idTexto);
    if (tipo === 'aluno') return { aluno_id: idNumero };
    if (tipo === 'prof') return { professor_id: idNumero };
    return { equipe_id: idNumero };
  };

  // Salva no banco de dados a nova posição de um item (chamado após soltar o card)
  const salvarAlocacaoNoBanco = async (item, novaColunaId) => {
    try {
      // Se já existia uma alocação para esse item hoje, apaga a antiga primeiro
      if (item.alocacaoId) {
        await fetch(`${API_URL}/api/alocacoes/${item.alocacaoId}`, { method: 'DELETE' });
        item.alocacaoId = null;
      }

      // Se o destino for "disponíveis", não criamos alocação nova (pessoa está livre)
      if (novaColunaId === 'disponiveis') return;

      const resposta = await fetch(`${API_URL}/api/alocacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_alocacao: dataDeHoje(),
          local_ambiente: novaColunaId,
          observacao_do_turno: '',
          ...identificarItem(item)
        })
      });
      const resultado = await resposta.json();
      item.alocacaoId = resultado.dados.id;
    } catch (erro) {
      console.error('Erro ao salvar alocação no banco:', erro);
      alert('Não foi possível salvar essa alocação no banco de dados. Verifique se o backend está rodando.');
    }
  };

  const lidarComFimDoArraste = (resultado) => {
    if (!resultado.destination) return;
    const { source, destination } = resultado;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const novasColunas = { ...colunas };
    const colunaOrigem = novasColunas[source.droppableId];
    const colunaDestino = novasColunas[destination.droppableId];

    const [itemArrastado] = colunaOrigem.itens.splice(source.index, 1);
    colunaDestino.itens.splice(destination.index, 0, itemArrastado);

    // Atualiza a tela imediatamente (não espera o backend responder, pra ficar rápido)
    setColunas(novasColunas);
    // E salva a mudança no banco de dados em segundo plano
    salvarAlocacaoNoBanco(itemArrastado, destination.droppableId);
  };

  const abrirModalDiario = (item) => {
    setCardSelecionado(item);
    setTextoRegistro('');
    setEditandoId(null);
    setModalAberto(true);
  };

  const prepararEdicao = (registro) => {
    setEditandoId(registro.id);
    setTextoRegistro(registro.texto);
    setAutorRegistro(registro.autor);
  };

  const salvarRegistroDiario = (e) => {
    e.preventDefault();
    if (!textoRegistro.trim()) return;

    const dataAtual = new Date();
    const novoRegistroObj = {
      id: editandoId || Date.now(),
      data: dataAtual.toLocaleDateString('pt-BR'),
      hora: dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      autor: autorRegistro,
      texto: textoRegistro
    };

    const novasColunas = { ...colunas };
    
    for (const key in novasColunas) {
      const index = novasColunas[key].itens.findIndex(i => i.id === cardSelecionado.id);
      if (index !== -1) {
        const item = novasColunas[key].itens[index];
        
        if (editandoId) {
          item.historico = item.historico.map(r => r.id === editandoId ? novoRegistroObj : r);
        } else {
          item.historico = [novoRegistroObj, ...(item.historico || [])];
        }
        
        setCardSelecionado({ ...item });
        break;
      }
    }
    
    setColunas(novasColunas);
    salvarHistoricoNoNavegador(novasColunas);
    setTextoRegistro('');
    setEditandoId(null);
  };

  if (carregando) return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center text-2xl font-bold animate-pulse">Preparando o Quadro Diário...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white p-8 w-full flex flex-col items-center relative">
      
      {/* MODAL DO DIÁRIO DE BORDO */}
      {modalAberto && cardSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                  <FileText /> Histórico Pedagógico
                </h3>
                <p className="text-gray-300 mt-1">Aluno(a): <strong className="text-white">{cardSelecionado.conteudo}</strong></p>
              </div>
              <button onClick={() => setModalAberto(false)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col">
                <h4 className="text-lg font-bold text-gray-200 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                  {editandoId ? 'Editar Registro' : 'Novo Registro'}
                </h4>
                
                <form onSubmit={salvarRegistroDiario} className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Profissional / Autor</label>
                    <input 
                      type="text" 
                      value={autorRegistro}
                      onChange={(e) => setAutorRegistro(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Observação / Ocorrência</label>
                    <textarea 
                      value={textoRegistro}
                      onChange={(e) => setTextoRegistro(e.target.value)}
                      placeholder="Descreva o comportamento ou eventos..."
                      className="w-full h-32 bg-slate-900/80 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {editandoId && (
                      <button type="button" onClick={() => { setEditandoId(null); setTextoRegistro(''); }} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition">
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg transition">
                      {editandoId ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="w-full md:w-2/3 flex flex-col">
                <h4 className="text-lg font-bold text-gray-200 mb-4 border-b border-white/10 pb-2">
                  Registros Anteriores ({cardSelecionado.historico?.length || 0})
                </h4>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {!cardSelecionado.historico || cardSelecionado.historico.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 border border-dashed border-gray-600 rounded-xl bg-white/5">
                      Nenhum registro encontrado para este aluno hoje.
                    </div>
                  ) : (
                    cardSelecionado.historico.map((registro) => (
                      <div key={registro.id} className="bg-slate-900/60 border border-white/10 p-4 rounded-xl relative group hover:bg-slate-900 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-3 text-xs font-bold text-blue-300">
                            <span className="flex items-center gap-1"><Clock size={12} /> {registro.data} - {registro.hora}</span>
                            <span className="flex items-center gap-1 text-emerald-300"><User size={12} /> {registro.autor}</span>
                          </div>
                          <button 
                            onClick={() => prepararEdicao(registro)}
                            className="text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                        <p className="text-gray-200 text-sm whitespace-pre-wrap">{registro.texto}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DO KANBAN */}
      <div className="w-full max-w-[1600px] flex justify-between items-center mb-8 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Alocação Diária (Kanban)
          </h2>
          <p className="text-gray-400 mt-1">Os cartões permanecem salvos em suas salas mesmo ao navegar pelo menu.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={limparQuadroGeral}
            className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 font-semibold rounded-full transition duration-300 border border-red-500/20 shadow-lg"
            title="Resetar quadro"
          >
            <RefreshCw size={18} /> Resetar Quadro
          </button>
          <button onClick={onVoltar} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-blue-500/40 transition">
            Voltar ao Menu
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={lidarComFimDoArraste}>
        <div className="flex gap-6 overflow-x-auto pb-6 items-start w-full max-w-[1600px] h-[calc(100vh-200px)] snap-x">
          {Object.entries(colunas).map(([idColuna, coluna]) => (
            <div key={idColuna} className="bg-white/5 backdrop-blur-md rounded-2xl w-[360px] min-w-[360px] flex flex-col max-h-full border border-white/10 shadow-2xl snap-center">
              <div className="p-5 bg-white/5 border-b border-white/10 rounded-t-2xl font-bold text-lg text-gray-200 flex justify-between items-center">
                <span>{coluna.nome}</span>
                <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                  {coluna.itens.length}
                </span>
              </div>
              
              <Droppable droppableId={idColuna}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-4 flex-1 overflow-y-auto transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-white/10' : ''}`}
                    style={{ minHeight: '200px' }}
                  >
                    {coluna.itens.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 p-5 rounded-xl shadow-lg border bg-gradient-to-br backdrop-blur-sm flex flex-col gap-2
                              ${item.cor} 
                              ${snapshot.isDragging ? 'opacity-90 shadow-2xl scale-105 ring-2 ring-white/50' : 'hover:-translate-y-1 hover:shadow-xl'} 
                              transition-all duration-200`}
                          >
                            <p className="font-bold text-lg tracking-wide">{item.conteudo}</p>
                            
                            <div className="flex items-center justify-between opacity-90 text-sm font-medium mt-1 border-b border-white/10 pb-2">
                              <span className="bg-black/20 px-2 py-1 rounded-md">{item.tipo}</span>
                              <span className="truncate max-w-[140px] opacity-80">{item.detalhe}</span>
                            </div>

                            {item.tipo === 'Aluno' && (
                              <div className="flex items-center justify-between mt-2">
                                {item.historico && item.historico.length > 0 ? (
                                  <span className="text-emerald-300 text-xs font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                                    <CheckCircle size={14} /> {item.historico.length} Registro(s)
                                  </span>
                                ) : (
                                  <span className="text-transparent">vazio</span>
                                )}
                                <button 
                                  onClick={() => abrirModalDiario(item)}
                                  className="flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition border border-white/10"
                                >
                                  <FileText size={14} /> Histórico Diário
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}