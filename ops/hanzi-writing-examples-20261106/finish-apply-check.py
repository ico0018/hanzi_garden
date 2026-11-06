"""Apply manual lists; preserve source fields except two authorized reading corrections."""
import hashlib
import json
from copy import deepcopy
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
BOOKS = {"2026-2-lower": "two", "2026-3-lower": "three"}
USAGE = {
    "2026-2-lower": {
        "邓": "姓氏用法，两条自然称呼短语。",
        "芬": "常用固定词素以芬芳为主，采用自然用法短语。",
        "吴": "姓氏用法，两条自然称呼短语。",
        "佛": "教材为fú，固定词仿佛，采用两条自然短语。",
    },
    "2026-3-lower": {
        "鸳": "常用固定词鸳鸯，采用两条自然用法短语。",
        "鸯": "常用固定词鸳鸯，采用两条自然用法短语。",
        "匕": "常用固定词匕首，采用两条自然用法短语。",
        "系": "教材为jì，采用两条明确读jì的动作短语。",
        "屿": "常用固定词岛屿，采用两条自然用法短语。",
        "嗽": "常用固定词咳嗽，采用两条自然用法短语；词中正常轻声不改变教材本音。",
    },
}
EXTRA_ROOT = {"learningSupportVersion", "learningSupport"}
EXTRA_CHAR = {"words", "sentence", "examplesLabel"}


def textbook_only(data):
    result = {k: v for k, v in data.items() if k not in EXTRA_ROOT}
    result["lessons"] = [
        {**lesson, "characters": [
            {k: v for k, v in char.items() if k not in EXTRA_CHAR}
            for char in lesson["characters"]
        ]}
        for lesson in data["lessons"]
    ]
    return result


report = {"base": "1c23f78", "books": {}, "checks": [], "usageExceptions": USAGE}
report["authorizedSourceCorrections"] = [{
    "bookId": "2026-3-lower", "lessonKey": "18", "characterIndex": 4, "char": "膀",
    "pinyin": {"before": "páng", "after": "bǎng"},
    "readingPhrase": {"before": None, "after": "翅膀"},
    "basis": "Manager与QA核同册印刷117/PDF121第18组词表翅膀；教育部国语辞典简编本ID1141；Manager明确授权仅此两字段纠错。",
}, {
    "bookId": "2026-3-lower", "lessonKey": "16", "characterIndex": 1, "char": "卜",
    "pinyin": {"before": "bǔ", "after": "bo"},
    "readingPhrase": {"before": None, "after": "萝卜"},
    "basis": "Manager与QA核同册原词表第16组第1词胡萝卜、同课胡萝卜先生长胡子；中科院植物智萝卜luó bo；Manager明确授权仅此两字段纠错，四下卜bǔ不变。",
}]
for book, name in BOOKS.items():
    relative = f"writing-tables/{book}.json"
    path = ROOT / relative
    baseline = json.loads(subprocess.check_output(
        ["git", "show", f"1c23f78:{relative}"], cwd=ROOT
    ).decode("utf-8"))
    data = json.loads(path.read_text(encoding="utf-8"))
    expected = deepcopy(baseline)
    if book == "2026-3-lower":
        old_lesson = next(lesson for lesson in expected["lessons"] if lesson["lessonKey"] == "18")
        old_chars = old_lesson["characters"]
        assert "".join(char["char"] for char in old_chars) == "垂染碎翅膀拔浪抖"
        assert old_chars[4] == {"char": "膀", "pinyin": "páng"}
        old_chars[4]["pinyin"] = "bǎng"
        old_chars[4]["readingPhrase"] = "翅膀"
        current_lesson = next(lesson for lesson in data["lessons"] if lesson["lessonKey"] == "18")
        current_char = current_lesson["characters"][4]
        assert current_char["char"] == "膀"
        current_char["pinyin"] = "bǎng"
        current_char["readingPhrase"] = "翅膀"
        old_lesson = next(lesson for lesson in expected["lessons"] if lesson["lessonKey"] == "16")
        old_chars = old_lesson["characters"]
        assert "".join(char["char"] for char in old_chars) == "萝卜愁浓够确段系姐"
        assert old_chars[1] == {"char": "卜", "pinyin": "bǔ"}
        old_chars[1]["pinyin"] = "bo"
        old_chars[1]["readingPhrase"] = "萝卜"
        current_lesson = next(lesson for lesson in data["lessons"] if lesson["lessonKey"] == "16")
        current_char = current_lesson["characters"][1]
        assert current_char["char"] == "卜"
        current_char["pinyin"] = "bo"
        current_char["readingPhrase"] = "萝卜"
    rows = [line.split("|") for line in (OUT / f"finish-{name}-lower.tsv").read_text(encoding="utf-8").splitlines() if line]
    characters = [char for lesson in data["lessons"] for char in lesson["characters"]]
    assert len(rows) == len(characters) == data["total"] == 250
    for index, (char, row) in enumerate(zip(characters, rows), 1):
        assert len(row) == 4, (book, index, row)
        key, first, second, sentence = row
        assert key == char["char"], (book, index, key, char["char"])
        assert first != second and all(key in word for word in (first, second)), (book, index)
        group = next((word for word in (first, second) if word in sentence), None)
        assert group and sentence.endswith("。"), (book, index, sentence)
        char["words"] = [{"word": word, "pinyin": "", "meaning": ""} for word in (first, second)]
        char["sentence"] = {"groupWord": group, "text": sentence}
        if key in USAGE[book]:
            char["examplesLabel"] = "用法示例"
            for word in char["words"]:
                word["kind"] = "usage"
    data["learningSupportVersion"] = 1
    data["learningSupport"] = {
        "type": "author-created-supplement",
        "note": "组词与例句为教学补充；例句为自编内容，不是教材原文。",
    }
    assert textbook_only(data) == textbook_only(expected), book
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report["books"][book] = {
        "positions": len(characters), "words": len(characters) * 2,
        "sentences": len(characters), "usagePositions": len(USAGE[book]),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "textbookFieldsMatchAuthorizedBaseline": True,
        "originalFieldExceptions": [] if book == "2026-2-lower" else ["lessonKey=18, characters[4].pinyin:páng→bǎng", "lessonKey=18, characters[4].readingPhrase:absent→翅膀", "lessonKey=16, characters[1].pinyin:bǔ→bo", "lessonKey=16, characters[1].readingPhrase:absent→萝卜"],
        "manualReview": "人工编写并逐项审查目标读音；QA已完成500条通读并认可膀/卜两处纠错，本次定向新提交待精确复核。",
    }
