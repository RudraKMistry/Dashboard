import re

with open('e:/projects/Dashboard/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The `:root` block starts at line 9.
# The custom overrides start at `/* ── Light Theme Overrides ────────────────── */` (around line 65)
# and end at `html.theme-light.glass-heavy { ... }` (around line 157).
# Wait, I can just find the start and end of these overrides.

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '/* ── Light Theme Overrides ────────────────── */' in line:
        start_idx = i
    if 'html.theme-light.glass-heavy {' in line:
        # Find the closing brace for this block
        for j in range(i, len(lines)):
            if lines[j].strip() == '}':
                end_idx = j
                break

if start_idx != -1 and end_idx != -1:
    overrides = lines[start_idx:end_idx+1]
    # Delete from original place
    del lines[start_idx:end_idx+1]
    
    # Now find where `:root` ends.
    # It ends with `  --z-toast: 300;\n}`
    root_end_idx = -1
    for i, line in enumerate(lines):
        if '--z-toast: 300;' in line:
            for j in range(i, len(lines)):
                if lines[j].strip() == '}':
                    root_end_idx = j
                    break
            break
            
    if root_end_idx != -1:
        # Insert overrides after root ends
        lines.insert(root_end_idx + 1, '\n' + ''.join(overrides) + '\n')
        
    with open('e:/projects/Dashboard/src/index.css', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully moved overrides outside :root")
else:
    print(f"Could not find start or end. Start: {start_idx}, End: {end_idx}")
