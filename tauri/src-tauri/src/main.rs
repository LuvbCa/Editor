#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use std::path::Path;

struct DirEntry {
  name: String,
  path: String,
  children: Vec<DirEntry>,
  typus: String,
}

#[tauri::command]
fn fs_layer_read_dir(path: String, max_layer: u32, current_layer: u32 ) -> Result<DirEntry, String> {
  let path = Path::new(&path);

  if max_layer < current_layer {
    return ""
  }

  let directory = fs::read_dir(path);

  for entry in directory.iter() {
      &entry.path()
  }

}


#[tauri::command]
fn fs_read_file(path: String) -> String {
    let content = fs::read_to_string(path);
    
    match content {
      Ok(v) => v,
      Err(err) => err.to_string()
    }
} 


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![fs_layer_read_dir, fs_read_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
