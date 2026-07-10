import os
import re

lib_dir = r"c:\Users\HP\StudioProjects\Memoir FDCUIC\flutter_application_1\lib"

# Matches 'const ' where the line or the widget block contains .w, .h, .sp, .r
# A simpler approach: just remove "const " if the line contains .w, .h, .sp, .r
# But what if the const is on the parent?
# Like:
# const Padding(
#   padding: EdgeInsets.all(10),
#   child: SizedBox(height: 10.h),
# )
# It's better to just regex remove ALL "const " in front of typical UI widgets and collections, or we can just remove `const ` everywhere in files that have errors, then run `dart fix --apply` to add them back where safe.

# Wait, `dart fix --apply` can automatically remove invalid `const`? No, dart fix doesn't remove invalid const, it adds missing ones.

# Let's remove 'const ' from:
# const SizedBox
# const Text
# const Padding
# const EdgeInsets
# const BorderRadius
# const Center
# const Row
# const Column
# const Icon
# const Divider
# const Spacer
# const BoxDecoration
# const Align
# const Expanded

widgets_to_unconst = [
    r'const\s+SizedBox',
    r'const\s+Text\(',
    r'const\s+Padding',
    r'const\s+EdgeInsets',
    r'const\s+BorderRadius',
    r'const\s+Center',
    r'const\s+Row',
    r'const\s+Column',
    r'const\s+Icon',
    r'const\s+Divider',
    r'const\s+Spacer',
    r'const\s+BoxDecoration',
    r'const\s+Align',
    r'const\s+Expanded',
    r'const\s+Positioned',
    r'const\s+CircleAvatar',
    r'const\s+Container',
    r'const\s+Stack',
    r'const\s+FDText',
    r'const\s+\[', # const list
]

files_changed = 0

for root, _, files in os.walk(lib_dir):
    for file in files:
        if file.endswith('.dart'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig_content = content
            
            for pat in widgets_to_unconst:
                # Replace 'const Widget' with 'Widget'
                # e.g. const SizedBox -> SizedBox
                replacement = pat.replace(r'\s+', ' ').replace('const ', '').replace(r'\(', '(').replace(r'\[', '[')
                content = re.sub(pat, replacement, content)
            
            if content != orig_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_changed += 1

print(f"Removed const in {files_changed} files.")
