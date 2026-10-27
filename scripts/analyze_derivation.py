with open('backups/FACIU-v6.27.0.html', 'r', encoding='utf-8') as f:
    text_270 = f.read()

with open('FACIU-v6.26.0.html', 'r', encoding='utf-8') as f:
    text_260 = f.read()

with open('FACIU-v6.27.1.html', 'r', encoding='utf-8', errors='replace') as f:
    text_271 = f.read()

print("Is 271 derived from 260 or 270?")
print("271 has startScreenMinimalStyles:", "startScreenMinimalStyles" in text_271)
print("270 has startScreenMinimalStyles:", "startScreenMinimalStyles" in text_270)
print("260 has startScreenMinimalStyles:", "startScreenMinimalStyles" in text_260)

# Check what was changed in 271 regarding the changelog items:
# 1. '--text-brand'
print("271 has --text-brand:", "--text-brand" in text_271)
print("270 has --text-brand:", "--text-brand" in text_270)
print("260 has --text-brand:", "--text-brand" in text_260)

# 2. 'configurarIA()' in main topbar
print("271 topbar has configurarIA:", "configurarIA()" in text_271[:120000])

# 3. '62px' height in nav row
print("271 has 62px:", "62px" in text_271[:120000])

# 4. overflow: hidden in faciu-icon-btn
idx_btn_271 = text_271.find('.faciu-icon-btn{')
if idx_btn_271 != -1:
    print("271 icon btn:", text_271[idx_btn_271:idx_btn_271+150])
idx_btn_260 = text_260.find('.faciu-icon-btn{')
if idx_btn_260 != -1:
    print("260 icon btn:", text_260[idx_btn_260:idx_btn_260+150])
