var Color = require('color');

var conf = {
        PADDING           : 0,
        LABELS_PADDING    : 50,
        REAL_SIZE         : [ 500, 500 ],
        POINT_SIZE        : 4,
        INNER_RADIUS      : 10,
        INNER_PADDING     : 5,
        FONT_SIZE         : 18,
        SHINE_OPACITY     : 0.15,
        LABEL_FONT        : '"Museo Sans"',
        SHAPE_STROKE_SIZE : 0,
        OPACITY           : {
            SHAPE_FILL   : 0.7,
            SHAPE_STROKE : 0.8,
        },
        LABELS            : [
            'Analysis',
            'Architecture',
            'Operations',
            'Back-End',
            'Front-End',
            'UI/UX',
            'Testing',
            'Code review',
            'Documentation',
            'Data science',
            'Analysis'
        ]
    },
    colors = {
        LABEL      : '#999999',
        BG         : '#f5f5f5',
        BG_ALT     : '#ffffff',
        AXIS       : 'rgba(0, 0, 0, .1)',
        CENTER_DOT : '#e77249',
        SHAPE      : [
            '#e97e50',
            '#3789bb'
        ]
    };

/**
 * Renders a shape representing sets of values on given context
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {[Array]} sets
 */
module.exports = function (ctx, size, center, sets, showLabels) {
    var stageSize = size,
        minSide = Math.min.apply(this, stageSize),
        padding = scaled(conf.PADDING),
        labelsPadding = showLabels ? scaled(conf.LABELS_PADDING) : 0,
        outerRadius = minSide / 2 - padding - labelsPadding,
        innerRadius = scaled(conf.INNER_RADIUS),
        pointsCount = Math.max.apply(Math, sets.map(function (set) { return set.length; })),
        i, color;

    draw();

    /**
     * Draw function - defines order in which drawing is executed
     *
     * @return void
     */
    function draw() {
        drawRange(5);   // Draw background rings
        drawAxis();     // Draw axis for each value

        // Draw shape for first set with no transparency, and center on top
        drawShape(sets[0], colors.SHAPE[0], true);

        if (showLabels) {
            drawLabels();
        }

        // Draw shapes for remaining sets, with transparency
        for (i = 1; i < sets.length; i += 1) {
            color = colors.SHAPE[i % colors.SHAPE.length];
            drawShape(sets[i], color, i === 0);
        }

        drawSectors(sets[0].length);
        drawShine();
    }

    /**
     * Get a size value scaled to current image size
     *
     * @param {Number} val
     * @return {Number}
     */
    function scaled(val) {
        var realMinSide = Math.min.apply(this, conf.REAL_SIZE);

        return (val * minSide) / realMinSide;
    }

    /**
     * Draw labels
     *
     * @return void
     */
    function drawLabels() {
        ctx.font = scaled(conf.FONT_SIZE) + 'px ' + conf.LABEL_FONT;
        ctx.fillStyle = colors.LABEL;

        for (var i = 0; i < pointsCount; i ++) {
            drawLabel(i);
        }
    }

    /**
     * Draw label for given index
     *
     * @param {Number} index
     * @return void
     */
    function drawLabel(index) {
        var deg = 180 - 360 / pointsCount * index,
            rad = degtorad(deg),
            origin = [
                center[0] + Math.sin(rad) * (outerRadius + labelsPadding / 2),
                center[1] + Math.cos(rad) * (outerRadius + labelsPadding / 2),
            ],
            label = conf.LABELS[index % conf.LABELS.length];

        if (deg > 90 || deg < -90) {
            rad = degtorad(deg += 180);
        }

         ctx.save();
         ctx.translate(origin[0], origin[1]);
         ctx.rotate(-rad);
         ctx.textAlign = 'center';
         ctx.fillText(label, 0, scaled(conf.FONT_SIZE) / 2);
         ctx.restore();
    }

    /**
     * Draw all axis (Number depending on amount of values in first value set)
     */
    function drawAxis() {
        var i, angle, start;

        for (i = 0; i < pointsCount; i++) {
            angle = degtorad(180 - 360 / pointsCount * i);
            ctx.beginPath();

            start = [
                center[0] + Math.sin(angle) * outerRadius,
                center[1] + Math.cos(angle) * outerRadius,
                ];

            ctx.moveTo(start[0], start[1]);
            ctx.lineTo(center[0], center[1]);

            ctx.strokeStyle = colors.AXIS;
            ctx.lineWidth = scaled(1);
            ctx.closePath();
            ctx.stroke();
        }
    }

    /**
     * Draw a circle
     *
     * @param {[Number]} center (Duple containing X and Y)
     * @param {Number} radius
     * @param {String} color
     */
    function drawCircle(center, radius, color) {
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
    }

    /**
     * Draw the background split using circles to visualise the log scale
     *
     * @param {Number} split (Number of circles to draw)
     */
    function drawRange(split) {
        var i, radius, isEven;

        for (i = split; i > 0; i--) {
            radius = logScale((outerRadius - innerRadius) / split * i, outerRadius - innerRadius) + innerRadius;
            isEven = i % 2 === 0;
            drawCircle(center, radius, isEven ? colors.BG_ALT : colors.BG);
        }
    }

    /**
     * Draw a shape given its value set
     *
     * @param {[Number]} values
     * @param {String} color
     * @param {Boolean} opaque
     */
    function drawShape(values, color, opaque) {
        var started = false,
            clearFill = opaque ? 0 : 1 - conf.OPACITY.SHAPE_FILL,
            clearStroke = opaque ? 0 : 1 - conf.OPACITY.SHAPE_STROKE,
            angle, i;

        ctx.beginPath();

        for (i = 0; i < values.length; i++) {
            angle = degtorad(180 - 360 / values.length * i);

            var length = logScale((values[i] * (outerRadius - innerRadius)) / 100, outerRadius - innerRadius) + innerRadius,
                point = [
                    center[0] + Math.sin(angle) * length,
                    center[1] + Math.cos(angle) * length,
                ];

            if (!started) {
                ctx.moveTo(point[0], point[1]);
                started = true;
            } else {
                ctx.lineTo(point[0], point[1]);
            }
        }

        ctx.fillStyle = new Color(color).clearer(clearFill).rgbString();
        ctx.strokeStyle = new Color(color).clearer(clearStroke).darken(0.1).rgbString();
        ctx.lineWidth = scaled(conf.SHAPE_STROKE_SIZE);
        ctx.closePath();
        ctx.fill();

        if (conf.SHAPE_STROKE_SIZE) {
            ctx.stroke();
        }
    }

    /**
     * Draw alternate sectors over shape for decoration and readability
     *
     * @param {Number} count
     */
    function drawSectors(count) {
        var spread = 360 / count,
            gradient = ctx.createRadialGradient(center[0], center[1], outerRadius, center[0], center[1]),
            i, deg, rad;

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, ' + conf.SHINE_OPACITY + ')');

        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;

        for (i = 0; i < count; i += 2) {
            deg = { start: spread * i - 90, end: spread * (i + 1) - 90 };
            rad = { start: degtorad(deg.start), end: degtorad(deg.end) };

            ctx.beginPath();
            ctx.arc(center[0], center[1], outerRadius, rad.start, rad.end);
            ctx.lineTo(center[0], center[1]);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Draw shine gradient over shape for decoration
     *
     * @param {Number} count
     */
    function drawShine() {
        var gradient = ctx.createRadialGradient(center[0], center[1], outerRadius, center[0], center[1]);

        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.9, 'rgba(255, 255, 255, ' + conf.SHINE_OPACITY * 2 + ')');

        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(center[0], center[1], outerRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
    }
};

/**
 * Apply log scale to a value
 *
 * @param {Number} val
 * @param {Number} max
 * @return {Number}
 */
function logScale(val, max) {
    return val < 1 ? 0 : Math.log(val) / Math.log(max) * max;
}

/**
 * Convert degrees into radians
 *
 * @param {Number} degrees
 * @return {Number}
 */
function degtorad(degrees) {
    return degrees * Math.PI / 180;
}