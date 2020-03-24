'use strict'

class Particle {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.position = createVector(random(windowWidth), random(windowHeight));
        this.velocity = createVector();
        this.maxSpeed = random(settings.minSpeed, settings.maxSpeed);
        this.maxLife = random(settings.minLifeInSeconds, settings.maxLifeInSeconds) * 1000;  // ms
        this.life = this.maxLife;
    }

    draw() {
        strokeWeight(settings.pointSize);
        colorMode(HSB, 100);

        if (settings.fancyColors) {
            let normalizedHeading = this.velocity.heading() / PI;
            stroke(map(normalizedHeading, -1, 1, 0, 100), 80, 100, settings.alpha);
        } else {
            stroke(settings.staticColor, 80, 100, settings.alpha);
        }
        
        point(this.position.x, this.position.y);
    }

    update(deltaTime, vectors, sclx, scly, cells) {
        this.life -= deltaTime;
        if (this.life < 0)
            this.initialize();

        let steering = this.follow(vectors, sclx, scly, cells);
        
        this.velocity.add(steering);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        this.wraparoundIfNeeded();
    }

    follow(vectors, sclx, scly, cells) {
        let x = floor(this.position.x / sclx);
        let y = floor(this.position.y / scly);
        let index = x + y * cells;
        let force = vectors[index];

        return force;
    };

    wraparoundIfNeeded() {
        if (this.position.x < 0)
            this.position.x = width - 1;
        else if (this.position.x >= width)
            this.position.x = 0;

        if (this.position.y < 0)
            this.position.y = height - 1;
        else if (this.position.y >= height)
            this.position.y = 0;
    }
}