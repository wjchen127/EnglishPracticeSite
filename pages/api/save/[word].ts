import type { NextApiRequest, NextApiResponse } from "next"
import { writeFile, readFile } from "fs/promises"
const path = require("path")

interface FsErrorType extends Error {
    code: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const __dirname = path.resolve()
    const filePath = path.join(__dirname, "vocabulary.txt")
    const { word } = req.query
    const wordCount = new Map()
    try {
        // 讀取檔案
        const data = await readFile(filePath, "utf8")

        // 將每一行的單字及數字分別解析出來
        const lines = data.trim().split("\n")
        lines.forEach((line) => {
            const [word, countStr] = line.split(" ")
            const count = parseInt(countStr, 10)
            wordCount.set(word, count)
        })

        // 根據需要進行增減操作
        if (wordCount.has(word)) {
            const count = wordCount.get(word)! + 1
            wordCount.set(word, count)
        } else {
            wordCount.set(word, 1)
        }

        if (wordCount.size != 0) {
            // 將 Map 中的資料轉換為字串，寫回檔案
            const output = Array.from(wordCount.entries())
                .map(([word, count]) => (word && count ? `${word} ${count}` : ""))
                .join("\n")
            // 寫入檔案
            await writeFile(filePath, output, "utf8")
        }

        res.send("success")
    } catch (err) {
        console.log(__dirname)
        console.log(filePath)
        res.send("fail")
        if (err && (err as FsErrorType).code === "ENOENT") {
            console.log("file is not exist.")
        }
    }
}
