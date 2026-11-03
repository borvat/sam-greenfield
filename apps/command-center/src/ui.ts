import {buildRevision} from '../../../packages/shared/src/buildRevision';
import {commandCenterCss} from './ui.css';
import {renderShell} from './ui.shell';
import {renderClientScript} from './ui.client';
import {t} from './ui.i18n';

export interface CommandCenterRenderOptions {
  developmentSafe?: boolean;
  developmentProbe?: boolean;
  developmentSubtitle?: string;
  syntheticRelease?: boolean;
  readOnly?: boolean;
  isolated?: {notificationId: string; memoryFixture: {statement: string; context_key: string; source: string}};
}

const BODY_OPEN = '<body data-sam-shell="2">';
const escapeAttr = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function baseDocument(): string {
  const revision = buildRevision().revision ?? 'UNKNOWN';
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>SAM Executive Command Center</title>
<style>${commandCenterCss}</style>
</head>
${BODY_OPEN}
${renderShell(revision)}
${renderClientScript()}
</body></html>`;
}

/**
 * The owner dashboard. Every mode variation is applied here, in one place, instead of by
 * string surgery in the HTTP layer: development-safe, development probe, synthetic pilot,
 * read-only and the privately admitted isolated acceptance entry.
 */
export function renderCommandCenterHtml(options: CommandCenterRenderOptions = {}): string {
  let html = baseDocument();

  const bodyAttrs = ['data-sam-shell="2"'];
  if (options.developmentSafe) bodyAttrs.push('data-development-safe="true"');
  if (options.readOnly) bodyAttrs.push('data-read-only="true"');
  if (options.isolated) bodyAttrs.push(`data-isolated-notification="${escapeAttr(options.isolated.notificationId)}"`);
  if (bodyAttrs.length > 1) html = html.replace(BODY_OPEN, `<body ${bodyAttrs.join(' ')}>`);

  if (options.developmentSafe && options.developmentSubtitle) {
    html = html.replace(`<div class="sub" id="pageSub" data-i18n="top.sub">${t('ar', 'top.sub')}</div>`,
      `<div class="sub" id="pageSub" data-i18n="top.sub">${escapeAttr(options.developmentSubtitle)}</div>`);
  }

  if (options.developmentProbe || options.syntheticRelease) {
    html = html
      .replace('<input id="domain" value="owner_command"',
        `<input id="domain" value="${options.syntheticRelease ? 'release_synthetic' : 'development_probe'}" readonly`)
      .replace('<option>YELLOW</option><option>GREEN</option>', '<option>GREEN</option>');
  }

  if (options.syntheticRelease) {
    html = html
      .replace('Example: Review current bol sales and accounting differences and produce a verified owner brief.',
        '{"synthetic":true,"operation":"max","values":[2,8,5]}'.replaceAll('"', '&quot;'))
      .replace('Owner acceptance contract (JSON; required by release profile)', 'Required owner acceptance contract (JSON; verified independently)')
      .replace('id="acceptance" placeholder=', 'id="acceptance" required placeholder=')
      .replace('Number(value||0)', '(value==null?"DISABLED":Number(value||0))')
      .replace('"LIVE"', '"SYNTHETIC PILOT · CONNECTED"')
      .replace('"No brief yet."', '"Finance disabled for synthetic pilot."');
  }

  if (options.readOnly) {
    html = html
      .replace('<div class="shell">', '<div class="shell"><div class="card" role="status">Read-only mode · وضع القراءة فقط. Goal creation is disabled; goals, reports and wait diagnostics remain available.</div>')
      .replace('<div class="card form">', '<div class="card form" hidden aria-hidden="true">')
      .replaceAll('data-owner-mutation', 'data-owner-mutation hidden')
      .replace('async function createGoal(){', 'async function createGoal(){\n  if(document.body.dataset.readOnly==="true")return;')
      .replace('document.body.dataset.developmentSafe?', 'document.body.dataset.readOnly?"READ ONLY · CONNECTED":document.body.dataset.developmentSafe?');
  }

  if (options.isolated) {
    html = html
      .replace('<div data-owner-mutation hidden>', '<div data-owner-mutation>')
      .replace('<textarea id="memory-statement"></textarea>', `<textarea id="memory-statement" readonly>${escapeAttr(options.isolated.memoryFixture.statement)}</textarea>`)
      .replace('<input id="memory-context" placeholder="procurement"/>', `<input id="memory-context" readonly value="${escapeAttr(options.isolated.memoryFixture.context_key)}"/>`)
      .replace('<input id="memory-source" value="command-center-owner-entry"/>', `<input id="memory-source" readonly value="${escapeAttr(options.isolated.memoryFixture.source)}"/>`)
      .replace('<input id="memory-date" type="text"', `<input id="memory-date" readonly value="${new Date().toISOString()}" type="text"`)
      .replace('refresh();\n  setInterval(refresh,15000);', 'refresh();')
      .replace('Read-only mode · وضع القراءة فقط.', 'Read-only mode with exact synthetic fixture save/read acknowledgement only · وضع القراءة فقط.');
  }

  return html;
}

export const commandCenterHtml = renderCommandCenterHtml();
