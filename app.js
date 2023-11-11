const app = new PIXI.Application();
(async () => {
    await app.init({ background: '0x1099bb', resizeTo: window, preference: 'webgpu' });

    // do pixi things
    document.body.appendChild(app.canvas);


    const tex = await PIXI.Assets.load("rocket.png");
    const player = PIXI.Sprite.from(tex);
    // center the sprite's anchor point
    player.anchor.set(0.5);
    // move the sprite to the center of the screen
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
    // add sprite to stage
    app.stage.addChild(player);

// text style
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 72,
        fontStyle: 'italic',
        fontWeight: 'bold',
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: {
            alpha: 1,
            angle: Math.PI / 6,
            blur: 0,
            color: "black",
            distance: 5,
        },
    });
// Create a container
    const timerContainer = new PIXI.Container();
    timerContainer.x = app.screen.width / 2 + 600;
    timerContainer.y = app.screen.height / 2 - 250;
    app.stage.addChild(timerContainer);

// Create a text object for the timer
    const timerText = new PIXI.Text({text: '10.000', style});
    timerText.anchor.set(0.5);
    timerContainer.addChild(timerText);

    function startCountdown(duration, textElement) {
        var startTime = Date.now();
        var countdownInterval = setInterval(() => {
            var elapsedTime = Date.now() - startTime;
            var remainingTime = Math.max(duration - elapsedTime, 0);
            var seconds = Math.floor(remainingTime / 1000);
            var milliseconds = Math.floor((remainingTime % 1000) / 10); // Dividing by 10 to get centiseconds

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                textElement.text = '0.000';
                // Actions when countdown ends
            }

            textElement.text = seconds + '.' + (milliseconds < 10 ? '0' : '') + milliseconds;
        }, 10); // Updating every 10 milliseconds
    }


// Add play text
    const playText = new PIXI.Text({text: 'SELL!', style});
    playText.x = app.screen.width / 2 - (playText.width / 2);
    playText.y = app.screen.height - playText.height;
//    playText.eventMode = 'static';
//    playText.cursor = 'pointer';
    const target = app.stage.addChild(playText);
    target.interactive = true;
    target.addEventListener('click', ()=>{alert("SOLD")});

// Listen for animate update
    app.ticker.add((ticker) => {
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        player.rotation += 0.005 * ticker.deltaTime;
    });

    startCountdown(10000, timerText); // 10 seconds in milliseconds

})()