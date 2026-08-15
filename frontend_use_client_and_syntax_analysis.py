import re
import subprocess
from pathlib import Path
root = Path('Haypbooks/Frontend/src')
changed = subprocess.check_output(['git','diff','--name-only','--', str(root)], shell=False).decode('utf-8').splitlines()
use_re = re.compile(r"(\"use client\"|'use client')")
for f in sorted(changed):
    p = Path(f)
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    lines = text.splitlines()
    indices = [i+1 for i, line in enumerate(lines) if use_re.search(line)]
    diff = subprocess.check_output(['git','diff','--', f], shell=False).decode('utf-8', errors='ignore').splitlines()
    added = [line for line in diff if line.startswith('+') and 'use client' in line]
    removed = [line for line in diff if line.startswith('-') and 'use client' in line]
    if len(indices) > 1 or len(added) > 0:
        print('FILE:', f)
        print('  current use client count=', len(indices), 'indices=', indices)
        print('  added use client lines=', len(added), 'removed=', len(removed))
        print('  added lines:')
        for line in added:
            print('   ', line)
        print('  removed lines:')
        for line in removed:
            print('   ', line)
        print('-' * 60)
