// Builds the static design preview: one HTML file with the real screens and the sample-answer mock.
// Output: preview-dist/sous-preview.html. The Next.js app never imports src/preview/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const read = (f) => readFileSync(path.join(root, f), "utf8");

function toScript(file) {
  const out = ts.transpileModule(read(file), {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  }).outputText;
  return out
    .replace(/^"use client";\s*/m, "")
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^import\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^export default /gm, "")
    .replace(/^export /gm, "");
}

const css = read("src/app/globals.css");
const layout = read("src/app/layout.tsx");
const fontHref = layout.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/)[1];

const html = `<title>Sous MVP1 Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<style>
${css}
</style>
<script>try{var t=localStorage.getItem("sous_theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
const { useCallback, useEffect, useRef, useState } = React;
${toScript("src/preview/mock.ts")}
installPreviewMock();
${toScript("src/components/icons.tsx")}
${toScript("src/components/SousApp.tsx")}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(SousApp));
</script>
`;

mkdirSync(path.join(root, "preview-dist"), { recursive: true });
writeFileSync(path.join(root, "preview-dist", "sous-preview.html"), html);
console.log("wrote preview-dist/sous-preview.html", html.length, "bytes");
