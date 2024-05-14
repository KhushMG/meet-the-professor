// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Imports
use dotenv::dotenv;
use rand::seq::SliceRandom;
use rand::Rng;
use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_system_instructions, 
      get_attributes,
      call_gpt,
      generate_initial_user_message,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// Prompting GPT w/ context and attributes
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
    DO NOT INCLUDE THE PROFESSOR'S ATTRIBUTES IN THE PROFESSOR'S RESPONSE. DO NOT INCLUDE EMOJIS IN THE PROFESSOR'S RESPONSE
    INCLUDE ONE USE OF PARTIALLY CENSORED HEAVY PROFANITY EVERY RESPONSE IF ALL OF THE PROFESSOR'S ATTRIBUTES ARE EITHER 1 OR 2.
    MAKE KEY CONCEPTS/TOPICS UP IF NEEDED.
    Example Conversation: Professor: Welcome to today's class on creative problem solving! Are you ready to think outside the box? (DO NOT LITERALLY INCLUDE STUDENT RESPONSES) Student Responses: A) Yes, I'm excited! What's our first challenge? B) I'm not sure I'm good at this. Do you think I can really do it? C) Sounds like more buzzwords. Do we have to do group work again? ...(continue with the example conversation)...",
    attributes["enthusiasm"],
    attributes["helpfulness"],
    attributes["innovation"]
  );

  system_instructions
}

// Creating a hashmap with randomized professor attributes 
#[tauri::command]
fn get_attributes() -> HashMap<String, i32> {
  let mut rng = rand::thread_rng();
  let mut attributes = HashMap::new();
  
  attributes.insert("enthusiasm".to_string(), rng.gen_range(1..=5));
  attributes.insert("helpfulness".to_string(), rng.gen_range(1..=5));
  attributes.insert("innovation".to_string(), rng.gen_range(1..=5));

  attributes
}

// Calls the function that makes the API call to GPT
#[tauri::command]
async fn call_gpt(messages: Value) -> Result<String, String> {
  match get_gpt_response(&messages).await {
      Ok(text) => Ok(text),
      Err(e) => Err(e.to_string())
  }
}

// Randomly selects one message from a vector of initial user messages
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

// Makes the API call to GPT API, using GPT 4o :O
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
