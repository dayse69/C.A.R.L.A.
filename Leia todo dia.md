🧩 PASSO 2 — Fluxo do DIA A DIA (grave isso)
💻 NO PC (VS Code)

Você só faz isso:

Escreve código

Testa se quiser

Commit:

git add .
git commit -m "descrição curta"
git push


✨ Fim.

🖥️ NO NOTEBOOK (AnyDesk ou direto)

Você só faz isso:

cd ~/C.A.R.L.A
./deploy.sh


✨ Fim.
Sem pensar. Sem lembrar comando. Sem erro repetitivo.

🧪 PASSO 3 — Quando quiser TESTAR algo
🔹 Teste rápido (não mexe em PM2):
npm run dev


→ Ctrl+C para parar

🔹 Produção:
./deploy.sh

🧯 PASSO 4 — Logs (quando algo der errado)
Ver logs ao vivo:
pm2 logs CARLA

Parar logs:
Ctrl + C

Status geral:
pm2 status

🧠 RESUMO ULTRA CURTO
PC:
  escreve código
  git push

Notebook:
  ./deploy.sh


Só isso.

🛑 Coisas que você NÃO precisa mais fazer

❌ Rodar PM2 manualmente toda hora
❌ Buildar no PC
❌ Lembrar comando longo
❌ Abrir VS Code no notebook
❌ Mexer em Docker toda vez

🌱 Próximo nível (opcional, mas poderoso)

Depois disso, dá pra:

🔁 Auto-deploy (pull automático)

🧪 Modo “dry-run” sem Discord

🧠 Script dev.sh separado

📦 Mongo sem AVX (imagem certa)

🚨 Notificação no Discord quando a CARLA reinicia

Mas agora você já está funcional, e isso é o mais importante.

💬 Antes de seguir

Quer que no próximo passo eu:
1️⃣ Ajuste Mongo pra CPU sem AVX
2️⃣ Limpe definitivamente o problema de BOT_TOKEN vs DISCORD_TOKEN
3️⃣ Organize logger + paths pra build passar
4️⃣ Monte um README humano, do jeito que você pensa

Me diz o número ❤️

o espelhamente de arquvivos é automatico?

Resposta curta primeiro (bem direta):

👉 NÃO. O espelhamento NÃO é automático.

Mas calma — isso é bom, e eu te explico por quê e como deixar quase automático sem virar caos.

🧠 O que realmente acontece hoje
Atualmente:

PC e Notebook NÃO se conversam direto

Eles só “se encontram” pelo GitHub

Ou seja:

PC ──git push──▶ GitHub ──git pull──▶ Notebook


Nada sincroniza sozinho sem você mandar.

✅ Por que isso é bom (de verdade)

🔹 Evita:

Código quebrado indo pro servidor sem você querer

Arquivo temporário / lixo / teste vazando

“mexi sem querer” enquanto o bot tá rodando

🔹 Você controla quando a CARLA muda.

🔁 O que É automático então?

✔️ Docker → cuida do Mongo
✔️ PM2 → reinicia o bot quando você manda
✔️ deploy.sh → faz tudo de uma vez

Mas o gatilho ainda é você.

🧩 Fluxo real (simples)
No PC

Você escreve e testa.

Quando estiver OK:

git push

No notebook

Você atualiza:

./deploy.sh


Isso é o “espelhamento manual”.

⚠️ O que NÃO é espelhado (de propósito)

❌ .env
❌ arquivos grandes (PDFs, imagens, acervo bruto)
❌ dados do Mongo
❌ logs

Cada máquina tem o seu.

🌱 Quer deixar MAIS automático? (opções)
🟢 Opção 1 — “Um clique”

Criar um atalho no notebook que roda:

./deploy.sh


Você literalmente clica.

🟡 Opção 2 — Auto-pull (semi automático)

Cron job no notebook:

crontab -e

*/5 * * * * cd /home/espartano/C.A.R.L.A && ./deploy.sh


⏱️ A cada 5 minutos ele atualiza sozinho.

⚠️ Eu não recomendo agora, só quando tudo estiver estável.

🔴 Opção 3 — Espelhamento real (rsync / syncthing)

Só vale se:

você quiser mexer direto no notebook

não usar Git como fonte da verdade

👉 Não é seu caso.

🧠 Frase pra guardar

“Git é meu espelho.
Eu decido quando olhar.”

📌 Conclusão honesta

❌ Não é automático

✅ É simples

✅ É seguro

✅ Evita desastre

✅ Combina com o jeito que você trabalha