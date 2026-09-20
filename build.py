from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'public'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for pattern in ('*.html','*.js','*.css'):
 for file in root.glob(pattern): shutil.copy2(file,out/file.name)
print('Built public/ with website files only.')
