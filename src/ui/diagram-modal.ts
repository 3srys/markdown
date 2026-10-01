import { MarkdownEditor } from '../editor/editor';

interface DiagramTemplate {
  name: string;
  preview: string; // SVG or HTML string for preview
  code: string;
}

interface DiagramCategory {
  id: string;
  name: string;
  templates: DiagramTemplate[];
}

const MERMAID_FLOW_SVG = `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <rect x="10" y="30" width="40" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="30" y="45" text-anchor="middle" font-size="9" fill="currentColor">Start</text>
  <line x1="50" y1="41" x2="70" y2="41" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>
  <polygon points="70,35 85,41 70,47" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="85" y1="41" x2="110" y2="28" stroke="currentColor" stroke-width="1.2" marker-end="url(#arr)"/>
  <line x1="85" y1="41" x2="110" y2="58" stroke="currentColor" stroke-width="1.2" marker-end="url(#arr)"/>
  <rect x="110" y="18" width="38" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="129" y="32" text-anchor="middle" font-size="8" fill="currentColor">Yes</text>
  <rect x="110" y="48" width="38" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="129" y="62" text-anchor="middle" font-size="8" fill="currentColor">No</text>
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs>
</svg>`;

const SEQUENCE_SVG = `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <rect x="10" y="5" width="40" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="30" y="18" text-anchor="middle" font-size="9" fill="currentColor">Alice</text>
  <rect x="110" y="5" width="40" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="130" y="18" text-anchor="middle" font-size="9" fill="currentColor">Bob</text>
  <line x1="30" y1="23" x2="30" y2="85" stroke="currentColor" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="130" y1="23" x2="130" y2="85" stroke="currentColor" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="30" y1="36" x2="125" y2="36" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="80" y="32" text-anchor="middle" font-size="7" fill="currentColor">Hello!</text>
  <line x1="130" y1="55" x2="35" y2="55" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr2)"/>
  <text x="80" y="51" text-anchor="middle" font-size="7" fill="currentColor">Hi there!</text>
  <defs><marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs>
</svg>`;

const GANTT_SVG = `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <text x="10" y="18" font-size="8" font-weight="bold" fill="currentColor">Gantt Chart</text>
  <rect x="50" y="26" width="60" height="12" rx="3" fill="currentColor" opacity="0.7"/>
  <text x="8" y="36" font-size="7" fill="currentColor">Task A</text>
  <rect x="50" y="44" width="40" height="12" rx="3" fill="currentColor" opacity="0.5"/>
  <text x="8" y="54" font-size="7" fill="currentColor">Task B</text>
  <rect x="90" y="62" width="55" height="12" rx="3" fill="currentColor" opacity="0.35"/>
  <text x="8" y="72" font-size="7" fill="currentColor">Task C</text>
</svg>`;

const CLASS_SVG = `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <rect x="15" y="8" width="55" height="35" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="15" y1="20" x2="70" y2="20" stroke="currentColor" stroke-width="1"/>
  <text x="42" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">Animal</text>
  <text x="20" y="30" font-size="6.5" fill="currentColor">+age: int</text>
  <text x="20" y="39" font-size="6.5" fill="currentColor">+sound()</text>
  <rect x="90" y="8" width="55" height="35" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="90" y1="20" x2="145" y2="20" stroke="currentColor" stroke-width="1"/>
  <text x="118" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">Dog</text>
  <text x="95" y="30" font-size="6.5" fill="currentColor">+bark()</text>
  <line x1="90" y1="25" x2="70" y2="25" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="70,25 77,21 77,29" fill="none" stroke="currentColor" stroke-width="1.2"/>
</svg>`;

