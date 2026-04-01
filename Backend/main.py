from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# 🔥 IMPORTANT: use NVIDIA base_url
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str


# ---------------- RUN FUNCTIONS ----------------

def run_python(code):
    with open("temp.py", "w") as f:
        f.write(code)
    result = subprocess.run("python temp.py", shell=True, capture_output=True, text=True)
    return result.stdout or result.stderr


def run_c(code):
    with open("temp.c", "w") as f:
        f.write(code)

    compile = subprocess.run("gcc temp.c -o temp.exe", shell=True, capture_output=True, text=True)
    if compile.returncode != 0:
        return compile.stderr

    run = subprocess.run("temp.exe", shell=True, capture_output=True, text=True)
    return run.stdout or run.stderr


def run_cpp(code):
    with open("temp.cpp", "w") as f:
        f.write(code)

    compile = subprocess.run("g++ temp.cpp -o temp.exe", shell=True, capture_output=True, text=True)
    if compile.returncode != 0:
        return compile.stderr

    run = subprocess.run("temp.exe", shell=True, capture_output=True, text=True)
    return run.stdout or run.stderr


def run_java(code):
    with open("Main.java", "w") as f:
        f.write(code)

    compile = subprocess.run("javac Main.java", shell=True, capture_output=True, text=True)
    if compile.returncode != 0:
        return compile.stderr

    run = subprocess.run("java Main", shell=True, capture_output=True, text=True)
    return run.stdout or run.stderr


def run_js(code):
    with open("temp.js", "w") as f:
        f.write(code)

    run = subprocess.run("node temp.js", shell=True, capture_output=True, text=True)
    return run.stdout or run.stderr


def run_ts(code):
    with open("temp.ts", "w") as f:
        f.write(code)

    compile = subprocess.run("tsc temp.ts", shell=True, capture_output=True, text=True)
    if compile.returncode != 0:
        return compile.stderr

    run = subprocess.run("node temp.js", shell=True, capture_output=True, text=True)
    return run.stdout or run.stderr


# ---------------- ROUTES ----------------

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}


@app.post("/run")
def run_code(req: CodeRequest):
    lang = req.language.lower()

    if lang == "python":
        return {"output": run_python(req.code)}

    elif lang == "c":
        return {"output": run_c(req.code)}

    elif lang == "cpp":
        return {"output": run_cpp(req.code)}

    elif lang == "java":
        return {"output": run_java(req.code)}

    elif lang == "javascript":
        return {"output": run_js(req.code)}

    elif lang == "typescript":
        return {"output": run_ts(req.code)}

    return {"output": "Language not supported"}


# 🔥 AI ANALYSIS (THIS WAS MISSING)
@app.post("/analyze")
def analyze_code(req: CodeRequest):
    try:
        response = client.chat.completions.create(
            model="meta/llama3-8b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert coding mentor. Find errors and explain them clearly."
                },
                {
                    "role": "user",
                    "content": f"Analyze this {req.language} code and explain errors:\n\n{req.code}"
                }
            ],
            temperature=0.5,
            max_tokens=500
        )

        return {"output": response.choices[0].message.content}

    except Exception as e:
        return {"output": str(e)}
@app.post("/fix")
def fix_code(req: CodeRequest):
    try:
        response = client.chat.completions.create(
            model="meta/llama3-8b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "Fix the code and return ONLY corrected code. No explanation."
                },
                {
                    "role": "user",
                    "content": f"Fix this {req.language} code:\n\n{req.code}"
                }
            ],
            temperature=0.2,
            max_tokens=500
        )

        return {"fixed": response.choices[0].message.content}

    except Exception as e:
        return {"fixed": "Error: " + str(e)}
@app.post("/mentor")
def mentor_code(req: CodeRequest):
    try:
        response = client.chat.completions.create(
            model="meta/llama3-8b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a senior coding mentor.

Analyze the given code and respond in this structured format:

1. Strengths (what is good)
2. Weaknesses (mistakes, bad practices)
3. Suggestions (how to improve)
4. Code Quality Score (out of 10)
5. Learning Tips (what the student should learn next)

Be concise but clear. No extra text.
"""
                },
                {
                    "role": "user",
                    "content": f"Analyze this {req.language} code:\n\n{req.code}"
                }
            ],
            temperature=0.4,
            max_tokens=700
        )

        return {"mentor": response.choices[0].message.content}

    except Exception as e:
        return {"mentor": "Error: " + str(e)}