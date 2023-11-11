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
sellText.addEventListener('pointerdown', function () {
    alert("SOLD")
});


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
    const a = () => {
        console.count()
    }
    test = app.ticker.add(a);
    app.ticker.remove(a);
    startCountdown(roundTime, timerText);
    moveRocket();
}



function moveRocket() {
    // x-movement
    rocket.x = cryptoChart.x;
    gsap.to(rocket, {
        x: cryptoChart.x + maxX,
        duration: roundTime / 1000,
        ease: "none",
        onComplete: () => {
            // rocket.x = 0;
        }
    });

    // y-movement
        setInterval(() => {
        const newY = Math.random() * app.screen.height;
        const movingUp = newY < rocket.y; // Check if the new Y position is above the current position

        // Flip the rocket vertically when moving up
        rocket.scale.y = movingUp ? 0.5 : -0.5;

        gsap.to(rocket, {y: newY, duration: 0.4, ease: "none"});
    }, 300); // Change y position every 300 milliseconds
    // gsap.to(rocket)

    // setInterval(() => {
    //     const newY = Math.random() * app.screen.height;
    //     const movingUp = newY < rocket.y; // Check if the new Y position is above the current position
    //
    //     // Flip the rocket vertically when moving up
    //     rocket.scale.y = movingUp ? 1 : -1;
    //
    //     gsap.to(rocket, {y: newY, duration: 0.4, ease: "none"});
    // }, 300); // Change y position every 300 milliseconds
}

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