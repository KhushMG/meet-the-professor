// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use rand::seq::SliceRandom;
use rand::Rng;
use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
// use tokio;
// use std::io;
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
    "You are a language model acting as a college professor with the following attributes: enthusiasm ({}), helpfulness ({}), and innovation ({}). 
    Each response you provide should reflect these attributes vividly also remember they include a scale from 1-5 and based on the scale this will affect your conversation personality with the student. 
    For example if helpfulness and innovation and enthusiasm are all low number say 1 or 2 then the professor needs to reflect those attributes at that scale. 
    Its vital that the personality of the professor is really affected by the scale of each attribute really emphasize that with the professors responses to the student so if the scale is low for helpfulness make the professor blunt and mean. 
    After responding, ALWAYS provide three multiple-choice options that the student can select from to respond to you and do not add any other extra sentence right before the 3 multiple choice responses. 
    Make sure the three response options for the student aren't more questions, we want to keep the conversation simple and shallow that the student can choose from to continue the conversation. 
    These options should offer different angles or deeper inquiries into the student's initial question. The dialogue should be engaging yet straightforward, suitable for a gamified 'rate my professor' experience. 
    Ensure the conversation includes a total of 6 PROFESSOR RESPONSES. ALSO MAKE SURE THAT YOUR PROFESSOR RESPONSES DO NOT INCLUDE ANY FORM OF LIST, GRAPHS, OR TABLES. 
    Also make sure you stay consistent with your attributes and their scale if the scale is low make sure your conversational tone is consistent with that dont switch up your tone depending on a students reply. 
    Also MAKE SURE THAT THE MULTIPLE CHOICE OPTIONS YOU GIVE ARE ONLY STUDENT RESPONSE OPTIONS NOT PROFESSOR RESPONSE OPTIONS.
    ON THE LAST MESSAGE, DONT ASK ANY FURTHER QUESTIONS IN YOUR PROFESSOR RESPONSE, CONCLUDE THE CONVERSATION.
    INCLUDE ONE USE OF HEAVY PROFANITY EVERY RESPONSE IF TWO OUT OF THREE OF THE PROFESSOR'S ATTRIBUTES ARE EITHER 1 OR 2.
    Example Conversation: Professor: Welcome to today's class on creative problem solving! Are you ready to think outside the box? (DO NOT LITERALLY INCLUDE STUDENT RESPONSES) Student Responses: A) Yes, I'm excited! What's our first challenge? B) I'm not sure I'm good at this. Do you think I can really do it? C) Sounds like more buzzwords. Do we have to do group work again? ...(continue with the example conversation)...",
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

// multiple times per professor
#[tauri::command]
async fn call_gpt(messages: Value) -> Result<String, String> {
  match get_gpt_response(&messages).await {
      Ok(text) => Ok(text),
      Err(e) => Err(e.to_string())
  }
}

// #[tokio::main]
// async fn activate_conversation() {
//     interactive_conversation().await;
// }

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

// async fn interactive_conversation() {
//   let mut rng = rand::thread_rng();
//   let mut attributes = HashMap::new();
//   attributes.insert("enthusiasm", rng.gen_range(1..=5));
//   attributes.insert("helpfulness", rng.gen_range(1..=5));
//   attributes.insert("innovation", rng.gen_range(1..=5));

//   let system_instructions = format!(
//       "You are a language model acting as a college professor with the following attributes: enthusiasm ({}), helpfulness ({}), and innovation ({}). 
//       Each response you provide should reflect these attributes vividly. Remember, they include a scale from 1-5 and based on the scale this will affect your conversation personality with the student. 
//       After responding, ALWAYS provide three multiple-choice options that the student can select from to respond to you. Always start and format the options as A) B) and C).
//       The dialogue should be engaging yet straightforward, suitable for a gamified 'rate my professor' experience. Ensure the conversation includes a total of 10 messages.",
//       attributes["enthusiasm"],
//       attributes["helpfulness"],
//       attributes["innovation"]
//   );
  
//   println!(
//       "Attributes: (Enthusiasm: {}, Helpfulness: {}, Innovation: {})",
//       attributes["enthusiasm"], attributes["helpfulness"], attributes["innovation"]
//   );

//   let user_message: String = generate_initial_user_message();

//   println!("{}", user_message);

//   let mut messages = json!([{"role": "system", "content": system_instructions}, {"role": "user", "content": user_message }]);

//   for _ in 0..5 {  // Adjusted for 5 total exchanges including the initial message

//       let response = process_gpt_response(&messages).await;

//       if let Ok(response_object) = serde_json::from_str::<serde_json::Value>(&response) {
//           if let Some(choices) = response_object["choices"].as_array() {
//               if let Some(first_choice) = choices.get(0) {
//                   let professor_response = first_choice["message"]["content"].as_str().unwrap_or("Error in response format");

//                   println!("Professor says: {}", professor_response);

//                   // Assuming we now append the professor's response to messages for the next cycle
//                   if let Some(messages_array) = messages.as_array_mut() {
//                       messages_array.push(json!({"role": "assistant", "content": professor_response}));
//                   }
//               }
//           }
//       }

//       if let Some(messages_array) = messages.as_array_mut() {
//           if messages_array.len() >= 3 {
//               messages_array.push(json!({"role": "user", "content": "This message is not part of the user input its to let you know there are 2 messages left in the conversation so finish the conversation with your next response"}));
//           }
  
//           if messages_array.len() >= 8 {
//               break;
//           }
//       }
      
//       println!("Enter your next choice:");
//       let mut input = String::new();
//       io::stdin()
//           .read_line(&mut input)
//           .expect("Failed to read line");
//       input.trim().to_string();

//       println!("Student said: {}", input);

//       if let Some(messages_array) = messages.as_array_mut() {
//           messages_array.push(json!({"role": "user", "content": input}));
//       }

//   }
// }

// async fn process_gpt_response(messages: &Value) -> String {
//   match get_gpt_response(&messages).await {
//       Ok(text) => text,
//       Err(e) => e.to_string(),
//   }
// }

async fn get_gpt_response(messages: &Value) -> Result<String, reqwest::Error> {
  dotenv().ok();
  let api_key = env::var("API_KEY").expect("API_KEY not found");

  let client = Client::new();
  let url = "https://api.openai.com/v1/chat/completions";

  let response = client
      .post(url)
      .header("Authorization", format!("Bearer {}", api_key))
      .json(&json!({
          "model": "gpt-4o", // "model": "gpt-4-turbo",
          "messages": messages,
        //   "max_tokens": 256,
          // messages: [{"role": "system", "content": system_instructions}, {"role": "user", "content": user_message }]
      }))
      .send()
      .await?;

  response.text().await
}
