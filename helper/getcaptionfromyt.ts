let { PythonShell } = require('python-shell')
// const path = require('path')
export default async function getCaptionFromYT(videoid: string){
    if(videoid){
        let options = {
            mode: 'text',
            args: videoid,
            scriptPath: 'helper',
        }
        return new Promise((resolve, reject) => {
            PythonShell.run('getsubfromyt.py', options, function (err: any, results: any[]) {
                if (err){
                    resolve(false)
                }else{
                    resolve(results[0])
                }
            })
        })
    }
        
}