"use server"

import { createClient } from '../supabase/server'

export async function getCurrentUserProfile() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single();

    if (error) {
        console.error("Error has occured when fetching profile (What the fuck?): ", error)
        return null
    }

    return profile
}

export async function uploadProfilePhoto(file: File) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);
    return { success: true, url: publicUrl };
}