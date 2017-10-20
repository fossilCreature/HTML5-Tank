// Copyright 2013-2014 Dustin Davidson

var canvas = document.getElementById('tank-canvas'); // get the canvas
var ctx = canvas.getContext('2d');
var controlCanvas = document.getElementById('controls'); // get the other canvas
var controlCtx = controlCanvas.getContext('2d');
var tankCanvasFocus = true;

var SCALE = 30;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2AABB = Box2D.Collision.b2AABB;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2Listener = Box2D.Dynamics.b2ContactListener;
var listener = new b2Listener;

var world = new b2World(new b2Vec2(0, 10), true);
world.SetContactListener(listener);

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// IMAGES

var defaultImg = new Image();
defaultImg.onload = function () {};
defaultImg.src = 'weapons/ball.png';

var smallMissileImg = new Image();
smallMissileImg.onload = function () {};
smallMissileImg.src = 'weapons/smallMissile.png';

var blasterImg = new Image();
blasterImg.onload = function () {};
blasterImg.src = 'weapons/blaster.png';

var smallDirtImg = new Image();
smallDirtImg.onload = function () {};
smallDirtImg.src = 'weapons/smalldirt.png';

var defaultTank = new Image();
defaultImg.onload = function () {};
defaultTank.src = 'tanks/greenTank.png';

// END OF IMAGES

canvas.onmousemove = function (event) { // this  object refers to canvas object  
    mouse = {
        x: event.pageX - this.offsetLeft,
        y: event.pageY - this.offsetTop
    }
    tanks.playerTank.currentAngle = Math.atan2(mouse.y - tanks.playerTank.y, mouse.x - tanks.playerTank.x);
    tankCanvasFocus = true;
    return false;
};

canvas.onmouseout = function (event) {
    tankCanvasFocus = false;
    return false;
};

canvas.onmousedown = function (event) { // mouse button down
    //event.preventDefault();
    mouse.down = true;
    var weapon = tanks.playerTank.currentWeapon;
    switch (create.weapons[weapon].bType) {
        case 'box':
            create.box(tanks.playerTank.x, tanks.playerTank.y, b2Body.b2_dynamicBody, create.weapons[tanks.playerTank.currentWeapon]); // -15
            break;
        case 'circle':
            create.circle(tanks.playerTank.x, tanks.playerTank.y, b2Body.b2_dynamicBody, create.weapons[tanks.playerTank.currentWeapon]);
            break;
    }


    tanks.playerTank.lastAngle = tanks.playerTank.currentAngle; // update the last angle guide
    return false;
};

canvas.onmouseup = function (event) { // mouse button up
    mouse.down = false;
    return false;
};

document.onkeydown = function (event) { // keyboard pressed
    if (tankCanvasFocus) {
        event.preventDefault();
        if (tankCanvasFocus = true) {
            key.down[event.keyCode] = true;
        }
        console.log(event.keyCode) // DEBUGGING: delete later
        return false;
    }
};

document.onkeyup = function (event) { // keyboard not pressed
    delete key.down[event.keyCode];
};

listener.BeginContact = function (contact) { // contact listeners

    objA = contact.GetFixtureA().GetBody();
    objB = contact.GetFixtureB().GetBody();

    if (objA.GetUserData() != null) {
        objA.GetUserData().explode.x = objA.GetPosition().x;
        objA.GetUserData().explode.y = objA.GetPosition().y;
        explosion.set(objA.GetUserData());
        destroy.setForDeletion(objA);
    };

    if (objB.GetUserData() != null) {
        objB.GetUserData().explode.x = objB.GetPosition().x;
        objB.GetUserData().explode.y = objB.GetPosition().y;
        explosion.set(objB.GetUserData());
        destroy.setForDeletion(objB);
    };
};

listener.EndContact = function (contact) {};

listener.Postsolve = function (contact, impulse) {};

world.SetContactListener(listener);

var mouse = { //make a globally available object with x,y attributes 
    x: 0,
    y: 0,
    down: false
};

