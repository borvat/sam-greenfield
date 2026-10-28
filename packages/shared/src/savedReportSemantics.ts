/** Read metadata is separate from immutable historical rows and hashes. */
export function describeSavedReports(reports:any[]){return reports.map(row=>({
 reportId:row.id,reportHash:row.report_hash,executionPerformed:false,
 revision:row.revision??1,supersedesReportId:row.supersedes_report_id??null,supersededByReportId:reports.find(r=>r.supersedes_report_id===row.id||r.decision?.supersedesReport?.id===row.id)?.id??null,
 semanticValidation:row.decision?.report?.semanticPolicy??'HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED',
 originalLimitations:row.decision?.limitations??row.decision?.report?.limitations??[],
 unsupportedClaims:'Unsupported currency, tax, period or coverage claims in historical narrative must not be treated as established facts; retain the original evidence limits.'
}));}
