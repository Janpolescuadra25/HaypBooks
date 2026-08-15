import subprocess
import pathlib
import re
root = pathlib.Path('Haypbooks/Frontend/src')
files = subprocess.check_output(['git','diff','--name-only','--'] + [str(root)], shell=False).decode('utf-8').splitlines()
use_re = re.compile(r"use client")
print('file,count,added,removed')
for f in sorted(files):
    path = pathlib.Path(f)
    if not path.exists():
        continue
    text = path.read_text(encoding='utf-8')
    count = len(use_re.findall(text))
    diff = subprocess.check_output(['git','diff','--', f], shell=False).decode('utf-8', errors='ignore').splitlines()
    added = [line for line in diff if line.startswith('+') and "use client" in line]
    removed = [line for line in diff if line.startswith('-') and "use client" in line]
    print(f'{f},{count},{len(added)},{len(removed)}')
