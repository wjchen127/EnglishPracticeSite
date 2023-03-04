import type { NextApiRequest, NextApiResponse } from "next"
const path = require("path")
let { PythonShell } = require("python-shell")
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { youtubeId } = req.query
    let options = {
        mode: "text",
        args: youtubeId,
        scriptPath: path.resolve(process.cwd(), "helper"),
    }
    PythonShell.run("getsubfromyt.py", options, function (err: any, results: any[]) {
        if (err) throw err
        res.json(results[0])
    })
}