const USECASE_SVG = `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <circle cx="25" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="25" y1="38" x2="25" y2="58" stroke="currentColor" stroke-width="1.5"/>
  <line x1="15" y1="48" x2="35" y2="48" stroke="currentColor" stroke-width="1.5"/>
  <line x1="25" y1="58" x2="15" y2="72" stroke="currentColor" stroke-width="1.5"/>
  <line x1="25" y1="58" x2="35" y2="72" stroke="currentColor" stroke-width="1.5"/>
  <text x="25" y="82" text-anchor="middle" font-size="7" fill="currentColor">User</text>
  <rect x="55" y="10" width="95" height="75" rx="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3"/>
  <ellipse cx="103" cy="35" rx="28" ry="12" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="103" y="38" text-anchor="middle" font-size="7.5" fill="currentColor">Login</text>
  <ellipse cx="103" cy="65" rx="28" ry="12" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="103" y="68" text-anchor="middle" font-size="7.5" fill="currentColor">Register</text>
  <line x1="35" y1="38" x2="75" y2="35" stroke="currentColor" stroke-width="1"/>
  <line x1="35" y1="48" x2="75" y2="65" stroke="currentColor" stroke-width="1"/>
</svg>`;

const ABC_SVG = `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <text x="80" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">♩ C Major Scale ♩</text>
  <line x1="10" y1="30" x2="150" y2="30" stroke="currentColor" stroke-width="0.8"/>
  <line x1="10" y1="38" x2="150" y2="38" stroke="currentColor" stroke-width="0.8"/>
  <line x1="10" y1="46" x2="150" y2="46" stroke="currentColor" stroke-width="0.8"/>
  <line x1="10" y1="54" x2="150" y2="54" stroke="currentColor" stroke-width="0.8"/>
  <line x1="10" y1="62" x2="150" y2="62" stroke="currentColor" stroke-width="0.8"/>
  <ellipse cx="25" cy="63" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="42" cy="59" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="59" cy="55" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="76" cy="51" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="93" cy="47" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="110" cy="43" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="127" cy="39" rx="5" ry="4" fill="currentColor"/>
  <ellipse cx="144" cy="35" rx="5" ry="4" fill="currentColor"/>
</svg>`;

const BAR_CHART_SVG = `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <line x1="15" y1="10" x2="15" y2="68" stroke="currentColor" stroke-width="1.5"/>
  <line x1="15" y1="68" x2="155" y2="68" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="28" width="22" height="40" rx="2" fill="currentColor" opacity="0.8"/>
  <rect x="57" y="18" width="22" height="50" rx="2" fill="currentColor" opacity="0.65"/>
  <rect x="89" y="44" width="22" height="24" rx="2" fill="currentColor" opacity="0.5"/>
  <rect x="121" y="36" width="22" height="32" rx="2" fill="currentColor" opacity="0.35"/>
</svg>`;

const PIE_CHART_SVG = `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <path d="M75,45 L75,10 A35,35 0 0,1 105,73 Z" fill="currentColor" opacity="0.8"/>
  <path d="M75,45 L105,73 A35,35 0 0,1 45,73 Z" fill="currentColor" opacity="0.5"/>
  <path d="M75,45 L45,73 A35,35 0 0,1 75,10 Z" fill="currentColor" opacity="0.3"/>
  <rect x="115" y="20" width="10" height="8" fill="currentColor" opacity="0.8"/>
  <text x="129" y="28" font-size="7" fill="currentColor">Desktop</text>
  <rect x="115" y="34" width="10" height="8" fill="currentColor" opacity="0.5"/>
  <text x="129" y="42" font-size="7" fill="currentColor">Mobile</text>
  <rect x="115" y="48" width="10" height="8" fill="currentColor" opacity="0.3"/>
  <text x="129" y="56" font-size="7" fill="currentColor">Tablet</text>
</svg>`;

