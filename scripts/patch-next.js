const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'lib', 'recursive-delete.js');

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf-8');
  if (content.includes('const linkPath = await _fs.promises.readlink(absolutePath);') && !content.includes('try {\n            const linkPath = await _fs.promises.readlink(absolutePath);')) {
    content = content.replace(
      /if \(isSymlink\) \{\s*const linkPath = await _fs\.promises\.readlink\(absolutePath\);/g,
      `if (isSymlink) {\n            try {\n                const linkPath = await _fs.promises.readlink(absolutePath);`
    );
    fs.writeFileSync(target, content, 'utf-8');
    console.log('[patch-next] Successfully applied Windows OneDrive readlink patch to Next.js');
  }
}

