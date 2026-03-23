const fs = require('fs');
const files = {
  'src/lib/db.ts': (content) => content.replace('import { AuditRecord, Settings }', 'import type { AuditRecord, Settings }'),
  'src/lib/scoring.ts': (content) => content.replace('import { AuditScores, SectionScores, Verdict }', 'import type { AuditScores, SectionScores, Verdict }'),
  'src/pages/AuditForm.tsx': (content) => {
    let c = content.replace('import { CheckCircle2, XCircle, AlertCircle }', 'import { CheckCircle2, AlertCircle }');
    c = c.replace('import { \n  AuditRecord, AuditScores, AuditComments, Cluster, CallCategory, CoachingPriority, Verdict, PassFail, Score1To5\n}', 'import type { AuditRecord, AuditScores, AuditComments, Cluster, CallCategory, CoachingPriority, SectionScores }');
    // It's on multiple lines
    c = c.replace(/import\s*{\s*AuditRecord,[\s\S]*?}\s*from\s*'\.\.\/types';/, "import type { AuditRecord, AuditScores, AuditComments, Cluster, CallCategory, CoachingPriority, Verdict, PassFail, Score1To5, SectionScores } from '../types';");
    return c;
  },
  'src/pages/AuditTable.tsx': (content) => content.replace("import { AuditRecord } from '../types';", ''),
  'src/pages/Coaching.tsx': (content) => {
     let c = content.replace("import { useState } from 'react';", '');
     c = c.replace("import { Card, Button, cn }", "import { Card, cn }");
     return c;
  },
  'src/pages/dashboards/AgentDashboard.tsx': (content) => {
     let c = content.replace("import { Card, Button, cn }", "import { Card, cn }");
     c = c.replace("import { getVerdictColor, getVerdictHex }", "import { getVerdictColor }");
     return c;
  },
  'src/pages/dashboards/TeamDashboard.tsx': (content) => content.replace("import { format, parseISO, startOfWeek, formatISO }", "import { format, parseISO, startOfWeek }"),
  'src/store/useStore.ts': (content) => content.replace("import { AuditRecord, Settings }", "import type { AuditRecord, Settings }")
};

for (const [file, replacer] of Object.entries(files)) {
  if (fs.existsSync(file)) {
     fs.writeFileSync(file, replacer(fs.readFileSync(file, 'utf8')));
  } else {
     console.log('Not found:', file);
  }
}