var key = { // Handles all the keyboard inputs
    press: function () { // note: add capital letters
        if (65 in this.down) { // a
            tanks.playerTank.moveLeft();
        };
        if (68 in this.down) { // b
            tanks.playerTank.moveRight();
        };
        if (87 in this.down) { // W key
            tanks.playerTank.changeWeapon();
            controls.update();
            delete this.down[87];
        };
    },
    down: []
};

var init = {
    defaultWalls: function () {
        create.wall(20, HEIGHT, -10, HEIGHT / 2, b2Body.b2_staticBody, null); // left wall
        create.wall(WIDTH, 20, WIDTH / 2, -20, b2Body.b2_staticBody, null); // ceiling
        create.wall(20, HEIGHT, WIDTH + 10, HEIGHT / 2, b2Body.b2_staticBody, null); // right wall
        create.wall(WIDTH, 20, WIDTH / 2, HEIGHT + 10, b2Body.b2_staticBody, null) // floor
    },
    start: function gameStart() {

        (function () { // start the game loop
            var tm = new Date().getTime();
            var dt = (tm - lastFrame) / 1000;
            if (dt > 1 / 15) {
                dt = 1 / 15;
            }
            lastFrame = tm;

            loop.step(dt);
            loop.update(dt);
            destroy.clearTheDead();
            requestAnimFrame(gameStart);
        })();
    },
    defaultMisc: function () {
        controls.update();

    }
};
var controls = {
    update: function () {
        controlCanvas.width = controlCanvas.width;

        controlCtx.save();

        controlCtx.fillStyle = 'rgba(0,0,0,.5)'; // shaded area left
        controlCtx.fillRect(0, 0, 90, 60);

        controlCtx.font = "bold 11px Arial"; // Text

        controlCtx.fillStyle = 'rgba(255,100,100,.5)';
        controlCtx.shadowColor = 'rgb(255,100,100)';
        controlCtx.shadowOffsetX = 0;
        controlCtx.shadowOffsetY = 0;
        controlCtx.shadowBlur = 5;
        controlCtx.fillText('Health : ' + tanks.playerTank.stats.health, 10, 15); // Health

        controlCtx.fillStyle = 'rgba(100,200,255,.5)';
        controlCtx.shadowColor = 'rgb(100,200,255)';
        controlCtx.fillText('Energy : ' + tanks.playerTank.stats.energy, 10, 30); // Energy

        controlCtx.fillStyle = 'rgba(255,200,255,.5)';
        controlCtx.shadowColor = 'rgb(255,200,255)';
        controlCtx.fillText('Armor : ' + tanks.playerTank.stats.armor, 10, 45); // Armor

        controlCtx.beginPath(); // Divider
        controlCtx.moveTo(90, 0);
        controlCtx.lineTo(90, 60);
        controlCtx.lineWidth = 1;
        controlCtx.strokeStyle = 'rgba(255,255,255, 0.1)';
        controlCtx.stroke();

        controlCtx.shadowColor = 'rgba(255,100,100,.5)'; // small box for weapon image
        controlCtx.shadowOffsetX = 0;
        controlCtx.shadowOffsetY = 0;
        controlCtx.shadowBlur = 20;
        controlCtx.fillStyle = 'rgb(25,25,25)';
        controlCtx.fillRect(96, 2, 24, 24)
        controlCtx.strokeStyle = 'rgba(200,200,200, 0.2)';
        controlCtx.strokeRect(96, 2, 24, 24)

        controlCtx.drawImage(create.weapons[tanks.playerTank.currentWeapon].img, 100, 6); // image

        controlCtx.fillStyle = 'rgb(25,25,25)'; // description box
        controlCtx.fillRect(96, 32, 200, 24)
        controlCtx.strokeStyle = 'rgba(200,200,200, 0.2)';
        controlCtx.strokeRect(96, 32, 200, 24)

        controlCtx.font = "12px Arial"; // Text
        controlCtx.strokeStyle = 'rgba(255,255,255, 1)';
        controlCtx.fillStyle = 'rgba(255,255,255,.6)';
        controlCtx.fillText(create.weapons[tanks.playerTank.currentWeapon].description, 100, 48);

        controlCtx.font = "12px Arial"; // Text
        controlCtx.fillStyle = 'rgb(255,255,255)';
        controlCtx.fillText('Weapon : ' + create.weapons[tanks.playerTank.currentWeapon].name, 130, 15);

        controlCtx.restore();


    },

};

