"""No-cloud negative tests for the UNREGISTERED real UI/publisher preflight."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('real_policy',ROOT/'deploy/hermes-coding/real_project_policy.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
JOB='00000000-0000-4000-8000-000000000001'

class ProjectPolicy(unittest.TestCase):
    def setUp(self):
        self.base=(ROOT/p.PATH).read_text()
        # Synthetic positive control for the guard, never saved as a candidate
        # or represented as Hermes output or a completed real repair.
        self.control=self.base.replace(p.ANCHOR,p.ANCHOR+
            "  document.getElementById('finalReport').textContent='Loading report…';\n"+
            "  document.getElementById('timeline').textContent='Loading evidence…';\n")
        self.body={'jobId':JOB,'repository':p.REPOSITORY,'base':p.BASE,'files':{p.PATH:self.control}}
        self.publish={'repository':p.REPOSITORY,'base':p.BASE,'branch':'hermes/real-ui-'+JOB,
            'draft':True,'operation':'create_draft_pr'}

    def test_bounded_control_passes_only_offline_preflight(self):
        result=p.candidate_preflight(self.body,self.base)
        self.assertEqual(result['mode'],'OFFLINE_PREFLIGHT_ONLY')

    def test_unchanged_source_and_other_edits_are_denied(self):
        for text in [self.base,self.control+'\n',self.control.replace('async function api','async function otherApi'),
                     self.control.replace("textContent='Loading report…'","innerHTML='Loading report…'"),
                     self.control.replace('Loading report…',"';process.exit(0);//"),
                     self.control.replace('Loading report…','Loading\nreport'),self.control.replace('Loading report…','x'*121)]:
            with self.subTest(kind=text[-30:]):
                body={**self.body,'files':{p.PATH:text}}
                with self.assertRaises(ValueError):p.candidate_preflight(body,self.base)

    def test_extra_files_traversal_secrets_workflows_and_dependencies_denied(self):
        for path in ['../.env','.env','/etc/passwd','package.json','package-lock.json','.github/workflows/x.yml',p.PATH+'/../other.ts']:
            with self.subTest(path=path):
                body=copy.deepcopy(self.body);body['files'][path]='CANARY_ONLY'
                with self.assertRaises(ValueError):p.candidate_preflight(body,self.base)

    def test_target_base_commands_and_encoding_denied(self):
        for key,value in [('repository','borvat/surooh-accounting'),('base','main'),('command','npm install'),
                          ('dependencies',[]),('env',{'CANARY':'SYNTHETIC'}),('jobId','../job')]:
            body={**self.body,key:value}
            with self.assertRaises(ValueError):p.candidate_preflight(body,self.base)
        with self.assertRaises(ValueError):p.candidate_preflight(self.body,self.base+'\n')
        with self.assertRaises(ValueError):p.candidate_preflight({**self.body,'files':{p.PATH:'\ud800'}},self.base)
        with self.assertRaises(ValueError):p.candidate_preflight({**self.body,'files':{p.PATH:'x'*32769}},self.base)

    def test_destination_control_has_no_publication_or_scope_claim(self):
        result=p.publisher_destination_preflight(self.publish,JOB)
        self.assertFalse(result['published']);self.assertFalse(result['credentialScopeVerified'])

    def test_other_repository_main_merge_nondraft_and_extra_authority_denied(self):
        for key,value in [('repository','borvat/surooh-commerce'),('base','main'),('branch','main'),
                          ('branch','hermes/other'),('draft',False),('draft',1),('operation','merge'),
                          ('operation','push_main'),('token','CANARY_ONLY'),('bypass',True)]:
            with self.subTest(key=key,value=value):
                with self.assertRaises(ValueError):p.publisher_destination_preflight({**self.publish,key:value},JOB)

if __name__=='__main__':unittest.main()
