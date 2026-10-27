import os
import shutil

print("=== INICIANDO ORGANIZAÇÃO E LIMPEZA DO WORKSPACE ===\n")

# 1. Garantir que as 5 últimas versões estáveis residam na raiz
print("[1/4] Organizando as 5 últimas versões estáveis na raiz...")
v5_target = 'FACIU-v6.33.2.html'
v5_backup = os.path.join('backups', v5_target)

if not os.path.exists(v5_target) and os.path.exists(v5_backup):
    shutil.copy2(v5_backup, v5_target)
    print(f"  -> {v5_target} restaurado para a raiz a partir de backups/.")
else:
    print(f"  -> {v5_target} já presente na raiz.")

expected_5_versions = [
    'FACIU-v6.34.3.html',
    'FACIU-v6.34.2.html',
    'FACIU-v6.34.1.html',
    'FACIU-v6.34.0.html',
    'FACIU-v6.33.2.html'
]

for v in expected_5_versions:
    assert os.path.exists(v), f"Erro: {v} ausente na raiz!"
    assert os.path.exists(os.path.join('backups', v)), f"Erro: {v} ausente em backups/!"
    print(f"  [OK] {v} presente na raiz e preservado em backups/.")

# 2. Mover screenshots (.png) da raiz para tests-e2e/screenshots/
print("\n[2/4] Organizando capturas de tela (.png) em tests-e2e/screenshots/...")
screenshots_dir = os.path.join('tests-e2e', 'screenshots')
os.makedirs(screenshots_dir, exist_ok=True)

png_files = [f for f in os.listdir('.') if f.endswith('.png') and os.path.isfile(f)]
for png in png_files:
    src = png
    dst = os.path.join(screenshots_dir, png)
    shutil.move(src, dst)
    print(f"  -> Movido: {png} -> {dst}")

print(f"  [OK] Total de {len(png_files)} capturas de tela organizadas em {screenshots_dir}.")

# 3. Mover scripts de inspeção úteis de jsdom_test/ para scripts/ e descartar scratch files
print("\n[3/4] Organizando scripts de jsdom_test/...")
inspect_scripts = [
    'capture_faciu.js',
    'capture_screens.js',
    'capture_responsive.js',
    'inspect_proto.js',
    'debug_why_chain.js',
    'audit_full_flow.js',
    'test_layout.js'
]

for s in inspect_scripts:
    src = os.path.join('jsdom_test', s)
    dst = os.path.join('scripts', s)
    if os.path.exists(src):
        shutil.move(src, dst)
        print(f"  -> Arquivado: {src} -> {dst}")

scratch_files = [
    os.path.join('jsdom_test', 'find_start.py'),
    os.path.join('jsdom_test', 'find_start2.py')
]

for sf in scratch_files:
    if os.path.exists(sf):
        os.remove(sf)
        print(f"  -> Limpo scratch descartável: {sf}")

# 4. Limpeza de cache de compilador Python (__pycache__)
print("\n[4/4] Limpando diretórios de cache temporário (__pycache__)...")
pycache_dir = os.path.join('scripts', '__pycache__')
if os.path.exists(pycache_dir):
    shutil.rmtree(pycache_dir)
    print(f"  -> Removido: {pycache_dir}")

print("\n=== ORGANIZAÇÃO E LIMPEZA CONCLUÍDAS COM SUCESSO! ===")
