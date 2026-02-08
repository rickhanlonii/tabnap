chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === "play-sound") {
    var audio = new Audio(message.url || "/lib/snooze.wav");
    audio.play().catch(console.error);
  }
});
