import json
import re
import subprocess
from pathlib import Path
root = Path('Haypbooks/Frontend/src')
changed = subprocess.check_output(['git','diff','--name-only','--', str(root)], shell=False).decode('utf-8').splitlines()
use_re = re.compile(r"(\"use client\"|'use client')")
hook_import_re = re.compile(r"import\s+\{[^}]*\b(useState|useEffect|useReducer|useCallback|useMemo|useRef|useContext|useLayoutEffect|useImperativeHandle|useTransition|useDeferredValue|useId|useSyncExternalStore|useOptimistic|useActionState)\b[^}]*\}")
hook_usage_re = re.compile(r"\b(?:useState|useEffect|useReducer|useCallback|useMemo|useRef|useContext|useLayoutEffect|useImperativeHandle|useTransition|useDeferredValue|useId|useSyncExternalStore|useOptimistic|useActionState)\b")
event_handler_re = re.compile(r"on(?:Click|Change|Submit|MouseEnter|MouseLeave|KeyDown|KeyUp|Focus|Blur|Input|Drag|Drop|TouchStart|TouchEnd|PointerDown|PointerUp|Scroll|Wheel)\s*=")
browser_global_re = re.compile(r"\b(window|document|localStorage|sessionStorage|navigator|location|history)\b")
client_lib_re = re.compile(r"from\s+['\"](?:next/navigation|react-dom|motion/react|react-hot-toast|@headlessui/react|@radix-ui/react|lucide-react|react-router|react-query|swr|zustand|jotai|react-redux)['\"]")
custom_hook_re = re.compile(r"import\s+\{?\s*(use[A-Z][A-Za-z0-9_]*)\s*\}?\s+from\s+['\"][^'\"]*(hooks|hook)[^'\"]*['\"]")
rows=[]
for f in sorted(changed):
    p = Path(f)
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    rows.append({
        'file': f,
        'use_client_count': len(use_re.findall(text)),
        'use_client_added': len([line for line in subprocess.check_output(['git','diff','--', f]).decode('utf-8', errors='ignore').splitlines() if line.startswith('+') and 'use client' in line]),
        'use_client_removed': len([line for line in subprocess.check_output(['git','diff','--', f]).decode('utf-8', errors='ignore').splitlines() if line.startswith('-') and 'use client' in line]),
        'hook_import': bool(hook_import_re.search(text)),
        'hook_usage': bool(hook_usage_re.search(text)),
        'event_handlers': bool(event_handler_re.search(text)),
        'browser_global': bool(browser_global_re.search(text)),
        'client_lib': bool(client_lib_re.search(text)),
        'custom_hook_import': bool(custom_hook_re.search(text)),
        'jsx': bool(re.search(r'<[A-Za-z][^>]*>', text)),
    })
print(json.dumps(rows, indent=2))
