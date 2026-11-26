PEPPER · Classroom game
=====================================

1. OPEN ON A COMPUTER (no internet needed)
------------------------------------------
1. Unzip the whole folder. Keep all files together: index.html needs the fonts and the other files next to it.
2. Double-click index.html. It opens in Chrome, Edge or Safari.
3. Press "Let's play!" to start. The gear in the top-right corner opens the teacher panel.

Keyboard: A / B / C or ← ↓ → to answer · in "Build the word", type the letters, ⌫ to undo
          R to read the question aloud · M to answer by voice · Esc to close the panel
Voice answers (the microphone button) need Chrome or Edge and an internet connection.
When you double-click index.html the microphone may be blocked; put the game online
(see part 2) or run a small local server: open a terminal in this folder, type
    python3 -m http.server 8000
and open http://localhost:8000 in Chrome.

The design/ folder contains the character design page (character-design.html) and
7 animated GIFs of Pepper's poses (you can drag them straight into PowerPoint).


2. PUT IT ONLINE WITH GITHUB PAGES (voice works in Chrome)
----------------------------------------------------------
1. On github.com, create a new public repository, for example "pepper-game".
2. Click "uploading an existing file" and drag in EVERYTHING inside this folder
   (index.html, pepper-bridge.js, tablet-check.html, README.txt, .nojekyll, fonts/, design/).
   index.html must be at the top level of the repository, not inside a "pepper demo" folder.
3. Click "Commit changes".
4. Go to Settings > Pages. Under "Build and deployment", choose
   Source: Deploy from a branch · Branch: main · Folder: / (root). Click Save.
5. After 1-2 minutes the link appears at the top of that page:
   https://YOUR-USER-NAME.github.io/pepper-game/
6. Open the link in Chrome, start the game and press the microphone button.
   The first time, Chrome asks to use the microphone: click Allow.
   Children can then say the answer (for example "cat", "hat", "under the table")
   on every question except "Build the word".
   The microphone opens by itself after Pepper finishes speaking ("Listen automatically"
   in the teacher panel). It pauses while Pepper talks. Under the question you can see
   what the computer heard (🎤 "..."). Tapping the microphone button stops or starts it.
   Close-sounding words also count ("cut" → CAT, "son" → SUN).
Note: the link is public. Anyone who has it can open the game.
Note: the console shows one missing file, /libs/qimessaging/... That file only exists
      on the robot, so this is normal.


3. INSTALL ON PEPPER (NAOqi 2.5, Choregraphe 2.5.10.7)
------------------------------------------------------
1. Open Choregraphe and create a new project (File > New project). Save it.
2. In the "Project files" panel on the left, click "+" > "Create directory".
   The folder must be named: html
3. Import everything from this folder into html (right-click html > Import files):
   index.html, pepper-bridge.js, tablet-check.html and the fonts/ folder.
   The design/ folder is not needed on the robot.
4. In Box libraries, find Tablet > "Show App", drag it into the flow diagram
   and connect onStart to its input.
5. Connect to the robot (Connection > Connect to), then in the Robot applications panel
   click "Package and install current project to the robot".
6. Run the app on Pepper. The game appears on the tablet.

The first time on the robot, please look at the tablet check:
- If the tablet's browser is too old, the game opens the check page (tablet-check.html) automatically.
- You can also open it from the teacher panel: "Tablet check".
- Take a photo of the check page and send it to the developer. It shows the browser version,
  which features are missing, and whether the page can talk to the robot.
  If you see a red NO, a version for older tablets is needed.


4. CONNECTION TO THE ROBOT (pepper-bridge.js)
---------------------------------------------
- On a computer: this file does nothing. The game uses the browser's own voice.
- On Pepper:
  · Pepper says every line with its own voice (ALAnimatedSpeech)
  · on correct answer / try again / goose square / finish, Pepper makes a matching
    body movement (ALAnimationPlayer)
  · the microphone button lets Pepper listen to the word the child says
    (ALSpeechRecognition) instead of the browser
- The movement names are in CONFIG at the top of pepper-bridge.js (happy, thinking, ...).
  They are suggested tags from Pepper's standard animation library.
  Please check them in Choregraphe and change them if needed.
- The eye LED colours are not decided yet, so the bridge does not change them.


5. CHANGE THE QUESTIONS
-----------------------
Open index.html in a text editor and search for "question-banks".
The questions are written in JSON there. The comment just above explains every field.


-------------------------------------
Fonts: Andika, Cinzel and Nunito, SIL Open Font License 1.1 (free to share).
