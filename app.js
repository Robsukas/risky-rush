(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '0x1099bb', resizeTo: window, preference: 'webgpu' });

    // do pixi things
    document.body.appendChild(app.canvas);

    let player;

    function createPlayer() {
        // create a new Sprite from an image path
        player = PIXI.Sprite.from("rocket.png");
        // center the sprite's anchor point
        player.anchor.set(0.5);
        // move the sprite to the center of the screen
        player.x = app.screen.width / 2;
        player.y = app.screen.height / 2;
        // add sprite to stage
        app.stage.addChild(player);
    }
    createPlayer();

// text style
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 72,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        align: 'center'
    });

// Create a container
    const timerContainer = new PIXI.Container();
    timerContainer.x = app.screen.width / 2 + 600;
    timerContainer.y = app.screen.height / 2 - 250;
    app.stage.addChild(timerContainer);

// Create a text object for the timer
    const timerText = new PIXI.Text('10.000', style);
    timerText.anchor.set(0.5);
    timerContainer.addChild(timerText);

// Create a border for the container
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0xFF0000, 1); // Width, color, and alpha of the border
    border.drawRect(-timerText.width / 2, -timerText.height / 2, 200, 100); // x, y, width, height of the border
    timerContainer.addChild(border);

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
    const playText = new PIXI.Text('SELL!', style);
    playText.x = app.screen.width / 2 - (playText.width / 2);
    playText.y = app.screen.height - playText.height;
    playText.eventMode = 'static';
    playText.cursor = 'pointer';
    playText.addEventListener('pointerdown', function () {
        alert("SOLD")
    });
    app.stage.addChild(playText);

// Listen for animate update
    app.ticker.add((delta) => {
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        player.rotation += 0.005 * delta;
    });

    startCountdown(10000, timerText); // 10 seconds in milliseconds

})()