const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const assert = require('assert');

console.log('=== Gerador e Validador de Exemplos de Investigação FACIU ===');

const htmlPath = path.resolve(__dirname, '../FACIU-v6.25.0.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

// ==========================================
// 1. Definição do Exemplo 1: Árvore de Causa + 5 Porquês Auxiliar
// ==========================================
const exemplo1_arvore = {
  versao: "6.25.0",
  mainMethodology: "tree",
  whysPrimary: null,
  whysAuxiliary: [
    {
      id: "why_aux_tc201_flange",
      code: "5P-01",
      title: "5 Porquês: Falha de Vedação no Flange do Filtro Duplex",
      problem: "Sobretorque e Montagem Inadequada da Junta de Vedação",
      mode: "linked",
      link: {
        mode: "tree",
        nodeId: "hip",
        nodeLabel: "Sobretorque e Montagem Inadequada",
        nodeKind: "hipotese",
        investigationCii: "CII-2026-OP-042",
        investigationTitle: "Vazamento de Óleo Lubrificante durante Partida do Turbocompressor TC-201"
      },
      status: "completed",
      createdAt: "2026-09-14T09:00:00.000Z",
      updatedAt: "2026-09-15T16:30:00.000Z",
      steps: [
        {
          id: "ws_tc201_1",
          order: 1,
          question: "Por que ocorreu o vazamento de óleo lubrificante no skid do TC-201?",
          answer: "Porque a junta de vedação no flange do filtro duplex rompeu parcialmente durante a pressurização da linha.",
          rationale: "Inspeção visual e desmontagem evidenciaram extrusão e corte do elastômero na face superior do flange.",
          notes: "Pressão de trabalho normal: 12 bar.",
          result: "continue"
        },
        {
          id: "ws_tc201_2",
          order: 2,
          question: "Por que a junta de vedação rompeu com a pressurização do sistema?",
          answer: "Porque a junta sofreu esmagamento localizado e perda de resiliência mecânica antes da entrada em operação.",
          rationale: "A análise metalográfica e dimensional da junta revelou espessura reduzida em 40% na região inferior do perímetro.",
          notes: "Aperto assimétrico evidente.",
          result: "continue"
        },
        {
          id: "ws_tc201_3",
          order: 3,
          question: "Por que a junta sofreu esmagamento localizado e aperto assimétrico?",
          answer: "Porque os prisioneiros do flange foram apertados manualmente sem aplicação da sequência de aperto cruzado e sem limite de torque.",
          rationale: "Depoimento da equipe de manutenção confirmou aperto manual com chave combinada e alavanca improvisada.",
          notes: "Procedimento previa torquímetro com 85 Nm.",
          result: "continue"
        },
        {
          id: "ws_tc201_4",
          order: 4,
          question: "Por que não foi utilizado o torquímetro com a sequência de torque cruzado?",
          answer: "Porque a ferramenta calibrada não estava disponível no módulo no momento do fechamento da linha e a equipe priorizou o cumprimento do cronograma de partida.",
          rationale: "O torquímetro da oficina mecânica estava retido em calibração externa e não havia reserva embarcada.",
          notes: "Pressão de tempo para liberação da planta.",
          result: "continue"
        },
        {
          id: "ws_tc201_5",
          order: 5,
          question: "Por que o serviço de fechamento de linha pressurizada foi liberado sem torquímetro e sem garantia da qualidade de torque?",
          answer: "Porque o procedimento de manutenção POP-MEC-018 e a liberação de Permissão de Trabalho (PT) não exigiam formalmente o preenchimento de ficha de controle de torqueamento como barreira mandante pré-partida.",
          rationale: "Verificação da PT-2026-4412 comprovou encerramento com campo de torque em branco sem bloqueio sistêmico.",
          notes: "Lacuna no sistema de garantia da qualidade da integridade mecânica.",
          result: "cause-candidate"
        }
      ],
      causes: [
        {
          id: "5pc_tc201_root",
          order: 1,
          type: "root",
          title: "Deficiência no Controle da Qualidade de Juntas Flangeadas Críticas",
          description: "Ausência de barreira mandante de controle de qualidade e registro de torque cruzado rastreável na liberação de sistemas sob pressão.",
          status: "confirmed",
          sgsoCorrelation: "SGSO 10 - Integridade Mecânica",
          corporateStandard: "PAD-CORP-MAN-004",
          rationale: "Fator determinante para o sobretorque e falha da contenção mecânica.",
          actions: ["a1"]
        }
      ],
      actions: [
        {
          id: "a1",
          causeId: "5pc_tc201_root",
          title: "Revisar POP-MEC-018 e Instituir Ficha de Torque",
          responsible: "Carlos Eduardo Mendes",
          dueDate: "2026-10-30",
          status: "Em andamento",
          actionType: "Preventiva",
          details: "Revisar procedimento operacional de manutenção com tabela de torque cruzado e assinatura técnica formal para linhas pressurizadas",
          effectivenessCriterion: "100% dos flanges de filtros e carcaças com fichas de torque arquivadas nos próximos 3 meses",
          verificationResponsible: "Mariana Albuquerque",
          verificationDate: "2026-11-15",
          effectivenessResult: "Pendente"
        }
      ],
      references: [],
      identity: {
        code: "5P-01",
        title: "5 Porquês: Falha de Vedação no Flange do Filtro Duplex",
        owner: "Carlos Eduardo Mendes",
        participants: ["Rodrigo Silveira", "Fernando Silva"],
        createdAt: "2026-09-14T09:00:00.000Z",
        updatedAt: "2026-09-15T16:30:00.000Z",
        status: "completed"
      },
      context: {
        problem: "Sobretorque e Montagem Inadequada da Junta de Vedação",
        impact: "Vazamento de 180 litros de óleo lubrificante e parada de 6h no trem de compressão",
        expectedCondition: "Flange apertado com torquímetro calibrado a 85 Nm com junta nova e torque cruzado em 3 etapas",
        observedCondition: "Aperto assimétrico com alavanca manual gerando esmagamento localizado de 40% da junta",
        scope: "Sistema de Lubrificação e Selagem do Turbocompressor TC-201",
        area: "Compressão de Gás",
        location: "Módulo M-04 - FPSO Brava Spirit"
      },
      conclusionData: {
        summary: "A falha de vedação resultou do esmagamento da junta por aperto assimétrico e sem controle de torque, decorrente da falta de ferramenta calibrada no local e ausência de barreira formal de garantia de qualidade na PT.",
        limitations: "Não foram observadas anomalias dimensionais ou de rugosidade nas faces dos flanges da carcaça."
      },
      audit: [],
      schemaVersion: "2.0"
    }
  ],
  triagem: {
    cii: "CII-2026-OP-042",
    titulo: "Vazamento de Óleo Lubrificante durante Partida do Turbocompressor TC-201",
    ocorr: "2026-09-14T08:30",
    reg: "2026-09-14T09:00",
    site: "FPSO Brava Spirit (Campo de Papa-Terra)",
    local: "Módulo M-04 - Skid de Compressão",
    atividade: "Comissionamento e Partida Operacional de Turbocompressor após Manutenção Semestral",
    pt: "PT-2026-4412",
    regpor: "Rafael Rocha (Engenheiro de Segurança de Processo)",
    contratada: "Mecânica Naval Offshore Ltda",
    descricao: "Durante a partida programada do TC-201 após manutenção preventiva, ocorreu vazamento de aproximadamente 180 litros de óleo lubrificante mineral no flange do filtro duplex. O fluido ficou contido na bacia do skid e a unidade foi paralisada com acionamento manual de ESD.",
    tipo: "real",
    dim: "cat11",
    tipoc: "m07-r12",
    criterio: "m07-r12-s2",
    sev: 2,
    nivel: 2,
    metodos: ["tree", "whys"]
  },
  classificacaoV2: {
    matrixRevision: "07",
    assessments: [
      {
        categoryId: "cat11",
        categoryLabel: "Dano potencial ao meio ambiente",
        occurrenceId: "m07-r12",
        occurrenceLabel: "Descarga - Liberação não planejada ou não controlada de sua contenção primária",
        criteriaId: "m07-r12-s2",
        criteriaText: "• Descarga significante - Descarga de volume entre 0,16 m3 e 8 m3 cujo fluido tenha atingido o meio ambiente ou área industrial.",
        severity: 2,
        matrixRevision: "07"
      }
    ],
    calculatedSeverity: 2,
    reviewedSeverity: null,
    finalSeverity: 2,
    overrideReason: "",
    legacy: false
  },
  commissionExceptions: {},
  externalReferences: [
    { id: "ref_pt_4412", externalSystem: "SGM", title: "Permissão de Trabalho PT-2026-4412", reference: "Pasta de Serviços M-04", status: "available", linkedNodeIds: ["hip", "fs1"] },
    { id: "ref_pop_mec", externalSystem: "GED Corporativo", title: "POP-MEC-018 Procedimento de Manutenção de Turbocompressores", reference: "Rev. 04", status: "available", linkedNodeIds: ["cr1", "a1"] }
  ],
  chronology: [
    { id: "chr_1", dateTime: "2026-09-14T07:00", phase: "before", description: "Liberação formal da PT-2026-4412 para recomissionamento do turbocompressor TC-201.", externalSource: "SGM", externalReference: "PT-2026-4412", linkedNodeId: "evt", endOfResponse: false, contextual: false, notes: "Operador de Painel autorizou serviço." },
    { id: "chr_2", dateTime: "2026-09-14T07:45", phase: "before", description: "Início do giro lento e acionamento da bomba auxiliar de óleo de lubrificação.", externalSource: "SDCD", externalReference: "TAG TC-201", linkedNodeId: "imed", endOfResponse: false, contextual: false, notes: "Técnico de Operação iniciou rampa." },
    { id: "chr_3", dateTime: "2026-09-14T08:15", phase: "during", description: "Alarme sonoro e visual de baixa pressão diferencial de óleo no filtro duplex (PAL-201-14).", externalSource: "SDCD", externalReference: "Alarme PAL-201-14", linkedNodeId: "imed", endOfResponse: false, contextual: false, notes: "Pressão caiu para 9 bar." },
    { id: "chr_4", dateTime: "2026-09-14T08:30", phase: "during", description: "Identificação visual de vazamento em jato contínuo de óleo pelo flange inferior do filtro.", externalSource: "Inspeção em Campo", externalReference: "Relato Operacional", linkedNodeId: "hip", endOfResponse: false, contextual: false, notes: "Vazamento localizado no flange da carcaça." },
    { id: "chr_5", dateTime: "2026-09-14T08:35", phase: "during", description: "Acionamento do botão de parada de emergência (ESD Nível 3) e bloqueio das válvulas de sucção de óleo.", externalSource: "SDCD", externalReference: "Registro de ESD", linkedNodeId: "evt", endOfResponse: false, contextual: false, notes: "Compressor desarmado com segurança." },
    { id: "chr_6", dateTime: "2026-09-14T08:50", phase: "after", description: "Conclusão da contenção com barreiras absorventes e encerramento do atendimento emergencial.", externalSource: "Relatório de Emergência", externalReference: "BO-2026-088", linkedNodeId: "evt", endOfResponse: true, contextual: false, notes: "Fim do atendimento da ocorrência." }
  ],
  conclusion: {
    summary: "A perda de contenção de óleo foi provocada pelo esmagamento assimétrico da junta de vedação do filtro duplex decorrente de aperto manual sem torquímetro, viabilizado pela falta de lista de checagem formal na liberação de PT.",
    contributors: "Pressão de tempo no cronograma de partida, indisponibilidade imediata de torquímetro calibrado no módulo.",
    roots: "Ausência de barreira de garantia da qualidade da integridade mecânica para controle de torqueamento em linhas de fluidos industriais.",
    actions: "Revisão do POP-MEC-018 com exigência de ficha de torque rastreável e dotação de torquímetros dedicados.",
    limitations: "Incidente sem lesões a colaboradores e com 100% do óleo retido no skid metálico de drenagem.",
    references: "PT-2026-4412, POP-MEC-018, Folha de Dados do TC-201.",
    generated: false
  },
  equipe: [
    {
      nome: "Carlos Eduardo Mendes",
      func: "Coordenador da Comissão",
      area: "Engenharia de Confiabilidade",
      qual: "Atende",
      commissionCoordinator: true,
      investigationManager: false,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    },
    {
      nome: "Mariana Albuquerque",
      func: "Gestor da investigação",
      area: "Operações Offshore",
      qual: "Atende",
      commissionCoordinator: false,
      investigationManager: true,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    },
    {
      nome: "Rodrigo Silveira",
      func: "Especialista de Turbomáquinas",
      area: "Manutenção Mecânica",
      qual: "Atende",
      commissionCoordinator: false,
      investigationManager: false,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    },
    {
      nome: "Fernando Silva",
      func: "Técnico de Operação / CIPLAT",
      area: "Operações",
      qual: "Atende",
      commissionCoordinator: false,
      investigationManager: false,
      technicalKnowledge: false,
      rcaQualified: false,
      cipaRepresentative: true,
      areaRepresentative: true,
      contractorRepresentative: false
    }
  ],
  tree: {
    nodes: [
      { id: "evt", kind: "evt", label: "Vazamento de Óleo no Skid do TC-201", desc: "Vazamento de ~180 litros de óleo lubrificante mineral durante partida do compressor", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Fato consumado verificado pela equipe", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "imed", kind: "imediata", label: "Ruptura da Junta de Vedação do Filtro", desc: "Perda da estanqueidade no flange da carcaça do filtro duplex de selagem", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Junta extrudada e partida na abertura do flange", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "hip", kind: "hipotese", label: "Sobretorque e Montagem Inadequada", desc: "Aperto excessivo e assimétrico causou esmagamento mecânico da junta", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Confirmado pela análise pericial e aprofundamento via 5 Porquês", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: ["ref_pt_4412"] },
      { id: "fal", kind: "falha", label: "Incompatibilidade de Material da Junta", desc: "Degradação química precoce do elastômero em contato com o óleo", gate: null, root: false, estado: "Descartada", origem: "", justificativa: "Certificado do fornecedor confirmou material Viton padrão", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "fat", kind: "fatores", label: "Fatores Humanos no Torqueamento", desc: "Execução do serviço sem aplicação do procedimento padrão de aperto", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Entrevistas comprovaram prática de aperto sem controle de força", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "fs1", kind: "fator_sub", label: "ORGANIZACIONAL", desc: "Ausência de checklist de torqueamento mandante no encerramento da PT", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Verificado no formulário da PT-2026-4412", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "fs2", kind: "fator_sub", label: "TECNOLÓGICO", desc: "Indisponibilidade de torquímetro calibrado no módulo no momento do aperto", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Equipamento retido para calibração sem sobressalente a bordo", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "cc1", kind: "contrib", label: "Aperto sem Ferramenta Calibrada", desc: "Uso de chave combinada manual e alavanca improvisada nos prisioneiros", gate: null, root: false, estado: "Confirmada", origem: "", justificativa: "Causa contribuinte direta para a deformação da junta", classificacao: "", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: [] },
      { id: "cr1", kind: "raiz", label: "Falta de Garantia de Qualidade de Juntas Críticas", desc: "Inexistência de barreira de controle de integridade mecânica com ficha de torqueamento rastreável", gate: null, root: true, estado: "Confirmada", origem: "", justificativa: "Causa-raiz fundamental do incidente", classificacao: "1.2.3 Falha de Procedimento / Controle de Qualidade", sgsoCorrelation: "SGSO 10 - Integridade Mecânica", corporateStandard: "PAD-CORP-MAN-004", responsavel: "", prazo: "", status: "", causaRaizId: "", linkedRefIds: ["ref_pop_mec"] },
      { id: "a1", kind: "acao", label: "Revisar POP-MEC-018 e Instituir Ficha de Torque", desc: "Revisar procedimento operacional de manutenção com tabela de torque cruzado e assinatura técnica formal para linhas pressurizadas", gate: null, root: false, estado: "", origem: "", justificativa: "", classificacao: "", responsavel: "Carlos Eduardo Mendes", prazo: "2026-10-30", status: "Em andamento", causaRaizId: "cr1", causaRaizIds: ["cr1"], studyId: "why_aux_tc201_flange", actionType: "Preventiva", effectivenessCriterion: "100% dos flanges de filtros e carcaças com fichas de torque arquivadas nos próximos 3 meses", verificationDate: "2026-11-15", verificationResponsible: "Mariana Albuquerque", implementationReference: "OS-2026-77890", effectivenessResult: "Pendente", effectivenessNotes: "" },
      { id: "a2", kind: "acao", label: "Prover Torquímetros Dedicados com Calibração", desc: "Adquirir e manter na oficina do módulo M-04 conjunto de torquímetros digitais calibrados com controle de ciclo de envio", gate: null, root: false, estado: "", origem: "", justificativa: "", classificacao: "", responsavel: "Rodrigo Silveira", prazo: "2026-10-15", status: "Pendente", causaRaizId: "cr1", causaRaizIds: ["cr1"], studyId: "why_aux_tc201_flange", actionType: "Corretiva", effectivenessCriterion: "Disponibilidade de ferramentas calibradas atestada em 100% das ordens de manutenção", verificationDate: "2026-11-01", verificationResponsible: "Carlos Eduardo Mendes", implementationReference: "RC-2026-1104", effectivenessResult: "Pendente", effectivenessNotes: "" }
    ],
    edges: [
      { id: "e_evt_imed", source: "evt", target: "imed", gate: "", logic: "", kind: "causal" },
      { id: "e_imed_hip", source: "imed", target: "hip", gate: "OU", logic: "OU", kind: "causal" },
      { id: "e_imed_fal", source: "imed", target: "fal", gate: "OU", logic: "OU", kind: "causal" },
      { id: "e_imed_fat", source: "imed", target: "fat", gate: "OU", logic: "OU", kind: "causal" },
      { id: "e_fat_fs1", source: "fat", target: "fs1", gate: "", logic: "", kind: "causal" },
      { id: "e_fat_fs2", source: "fat", target: "fs2", gate: "", logic: "", kind: "causal" },
      { id: "e_hip_cc1", source: "hip", target: "cc1", gate: "", logic: "", kind: "causal" },
      { id: "e_cc1_cr1", source: "cc1", target: "cr1", gate: "", logic: "", kind: "causal" },
      { id: "e_cr1_a1", source: "cr1", target: "a1", gate: "", logic: "", kind: "causal" },
      { id: "e_cr1_a2", source: "cr1", target: "a2", gate: "", logic: "", kind: "causal" },
      { id: "e_corr_fs1_cr1", source: "fs1", target: "cr1", gate: "", logic: "", kind: "correlation" }
    ]
  },
  whys: [],
  audit: [
    { id: "log_init_01", timestamp: "2026-09-14T09:00:00.000Z", action: "investigation.started", nodeId: "", summary: "Investigação formal iniciada para CII-2026-OP-042", fields: [] }
  ],
  step: 3,
  ria: {
    schemaVersion: 2,
    template: { code: "FORM-CORP-SMS-088", revision: "08" },
    control: {
      status: "draft",
      reportNumber: "RIA-2026-042",
      preparedBy: "Carlos Eduardo Mendes",
      reviewedBy: "Mariana Albuquerque",
      issuedAt: "",
      lastValidatedAt: "2026-09-19T18:00:00.000Z",
      revision: 0,
      dirtyAfterIssue: false
    },
    initialData: {
      incidentDate: "2026-09-14",
      incidentTime: "08:30",
      records: { siso: "SISO-2026-0914", siema: "SIEMA-4412", idema: "", inema: "", semace: "" },
      concessionaireName: "Brava Energia S.A.",
      concessionaireAddress: "Praia de Botafogo, 300 - Botafogo, Rio de Janeiro / RJ - CEP 22250-040",
      issuer: {
        name: "Carlos Eduardo Mendes",
        position: "Coordenador de Investigação de SMS",
        company: "Brava Energia",
        phone: "+55 21 99876-5432",
        email: "carlos.mendes@bravaenergia.com.br"
      }
    },
    communications: [
      { system: "SISO", protocol: "SISO-2026-0914", communicatedAt: "2026-09-14T11:00", evidence: "Comunicação tempestiva ANP" },
      { system: "SIEMA", protocol: "SIEMA-4412", communicatedAt: "2026-09-14T11:30", evidence: "Notificação IBAMA" }
    ],
    installation: {
      name: "FPSO Brava Spirit",
      cnpj: "12.345.678/0001-90",
      imo: "9345678",
      anpCode: "BR-FPSO-042",
      anpAuthorization: "AUT-ANP-2024-88",
      explorationProductionContract: "CONTRATO-BM-C-36",
      equipmentTag: "TC-201",
      latitude: "-23.8541",
      longitude: "-41.9823",
      otherAuthorities: "Capitania dos Portos de Macaé / Marinha do Brasil"
    },
    investigationPeriod: { start: "2026-09-14", end: "2026-09-19" },
    description: {
      technicalDescription: "Durante a partida do turbocompressor TC-201 após manutenção semestral, ocorreu vazamento de aproximadamente 180 litros de óleo lubrificante mineral no flange do filtro duplex. O fluido ficou confinado ao skid metálico e a unidade foi desarmada em ESD nível 3.",
      wellInformation: "Incidente restrito à planta de processo de compressão de gás em superfície.",
      mitigatingMeasures: "Desarme manual via ESD, isolamento de válvulas e recolhimento com mantas e pó absorvente.",
      obtainedResults: "Vazamento estancado em 5 minutos e recolhimento total do resíduo para tambores herméticos.",
      expectedShortTermResults: "Troca da junta de vedação e retomada da operação com torqueamento conferido."
    },
    consequences: {
      continuity: "Parada de 6 horas do trem de compressão TC-201 com alinhamento da vazão pelo trem auxiliar.",
      durationBand: "4 a 24 horas",
      people: { ownInjured: "0", ownFatalities: "0", contractorInjured: "0", contractorFatalities: "0", thirdInjured: "0", thirdFatalities: "0" },
      releases: [
        { product: "Óleo lubrificante mineral ISO VG 46", volume: "0.18", unit: "m³", environment: "Skid metálico (Contido)", containmentStatus: "Contido" }
      ],
      releaseStatus: "Cessado",
      releaseInterruptedAt: "2026-09-14T08:35",
      releaseExpectedAt: "",
      plumeBehavior: "Líquido viscoso drenado para a canaleta do skid.",
      affectedEnvironments: "Nenhum ambiente externo atingido.",
      solidWaste: "18 kg de material absorvente contaminado para destinação classe I.",
      otherConsequences: "Sem impactos patrimoniais permanentes."
    },
    protectionSystems: [
      { name: "Alarme de Baixa Pressão Diferencial PAL-201-14", assessment: "existed-worked", reason: "Atuou corretamente sinalizando queda de pressão no filtro" },
      { name: "Sistema de Desarme de Emergência ESD Nível 3", assessment: "existed-worked", reason: "Acionamento manual operou as válvulas de corte com sucesso" },
      { name: "Bacia de Contenção do Skid Metálico", assessment: "existed-worked", reason: "Reteve 100% do volume vazado sem transbordo para o mar" }
    ],
    investigation: {
      methodologyDescription: "Árvore de Causas complementada com metodologia dos 5 Porquês para desdobramento da falha de aperto e integridade mecânica.",
      potentialConsequences: "Risco de ignição caso o spray de óleo entrasse em contato com superfícies quentes de tubulações desprovidas de isolamento térmico.",
      humanFactors: "Pressão temporal decorrente do cronograma de partida e ausência de torquímetro calibrado disponível no momento da montagem."
    },
    measuresAdopted: "Limpeza completa do módulo M-04, substituição da junta danificada e reaperto monitorado com torquímetro calibrado.",
    lessonsLearned: "Sistemas pressurizados exigem controle formal e rastreável de aperto em todos os estágios de montagem.",
    emergencyResponseEvaluation: "Tempo de resposta de 5 minutos, adequado aos padrões de segurança da Brava Energia.",
    riskStudy: { asset: "FPSO Brava Spirit - Sistema de Compressão TC-201", reviewRequired: "Sim", technicalJustification: "Revisão da HAZOP do sistema de óleo para inclusão de salvaguarda de checagem formal de torque." },
    otherRelevantInformation: "Relatório elaborado para envio à ANP e arquivamento corporativo.",
    photoRegister: "Registros fotográficos da junta e da contenção arquivados no repositório de SMS.",
    photos: [],
    photoIntro: "",
    conclusion: "A comissão conclui que a perda de contenção resultou do sobretorque assimétrico na montagem da junta de vedação do filtro duplex, potencializado pela ausência de torquímetro calibrado e deficiência nas barreiras de garantia da qualidade da integridade mecânica.",
    referencesText: "PT-2026-4412, POP-MEC-018, Folha de Dados do TC-201.",
    attachmentsText: "Anexo 1: Diagrama da Árvore de Causas; Anexo 2: Estudo de 5 Porquês da Junta; Anexo 3: Relatório Fotográfico.",
    attachments: [],
    attachmentsMigrated: true,
    fieldReviews: {},
    validation: { issues: [], lastResult: "compliant" },
    emissions: []
  }
};

// Sincroniza coleção whys para exemplo 1
exemplo1_arvore.whys = exemplo1_arvore.whysAuxiliary;


// ==========================================
// 2. Definição do Exemplo 2: Metodologia Principal 5 Porquês
// ==========================================
const exemplo2_whys = {
  versao: "6.25.0",
  mainMethodology: "whys",
  whysPrimary: {
    id: "why_pri_p3101b_pump",
    code: "5P-01",
    title: "5 Porquês: Parada Não Planejada da Bomba de Injeção de Químicos (P-3101B)",
    problem: "Desarme por Sobrecarga Térmica da Bomba P-3101B",
    mode: "independent",
    link: { mode: "independent", nodeId: "", investigationCii: "CII-2026-MN-019", investigationTitle: "Parada Não Planejada da Bomba P-3101B" },
    status: "completed",
    createdAt: "2026-09-10T14:30:00.000Z",
    updatedAt: "2026-09-11T11:00:00.000Z",
    steps: [
      {
        id: "ws_p3101b_1",
        order: 1,
        question: "Por que a bomba dosadora P-3101B desarmou durante a operação?",
        answer: "Porque o relé térmico do motor elétrico atuou por corrente elevada de sobrecarga mecânica.",
        rationale: "Registro do painel elétrico acusou desarme por I > 115% da corrente nominal por mais de 30 segundos.",
        notes: "Motor de 7.5 kW.",
        result: "continue"
      },
      {
        id: "ws_p3101b_2",
        order: 2,
        question: "Por que ocorreu sobrecarga mecânica na bomba dosadora?",
        answer: "Porque a contrapressão na linha de descarga aumentou de 45 bar para 85 bar devido à restrição do fluxo de injeção.",
        rationale: "Manômetro local PI-3101-04 indicou pico de pressão prévio ao desarme.",
        notes: "Válvula de alívio não abriu adequadamente.",
        result: "continue"
      },
      {
        id: "ws_p3101b_3",
        order: 3,
        question: "Por que ocorreu restrição de fluxo na linha de descarga?",
        answer: "Porque a válvula de retenção de descarga travou parcialmente aberta com incrustação e polimerização de produto químico.",
        rationale: "Desmontagem da válvula no workshop revelou presença de goma espessa aderida à sede esférica.",
        notes: "Produto sequestrante de H2S.",
        result: "continue"
      },
      {
        id: "ws_p3101b_4",
        order: 4,
        question: "Por que o produto químico polimerizou no interior da válvula?",
        answer: "Porque o lote do sequestrante de H2S estocado no tanque diário sofreu degradação térmica e oxidação prévia ao abastecimento.",
        rationale: "Análise laboratorial de amostra do tanque diário indicou viscosidade cinemática 3x acima do limite de especificação do produto.",
        notes: "Armazenamento prolongado no convés.",
        result: "continue"
      },
      {
        id: "ws_p3101b_5",
        order: 5,
        question: "Por que o produto degradado e oxidado foi alimentado no sistema sem detecção?",
        answer: "Porque o protocolo de recebimento offshore de produtos químicos não previa teste obrigatório de viscosidade e aparência antes do descarregamento para tanques de consumo.",
        rationale: "A sistemática aceitava o Certificado de Análise da fábrica sem checagem de integridade após o transporte marítimo.",
        notes: "Falha no controle de recebimento de insumos críticos.",
        result: "cause-candidate"
      }
    ],
    causes: [
      {
        id: "5pc_p3101b_root",
        order: 1,
        type: "root",
        title: "Ausência de Controle de Qualidade no Recebimento Offshore de Insumos Químicos Críticos",
        description: "Falta de procedimento operacional para amostragem e teste de viscosidade/oxidação prévio à estocagem de sequestrantes instáveis.",
        status: "confirmed",
        sgsoCorrelation: "SGSO 08 - Procedimentos Operacionais",
        corporateStandard: "PAD-CORP-QUI-002",
        rationale: "Causa fundamental da entrada do fluido degradado no processo.",
        actions: ["act_w1", "act_w2"]
      }
    ],
    actions: [
      {
        id: "act_w1",
        causeId: "5pc_p3101b_root",
        causaRaizId: "5pc_p3101b_root",
        title: "Instituir Protocolo de Teste de Viscosidade no Recebimento Offshore",
        label: "Instituir Protocolo de Teste de Viscosidade no Recebimento Offshore",
        responsible: "Aline Vasconcelos",
        responsavel: "Aline Vasconcelos",
        dueDate: "2026-10-20",
        prazo: "2026-10-20",
        status: "Em andamento",
        actionType: "Preventiva",
        details: "Criar formulário de inspeção e teste rápido com viscosímetro de campo na chegada de insumos químicos à plataforma antes da transferência para tanques diários",
        desc: "Criar formulário de inspeção e teste rápido com viscosímetro de campo na chegada de insumos químicos à plataforma antes da transferência para tanques diários",
        effectivenessCriterion: "100% dos lotes de químicos críticos testados com registro formal arquivado no LIMS",
        verificationResponsible: "Marcelo Farias",
        verificationDate: "2026-11-10",
        implementationReference: "PAD-CORP-QUI-002-REV03",
        effectivenessResult: "Pendente",
        effectivenessNotes: "",
        linkedRefIds: ["ref_lab_01"]
      },
      {
        id: "act_w2",
        causeId: "5pc_p3101b_root",
        causaRaizId: "5pc_p3101b_root",
        title: "Revisar Plano de Manutenção Preventiva das Válvulas de Retenção de Injeção",
        label: "Revisar Plano de Manutenção Preventiva das Válvulas de Retenção de Injeção",
        responsible: "Julio Cesar Nogueira",
        responsavel: "Julio Cesar Nogueira",
        dueDate: "2026-10-15",
        prazo: "2026-10-15",
        status: "Pendente",
        actionType: "Corretiva",
        details: "Reduzir a periodicidade de inspeção e limpeza interna das válvulas de dosagem de sequestrante de 6 para 3 meses",
        desc: "Reduzir a periodicidade de inspeção e limpeza interna das válvulas de dosagem de sequestrante de 6 para 3 meses",
        effectivenessCriterion: "Zero falhas por colmatação de válvulas de retenção nos próximos 12 meses",
        verificationResponsible: "Marcelo Farias",
        verificationDate: "2026-11-01",
        implementationReference: "PM-P50-QUI-044",
        effectivenessResult: "Pendente",
        effectivenessNotes: "",
        linkedRefIds: []
      }
    ],
    references: [],
    identity: {
      code: "5P-01",
      title: "5 Porquês: Parada Não Planejada da Bomba P-3101B",
      owner: "Julio Cesar Nogueira",
      participants: ["Aline Vasconcelos", "Marcelo Farias"],
      createdAt: "2026-09-10T14:30:00.000Z",
      updatedAt: "2026-09-11T11:00:00.000Z",
      status: "completed"
    },
    context: {
      problem: "Desarme por Sobrecarga Térmica da Bomba P-3101B",
      impact: "Interrupção de 4 horas na dosagem de sequestrante no manifold de produção",
      expectedCondition: "Injeção estável a 45 bar com viscosidade de 15 cSt",
      observedCondition: "Pico de pressão a 85 bar por polimerização na válvula de retenção",
      scope: "Sistema de Injeção de Químicos - Plataforma P-50",
      area: "Tratamento de Gás",
      location: "Skid de Injeção Química"
    },
    conclusionData: {
      summary: "A parada da bomba P-3101B foi provocada pela restrição de fluxo por polimerização do sequestrante de H2S, permitida pela ausência de barreira de controle analítico na recepção de insumos químicos a bordo.",
      limitations: "Sem impacto no teor de H2S do gás exportado devido à entrada imediata da bomba reserva P-3101A."
    },
    audit: [],
    schemaVersion: "2.0"
  },
  whysAuxiliary: [],
  triagem: {
    cii: "CII-2026-MN-019",
    titulo: "Parada Não Planejada da Bomba de Injeção de Sequestrante de H2S (P-3101B)",
    ocorr: "2026-09-10T14:10",
    reg: "2026-09-10T14:30",
    site: "Ativo Parque das Conchas - Plataforma P-50",
    local: "Skid de Injeção Química - Convés Principal",
    atividade: "Injeção contínua de sequestrante químico de H2S em linha de alta pressão",
    pt: "N/A - Operação de Rotina",
    regpor: "Aline Vasconcelos (Supervisora de Química e Meio Ambiente)",
    contratada: "N/A - Operação Própria Brava Energia",
    descricao: "Durante operação normal de tratamento, a bomba dosadora P-3101B desarmou por sobrecarga elétrica decorrente de sobrepressão gerada por polimerização de produto químico na válvula de retenção de descarga. A bomba reserva foi alinhada em 15 minutos.",
    tipo: "real",
    dim: "cat18",
    tipoc: "m07-r19",
    criterio: "m07-r19-s1",
    sev: 1,
    nivel: 1,
    metodos: ["whys"]
  },
  classificacaoV2: {
    matrixRevision: "07",
    assessments: [
      {
        categoryId: "cat18",
        categoryLabel: "Interrupção das Operações",
        occurrenceId: "m07-r19",
        occurrenceLabel: "Parada não programada de instalação ou equipamento de processo",
        criteriaId: "m07-r19-s1",
        criteriaText: "• Parada parcial da produção por período inferior a 24 horas sem impacto contratual.",
        severity: 1,
        matrixRevision: "07"
      }
    ],
    calculatedSeverity: 1,
    reviewedSeverity: null,
    finalSeverity: 1,
    overrideReason: "",
    legacy: false
  },
  commissionExceptions: {},
  externalReferences: [
    { id: "ref_lab_01", externalSystem: "LIMS Laboratório", title: "Boletim Analítico LAB-2026-904", reference: "Amostragem Lote SEQ-8841", status: "available", linkedNodeIds: ["act_w1"] }
  ],
  chronology: [
    { id: "chr_w1", dateTime: "2026-09-10T13:50", phase: "before", description: "Elevação gradual da contrapressão no manômetro de descarga da bomba P-3101B.", externalSource: "SDCD", externalReference: "PI-3101-04", linkedNodeId: "", endOfResponse: false, contextual: true, notes: "Operador de Painel observou pressão subindo." },
    { id: "chr_w2", dateTime: "2026-09-10T14:10", phase: "during", description: "Desarme do motor elétrico da bomba P-3101B por sobrecarga térmica.", externalSource: "CCM Elétrico", externalReference: "Relé Térmico", linkedNodeId: "", endOfResponse: false, contextual: true, notes: "Motor desarmou por sobrecorrente prolongada." },
    { id: "chr_w3", dateTime: "2026-09-10T14:25", phase: "during", description: "Partida e alinhamento manual da bomba dosadora reserva P-3101A.", externalSource: "Log de Operação", externalReference: "Turno T1", linkedNodeId: "", endOfResponse: false, contextual: true, notes: "Vazão de sequestrante normalizada." },
    { id: "chr_w4", dateTime: "2026-09-10T16:30", phase: "after", description: "Desmontagem da retenção, constatação de produto polimerizado e encerramento da intervenção.", externalSource: "OS Manutenção", externalReference: "OS-2026-44120", linkedNodeId: "act_w1", endOfResponse: true, contextual: true, notes: "Fim do atendimento e liberação para análise laboratorial." }
  ],
  conclusion: {
    summary: "O desarme da bomba foi causado pelo travamento da retenção por polimerização do sequestrante, originado pela falta de teste de recepção offshore.",
    contributors: "Exposição dos contêineres a calor e umidade durante o transporte de suprimento marítimo.",
    roots: "Ausência de protocolo analítico para recebimento e liberação de insumos químicos instáveis a bordo.",
    actions: "Criação de protocolo de inspeção rápida de viscosidade pré-tanque e revisão da especificação de embalagem.",
    limitations: "Sem liberação ao meio ambiente e sem impacto no atendimento de especificação de exportação de óleo e gás.",
    references: "Boletim LAB-2026-904, Procedimento PAD-CORP-QUI-002.",
    generated: false
  },
  equipe: [
    {
      nome: "Julio Cesar Nogueira",
      func: "Coordenador da Comissão",
      area: "Manutenção e Integridade",
      qual: "Atende",
      commissionCoordinator: true,
      investigationManager: false,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    },
    {
      nome: "Marcelo Farias",
      func: "Gerente da Instalação",
      area: "Operações",
      qual: "Atende",
      commissionCoordinator: false,
      investigationManager: true,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    },
    {
      nome: "Aline Vasconcelos",
      func: "Supervisora de Química",
      area: "Química e Meio Ambiente",
      qual: "Atende",
      commissionCoordinator: false,
      investigationManager: false,
      technicalKnowledge: true,
      rcaQualified: true,
      cipaRepresentative: false,
      areaRepresentative: true,
      contractorRepresentative: false
    }
  ],
  tree: {
    nodes: [
      {
        id: "act_w1",
        kind: "acao",
        label: "Instituir Protocolo de Teste de Viscosidade no Recebimento Offshore",
        title: "Instituir Protocolo de Teste de Viscosidade no Recebimento Offshore",
        desc: "Criar formulário de inspeção e teste rápido com viscosímetro de campo na chegada de insumos químicos à plataforma antes da transferência para tanques diários",
        details: "Criar formulário de inspeção e teste rápido com viscosímetro de campo na chegada de insumos químicos à plataforma antes da transferência para tanques diários",
        gate: null,
        root: false,
        estado: "",
        origem: "",
        justificativa: "",
        classificacao: "",
        responsavel: "Aline Vasconcelos",
        responsible: "Aline Vasconcelos",
        prazo: "2026-10-20",
        dueDate: "2026-10-20",
        status: "Em andamento",
        causaRaizId: "5pc_p3101b_root",
        causeId: "5pc_p3101b_root",
        causaRaizIds: ["5pc_p3101b_root"],
        studyId: "why_pri_p3101b_pump",
        actionType: "Preventiva",
        effectivenessCriterion: "100% dos lotes de químicos críticos testados com registro formal arquivado no LIMS",
        verificationDate: "2026-11-10",
        verificationResponsible: "Marcelo Farias",
        implementationReference: "PAD-CORP-QUI-002-REV03",
        effectivenessResult: "Pendente",
        effectivenessNotes: "",
        linkedRefIds: ["ref_lab_01"]
      },
      {
        id: "act_w2",
        kind: "acao",
        label: "Revisar Plano de Manutenção Preventiva das Válvulas de Retenção de Injeção",
        title: "Revisar Plano de Manutenção Preventiva das Válvulas de Retenção de Injeção",
        desc: "Reduzir a periodicidade de inspeção e limpeza interna das válvulas de dosagem de sequestrante de 6 para 3 meses",
        details: "Reduzir a periodicidade de inspeção e limpeza interna das válvulas de dosagem de sequestrante de 6 para 3 meses",
        gate: null,
        root: false,
        estado: "",
        origem: "",
        justificativa: "",
        classificacao: "",
        responsavel: "Julio Cesar Nogueira",
        responsible: "Julio Cesar Nogueira",
        prazo: "2026-10-15",
        dueDate: "2026-10-15",
        status: "Pendente",
        causaRaizId: "5pc_p3101b_root",
        causeId: "5pc_p3101b_root",
        causaRaizIds: ["5pc_p3101b_root"],
        studyId: "why_pri_p3101b_pump",
        actionType: "Corretiva",
        effectivenessCriterion: "Zero falhas por colmatação de válvulas de retenção nos próximos 12 meses",
        verificationDate: "2026-11-01",
        verificationResponsible: "Marcelo Farias",
        implementationReference: "PM-P50-QUI-044",
        effectivenessResult: "Pendente",
        effectivenessNotes: "",
        linkedRefIds: []
      }
    ],
    edges: []
  },
  whys: [],
  audit: [
    { id: "log_w_init", timestamp: "2026-09-10T14:30:00.000Z", action: "investigation.started", nodeId: "", summary: "Investigação 5 Porquês iniciada para CII-2026-MN-019", fields: [] }
  ],
  step: 3,
  ria: {
    schemaVersion: 2,
    template: { code: "FORM-CORP-SMS-088", revision: "08" },
    control: {
      status: "draft",
      reportNumber: "RIA-2026-019",
      preparedBy: "Julio Cesar Nogueira",
      reviewedBy: "Marcelo Farias",
      issuedAt: "",
      lastValidatedAt: "2026-09-19T18:00:00.000Z",
      revision: 0,
      dirtyAfterIssue: false
    },
    initialData: {
      incidentDate: "2026-09-10",
      incidentTime: "14:10",
      records: { siso: "SISO-2026-1009", siema: "", idema: "", inema: "", semace: "" },
      concessionaireName: "Brava Energia S.A.",
      concessionaireAddress: "Praia de Botafogo, 300 - Botafogo, Rio de Janeiro / RJ - CEP 22250-040",
      issuer: {
        name: "Julio Cesar Nogueira",
        position: "Coordenador de Manutenção",
        company: "Brava Energia",
        phone: "+55 21 99123-4567",
        email: "julio.nogueira@bravaenergia.com.br"
      }
    },
    communications: [],
    installation: {
      name: "Plataforma P-50",
      cnpj: "12.345.678/0002-71",
      imo: "9212345",
      anpCode: "BR-P50-019",
      anpAuthorization: "AUT-ANP-2023-14",
      explorationProductionContract: "CONTRATO-BC-100",
      equipmentTag: "P-3101B",
      latitude: "-22.5412",
      longitude: "-40.3214",
      otherAuthorities: ""
    },
    investigationPeriod: { start: "2026-09-10", end: "2026-09-14" },
    description: {
      technicalDescription: "Durante a operação contínua de injeção química na P-50, a bomba dosadora P-3101B desarmou por sobrecarga elétrica decorrente da retenção travada com produto polimerizado. A bomba reserva P-3101A foi acionada sem impacto na exportação.",
      wellInformation: "Sistema de injeção em manifold de produção de poços marítimos.",
      mitigatingMeasures: "Partida imediata da bomba reserva P-3101A e isolamento do cabeçote da P-3101B.",
      obtainedResults: "Continuidade operacional assegurada em menos de 15 minutos.",
      expectedShortTermResults: "Desmontagem, limpeza química e troca da sede da válvula de retenção."
    },
    consequences: {
      continuity: "Parada de 4 horas da bomba principal sem interrupção de produção de óleo.",
      durationBand: "Inferior a 4 horas",
      people: { ownInjured: "0", ownFatalities: "0", contractorInjured: "0", contractorFatalities: "0", thirdInjured: "0", thirdFatalities: "0" },
      releases: [],
      releaseStatus: "Não aplicável",
      releaseInterruptedAt: "",
      releaseExpectedAt: "",
      plumeBehavior: "Sem liberação ao meio externo.",
      affectedEnvironments: "Nenhum.",
      solidWaste: "0.5 kg de resíduo sólido de polímero recolhido em oficina.",
      otherConsequences: "Sem danos a terceiros ou multas ambientais."
    },
    protectionSystems: [
      { name: "Relé de Sobrecarga Térmica do CCM", assessment: "existed-worked", reason: "Desarmou o motor antes da queima dos enrolamentos por torque excessivo" },
      { name: "Bomba Reserva em Stand-by (P-3101A)", assessment: "existed-worked", reason: "Assumiu a dosagem sem perda de continuidade de tratamento do poço" }
    ],
    investigation: {
      methodologyDescription: "Metodologia dos 5 Porquês aplicada para análise causal de falha de equipamento de processo de Nível 1.",
      potentialConsequences: "Se a bomba reserva também falhasse, o gás exportado ultrapassaria a especificação de H2S exigindo queima em flare.",
      humanFactors: "Confiança cega no boletim do fabricante sem conferência de parâmetros físicos no desembarque offshore."
    },
    measuresAdopted: "Substituição da válvula de retenção e dosagem assistida com acompanhamento horo-horário.",
    lessonsLearned: "Insumos químicos sujeitos à degradação térmica demandam controle rigoroso de prazo e testes rápidos de recebimento.",
    emergencyResponseEvaluation: "Atendimento de rotina executado pela própria equipe de operação e manutenção do ativo.",
    riskStudy: { asset: "Plataforma P-50 - Skid de Injeção Química", reviewRequired: "Sim", technicalJustification: "Revisão do procedimento operacional padrão de recepção de químicos e matriz de risco operacional." },
    otherRelevantInformation: "Investigação concluída com plano de ação em execução.",
    photoRegister: "Registros macroscópicos da goma polimerizada anexados ao laudo laboratorial.",
    photos: [],
    photoIntro: "",
    conclusion: "A comissão técnica concluiu que a falha da bomba P-3101B foi desencadeada pelo travamento da válvula de retenção por polímero viscoso decorrente da falta de barreira de controle analítico na recepção de insumos químicos na unidade marítima.",
    referencesText: "Boletim LAB-2026-904, Procedimento PAD-CORP-QUI-002, Manual de Operação P-50.",
    attachmentsText: "Anexo 1: Ficha dos 5 Porquês; Anexo 2: Laudo Analítico LAB-2026-904.",
    attachments: [],
    attachmentsMigrated: true,
    fieldReviews: {},
    validation: { issues: [], lastResult: "compliant" },
    emissions: []
  }
};

// Sincroniza coleção whys para exemplo 2
exemplo2_whys.whys = [exemplo2_whys.whysPrimary];

// ==========================================
// 3. Montagem dos Pacotes Oficiais FACIU (schema 1.1)
// ==========================================
const pacote1 = {
  fileType: "brava-investigacao-causas",
  schemaVersion: "1.1",
  appVersion: "6.24.0",
  exportedAt: new Date().toISOString(),
  study: exemplo1_arvore
};

const pacote2 = {
  fileType: "brava-investigacao-causas",
  schemaVersion: "1.1",
  appVersion: "6.24.0",
  exportedAt: new Date().toISOString(),
  study: exemplo2_whys
};

// ==========================================
// 4. Validação Rigorosa em JSDOM contra FACIU-v6.22.6.html
// ==========================================
const dom = new JSDOM(rawHtml, {
  runScripts: "dangerously",
  url: "http://localhost/",
  beforeParse(window) {
    window.requestAnimationFrame = (fn) => setTimeout(fn, 0);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.scrollTo = () => {};
    window.Sortable = { create: () => ({ destroy: () => {} }) };
    window.lucide = { createIcons: () => {} };
    window.indexedDB = {
      open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null })
    };
    window.cytoscape = function() {
      const mock = { on: () => {}, nodes: () => [], edges: () => [], style: () => mock, fit: () => mock, center: () => mock, zoom: () => 1, pan: () => ({x:0,y:0}), layout: () => ({ run: () => {} }), add: () => {}, remove: () => {}, $: () => ({ select: () => {}, unselect: () => {}, length: 1, data: () => ({}) }), png: () => '', resize: () => {}, elements: () => ({ remove: () => {} }) };
      return mock;
    };
  }
});

const win = dom.window;

// Valida Pacote 1 (Árvore de Causas + 5P)
const errs1 = win.eval(`validateImportPackage(${JSON.stringify(pacote1)})`);
console.log('Validação Pacote 1 (Árvore de Causas):', errs1.length === 0 ? '[OK] 0 erros' : errs1);
assert.strictEqual(errs1.length, 0, 'Pacote 1 deve passar na validação de importação');

// Carrega Pacote 1 no estado e valida conformidade global do estudo
win.eval(`
  state = normalizeImportedStudy(${JSON.stringify(pacote1.study)});
  hydrateTriage();
  save();
`);
const validationItems1 = win.eval(`validationItems()`);
const allPendingErrs1 = validationItems1.filter(item => !item.ok);
console.log('Itens de Validação Pendentes Pacote 1:', allPendingErrs1.length);
if (allPendingErrs1.length > 0) {
  console.log(allPendingErrs1);
}
assert.strictEqual(allPendingErrs1.length, 0, 'Estudo 1 não deve ter nenhuma pendência no checklist de validação');

// Valida Pacote 2 (5 Porquês Principal)
const errs2 = win.eval(`validateImportPackage(${JSON.stringify(pacote2)})`);
console.log('Validação Pacote 2 (5 Porquês Principal):', errs2.length === 0 ? '[OK] 0 erros' : errs2);
assert.strictEqual(errs2.length, 0, 'Pacote 2 deve passar na validação de importação');

// Carrega Pacote 2 no estado e valida conformidade global do estudo
win.eval(`
  state.mainMethodology = 'whys';
  state = normalizeImportedStudy(${JSON.stringify(pacote2.study)});
  hydrateTriage();
  setMainMethodology('whys');
  save();
`);
const validationItems2 = win.eval(`validationItems()`);
const allPendingErrs2 = validationItems2.filter(item => !item.ok);
console.log('Itens de Validação Pendentes Pacote 2:', allPendingErrs2.length);
if (allPendingErrs2.length > 0) {
  console.log(allPendingErrs2);
}
assert.strictEqual(allPendingErrs2.length, 0, 'Estudo 2 deve ter 100% de conformidade e 0 pendências no checklist');

// ==========================================
// 5. Gravação dos Arquivos nos Destinos Solicitados
// ==========================================
// Arquivo 1: Destino solicitado pelo usuário se em ambiente Windows
const targetPathUser1 = 'C:\\Users\\rtair\\OneDrive\\Documentos\\investigacao_faciu.json';
if (process.platform === 'win32' || fs.existsSync('C:\\Users\\rtair\\OneDrive\\Documentos')) {
  try {
    fs.writeFileSync(targetPathUser1, JSON.stringify(pacote1, null, 2), 'utf8');
    console.log('\n[ARQUIVO GERADO] Destino do Usuário (Exemplo 1 - Árvore de Causas):', targetPathUser1);
  } catch (e) {
    console.log('Aviso: Caminho de usuário Windows não gravado:', e.message);
  }
}

// Arquivo 2: Destino do Usuário para o Exemplo 2 (5 Porquês como Metodologia Principal)
const targetPathUser2 = 'C:\\Users\\rtair\\OneDrive\\Documentos\\investigacao_faciu_5porques_principal.json';
if (process.platform === 'win32' || fs.existsSync('C:\\Users\\rtair\\OneDrive\\Documentos')) {
  try {
    fs.writeFileSync(targetPathUser2, JSON.stringify(pacote2, null, 2), 'utf8');
    console.log('[ARQUIVO GERADO] Destino do Usuário (Exemplo 2 - 5 Porquês Principal):', targetPathUser2);
  } catch (e) {
    console.log('Aviso: Caminho de usuário Windows não gravado:', e.message);
  }
}

// Cópias no Repositório do Projeto (docs/exemplos/)
const repoPath1 = path.join(__dirname, '../docs/exemplos/investigacao_exemplo1_arvore_de_causas.json');
const repoPath2 = path.join(__dirname, '../docs/exemplos/investigacao_exemplo2_5porques_principal.json');
fs.writeFileSync(repoPath1, JSON.stringify(pacote1, null, 2), 'utf8');
fs.writeFileSync(repoPath2, JSON.stringify(pacote2, null, 2), 'utf8');
console.log('[REPOSITÓRIO] Salvo em:', repoPath1);
console.log('[REPOSITÓRIO] Salvo em:', repoPath2);

console.log('\n=== Todos os exemplos foram gerados e validados com sucesso! ===');
