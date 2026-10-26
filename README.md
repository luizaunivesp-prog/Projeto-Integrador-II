# Projeto-Integrador-II

🔧 Análise de Garantias de Pneus

Projeto de análise de dados com foco em solicitações de garantia de pneus, desenvolvido como portfólio para demonstrar habilidades em Python, pandas e visualização de dados.

📋 Sobre o projeto

Este projeto simula um cenário real da indústria de pneus, onde solicitações de garantia são registradas com informações como marca, modelo, condição de defeito, quilometragem e resultado da análise.

O dataset foi gerado com problemas propositais de qualidade de dados — datas inconsistentes, valores nulos, duplicatas e erros lógicos — para demonstrar o processo completo de limpeza e tratamento antes da análise.


🎯 Habilidades demonstradas

Extração e carregamento de dados a partir de CSV com pandas
Limpeza de dados: remoção de duplicatas, padronização de categorias, conversão de tipos, tratamento de nulos e correção de inconsistências lógicas
Seleção e filtros: recortes por condição, agrupamentos e criação de novas colunas
Análise exploratória: taxa de aprovação por marca, evolução temporal, distribuição de defeitos e relação entre sulco e resultado
Visualização: gráficos estáticos com matplotlib/seaborn e dashboard interativo com Plotly

📊 Principais insights

Continental possui a maior taxa de aprovação (~53%), enquanto Michelin tem a menor (~38%) — apesar de ser a marca com mais solicitações
Falha de fabricação apresenta 79% de aprovação, enquanto Corte por objeto tem 77% de reprovação, refletindo os critérios reais de garantia
Pneus aprovados têm profundidade média de sulco de 5,12mm vs 4,29mm dos reprovados, sugerindo que defeitos de fabricação tendem a aparecer antes do desgaste avançar
O volume de solicitações apresenta leve queda entre 2022 e 2024

🗂️ Estrutura do projeto

projeto_pneus/
│
├── garantias_pneus.csv       # Dataset com 800 registros fictícios
├── analise_pneus.ipynb       # Notebook principal com toda a análise
└── README.md

🚀 Como executar

Clone o repositório:
bash
git clone https://github.com/seu-usuario/analise-garantias-pneus.git
Abra o notebook no Google Colab ou Jupyter:
bash
jupyter notebook analise_pneus.ipynb
Execute as células em ordem — todas as dependências são bibliotecas padrão do ambiente (pandas, numpy, matplotlib, seaborn, plotly).

🛠️ Tecnologias utilizadas

Ferramenta	Uso
Python 3	Linguagem principal
pandas	Manipulação e limpeza de dados
numpy	Suporte a cálculos e valores nulos
matplotlib / seaborn	Visualizações estáticas
Plotly	Dashboard interativo
Google Colab	Ambiente de desenvolvimento

👤 Autor

Desenvolvido como projeto integrador univesp.
