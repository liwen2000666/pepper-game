/* =====================================================================
   pepper-bridge.js: connects the game on Pepper's tablet to the robot
   (NAOqi 2.5, QiMessaging JS). Written in ES5 for the tablet's browser.

   On a normal computer this file does nothing: QiSession does not exist,
   so the game keeps using the browser's own voice.

   On the robot:
     - Pepper speaks every line with its own voice (ALAnimatedSpeech)
     - correct / try again / goose / finish trigger a body animation
     - the mic button asks Pepper to listen (ALSpeechRecognition) and
       passes the word it hears to the game (PepperGame.heard)

   Animation tags below are candidates from Pepper's standard library.
   Check them in Choregraphe and change the names here if needed.
===================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    language: 'English',
    speechSpeed: 85,                 // %, a little slower for young children
    asrConfidence: 0.4,              // ignore words below this confidence
    listenSeconds: 6,
    tags: {                          // ALAnimationPlayer.runTag(tag)
      greeting: 'hello',
      correct: 'happy',
      tryAgain: 'thinking',
      goose: 'enthusiastic',
      finish: 'joy'
    }
  };

  // Keep any hooks the page already set, then add the robot ones.
  var hooks = window.PepperHooks = window.PepperHooks || {};
  window.PepperBridge = { connected: false, config: CONFIG };

  if (typeof window.QiSession !== 'function') {
    if (window.console) console.info('[pepper-bridge] QiSession not found: running without the robot.');
    return;
  }

  var session = new QiSession();
  var services = {};

  function service(name, done) {
    if (services[name]) { done(services[name]); return; }
    session.service(name).done(function (s) { services[name] = s; done(s); })
      .fail(function (err) { if (window.console) console.warn('[pepper-bridge] ' + name, err); });
  }
  function runTag(tag) {
    if (!tag) return;
    service('ALAnimationPlayer', function (ap) {
      ap.runTag(tag).fail(function (err) { if (window.console) console.warn('[pepper-bridge] tag ' + tag, err); });
    });
  }

  // connection check + voice settings
  service('ALTextToSpeech', function (tts) {
    window.PepperBridge.connected = true;
    tts.setLanguage(CONFIG.language);
    tts.setParameter('speed', CONFIG.speechSpeed);
  });

  // 1. Pepper's own voice. Returning true tells the game not to use the browser voice.
  hooks.speak = function (text) {
    service('ALAnimatedSpeech', function (as) {
      as.say(String(text)).fail(function (err) { if (window.console) console.warn('[pepper-bridge] say', err); });
    });
    return true;
  };

  // 2. Body animations that mirror the virtual Pepper
  var previous = {
    onQuestion: hooks.onQuestion, onCorrect: hooks.onCorrect, onWrong: hooks.onWrong,
    onGoose: hooks.onGoose, onFinish: hooks.onFinish
  };
  function chain(name, fn) {
    hooks[name] = function () {
      try { fn.apply(null, arguments); } catch (e) { if (window.console) console.warn(e); }
      if (typeof previous[name] === 'function') previous[name].apply(null, arguments);
    };
  }
  chain('onCorrect', function () { runTag(CONFIG.tags.correct); });
  chain('onWrong', function () { runTag(CONFIG.tags.tryAgain); });
  chain('onGoose', function () { runTag(CONFIG.tags.goose); });
  chain('onFinish', function () { runTag(CONFIG.tags.finish); });

  // 3. Listening for spoken answers (used by questions with "voice": true)
  var listening = false, subscriber = null, timer = null;
  function stopListening() {
    if (!listening) return;
    listening = false;
    clearTimeout(timer);
    service('ALSpeechRecognition', function (asr) { asr.unsubscribe('PepperThePiper'); });
    if (subscriber) { try { subscriber.signal.disconnect(subscriber.link); } catch (e) {} subscriber = null; }
  }
  hooks.onListen = function (vocabulary) {
    if (listening) stopListening();
    listening = true;
    var words = [];
    for (var i = 0; i < vocabulary.length; i++) {
      var w = String(vocabulary[i]).toLowerCase();
      if (words.indexOf(w) < 0) words.push(w);
    }
    service('ALSpeechRecognition', function (asr) {
      asr.pause(true);
      asr.setLanguage(CONFIG.language);
      asr.setVocabulary(words, false);
      asr.pause(false);
      service('ALMemory', function (mem) {
        mem.subscriber('WordRecognized').done(function (sub) {
          subscriber = sub;
          sub.signal.connect(function (value) {
            // value = [word, confidence, ...]
            if (!listening || !value || value.length < 2) return;
            if (value[1] >= CONFIG.asrConfidence && window.PepperGame) {
              var heard = String(value[0]).replace(/<[^>]*>/g, '').trim();
              stopListening();
              window.PepperGame.heard(heard);
            }
          }).done(function (link) { sub.link = link; });
          asr.subscribe('PepperThePiper');
        });
      });
    });
    timer = setTimeout(function () {
      if (!listening) return;
      stopListening();
      if (window.PepperGame) window.PepperGame.heard('');   // the game says "I didn't catch that" (never counted as wrong)
    }, CONFIG.listenSeconds * 1000);
  };

  // greeting gesture when the game starts
  chain('onQuestion', function (q, step) { if (step === 0) runTag(CONFIG.tags.greeting); });
})();
