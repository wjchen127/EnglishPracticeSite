import type { NextApiRequest, NextApiResponse } from "next"
import { getSubtitles } from "yt-subtitles"
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { youtubeId } = req.query
    const lang = ["en", "en-GB"]
    if (youtubeId) {
        let sub
        for (let i = 0; i < lang.length; i++) {
            sub = await getSubtitles(youtubeId as string, lang[i])
            if (sub.length > 0) {
                break
            }
        }

        if (sub && sub.length > 0) {
            // console.log(sub)
            res.json(JSON.stringify(sub))
        } else {
            res.send("nothing")
        }
    }
}
