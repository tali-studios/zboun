const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/components/crm-panel.tsx",
  "src/components/cloud-kitchen-ops-panel.tsx",
  "src/components/events-panel.tsx",
  "src/components/accounting-panel.tsx",
  "src/components/fleet-panel.tsx",
  "src/components/pms-panel.tsx",
  "src/components/club-panel.tsx",
  "src/components/gym-ops-panel.tsx",
  "src/components/loyalty-panel.tsx",
  "src/components/retail-ops-panel.tsx",
  "src/components/pos-panel.tsx",
  "src/components/ecommerce-panel.tsx",
  "app/dashboard/business/accounting/receipts/page.tsx",
  "app/dashboard/business/accounting/receipts/[kind]/[id]/page.tsx",
  "app/for-restaurants/page.tsx",
  "app/dashboard/business/pos/receipts/page.tsx",
  "app/dashboard/business/pos/receipts/[id]/page.tsx"
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Replace <a href="/..."> with <Link href="/...">
  const aTagRegex = /<a(\s+[^>]*?)href="(\/[^"]*)"([^>]*?)>/g;
  if (aTagRegex.test(content)) {
    content = content.replace(aTagRegex, '<Link$1href="$2"$3>');
    // Replace </a> with </Link> but only if we replaced <a href="/...">
    // A simple way is to replace </a> with </Link> if we know they match.
    // Since we can't easily match closing tags with regex perfectly, we'll just replace </a> that correspond to the Links.
    // Actually, a safer way:
    content = content.replace(/<\/a>/g, '</Link>'); // This might replace external links too if they exist in the same file. Let's check.
    changed = true;
  }

  if (changed) {
    // Add import Link from "next/link"; if not present
    if (!content.includes('import Link from "next/link"')) {
      // Find the last import statement or the beginning of the file
      const importMatches = [...content.matchAll(/^import .*?;/gm)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const insertIndex = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertIndex) + '\nimport Link from "next/link";' + content.slice(insertIndex);
      } else {
        content = 'import Link from "next/link";\n' + content;
      }
    }
    
    // Fix any external links that got their closing tag replaced
    // E.g. <a href="http...">...</a> -> <a href="http...">...</Link>
    content = content.replace(/(<a\s+[^>]*?href="http[^"]*"[^>]*?>.*?)<\/Link>/gs, '$1</a>');
    content = content.replace(/(<a\s+[^>]*?href="mailto:[^"]*"[^>]*?>.*?)<\/Link>/gs, '$1</a>');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${relPath}`);
  }
}
