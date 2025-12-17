# Formato de Compêndio por Categoria

Cada arquivo segue envelope padrão e armazena `entradas` específicas da categoria.

Envelope JSON:
{
"categoria": "<nome-da-categoria>",
"versao": "1.0",
"atualizadoEm": "2025-12-12T00:00:00Z",
"total": <numero>,
"entradas": [ ... ]
}

Categorias atuais e campos:

- ameacas: { nome, tipo, tamanho, nd, descricao, traits{ iniciativa, percepcao, defesa, saves{fort,ref,will}, pv, deslocamento, pm }, atributos{ for, des, con, int, sab, car }, ataques[], habilidades[], fonte }
- deuses_maiores|deuses_menores|deuses_servidores: { nome, descricao, alinhamento, dominios[], simbolos[], dogmas, poderes_devoção[], fonte }
- dominios: { nome, descricao, aspectos[], efeitos, magias_relacionadas[], fonte }
- races|classes: mantêm formato já adotado no projeto.

ID: slug de `nome` em minúsculo com `_`. Persistência pelo `CompendiumManager`.
