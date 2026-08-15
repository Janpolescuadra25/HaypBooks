from pathlib import Path
import sys
for path in sys.argv[1:]:
    p = Path(path)
    print('FILE', path)
    lines = p.read_text(encoding='utf-8').splitlines()
    for i in range(len(lines)):
        if 360 <= i+1 <= 410 or 90 <= i+1 <= 150:
            print(f'{i+1}: {lines[i]}')
    print('---')
