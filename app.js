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
    /* ============= GLOBAL VARIABLES ============= */
    let playerMoney = initialMoney;
    let currentBet = 0;
    let currentTime = roundTime;
    let lastMultiplier = initialMultiplier;
    let currentMultiplier = initialMultiplier;
    let isGameRunning = false;

    /* ============= ROCKET ============= */
    // create a new Sprite from an image path
    const tex = await PIXI.Assets.load("rocket.png");
    const rocket = PIXI.Sprite.from(tex);
    // center the sprite's anchor point
    rocket.anchor.set(0.5);
    // move the sprite to the center of the screen
    rocket.x = 50;
    rocket.y = app.screen.height / 2;
    rocket.scale.set(0.5, 0.5);

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
    // Create a text object for the timer
    const timerText = new PIXI.Text({text: '5.00', style});
    timerText.anchor.set(0.5);
    timerContainer.x = app.screen.width / 2;
    timerContainer.y = timerText.height / 2;
    timerContainer.addChild(timerText);

    /* ============= PLAY TEXT ============= */
    const sellText = new PIXI.Text('SELL!', style);
    sellText.x = app.screen.width / 2 - (sellText.width / 2);
    sellText.y = app.screen.height - sellText.height;
    sellText.eventMode = 'static';
    sellText.cursor = 'pointer';

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

    // Create and position each text element
    for (let i = 0; i < textContents.length; i++) {
        const text = new PIXI.Text(textContents[i], smallStyle);
        text.anchor.x = 1;
        text.x = 85; // Adjust the x-coordinate as needed
        text.y = 85 + i * 49; // Adjust the y-coordinate for vertical spacing
        leftSideTexts.push(text);
    }

    /* ========= DEPOSIT CONTAINER ==========*/
    const rec = new PIXI.Graphics();
    // Calculate the position to center the rectangle
    const rectWidth = app.screen.width / 2;
    const rectHeight = app.screen.height / 1.5;
    const centerX = (app.screen.width - rectWidth) / 2;
    const centerY = (app.screen.height - rectHeight) / 2;



    // Draw a rectangle (x, y, width, height)
    rec.rect(centerX, centerY, rectWidth, rectHeight).fill(0x000000);

    /* ============= DEPOSIT TEXT ============= */
    const depositText = new PIXI.Text('START!', style);
    depositText.x = rec.getBounds().x + rectWidth / 2 - depositText.width / 2
    depositText.y = rec.getBounds().y + rectHeight - depositText.height;
    depositText.eventMode = 'static';
    depositText.cursor = 'pointer';
    rec.addChild(depositText);

    // Create a PIXI.Text for instructions
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 30,
        fill: 0xFFFFFF,
    });

    /* ======== INSTRUCTION TEXT ======== */
    const instructionText = new PIXI.Text('Enter a number:', textStyle);
    instructionText.x = rec.getBounds().x + rectWidth / 2 - instructionText.width / 2;
    instructionText.y = rec.getBounds().y + instructionText.height * 3;

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

    // Add the PIXI text and graphics to the stage
    rec.addChild(instructionText);
    rec.addChild(inputField)

    // Add the HTML input element to the document body
    document.body.appendChild(inputElement);

    // Handle input change event
    inputElement.addEventListener('input', function () {
        // Get the number from the input element
        const inputValue = parseFloat(inputElement.value);

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

    /* ============= LAYERING ============= */
    app.stage.addChild(cryptoChart);
    app.stage.addChild(...leftSideTexts);
    app.stage.addChild(sellText);
    app.stage.addChild(timerContainer);
    app.stage.addChild(rocket);
    app.stage.addChild(rec)

    blurGame();

    depositText.addEventListener('pointerdown', function () {
        rec.visible = false;
        inputElement.style.display = 'none';
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
    }

    function unblurGame() {
        cryptoChart.filters = [];
        leftSideTexts.forEach(text => (text.filters = []));
        rocket.filters = [];
        timerContainer.filters = [];
        sellText.filters = [];
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

    function endGame() {
        isGameRunning = false;
        blurGame();
    }

    function moveRocket() {
        //Reset rocket x
        rocket.x = cryptoChart.x;
        const x1 = rocket.x;
        const x2 = maxX + 20;
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
            } else {
                xTicker.stop(); //Stop the ticker after the duration or if game over
            }
        });

        // Add ticker for y movement
        let yTicker = new PIXI.Ticker();

        // Set the initial target Y position and interval to update it
        let targetY = Math.random() * app.screen.height;
        let updateInterval = 150; // Update target every 1000ms (1 second)
        let lastUpdateTime = Date.now();

        yTicker.add(() => {
            // Current time
            let currentTime = Date.now();

            // Calculate elapsed time in milliseconds
            let elapsedTime = (currentTime - startTime);

            // Check if it's time to update the target Y position
            if (currentTime - lastUpdateTime > updateInterval) {
                targetY = Math.random() * app.screen.height;
                lastUpdateTime = currentTime;
            }

            // Update sprite's position
            if (elapsedTime < duration && isGameRunning) {
                // Gradually move towards the target Y position
                let movementSpeed = 0.05; // Adjust this value for faster or slower movement
                rocket.y += (targetY - rocket.y) * movementSpeed;

                const movingUp = targetY < rocket.y;
                rocket.scale.y = movingUp ? 0.5 : -0.5; // Flip the rocket vertically when moving up
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
    unblurGame();
    startGame();
})()