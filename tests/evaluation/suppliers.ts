import {runScenario} from './scenarioAcceptance';
runScenario('commercial-suppliers').catch(e=>{console.error(e);process.exitCode=1;});
