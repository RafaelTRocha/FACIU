import os
import glob
import shutil

def backup_current_active():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backups_dir = os.path.join(root, 'backups')
    os.makedirs(backups_dir, exist_ok=True)

    html_files = glob.glob(os.path.join(root, 'FACIU-v*.html'))
    if not html_files:
        print("[BACKUP] Nenhum arquivo FACIU-v*.html encontrado na raiz.")
        return False

    for src in html_files:
        filename = os.path.basename(src)
        dst = os.path.join(backups_dir, filename)
        if os.path.exists(dst):
            print(f"[BACKUP] Ja existe backup para {filename} ({os.path.getsize(dst)} bytes).")
        else:
            shutil.copy2(src, dst)
            print(f"[BACKUP] Cópia de seguranca criada com sucesso: backups/{filename} ({os.path.getsize(dst)} bytes).")
    return True

if __name__ == '__main__':
    backup_current_active()
