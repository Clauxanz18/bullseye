window.addEventListener('load', function() {
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.font = '40px Helvetica';
    ctx.textAlign = 'center';

    // TODO: Configure into modules
    class Player {
        constructor(game) {
            this.game = game;
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 10;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight , this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if(this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
    
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                context.stroke();
            }
        }

        update() {
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            
            // sprite animation
            const angle = Math.atan2(this.dy, this.dx);
            if(angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if(angle < -1.96) this.frameY = 7;
            else if(angle < -1.17) this.frameY = 0;
            else if(angle < -0.39) this.frameY = 1;
            else if(angle < 0.39) this.frameY = 2;
            else if(angle < 1.17) this.frameY = 3;
            else if(angle < 1.96) this.frameY = 4;
            else if(angle < 2.74) this.frameY = 5;

            const distance = Math.hypot(this.dy, this.dx);

            if(distance > this.speedModifier) {
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;

            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;

            // * horizontal Boundaries
            if(this.collisionX < this.collisionRadius)
            this.collisionX = this.collisionRadius;
            else if (this.collisionX > this.game.width - this.collisionRadius)
            this.collisionX = this.game.width - this.collisionRadius;

            // * Vertical Boundaries
            if(this.collisionY < this.game.topMargin + this.collisionRadius)
            this.collisionY = this.game.topMargin + this.collisionRadius;
            else if (this.collisionY > this.game.height - this.collisionRadius)
            this.collisionY = this.game.height - this.collisionRadius;

            this.game.obstacles.forEach(obstacle => {
                // ? [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
                const [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)
                if(collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
                }
            })
        }
    }

    class Obstacle {
        constructor(game) {
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
            this.image = document.getElementById('obstacles');
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height, );
            if(this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {

        }
    }

    class Egg {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + Math.random() * (this.game.width - this.margin * 2);
            this.collisionY = this.game.topMargin + Math.random() * (this.game.height - this.game.topMargin - this.margin);
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 5000;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY)
            if(this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius *2.53);
            }
        }

        update(deltaTime) {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;

            // * Collisions
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
            collisionObjects.forEach(object => {
                // ? [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
                const [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if(collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            })
            
            // * Hatching
            if(this.hatchTimer > this.hatchInterval) {
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY))
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += deltaTime;
            }
        }
    }

    class Larva {
        constructor(game, x, y) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random()
        }
        
        draw(context) {
            context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if(this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 50;

            // move to safety
            if(this.collisionY < this.game.topMargin) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 30;
            this.speedX = Math.random() * 3 + 5;
            this.image = document.getElementById('toad');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * this.game.height - this.game.topMargin);
            this.spriteX;
            this.spriteY;
        }

        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if(this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX;
            if (this.spriteX + this.width < 0) {
                this.collisionX = this.game.width + this.width + (Math.random() * this.game.width) * 0.5;
                this.collisionY = this.game.topMargin + Math.random() * (this.game.height - this.game.topMargin);
                console.log(this.collisionX, this.collisionY);
            }

            let collisionObjects = [this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
                // ? [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
                const [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if(collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            })
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = true;
            this.player = new Player(this);
            this.fps = 60;
            this.timer = 0;
            this.interval = 1000 / this.fps;
            this.eggTimer = 0;
            this.eggInterval = 500;
            this.numberOfObstacles = 10;
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.gameObjects = [];
            this.maxEggs = 10;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            this.canvas.addEventListener('mousedown', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            })

            this.canvas.addEventListener('mouseup', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            })

            this.canvas.addEventListener('mousemove', e => {
                if(this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            })

            window.addEventListener('keydown', e => {
                if(e.key === 'd') this.debug = !this.debug;
            })
        }

        render(context, deltaTime) {
            if(this.timer > this.interval) {
                // ? An optimization for this would be to have multiple canvases and only update the necesary ones. 
                ctx.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [...this.obstacles, ...this.eggs, this.player, ...this.enemies, ...this.hatchlings];
                // ? An optimization here would be to only sort this array if the vertical position of an object changes or is added/removed
                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;
                })
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime)
                })
                this.timer = 0;
            }
            this.timer += deltaTime;

            // * add eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            }
        }

        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
        }

        addEgg() {
            this.eggs.push(new Egg(this));
        }

        addEnemy() {
            this.enemies.push(new Enemy(this));
            console.log('added Enemy');
        }

        removeGameObjects() {
            this.eggs = this.eggs.filter(egg => !egg.markedForDeletion);
            this.hatchlings = this.hatchlings.filter(hatchling => !hatchling.markedForDeletion);
        }

        init() {
            for(let i = 0; i < 3; i++) {
                console.log('Adding enemy');
                this.addEnemy();
            }

            let attemps = 0;

            while (this.obstacles.length < this.numberOfObstacles && attemps < 500) {
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dy, dx);
                    const distanceBuffer = 100;
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;

                    if(distance < sumOfRadii) {
                        overlap = true;
                    }
                })
                
                const margin = testObstacle.collisionRadius * 3;
                const isContainedX = (testObstacle.spriteX > 0) && (testObstacle.spriteX < this.width - testObstacle.width);
                const isContainedY = (testObstacle.collisionY > this.topMargin + margin) && (testObstacle.collisionY < this.height - margin);

                if(!overlap && isContainedX && isContainedY) {
                    this.obstacles.push(testObstacle);
                }

                attemps++;
                
            }
        }
    }

    const game = new Game(canvas);
    game.init();

    let lastTime = 0;

    function animate(timeStamp = 0) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        window.requestAnimationFrame(animate);
    }

    animate();
})