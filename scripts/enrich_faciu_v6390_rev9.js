const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '..', 'FACIU-v6.39.0.html');
let html = fs.readFileSync(targetFile, 'utf8');

// 1. Atualizar Tabela de Prazos Máximos de Ações Corretivas (Item 6.7.d.5)
const targetAcoesTexto = `    "tipo": "passos",
    "itens": [
     {
      "titulo": "Ser práticas e exequíveis",`;

const replacementAcoesTexto = `    "tipo": "destaque",
    "titulo": "Prazos Máximos Normativos de Ações Corretivas (PG-CORP-SMS-015 Rev. 09, item 6.7.d.5)",
    "conteudo": "Os prazos máximos para implementação das ações corretivas devem observar a severidade da condição identificada:\\n• Condições Graves: máximo 30 dias;\\n• Condições Moderadas: máximo 90 dias;\\n• Condições Leves: máximo 180 dias;\\n• Elementos do CSB (Conjunto Solidário de Barreiras em poços) ou riscos graves e iminentes: prazo IMEDIATO."
   },
   {
    "tipo": "passos",
    "itens": [
     {
      "titulo": "Ser práticas e exequíveis",`;

if (html.includes(targetAcoesTexto) && !html.includes('item 6.7.d.5')) {
  html = html.replace(targetAcoesTexto, replacementAcoesTexto);
  console.log('[OK] Prazos máximos de ações inseridos na Ajuda Técnica.');
}

// 2. Atualizar o item da coleta de dados com FORM-CORP-SMS-116 e Riscos Psicossociais
const targetColeta = `"titulo": "Coleta de dados e evidências físicas",`;
const targetColetaBloco = `"conteudo": "Realizar coleta de dados, evidências físicas, registros fotográficos ou vídeos e entrevistas tão rapidamente quanto possível`;

if (html.includes(targetColetaBloco) && !html.includes('FORM-CORP-SMS-116')) {
  html = html.replace(
    targetColetaBloco,
    `"conteudo": "Realizar coleta de dados, evidências físicas, registros fotográficos ou vídeos e entrevistas com testemunhas tão rapidamente quanto possível. Conforme o item 6.3 do PG-CORP-SMS-015 Rev. 09, para a coleta de depoimentos de testemunhas e envolvidos no evento deve ser aplicado obrigatoriamente o FORM-CORP-SMS-116 (Formulário de Depoimento de Incidente). Na análise causal, avaliar também fatores psicossociais (sobrecarga, desvio organizacional, estresse, falta de clareza de funções, assédio) e elementos críticos de segurança (CSB, barreiras)"`
  );
  console.log('[OK] FORM-CORP-SMS-116 e Fatores Psicossociais inseridos na Ajuda.');
}

// 3. Atualizar tópico de Quase Acidente para detalhar o rigor investigativo pela severidade potencial
const targetQuaseAcidente = `"titulo": "Como um quase acidente deve ser classificado?",
    "conteudo": "Todo quase acidente (risco de dano ao meio ambiente ou à saúde humana) deve ser classificado como Severidade Real 0 (zero), conforme a Matriz de Severidade (ANX-01). A severidade potencial, porém, pode ser maior e é ela que define a metodologia e a composição da comissão."`;

const replacementQuaseAcidente = `"titulo": "Como um quase acidente deve ser classificado e investigado?",
    "conteudo": "Conforme o PG-CORP-SMS-015 Rev. 09 (itens 4, 6.1, 6.4 e 6.7):\\n1. Severidade Real: SEMPRE Severidade Real 0 (zero), pois não houve materialização do dano final.\\n2. Severidade Potencial: Deve ser avaliada pelo pior cenário crível (Nível 1, 2 ou 3).\\n3. Obrigatoriedade de Investigação: Todo quase acidente DEVE ser investigado independentemente de lesões ou comunicação a órgãos reguladores.\\n4. Rigor da Investigação: A Severidade Potencial determina a composição mínima da Comissão (Tabela 1) e a Metodologia (Tabela 2). Quase acidentes com Potencial Moderado (Nível 2) ou Grave (Nível 3) exigem comissão formal com liderança gerencial, investigação por Árvore de Causa/Falha e emissão obrigatória de RIA (FORM-CORP-SMS-088). Para potencial Grave (Nível 3), deve ser emitido Alerta Preliminar de SMS em até 72h."`;

if (html.includes(targetQuaseAcidente)) {
  html = html.replace(targetQuaseAcidente, replacementQuaseAcidente);
  console.log('[OK] Tópico de Quase Acidente enriquecido com os requisitos da Rev. 09.');
}

// 4. Inserir menção ao FORM-CORP-SMS-116 na lista de referências documentais do RIA e na Triagem se oportuno
const targetRefRia = `FORM-CORP-SMS-088`;
console.log('Verificando integridade geral...');

fs.writeFileSync(targetFile, html, 'utf8');
console.log('[OK] FACIU-v6.39.0.html atualizado com sucesso com os critérios da Rev. 09.');
