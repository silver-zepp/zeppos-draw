import hmUI, { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { event } from '@zos/ui'
import { setScrollLock } from '@zos/page'
import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { COLOR_BLACK, COLOR_BLUE, COLOR_GRAY, COLOR_GREEN, COLOR_INDIGO, COLOR_ORANGE, COLOR_RED, COLOR_VIOLET, COLOR_WHITE, COLOR_YELLOW } from '../include/constants';

import { getDeviceInfo } from "@zos/device";
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

import VisLog from '../include/libs/vis-log';
const vis = new VisLog("index");

import { Draw, multiplyHexColor } from '../../draw/draw';
const draw = new Draw();

const LOG_ENABLED = false;

/**
 * 1 : Draw Lines From All Sides  : example_DrawLinesFromAllSides
 * 2 : Draw Envelope              : example_DrawEnvelope
 * 3 : Draw Wave                  : example_DrawWave
 * 4 : Draw Star                  : example_DrawStar
 * 5 : Draw Polyline              : example_DrawPolyline
 * 6 : Draw Map                   : example_DrawMap            */
const SELECTED_EXAMPLE = 6;



//** ======== Virtual Canvas Setup (for the Draw Map example)  ======== */
// -----------------------------------------------------------------------

// the group that will contain all the widgets
const group = createWidget(widget.GROUP);      

// scrollable canvas
const canvas = createWidget(widget.STROKE_RECT, {
  x: 0,
  y: 0,
  w: DEVICE_WIDTH,
  h: DEVICE_HEIGHT,
  color: COLOR_BLACK,
})

let last_pos = { x: 0, y: 0 };
let touch_start_pos = null;
const speed_factor = 1.0;           // change this to control swipe speed
const threshold = 2;                // swipe sensitivity (avoid drifting)

canvas.addEventListener(event.CLICK_DOWN, function (info) {
  // store the initial touch position
  touch_start_pos = { x: info.x, y: info.y };
})

canvas.addEventListener(event.MOVE, function (info) {
  if (touch_start_pos) {
    // calculate the difference between the current touch position and the initial touch position
    let delta = {
      x: (info.x - touch_start_pos.x) * speed_factor,
      y: (info.y - touch_start_pos.y) * speed_factor,
    };

    // only update the map's position if the touch position has significantly changed (drifting avoidance)
    if (Math.abs(delta.x) > threshold || Math.abs(delta.y) > threshold) {
      // calculate the new map position based on this difference
      let map_new_pos = {
        x: last_pos.x + delta.x,
        y: last_pos.y + delta.y
      };

      // update the group's position
      group.setProperty(prop.MORE, map_new_pos);

      if (LOG_ENABLED) {
        vis.log(`x: ${ last_pos.x } -> ${ map_new_pos.x }`);
        vis.log(`y: ${ last_pos.y } -> ${ map_new_pos.y }`);
      }
      
      // store the new position for the next frame
      last_pos = map_new_pos;
    }
  }

  // update the initial touch position for the next frame
  touch_start_pos = { x: info.x, y: info.y };
});
// --------------------------------


/** ============== EXAMPLES ============== */

class DrawExample {
  init(){
		this.drawGUI();
  }

	drawGUI(){
    this.loadExample(SELECTED_EXAMPLE);
  }

  // Example #1: Draw Lines From All Sides
  example_DrawLinesFromAllSides(){
    const color_dimmer_green = multiplyHexColor(COLOR_GREEN, 0.5);
    draw.line({x: 50, y: 250}, {x: 450, y: 250}, { color: color_dimmer_green }); // H line from left to right
    draw.line({x: 250, y: 50}, {x: 250, y: 450}, { color: color_dimmer_green }); // V line from top to bottom
    draw.line({x: 50, y: 50}, {x: 450, y: 450}, { color: color_dimmer_green });  // \ line from top-left to bottom-right
    draw.line({x: 450, y: 50}, {x: 50, y: 450}, { color: color_dimmer_green });  // / line from top-right to bottom-left

    // mirrored math
    draw.line({x: 367, y: 250}, {x: 133, y: 250}, { color: COLOR_GREEN });   // H line from right to left
    draw.line({x: 250, y: 367}, {x: 250, y: 133}, { color: COLOR_GREEN });  // V line from bottom to top
    draw.line({x: 133, y: 367}, {x: 367, y: 133}, { color: COLOR_GREEN });   // / line from bottom-left to top-right
    draw.line({x: 367, y: 367}, {x: 133, y: 133}, { color: COLOR_GREEN });   // \ line from bottom-right to top-left
  }

  // Example #2: Draw Envelope
  example_DrawEnvelope() {
    // draw the square
    let point_a = { x: 140, y: 140 };
    let point_b = { x: 340, y: 140 };
    let point_c = { x: 340, y: 340 };
    let point_d = { x: 140, y: 340 };
    
    draw.line(point_a, point_b, { color: COLOR_WHITE });
    draw.line(point_b, point_c, { color: COLOR_WHITE });
    draw.line(point_c, point_d, { color: COLOR_WHITE });
    draw.line(point_d, point_a, { color: COLOR_WHITE });

    // draw the top triangle
    let point_e = { x: 240, y: 240 };
    let point_f = { x: 140, y: 140 };
    let point_g = { x: 340, y: 140 };
    
    draw.line(point_e, point_f, { color: COLOR_WHITE });
    draw.line(point_e, point_g, { color: COLOR_WHITE });

    // draw the bottom triangle using a slightly dimmer color
    let point_h = { x: 240, y: 240 };
    let point_i = { x: 140, y: 340 };
    let point_j = { x: 340, y: 340 };
    
    const color_dimmer_white = multiplyHexColor(COLOR_WHITE, 0.3);
    draw.line(point_h, point_i, { color: color_dimmer_white });
    draw.line(point_h, point_j, { color: color_dimmer_white });
  }

  // Example #3: Draw Wave
  example_DrawWave() {
    // map
    const points_arr = [
      {x: 0, y: 240},
      {x: 80, y: 120},
      {x: 160, y: 360},
      {x: 240, y: 120},
      {x: 320, y: 360},
      {x: 400, y: 120},
      {x: 480, y: 240}
    ];
  
    // draw the circles and lines
    for (let i = 0; i < points_arr.length; i++) {
        if (i < points_arr.length - 1) {
          draw.line(points_arr[i], points_arr[i + 1], { width: 10, color: multiplyHexColor(COLOR_GREEN, 0.5) });
        }

        // small shift in pixels to better position the cirles
        const right_shift = 2;

        // make sure circles are drawn on top of the lines
        draw.circle(points_arr[i].x + right_shift, points_arr[i].y, { radius: 20, color: multiplyHexColor(COLOR_GREEN, 1.5) });
    }
  }

  // Example #4: Draw Star
  example_DrawStar(){
    let center = { x: 240, y: 240 };
    let radius = 120;
    let points = 5;

    const angle_step = (Math.PI * 2) / points;

    for (let i = 0; i < points; i++) {
      let angle = angle_step * i;
      let outer_point = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };

      let next_angle = angle_step * ((i + 2) % points);
      let inner_point = {
        x: center.x + radius * Math.cos(next_angle),
        y: center.y + radius * Math.sin(next_angle)
      };

      draw.line(outer_point, inner_point, { line_fix: true, color: COLOR_BLUE });
    }
  }

  // Example #5: Draw Polyline
  example_DrawPolyline(){
    const polypoints_arr = [
      { x: 0, y: 200 },
      { x: 100, y: 10 },
      { x: 200, y: 50 },
      { x: 300, y: 50 },
      { x: 400, y: 200 }
    ];
    const params = { color: 0x00ffff, width: 4, y: 160, x: 40 }

    const poly = draw.polyline(polypoints_arr, params);
    // poly.addLine({ // to add additional lines
    //   data: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
    //   count: 2
    // });
    // poly.clear(); // to clear the whole widget
  }

  // Example #6: Draw Map
  example_DrawMap(){
    const center = 240;
    const map_size = 2048;
  
    // define the number of points and the amplitude of the wave
    const num_points = Math.floor(map_size / 100);
    const amplitude = 100;
  
    // calculate the distance between points
    const dx = map_size / (num_points - 1);
  
    // create an array to store the points for each direction
    let points_arr = [[], [], [], []];
  
    // generate the points in a wave pattern for each direction
    for (let i = -num_points / 2; i <= num_points / 2; i++) {
      const x = center + i * dx;
      const y = center + amplitude * Math.sin(2 * Math.PI * i / num_points);
      
      // ensure there's at least 100px between each point
      if (i % Math.round(100 / dx) === 0) {
        points_arr[0].push({x: x, y: y}); // right
        points_arr[1].push({x: y, y: x}); // down
        points_arr[2].push({x: -x, y: -y}); // left
        points_arr[3].push({x: -y, y: -x}); // up
      }
    }
  
    // connect the points with lines to form the subway-like routes in each direction
    for (let j = 0; j < points_arr.length; j++) {
      for (let i = 0; i < points_arr[j].length - 1; i++) {
        draw.line(points_arr[j][i], points_arr[j][i + 1], { width: 10, color: multiplyHexColor(COLOR_GREEN, 0.7), group: group });
      }
    }
  
    // draw a circle at each point and add street names every 10 intersections
    for (let j = 0; j < points_arr.length; j++) {
      for (let i = 0; i < points_arr[j].length; i++) {
        draw.circle(points_arr[j][i].x, points_arr[j][i].y, { radius: 20, color: multiplyHexColor(COLOR_GREEN, 1.5), group: group });
  
        if (i % 10 === 0) {
          let street_name = "Street " + (i / 10);
          draw.text(street_name, { x: points_arr[j][i].x, y: points_arr[j][i].y, group: group });
        }
      }
    }
  }

  loadExample(id) {
    switch(id) {
      case 1: this.example_DrawLinesFromAllSides(); break;
      case 2: this.example_DrawEnvelope(); break;
      case 3: this.example_DrawWave(); break;
      case 4: this.example_DrawStar(); break;
      case 5: this.example_DrawPolyline(); break;
      case 6: this.example_DrawMap(); break;
      default: vis.log("Invalid example number!");
    }
  }

  destroy(){ }
}

/** ============== PAGE ============== */

Page({
  onInit() {
    this.drawExample = new DrawExample();
    this.drawExample.init();

    if (LOG_ENABLED) vis.updateSettings({ line_count: 2 });
  },
  onDestroy() {
    this.drawExample.destroy();
  }
})



/** ============== HELPERS ============== */

/** DISABLE SCROLL */
setScrollLock({ lock: true })

/** IGNORE EXIT (->) SWIPE */
onGesture({
  callback: (event) => {
    // if (event === GESTURE_RIGHT) { } // do something on right swipe
    return true
  },
})