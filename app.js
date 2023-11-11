// Create base app
const app = new PIXI.Application({
    background: '#ede6d5',
    resizeTo: window,
});
document.body.appendChild(app.view);

/* ============= GLOBAL CONSTANTS ============= */
const roundTime = 10_000; // in milliseconds
const initialMoney = 100; // dollars
const initialMultipier = 1;
const minMultiplier = 0.01;
const maxMultiplier = 30;
const blurFilter = new PIXI.filters.BlurFilter();
const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter({radius: app.screen.height / 3, strength: 0.08, innerRadius: 100});
/* ============= GLOBAL VARIABLES ============= */
let playerMoney = initialMoney;
let currentBet = 0;
let currentTime = roundTime;
let lastMultiplier = initialMultipier;
let currentMultiplier = initialMultipier;
let isGameRunning = false;

app.stage.sortableChildren = true;

/* ============= CURSOR ============= */

const explosionTexture = PIXI.Texture.from('images/exp.png');
const flameTexture = PIXI.Texture.from('images/flame.png');

const flameEffect = new PIXI.Sprite(flameTexture);
flameEffect.anchor.set(0.5);
flameEffect.scale.set(0.05,0.05)
flameEffect.visible = false;
app.stage.addChild(flameEffect);

function animateFlame() {
    // You can add flickering effect by changing the alpha or scale
    flameEffect.scale.x = 0.05 + Math.random() * 0.1;
    flameEffect.scale.y = 0.05 + Math.random() * 0.1;
    flameEffect.alpha = 0.1 + Math.random() * 0.2;
}

function createExplosion(x, y) {
    const explosion = new PIXI.Sprite(explosionTexture);
    explosion.anchor.set(0.5);
    explosion.position.set(x, y);
    explosion.scale.set(0.1); // Start small
    app.stage.addChild(explosion);

    // Animate the explosion
    let scale = 0.1;
    const maxScale = 0.2; // Maximum scale of explosion
    const scaleSpeed = 0.05; // Speed of scaling up

    const explosionTicker = new PIXI.Ticker();
    explosionTicker.add(() => {
        scale += scaleSpeed;
        explosion.scale.set(scale);

        // Once the explosion reaches max size, remove it
        if (explosion.scale.x >= maxScale) {
            explosionTicker.stop();
            app.stage.removeChild(explosion);
        }
    });
    explosionTicker.start();
}



// Handle mouse click event
app.view.addEventListener('click', (event) => {
    const rect = app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create an explosion at the click position
    createExplosion(x, y);
});

app.view.addEventListener('mousemove', (event) => {
    const rect = app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const offset = 15

    flameEffect.position.set(x, y - offset);
    flameEffect.visible = true;
});

// Handle mouse out event to hide the flame when cursor is not over the canvas
app.view.addEventListener('mouseout', () => {
    flameEffect.visible = false;
});

const flameTicker = new PIXI.Ticker();
flameTicker.add(animateFlame);
flameTicker.start();

app.stage.sortableChildren = true;

/* ============= CURSOR ============= */

const cursorTexture = PIXI.Texture.from('star.png');
const cursorTracker = new PIXI.Sprite(cursorTexture);
cursorTracker.anchor.set(0.5);
cursorTracker.zIndex = 1000;
app.stage.addChild(cursorTracker);

// Hide the default cursor (optional)
app.view.style.cursor = 'none';

// Update the cursor sprite position on mouse move
app.view.addEventListener('mousemove', (event) => {
    const rect = app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    cursorTracker.x = x;
    cursorTracker.y = y;
});

// Animation logic remains the same
let scaleDirection = 1;
const maxScale = 1.5;
const minScale = 0.5;
const scaleSpeed = 0.05;
const rotationSpeed = 0.1;

// Create a ticker for the animation loop
const ticker = new PIXI.Ticker();
ticker.add(() => {
    // Update scale
    cursorTracker.scale.x += scaleSpeed * scaleDirection;
    cursorTracker.scale.y += scaleSpeed * scaleDirection;

    // Reverse direction if limits are reached
    if (cursorTracker.scale.x > maxScale || cursorTracker.scale.x < minScale) {
        scaleDirection *= -1;
    }

    cursorTracker.rotation += rotationSpeed;
});

ticker.start();

/* ============= ROCKET ============= */
// create a new Sprite from an image path
const rocket = PIXI.Sprite.from("images/rocket.png");
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

const smallStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
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
    align: 'right'
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
const timerText = new PIXI.Text(formattedDuration, style);
timerText.anchor.set(0.5);
timerContainer.x = app.screen.width / 2;
timerContainer.y = timerText.height / 2;
timerContainer.addChild(timerText);

/* ============= SELL TEXT ============= */
const sellText = new PIXI.Text('SELL!', style);
sellText.x = app.screen.width / 2 - (sellText.width / 2);
sellText.y = app.screen.height - sellText.height + 15;
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

