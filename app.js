// Create base app
const app = new PIXI.Application({
    background: '#ede6d5',
    resizeTo: window,
});
document.body.appendChild(app.view);

/* ============= GLOBAL CONSTANTS ============= */
const roundTime = 5_000; // in milliseconds
const initialMoney = 100; // dollars
const initialMultipier = 1;
const minMultiplier = 0.01;
const maxMultiplier = 30;
const blurFilter = new PIXI.filters.BlurFilter();
/* ============= GLOBAL VARIABLES ============= */
let playerMoney = initialMoney;
let currentBet = 0;
let currentTime = roundTime;
let lastMultiplier = initialMultipier;
let currentMultiplier = initialMultipier;
let gameInterval;
let isGameRunning = false;
let xAnimation;
let yAnimation;

/* ============= ROCKET ============= */
// create a new Sprite from an image path
const rocket = PIXI.Sprite.from("rocket.png");
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

/* ============= TIMER ============= */
const timerContainer = new PIXI.Container();
// Create a text object for the timer
const timerText = new PIXI.Text('5.00', style);
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

/* ========= DEPOSIT CONTAINER ==========*/
const rec = new PIXI.Graphics();
rec.beginFill(0x000000);
// Calculate the position to center the rectangle
const rectWidth = app.screen.width / 2;
const rectHeight = app.screen.height / 1.5;
const centerX = (app.screen.width - rectWidth) / 2;
const centerY = (app.screen.height - rectHeight) / 2;

// Draw a rectangle (x, y, width, height)
rec.drawRect(centerX, centerY, rectWidth, rectHeight);
rec.endFill();

/* ============= DEPOSIT TEXT ============= */
const depositText = new PIXI.Text('START!', style);
depositText.x = rec.getBounds().x + rectWidth / 2 - depositText.width / 2
depositText.y = rec.getBounds().y + rectHeight - depositText.height;
depositText.eventMode = 'static';
depositText.cursor = 'pointer';
rec.addChild(depositText);

/* ============= CRYPTO CHART ============= */
function createCryptoChart(maxX, maxY) {
    const chartContainer = new PIXI.Container();

    // Draw horizontal grid lines
    for (let i = 0; i <= maxY; i += 20) {
        const line = new PIXI.Graphics();
        if (i === maxY / 2) {
            line.lineStyle(2, 0x000000);
        } else {
            line.lineStyle(1, 0x666666);
        }
        line.moveTo(0, i);
        line.lineTo(maxX, i);
        chartContainer.addChild(line);
    }

    // Draw vertical grid lines
    for (let i = 0; i <= maxX; i += 20) {
        const line = new PIXI.Graphics();
        if (i === 0) {
            line.lineStyle(2, 0x000000);
        } else {
            line.lineStyle(1, 0x666666);
        }
        line.moveTo(i, 0);
        line.lineTo(i, maxY);
        chartContainer.addChild(line);
    }

    // Create a line chart
    const chart = new PIXI.Graphics();
    const lineColor = 0x00FF00;
    const lineWidth = 2;

    chart.lineStyle(lineWidth, lineColor);

    chartContainer.addChild(chart);

    return chartContainer;
}

// Set the maximum values for the X and Y axes
const maxX = app.screen.width - 200;
const maxY = app.screen.height - 200;

// Add the crypto chart to the stage
const cryptoChart = createCryptoChart(maxX, maxY);
cryptoChart.x = app.screen.width / 2 - cryptoChart.width / 2;
cryptoChart.y = app.screen.height / 2 - cryptoChart.height / 2;

/* ============= LAYERING ============= */
app.stage.addChild(cryptoChart);
app.stage.addChild(sellText);
app.stage.addChild(timerContainer);
app.stage.addChild(rocket);
app.stage.addChild(rec)

blurGame();

depositText.addEventListener('pointerdown', function () {
    rec.visible = false;
    unblurGame();

    startGame();
});

sellText.addEventListener('pointerdown', function () {
    endGame();
});


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
    rocket.filters = [blurFilter];
    timerContainer.filters = [blurFilter];
    sellText.filters = [blurFilter];
}

function unblurGame() {
    cryptoChart.filters = [];
    rocket.filters = [];
    timerContainer.filters = [];
    sellText.filters = [];
}

function resetGame() {
    currentTime = roundTime;
    lastMultiplier = initialMultipier;
    currentMultiplier = initialMultipier;
}

function startGame() {
    resetGame();
    // const a = () => {
    //     console.count()
    // }
    // test = app.ticker.add(a);
    // app.ticker.remove(a);
    isGameRunning = true;
    startCountdown(roundTime, timerText);
    moveRocket();
}

function endGame() {
    isGameRunning = false;
    console.log("here")
    // xAnimation.pause();
    // yAnimation.pause();
    blurGame();
}

function moveRocket() {
    // Reset rocket x
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
            xTicker.stop(); // Stop the ticker after the duration or if game over
        }
    });


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
            rocket.scale.y = movingUp ? 1 : -1; // Flip the rocket vertically when moving up
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