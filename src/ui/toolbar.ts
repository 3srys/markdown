import {
  createIcons,
  FilePlus,
  FolderOpen,
  Download,
  ChevronDown,
  FileDown,
  Code,
  Printer,
  Copy,
  ClipboardCopy,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  HelpCircle,
  Bold,
  Italic,
  Strikethrough,
  Heading,
  Quote,
  Code2,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Table,
  Minus,
  Sigma,
  GitFork,
  BarChart2,
  UploadCloud,
  RotateCcw,
  X,
  Shapes,
} from 'lucide';
import { MarkdownEditor } from '../editor/editor';

export function initializeIcons(): void {
  createIcons({
    icons: {
      FilePlus,
      FolderOpen,
      Download,
      ChevronDown,
      FileDown,
      Code,
      Printer,
      Copy,
      ClipboardCopy,
      Sun,
      Moon,
      Maximize2,
      Minimize2,
      HelpCircle,
      Bold,
      Italic,
      Strikethrough,
      Heading,
      Quote,
      Code2,
      List,
      ListOrdered,
      CheckSquare,
      Link,
      Image,
      Table,
      Minus,
      Sigma,
      GitFork,
      BarChart2,
      UploadCloud,
      RotateCcw,
      X,
      Shapes,
    },
  });
}

export function setupToolbar(editor: MarkdownEditor): void {
  const toolbarButtons = document.querySelectorAll<HTMLButtonElement>('.app-toolbar button[data-format]');

  toolbarButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const format = btn.getAttribute('data-format');
      if (format) {
        editor.applyFormat(format);
      }
    });
  });
}

