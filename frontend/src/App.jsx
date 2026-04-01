import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function App() {

  // 🔥 Templates
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

  // 🔥 STATES
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(templates["python"]);
  const [output, setOutput] = useState("");
  const [mentorOutput, setMentorOutput] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  // 🔁 CHANGE LANGUAGE
  const changeLang = (lang) => {
    setLanguage(lang);
    setCode(templates[lang]);
    setOutput("");
    setMentorOutput("");
    setShowCompare(false);
  };

  // ▶ RUN
  const runCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/run", { code, language });
    setOutput(res.data.output);
    setShowCompare(false);
  };

  // 🔍 ANALYZE
  const analyzeCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/analyze", { code, language });
    setOutput(res.data.output);
    setShowCompare(false);
  };

  // ⚡ FIX
  const fixCode = async () => {
    const res = await axios.post("http://127.0.0.1:8000/fix", { code, language });
    setFixedCode(res.data.fixed);
    setShowCompare(true);
  };

  // 🧠 MENTOR
  const getMentor = async () => {
    const res = await axios.post("http://127.0.0.1:8000/mentor", { code, language });
    setMentorOutput(res.data.mentor);
  };

  return (
    <div style={{ height: "100vh", background: "#0b0f1a", color: "#e2e8f0", fontFamily: "sans-serif" }}>

      {/* 🔥 NAVBAR */}
      <div style={nav}>
        <div style={{ fontSize: "26px", fontWeight: "bold" }}>{"</>"} CodeLit</div>

        <select value={language} onChange={(e) => changeLang(e.target.value)} style={dropdown}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="typescript">TypeScript</option>
        </select>
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

        {/* EDITOR */}
        <div style={{ width: "65%", padding: "10px" }}>
          <div style={fileTab}>main.{language === "cpp" ? "cpp" : language}</div>

          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(val) => setCode(val)}
            options={{ fontSize: 20 }}  // 🔥 BIGGER FONT
          />
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: "35%", borderLeft: "1px solid #1e293b" }}>

          {/* OUTPUT */}
          <div style={panel}>
            <h3>⚡ OUTPUT</h3>

            {showCompare ? (
  <>
    <b>❌ Original</b>
    <pre style={pre}>{code}</pre>

    <b>✅ Fixed</b>
    <pre style={{ ...pre, background: "#022c22" }}>{fixedCode}</pre>

    {/* ✅ ADDED BUTTON */}
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
              <pre style={pre}>{output || "Run your code to see output..."}</pre>
            )}
          </div>

          {/* MENTOR */}
          <div style={panel}>
            <h3>🧠 AI MENTOR</h3>
            <pre style={pre}>
              {mentorOutput || "Click Mentor to get feedback"}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const nav = {
  height: "65px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 25px",
  background: "#0f172a",
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
  background: "#1e293b",
  padding: "8px 12px",
  borderRadius: "8px",
  marginBottom: "6px",
  fontSize: "15px"
};

const pre = {
  background: "#1e293b",
  padding: "12px",
  fontSize: "15px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap"
};