<template>
  <div class="prose prose-sm max-w-none space-y-4">
    <div v-for="(block, idx) in parseContent(content)" :key="idx">
      <!-- Code blocks -->
      <pre v-if="block.type === 'code'" class="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm">
        <code class="text-slate-100">{{ block.value }}</code>
      </pre>

      <!-- Headings -->
      <h1 v-else-if="block.type === 'h1'" class="mt-6 text-3xl font-bold text-slate-900">
        {{ block.value }}
      </h1>
      <h2 v-else-if="block.type === 'h2'" class="mt-5 text-2xl font-bold text-slate-800">
        {{ block.value }}
      </h2>
      <h3 v-else-if="block.type === 'h3'" class="mt-4 text-xl font-semibold text-slate-800">
        {{ block.value }}
      </h3>

      <!-- Lists -->
      <ul v-else-if="block.type === 'ul'" class="list-inside list-disc space-y-2 text-slate-700">
        <li v-for="(item, i) in block.value" :key="i" class="ml-2">{{ item }}</li>
      </ul>
      <ol v-else-if="block.type === 'ol'" class="list-inside list-decimal space-y-2 text-slate-700">
        <li v-for="(item, i) in block.value" :key="i" class="ml-2">{{ item }}</li>
      </ol>

      <!-- Blockquotes -->
      <blockquote v-else-if="block.type === 'blockquote'" class="border-l-4 border-slate-300 bg-slate-50 px-4 py-2 italic text-slate-700">
        {{ block.value }}
      </blockquote>

      <!-- Inline code -->
      <p v-else-if="block.type === 'text'" class="whitespace-pre-wrap text-slate-700 leading-relaxed">
        <span v-for="(segment, i) in block.value" :key="i">
          <code v-if="segment.type === 'inline-code'" class="rounded bg-slate-200 px-2 py-0.5 font-mono text-sm text-slate-900">{{ segment.text }}</code>
          <strong v-else-if="segment.type === 'bold'" class="font-semibold text-slate-900">{{ segment.text }}</strong>
          <em v-else-if="segment.type === 'italic'" class="italic text-slate-800">{{ segment.text }}</em>
          <span v-else>{{ segment.text }}</span>
        </span>
      </p>

      <!-- Plain paragraphs -->
      <p v-else class="text-slate-700 leading-relaxed">{{ block.value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    required: true,
  },
});

const parseContent = (text) => {
  if (!text) return [];

  const blocks = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks (```language\ncode\n```)
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (codeLines.length > 0) {
        blocks.push({ type: 'code', value: codeLines.join('\n').trim() });
      }
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push({ type: `h${level}`, value: headingMatch[2] });
      i++;
      continue;
    }

    // Blockquotes
    if (line.trim().startsWith('>')) {
      blocks.push({ type: 'blockquote', value: line.replace(/^>\s*/, '') });
      i++;
      continue;
    }

    // Unordered lists
    if (line.trim().match(/^[-*+]\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^[-*+]\s+/)) {
        listItems.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', value: listItems });
      continue;
    }

    // Ordered lists
    if (line.trim().match(/^\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', value: listItems });
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Parse inline formatting in regular text
    const segments = parseInlineFormatting(line);
    if (segments.length > 0) {
      blocks.push({ type: 'text', value: segments });
    }

    i++;
  }

  return blocks;
};

const parseInlineFormatting = (text) => {
  const segments = [];
  let remaining = text;
  let pos = 0;

  while (remaining.length > 0) {
    // Inline code `code`
    const inlineCodeMatch = remaining.match(/`([^`]+)`/);
    if (inlineCodeMatch && inlineCodeMatch.index === 0) {
      segments.push({ type: 'inline-code', text: inlineCodeMatch[1] });
      remaining = remaining.slice(inlineCodeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index === 0) {
      segments.push({ type: 'bold', text: boldMatch[1] });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *text* or _text_
    const italicMatch = remaining.match(/[*_]([^*_]+)[*_]/);
    if (italicMatch && italicMatch.index === 0) {
      segments.push({ type: 'italic', text: italicMatch[1] });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Plain text until next formatting
    const nextMatch = remaining.match(/[`*_]/);
    if (nextMatch) {
      segments.push({ type: 'text', text: remaining.slice(0, nextMatch.index) });
      remaining = remaining.slice(nextMatch.index);
    } else {
      segments.push({ type: 'text', text: remaining });
      remaining = '';
    }
  }

  return segments;
};
</script>

<style scoped>
.prose {
  color: #1f2937;
}
</style>
