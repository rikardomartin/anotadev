# GitHub Webhook — Edge Function

## Deploy

```bash
# 1. Instale o Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao seu projeto (pegue o project-ref no dashboard do Supabase)
supabase link --project-ref SEU_PROJECT_REF

# 4. Deploy da função
supabase functions deploy github-webhook --no-verify-jwt
```

## URL final

```
https://SEU_PROJECT_REF.supabase.co/functions/v1/github-webhook
```

## Configurar no GitHub

1. Vá no repositório → Settings → Webhooks → Add webhook
2. Payload URL: `https://SEU_PROJECT_REF.supabase.co/functions/v1/github-webhook`
3. Content type: `application/json`
4. Secret: cole o mesmo valor que você colocou no campo "Webhook Secret" do projeto no AnotaDev
5. Events: selecione **Just the push event**
6. Active: ✅

## Variáveis de ambiente (já injetadas automaticamente pelo Supabase)

- `SUPABASE_URL` — URL do projeto
- `SUPABASE_SERVICE_ROLE_KEY` — chave de serviço (acesso total ao banco)
