import os, subprocess
proj = r'C:\Users\HomePC\Desktop\Haypbooksv9'
log = os.path.join(proj, 'backend_typecheck_log.txt')
if os.path.exists(log):
    os.remove(log)
backend = os.path.join(proj, 'Haypbooks', 'Backend')
res = subprocess.run(['git', 'add', 'src/users/users.service.ts'], cwd=backend, text=True, capture_output=True)
print('add', res.returncode, res.stdout, res.stderr)
res2 = subprocess.run(['git', 'commit', '-m', 'fix: resolve My Practice list displaying companies instead of practices'], cwd=backend, text=True, capture_output=True)
print('commit', res2.returncode)
print(res2.stdout)
print(res2.stderr)
