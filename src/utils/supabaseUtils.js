import { supabase } from "../supabaseClient";

// Fetch all Acts
export const getAllActs = async () => {
  const { data, error } = await supabase.from("acts").select("*");
  if (error) {
    console.error("Error fetching acts:", error);
    return [];
  }
  return data;
};

// Fetch all PDFs
export const getAllPDFs = async () => {
  const { data, error } = await supabase.from("pdfs").select("*");
  if (error) {
    console.error("Error fetching pdfs:", error);
    return [];
  }
  return data.map((pdf) => ({
    ...pdf,
    fileUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pdfs/${pdf.file_path}`,
  }));
};