const diagramCategories: DiagramCategory[] = [
  {
    id: 'mermaid',
    name: 'Mermaid',
    templates: [
      {
        name: 'Flowchart',
        preview: MERMAID_FLOW_SVG,
        code: '```mermaid\ngraph TD\n    A[Start] --> B{Is it working?}\n    B -- Yes --> C[Great!]\n    B -- No --> D[Debug]\n    D --> B\n```',
      },
      {
        name: 'Sequence Diagram',
        preview: SEQUENCE_SVG,
        code: '```mermaid\nsequenceDiagram\n    Alice->>+Bob: Hello Bob!\n    Bob-->>-Alice: Hi Alice!\n```',
      },
      {
        name: 'Gantt Chart',
        preview: GANTT_SVG,
        code: '```mermaid\ngantt\n    title Project Timeline\n    dateFormat  YYYY-MM-DD\n    section Phase 1\n    Task A :a1, 2024-01-01, 20d\n    Task B :after a1, 15d\n    section Phase 2\n    Task C :2024-02-05, 25d\n```',
      },
    ],
  },
  {
    id: 'plantuml',
    name: 'PlantUML',
    templates: [
      {
        name: 'Class Diagram',
        preview: CLASS_SVG,
        code: '```plantuml\n@startuml\nclass Animal {\n  +int age\n  +void makeSound()\n}\nclass Dog {\n  +void bark()\n}\nAnimal <|-- Dog\n@enduml\n```',
      },
      {
        name: 'Use Case',
        preview: USECASE_SVG,
        code: '```plantuml\n@startuml\nleft to right direction\nactor User\nrectangle System {\n  User -- (Login)\n  User -- (Register)\n}\n@enduml\n```',
      },
    ],
  },
  {
    id: 'music',
    name: 'Music (ABC)',
    templates: [
      {
        name: 'C Major Scale',
        preview: ABC_SVG,
        code: '```abc\nX: 1\nT: C Major Scale\nM: 4/4\nL: 1/4\nK: C\nC D E F | G A B c |\n```',
      },
    ],
  },
  {
    id: 'charts',
    name: 'Chart.js',
    templates: [
      {
        name: 'Bar Chart',
        preview: BAR_CHART_SVG,
        code: '```chart\n{\n  "type": "bar",\n  "data": {\n    "labels": ["Red", "Blue", "Yellow", "Green"],\n    "datasets": [{\n      "label": "# of Votes",\n      "data": [12, 19, 3, 5],\n      "backgroundColor": ["rgba(239,68,68,0.7)","rgba(59,130,246,0.7)","rgba(234,179,8,0.7)","rgba(34,197,94,0.7)"]\n    }]\n  }\n}\n```',
      },
      {
        name: 'Pie Chart',
        preview: PIE_CHART_SVG,
        code: '```chart\n{\n  "type": "pie",\n  "data": {\n    "labels": ["Desktop", "Mobile", "Tablet"],\n    "datasets": [{\n      "data": [60, 30, 10],\n      "backgroundColor": ["rgba(56,189,248,0.8)","rgba(167,139,250,0.8)","rgba(52,211,153,0.8)"]\n    }]\n  }\n}\n```',
      },
    ],
  },
];

export function setupDiagramModal(editor: MarkdownEditor): void {
  const modal = document.getElementById('diagram-modal');
  const btnOpen = document.getElementById('btn-diagram-modal');
  const btnClose = document.getElementById('btn-close-diagram-modal');
  const navContainer = document.getElementById('diagram-nav');
  const gridContainer = document.getElementById('diagram-grid');

  if (!modal || !btnOpen || !btnClose || !navContainer || !gridContainer) {
    console.warn('[DiagramModal] Missing DOM elements, skipping setup');
    return;
  }

  let activeCategory = diagramCategories[0].id;

  const closeModal = () => modal.classList.remove('open');

  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('open');
    renderNav();
    renderCategory(activeCategory);
  });

  btnClose.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  function renderNav() {
    navContainer!.innerHTML = '';
    diagramCategories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'diagram-nav-btn' + (cat.id === activeCategory ? ' active' : '');
      btn.textContent = cat.name;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        activeCategory = cat.id;
        navContainer!.querySelectorAll('.diagram-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCategory(cat.id);
      });
      navContainer!.appendChild(btn);
    });
  }

  function renderCategory(categoryId: string) {
    const category = diagramCategories.find(c => c.id === categoryId);
    if (!category || !gridContainer) return;

    gridContainer.innerHTML = '';

    category.templates.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'diagram-template-card';

      const previewEl = document.createElement('div');
      previewEl.className = 'diagram-preview-mockup';
      previewEl.innerHTML = tpl.preview;

      const titleEl = document.createElement('div');
      titleEl.className = 'diagram-template-title';
      titleEl.textContent = tpl.name;

      const insertBtn = document.createElement('button');
      insertBtn.className = 'btn-insert-diagram';
      insertBtn.textContent = 'Insert';
      insertBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.insertRaw(tpl.code);
        closeModal();
      });

      card.appendChild(previewEl);
      card.appendChild(titleEl);
      card.appendChild(insertBtn);
      gridContainer.appendChild(card);
    });
  }
}
