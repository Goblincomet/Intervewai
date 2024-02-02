from pydantic import BaseModel
import uvicorn
import os
import openai
# from openai import OpenAI
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
# import httpx
import json
import requests
import io
from google.cloud import secretmanager
from pydantic import BaseModel


class UserResponse(BaseModel):
    response: str


def access_secret_version(secret_name):
    project_id = "interviewai-voice-backend"
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    payload = response.payload.data.decode("UTF-8")
    print(f"Secret: {payload}")
    return payload


# elevenlabs_key = access_secret_version("ELEVENLABS_KEY")
# openai.api_key = access_secret_version("OPENAI_API_KEY")

# //add your keys here
# elevenlabs_key = ""
# openai.api_key = ""



load_dotenv()
question_count = 0
max_question_count = 3
app = FastAPI()
origins = [
    "*"
    # "https://interviewai-voice-frontend.web.app",
    # "https://us-central1-interviewai-voice-frontend.cloudfunctions.net/proxyToCloudRun",
    # "https://us-central1-interviewai-voice-frontend.cloudfunctions.net",
    # "https://interviewai-voice-backend-xkb5z2oeda-uc.a.run.app",
    # "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

### APIS ###


@app.get("/")
async def root():
    return {"message": "Backend is running..."}


# @app.get("/start")
# async def start_interview():
#     global question_count
#     question_count = 0  # Reset count for a new conversation
#     question = get_chat_response("")
#     return {"question": question}
class JobResumeDescription(BaseModel):
    job: str
    resume: str


@app.post("/submit_resume_job")
async def start_interview(description: JobResumeDescription):
    global job, resume, question_count
    job = description.job
    resume = description.resume
    print(resume)
    # question_count = 0  # Reset count for a new conversation
    # question = get_chat_response("")
    question = generate_question(resume, job)
    nonempty_question = "\n".join(
        [line for line in question.split('\n') if line.strip() != ''])
    print(nonempty_question)
    return {"question": nonempty_question}


@app.get("/chatgpt_reply")
async def continue_interview(user_input: str = Query(None)):
    question = get_chat_response(user_input)
    # Include question_count in response
    return {"question": question, "question_count": question_count}


class SynthesizeSpeechRequest(BaseModel):
    text: str


@app.post("/synthesize_speech")
async def synthesize_speech(request: SynthesizeSpeechRequest):
    url = "https://api.elevenlabs.io/v1/text-to-speech/KUNaMYaOvJwEa2495wiX"
    print(request.text)
    payload = {
        "text": request.text,
        "voice_settings": {
            "similarity_boost": 1.0,
            "stability": 1.0,
            "style": 1.0,
            "use_speaker_boost": True
        }
    }
    headers = {
        "xi-api-key": f"{elevenlabs_key}",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    audio_size_kb = len(response.content) / 1024
    print(f"Size of audio: {audio_size_kb:.2f} KB")

    output_file_path = 'output_audio.wav'

    # Write the binary content to the file
    with open(output_file_path, 'wb') as audio_file:
        audio_file.write(response.content)

    audio_content = response.content
    return StreamingResponse(io.BytesIO(audio_content), media_type="audio/mpeg")


# @app.get("/generate_analysis")
# async def generate_analysis():
#     # Create a string for the full transcript and feedback
#     transcript_and_feedback = create_transcript_and_feedback()

#     # Return the transcript and feedback as a text file
#     return StreamingResponse(io.BytesIO(transcript_and_feedback.encode()), media_type="text/plain")


class QuestionAnswer(BaseModel):
    combinedQA: str


@app.post("/submit_answer")
async def generate_analysis(QA: QuestionAnswer):
    combinedQA = QA.combinedQA
    analysis = generate_analysis(combinedQA)
    # Create a string for the full transcript and feedback
    # feedback = generate_analysis(question, answer)

    # Return the transcript and feedback as a text file
    # return StreamingResponse(io.BytesIO(transcript_and_feedback.encode()), media_type="text/plain")
    print(analysis)
    return {"analysis": analysis}


def generate_question(resume, job):
    print('start generation')
    prompt = '''
        You are an expert career coach. Please use the provided resume and job description, generate 10 interview questions that are tailored to the candidate's experience and the requirements of the job. Ensure that the questions are varied and cover different aspects such as technical skills, behavioral traits, situational responses, and alignment with the company's needs.
        * Analyze the resume to understand the candidate's background, including their education, work experience, skills, and any notable achievements or projects.
        * Examine the job description to identify key requirements, responsibilities, and desired qualifications for the role.
        * Create questions that assess how the candidate's experience and skills align with the job requirements. Include technical or role-specific questions relevant to the position.
        * Formulate behavioral questions based on the candidate's past experiences, focusing on scenarios that are likely relevant to the job they are applying for.
        * Develop situational questions that relate to the responsibilities and challenges of the role, asking how the candidate would handle specific hypothetical scenarios.
        * Incorporate questions about the candidate's career goals and aspirations, and how this role fits into their career path.
        * Ensure that the questions are open-ended to encourage detailed responses and provide insight into the candidate's thought process and problem-solving abilities.
        * Balance the difficulty of the questions to be challenging but fair, considering the level of the position and the candidate's experience.
        * If do not have a job description, do not write job description, requirement, resume yourself.
        * Please create only 10 questions without any empty lines. Other than that you don't need anything else.

        Questions should be as follows:
        * [Question focusing on a specific skill or experience from the resume that is relevant to the job description]
        * [Behavioral question based on the candidate's past work experience or projects]
        * [Situational question relevant to the job responsibilities]
        * [Question about career aspirations and alignment with the role]
        * [Technical or role-specific question based on job requirements]
        * [Question exploring the candidate's problem-solving approach]
        * [Question about adapting to change or challenging work situations]
        * [Question on teamwork or collaboration, referencing past team experiences]
        * [Question assessing the candidate's motivation and work ethic]
        * [Question on staying updated with industry trends or continuous learning]

        Use the resume and job description details to create specific and relevant questions that effectively assess the candidate's suitability for the role
    '''

    description = (f"Resume: {resume}\nJob Description: {job}\n")

    messages = []
    messages.append({"role": "system", "content": prompt})
    messages.append({"role": "user", "content": description})

    chat_completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )

    question = chat_completion['choices'][0]['message']['content'].strip()

    return question


def generate_analysis(combinedQA):
    print('start analysis')
    prompt = '''
        You are an expert career coach. Please analyze the transcription of the user's responses to each of the 10 interview questions and answers provided from user and provide detailed feedback on their performance. For each response, assess the clarity, relevance, structure, and effectiveness of the answer. Additionally, provide sample answers for all questions using either the STAR or DRIVE method to serve as a guide for improvement.

        1. Clarity: Evaluate how clearly and concisely the user communicated their ideas. Suggest ways to improve clarity if needed.
        2. Relevance: Determine if the response directly addresses the question asked and is relevant to the job role. Provide tips on staying on topic or redirecting the answer if it strays off course.
        3. Structure: Check if the response is well-structured and organized. For each answer, provide an example answer using the STAR or DRIVE method as a model for structuring responses effectively.
            * For the STAR method: Situation (describe the context), Task (explain the challenge or task), Action (detail the actions taken), Result (share the outcome or results).
            * For the DRIVE method: Data (present relevant data or facts), Roadblocks (identify challenges faced), Insights (explain insights gained), Values (highlight values or skills demonstrated), Effect (describe the effect or outcome).
        4. Effectiveness: Assess the overall effectiveness of the response in showcasing the user's skills, experience, and suitability for the role. Offer suggestions for enhancing the impact of their answers.
        5. Feedback for Each Question: Provide specific feedback for each of the 10 responses. Highlight strengths, areas for improvement, and provide constructive criticism.
        6. Sample Answers: For each question, write a sample answer using either the STAR or DRIVE method, tailored to the job role and the user's background as described in their resume. This sample should serve as an example for how to effectively structure and deliver responses in future interviews.

        Your feedback should be encouraging yet honest, aiming to help the user improve their interview skills. Focus on actionable advice that the user can apply in their next mock interview or real interview situation.
    '''

    description = (f"Questions and Answers: {combinedQA}\n")

    messages = []
    messages.append({"role": "system", "content": prompt})
    messages.append({"role": "user", "content": description})
    print(messages)
    with open('log.txt', 'w') as file:
        file.write(str(messages))

    chat_completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )

    analysis = chat_completion['choices'][0]['message']['content'].strip()

    return analysis


