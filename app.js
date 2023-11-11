const app = new PIXI.Application();
(async () => {
    await app.init({ background: 'ede6d5', resizeTo: window, preference: 'webgpu', interactive: 'true'});

    // do pixi things
    document.body.appendChild(app.canvas);


    const tex = await PIXI.Assets.load("rocket.png");
    const player = PIXI.Sprite.from(tex);
    // center the sprite's anchor point
    player.anchor.set(0.5);
    // move the sprite to the center of the screen
    player.x = 50;
    player.y = app.screen.height / 2;
    // add sprite to stage

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
            blur: 4,
            color: "black",
            distance: 6,
        },
        align: 'center'
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
    playText.eventMode = 'static';
    playText.cursor = 'pointer';
    playText.addEventListener('click', ()=>{alert("SOLD")})
    app.stage.addChild(playText);
    const target = app.stage.addChild(playText);
    target.interactive = true;
    console.log(target.isInteractive());
    target.addEventListener('click', ()=>{alert("SOLD")});



    startCountdown(10000, timerText); // 10 seconds in milliseconds
    function moveRocket() {
        gsap.to(player, {
            x: app.screen.width,
            duration: 10,
            ease: "none",
            onComplete: function () {
                player.x = 0;
                moveRocket();
            }
        });

        setInterval(() => {
            const newY = Math.random() * app.screen.height;
            const movingUp = newY < player.y;

            player.scale.y = movingUp ? 1 : -1

            gsap.to(player, {y: newY, duration: 0.4, ease: "none"});
        }, 300);
    }
    moveRocket();

    function createCryptoChart(maxX, maxY) {
        const chartContainer = new PIXI.Container();

        // Draw horizontal grid lines
        for (let i = 0; i <= maxY; i += 20) {
            const line = new PIXI.Graphics();
            //line.moveTo(0, i);
            //line.lineTo(maxX, i);
            //line.rect(0, i, maxX, i);
            line.rect(0, i, maxX, 1).fill(0x666666);
            app.stage.addChild(line);
        }
        //rect(50, 50, 100, 1).fill(0xde3249);
        // Draw vertical grid lines
        for (let i = 0; i <= maxX; i += 20) {
            const line = new PIXI.Graphics();
            if (i === 0) {
                line.stroke = {color : 0x000000, width : 2};
            } else {
                line.stroke = {color : 0x666666, width : 1};
            }
            line.rect(i, 0, 1, maxY).fill(0x666666);
            app.stage.addChild(line);
        }

        // Create a line chart
        const chart = new PIXI.Graphics();
        const lineColor = 0x00FF00;
        const lineWidth = 2;

        chart.stroke = {color : lineColor, width : lineWidth};


        app.stage.addChild(chart);

        return chartContainer;
    }

// Set the maximum values for the X and Y axes
    const maxX = app.screen.width;
    const maxY = app.screen.height;

// Add the crypto chart to the stage
    const cryptoChart = createCryptoChart(maxX, maxY);
    cryptoChart.x = app.screen.width / 2 - cryptoChart.width / 2;
    cryptoChart.y = app.screen.height / 2 - cryptoChart.height / 2;

    /* ============= LAYERING ============= */
    app.stage.addChild(cryptoChart);
    app.stage.addChild(playText);
    app.stage.addChild(timerContainer);
    app.stage.addChild(player);

})()