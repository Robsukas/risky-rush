const app = new PIXI.Application({
    background: '#ede6d5',
    resizeTo: window,
});

document.body.appendChild(app.view);

let rocket;

function createRocket() {
    // create a new Sprite from an image path
    rocket = PIXI.Sprite.from("rocket.png");
    // center the sprite's anchor point
    rocket.anchor.set(0.5);
    // move the sprite to the center of the screen
    rocket.x = 50;
    rocket.y = app.screen.height / 2;
    // add sprite to stage
    app.stage.addChild(rocket);
}
createRocket();

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

startCountdown(10000, timerText); // 10 seconds in milliseconds
function moveRocket() {
    const tween = gsap.to(rocket, {
        x: app.screen.width,
        duration: 10,
        ease: "none",
        onComplete: function () {
            rocket.x = 0;
            moveRocket();
        }
    });

    setInterval(() => {
        const newY = Math.random() * app.screen.height;
        const movingUp = newY < rocket.y; // Check if the new Y position is above the current position

        // Flip the rocket vertically when moving up
        rocket.scale.y = movingUp ? 1 : -1;

        gsap.to(rocket, {y: newY, duration: 0.4, ease: "none"});
    }, 300); // Change y position every 300 milliseconds
}

moveRocket();

// Function to create a line chart
// Function to create a line chart with grid lines
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
const maxX = 1200;
const maxY = 600;

// Add the crypto chart to the stage
const cryptoChart = createCryptoChart(maxX, maxY);
cryptoChart.x = app.screen.width / 2 - cryptoChart.width / 2;
cryptoChart.y = app.screen.height / 2 - cryptoChart.height / 2;
app.stage.addChild(cryptoChart);

