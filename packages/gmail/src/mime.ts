import { createHash } from "node:crypto";

function sanitizeHeader(value:string):string{
  return value.replace(/[\r\n]+/g," ").trim();
}

function normalizeAddressList(value:unknown):string[]{
  if(Array.isArray(value)){
    return value.map((v)=>String(v).trim()).filter(Boolean);
  }
  if(typeof value==="string"){
    return value.split(",").map((v)=>v.trim()).filter(Boolean);
  }
  return [];
}

export function deterministicMessageId(idempotencyKey:string):string{
  const hash=createHash("sha256").update(idempotencyKey).digest("hex").slice(0,32);
  return `<sam-${hash}@surooh.local>`;
}

export function buildRawMessage(input:{
  idempotencyKey:string;
  to:unknown;
  cc?:unknown;
  bcc?:unknown;
  subject:string;
  text:string;
  from?:string;
  replyTo?:string;
}):{raw:string;messageId:string}{
  const to=normalizeAddressList(input.to);
  if(to.length===0) throw new Error("gmail_send requires at least one recipient");
  if(!input.subject?.trim()) throw new Error("gmail_send requires subject");
  if(!input.text?.trim()) throw new Error("gmail_send requires text body");

  const forbidden=[
    /\bAI\b/i,
    /artificial intelligence/i,
    /ChatGPT/i,
    /language model/i,
    /automated assistant/i
  ];
  const externalText=`${input.subject}\n${input.text}`;
  if(forbidden.some((pattern)=>pattern.test(externalText))){
    throw new Error("External email contains forbidden AI-assistant wording");
  }

  const messageId=deterministicMessageId(input.idempotencyKey);
  const cc=normalizeAddressList(input.cc);
  const bcc=normalizeAddressList(input.bcc);
  const lines:string[]=[];
  if(input.from?.trim()) lines.push("From: "+sanitizeHeader(input.from));
  lines.push("To: "+to.map(sanitizeHeader).join(", "));
  if(cc.length) lines.push("Cc: "+cc.map(sanitizeHeader).join(", "));
  if(bcc.length) lines.push("Bcc: "+bcc.map(sanitizeHeader).join(", "));
  if(input.replyTo?.trim()) lines.push("Reply-To: "+sanitizeHeader(input.replyTo));
  lines.push("Subject: "+sanitizeHeader(input.subject));
  lines.push("Message-ID: "+messageId);
  lines.push("X-SAM-Operation-Key: "+sanitizeHeader(input.idempotencyKey));
  lines.push("MIME-Version: 1.0");
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push("Content-Transfer-Encoding: 8bit");
  lines.push("");
  lines.push(input.text);

  return {
    messageId,
    raw:Buffer.from(lines.join("\r\n"),"utf8")
      .toString("base64")
      .replace(/\+/g,"-")
      .replace(/\//g,"_")
      .replace(/=+$/,"")
  };
}