var ui = {
    draw: { // draw a circle guide
        angleGuide: function (x, y, radius) {

            ctx.beginPath(); // outer circle
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255, 0.1)';
            ctx.stroke();

            ctx.beginPath(); // inner circle
            ctx.strokeStyle = 'rgba(255,255,255, 0.05)';
            ctx.arc(x, y, radius - (radius * .25), 0, 2 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath(); // verticle cross hair
            ctx.moveTo(x - radius, y);
            ctx.lineTo(x + radius, y);
            ctx.stroke();

            ctx.beginPath(); // horizontal cross hair
            ctx.moveTo(x, y - radius);
            ctx.lineTo(x, y + radius);
            ctx.stroke();

            var d = Math.sqrt(Math.abs((mouse.x - x)) + Math.abs((mouse.y - y))); // distance
            var a = tanks.playerTank.currentAngle // angle of mouse from center of canvas NOTE: Change

            ctx.beginPath(); // angle line
            ctx.strokeStyle = 'rgba(255,255,255, 0.4)';
            ctx.lineWidth = 2;
            ctx.moveTo(x, y);
            ctx.lineTo(tanks.playerTank.x + Math.cos(a) * radius, tanks.playerTank.y + Math.sin(a) * radius);
            ctx.stroke();

            ctx.beginPath(); // Previous angle line
            ctx.strokeStyle = 'rgba(255,200,200, 0.2)';
            ctx.lineWidth = 1;
            ctx.moveTo(x, y);
            ctx.lineTo(tanks.playerTank.x + Math.cos(tanks.playerTank.lastAngle) * radius, tanks.playerTank.y + Math.sin(tanks.playerTank.lastAngle) * radius);
            ctx.stroke();

            ctx.font = "10px Arial"; // Text
            ctx.strokeStyle = 'rgba(255,255,255, 1)';
            ctx.fillStyle = 'rgba(255,255,255,.5)';
            ctx.fillText('Angle : ' + (truncateDecimals(Math.abs((a / Math.PI * 180) + (a < 0 ? 0 : -360)), 2)), 10, 10); // angle
            ctx.fillText('Power : ' + parseInt(d * SCALE), 10, 20); // power
            ctx.fillText('Particles : ' + explosion.list.length, 10, 30) // debugging

            //ctx.fillText('V : ' + (5 * (mouse.x - tanks.playerTank.x) / SCALE) + ' : ' + (5 * (mouse.y - tanks.playerTank.y) / SCALE), 10, 50); // debugging
        },
        Weapons: function () {

        }
    }
};

truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

var explosion = {
    set: function (obj) {

        for (var angle = 0; angle < 360; angle += Math.round(360 / obj.explode.count)) {
            var particle = new explosion.particle();
            particle.scale = obj.explode.scale;
            particle.x = obj.explode.x * SCALE;
            particle.y = obj.explode.y * SCALE;
            particle.radius = obj.explode.radius;
            particle.color = obj.explode.color;
            var speed = Math.random() * 10 + obj.explode.speed;
            particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
            particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);
            this.list.push(particle);
        }
    },
    list: [],
    particle: function () {
        this.scale = 1;
        this.x = 0;
        this.y = 0;
        this.radius = 20; //change
        this.color = 0;
        this.velocityX = 0;
        this.VelocityY = 0;
        this.scaleSpeed = 0.5;

        this.update = function (ms) {
            this.scale -= this.scaleSpeed * ms / 1000;

            if (this.scale <= 0) {
                this.scale = 0;
            }
            this.x += this.velocityX * ms / 1000.0;
            this.y += this.velocityY * ms / 1000.0;
        };

        this.draw = function () {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale, this.scale);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        };
    }
};

