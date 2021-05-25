'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.applyTickOfGravity =
  exports.isAt =
  exports.addPreviousLocation =
    void 0
const dist_1 = __importDefault(
  require('../../../../../../common/dist'),
)
const Ship_1 = require('../Ship')
function addPreviousLocation(locationBeforeThisTick) {
  const lastPrevLoc =
    this.previousLocations[
      this.previousLocations.length - 1
    ]
  const newAngle = dist_1.default.angleFromAToB(
    this.location,
    locationBeforeThisTick,
  )
  if (
    !lastPrevLoc ||
    (Math.abs(newAngle - this.lastMoveAngle) > 8 &&
      dist_1.default.distance(this.location, lastPrevLoc) >
        0.001)
  ) {
    this.previousLocations.push(locationBeforeThisTick)
    while (
      this.previousLocations.length >
      Ship_1.Ship.maxPreviousLocations
    )
      this.previousLocations.shift()
    this.toUpdate.previousLocations = this.previousLocations
  }
  this.lastMoveAngle = newAngle
}
exports.addPreviousLocation = addPreviousLocation
function isAt(coords) {
  return (
    Math.abs(coords[0] - this.location[0]) <
      dist_1.default.ARRIVAL_THRESHOLD &&
    Math.abs(coords[1] - this.location[1]) <
      dist_1.default.ARRIVAL_THRESHOLD
  )
}
exports.isAt = isAt
function applyTickOfGravity() {
  // if (!this.canMove) return
  // todo
}
exports.applyTickOfGravity = applyTickOfGravity
//# sourceMappingURL=motion.js.map
