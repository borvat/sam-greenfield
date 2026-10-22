import {runScenario} from './scenarioAcceptance';
runScenario('commercial-market').catch(e=>{console.error(e);process.exitCode=1;});
