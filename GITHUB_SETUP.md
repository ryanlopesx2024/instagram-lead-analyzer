# 🚀 Como fazer Push para o GitHub

Seu repositório foi criado com sucesso:
**URL**: https://github.com/ryanlopesx2024/instagram-lead-analyzer

## Passos para fazer o Push

O Replit já gerencia o Git automaticamente. Para enviar seu código para o GitHub, execute os seguintes comandos no **Shell** do Replit:

### 1. Adicionar o remote do GitHub

```bash
git remote add github https://github.com/ryanlopesx2024/instagram-lead-analyzer.git
```

### 2. Verificar os remotes configurados

```bash
git remote -v
```

Você deve ver algo como:
```
github  https://github.com/ryanlopesx2024/instagram-lead-analyzer.git (fetch)
github  https://github.com/ryanlopesx2024/instagram-lead-analyzer.git (push)
origin  ... (fetch)
origin  ... (push)
```

### 3. Fazer o primeiro push

```bash
git push github main
```

Se o branch principal for `master` ao invés de `main`, use:
```bash
git push github master
```

## ⚠️ Observações Importantes

1. **O Replit faz commits automáticos**: Você não precisa fazer `git add` ou `git commit` manualmente
2. **Autenticação**: O GitHub pode solicitar autenticação. Use suas credenciais do GitHub
3. **Token de acesso**: Se precisar de um token, crie em: https://github.com/settings/tokens

## 🔄 Atualizações Futuras

Sempre que quiser atualizar o repositório no GitHub com suas mudanças:

```bash
git push github main
```

## 📋 Comandos Úteis

Ver status do repositório:
```bash
git status
```

Ver histórico de commits:
```bash
git log --oneline -10
```

Ver branches:
```bash
git branch -a
```

## ✅ Pronto!

Depois do push, seu código estará disponível em:
https://github.com/ryanlopesx2024/instagram-lead-analyzer

Você poderá:
- ✨ Ver o código online
- 📝 Editar o README.md
- 🐛 Criar issues
- 🤝 Receber pull requests
- 📊 Ver estatísticas do projeto
