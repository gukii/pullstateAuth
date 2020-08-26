import { Config } from 'aws-sdk'



export default function() {
  return new Promise((resolve, reject) => {
    Config.credentials.refresh(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
/*

// was like this before..

export default function(email, code) {
  return new Promise((resolve, reject) => {
    Config.credentials.refresh(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
*/
