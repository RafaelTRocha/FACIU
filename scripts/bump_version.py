#!/usr/bin/env python3
"""
scripts/bump_version.py — Automação Atômica de Versionamento e Backups do FACIU
Padrão Obrigatório de Governança (Passo 0) para Single-File Application (SFA).

Uso:
  python3 scripts/bump_version.py patch          # Incrementa 7.3.0 -> 7.3.1
  python3 scripts/bump_version.py minor          # Incrementa 7.3.0 -> 7.4.0
  python3 scripts/bump_version.py major          # Incrementa 7.3.0 -> 8.0.0
  python3 scripts/bump_version.py --to 7.4.0     # Define versão explícita
  python3 scripts/bump_version.py minor --dry-run
"""

import sys
import os
import re
import glob
import shutil
import argparse

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUPS_DIR = os.path.join(ROOT_DIR, 'backups')

def parse_semver(ver_str):
    m = re.match(r'^(\d+)\.(\d+)\.(\d+)$', ver_str)
    if not m:
        raise ValueError(f"Formato SemVer inválido: '{ver_str}' (esperado X.Y.Z)")
    return tuple(map(int, m.groups()))

def format_semver(major, minor, patch):
    return f"{major}.{minor}.{patch}"

def find_active_file():
    files = glob.glob(os.path.join(ROOT_DIR, 'FACIU-v*.html'))
    if not files:
        raise FileNotFoundError("Nenhum arquivo 'FACIU-v*.html' encontrado na raiz.")

    parsed = []
    for f in files:
        base = os.path.basename(f)
        m = re.match(r'^FACIU-v(\d+\.\d+\.\d+)\.html$', base)
        if m:
            ver_str = m.group(1)
            parsed.append((parse_semver(ver_str), ver_str, f))

    if not parsed:
        raise FileNotFoundError("Nenhum arquivo FACIU-vX.Y.Z.html com SemVer canônico encontrado.")

    parsed.sort(key=lambda x: x[0], reverse=True)
    if len(parsed) > 1:
        print(f"[AVISO] Mais de um arquivo de versão detectado na raiz ({len(parsed)} encontrados).")
        print(f"[AVISO] Selecionando a maior versão SemVer ativa: {parsed[0][1]} ({os.path.basename(parsed[0][2])})")

    return parsed[0][2], parsed[0][1]

def calculate_next_version(curr_ver_str, mode, explicit_target=None):
    if explicit_target:
        parse_semver(explicit_target)
        return explicit_target

    major, minor, patch = parse_semver(curr_ver_str)
    if mode == 'patch':
        return format_semver(major, minor, patch + 1)
    elif mode == 'minor':
        return format_semver(major, minor + 1, 0)
    elif mode == 'major':
        return format_semver(major + 1, 0, 0)
    else:
        raise ValueError(f"Modo de bump desconhecido: '{mode}'. Use patch, minor ou major.")

def apply_version_replacements(content, curr_ver, new_ver):
    changes = []

    # 1. <title>
    title_pattern = r'<title>FACIU v' + re.escape(curr_ver) + r' \|'
    title_sub = f'<title>FACIU v{new_ver} |'
    if re.search(title_pattern, content):
        content = re.sub(title_pattern, title_sub, content)
        changes.append("<title>")

    # 2. Start Screen badge
    start_pattern = r'FACIU <span class="start-version">v' + re.escape(curr_ver) + r'</span>'
    start_sub = f'FACIU <span class="start-version">v{new_ver}</span>'
    if re.search(start_pattern, content):
        content = re.sub(start_pattern, start_sub, content)
        changes.append("start-screen badge")

    # 3. Topbar badge id="appVersionLabel"
    topbar_pattern = r'id="appVersionLabel">v' + re.escape(curr_ver) + r'</span>'
    topbar_sub = f'id="appVersionLabel">v{new_ver}</span>'
    if re.search(topbar_pattern, content):
        content = re.sub(topbar_pattern, topbar_sub, content)
        changes.append("topbar #appVersionLabel")

    # 4. const APP_VERSION="...";
    appv_pattern = r'const APP_VERSION="' + re.escape(curr_ver) + r'";'
    appv_sub = f'const APP_VERSION="{new_ver}";'
    if re.search(appv_pattern, content):
        content = re.sub(appv_pattern, appv_sub, content)
        changes.append("const APP_VERSION")

    # 5. Fallback strings typeof APP_VERSION !== 'undefined' ? APP_VERSION : '...'
    fallback_pattern = r"APP_VERSION !== 'undefined' \? APP_VERSION : '" + re.escape(curr_ver) + r"'"
    fallback_sub = f"APP_VERSION !== 'undefined' ? APP_VERSION : '{new_ver}'"
    count_fb = len(re.findall(fallback_pattern, content))
    if count_fb > 0:
        content = re.sub(fallback_pattern, fallback_sub, content)
        changes.append(f"{count_fb} fallbacks de APP_VERSION")

    # 6. Painel Unificado / Headers com "FACIU vX.Y.Z"
    panel_pattern = r'FACIU v' + re.escape(curr_ver) + r' &bull; Painel Unificado'
    panel_sub = f'FACIU v{new_ver} &bull; Painel Unificado'
    if re.search(panel_pattern, content):
        content = re.sub(panel_pattern, panel_sub, content)
        changes.append("rodapé do Painel Unificado")

    # 7. Cabeçalhos de comentários de versão relevantes (ex: v7.3.0 -> v7.4.0)
    comment_pattern = r'\(v' + re.escape(curr_ver) + r'\)'
    comment_sub = f'(v{new_ver})'
    count_comm = len(re.findall(comment_pattern, content))
    if count_comm > 0:
        content = re.sub(comment_pattern, comment_sub, content)
        changes.append(f"{count_comm} cabeçalhos de comentários de versão")

    return content, changes