all_position_keys = []
baseline_position_keys = []
for path in sorted((ROOT / "writing-tables").glob("2026-*.json")):
    relative = path.relative_to(ROOT).as_posix()
    original = json.loads(subprocess.check_output(["git", "show", f"1c23f78:{relative}"], cwd=ROOT).decode("utf-8"))
    expected = deepcopy(original)
    current = json.loads(path.read_text(encoding="utf-8"))
    for correction in report["authorizedSourceCorrections"]:
        if expected["bookId"] != correction["bookId"]:
            continue
        lesson = next(lesson for lesson in expected["lessons"] if lesson["lessonKey"] == correction["lessonKey"])
        char = lesson["characters"][correction["characterIndex"]]
        assert char == {"char": correction["char"], "pinyin": correction["pinyin"]["before"]}
        char["pinyin"] = correction["pinyin"]["after"]
        char["readingPhrase"] = correction["readingPhrase"]["after"]
    assert textbook_only(current) == textbook_only(expected), relative
    for data, keys in ((current, all_position_keys), (original, baseline_position_keys)):
        keys.extend((data["bookId"], lesson["lessonKey"], index, char["char"])
                    for lesson in data["lessons"] for index, char in enumerate(lesson["characters"]))
assert len(all_position_keys) == 2500
assert all_position_keys == baseline_position_keys
report["all12BookPreservation"] = {"positions": 2500, "stablePositionKeysUnchanged": True, "originalFieldsMatchStrictTwoCharacterAllowlist": True, "other2498PositionsUnchanged": True}
report["checks"] = [
    "Each book has exactly 250 positions in original order.",
    "All 2500 original position keys are unchanged. All 12 books' original fields equal base 1c23f78, except two precise corrections in 2026-3-lower: lessonKey18 index4 膀 páng→bǎng/readingPhrase翅膀; lessonKey16 index1 卜 bǔ→bo/readingPhrase萝卜. No other pinyin or readingPhrase difference is allowed; 2026-4-lower 卜 remains bǔ.",
    "Each position has exactly two distinct entries containing its target character.",
    "Each sentence contains its selected groupWord, which is one of the two entries.",
    "All unverified word pinyin and meaning remain empty.",
    "Limited morphemes and phrases are explicitly labelled 用法示例 and kind:usage.",
]
(OUT / "finish-check-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"books": report["books"], "positions": 500, "entries": 1000, "sentences": 500}, ensure_ascii=False))
