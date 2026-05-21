---
module: 5
position: 2
title: "Code agent — generate, test, iterate"
objective: "Build agent that writes and refines code."
estimated_minutes: 5
---

# Code agent — generate, test, iterate

## Architecture

Nodes:
1. **Planner.** Breaks task into code requirements.
2. **Coder.** Generates code.
3. **Executor.** Runs code; captures output / errors.
4. **Reviewer.** Checks correctness.
5. **Loop.** If errors / fails, back to coder with feedback.

For: autonomous code generation with self-correction.

## Tools

- Code execution sandbox (Python interpreter, Node.js, etc.).
- File read/write.
- Optional: web search for docs.

## Sandboxing

Critical: never run untrusted code on host system.
- **E2B.** Sandbox API.
- **Modal.** Containerized exec.
- **Local Docker** sandbox.
- **Python subprocess with limits.**

For: safe execution.

## Coder node

```python
def coder(state):
    prompt = f"""
    Task: {state['task']}
    
    Previous attempts: {state.get('history', [])}
    Errors: {state.get('errors', [])}
    
    Write Python code:
    """
    code = llm.invoke(prompt)
    return {"code": code}
```

## Executor

```python
def executor(state):
    try:
        result = sandbox.exec(state["code"])
        return {"output": result, "success": True}
    except Exception as e:
        return {"errors": [str(e)], "success": False}
```

## Loop until success

```python
def route(state):
    if state["success"] and state.get("verified"):
        return END
    if len(state.get("attempts", [])) > 5:
        return END  # Give up
    return "coder"  # Try again
```

For: iterative refinement.

## Real production: Cursor / Aider / SWE-agent

Inspired by:
- **Cursor.** IDE-integrated AI coding.
- **Aider.** CLI coding assistant.
- **SWE-agent.** Autonomous bug fixing.
- **GitHub Copilot Workspace.**

All use plan → code → execute → review loops.

## Mistakes to avoid

- **No sandboxing.** Security disaster.
- **No iteration limit.** Loops forever.
- **No error feedback to coder.** Doesn't learn.

## Summary

- Plan → code → execute → review → loop.
- Sandboxing essential.
- Iteration limit + error feedback.
- Production patterns: Cursor, Aider, SWE-agent.

Next: customer support agent.
