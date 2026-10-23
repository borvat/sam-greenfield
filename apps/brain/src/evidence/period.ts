/** Exact calendar bounds only. Never interpret free-form periods or timezone offsets. */
export function calendarPeriod(value:unknown):{startDate:string;endDate:string}|undefined{
 const date=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 let start:unknown,end:unknown;
 if(typeof value==='string'){const parts=value.split('/');if(parts.length>2)return;start=parts[0];end=parts[1]??parts[0];}
 else if(value&&typeof value==='object'&&!Array.isArray(value)){start=(value as any).startDate;end=(value as any).endDate;}
 if(!date(start)||!date(end)||start>end)return;return {startDate:start,endDate:end};
}
export function sameCalendarPeriod(a:unknown,b:unknown){const x=calendarPeriod(a),y=calendarPeriod(b);return !!x&&!!y&&x.startDate===y.startDate&&x.endDate===y.endDate;}
