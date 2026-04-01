import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function App() {

  const templates = {
    python: `print("Hello Python")`,
    javascript: `console.log("Hello JS");`,
    java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello Java");
  }
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
  cout << "Hello C++";
  return 0;
}`,
    c: `#include <stdio.h>
int main() {
  printf("Hello C");
  return 0;
}`,
    typescript: `let msg: string = "Hello TS";
console.log(msg);`
  };

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(templates["python"]);
  const [output, setOutput] = useState("");
  const [mentorOutput, setMentorOutput] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  // ✅ NEW THEME STATE
  const [darkMode, setDarkMode] = useState(true);

  const changeLang = (lang) => {
    setLanguage(lang);
    setCode(templates[lang]);
    setOutput("");
    setMentorOutput("");
    setShowCompare(false);
  };

  const runCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/run", { code, language });
    setOutput(res.data.output);
    setShowCompare(false);
  };

  const analyzeCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/analyze", { code, language });
    setOutput(res.data.output);
    setShowCompare(false);
  };

  const fixCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/fix", { code, language });
    setFixedCode(res.data.fixed);
    setShowCompare(true);
  };

  const getMentor = async () => {
    const res = await axios.post("http://127.0.0.1:8000/mentor", { code, language });
    setMentorOutput(res.data.mentor);
  };

  return (
    <div style={{
      height: "100vh",
      background: darkMode ? "#0b0f1a" : "#f8fafc",
      color: darkMode ? "#e2e8f0" : "#0f172a",
      fontFamily: "sans-serif",
      transition: "0.3s"
    }}>

      {/* 🔥 NAVBAR */}
      <div style={{ ...nav, background: darkMode ? "#0f172a" : "#e2e8f0" }}>
        <div style={{ fontSize: "26px", fontWeight: "bold" }}>{"</>"} CodeLit</div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select value={language} onChange={(e) => changeLang(e.target.value)} style={dropdown}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="typescript">TypeScript</option>
          </select>

          {/* ✅ TOGGLE BUTTON */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: darkMode ? "#facc15" : "#1e293b",
              color: darkMode ? "black" : "white"
            }}
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>

      {/* 🔥 TOOLBAR */}
      <div style={toolbar}>
        <button style={runBtn} onClick={runCode}>▶ Run</button>
        <button style={explainBtn} onClick={analyzeCode}>🧠 Explain</button>
        <button style={fixBtn} onClick={fixCode}>⚡ Fix</button>
        <button style={mentorBtn} onClick={getMentor}>👨‍🏫 Mentor</button>
        <button style={clearBtn} onClick={() => {
          setOutput("");
          setMentorOutput("");
          setShowCompare(false);
        }}>🗑 Clear</button>
      </div>

      {/* 🔥 MAIN */}
      <div style={{ display: "flex", height: "85%" }}>

        <div style={{ width: "65%", padding: "10px" }}>
          <div style={{ ...fileTab, background: darkMode ? "#1e293b" : "#e2e8f0" }}>
            main.{language === "cpp" ? "cpp" : language}
          </div>

          <Editor
            height="100%"
            theme={darkMode ? "vs-dark" : "light"}   // ✅ THEME SWITCH
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(val) => setCode(val)}
            options={{ fontSize: 20 }}
          />
        </div>

        <div style={{ width: "35%", borderLeft: "1px solid #1e293b" }}>

          <div style={{ ...panel, background: darkMode ? "#020617" : "#ffffff" }}>
            <h3>⚡ OUTPUT</h3>

            {showCompare ? (
              <>
                <b>❌ Original</b>
                <pre style={{ ...pre, background: darkMode ? "#1e293b" : "#e2e8f0" }}>{code}</pre>

                <b>✅ Fixed</b>
                <pre style={{ ...pre, background: "#022c22" }}>{fixedCode}</pre>

                <button
                  style={{
                    marginTop: "10px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setCode(fixedCode);
                    setShowCompare(false);
                    setOutput("✅ Fixed code applied!");
                  }}
                >
                  ✅ Use Fixed Code
                </button>
              </>
            ) : (
              <pre style={{ ...pre, background: darkMode ? "#1e293b" : "#e2e8f0" }}>
                {output || "Run your code to see output..."}
              </pre>
            )}
          </div>

          <div style={{ ...panel, background: darkMode ? "#020617" : "#ffffff" }}>
            <h3>🧠 AI MENTOR</h3>
            <pre style={{ ...pre, background: darkMode ? "#1e293b" : "#e2e8f0" }}>
              {mentorOutput || "Click Mentor to get feedback"}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}

/* STYLES (UNCHANGED) */
const nav = {
  height: "65px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 25px",
  borderBottom: "1px solid #1e293b"
};

const toolbar = {
  display: "flex",
  gap: "12px",
  padding: "12px"
};

const dropdown = {
  background: "#1e293b",
  color: "white",
  padding: "8px",
  fontSize: "16px",
  borderRadius: "8px"
};

const runBtn = { background: "#16a34a", padding: "10px 18px", fontSize: "15px", borderRadius: "10px", border: "none" };
const explainBtn = { background: "#0ea5e9", padding: "10px 18px", fontSize: "15px", borderRadius: "10px", border: "none" };
const fixBtn = { background: "#9333ea", padding: "10px 18px", fontSize: "15px", borderRadius: "10px", border: "none" };
const mentorBtn = { background: "#f59e0b", padding: "10px 18px", fontSize: "15px", borderRadius: "10px", border: "none" };
const clearBtn = { background: "#dc2626", padding: "10px 18px", fontSize: "15px", borderRadius: "10px", border: "none" };

const panel = {
  padding: "18px",
  borderBottom: "1px solid #1e293b",
  height: "50%",
  overflow: "auto"
};

const fileTab = {
  padding: "8px 12px",
  borderRadius: "8px",
  marginBottom: "6px",
  fontSize: "15px"
};

const pre = {
  padding: "12px",
  fontSize: "15px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap"
};