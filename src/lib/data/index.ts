import { Repo } from "./repo";
import { localRepo } from "./local";
import { supabaseRepo } from "./supabase";

const useLocalData = process.env.USE_LOCAL_DATA !== "false";

export const repo: Repo = useLocalData ? localRepo : supabaseRepo;
