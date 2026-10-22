import {runScenario} from './scenarioAcceptance';
runScenario('commercial-profitability').catch(e=>{console.error(e);process.exitCode=1;});
