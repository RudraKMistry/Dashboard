import os
import re

directory = 'e:/projects/Dashboard/src'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.css'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace white transparent backgrounds that are used for hover/items with variable
            new_content = re.sub(r'background:\s*rgba\(255,\s*255,\s*255,\s*0\.0[234]\);', 'background: var(--glass-bg-hover);', content)
            new_content = re.sub(r'background:\s*rgba\(255,\s*255,\s*255,\s*0\.0[56789]\);', 'background: var(--glass-border);', new_content)
            new_content = re.sub(r'border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', 'border: 1px solid var(--glass-border);', new_content)
            
            if content != new_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