var tanks = {
    playerTank: {
        x: WIDTH / 2, // default starting position
        y: HEIGHT / 2, // default starting position
        lastAngle: -1.57079633, // default angle is 90 in radians
        currentAngle: 1,
        power: 50,
        moveLeft: function () {
            if (this.x > 16) {
                this.x -= 1;
                this.update();
            }
        },
        moveRight: function () {
            if (this.x < WIDTH - 16) {
                this.x += 1;
                this.update();
            }
        },
        draw: function (x, y) {
            ctx.drawImage(defaultTank, x - 12, y - 12);

        },
        currentWeapon: 1,
        changeWeapon: function () {
            if (this.currentWeapon < create.weapons.length - 1) {
                this.currentWeapon++;
            } else {
                this.currentWeapon = 0;
            };
        },
        update: function () {
            if (!ground.isColliding(this.x, this.y + 12)) {
                while (!ground.isColliding(this.x, this.y + 12)) {
                    this.y++;
                }
            } else if (ground.isColliding(this.x, this.y + 11)) {
                while (ground.isColliding(this.x, this.y + 11)) {
                    this.y--;
                }
            }
        },
        stats: {
            level: 1,
            health: 100,
            energy: 10,
            armor: 0,
            traction: 1,
            luck: 1
        }
    }
};

var create = {

    wall: function (width, height, x, y, type, data) { // BOX object
        var bodyDef = new b2BodyDef;
        bodyDef.type = type;
        bodyDef.position.Set(x / SCALE, y / SCALE);
        bodyDef.userData = data;

        var shape = new b2PolygonShape;
        shape.SetAsBox(width / 2 / SCALE, height / 2 / SCALE);

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 1.0;
        fixtureDef.restitution = 0.0;
        fixtureDef.shape = shape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
    },
    box: function (x, y, type, data) { // BOX object
        a = tanks.playerTank.currentAngle; // angle of mouse

        var bodyDef = new b2BodyDef;
        bodyDef.type = type;
        bodyDef.angle = a;
        bodyDef.position.Set((x + Math.cos(a) * 8) / SCALE, (y + Math.sin(a) * 8) / SCALE);
        bodyDef.userData = data;


        var shape = new b2PolygonShape;
        shape.SetAsBox(data.shapex / SCALE, data.shapey / SCALE);

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = data.density;
        fixtureDef.friction = data.friction;
        fixtureDef.restitution = data.restitution;
        fixtureDef.shape = shape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        body.SetLinearVelocity(new b2Vec2(5 * (mouse.x - tanks.playerTank.x) / SCALE, 5 * (mouse.y - tanks.playerTank.y) / SCALE));

    },
    circle: function (x, y, type, data) { // CIRCLE object
        var a = tanks.playerTank.currentAngle; // angle of mouse

        var bodyDef = new b2BodyDef;
        bodyDef.type = type;
        bodyDef.position.Set((x + Math.cos(a) * 8) / SCALE, (y + Math.sin(a) * 8) / SCALE);
        bodyDef.angle = a;
        bodyDef.userData = data;

        var shape = new b2CircleShape(data.radius / SCALE)

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = data.density;
        fixtureDef.friction = data.friction;
        fixtureDef.restitution = data.restitution;
        fixtureDef.shape = shape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        body.SetLinearVelocity(new b2Vec2(5 * (mouse.x - tanks.playerTank.x) / SCALE, 5 * (mouse.y - tanks.playerTank.y) / SCALE));
    },
    weapons: [{
            img: defaultImg,
            description: 'It belonged to a test dummy',
            density: 1.0,
            friction: 0.5,
            restitution: 0.3,
            radius: 8,
            name: 'Test Ball',
            bType: 'circle',
            type: 'missile',
            explode: {
                x: 0,
                y: 0,
                radius: 20,
                color: 'rgba(220,210,200,0.6)',
                speed: 25,
                count: 10,
                scale: 1
            }
        },
        {
            img: smallMissileImg,
            description: 'Economic missile',
            density: 1.0,
            friction: 1.0,
            restitution: 0.1,
            shapex: 8,
            shapey: 4,
            name: 'Small Missile',
            bType: 'box',
            type: 'missile',
            explode: {
                x: 0,
                y: 0,
                radius: 40,
                color: 'rgba(255,230,60,0.7)',
                speed: 10,
                count: 25,
                scale: 1
            },
        },
        {
            img: blasterImg,
            description: 'Cheap eye candy',
            density: 1.0,
            friction: 1,
            restitution: 0.3,
            radius: 6,
            name: 'Blaster',
            bType: 'circle',
            type: 'missile',
            explode: {
                x: 0,
                y: 0,
                radius: 15,
                color: 'rgba(20,255,20,0.1)',
                speed: 40,
                count: 50,
                scale: .9
            }
        },
        {
            img: smallDirtImg,
            description: 'Dirty and messy',
            density: 1.0,
            friction: 1,
            restitution: 0.3,
            radius: 8,
            name: 'Dirt Bomb',
            bType: 'circle',
            type: 'dirt',
            explode: {
                x: 0,
                y: 0,
                radius: 20,
                color: 'rgba(120,155,40,0.6)',
                speed: 10,
                count: 15,
                scale: 1
            }
        }
    ],
};

