# Grade 3 PDF + Sentence Feature State

## Current status

Candidate implementation complete on `feature/third-grade-pdf-sentences`; ready
for independent QA.

## Delivered in this candidate

- A backwards-compatible optional data extension:
  `|| 关联组词 || 造句` after the existing group-word fields.
- Parser output shaped as `character.sentence = { groupWord, text }` when those
  optional fields are present. Existing textbook files without them continue to
  produce `sentence: null`.
- A visible `造句` card on the 生字学习 detail page, including the linked group
  word.
- 250/250 current 三年级上册 entries carry a linked first group word and an
  in-sentence occurrence of that word.
- `scripts/validate-grade3-sentences.pl` for repeatable completeness and legacy
  compatibility verification, plus an idempotent sentence-field population tool.

## BLOCKED: requested PDF curriculum replacement

The user-provided PDF itself is not available in the workspace, `/tmp`, local
Git history, or the available remote baseline. Therefore `生字数据.txt` has not
been represented as a PDF-derived replacement. Its current words are preserved,
and its sentence fields are explicitly provisional data that can be replaced
without any application-code change once the PDF is supplied.

## Verification run

```text
perl -c scripts/populate-grade3-sentence-fields.pl
perl -c scripts/validate-grade3-sentences.pl
perl scripts/validate-grade3-sentences.pl
# PASS: 250 / 250 Grade 3 Upper characters have a linked sentence;
#       600 legacy entries across 3 populated textbook files remain parseable.
git diff --check
```

`node` is not installed in this execution environment, so browser JavaScript
syntax/runtime validation remains a QA follow-up; the data validator is runnable
locally with the installed Perl runtime.
