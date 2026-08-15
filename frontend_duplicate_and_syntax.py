from pathlib import Path
import subprocess
root = Path('Haypbooks/Frontend/src')
changed = subprocess.check_output(['git', 'diff', '--name-only', '--', str(root)], shell=False).decode('utf-8').splitlines()
print('duplicates:')
for f in sorted(changed):
    p = Path(f)
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    count = text.count("'use client'") + text.count('"use client"')
    if count > 1:
        print(f, count)
print('--- syntax files ---')
for f in [
    'Haypbooks/Frontend/src/app/(owner)/reporting/analytics/analytics-dashboards/page.tsx',
    'Haypbooks/Frontend/src/app/(owner)/reporting/custom-reports/report-builder/page.tsx',
    'Haypbooks/Frontend/src/components/accounting/JournalAuditLog.tsx',
]:
    p = Path(f)
    print('FILE', f)
    if not p.exists():
        print('MISSING')
        continue
    lines = p.read_text(encoding='utf-8').splitlines()
    start = max(0, 133)
    end = min(len(lines), 157)
    for i in range(start, end):
        print(f'{i+1}: {lines[i]}')
    print('---')
