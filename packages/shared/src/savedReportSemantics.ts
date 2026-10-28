/** Read metadata is separate from immutable historical rows and hashes. */
export function describeSavedReports(reports:any[]){return reports.map(row=>({
 reportId:row.id,reportHash:row.report_hash,executionPerformed:false,
 semanticValidation:row.decision?.report?.semanticPolicy??'HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED',
 originalLimitations:row.decision?.limitations??row.decision?.report?.limitations??[],
 unsupportedClaims:'Unsupported currency, tax, period or coverage claims in historical narrative must not be treated as established facts; retain the original evidence limits.'
}));}
