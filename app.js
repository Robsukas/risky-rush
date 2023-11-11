const app = new PIXI.Application({
    background: '#ede6d5',
    resizeTo: window,
});

document.body.appendChild(app.view);

const circle = new PIXI.Graphics();
circle.beginFill(0x66CCFF);
circle.drawCircle(0, 0, 10);
circle.x = 50;
circle.y = app.view.height / 2;
app.stage.addChild(circle);

function moveCircle(){
    const tween = gsap.to(circle, {x: app.screen.width, duration: 10, ease: "none", 
        onComplete: function () {
            circle.x = 0;
            moveCircle();
        }
    });

    setInterval(() => {
        const newY = Math.random() * app.screen.height;
        gsap.to(circle, {y: newY, duration: 0.4, ease: "none"});
    }, 300); // Change y every 1 second here
}

moveCircle();