def execute_bump(mode, explicit_target=None, dry_run=False):
    os.makedirs(BACKUPS_DIR, exist_ok=True)

    active_path, curr_ver = find_active_file()
    new_ver = calculate_next_version(curr_ver, mode, explicit_target)

    if curr_ver == new_ver:
        print(f"[ERRO] A nova versão ({new_ver}) é idêntica à versão atual. Nenhuma ação executada.")
        sys.exit(1)

    new_filename = f"FACIU-v{new_ver}.html"
    new_path = os.path.join(ROOT_DIR, new_filename)
    backup_filename = os.path.basename(active_path)
    backup_path = os.path.join(BACKUPS_DIR, backup_filename)

    print("=" * 70)
    print("=== CICLO ATÔMICO DE VERSIONAMENTO E BACKUP FACIU (PASSO 0) ===")
    print("=" * 70)
    print(f"Versão Ativa Atual : v{curr_ver} ({os.path.basename(active_path)})")
    print(f"Nova Versão Alvo   : v{new_ver} ({new_filename})")
    print(f"Destino de Backup  : backups/{backup_filename}")
    print(f"Modo Dry-Run       : {'SIM (Simulação sem alterações)' if dry_run else 'NÃO (Execução real)'}")
    print("-" * 70)

    # 1. Leitura do arquivo atual
    with open(active_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. Aplicação das substituições de versão
    new_content, changes = apply_version_replacements(content, curr_ver, new_ver)
    print(f"[SUBSTITUIÇÕES] {len(changes)} grupos de identificadores atualizados:")
    for c in changes:
        print(f"  ✓ {c}")

    if dry_run:
        print("\n[DRY-RUN] Simulação concluída com sucesso. Nenhuma alteração foi gravada em disco.")
        return

    # 3. Execução do Backup Atômico
    print(f"\n[PASSO 1/3] Criando cópia de segurança em: backups/{backup_filename}...")
    shutil.copy2(active_path, backup_path)
    if not os.path.exists(backup_path) or os.path.getsize(backup_path) == 0:
        raise IOError(f"Falha ao validar integridade do backup em {backup_path}")
    print(f"  ✓ Backup verificado ({os.path.getsize(backup_path):,} bytes)")

    # 4. Gravação da Nova Versão Sequencial
    print(f"[PASSO 2/3] Gerando novo arquivo na raiz: {new_filename}...")
    temp_new_path = new_path + '.tmp'
    with open(temp_new_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    os.replace(temp_new_path, new_path)
    print(f"  ✓ Novo arquivo criado ({os.path.getsize(new_path):,} bytes)")

    # 5. Limpeza e Higienização da Raiz
    print(f"[PASSO 3/3] Higienizando a raiz (removendo versão anterior da raiz)...")
    if os.path.exists(active_path) and os.path.abspath(active_path) != os.path.abspath(new_path):
        os.remove(active_path)
        print(f"  ✓ Removido da raiz: {os.path.basename(active_path)} (preservado permanentemente em backups/)")

    print("\n" + "=" * 70)
    print(f"SUCESSO: FACIU promovido para v{new_ver} com sucesso!")
    print(f"Arquivo ativo único na raiz: {new_filename}")
    print("=" * 70)

def main():
    parser = argparse.ArgumentParser(description="Automação de versionamento sequencial e backups do FACIU.")
    parser.add_argument('mode', nargs='?', choices=['patch', 'minor', 'major'], default='patch',
                        help="Tipo de incremento SemVer (padrão: patch)")
    parser.add_argument('--to', dest='explicit_target', help="Versão explícita (ex: 7.4.0)")
    parser.add_argument('--dry-run', action='store_true', help="Apenas simula o processo sem alterar o disco")
    args = parser.parse_args()

    try:
        execute_bump(args.mode, args.explicit_target, args.dry_run)
    except Exception as e:
        print(f"\n[ERRO CRÍTICO] {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
