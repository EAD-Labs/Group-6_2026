import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request:Request){const secret=process.env.CRON_SECRET;const expected=Buffer.from(`Bearer ${secret??""}`);const actual=Buffer.from(request.headers.get("authorization")??"");if(!secret||expected.length!==actual.length||!timingSafeEqual(expected,actual))return NextResponse.json({error:"Not authorised"},{status:401});try{const {data,error}=await createAdminClient().rpc("cleanup_expired_learning_data");if(error)throw new Error();return NextResponse.json({deletedResources:data},{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"Cleanup could not finish. Retry and check service configuration."},{status:503});}}
