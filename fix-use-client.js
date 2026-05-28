const fs = require('fs');
const files = [
  'src/components/crm-panel.tsx',
  'src/components/cloud-kitchen-ops-panel.tsx',
  'src/components/events-panel.tsx',
  'src/components/accounting-panel.tsx',
  'src/components/fleet-panel.tsx',
  'src/components/pms-panel.tsx',
  'src/components/club-panel.tsx',
  'src/components/gym-ops-panel.tsx',
  'src/components/loyalty-panel.tsx',
  'src/components/retail-ops-panel.tsx',
  'src/components/pos-panel.tsx',
  'src/components/ecommerce-panel.tsx',
  'app/dashboard/business/accounting/receipts/page.tsx',
  'app/dashboard/business/accounting/receipts/[kind]/[id]/page.tsx',
  'app/for-restaurants/page.tsx',
  'app/dashboard/business/pos/receipts/page.tsx',
  'app/dashboard/business/pos/receipts/[id]/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix 'use client' issue
  if (content.includes('"use client"') && content.indexOf('import Link') < content.indexOf('"use client"')) {
    content = content.replace('import Link from "next/link";\n', '');
    content = content.replace('"use client";', '"use client";\nimport Link from "next/link";');
  }

  fs.writeFileSync(file, content, 'utf8');
}
