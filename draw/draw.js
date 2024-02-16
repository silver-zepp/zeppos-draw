/** @about Draw 1.0.0 @min_zeppos 2.0 @author: Silver, Zepp Health. @license: MIT */
import { getDeviceInfo } from "@zos/device";
export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();
import hmUI, { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { px } from "@zos/utils";

/**
 * Base for the Draw library.
 */
class DrawBase {
  #properties = {};

  default(x, y, width, height) {
    this.#properties.x = px(x);
    this.#properties.y = px(y);
    this.#properties.w = px(width);
    this.#properties.h = px(height);

    return this.#properties;
  }

  createWidget(type, properties) {
    let widget;
    if (properties.group) {
      widget = properties.group.createWidget(type, properties);
    } else {
      widget = createWidget(type, properties);
    }
    return widget;
  }
}

/**
 * Draw library.
 */
export class Draw extends DrawBase {
  #color = 0xfc6950; // orange
  #text_color = 0xffffff; // white
  #text_size = DEVICE_WIDTH / 16; // 30px @480
  #line_width = 4;
  #radius = 40;

  /**
   * Draws a line between two points.
   * @param {Object} point_a - The starting point of the line (Vector2 x, y).
   * @param {Object} point_b - The ending point of the line (Vector2 x, y).
   * @param {Object} [options={}] - Optional parameters for the line. This includes 'line_fix', a boolean that when set to true, applies a correction factor for lines drawn from left to bottom-right and right to bottom-left, as well as horizontal lines that are less than or greater than 25 degrees.
   * @example
   * // example: draw a line from (10, 20) to (30, 40)
   * .line({x: 10, y: 20}, {x: 30, y: 40});
   * @returns {Object} The created line widget.
   */
  line(point_a, point_b, options = {}) {
    options = { width: this.#line_width, color: this.#color, ...options };

    // difference
    const dx = point_b.x - point_a.x;
    const dy = point_b.y - point_a.y;

    // get the hypotenuse measuting both legs dist
    let length = Math.sqrt(dx * dx + dy * dy);

    // rads
    const angle = Math.atan2(dy, dx);

    // rads -> deg + normalize
    let deg = Math.round((angle * 180) / Math.PI);
    deg = (deg + 360) % 360;

    let is_diagonal = false;
    if (deg % 90 !== 0) is_diagonal = true; // fix: diagonal incorrect pos

    /** BUGFIX START
     * FILL_RECT bug, correction factor for lines left -> bot-right and right -> bot-left, + horizontal
     * that are also < or > than 25 degrees */
    if (options.line_fix) {
      let correction_factor = 1;
      let correction_angle = 25;
      let shift = 0;
      if (
        (dx > 0 && dy > 0 && Math.abs(deg) <= correction_angle) ||
        (dx < 0 && dy > 0 && Math.abs(deg - 180) <= correction_angle)
      ) {
        correction_factor = 1.2;
        let corrected_length = length * correction_factor;
        length *= correction_factor;
        shift = (corrected_length - length) / 2 + 0.2 * length; // calculate shift for starting position

        if (Math.abs(deg) >= correction_angle) shift *= -1; // reverse the line that is drawn backwards
      }

      point_a.x += shift * Math.cos(angle);
      point_a.y += shift * Math.sin(angle);
    }
    /** BUGFIX END */

    if (dx < 0 && dy > 0) deg = 360 + deg; // fix: top-right to bottom-left
    if (dx < 0) deg += 180; // fix: from right to left
    if (dy < 0) deg += 180; // fix: from bottom to top

    // calc line's center point
    const center_x = (point_a.x + point_b.x) / 2;
    const center_y = (point_a.y + point_b.y) / 2;

    let x, y;

    if (dx < 0 && dy < 0) {
      // fix: bottom-right to top-left
      x = center_x + (length / 2) * Math.cos(angle);
      y = center_y + (length / 2) * Math.sin(angle);
      deg += 180; // mirror
    } else if (dx > 0 && dy < 0) {
      // fix: top-right to bottom-left
      x = center_x - (length / 2) * Math.cos(angle);
      y = center_y + (length / 2) * Math.sin(angle);
      deg += 180;
    } else if (dx < 0 && dy > 0) {
      // fix: bottom-left to top-right
      x = center_x + (length / 2) * Math.cos(angle);
      y = center_y - (length / 2) * Math.sin(angle);
      deg += 180;
    } else if (is_diagonal) {
      // shift pos based on the angle
      x = center_x - (length / 2) * Math.cos(angle);
      y = center_y - (length / 2) * Math.sin(angle);
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        // is_horizontal
        x = center_x - length / 2;
        y = center_y - options.width / 2;
      } else {
        // is_vertical
        x = center_x - options.width / 2;
        y = center_y - length / 2;
      }
    }

    const widget_options = {
      ...options,
      ...this.default(x, y, length, options.width),
      radius: 0,
      angle: deg,
    };
    const line_widget = this.createWidget(widget.FILL_RECT, widget_options);

    return line_widget;
  }

  /**
   * Draws a circle at a specified location.
   * @param {number} center_x - The x-coordinate of the circle's center.
   * @param {number} center_y - The y-coordinate of the circle's center.
   * @param {Object} [options={}] - Optional parameters for the circle.
   * @example
   * // example: draw a circle at (50, 50)
   * .circle(50, 50);
   * @returns {Object} The created circle widget.
   */
  circle(center_x, center_y, options = {}) {
    options = { color: this.#color, radius: this.#radius, ...options };
    const circle = this.createWidget(widget.CIRCLE, {
      center_x: center_x,
      center_y: center_y,
      ...this.default(
        center_x - options.radius,
        center_y - options.radius,
        options.radius * 2,
        options.radius * 2
      ),
      ...options,
    });

    return circle;
  }

  /**
   * Displays text at a specified location.
   * @param {string} text - The text to display.
   * @param {Object} [options={}] - Optional parameters for the text.
   * @example
   * // example: display 'Hello, world!' at the center of the screen
   * .text('Hello, world!');
   * @returns {Object} The created text widget.
   */
  text(text, options = {}) {
    options = {
      x: DEVICE_WIDTH / 2,
      y: DEVICE_HEIGHT / 2,
      w: DEVICE_WIDTH / 2,
      h: DEVICE_HEIGHT / 4,
      color: this.#text_color,
      text_size: this.#text_size,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      ...options,
    };

    const text_widget = this.createWidget(widget.TEXT, {
      text: text,
      ...this.default(options.x, options.y, options.w, options.h),
      ...options,
    });

    return text_widget;
  }

  /**
   * Draws a polyline through a series of points.
   * @param {Array} points - An array of points through which the polyline should pass. Each point is an object with 'x' and 'y' properties.
   * @param {Object} [options={}] - Optional parameters for the polyline. This includes 'width' for the line width, 'color' for the line color, etc, and 'x' and 'y' for the position of the polyline.
   * @example
   * // example: draw a polyline through three points
   * .polyline([{x: 10, y: 20}, {x: 30, y: 40}, {x: 50, y: 60}]);
   * @returns {Object} The created group widget that contains all the lines in the polyline.
   */
  polyline(points, options = {}) {
    options = { width: this.#line_width, color: this.#text_color, ...options };
    const polyline = createWidget(widget.GRADKIENT_POLYLINE, {
      x: px(options.x) || px(0),
      y: px(options.y) || px(DEVICE_HEIGHT / 2),
      w: px(options.w) || px(DEVICE_WIDTH),
      h: px(options.h) || px(DEVICE_HEIGHT),
      line_color: options.color || AutoGUI.GetColor(),
      line_width: options.line_width || this.#line_width,
      ...options,
    });
    polyline.clear();
    polyline.addLine({
      data: points,
      count: points.length,
    });
    return polyline;
  }
}

/** HELPERS */

/**
 * Multiplies/Divides each component (red, green, blue) of a hexadecimal color by a multiplier.
 * @param {number} hex_color - The hexadecimal color to multiply.
 * @param {number} multiplier - The multiplier/divider. [example 1]: 1.3 = +30% [example 2]: 0.7 = -30%.
 * @return {string} The resulting hexadecimal color after multiplication.
 */
export function multiplyHexColor(hex_color, multiplier) {
  hex_color = Math.floor(hex_color).toString(16).padStart(6, "0"); // @fix 1.0.6

  let r = parseInt(hex_color.substring(0, 2), 16);
  let g = parseInt(hex_color.substring(2, 4), 16);
  let b = parseInt(hex_color.substring(4, 6), 16);

  r = Math.min(Math.round(r * multiplier), 255);
  g = Math.min(Math.round(g * multiplier), 255);
  b = Math.min(Math.round(b * multiplier), 255);

  const result =
    "0x" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  return result;
}

export default Draw;

/**
 * @changelog
 * 1.0.0
 * - initial release
 */
