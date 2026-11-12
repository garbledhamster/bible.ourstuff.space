# Island Post · worked example

Island Post is an illustrative browser puzzle game about delivering one parcel at a time on a rainy island.

1. **Vision and scope.** Start a private GitHub repository and record where the code, art, and design notes will live. Commit the plan for a first delivery on phone and desktop. Players learn to read the ground and choose a dry route.
2. **Game design.** Unwrapped parcels become soaked when the courier steps in a puddle. The Dock teaches the basic rule, Market Lane adds wrapping, and the Hill Route adds two deliveries and an optional step goal.
3. **Engine and assets.** Start with a small 2D Phaser map, courier and recipient sprites, puddle and boardwalk tiles, and parcel condition icons.
4. **Sandbox.** Start on the same tile with a dry unwrapped parcel, then with a wrapped parcel. Cross the puddle and compare outcomes. Check pause, retry, and dialogue states.
5. **Scenes.** The postmaster gives the player a parcel for Mina. The player takes the boardwalk or tries the wet shortcut. Mina reacts to the parcel condition and offers a retry for a failed delivery.
6. **Build and play.** Export the browser game and open the staged build on a phone with a fresh browser profile. Start at the title screen, recover from a wet delivery, and follow the transition from the Dock to Market Lane. Record the build URL and what happened.
7. **Player help.** Show movement and parcel condition in the manual. Use screenshots of the same puddle with different parcel states on the wiki.
8. **Release.** Consider the dock as a free preview, then ship the three-route browser game. Show the dock fork in the launch material.
9. **Contributors.** Walk a new contributor through opening the sandbox and adding a fourth delivery route.
10. **Updates.** For a new parcel rule, add its sandbox cases, assemble a route using it, and update the manual, wiki, and release notes.
11. **Intake and feedback.** Ask preview visitors what they expected from the game and ask Dock playtesters to show what they do after soaking a parcel. Give players a short feedback form and a reply address. In this example, several phone testers miss Retry. Thank them, ask where they looked, and bring their observations back to Vision and Scope with a goal for the next release. A first-time player should be able to recover from a wet delivery on a phone without coaching. Follow up after retesting.
