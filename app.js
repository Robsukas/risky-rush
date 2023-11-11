const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});

document.body.appendChild(app.view);

// create a new Sprite from an image path
const bunny = PIXI.Sprite.from("https://pixijs.com/assets/bunny.png");

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.stage.addChild(bunny);

// Listen for animate update
app.ticker.add((delta) =>
{
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent transformation
    bunny.rotation += 0.1 * delta;
});

// Add play text
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
});

const playText = new PIXI.Text('SELL!', style);

playText.x = app.screen.width / 2 - (playText.width / 2);
playText.y = app.screen.height - playText.height;
app.stage.addChild(playText);

playText.eventMode = 'static';
playText.cursor = 'pointer';
playText.addEventListener('pointerdown', function () {
    alert("SOLD")
});