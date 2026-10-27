import re

file_path = "/root/FACIU/FACIU-v6.35.3.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Restore original Brava palette values
replacements = [
    (r"navy: '#0f172a'", "navy: '#120e2e'"),
    (r"deep: '#020617'", "deep: '#0b0820'"),
    (r"surface: '#1e293b'", "surface: '#1b1540'"),
    (r"yellow: '#ea580c'", "yellow: '#d4fb21'"),
    (r"lime: '#f97316'", "lime: '#cbf720'"),
    (r"limeHover: '#ea580c'", "limeHover: '#d4fb21'"),
    (r"purple: '#0284c7'", "purple: '#5e3da8'"),
    (r"purpleLight: '#0ea5e9'", "purpleLight: '#7950dc'"),
    (r"purpleSoft: '#f0f9ff'", "purpleSoft: '#f5f0ff'"),
    (r"border: '#334155'", "border: '#2c2260'"),
    (r"navyDark: '#020617'", "navyDark: '#0b0820'"),
    (r"navy2: '#1e293b'", "navy2: '#1b1540'"),
    # Keep line, bg, card, text, muted from the current modernized version? 
    # Actually, the user wants the "Brava logo palette". Let's revert the colors in the CSS too.
]

# Specifically for the CSS :root variables, let's restore them to the original based on the backup
# This is safer than regex replacing everything.
with open("/root/FACIU/FACIU-v6.35.3.html.bkp", "r", encoding="utf-8") as f:
    bkp_text = f.read()

# Extract the CSS :root block from backup
orig_css_root = re.search(r':root\{.*?\n  \}', bkp_text, re.DOTALL).group(0)
# Extract the current CSS :root block
curr_css_root = re.search(r':root\{.*?\n  \}', text, re.DOTALL).group(0)

# Replace back
text = text.replace(curr_css_root, orig_css_root)

# Now update the colors in Tailwind config
for old, new in replacements:
    text = text.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Restored original Brava colors to palette and CSS, maintaining structural modernizations.")
