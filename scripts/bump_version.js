#!/usr/bin/env bun
/**
 * scripts/bump_version.js — Automação Atômica de Versionamento e Backups do FACIU
 * Padrão Obrigatório de Governança (Passo 0) para Single-File Application (SFA).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.dirname(__dirname);
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

function parseSemver(verStr) {
  const m = verStr.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Formato SemVer inválido: '${verStr}' (esperado X.Y.Z)`);
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function formatSemver(major, minor, patch) {
  return `${major}.${minor}.${patch}`;
}

function findActiveFile() {
  const files = fs.readdirSync(ROOT_DIR).filter(f => f.startsWith('FACIU-v') && f.endsWith('.html'));
  if (!files.length) throw new Error("Nenhum arquivo 'FACIU-v*.html' encontrado na raiz.");

  const parsed = [];
  for (const f of files) {
    const m = f.match(/^FACIU-v(\d+\.\d+\.\d+)\.html$/);
    if (m) {
      const verStr = m[1];
      parsed.push({ semver: parseSemver(verStr), verStr, fullPath: path.join(ROOT_DIR, f), filename: f });
    }
  }

  if (!parsed.length) throw new Error("Nenhum arquivo FACIU-vX.Y.Z.html com SemVer canônico encontrado.");

  parsed.sort((a, b) => {
    for (let i = 0; i < 3; i++) {
      if (a.semver[i] !== b.semver[i]) return b.semver[i] - a.semver[i];
    }
    return 0;
  });

  if (parsed.length > 1) {
    console.log(`[AVISO] Mais de um arquivo de versão detectado na raiz (${parsed.length} encontrados).`);
    console.log(`[AVISO] Selecionando a maior versão SemVer ativa: ${parsed[0].verStr} (${parsed[0].filename})`);
  }

  return { activePath: parsed[0].fullPath, currVer: parsed[0].verStr, filename: parsed[0].filename };
}

function calculateNextVersion(currVerStr, mode, explicitTarget) {
  if (explicitTarget) {
    parseSemver(explicitTarget);
    return explicitTarget;
  }
  const [major, minor, patch] = parseSemver(currVerStr);
  if (mode === 'patch') return formatSemver(major, minor, patch + 1);
  if (mode === 'minor') return formatSemver(major, minor + 1, 0);
  if (mode === 'major') return formatSemver(major + 1, 0, 0);
  throw new Error(`Modo de bump desconhecido: '${mode}'. Use patch, minor ou major.`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyVersionReplacements(content, currVer, newVer) {
  const changes = [];
  const currEsc = escapeRegExp(currVer);

  // 1. <title>
  const titlePattern = new RegExp(`<title>FACIU v${currEsc} \\|`, 'g');
  if (titlePattern.test(content)) {
    content = content.replace(titlePattern, `<title>FACIU v${newVer} |`);
    changes.push("<title>");
  }

  // 2. Start Screen badge
  const startPattern = new RegExp(`FACIU <span class="start-version">v${currEsc}</span>`, 'g');
  if (startPattern.test(content)) {
    content = content.replace(startPattern, `FACIU <span class="start-version">v${newVer}</span>`);
    changes.push("start-screen badge");
  }

  // 3. Topbar badge id="appVersionLabel"
  const topbarPattern = new RegExp(`id="appVersionLabel">v${currEsc}</span>`, 'g');
  if (topbarPattern.test(content)) {
    content = content.replace(topbarPattern, `id="appVersionLabel">v${newVer}</span>`);
    changes.push("topbar #appVersionLabel");
  }

  // 4. const APP_VERSION="...";
  const appvPattern = new RegExp(`const APP_VERSION="${currEsc}";`, 'g');
  if (appvPattern.test(content)) {
    content = content.replace(appvPattern, `const APP_VERSION="${newVer}";`);
    changes.push("const APP_VERSION");
  }

  // 5. Fallback strings
  const fallbackPattern = new RegExp(`APP_VERSION !== 'undefined' \\? APP_VERSION : '${currEsc}'`, 'g');
  const countFb = (content.match(fallbackPattern) || []).length;
  if (countFb > 0) {
    content = content.replace(fallbackPattern, `APP_VERSION !== 'undefined' ? APP_VERSION : '${newVer}'`);
    changes.push(`${countFb} fallbacks de APP_VERSION`);
  }

  // 6. Painel Unificado / Headers
  const panelPattern = new RegExp(`FACIU v${currEsc} &bull; Painel Unificado`, 'g');
  if (panelPattern.test(content)) {
    content = content.replace(panelPattern, `FACIU v${newVer} &bull; Painel Unificado`);
    changes.push("rodapé do Painel Unificado");
  }

  // 7. Cabeçalhos de comentários de versão
  const commentPattern = new RegExp(`\\(v${currEsc}\\)`, 'g');
  const countComm = (content.match(commentPattern) || []).length;
  if (countComm > 0) {
    content = content.replace(commentPattern, `(v${newVer})`);
    changes.push(`${countComm} cabeçalhos de comentários de versão`);
  }

  return { content, changes };
}

function executeBump(mode = 'patch', explicitTarget = null, dryRun = false) {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const { activePath, currVer, filename: activeFilename } = findActiveFile();
  const newVer = calculateNextVersion(currVer, mode, explicitTarget);

  if (currVer === newVer) {
    console.error(`[ERRO] A nova versão (${newVer}) é idêntica à versão atual. Nenhuma ação executada.`);
    process.exit(1);
  }

  const newFilename = `FACIU-v${newVer}.html`;
  const newPath = path.join(ROOT_DIR, newFilename);
  const backupPath = path.join(BACKUPS_DIR, activeFilename);

  console.log("=".repeat(70));
  console.log("=== CICLO ATÔMICO DE VERSIONAMENTO E BACKUP FACIU (PASSO 0) ===");
  console.log("=".repeat(70));
  console.log(`Versão Ativa Atual : v${currVer} (${activeFilename})`);
  console.log(`Nova Versão Alvo   : v${newVer} (${newFilename})`);
  console.log(`Destino de Backup  : backups/${activeFilename}`);
  console.log(`Modo Dry-Run       : ${dryRun ? 'SIM (Simulação sem alterações)' : 'NÃO (Execução real)'}`);
  console.log("-".repeat(70));

  const rawContent = fs.readFileSync(activePath, 'utf-8');
  const { content: newContent, changes } = applyVersionReplacements(rawContent, currVer, newVer);

  console.log(`[SUBSTITUIÇÕES] ${changes.length} grupos de identificadores atualizados:`);
  for (const c of changes) {
    console.log(`  ✓ ${c}`);
  }

  if (dryRun) {
    console.log("\n[DRY-RUN] Simulação concluída com sucesso. Nenhuma alteração foi gravada em disco.");
    return;
  }

  console.log(`\n[PASSO 1/3] Criando cópia de segurança em: backups/${activeFilename}...`);
  fs.copyFileSync(activePath, backupPath);
  const backupStats = fs.statSync(backupPath);
  if (!backupStats.size) throw new Error(`Falha ao validar integridade do backup em ${backupPath}`);
  console.log(`  ✓ Backup verificado (${backupStats.size.toLocaleString()} bytes)`);

  console.log(`[PASSO 2/3] Gerando novo arquivo na raiz: ${newFilename}...`);
  const tempNewPath = newPath + '.tmp';
  fs.writeFileSync(tempNewPath, newContent, 'utf-8');
  fs.renameSync(tempNewPath, newPath);
  const newStats = fs.statSync(newPath);
  console.log(`  ✓ Novo arquivo criado (${newStats.size.toLocaleString()} bytes)`);

  console.log(`[PASSO 3/3] Higienizando a raiz (removendo versão anterior da raiz)...`);
  if (fs.existsSync(activePath) && path.resolve(activePath) !== path.resolve(newPath)) {
    fs.unlinkSync(activePath);
    console.log(`  ✓ Removido da raiz: ${activeFilename} (preservado permanentemente em backups/)`);
  }

  console.log("\n" + "=".repeat(70));
  console.log(`SUCESSO: FACIU promovido para v${newVer} com sucesso!`);
  console.log(`Arquivo ativo único na raiz: ${newFilename}`);
  console.log("=".repeat(70));
}

const args = process.argv.slice(2);
let mode = 'patch';
let explicitTarget = null;
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') dryRun = true;
  else if (args[i] === '--to' && args[i + 1]) {
    explicitTarget = args[i + 1];
    i++;
  } else if (['patch', 'minor', 'major'].includes(args[i])) {
    mode = args[i];
  }
}

executeBump(mode, explicitTarget, dryRun);
