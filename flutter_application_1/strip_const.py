import os
import re

lib_dir = r"c:\Users\HP\StudioProjects\Memoir FDCUIC\flutter_application_1\lib"

patterns = [
    r'const\s+TextStyle',
    r'const\s+EdgeInsets',
    r'const\s+SizedBox',
    r'const\s+Padding',
    r'const\s+Icon',
    r'const\s+Text\(',
    r'const\s+Center',
    r'const\s+Align',
    r'const\s+Positioned',
    r'const\s+Column',
    r'const\s+Row',
    r'const\s+Expanded',
    r'const\s+Container',
    r'const\s+Divider',
    r'const\s+BorderRadius',
    r'const\s+BoxDecoration',
]

for root, _, files in os.walk(lib_dir):
    for file in files:
        if file.endswith('.dart'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig = content
            for p in patterns:
                repl = p.replace(r'\s+', ' ').replace('const ', '').replace(r'\(', '(')
                content = re.sub(p, repl, content)
            
            if content != orig:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