/* ============= START TEXT ============= */
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

let lastWin = new PIXI.Text('Last Win: 0', textStyle);
lastWin.x = rec.getBounds().x + rectWidth / 2 - lastWin.width / 2;
lastWin.y = rec.getBounds().y + lastWin.height * 8;

// Calculate the bottom coordinate of the instruction text
const instructionTextBottom = instructionText.y + instructionText.height + 20;

/* ========== INPUT FIELD ========= */
// Create a PIXI.Graphics rectangle to simulate an input field
const inputField = new PIXI.Graphics();

inputField.beginFill(0xFFFFFF, 1);
inputField.drawRect(instructionText.x, instructionTextBottom, 200, 30);
inputField.endFill();

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
rec.addChild(inputField);
rec.addChild(lastWin);

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

/* ============= MULTIPLIER LABELS ============= */
const multiplierLabels = [];

// Text content for each multiplier label
const multiplierContents = [
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

const totalMultipliers = multiplierContents.length;

// Calculate the vertical spacing between multiplier labels
const verticalSpacing = cryptoChart.height / (totalMultipliers);

// Create and position each multiplier label on the left side
for (let i = 0; i < totalMultipliers; i++) {
    const label = new PIXI.Text(multiplierContents[i], smallStyle);
    label.anchor.x = 1;
    label.x = cryptoChart.x - 10; // Adjust the x-coordinate to the left of the cryptoChart
    label.y = cryptoChart.y + verticalSpacing * i; // Evenly spaced between top and bottom
    multiplierLabels.push(label);
}

/* ============= TIME LABELS ============= */
const timeLabels = [];

// Total seconds for the time labels
const totalSeconds = 10;

// Calculate the horizontal spacing between time labels
const horizontalSpacing = cryptoChart.width / totalSeconds;

// Create and position each time label at the bottom of the chart
for (let i = 0; i <= totalSeconds; i++) {
    const timeLabel = new PIXI.Text(`${totalSeconds - i}s`, smallStyle);
    timeLabel.anchor.x = 0.5;
    timeLabel.x = cryptoChart.x + horizontalSpacing * i;
    timeLabel.y = cryptoChart.y + cryptoChart.height - 5; // Adjust the y-coordinate below the chart
    timeLabels.push(timeLabel);
}

/* ========= DEPOSIT AMOUNT TO SCREEN ========= */
let depositAmount = new PIXI.Text(`Current Deposit: `, smallStyle);
depositAmount.x = cryptoChart.x;
depositAmount.y = timerContainer.y;

/* ============= LAYERING ============= */
app.stage.addChild(cryptoChart);
app.stage.addChild(...multiplierLabels);
app.stage.addChild(...timeLabels);
app.stage.addChild(sellText);
app.stage.addChild(depositAmount);
app.stage.addChild(timerContainer);
app.stage.addChild(rocket);
app.stage.addChild(rec)

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
    multiplierLabels.forEach(label => (label.filters = [blurFilter]));
    timeLabels.forEach(label => (label.filters = [blurFilter]));
    rocket.filters = [blurFilter];
    timerContainer.filters = [blurFilter];
    sellText.filters = [blurFilter];
    depositAmount.filters = [blurFilter]
}

function unblurGame() {
    multiplierLabels.forEach(label => (label.filters = []));
    timeLabels.forEach(label => (label.filters = []));
    cryptoChart.filters = [];
    cryptoChart.filters = [zoomBlurFilter];
    rocket.filters = [];
    timerContainer.filters = [];
    sellText.filters = [];
    depositAmount.filters = [];
}

function resetGame() {
    currentTime = roundTime;
    lastMultiplier = initialMultipier;
    currentMultiplier = initialMultipier;
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

    rec.removeChild(lastWin);
    conf = 1 + (rocket.y - cryptoChart.y - cryptoChart.height / 2) / -300;
    lastWin = new PIXI.Text(`Last Win: ${(conf * inputValue).toFixed(2)}     Win Conf: ${conf.toFixed(4)}`, textStyle);
    lastWin.x = rec.getBounds().x + rectWidth / 2 - lastWin.width / 2;
    lastWin.y = rec.getBounds().y + lastWin.height * 8;
    rec.addChild(lastWin);

    rec.visible = true;
    inputElement.style.display = 'block';

}

function moveRocket() {
    // Reset rocket x
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
            // Update sprite's position
            rocket.x = x1 + (x2 - x1) * (elapsedTime / duration);
            // Update zoom blur filter position
            zoomBlurFilter.center = [rocket.x - rocket.width, rocket.y - rocket.height];
        } else {
            xTicker.stop(); // Stop the ticker after the duration or if game over
        }
    });

    // Add ticker for y movement
    let yTicker = new PIXI.Ticker();

    // Set the initial target Y position and interval to update it
    let targetY = Math.random() * app.screen.height;
    let updateInterval = 175; // Update target every * ms
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