var ground = {
    init: function () {
        var terrain = ctx.createImageData(800, 500);

        var r = 50;
        var g = 120;
        var b = 0;
        var a = 255;

        for (var x = 0; x < terrain.width; x++) {
            for (var y = 0; y < terrain.height; y++) {

                // Index of the pixel in the array
                var index = (x + y * terrain.width) * 4;

                if (y < 260) {
                    terrain.data[index + 0] = 0;
                    terrain.data[index + 1] = 0;
                    terrain.data[index + 2] = 0;
                    terrain.data[index + 3] = 0;
                } else {
                    terrain.data[index + 0] = r + Math.floor(Math.random() * 25);
                    terrain.data[index + 1] = g + Math.floor(Math.random() * 25);
                    terrain.data[index + 2] = b + Math.floor(Math.random() * 25);
                    terrain.data[index + 3] = a;
                }
            }
        }
        this.terrain = terrain;
    },
    terrain: null,
    draw: function () {
        ctx.putImageData(this.terrain, 0, 0);
    },
    isColliding: function (x, y) {
        var terrainData = this.terrain;
        if (x < 0 || y < 0 || x > terrainData.width || y > terrainData.height - 1) return true;
        //var r = (y * canvasData.width + x) * 4;
        var a = ((y * terrainData.width + x) * 4) + 3; // alpha

        if (terrainData.data[a] > 0) return true;
        return false;
    },
    hit: function (x, y, radius, data) {
        if (data == 'missile') {
            this.damage(x, y, radius, data)
        }
        if (data == 'dirt') {
            this.damage(x, y, radius, data)
        }
    },
    damage: function (x, y, radius, type) {

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = WIDTH
        tempCanvas.height = HEIGHT
        var tempContext = tempCanvas.getContext("2d");

        tempContext.putImageData(this.terrain, 0, 0);

        if (type == 'missile') {
            tempContext.globalCompositeOperation = 'destination-out';
            tempContext.fillStyle = '#fff';
        } else if (type == 'dirt') {
            tempContext.globalCompositeOperation = 'destination-over';
            tempContext.fillStyle = '#572E1C';
        }

        var cx = 0;
        var cy = 0;

        x = x * SCALE;
        y = y * SCALE;

        for (var i = 1; i <= 20; ++i) {
            tempContext.beginPath();
            var angle = i * 2 * Math.PI / 20;
            var rx = cx + Math.cos(angle) * radius / 2;
            var ry = cy + Math.sin(angle) * radius / 2;
            tempContext.arc(x + rx + Math.random() * 5, y + ry + Math.random() * 5, radius / 4, 0, 360, false);
            tempContext.fill();
        }

        tempContext.beginPath();
        tempContext.arc(x, y, radius / 2, 0, 2 * Math.PI);
        tempContext.fill();

        var newTerrain = tempContext.getImageData(0, 0, WIDTH, HEIGHT);

        this.terrain = newTerrain;
    }
};