def create_transcript_and_feedback():
    global conversation_history  # Assume this is a list of user-AI message pairs
    # Implement this function to get feedback from ChatGPT
    feedback = get_chat_feedback()

    # Combine transcript and feedback
    transcript = "\n".join(
        ["User: " + pair['user'] + "\nAI: " + pair['ai'] for pair in conversation_history])
    full_text = transcript + "\n\nFeedback:\n" + feedback
    return full_text


def get_chat_feedback():
    # Assuming conversation_history is a list of user-AI message pairs
    # and is accessible here (you might need to pass it as an argument)
    global conversation_history

    # Example logic to create a prompt for feedback generation
    feedback_prompt = "Based on the following interview transcript, provide 10 pieces of constructive feedback for the interviewee:\n\n"
    transcript = "\n".join(
        ["User: " + pair['user'] + "\nAI: " + pair['ai'] for pair in conversation_history])
    full_prompt = feedback_prompt + transcript

    # Generate feedback using ChatGPT or a similar model
    try:
        feedback_response = openai.Completion.create(
            engine="gpt-4",  # Use the appropriate model
            prompt=full_prompt,
            max_tokens=5000  # Adjust as needed
        )
        feedback_text = feedback_response.choices[0].text.strip()
    except Exception as e:
        print(f"Error generating feedback: {e}")
        feedback_text = "Unable to generate feedback at this time."

    return feedback_text


def get_chat_response(user_message):
    global question_count
    messages = []
    if user_message:
        messages.append({"role": "user", "content": user_message})

    # AI CHAT
    # openai.api_key = os.getenv("OPENAI_API_KEY") # Set above, remove later

    # Create initial or follow-up messages based on question_count
    if question_count == 0:
        messages.append({
            "role": "system",
            "content": "You are an interviewer and need to ask thorough and detailed questions. Keep answers very brief and 1 sentence maximum. Start a conversation by asking 1. which company I'm applying for"
        })
    else:
        messages.append({
            "role": "user",
            "content": user_message,
        })
        messages.append({
            "role": "system",
            "content": "You are a professional interviwer for the company, so continue the interview with only ONE follow-up question based on the user's reply. Make the questions difficult, specific and precise. Keep the follow up questions brief."
        })

    chat_completion = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages
    )

    parsed_response = chat_completion['choices'][0]['message']['content'].strip(
    )

    if question_count < max_question_count:
        question_count += 1  # Increment after processing a question # UPDATED-V1

    return parsed_response


def generate_prompt(messages):
    conversation = ""
    for message in messages:
        role = message["role"]
        content = message["content"]
        conversation += f"{role.capitalize()}: {content}\n"
    return conversation


if __name__ == "__main__" and True:
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug",
                workers=1)
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug",
    #             ssl_keyfile="ssl_private_key.pem", ssl_certfile="ssl_certificate.pem", workers=1)
