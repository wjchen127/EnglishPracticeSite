import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import { Options, PythonShell } from "python-shell"
// const { PythonShell } = require("python-shell")
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { youtubeId } = req.query
    const options: Options = {
        mode: "text",
        args: [youtubeId as string],
        scriptPath: path.resolve(process.cwd(), "helper"),
    }
    PythonShell.run("getsubfromyt.py", options, function (err: any, results: any[] | undefined) {
        if (err) throw err
        if (results) {
            res.json(results[0])
        } else {
            res.json([])
        }
    })
}
