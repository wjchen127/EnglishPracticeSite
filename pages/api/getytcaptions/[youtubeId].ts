import type { NextApiRequest, NextApiResponse } from 'next'
let { PythonShell } = require('python-shell')
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { youtubeId } = req.query
    let options = {
        mode: "text",
        args: youtubeId,
        scriptPath: '/Users/chenweijie/Desktop/englishpracticesite/helper',
    }
    PythonShell.run('getsubfromyt.py', options, function (err: any, results: any[]) {
        if (err) throw err;
        res.json(results[0])
    })
}