// this file is going to store all my stuff
// mostly because I HATE the super duper cluttered mess
// if I do it all in index.html

// also it looks cleaner and I wanna see how our fixed step
// thing works in this case

// helper function
// yeah "FUNCTION" i really only want the random bouncing
// for the ball bounce_paddle function
// this function will give you like a unit circle style
// x, y so you can multiply it by the ball's velocity
function get_random_bounce_velocities() {
    var random_float = Math.random(); // get a random float 0.0 - 1.0
    var random_radian = random_float * (Math.PI) - Math.PI / 2;
    return [Math.cos(random_radian), Math.sin(random_radian)];
}

// technically this one only works for the player_paddle, but
// by just negating the first index, we it works for the other one

// again, thank you mozilla aka firefox
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random




function PlayerPaddle(context, x, y, width, inital_height, speed) {
    this.context = context;
    this.x = x; // this is the left of the rect
    this.y = y; // this is the top of the rect

    // maybe the challenge is that the mouse controls where paddle moves,
    // velocity-wise, but not absolute-wise
    this.y_velocity = 0;
    this.paddle_speed = speed;

    // set width and height
    this.width = width;
    this.height = inital_height;

    // drawing stuff
    this.fill_color = "green";
    this.stroke_color = "black";
}

// just in case i need to get the values of like the rect ig
PlayerPaddle.prototype.get_x_bounds = function() {
    // [0] is lower bound, [1] is upper bound
    return [this.x, this.x + this.width];
}
PlayerPaddle.prototype.get_y_bounds = function() {
    // [0] is lower bound, [1] is upper bound
    return [this.y - this.height/2, this.y + this.height/2];
}

// take in mouse_y value and convert it to y_velocity onto the player paddle
PlayerPaddle.prototype.processInput = function(mouse_y) {
    
    var paddle_y_bounds = this.get_y_bounds();
    this.y_velocity = 0;
    // if mouse_y is higher than paddle
    if (paddle_y_bounds[0] > mouse_y) {
        this.y_velocity = 0-this.paddle_speed;
    }
    if (paddle_y_bounds[1] < mouse_y) {
        this.y_velocity = this.paddle_speed;
    }
    
}

// convert that y_velocity into movement logic for the paddle
PlayerPaddle.prototype.update = function(delta) {
    // we want mouse_y to be the middle of the rect, so
    this.y += this.y_velocity * delta;
}

// draw the paddle ig
PlayerPaddle.prototype.draw = function() {
    this.context.save(); // save canvas
    this.context.translate(this.x, this.y - this.height/2); // move 0,0, to where we want rect
    this.context.beginPath();
    this.context.rect(0, 0, this.width, this.height);
    this.context.fillStyle = this.fill_color;
    this.context.fill();
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.stroke_color;
    this.context.stroke();
    this.context.restore();
}

function Ball(context, x, y, speed, player_paddle) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.x_velocity = 0;
    this.y_velocity = 0;
    this.inital_speed = speed;
    this.speed = this.inital_speed;
    this.radius = 10;

    // checking if this is pass by reference or pass by value
    // it's pass by reference
    this.player_paddle = player_paddle;

    // something cool I want to try
    this.afterimages = 0;
    this.previous_positions = [];
}

// the ball will always shoot towards the opposition, it can be straight
Ball.prototype.start_ball = function(x_start, y_start) {
    this.x = x_start;
    this.y = y_start;
    this.y_velocity = 0;
    this.speed = this.inital_speed;
    this.x_velocity = this.speed;

    this.afterimages = 0;
    this.previous_positions = [];

}

Ball.prototype.update = function(delta, score) {

    // check score to see if we need to add more after-images
    // I UNDERSTAND THERE IS BETTER WAYS TO OPTIMIZE THIS
    // i don't really want to do it rn
    if (score > 30) {
        this.afterimages = 5;
    } else if (score > 25) {
        this.afterimages = 4;
    } else if (score > 20) {
        this.afterimages = 3;
    } else if (score > 15) {
        this.afterimages = 2;
    } else if (score > 10) {
        this.afterimages = 1;
    } else {
        this.afterimages = 0;
    }

    // we are only storing 5 of these
    if (this.afterimages == 0) {
        // don't do anything
    }
    else if (this.previous_positions.length < this.afterimages) {
        this.previous_positions.push([this.x, this.y]);
    } else if (this.previous_positions.length >= this.afterimages) {
        this.previous_positions.shift();
        this.previous_positions.push([this.x, this.y]);
    }

    this.x += this.x_velocity * delta;
    this.y += this.y_velocity * delta;

    if (this.y - this.radius < 0) {
        this.y_velocity = -this.y_velocity;
    }
    if (this.y + this.radius > 500) {
        this.y_velocity = -this.y_velocity;
    }

    // set whatever for bouncing off opp paddle
    // it doesn't really matter since we're faking that
    if (this.x + this.radius > 700) {
        var random_bounce_velocities = get_random_bounce_velocities();
        this.x_velocity = -random_bounce_velocities[0] * this.speed;
        this.y_velocity = random_bounce_velocities[1] * this.speed;
        this.speed += 0.02;
    }

    var player_paddle_x_bounds = this.player_paddle.get_x_bounds();
    // if ball.x is in player paddle x bounds
    if (player_paddle_x_bounds[0] < this.x && this.x < player_paddle_x_bounds[1]) {
        // if ball.y is in player paddle y bounds
        var player_paddle_y_bounds = this.player_paddle.get_y_bounds();
        if (player_paddle_y_bounds[0] < this.y && this.y < player_paddle_y_bounds[1]) {
            var random_bounce_velocities = get_random_bounce_velocities();
            this.x_velocity = random_bounce_velocities[0] * this.speed;
            this.y_velocity = random_bounce_velocities[1] * this.speed;
            this.speed += 0.02;
        }
    }
}

Ball.prototype.draw = function() {
    this.context.save();
    this.context.beginPath();
    this.context.translate(this.x, this.y);
    this.context.arc(0, 0, this.radius, 0, 2*Math.PI, false);
    // bit with color
    this.context.fillStyle = "red";
    this.context.fill();
    this.context.lineWidth = 1;
    this.context.strokeStyle = "black";
    this.context.stroke();
    this.context.restore();

    // thanks again mozilla for these docs about this arrow func
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    this.previous_positions.forEach((item, index) => {
        this.drawAfterImage(item, index);
    });

}

Ball.prototype.drawAfterImage = function(xy_list, index) {
    console.log(index);
    this.context.save();
    this.context.beginPath();
    this.context.translate(xy_list[0], xy_list[1]);
    this.context.arc(0, 0, this.radius, 0, 2*Math.PI, false);
    // bit with color changing
    this.context.fillStyle = `rgb(${255 - (index+1)*40}, 0, 0)`;
    this.context.fill();
    this.context.lineWidth = 1;
    this.context.strokeStyle = "black";
    this.context.stroke();
    this.context.restore();
}

function OtherPaddle(context, x, y, width, height, ball) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // store ball position stuff here
    this.ball = ball;
    this.fill_color = "blue";
}

OtherPaddle.prototype.update = function() {
    this.y = this.ball.y;
}

OtherPaddle.prototype.draw = function() {
    this.context.save(); // save canvas
    this.context.translate(this.x, this.y - this.height/2); // move 0,0, to where we want rect
    this.context.beginPath();
    this.context.rect(0, 0, this.width, this.height);
    this.context.fillStyle = this.fill_color;
    this.context.fill();
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.stroke_color;
    this.context.stroke();
    this.context.restore();
}

