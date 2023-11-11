const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});

document.body.appendChild(app.view);

// Create a container
const timerContainer = new PIXI.Container();
timerContainer.x = app.screen.width / 2 + 600;
timerContainer.y = app.screen.height / 2 - 250;
app.stage.addChild(timerContainer);

// Create a border for the container
const border = new PIXI.Graphics();
border.lineStyle(2, 0xFF0000, 1); // Width, color, and alpha of the border
border.drawRect(-50, -25, 100, 50); // x, y, width, height of the border
timerContainer.addChild(border);


// Create a text object for the timer
const timerText = new PIXI.Text('10.000', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center' });
timerText.anchor.set(0.5);
timerContainer.addChild(timerText);

function startCountdown(duration, textElement) {
    var startTime = Date.now();
    var countdownInterval = setInterval(function () {
        var elapsedTime = Date.now() - startTime;
        var remainingTime = Math.max(duration - elapsedTime, 0);
        var seconds = Math.floor(remainingTime / 1000);
        var milliseconds = Math.floor((remainingTime % 1000) / 10); // Dividing by 10 to get centiseconds

        textElement.text = seconds + '.' + (milliseconds < 10 ? '0' : '') + milliseconds;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            textElement.text = '0.000';
            // Actions when countdown ends
        }
    }, 10); // Updating every 10 milliseconds
}

window.onload = function () {
    startCountdown(10000, timerText); // 10 seconds in milliseconds
};
