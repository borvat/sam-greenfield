'use strict';
// Only fixed classifications may leave startup. Never log provider messages,
// connection strings, paths, authentication fields, or arbitrary error codes.
const allowed=new Set(['PERSISTENT_BINDING_INVALID','PRIVATE_BINDING_FILE_REQUIRED',
 'PERSISTENT_PRINCIPAL_DENIED','PERSISTENT_TENANT_DENIED',
 'PERSISTENT_PUBLIC_ACCESS_DENIED','PERSISTENT_AUTHENTICATION_DENIED',
 'PERSISTENT_CONNECTION_UNAVAILABLE','PERSISTENT_STORAGE_PREFLIGHT_FAILED']);
function storageFailureCode(error){
 if(error?.code==='28P01'||error?.code==='28000')return 'PERSISTENT_AUTHENTICATION_DENIED';
 if(['ECONNREFUSED','ETIMEDOUT','ENOTFOUND','EHOSTUNREACH'].includes(error?.code))return 'PERSISTENT_CONNECTION_UNAVAILABLE';
 return allowed.has(error?.message)?error.message:'PERSISTENT_STORAGE_PREFLIGHT_FAILED';
}
module.exports={storageFailureCode};
