import type { NextApiRequest, NextApiResponse } from "next"
import { writeFile, readFile } from "fs/promises"
import path from "path"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { referer } = req.headers
        const receviedObj = req.body
        const filePath = "./wordCount.txt"
        console.log(receviedObj)
        if (receviedObj && referer) {
            try {
                let data
                try {
                    // 讀取檔案
                    data = await readFile(filePath, "utf8")
                } catch (err: any) {
                    if (err && err.code === "ENOENT") {
                        console.log("File is not exist. Automatically generated one.")
                        data = ""
                        await writeFile(filePath, data, "utf8")
                    } else {
                        throw err
                    }
                }

                if (typeof data !== "undefined") {
                    // 將每一行的單字及數字分別解析出來
                    const lines = data.trim().split("\n")
                    const wordCount = new Map()
                    lines.forEach((line) => {
                        const [word, countStr] = line.split(" ")
                        const count = parseInt(countStr, 10)
                        wordCount.set(word, count)
                    })

                    // 根據需要進行增減操作
                    Object.keys(receviedObj).forEach((word) => {
                        if (wordCount.has(word)) {
                            const count = wordCount.get(word) + receviedObj[word]
                            wordCount.set(word, count)
                        } else {
                            wordCount.set(word, receviedObj[word])
                        }
                    })

                    if (wordCount.size > 0) {
                        // 將 Map 中的資料轉換為字串，寫回檔案
                        const output = Array.from(wordCount.entries())
                            .map(([word, count]) => (word && count ? `${word} ${count}` : ""))
                            .join("\n")

                        // 寫入檔案
                        await writeFile(filePath, output, "utf8")

                        res.json({
                            status: "success",
                            message: "Words have been updated.",
                        })
                    } else {
                        res.json({
                            status: "fail",
                            message: "Nothing changed.",
                        })
                    }
                } else {
                    res.json({
                        status: "fail",
                        message: "Empty file.",
                    })
                }
            } catch (err) {
                console.log(err)
                res.json({
                    status: "fail",
                    message: "Something went wrong.",
                })
            }
        } else {
            res.json({
                status: "fail",
                message: "illegal request.",
            })
        }
    }
}
