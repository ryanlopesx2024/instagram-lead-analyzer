# Instagram Lead Analyzer 🎯

Analisador de perfis do Instagram com IA que gera relatórios completos de qualificação de leads usando Google Gemini.

## 📋 Sobre o Projeto

Instagram Lead Analyzer é uma aplicação web SaaS que analisa perfis públicos do Instagram e gera relatórios detalhados de qualificação comercial. Utilizando IA (Google Gemini), a ferramenta extrai insights estratégicos sobre:

- **Compatibilidade com seu negócio** - Score de adequação ao seu público-alvo
- **Autoridade e Credibilidade** - Análise de presença digital e engajamento
- **Afinidade Temática** - Alinhamento de conteúdo com sua oferta
- **Lead Qualification Score (LQS)** - Métrica proprietária de prontidão
- **Prontidão para Conversão** - Probabilidade de interesse comercial
- **Análise em Lote** - Processe múltiplos perfis de uma vez

## ✨ Funcionalidades

### Análise Individual
- Entrada de username do Instagram
- Briefing personalizado obrigatório
- Extração de dados do perfil (bio, seguidores, posts)
- OCR em imagens de posts usando Gemini Vision
- Relatório estruturado em 8 seções:
  1. Resumo Executivo
  2. Lead Scoring (Score consolidado)
  3. Perfil e Persona
  4. Análise de Conteúdo
  5. Engajamento e Alcance
  6. Oportunidades Comerciais
  7. Riscos e Considerações
  8. Próximos Passos

### Análise em Lote
- Upload de arquivos (.txt, .csv) com lista de usernames
- Entrada manual com múltiplos formatos (quebra de linha, vírgula, ponto-vírgula)
- Processamento sequencial com rate-limiting
- Estatísticas em tempo real (Total/Sucesso/Falhas)
- Exportação de resultados (CSV, JSON)

### Features Técnicas
- **Cache inteligente** - Evita requisições duplicadas em 24h
- **Fallback automático** - Dados demo quando Instagram rate-limit
- **Retry logic** - Tratamento de erros da API Gemini
- **Dark mode** - Interface adaptável
- **Histórico** - Armazena análises anteriores

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** - Build tool moderna
- **TailwindCSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis (Radix UI)
- **TanStack Query** - Estado do servidor
- **Wouter** - Roteamento leve
- **React Hook Form** - Gerenciamento de formulários

### Backend
- **Node.js** com Express
- **TypeScript** - Tipagem end-to-end
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** - Type-safe database
- **Google Gemini AI** - Análise e OCR

### Infraestrutura
- **Replit** - Deploy e hospedagem
- **Session management** - Express session + PostgreSQL
- **Environment secrets** - Gestão segura de API keys

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou usar Neon)
- Chave API do Google Gemini

### Setup Local

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USERNAME/instagram-lead-analyzer.git
cd instagram-lead-analyzer
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```env
GEMINI_API_KEY=sua_chave_gemini
DATABASE_URL=postgresql://...
SESSION_SECRET=seu_secret_aleatorio
```

4. Execute as migrações do banco:
```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 🎯 Como Usar

### Análise Individual

1. Acesse a página inicial
2. Digite o username do Instagram (sem @)
3. Preencha o briefing com detalhes do seu negócio (mínimo 10 caracteres)
4. Clique em "Analisar Perfil"
5. Aguarde o processamento (15-30 segundos)
6. Visualize o relatório completo com todas as seções

### Análise em Lote

1. Clique em "Análise em Lote" no menu superior
2. Escolha uma opção:
   - **Upload de arquivo**: Envie .txt ou .csv com usernames
   - **Entrada manual**: Digite ou cole usernames (aceita vírgula, quebra de linha, ponto-vírgula)
3. Preencha o briefing
4. Clique em "Analisar X Perfis"
5. Acompanhe o progresso em tempo real
6. Exporte os resultados em CSV ou JSON

## 📊 Estrutura do Projeto

```
instagram-lead-analyzer/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── lib/         # Utilitários
│   │   └── App.tsx      # Componente raiz
├── server/              # Backend Express
│   ├── routes.ts        # Endpoints da API
│   ├── gemini.ts        # Integração Gemini
│   ├── instagram.ts     # Scraping Instagram
│   └── storage.ts       # Camada de dados
├── shared/              # Código compartilhado
│   └── schema.ts        # Schemas Drizzle + Zod
└── scripts/             # Utilitários
```

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Chave da API Google Gemini | Sim |
| `DATABASE_URL` | Connection string PostgreSQL | Sim |
| `SESSION_SECRET` | Secret para sessions | Sim |
| `NODE_ENV` | Ambiente (development/production) | Não |

## 🧪 Testes

Execute os testes end-to-end:
```bash
npm test
```

## 📝 API Endpoints

### `POST /api/analyze-profile`
Analisa um perfil individual.

**Request:**
```json
{
  "username": "instagram",
  "briefing": "Vendo cursos de marketing digital"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "analysis": { ... }
  }
}
```

### `POST /api/analyze-batch`
Analisa múltiplos perfis.

**Request:**
```json
{
  "usernames": ["instagram", "natgeo", "nasa"],
  "briefing": "Vendo cursos de fotografia"
}
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "completed": 3,
  "failed": 0,
  "results": [...]
}
```

### `GET /api/history`
Retorna histórico de análises.

## 🎨 Design System

- **Cores primárias**: Roxo Instagram (#8B5CF6)
- **Tipografia**: Inter (UI), JetBrains Mono (código)
- **Componentes**: shadcn/ui (new-york variant)
- **Dark mode**: Suportado nativamente

## 🚧 Roadmap

- [ ] Autenticação de usuários
- [ ] Análise de Stories
- [ ] Exportação PDF dos relatórios
- [ ] Dashboard com métricas agregadas
- [ ] Integração com CRM
- [ ] API pública com rate limiting

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Google Gemini AI pela API de análise
- shadcn/ui pelos componentes fantásticos
- Comunidade React e TypeScript

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

Desenvolvido com ❤️ usando Replit
