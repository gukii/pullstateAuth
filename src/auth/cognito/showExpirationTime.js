// shows the cognito token time in real-world format
export function showExpirationTime(tokenExp) {
   return new Date(tokenExp*1000).toLocaleTimeString("en-US")
}
