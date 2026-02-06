chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === "play-sound") {
    var audio = new Audio(message.url || "/lib/snooze.mp3");
    audio.play().catch(console.error);
  }
});
