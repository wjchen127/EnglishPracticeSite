import { getSubtitles } from "yt-subtitles"
export async function getCaptions(videoId: string) {
    const lang = ["en", "en-GB"]
    if (videoId) {
        let sub
        for (let i = 0; i < lang.length; i++) {
            try {
                sub = await getSubtitles(videoId as string, lang[i])
                if (sub.length > 0) {
                    break
                }
            } catch (e) {
                console.log("something wrong happened!")
            }
        }

        if (sub && sub.length > 0) {
            // console.log(sub)
            return sub
        } else {
            return false
        }
    }
}
