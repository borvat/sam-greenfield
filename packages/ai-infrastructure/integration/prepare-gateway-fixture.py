"""Prepare a disposable copy of the actual SAM gateway, never edit reserved files.
Outputs the minimal exact-source patch for owner review. No runtime deployment.
"""
import argparse
import difflib
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile

p=argparse.ArgumentParser();p.add_argument('--ref',required=True);p.add_argument('--out',required=True);p.add_argument('--patch',required=True)
a=p.parse_args();repo=Path.cwd();out=Path(a.out).resolve()
if out.exists(): raise RuntimeError('FRESH_FIXTURE_DIRECTORY_REQUIRED')
out.mkdir()
with tempfile.TemporaryFile() as archive:
    subprocess.run(['git','archive',a.ref],stdout=archive,check=True)
    archive.seek(0)
    with tarfile.open(fileobj=archive) as t:t.extractall(out,filter='data')
shutil.copytree(repo/'packages/ai-infrastructure',out/'packages/ai-infrastructure',dirs_exist_ok=True)
(out/'node_modules').symlink_to(repo/'node_modules',target_is_directory=True)
file=out/'packages/model-gateway/src/gateway.ts';original=file.read_text();changed=original
def replace(old,new):
    global changed
    if changed.count(old)!=1: raise RuntimeError('GATEWAY_CONTRACT_ANCHOR_CHANGED: '+old[:60])
    changed=changed.replace(old,new,1)
replace('export class ModelGateway {', '''import type { SamModelCallBoundary } from '../../ai-infrastructure/src/samBoundary';

export class ModelGateway {
  private modelCallBoundary?: SamModelCallBoundary;
  /** Trusted composition only. Omit this hook to retain the existing path. */
  withModelCallBoundary(boundary: SamModelCallBoundary): this {
    if (this.modelCallBoundary) throw new Error('AI_DURABLE_ALREADY_CONFIGURED');
    this.modelCallBoundary = boundary; return this;
  }''')
replace('      if (!adapter) {', '''      if (!adapter) {
        if (this.modelCallBoundary) throw new Error('AI_DURABLE_ADAPTER_REQUIRED');''')
replace('      const started = Date.now();', '''      if (this.modelCallBoundary && ((task as any).boundedSynthetic || (task as any).boundedEvaluation))
        throw new Error('AI_DURABLE_BOUNDARY_CONFLICT');
      const durableTicket = this.modelCallBoundary ? await this.modelCallBoundary.reserve(task, candidate) : undefined;
      const started = Date.now();''')
replace('        const result = await adapter.invoke(task, candidate.model);', '''        const result = this.modelCallBoundary
          ? await this.modelCallBoundary.execute(durableTicket!, adapter, task, candidate.model)
          : await adapter.invoke(task, candidate.model);''')
needle='''        await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: result.model,'''
replace(needle,'''        if (this.modelCallBoundary) await this.modelCallBoundary.finish(durableTicket!, result);
        else await withTransaction((client) => recordModelCall(client, {
          task: task.task,
          provider: candidate.providerId,
          model: result.model,''')
replace('''      } catch (err) {
        lastError = err;''','''      } catch (err) {
        if (this.modelCallBoundary) await this.modelCallBoundary.fail(durableTicket!);
        lastError = err;''')
file.write_text(changed)
Path(a.patch).write_text(''.join(difflib.unified_diff(original.splitlines(True),changed.splitlines(True),
    fromfile='a/packages/model-gateway/src/gateway.ts',tofile='b/packages/model-gateway/src/gateway.ts')))
print('ISOLATED_GATEWAY_FIXTURE_READY',subprocess.check_output(['git','rev-parse',a.ref],text=True).strip())
