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
  let mut attributes_list = Vec::new();

  for attribute in attributes.keys() {
    attributes_list.push(attribute.clone().to_string());
  }

  let binding = "N/A".to_string();
  let first_key = attributes_list.get(0).unwrap_or(&binding);
  let first_value = attributes.get(first_key).unwrap_or(&0);

  let second_key = attributes_list.get(1).unwrap_or(&binding);
  let second_value = attributes.get(second_key).unwrap_or(&0);

  let third_key = attributes_list.get(2).unwrap_or(&binding);
  let third_value = attributes.get(third_key).unwrap_or(&0);

  let system_instructions = format!(
    "You are a language model acting as a college professor with the following attributes: ({}) ({}), ({}) ({}), and ({}) ({}). 
    Each response you provide should reflect these attributes vividly also remember they include a scale from 1-5 and based on the scale this will affect your conversation personality with the student. 
    For example if helpfulness and innovation and enthusiasm are all low number say 1 or 2 then the professor needs to reflect those attributes at that scale. 
    Its vital that the personality of the professor is really affected by the scale of each attribute really emphasize that with the professors responses to the student so if the scale is low for helpfulness make the professor blunt and mean. 
    After responding, ALWAYS provide THREE multiple-choice options that the student can select from to respond to you and do not add any other extra sentence right before the 3 multiple choice responses. 
    Also ALWAYS ALWAYS ALWAYS GIVE 3 MULTIPLE CHOICE OPTIONS TO THE STUDENT UNTIL YOUR FINAL MESSAGE IN THE CONVERSATION
    Make sure the three response options for the student aren't more questions, we want to keep the conversation simple and shallow that the student can choose from to continue the conversation. 
    These options should offer different angles or deeper inquiries into the student's initial question. The dialogue should be engaging yet straightforward, suitable for a gamified 'rate my professor' experience. 
    Ensure the conversation includes a total of 6 PROFESSOR RESPONSES. ALSO MAKE SURE THAT YOUR PROFESSOR RESPONSES DO NOT INCLUDE ANY FORM OF LIST, GRAPHS, OR TABLES. 
    Also make sure you stay consistent with your attributes and their scale if the scale is low make sure your conversational tone is consistent with that dont switch up your tone depending on a students reply. 
    Also MAKE SURE THAT THE MULTIPLE CHOICE OPTIONS YOU GIVE ARE ONLY STUDENT RESPONSE OPTIONS NOT PROFESSOR RESPONSE OPTIONS.
    ON THE LAST MESSAGE, DONT ASK ANY FURTHER QUESTIONS IN YOUR PROFESSOR RESPONSE, CONCLUDE THE CONVERSATION.
    DO NOT INCLUDE THE PROFESSOR'S ATTRIBUTES IN THE PROFESSOR'S RESPONSE. DO NOT INCLUDE EMOJIS IN THE PROFESSOR'S RESPONSE
    MAKE KEY CONCEPTS/TOPICS UP IF NEEDED.
    EACH PROFESSOR RESPONSE MUST BE ATLEAST 14 WORDS AND UNDER 20 WORDS.
    Example Conversation: Professor: Welcome to today's class on creative problem solving! Are you ready to think outside the box? (DO NOT LITERALLY INCLUDE STUDENT RESPONSES) Student Responses: A) Yes, I'm excited! What's our first challenge? B) I'm not sure I'm good at this. Do you think I can really do it? C) Sounds like more buzzwords. Do we have to do group work again? ...(continue with the example conversation)...",
    first_key, first_value,
    second_key, second_value,
    third_key, third_value,
  );
  

  system_instructions
}

// Creating a hashmap with randomized professor attributes 
#[tauri::command]
fn get_attributes() -> HashMap<String, i32> {
  let mut rng = rand::thread_rng();
  let mut first_attributes = HashMap::new();
  let mut second_attributes = HashMap::new();
  let mut third_attributes = HashMap::new();
  let mut fourth_attributes = HashMap::new();

  let mut total_attributes: Vec<HashMap<String, i32>> = Vec::new();
  
  first_attributes.insert("enthusiasm".to_string(), rng.gen_range(1..=5));
  first_attributes.insert("helpfulness".to_string(), rng.gen_range(1..=5));
  first_attributes.insert("innovation".to_string(), rng.gen_range(1..=5));

  second_attributes.insert("patience".to_string(), rng.gen_range(1..=5));
  second_attributes.insert("knowledgeability".to_string(), rng.gen_range(1..=5));
  second_attributes.insert("engagement".to_string(), rng.gen_range(1..=5));

  third_attributes.insert("clarity".to_string(), rng.gen_range(1..=5));
  third_attributes.insert("friendliness".to_string(), rng.gen_range(1..=5));
  third_attributes.insert("organization".to_string(), rng.gen_range(1..=5));

  fourth_attributes.insert("strictness".to_string(), rng.gen_range(1..=5));
  fourth_attributes.insert("fairness".to_string(), rng.gen_range(1..=5));
  fourth_attributes.insert("punctuality".to_string(), rng.gen_range(1..=5));

  total_attributes.push(first_attributes);
  total_attributes.push(second_attributes);
  total_attributes.push(third_attributes);
  total_attributes.push(fourth_attributes);

  let chosen_attributes = total_attributes
  .choose(&mut rng);
  
  chosen_attributes.unwrap().clone()
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
      "Professor, I missed the last class due to illness. Can you help me catch up on what I missed?".to_string(),
      "Hi Professor, I'm confused about the grading criteria for our essays. Can we discuss this?".to_string(),
      "Good afternoon, Professor. I'm having trouble with the research part of our project. Could you guide me?".to_string(),
      "Professor, the group project isn't going well. Can we talk about some solutions?".to_string(),
      "Hello Professor, I'm struggling to balance this course with my other commitments. Can you offer any advice?".to_string(),
      "Hi Professor, I'm not sure I understand the theoretical concepts we discussed last week. Could we review them?".to_string(),
      "Professor, I'm having difficulty accessing the online resources. Can you assist me?".to_string(),
      "Good evening, Professor. I need clarification on the feedback you gave on my last assignment.".to_string(),
      "Hello Professor, I'm feeling overwhelmed by the workload. Can you suggest a better way to manage it?".to_string(),
      "Professor, I don't understand how to apply the formulas we learned. Can we go over some examples?".to_string(),
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
          "model": "gpt-4o", 
          "messages": messages,
        //   "max_tokens": 256,
          // messages: [{"role": "system", "content": system_instructions}, {"role": "user", "content": user_message }]
      }))
      .send()
      .await?;

  response.text().await
}
