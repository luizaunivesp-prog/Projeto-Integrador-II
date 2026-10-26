// Arquivo: frontend/src/components/CrudGenerico.jsx
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function CrudGenerico({ titulo, endpoint, campos, onVoltar }) {
  // Estados da nossa tela
  const [itens, setItens] = useState([]); 
  const [formData, setFormData] = useState({}); 
  const [mensagem, setMensagem] = useState(''); 

  // Executa toda vez que a tela abre ou o endpoint muda
  useEffect(() => {
    buscarDados();
  }, [endpoint]);

  // Função para buscar os dados (GET) - Porta 5005 OK!
  const buscarDados = async () => {
    try {
      const resposta = await fetch(`${API_URL}/api/${endpoint}`);
      const dados = await resposta.json();
      setItens(dados);
    } catch (erro) {
      console.error("Erro ao buscar dados:", erro);
    }
  };

  // Atualiza o formData quando o usuário digita
  const lidarComMudanca = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Salvar um novo registro (POST)
  const salvarRegistro = async (e) => {
    e.preventDefault(); 
    
    try {
      const resposta = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (resposta.ok) {
        setMensagem(`${titulo} cadastrado com sucesso!`);
        setFormData({}); 
        buscarDados(); 
        
        setTimeout(() => setMensagem(''), 3000);
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    }
  };

  // Deletar um registro (DELETE)
  const deletarRegistro = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este registro?")) {
      try {
        await fetch(`${API_URL}/api/${endpoint}/${id}`, {
          method: 'DELETE'
        });
        buscarDados(); 
      } catch (erro) {
        console.error("Erro ao deletar:", erro);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white p-8 w-full flex flex-col items-center">
      
      {/* Cabeçalho da Tela */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Gestão de {titulo}
          </h2>
          <p className="text-gray-400 mt-1">Adicione ou remova registros do sistema.</p>
        </div>
        <button 
          onClick={onVoltar}
          className="px-6 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-blue-500/40 transition-all duration-300 border border-white/20 shadow-lg"
        >
          ⬅ Voltar ao Menu
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {mensagem && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-emerald-500/20 text-emerald-300 rounded-xl font-medium border border-emerald-500/50 backdrop-blur-sm animate-pulse">
          {mensagem}
        </div>
      )}

      {/* Formulário de Cadastro */}
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl mb-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-100 border-b border-white/10 pb-4">Novo Cadastro</h3>
        
        <form onSubmit={salvarRegistro}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {campos.map((campo) => (
              <div key={campo.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">{campo.label}</label>
                <input
                  type={campo.type || "text"}
                  name={campo.name}
                  value={formData[campo.name] || ''}
                  onChange={lidarComMudanca}
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-gray-600"
                  placeholder={`Digite ${campo.label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3 bg-blue-500/80 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Registros */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {/* Mostra no máximo 4 colunas para não espremer a tabela no vídeo */}
                {campos.slice(0, 4).map((campo) => (
                  <th key={campo.name} className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {campo.label}
                  </th>
                ))}
                <th className="p-5 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={campos.slice(0, 4).length + 1} className="p-8 text-center text-gray-400 italic">
                    Nenhum registro encontrado. Comece preenchendo o formulário acima!
                  </td>
                </tr>
              ) : (
                itens.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    {campos.slice(0, 4).map((campo) => (
                      <td key={campo.name} className="p-5 text-gray-200">
                        {item[campo.name]}
                      </td>
                    ))}
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => deletarRegistro(item.id)}
                        className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-all text-sm font-medium shadow-lg hover:shadow-red-500/50"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}