import os
import re

lib_dir = r"c:\Users\HP\StudioProjects\Memoir FDCUIC\flutter_application_1\lib"

# Regex patterns
# Match SizedBox(height: X) or SizedBox(width: X)
sized_box_h = re.compile(r'SizedBox\s*\(\s*height\s*:\s*(\d+(?:\.\d+)?)\s*\)')
sized_box_w = re.compile(r'SizedBox\s*\(\s*width\s*:\s*(\d+(?:\.\d+)?)\s*\)')

# Match fontSize: X
font_size = re.compile(r'fontSize\s*:\s*(\d+(?:\.\d+)?)(?![\.a-zA-Z])')

# Match width: X (only if > 5 to avoid borders)
def width_repl(m):
    val_str = m.group(1)
    val = float(val_str)
    if val > 5:
        return f'width: {val_str}.w'
    return m.group(0)

# Match height: X (only if > 5)
def height_repl(m):
    val_str = m.group(1)
    val = float(val_str)
    if val > 5:
        return f'height: {val_str}.h'
    return m.group(0)

width_re = re.compile(r'width\s*:\s*(\d+(?:\.\d+)?)(?![\.a-zA-Z])')
height_re = re.compile(r'height\s*:\s*(\d+(?:\.\d+)?)(?![\.a-zA-Z])')


files_changed = 0

for root, _, files in os.walk(lib_dir):
    for file in files:
        if file.endswith('.dart'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig_content = content
            
            # Apply replacements
            content = sized_box_h.sub(r'SizedBox(height: \1.h)', content)
            content = sized_box_w.sub(r'SizedBox(width: \1.w)', content)
            content = font_size.sub(r'fontSize: \1.sp', content)
            content = width_re.sub(width_repl, content)
            content = height_re.sub(height_repl, content)
            
            if content != orig_content:
                # Add import if not present
                if 'flutter_screenutil/flutter_screenutil.dart' not in content:
                    # Find first import
                    import_idx = content.find('import')
                    if import_idx != -1:
                        content = content[:import_idx] + "import 'package:flutter_screenutil/flutter_screenutil.dart';\n" + content[import_idx:]
                    else:
                        content = "import 'package:flutter_screenutil/flutter_screenutil.dart';\n" + content
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_changed += 1

print(f"Refactored {files_changed} files.")
