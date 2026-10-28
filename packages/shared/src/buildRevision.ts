/** Shared deployment metadata. Never expose arbitrary environment text. */
export function buildRevision(env:NodeJS.ProcessEnv=process.env){
 const value=env.SAM_BUILD_REVISION??env.RENDER_GIT_COMMIT??'';
 return {revision:/^[a-f0-9]{40}$/i.test(value)?value.toLowerCase():null,revisionStatus:/^[a-f0-9]{40}$/i.test(value)?'KNOWN':'UNKNOWN'};
}
