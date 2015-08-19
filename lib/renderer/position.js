var Canvas = require('canvas'),
    shapeRenderer = require('./shape'),
    drawUtil = require('../util/draw');

var conf = {
        REAL_WIDTH   : 800,
        PADDING      : 20,
        LOGO_SIZE    : 200,
        V_SPACING    : 10,
        BASE_FONT    : '"Museo Sans"',
        SHAPE_MARGIN : 200,
        TAG_PADDING  : 15,
        TAG_SPACING  : 10,
        TAG_HEIGHT   : 50
    },
    colors = {
        BG    : '#ffffff',
        NAME  : '#666666',
        TITLE : '#e77249',
        TAG   : '#ffffff',
        SKILL : '#ee815b'
    };

/**
 * Renders a position image
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 */
module.exports = function (ctx, size, options) {
    var organisation = options.organisation,
        position = options.position,
        currentY = scaled(conf.PADDING);

    draw();

    /**
     * Draw function - defines order in which drawing is executed
     *
     * @return void
     */
    function draw() {
        setup();
        drawBackground();
        drawLogo();
        drawName();
        drawTitle();
        drawShape();
        drawTags();
    }

    /**
     * Setup context
     *
     * @return void
     */
    function setup() {
        ctx.filter = 'bilinear';
        ctx.imageSmoothingEnabled = true;
        ctx.antialias = 'gray';
        ctx.textBaseline = 'middle';
    }

    /**
     * Draw background
     *
     * @return void
     */
    function drawBackground() {
        ctx.fillStyle = colors.BG;
        ctx.fillRect(0, 0, size[0], size[1]);
    }

    /**
     * Draw organisation logo
     *
     * @return void
     */
    function drawLogo() {
        var logo = new Canvas.Image(),
            logoSize = scaled(conf.LOGO_SIZE);

        logo.src = new Buffer(organisation.logo, 'binary');

        ctx.save();     
        ctx.beginPath();

        ctx.arc(
            size[0] / 2,                // Offset X
            logoSize / 2 + currentY,    // Offset Y
            logoSize / 2,               // Radius
            0,                          // Angle 1
            Math.PI * 2,                // Angle 2
            false                       // Close
            );

        ctx.clip();
        ctx.drawImage(logo, size[0] / 2 - logoSize / 2, currentY, logoSize, logoSize);
        ctx.restore();

        currentY += logoSize + scaled(conf.V_SPACING) * 2;
    }

    /**
     * Draw organisation name
     *
     * @return void
     */
    function drawName() {
        var fontSize = scaled(50);

        ctx.font = fontSize + 'px ' + conf.BASE_FONT;
        ctx.fillStyle = colors.NAME;
        ctx.textAlign = 'center';
        ctx.fillText(organisation.name, size[0] / 2, currentY + fontSize / 2);

        currentY += fontSize + scaled(conf.V_SPACING);
    }

    /**
     * Draw position title
     *
     * @return void
     */
    function drawTitle() {
        var fontSize = scaled(35);

        ctx.font = fontSize + 'px ' + conf.BASE_FONT;
        ctx.fillStyle = colors.TITLE;
        ctx.textAlign = 'center';
        ctx.fillText(position.title, size[0] / 2, currentY + fontSize / 2);

        currentY += fontSize + scaled(conf.V_SPACING) / 2;
    }

    /**
     * Draw position shape
     *
     * @return void
     */
    function drawShape() {
        var shapeSize = size[0] - scaled(conf.PADDING) * 2 - scaled(conf.SHAPE_MARGIN),
            origin = [ size[0] / 2, currentY + shapeSize / 2 ];

        shapeRenderer(ctx, [ shapeSize, shapeSize ], origin, [ position.values ], true);

        currentY += scaled(conf.V_SPACING) * 2 + shapeSize;
    }

    /**
     * Draw tags
     *
     * @return void
     */
    function drawTags() {
        // Skill tags
        drawTagGroup(position.skills.map(function (skill) {
            return [ skill, colors.SKILL ];
        }));

        var workTags = [
            [ position.level, '#5e7f94' ],
            [ position.contract_type, '#678d8c' ],
            [ position.place_of_work, '#709c84' ]
            ];

        if (position.visa) {
            workTags.push([ 'Visa Sponsored', '#79aa7d' ]);
        }

        drawTagGroup(workTags);
    }

    /**
     * Draw an inline tags group
     *
     * @return void
     */
    function drawTagGroup(set) {
        var tags = [],
            fontSize = scaled(22),
            totalWidth = 0,
            tagHeight = scaled(conf.TAG_HEIGHT),
            x;

        ctx.font = fontSize + 'px ' + conf.BASE_FONT;

        set.forEach(function (t, i) {
            var textWidth = ctx.measureText(t[0]).width,
                tagWidth = textWidth + scaled(conf.TAG_PADDING) * 2;

            totalWidth += tagWidth;

            if (i !== set.length - 1) {
                totalWidth += conf.TAG_SPACING;
            }

            tags.push({
                text  : t[0],
                color : t[1],
                width : tagWidth
            });
        });

        x = size[0] / 2 - totalWidth / 2;

        tags.forEach(function (tag) {
            ctx.fillStyle = tag.color;
            drawUtil.fillRectRound(ctx, x, currentY, tag.width, tagHeight, scaled(3));
            ctx.fillStyle = colors.TAG;
            ctx.fillText(tag.text, x + tag.width / 2, currentY + tagHeight / 2);
            x += tag.width + scaled(conf.TAG_SPACING);
        });

        currentY += tagHeight + scaled(conf.V_SPACING);
    }

    /**
     * Get a size value scaled to current image size
     *
     * @param {Number} val
     * @return {Number}
     */
    function scaled(val) {
        return (val * size[0]) / conf.REAL_WIDTH;
    }
};