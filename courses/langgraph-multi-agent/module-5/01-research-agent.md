---
module: 5
position: 1
title: "Research agent — web search + synthesis"
objective: "Build an agent that researches topics autonomously."
estimated_minutes: 5
---

# Research agent — web search + synthesis

## Architecture

Nodes:
1. **Planner.** Breaks query into sub-questions.
2. **Searcher.** Web search per sub-question (parallel).
3. **Evaluator.** Checks if results sufficient.
4. **Searcher (loop).** More search if not.
5. **Synthesizer.** Compiles answer with citations.

State: query, sub_questions, search_results, evaluation, answer.

## Tools

- Web search (Tavily, Brave, SerpAPI).
- URL content fetcher.
- Optional: PDF reader for sources.

## Planner prompt

```
Break this question into 2-4 sub-questions for parallel research:
{query}

Return JSON: ["question 1", "question 2", ...]
```

For: focused parallel searches.

## Searcher node

```python
def search_node(state):
    results = []
    for q in state["sub_questions"]:
        results.append(web_search(q))
    return {"search_results": results}
```

Use Send for true parallel.

## Evaluator

LLM checks coverage:
```python
def evaluate(state):
    response = llm.invoke(f"Sufficient to answer {state['query']}? {state['search_results']}")
    if response == "yes":
        return "synthesize"
    else:
        return "more_search"
```

## Synthesizer

```python
def synthesize(state):
    prompt = f"""
    Answer: {state['query']}
    
    Using only these sources:
    {state['search_results']}
    
    Cite sources [1], [2], etc. Include source URLs.
    """
    return {"answer": llm.invoke(prompt)}
```

## Real production: Perplexity-style

Inspired by Perplexity / Search GPT:
- Planner + parallel search + evaluation + synthesize + cite.
- Iterative refinement if gaps.
- Standard research agent pattern.

## Mistakes to avoid

- **Single search call.** Miss context.
- **No evaluation loop.** Bad answers ship.
- **No citations.** Untrustworthy.

## Summary

- Planner → parallel search → evaluate → maybe loop → synthesize.
- Web search + content fetch tools.
- Cite sources always.
- Standard research agent architecture.

Next: code agent.
