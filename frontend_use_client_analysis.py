import re
from pathlib import Path
import subprocess
root = Path('Haypbooks/Frontend/src')
files = subprocess.check_output(['git','diff','--name-only','--'] + [str(root)], shell=False).decode('utf-8').splitlines()
info=[]
for f in sorted(files):
    p = Path(f)
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    use_client_count = text.count("'use client'") + text.count('"use client"')
    hook_import = bool(re.search(r"import\s+\{[^}]*\b(useState|useEffect|useReducer|useCallback|useMemo|useRef|useContext|useLayoutEffect|useImperativeHandle|useTransition|useDeferredValue|useId|useSyncExternalStore|useOptimistic|useActionState)\b", text))
    hook_usage = bool(re.search(r"\b(useState|useEffect|useReducer|useCallback|useMemo|useRef|useContext|useLayoutEffect|useImperativeHandle|useTransition|useDeferredValue|useId|useSyncExternalStore|useOptimistic|useActionState)\b", text))
    event_handlers = bool(re.search(r"on(?:Click|Change|Submit|MouseEnter|MouseLeave|KeyDown|KeyUp|Focus|Blur|Input|Drag|Drop|TouchStart|TouchEnd|PointerDown|PointerUp|Scroll|Wheel)\s*=", text))
    browser_global = bool(re.search(r"\b(window|document|localStorage|sessionStorage|navigator|location|history)\b", text))
    custom_hook_import = bool(re.search(r"import\s+\{?\s*([A-Za-z0-9_]+)\s*\}?\s+from\s+['\"].*?/hooks/.*['\"]", text)) or bool(re.search(r"import\s+\{?\s*(use[A-Z][A-Za-z0-9_]*)\s*\}?\s+from\s+['\"].*['\"]", text))
    client_lib = bool(re.search(r"from\s+['\"](next/navigation|react-dom|motion/react|react-hot-toast|@headlessui/react|@radix-ui/react|lucide-react)['\"]", text))
    jsx = bool(re.search(r"<[^>]+>.*</|<.*?>", text))
    info.append((f, use_client_count, hook_import, hook_usage, event_handlers, browser_global, custom_hook_import, client_lib, jsx))
for row in info:
    print('\t'.join(map(str, row)))
