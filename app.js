const app = new PIXI.Application();
(async () => {
    await app.init({ background: 'ede6d5', resizeTo: window, preference: 'webgpu', interactive: 'true'});

    // do pixi things
    document.body.appendChild(app.canvas);

    /* ============= GLOBAL CONSTANTS ============= */
    const roundTime = 5_000;
    const initialMoney = 100;
    const initialMultiplier = 1;
    const minMultiplier = 0.01;
    const maxMultiplier = 30;
    const blurFilter = new PIXI.BlurFilter();
    const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter({radius: app.screen.height / 3,
        strength: 0.08, innerRadius:100});
    /* ============= GLOBAL VARIABLES ============= */
    let playerMoney = initialMoney;
    let currentBet = 0;
    let currentTime = roundTime;
    let lastMultiplier = initialMultiplier;
    let currentMultiplier = initialMultiplier;
    let isGameRunning = false;

    /* ============= ROCKET ============= */
    // create a new Sprite from an image path
    const tex = await PIXI.Assets.load("images/rocket.png");
    const rocket = PIXI.Sprite.from(tex);
    // center the sprite's anchor point
    rocket.anchor.set(0.5);
    // move the sprite to the center of the screen
    rocket.x = 100;
    rocket.y = app.screen.height / 2;
    rocket.scale.set(0.5, 0.5);
    rocket.rotation = Math.PI / 2;

    /* ============= TEXT STYLE ============= */
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

    const smallStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontStyle: 'italic',
        fontWeight: 'bold',
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: {
            color: '#000000',
            blur: 4,
            angle: Math.PI / 6,
        },
        align: 'right',
    });

    /* ============= TIMER ============= */
    const timerContainer = new PIXI.Container();

    // Convert milliseconds to seconds
    let durationSeconds = roundTime / 1000;

    // Set the desired number of decimal places
    const decimalPlaces = 2;

    // Format the duration as a string with the specified decimal places
    const formattedDuration = durationSeconds.toFixed(decimalPlaces);

    // Create a text object for the timer
    const timerText = new PIXI.Text({text: formattedDuration, style});
    timerText.anchor.set(0.5);
    timerContainer.x = app.screen.width / 2;
    timerContainer.y = timerText.height / 2;
    timerContainer.addChild(timerText);

    /* ============= SELL TEXT ============= */
    const sellText = new PIXI.Text({text: 'SELL!', style});
    sellText.x = app.screen.width / 2 - (sellText.width / 2);
    sellText.y = app.screen.height - sellText.height;
    sellText.eventMode = 'static';
    sellText.cursor = 'pointer';

    /* ========= DEPOSIT CONTAINER ==========*/
    const rec = new PIXI.Graphics();
    rec.fill(0x000000);
    // Calculate the position to center the rectangle
    const rectWidth = app.screen.width / 2;
    const rectHeight = app.screen.height / 1.5;
    const centerX = (app.screen.width - rectWidth) / 2;
    const centerY = (app.screen.height - rectHeight) / 2;

    // Draw a rectangle (x, y, width, height)
    rec.rect(centerX, centerY, rectWidth, rectHeight).fill(0x000000);

    /* ============= START TEXT ============= */
    const depositText = new PIXI.Text({text: 'START!', style});
    depositText.x = rec.getBounds().x + rectWidth / 2 - depositText.width / 2
    depositText.y = rec.getBounds().y + rectHeight - depositText.height;
    depositText.eventMode = 'static';
    depositText.cursor = 'pointer';

    // Create a PIXI.Text for instructions
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 30,
        fill: 0xFFFFFF,
    });

    /* ======== INSTRUCTION TEXT ======== */
    const instructionText = new PIXI.Text({text: 'Enter a number:', textStyle});
    instructionText.x = rec.getBounds().x + rectWidth / 2 - instructionText.width / 2;
    instructionText.y = rec.getBounds().y + instructionText.height * 3;
    instructionText.style = textStyle;

    let lastWin = new PIXI.Text('Last Win: 0', textStyle);
    lastWin.x = rec.getBounds().x + rectWidth / 2 - lastWin.width / 2;
    lastWin.y = rec.getBounds().y + lastWin.height * 8;

    // Calculate the bottom coordinate of the instruction text
    const instructionTextBottom = instructionText.y + instructionText.height + 20;

    /* ========== INPUT FIELD ========= */
    // Create a PIXI.Graphics rectangle to simulate an input field
    const inputField = new PIXI.Graphics();

    inputField.fill(0xFFFFFF);
    inputField.rect(instructionText.x, instructionTextBottom, 200, 30);


    // Create an HTML input element for user input
    const inputElement = document.createElement('input');
    inputElement.type = 'number';
    inputElement.style.position = 'absolute';
    // Position the input element right under the instruction text
    inputElement.style.left = `${instructionText.x}px`;
    inputElement.style.top = `${instructionTextBottom}px`;
    inputElement.style.width = `200px`;
    inputElement.style.height = `30px`;
    // Add the HTML input element to the document body
    document.body.appendChild(inputElement);

    // Handle input change event
    let inputValue = 0;
    inputElement.addEventListener('input', function () {
        // Get the number from the input element
        inputValue = parseFloat(inputElement.value);

        // Perform further operations with the inputValue
        console.log('Input Value:', inputValue);
    });


    /* ============= CRYPTO CHART ============= */
    function createCryptoChart(maxX, maxY) {
        const chartContainer = new PIXI.Container();

        // Draw horizontal grid lines
        for (let i = 0; i <= maxY; i += 20) {
            const line = new PIXI.Graphics();
            line.rect(0, i, maxX, 1).fill(0x666666);
            chartContainer.addChild(line);
            //app.stage.addChild(line);
        }
        for (let i = 0; i <= maxX; i += 20) {
            const line = new PIXI.Graphics();
            line.rect(i, 0, 1, maxY).fill(0x666666);
            chartContainer.addChild(line);
            //app.stage.addChild(line);
        }
        return chartContainer
    }

    // Set the maximum values for the X and Y axes
    const maxX = app.screen.width - 200;
    const maxY = app.screen.height - 200;

    // Add the crypto chart to the stage
    const cryptoChart = createCryptoChart(maxX, maxY)
    cryptoChart.x = app.screen.width / 2 - cryptoChart.width / 2;
    cryptoChart.y = app.screen.height / 2 - cryptoChart.height / 2;

    /* ============= LEFT SIDE TEXT ============= */
    const leftSideTexts = [];

    // Text content for each text element
    const textContents = [
        '2x',
        '1.75x',
        '1.5x',
        '1.25x',
        '1x',
        '0.75x',
        '0.5x',
        '0.25x',
        '0x',
    ];

    const totalTexts = textContents.length;

    // Calculate the vertical spacing between texts
    const verticalSpacing = cryptoChart.height / (totalTexts);

    // Create and position each text element
    for (let i = 0; i < totalTexts; i++) {
        const text = new PIXI.Text({text: textContents[i], smallStyle});
        text.anchor.x = 1;
        text.x = cryptoChart.x - 10; // Adjust the x-coordinate to the left of the cryptoChart
        text.y = cryptoChart.y + verticalSpacing * i; // Evenly spaced between top and bottom
        leftSideTexts.push(text);
    }

    /* ========= DEPOSIT AMOUNT TO SCREEN ========= */
    let depositAmount = new PIXI.Text({text: `Current Deposit: `, smallStyle});
    depositAmount.x = cryptoChart.x;
    depositAmount.y = timerContainer.y;

    /* ============= LAYERING ============= */
    app.stage.addChild(cryptoChart);
    app.stage.addChild(...leftSideTexts);
    app.stage.addChild(sellText);
    app.stage.addChild(depositAmount);
    app.stage.addChild(timerContainer);
    app.stage.addChild(rocket);
    app.stage.addChild(rec)
    app.stage.addChild(depositText);
    app.stage.addChild(inputField);
    app.stage.addChild(instructionText);
    app.stage.addChild(lastWin);

    blurGame();

    depositText.addEventListener('pointerdown', function () {
        rec.visible = false;
        inputElement.style.display = 'none';

        /* ========= DEPOSIT AMOUNT TO SCREEN ========= */
        app.stage.removeChild(depositAmount);
        depositAmount = new PIXI.Text(`Current Deposit: ${inputValue}`, smallStyle);
        depositAmount.x = cryptoChart.x;
        depositAmount.y = timerContainer.y;
        app.stage.addChild(depositAmount);

        unblurGame();

        startGame();
    });

    sellText.addEventListener('pointerdown', function () {
        endGame();
    })


    /*
    *
    *
    *
    ============= RECURRING LOGIC =============
    *
    *
    *
    */

    /* ============= GAME LOGIC FUNCTIONS ============= */
    function blurGame() {
        cryptoChart.filters = [blurFilter];
        leftSideTexts.forEach(text => (text.filters = [blurFilter]));
        rocket.filters = [blurFilter];
        timerContainer.filters = [blurFilter];
        sellText.filters = [blurFilter];
        depositAmount.filters = [blurFilter];
    }

    function unblurGame() {
        cryptoChart.filters = [zoomBlurFilter];
        leftSideTexts.forEach(text => (text.filters = []));
        rocket.filters = [];
        timerContainer.filters = [];
        sellText.filters = [];
        depositAmount.filters = [];
    }

    function resetGame() {
        currentTime = roundTime;
        lastMultiplier = initialMultiplier;
        currentMultiplier = initialMultiplier;
    }

    function startGame() {
        resetGame();
        isGameRunning = true;
        startCountdown(roundTime, timerText);
        moveRocket();
    }

    let conf = 0;
    function endGame() {
        isGameRunning = false;
        blurGame();

        app.stage.removeChild(lastWin);
        conf = 1 + (rocket.y - cryptoChart.y - cryptoChart.height / 2) / -300;
        lastWin = new PIXI.Text(`Last Win: ${(conf * inputValue).toFixed(2)}     Win Conf: ${conf.toFixed(4)}`, textStyle);
        lastWin.x = rec.getBounds().x + rectWidth / 2 - lastWin.width / 2;
        lastWin.y = rec.getBounds().y + lastWin.height * 8;
        app.stage.addChild(lastWin);

        rec.visible = true;
        inputElement.style.display = 'block';
    }



    function moveRocket() {
        //Reset rocket x
        rocket.x = cryptoChart.x;
        const x1 = rocket.x;
        const x2 = maxX + 95;
        let duration = roundTime;

        // Start time
        let startTime = Date.now();

        // Add ticker for x movement
        let xTicker = new PIXI.Ticker();
        xTicker.add(() => {
            // Current time
            let currentTime = Date.now();

            // Calculate elapsed time in seconds
            let elapsedTime = (currentTime - startTime);

            // Update sprite's position
            if (elapsedTime < duration && isGameRunning) {
                rocket.x = x1 + (x2 - x1) * (elapsedTime / duration);
                // Update zoom blur filter position
                zoomBlurFilter.center = [rocket.x - rocket.width, rocket.y - rocket.height];
            } else {
                xTicker.stop(); //Stop the ticker after the duration or if game over
            }
        });

        // Add ticker for y movement
        let yTicker = new PIXI.Ticker();

        // Set the initial target Y position and interval to update it
        let targetY = Math.random() * app.screen.height;
        let updateInterval = 175; // Update target every 1000ms (1 second)
        let lastUpdateTime = Date.now();
        // Variable to track the desired rotation
        let targetRotation = 0;

        yTicker.add(() => {
            // Current time
            let currentTime = Date.now();

            // Calculate elapsed time in milliseconds
            let elapsedTime = (currentTime - startTime);

            // Check if it's time to update the target Y position
            if (currentTime - lastUpdateTime > updateInterval) {
                // Calculate the maximum Y value to stay within the screen
                const chartMinY = 100; // Adjust this based on your actual minimum Y value
                const chartMaxY = app.screen.height - 100
                targetY = Math.random() * (chartMaxY - chartMinY) + chartMinY;
                lastUpdateTime = currentTime;
            }

            // Update sprite's position
            if (elapsedTime < duration && isGameRunning) {
                // Gradually move towards the target Y position
                let movementSpeed = 0.05; // Adjust this value for faster or slower movement
                rocket.y += (targetY - rocket.y) * movementSpeed;

                // Determine the direction of movement and set the target rotation accordingly
                targetRotation = targetY < rocket.y ? 0 : Math.PI; // 0 or 180 degrees in radians

                // Gradually update the rotation for smoother flipping
                let rotationInterpolationSpeed = 0.09; // Control the flipping speed
                rocket.rotation += (targetRotation - rocket.rotation) * rotationInterpolationSpeed;
            } else {
                yTicker.stop(); // Stop the ticker after the duration or if the game is over
            }
        });

        // Start the tickers
        xTicker.start();
        yTicker.start();
    }

    function startCountdown(duration, textElement) {
        const startTime = Date.now();
        const countdownInterval = setInterval(() => {
            if (!isGameRunning) {
                clearInterval(countdownInterval);
                return;
            }

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(duration - elapsedTime, 0);
            const seconds = Math.floor(remainingTime / 1000);
            const milliseconds = Math.floor((remainingTime % 1000) / 10); // Dividing by 10 to get centiseconds

            textElement.text = seconds + '.' + (milliseconds < 10 ? '0' : '') + milliseconds;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                textElement.text = '0.000';
                endGame();
            }
        }, 10); // Updating every 10 milliseconds
    }
})()