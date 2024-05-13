// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use rand::seq::SliceRandom;
use rand::Rng;
use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use tokio;
use std::io;
// use lazy_static::lazy_static;
// use std::sync::Mutex;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, 
      get_system_instructions, 
      get_attributes,
      call_gpt,
      generate_initial_user_message,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

#[tauri::command]
fn greet() -> String {
    generate_initial_user_message()
}

// once per professor
#[tauri::command]
fn get_system_instructions(attributes: HashMap<String, i32>) -> String {
  let system_instructions = format!(
    "You are a language model acting as a college professor with the following attributes: enthusiasm ({}), helpfulness ({}), and innovation ({}). \
    Each response you provide should reflect these attributes vividly. Remember, they include a scale from 1-5 and based on the scale this will affect your conversation personality with the student. \
    After responding, ALWAYS provide three multiple-choice options that the student can select from to respond to you. \
    The dialogue should be engaging yet straightforward, suitable for a gamified 'rate my professor' experience. Ensure the conversation includes a total of 10 messages.",
    attributes["enthusiasm"],
    attributes["helpfulness"],
    attributes["innovation"]
  );

  system_instructions
}

// once per professor
#[tauri::command]
fn get_attributes() -> HashMap<String, i32> {
  let mut rng = rand::thread_rng();
  let mut attributes = HashMap::new();
  
  attributes.insert("enthusiasm".to_string(), rng.gen_range(1..=5));
  attributes.insert("helpfulness".to_string(), rng.gen_range(1..=5));
  attributes.insert("innovation".to_string(), rng.gen_range(1..=5));

  attributes
}

// once per professor
#[tauri::command]
async fn call_gpt(messages: Value) -> Result<String, String> {
  match get_gpt_response(&messages).await {
      Ok(text) => Ok(text),
      Err(e) => Err(e.to_string())
  }
}

#[tokio::main]
async fn activate_conversation() {
    interactive_conversation().await;
}

// once per professor
#[tauri::command]
fn generate_initial_user_message() -> String {
  let scenarios: Vec<String> = vec![
      "Hello Professor, I've been struggling with the latest topics in the course. Can you help?".to_string(),
      "Good morning, Professor! I'm having a hard time understanding our last assignment. Could we go over it?".to_string(),
      "Hi Professor, I felt lost in today's lecture about advanced topics. Can we discuss this further?".to_string(),
      "Professor, I'm not sure how to start our upcoming project. Do you have any advice?".to_string(),
      "Hello, I'm really worried about the upcoming exam. Can we review some of the key concepts?".to_string(),
  ];
  let mut rng = rand::thread_rng();

  let scenario = scenarios
      .choose(&mut rng)
      .map(|s| s.to_string())
      .unwrap_or_else(|| "Default message".to_string());

  scenario
}

async fn interactive_conversation() {
  let mut rng = rand::thread_rng();
  let mut attributes = HashMap::new();
  attributes.insert("enthusiasm", rng.gen_range(1..=5));
  attributes.insert("helpfulness", rng.gen_range(1..=5));
  attributes.insert("innovation", rng.gen_range(1..=5));

  let system_instructions = format!(
      "You are a language model acting as a college professor with the following attributes: enthusiasm ({}), helpfulness ({}), and innovation ({}). 
      Each response you provide should reflect these attributes vividly. Remember, they include a scale from 1-5 and based on the scale this will affect your conversation personality with the student. 
      After responding, ALWAYS provide three multiple-choice options that the student can select from to respond to you. Always start and format the options as A) B) and C). 
      The dialogue should be engaging yet straightforward, suitable for a gamified 'rate my professor' experience. Ensure the conversation includes a total of 10 messages.",
      attributes["enthusiasm"],
      attributes["helpfulness"],
      attributes["innovation"]
  );
  
  println!(
      "Attributes: (Enthusiasm: {}, Helpfulness: {}, Innovation: {})",
      attributes["enthusiasm"], attributes["helpfulness"], attributes["innovation"]
  );

  let user_message: String = generate_initial_user_message();

  println!("{}", user_message);

  let mut messages = json!([{"role": "system", "content": system_instructions}, {"role": "user", "content": user_message }]);

  for _ in 0..5 {  // Adjusted for 5 total exchanges including the initial message

      let response = process_gpt_response(&messages).await;

      if let Ok(response_object) = serde_json::from_str::<serde_json::Value>(&response) {
          if let Some(choices) = response_object["choices"].as_array() {
              if let Some(first_choice) = choices.get(0) {
                  let professor_response = first_choice["message"]["content"].as_str().unwrap_or("Error in response format");

                  println!("Professor says: {}", professor_response);

                  // Assuming we now append the professor's response to messages for the next cycle
                  if let Some(messages_array) = messages.as_array_mut() {
                      messages_array.push(json!({"role": "assistant", "content": professor_response}));
                  }
              }
          }
      }

      if let Some(messages_array) = messages.as_array_mut() {
          if messages_array.len() >= 3 {
              messages_array.push(json!({"role": "user", "content": "This message is not part of the user input its to let you know there are 2 messages left in the conversation so finish the conversation with your next response"}));
          }
  
          if messages_array.len() >= 8 {
              break;
          }
      }
      
      println!("Enter your next choice:");
      let mut input = String::new();
      io::stdin()
          .read_line(&mut input)
          .expect("Failed to read line");
      input.trim().to_string();

      println!("Student said: {}", input);

      if let Some(messages_array) = messages.as_array_mut() {
          messages_array.push(json!({"role": "user", "content": input}));
      }

  }
}

async fn process_gpt_response(messages: &Value) -> String {
  match get_gpt_response(&messages).await {
      Ok(text) => text,
      Err(e) => e.to_string(),
  }
}

async fn get_gpt_response(messages: &Value) -> Result<String, reqwest::Error> {
  dotenv().ok();
  let api_key = env::var("API_KEY").expect("API_KEY not found");

  let client = Client::new();
  let url = "https://api.openai.com/v1/chat/completions";

  let response = client
      .post(url)
      .header("Authorization", format!("Bearer {}", api_key))
      .json(&json!({
          "model": "gpt-4-turbo",
          "messages": messages
          // messages: [{"role": "system", "content": system_instructions}, {"role": "user", "content": user_message }]
      }))
      .send()
      .await?;

  response.text().await
}
