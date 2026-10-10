const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const sources = { "2-lower": "221", "4-upper": "411", "4-lower": "421", "5-upper": "511", "5-lower": "521", "6-upper": "611", "6-lower": "621" };

function wordEntries(bookId) {
  const volume = JSON.parse(fs.readFileSync(path.join(root, `curriculum/renjiao/${sources[bookId]}.json`), "utf8")).grades[0].volumes[0];
  const seenBlocks = new Set();
  return volume.words.filter(entry => {
    // 421 has four copied whole-lesson blocks. Remove only exact copies, not
    // repeated words occurring in distinct legitimate lessons.
    const identity = JSON.stringify(entry);
    if (bookId === "4-lower" && seenBlocks.has(identity)) return false;
    seenBlocks.add(identity);
    return true;
  });
}

function buildBank(bookId) {
  const output = ["# 可编辑教材词语表：每行一个词；# 开头的课次说明不进入听写。",
    "# 来源：shukong-app 68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4 volume.words；2019版转录，待核对教材原页。"];
  if (bookId === "4-lower") output.push("# 未齐：原转录缺课；剔除重复复制的第2、3、5、6课块，不自行生成缺课词语。");
  for (const entry of wordEntries(bookId)) {
    output.push(`# ${entry.lesson}`);
    for (const characters of entry.characters) {
      const rawWord = characters.map(item => item.character).join("");
      // Documented obvious transcription erratum; retain original JSON for audit.
      const word = bookId === "5-lower" && rawWord === "露馅儿子" ? "露馅儿" : rawWord;
      if (!word || characters.some(item => !item.character)) throw new Error(`Invalid source word: ${bookId}/${entry.lesson}`);
      output.push(word);
    }
  }
  return output.join("\n") + "\n";
}

if (require.main === module) {
  if (process.argv.includes("--patch")) {
    console.log("*** Begin Patch");
    for (const bookId of Object.keys(sources)) {
      console.log(`*** Add File: ${path.join(root, `curriculum/renjiao/words-${bookId}.txt`).replace(/\\/g, "/")}`);
      console.log(buildBank(bookId).trimEnd().split("\n").map(line => "+" + line).join("\n"));
    }
    console.log("*** End Patch");
  } else {
    for (const bookId of Object.keys(sources)) {
      if (fs.readFileSync(path.join(root, `curriculum/renjiao/words-${bookId}.txt`), "utf8").replace(/\r\n/g, "\n") !== buildBank(bookId)) {
        throw new Error(`${bookId}: bank differs from source export (possibly an intentional manual edit)`);
      }
      console.log(`${bookId}: exact source export PASS`);
    }
  }
}
module.exports = { sources, wordEntries, buildBank };
