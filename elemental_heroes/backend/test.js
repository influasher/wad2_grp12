// Create Supabase client
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://isjymiovwvnnbclyhtpn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzanltaW92d3ZubmJjbHlodHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MzU0NDEsImV4cCI6MjA0NTAxMTQ0MX0.6YDxL21fn4Pg0Oha1oiZl8WXUaamPK5QRktT4rBCWh8"
);

// Upload file using standard upload
async function uploadFile(file) {
  const { data, error } = await supabase.storage
    .from("files_wad2")
    .upload("test.json", file);
  if (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  } else {
    console.log("File uploaded successfully:", data);
  }
}

export { uploadFile };
