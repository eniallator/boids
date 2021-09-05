const BOID_IMAGE = document.querySelector("img#boid");

class Boid {
  static nextId = 0;

  constructor(x, y, directionAngle) {
    this.pos = new Vector(x, y);
    this.dirNorm = Vector.ONE.copy().setAngle(directionAngle);

    this.id = Boid.nextId++;
  }

  static newRandom() {
    return new Boid(Math.random(), Math.random(), Math.random() * 2 * Math.PI);
  }

  #getBoundaryAccelerationVec(wallDetectRadius) {
    const accelerationVec = Vector.ZERO.copy();

    if (this.pos.y < wallDetectRadius && this.dirNorm.dot(Vector.UP) > 0) {
      accelerationVec.add(
        Vector.DOWN.copy().multiply(
          Math.min(1, 1 - this.dirNorm.y / wallDetectRadius)
        )
      );
    }
    if (this.pos.x < wallDetectRadius && this.dirNorm.dot(Vector.LEFT) > 0) {
      accelerationVec.add(
        Vector.RIGHT.copy().multiply(
          Math.min(1, 1 - this.dirNorm.x / wallDetectRadius)
        )
      );
    }
    if (
      1 - this.pos.y < wallDetectRadius &&
      this.dirNorm.dot(Vector.DOWN) > 0
    ) {
      accelerationVec.add(
        Vector.UP.copy().multiply(
          Math.min(1, (1 - this.dirNorm.y) / wallDetectRadius)
        )
      );
    }
    if (
      1 - this.pos.x < wallDetectRadius &&
      this.dirNorm.dot(Vector.RIGHT) > 0
    ) {
      accelerationVec.add(
        Vector.LEFT.copy().multiply(
          Math.min(1, (1 - this.dirNorm.x) / wallDetectRadius)
        )
      );
    }

    return accelerationVec;
  }

  update(
    dt,
    boids,
    speed,
    wallDetectRadius,
    otherDetectRadius,
    separation,
    alignment,
    cohesion,
    aspectRatio = 1
  ) {
    const accelerationVec = this.#getBoundaryAccelerationVec(wallDetectRadius);

    const otherDetectRadiusSqr = otherDetectRadius * otherDetectRadius;
    const boidsInRange = boids.filter(
      (other) =>
        other.id !== this.id &&
        this.pos.copy().sub(other.pos).getSquaredMagnitude() <=
          otherDetectRadiusSqr,
      this
    );
    if (boidsInRange.length > 0) {
      const centerOfMass = Vector.ZERO.copy();
      const otherBoidsDirection = Vector.ZERO.copy();
      const closeMasses = Vector.ZERO.copy();
      for (let other of boidsInRange) {
        centerOfMass.add(other.pos);
        otherBoidsDirection.add(other.dirNorm);
        const posDiff = other.pos.copy().sub(this.pos);
        closeMasses.add(
          posDiff.setMagnitude(otherDetectRadius - posDiff.getMagnitude())
        );
      }
      centerOfMass.divide(boidsInRange.length);

      accelerationVec.add(centerOfMass.sub(this.pos).multiply(cohesion));
      accelerationVec.add(otherBoidsDirection.normalise().multiply(alignment));
      accelerationVec.add(
        closeMasses.multiply(-1).normalise().multiply(separation)
      );
    }

    this.dirNorm.add(accelerationVec).normalise();
    this.pos.add(
      this.dirNorm
        .copy()
        .multiply(dt * speed)
        .multiply(new Vector(1, aspectRatio).normalise())
    );
  }

  draw(ctx, width, height) {
    const imgHeight = 30;
    const imgWidth = (BOID_IMAGE.width / BOID_IMAGE.height) * imgHeight;
    // ctx.fillRect(this.pos.x * width - 5, this.pos.y * height - 5, 10, 10);
    const direction = this.dirNorm.getAngle() + Math.PI / 2;
    ctx.translate(this.pos.x * width, this.pos.y * height);
    ctx.rotate(direction);
    ctx.drawImage(
      BOID_IMAGE,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    ctx.rotate(-direction);
    ctx.translate(-this.pos.x * width, -this.pos.y * height);
  }
}
