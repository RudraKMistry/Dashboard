import os

def revert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Revert tags
    content = content.replace('<ScrollReveal ', '<div ')
    content = content.replace('</ScrollReveal>', '</div>')
    
    # Revert imports added by script
    content = content.replace("import ScrollReveal from '../../components/ui/ScrollReveal';\n", "")
    content = content.replace("import ScrollReveal from '../components/ui/ScrollReveal';\n", "")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('e:/projects/Dashboard/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            revert_file(os.path.join(root, file))
print('Revert Done!')
