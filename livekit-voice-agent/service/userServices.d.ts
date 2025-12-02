import { type UserIdentity } from "../infra/supabase/supabase.client.js";
export declare function getUserName(userId: UserIdentity): Promise<string | null>;
export declare function storeSupabaseEvaluation(sessionId: string, evaluation: any): Promise<void>;
export declare function getSupabaseSession(sessionId: string): Promise<{
    user_id: any;
    job_title: any;
}>;
export declare function endSupabaseSession(sessionId: string): Promise<void>;
export declare function getSupabaseResume(userId: string): Promise<{
    resume_text: any;
}>;
export declare function getSupabaseStartedAt(sessionId: string): Promise<any>;
export declare function storeSupabaseConversation(sessionId: string, conversation: string): Promise<void>;
//# sourceMappingURL=userServices.d.ts.map