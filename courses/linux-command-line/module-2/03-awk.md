---
module: 2
position: 3
title: "awk: structured text processing"
objective: "Slice and aggregate text by columns."
estimated_minutes: 6
---

# awk: structured text processing

## What awk is for

`awk` is a tiny language for processing column-based or pattern-based text. The classic use case:

```
$ ps aux | awk '{print $2, $11}'
```

Print columns 2 and 11 from `ps` output. That's most uses of awk in one example.

For richer logic, awk supports variables, conditions, loops, and per-line/per-file blocks. Most people use 20% of awk; that's enough.

## Field-by-field operation

awk splits each input line into fields (default delimiter: whitespace). Reference them as `$1`, `$2`, etc. `$0` is the whole line. `NF` is the number of fields.

```
$ echo "apple banana cherry date" | awk '{print $1}'        # apple
$ echo "apple banana cherry date" | awk '{print $NF}'       # date
$ echo "apple banana cherry date" | awk '{print $2, $3}'    # banana cherry
$ echo "apple banana cherry" | awk '{print NF}'             # 3
```

For CSV / TSV, change the field separator:

```
$ awk -F',' '{print $1}' file.csv               # comma-separated
$ awk -F'\t' '{print $1}' file.tsv              # tab-separated
$ awk -F: '{print $1}' /etc/passwd              # colon-separated
```

`-F` (or `BEGIN{FS=...}`) sets the input field separator.

## Output field separator

`OFS` controls how `print` joins items:

```
$ awk -F',' '{OFS="\t"; print $1, $2}' file.csv     # CSV → TSV
$ awk -F',' 'BEGIN{OFS="|"} {print $1, $2}' file.csv
```

Defaults: input separator is whitespace, output is space.

## Patterns and actions

Each awk program is a series of `pattern { action }` pairs:

```
$ awk '/error/ {print $0}' log.txt              # print lines matching "error"
$ awk '/error/ {count++} END {print count}' log.txt
$ awk 'NR==1 {print}' file.txt                  # only line 1
$ awk 'NR>1' file.txt                           # skip header
$ awk '$3 > 100' file.txt                       # rows where column 3 > 100
$ awk 'length > 80' file.txt                    # lines longer than 80 chars
```

When pattern matches, action runs. Default action is `print $0`.

## BEGIN and END

Special patterns. `BEGIN` runs before processing; `END` after.

```
$ awk 'BEGIN{print "Starting"} {total+=$1} END{print "Sum:", total}' nums.txt
```

Use BEGIN for headers and setup; END for totals and summary.

## Variables

awk has built-in variables and supports your own:

```
NR    # record (line) number
NF    # number of fields in current line
FS    # field separator (default: whitespace)
OFS   # output field separator
RS    # record separator (default: newline)
FILENAME  # current file
```

User variables don't need declaration:

```
$ awk '{sum += $1; count++} END {print sum/count}' nums.txt
```

awk auto-initializes numeric variables to 0, strings to "".

## Conditions and arithmetic

```
$ awk '$2 > 100 && $3 < 500' data.txt          # column 2 > 100 AND column 3 < 500
$ awk '$1 == "ERROR"' log.txt                  # column 1 exactly "ERROR"
$ awk '$1 ~ /^E/' log.txt                      # column 1 starts with E
$ awk '$1 !~ /^#/' config                      # column 1 NOT starting with #
$ awk '{print $1, $2*1.05}' prices.txt         # 5% markup
```

`==` `!=` for equality, `<` `>` for comparison, `~` `!~` for regex match.

## Common idioms

**Sum a column:**

```
$ awk '{sum+=$1} END{print sum}' file.txt
```

**Average a column:**

```
$ awk '{sum+=$1; n++} END{print sum/n}' file.txt
```

**Count unique values:**

```
$ awk '{count[$1]++} END {for (k in count) print k, count[k]}' file.txt
```

**Max of a column:**

```
$ awk 'NR==1{max=$1} $1>max{max=$1} END{print max}' file.txt
```

**Print last column:**

```
$ awk '{print $NF}' file.txt
```

**Print all but first column:**

```
$ awk '{$1=""; print substr($0,2)}' file.txt
```

**Reverse two columns:**

```
$ awk '{print $2, $1}' file.txt
```

## Practical examples

**Get PIDs of all python processes:**

```
$ ps aux | awk '/python/ && !/grep/ {print $2}'
```

**Calculate disk usage of largest directories:**

```
$ du -sh */ | sort -rh | awk '{print $1, $2}' | head -10
```

**Filter log by status code:**

```
$ awk '$9 >= 500 {print}' access.log               # 5xx errors only
$ awk '$9 == "200"' access.log                     # successful requests
```

(For nginx-style logs where column 9 is status code.)

**Count requests per IP:**

```
$ awk '{count[$1]++} END {for (ip in count) print count[ip], ip}' access.log | sort -rn | head
```

**Sum HTTP traffic:**

```
$ awk '{bytes += $10} END {print bytes/1024/1024 " MB"}' access.log
```

## When awk isn't enough

For multi-line state machines, complex parsing, or anything requiring a real data structure, switch to Python or a real script. awk shines at "filter and aggregate column-based text"; outside that, code is clearer.

For JSON: don't try awk. Use `jq` (next lesson).

For CSV with embedded commas or quotes: don't try awk. Use Python's `csv` module or `csvkit`.

## sed vs awk

- **sed:** Substitution and line-level transformations.
- **awk:** Field-level processing and aggregation.

They compose well:

```
$ cat log.txt | awk '{print $4}' | sed 's/[0-9]*$//' | sort | uniq -c
```

Pick the right tool per step.

## Mistakes to avoid

- **Forgetting field separator.** `-F','` for CSV; default is whitespace.
- **Using awk for JSON.** Use jq.
- **Quoting hell in shell scripts.** awk programs with shell variables: use `awk -v var="$shell_var" '{ ... var ... }'` to pass variables in safely.
- **Trying multi-line state in awk.** Possible but ugly; Python is clearer.

## Summary

- `awk` processes text by fields. `$1`, `$2`, `$NF`, `NF`, `NR` are the key variables.
- `-F','` (or BEGIN{FS=}) for non-whitespace separators.
- `BEGIN { }` and `END { }` for setup and summary.
- Patterns: `/regex/`, `$2 > 100`, `NR > 1`, etc.
- Common: sum a column, count uniques, filter by condition, max/min.
- For JSON, use jq; for complex parsing, use Python.

Next: jq for JSON in the shell.