var destroy = { // b2Body destroyer
    setForDeletion: function (obj) {
        this.dieList.push(obj);
    },
    dieList: [],
    clearTheDead: function () {
        for (var b in destroy.dieList) { // delete set to die bodies
            world.DestroyBody(destroy.dieList[b]);
            destroy.dieList[b].SetUserData(null);
        }
        destroy.dieList.length = 0;
    }
};

var loop = {
    step: function () { // iterate da world
        world.Step(1 / 50, 10, 10);
        world.ClearForces();
    },
    update: function (dt) {
        canvas.height = canvas.height; // clear main canvas

        ground.draw(); // Draws the terrain

        for (var b = world.m_bodyList; b != null; b = b.m_next) { // draw  and process bodies
            if (b.GetUserData() != null) {
                if (ground.isColliding(Math.round(b.GetPosition().x * SCALE), Math.round(b.GetPosition().y * SCALE))) { // check for collision with ground
                    ground.hit(b.GetPosition().x, b.GetPosition().y, b.GetUserData().explode.radius, b.GetUserData().type);
                    tanks.playerTank.update();
                    destroy.setForDeletion(b);
                    b.GetUserData().explode.x = b.GetPosition().x;
                    b.GetUserData().explode.y = b.GetPosition().y;
                    explosion.set(b.GetUserData());
                }

                ctx.save();
                var gradientWeapon = ctx.createRadialGradient(b.GetPosition().x * SCALE, b.GetPosition().y * SCALE, 8, b.GetPosition().x * SCALE, b.GetPosition().y * SCALE, 31 + Math.random() * 5);
                gradientWeapon.addColorStop(0, 'rgba(255, 250, 200, .2)');
                gradientWeapon.addColorStop(.5, 'rgba(255, 210, 150, .01)');
                gradientWeapon.addColorStop(1, 'rgba(200, 200, 250, 0)');
                ctx.beginPath();
                ctx.arc(b.GetPosition().x * SCALE, b.GetPosition().y * SCALE, 32, 0, 2 * Math.PI, false);
                ctx.fillStyle = gradientWeapon;
                ctx.fill();
                ctx.restore();

                ctx.save();
                ctx.translate(b.GetPosition().x * SCALE, b.GetPosition().y * SCALE);
                ctx.rotate(b.GetAngle());
                ctx.drawImage(b.GetUserData().img, -b.GetUserData().img.width / 2, -b.GetUserData().img.height / 2); // draw projectile from userdata img pointer 
                ctx.restore();
            }
        }
        key.press(); // check keys

        // DRAWING 
        ui.draw.angleGuide(tanks.playerTank.x, tanks.playerTank.y, 90); // the angle guide
        ui.draw.Weapons(); // current weapon

        //tanks.playerTank.update(dt);
        tanks.playerTank.draw(tanks.playerTank.x, tanks.playerTank.y); // the player's tank

        for (var i = 0; i < explosion.list.length; i++) {
            if (explosion.list[i] != null) {
                var particle = explosion.list[i];
                particle.update(50);
                particle.draw();
                if (particle.scale == 0) {
                    explosion.list.splice(i, 1);
                }
            }
        }
    }
};

(function () {
    ctx.font = '50px Arial';
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillText('Loading...', 10, HEIGHT / 2);
}()) // Loading

var lastFrame = new Date().getTime();
init.defaultWalls();
ground.init();
init.defaultMisc();

init.start();