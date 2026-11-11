const fs = require('fs');
const path = require('path');

// Only run on Windows (to handle OneDrive reparse points). Never run on Linux / Vercel.
if (process.platform !== 'win32') {
  process.exit(0);
}

const target = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'lib', 'recursive-delete.js');

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf-8');
  if (
    content.includes('const linkPath = await _fs.promises.readlink(absolutePath);') &&
    !content.includes('try {')
  ) {
    const unpatched = `if (isSymlink) {
        const linkPath = await _fs.promises.readlink(absolutePath);
        const stats = await _fs.promises.stat((0, _path.isAbsolute)(linkPath) ? linkPath : (0, _path.join)((0, _path.dirname)(absolutePath), linkPath));
        isDirectory = stats.isDirectory();
    }`;

    const patched = `if (isSymlink) {
        try {
            const linkPath = await _fs.promises.readlink(absolutePath);
            const stats = await _fs.promises.stat((0, _path.isAbsolute)(linkPath) ? linkPath : (0, _path.join)((0, _path.dirname)(absolutePath), linkPath));
            isDirectory = stats.isDirectory();
        } catch {}
    }`;

    if (content.includes(unpatched)) {
      content = content.replace(unpatched, patched);
      fs.writeFileSync(target, content, 'utf-8');
      console.log('[patch-next] Applied Windows OneDrive readlink patch.');
    }
  }
}
