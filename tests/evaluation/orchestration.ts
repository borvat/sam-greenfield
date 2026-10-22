// Reuse the actual specialist/kernel scenario; no second scripted agent engine.
import {runSpecialistAcceptance} from '../specialists/acceptance';
runSpecialistAcceptance(true).catch(e=>{console.error(e);process.exitCode=1;});
