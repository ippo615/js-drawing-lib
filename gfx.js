// ----------------------------------------------------- [ Module: $gfxlib ] --
//////////1234567890//////////1234567890//////////1234567890//////////1234567890
var $gfxlib = (function($gfxlib){
	$gfxlib.canvasNode = null;
	$gfxlib.canvasContext = null;

	$gfxlib.windowSizeX = 320;
	$gfxlib.windowSizeY = 320;

	$gfxlib.createCanvasNode = function(parentNode,id,zIndex,width,height){
	/// Creates a new canvas dom element and adds it to the DOM. Returns
	/// an object that has information about the canvas element.
	/// parentNode: dom: parent element to which the canvas will be
	///             added as a child
	/// id: string: the html dom 'id' attribute to set on this element
	/// zIndex: int: the stacking order of this element, more negative
	///         is 'below' or 'behind' the more positive
	/// width: int: the number of horizontal pixels this canvas should
	///        be. If omitted, defaults to parentNode.style.width.
	/// height: int: the number of vertical pixels this canvas should
	///        be. If omitted, defaults to parentNode.style.height.

		if( ! width ){ var width = parseInt(parentNode.style.width); }
		if( ! height ){ var height = parseInt(parentNode.style.height); }
		var canvasNode = document.createElement('canvas');
		// Set the id and zIndex.
		canvasNode.id = id;
		canvasNode.style.zIndex = zIndex;
		// Make it the same size as the parent.
		canvasNode.width = width;
		canvasNode.height = height;
		// Line it up with the parent.
		canvasNode.style.position = 'absolute';
		canvasNode.style.top = '0px';
		canvasNode.style.left = '0px';
		// Let the pointer events pass through to the parent
		canvasNode.style.pointerEvents = "none";
		// Add it to the parent.
		parentNode.appendChild(canvasNode);
		return {
			id: id,
			xSize: width,
			ySize: height,
			domNode: canvasNode,
			ctx: canvasNode.getContext('2d')
		};
	};

	$gfxlib.setCanvasNode = function(domNode){
	/// Sets the node that is the canvas element. All drawing operations
	/// will occur on this canvas element.
	/// domNode: dom: canvas element
		$gfxlib.canvasNode = domNode;
		$gfxlib.canvasContext = $gfxlib.canvasNode.getContext('2d');
		// Get the size of the canvas.
		$gfxlib.windowSizeX = $gfxlib.canvasNode.width;
		$gfxlib.windowSizeY = $gfxlib.canvasNode.height;
	};

	$gfxlib.viewSetWindowSize = function(xSize,ySize){
	/// Sets the size of the canvas element. This is the physical number of
	/// pixels that the view will be drawn on, the number of pixels on the
	/// screen (for example).
	/// xSize: int: Number of horizontal pixels (width), must be postive
	///        (more than 0)
	/// ySize: int: Number of vertical pixels (height), must be postive
	///        (more than 0)
		$gfxlib.windowSizeX = xSize;
		$gfxlib.windowSizeY = ySize;
		if( $gfxlib.canvasNode ){
			$gfxlib.canvasNode.width = $gfxlib.windowSizeX;
			$gfxlib.canvasNode.height = $gfxlib.windowSizeY;
		}
	};

	// -------------------------------------------------- Scratch Canvas --

	var oldCanvasNode = null;

	$gfxlib.scratchNewCanvas = function(xSize,ySize){
	/// Creates a canvas that can be used for caching and optomization.
	/// xSize: int: number of pixels horizontally available for drawing
	/// ySize: int: number of pixels vertically available for drawing
		var dom = document.createElement('canvas');
		dom.width = Math.round(xSize);
		dom.height = Math.round(ySize);
		oldCanvasNode = $gfxlib.canvasNode;
		$gfxlib.setCanvasNode(dom);
	};

	$gfxlib.scratchFromRegion = function(x,y,xSize,ySize){
	/// Creates a scratch from the specified region of the canvas. Any
	/// subsequent drawing opertation will occur on the scratch. To 
	/// get the scratch call .scratchEndCanvas or .scratchToPattern.
	/// x: int: the left edge of the region
	/// y: int: the top edge of the region
	/// xSize: int: the width of the region
	/// ySize: int: the height of the region
		var dom = document.createElement('canvas');
		dom.width = Math.round(xSize);
		dom.height = Math.round(ySize);
		oldCanvasNode = $gfxlib.canvasNode;
		$gfxlib.setCanvasNode(dom);
		var ctx = $gfxlib.canvasContext;

		// Copy the data
		var oldCtx = oldCanvasNode.getContext('2d'),
		    oldData = oldCtx.getImageData(x, y, xSize, ySize);
		ctx.putImageData(oldData,0,0);
	};

	$gfxlib.scratchToPattern = function(repeat){
	/// Returns a pattern that can be used as a fill or stroke style.
	/// repeat: string: how the pattern should be repeated at the
	///         ends. Should be one of "repeat" or "repeat-x" or
	///         "repeat-y" or "no-repeat".
		var canvasScratch = $gfxlib.canvasNode;
		$gfxlib.setCanvasNode(oldCanvasNode);
		return $gfxlib.canvasContext.createPattern(canvasScratch,repeat);
	};

	$gfxlib.scratchEndCanvas = function(){
	/// Returns the scratch canvas and sets the current context to the
	/// last active context. To 'delete' a scratch canvas set the
	/// variable holding it to null.
		var canvasScratch = $gfxlib.canvasNode;
		$gfxlib.setCanvasNode(oldCanvasNode);
		return {
			id: "",
			xSize: parseInt(canvasScratch.width),
			ySize: parseInt(canvasScratch.height),
			domNode: canvasScratch,
			ctx: canvasScratch.getContext('2d')
		};
	};

	$gfxlib.scratchFromImage = function(domImage){
	/// Returns a scratch canvas created from a dom image.
	/// domImage: dom: Image element from the DOM.
		var domCan = document.createElement('canvas');
		var xSize = Math.round(domImage.width);
		var ySize = Math.round(domImage.height);
		domCan.width = Math.round(domImage.width);
		domCan.height = Math.round(domImage.height);
		var ctx = domCan.getContext('2d');
		ctx.drawImage(0,0,xSize,ySize,0,0,xSize,ySize);
		return {
			id: "",
			xSize: xSize,
			ySize: ySize,
			domNode: domCan,
			ctx: ctx
		};
	};

	$gfxlib.drawScratch = function(scratch,x,y){
	/// Draws the scratch canvas onto the current canvas.
	/// scratch: object: a scratch canvas created from one of the scratch
	///          calls.
	/// x: float: the location where the left edge of the scratch canvas
	///    should appear in the current canvas.
	/// y: float: the location where the top edge of the scratch canvas
	///    should appear in the current canvas.
		$gfxlib.canvasContext.drawImage(scratch.domNode,x,y);
	};

	$gfxlib.drawScratchScaled = function(scratch,x,y,xScale,yScale){
	/// Draws the scratch canvas onto the current canvas.
	/// scratch: object: a scratch canvas created from one of the scratch
	///          calls.
	/// x: float: the location where the left edge of the scratch canvas
	///    should appear in the current canvas.
	/// y: float: the location where the top edge of the scratch canvas
	///    should appear in the current canvas.
	/// xScale: float: the amount to scale the scratch in the x direction,
	///         1 is no scale, 0.5 is half, 2 is double, etc...
	/// yScale: float: the amount to scale the scratch in the y direction,
	///         1 is no scale, 0.5 is half, 2 is double, etc...
		$gfxlib.canvasContext.drawImage(scratch.domNode,
			0,0,scratch.xSize,scratch.ySize,
			x,y,scratch.xSize*xScale,scratch.ySize*yScale);
	};

	$gfxlib.drawScratchPart = function(scratch,xMin,yMin,xMax,yMax,xDest,yDest){
	/// Draws the scratch canvas onto the current canvas.
	/// scratch: object: a scratch canvas created from one of the scratch
	///          calls.
	/// xMin: float: the location of the left edge of the source region
	/// yMin: float: the location of the top edge of the source region
	/// xMax: float: the location of the right edge of the source region
	/// yMax: float: the location of the bottom edge of the source region
	/// xDest: float: the location where the left edge will appear
	///        in the destination canvas
	/// yDest: float: the location where the top edge will appear
	///        in the destination canvas
		var xSize = xMax - xMin;
		var ySize = yMax - yMin;
		$gfxlib.canvasContext.drawImage(scratch.domNode,
			xMin,yMin,xSize,ySize,
			xDest,yDest,xSize,ySize);
	};

	$gfxlib.drawScratchPartScaled = function(scratch,xMin,yMin,xMax,yMax,xDest,yDest,xScale,yScale){
	/// Draws the scratch canvas onto the current canvas.
	/// scratch: object: a scratch canvas created from one of the scratch
	///          calls.
	/// xMin: float: the location of the left edge of the source region
	/// yMin: float: the location of the top edge of the source region
	/// xMax: float: the location of the right edge of the source region
	/// yMax: float: the location of the bottom edge of the source region
	/// xDest: float: the location where the left edge will appear
	///        in the destination canvas
	/// yDest: float: the location where the top edge will appear
	///        in the destination canvas
	/// xScale: float: the amount to scale the scratch in the x direction,
	///         1 is no scale, 0.5 is half, 2 is double, etc...
	/// yScale: float: the amount to scale the scratch in the y direction,
	///         1 is no scale, 0.5 is half, 2 is double, etc...
		var xSize = xMax - xMin;
		var ySize = yMax - yMin;
		$gfxlib.canvasContext.drawImage(scratch.domNode,
			xMin,yMin,xSize,ySize,
			xDest,yDest,xSize*xScale,ySize*yScale);
	};

	// ------------------------------------------------------ View Stuff --

	$gfxlib.viewSizeX = 320;
	$gfxlib.viewSizeY = 320;
	$gfxlib.viewMinX = 0;
	$gfxlib.viewMinY = 0;
	$gfxlib.viewMaxX = 320;
	$gfxlib.viewMaxY = 320;
	$gfxlib.viewScaleX = 1;
	$gfxlib.viewScaleY = 1;
	$gfxlib.viewMidX = 160;
	$gfxlib.viewMidY = 160;
	$gfxlib.viewRotRad = 0;

	// Note that when working with views anything AFTER the view command is
	// drawn in the new view. Anything BEFORE the command is drawn in the
	// old view.

	var applyViewToCanvas = function(){
	/// Internal function that gets called after every view change.

		$gfxlib.viewMidX = $gfxlib.viewMinX + ($gfxlib.viewSizeX/2);
		$gfxlib.viewMidY = $gfxlib.viewMinY + ($gfxlib.viewSizeY/2);

		// When transforming the canvas determine everything you
		// want to do in the order you want to do it, then code it
		// backwards.
		var ctx = $gfxlib.canvasContext;
		ctx.setTransform(1,0,0,1,0,0);
		// First I want to translate to the center of viewport
		// to (second) rotate around the center of viewport. Then
		// (third) I want to translate the canvas back so that the
		// mid point is in the middle. Finally, (fourth) I want to
		// scale everything so the view fills the window.
		// Here it is (backwards, as it should be):
		ctx.scale($gfxlib.viewScaleX,$gfxlib.viewScaleY);
		ctx.translate($gfxlib.viewMidX,$gfxlib.viewMidY);
		ctx.rotate($gfxlib.viewRotRad);
		ctx.translate(-$gfxlib.viewMidX,-$gfxlib.viewMidY);
	};

	$gfxlib.viewRotateTo = function(degrees){
	/// Sets the roation of the viewport.
	/// degrees: float: angle to rotate the canvas to
		$gfxlib.viewRotRad = degrees * degToRad;
		applyViewToCanvas();
	};

	$gfxlib.viewRotateBy = function(degrees){
	/// Adjust the rotation of the viewport.
	/// degrees: float: angle to rotate the canvas by
		$gfxlib.viewRotRad += degrees * degToRad;
		applyViewToCanvas();
	};

	$gfxlib.viewSetCorners = function(xMin,yMin,xMax,yMax){
	/// Sets the view to be the region defined from xMin,yMin to xMax,yMax
	/// xMin: float: The x location in the world that will correspond to the
	///              left edge of the view port.
	/// yMin: float: The y location in the world that will correspond to the
	///              top edge of the view port.
	/// xMax: float: The x location in the world that will correspond to the
	///              right edge of the view port.
	/// yMax: float: The y location in the world that will correspond to the
	///              bottom edge of the view port.
		$gfxlib.viewMinX = xMin;
		$gfxlib.viewMinY = yMin;
		$gfxlib.viewMaxX = xMax;
		$gfxlib.viewMaxY = yMax;
		// Determine scaling, etc...
		$gfxlib.viewSizeX = $gfxlib.viewMaxX - $gfxlib.viewMinX;
		$gfxlib.viewSizeY = $gfxlib.viewMaxY - $gfxlib.viewMinY;
		$gfxlib.viewScaleX = $gfxlib.windowSizeX / $gfxlib.viewSizeX;
		$gfxlib.viewScaleY = $gfxlib.windowSizeY / $gfxlib.viewSizeY;
		applyViewToCanvas();
	};

	$gfxlib.viewMoveBy = function(dx,dy){
	/// Moves the view by dx and dy in the x and y directions, respectively.
	/// dx: float: The amount of world pixels (not physical pixels) to move
	///     the view port in the x-direction. Negative (ie -4) is left.
	///     Zero (ie 0) means no movement. Positive (ie 7) is right.
	/// dy: float: The amount of world pixels (not physical pixels) to move
	///     the view port in the y-direction. Negative (ie -2) is up. Zero
	///     (ie 0) means no movement. Positive (ie 6) is down.
		$gfxlib.viewMinX += dx;
		$gfxlib.viewMinY += dy;
		$gfxlib.viewMaxX += dx;
		$gfxlib.viewMaxY += dy;
		// Determine scaling, etc...
		//$gfxlib.viewSizeX = $gfxlib.viewMaxX - $gfxlib.viewMinX;
		//$gfxlib.viewSizeY = $gfxlib.viewMaxY - $gfxlib.viewMinY;
		//$gfxlib.viewScaleX = $gfxlib.windowSizeX / $gfxlib.viewSizeX;
		//$gfxlib.viewScaleY = $gfxlib.windowSizeY / $gfxlib.viewSizeY;
		applyViewToCanvas();
	};

	$gfxlib.viewMoveToward = function(xGoal,yGoal,xStep,yStep,xBorder,yBorder){
	/// Moves the view by xStep and/or yStep to ensure that xGoal,yGoal is
	/// within the view and at least xBorder,yBorder away from the the
	/// edges.
	/// xGoal: float: virtual x location we want to see in the view
	/// yGoal: float: virtual y location we want to see in the view
	/// xStep: float: amount to pan the view in the x direction
	/// yStep: float: amount to pan the view in the y direction
	/// xBorder: float: number of virtual pixels the goal location must be
	///          away from the left and right edges
	/// yBorder: float: number of virtual pixels the goal location must be
	///          away from the top and bottom edges

		// Compute the inner rectangle that we want the goal point to be within
		var goalMinX = $gfxlib.viewMinX + xBorder,
		    goalMinY = $gfxlib.viewMinY + yBorder,
		    goalMaxX = $gfxlib.viewMaxX - xBorder,
		    goalMaxY = $gfxlib.viewMaxY - yBorder;
		// The goal point is left of the 'allowed' view
		if( xGoal < goalMinX ){
			// Move left (toward the goal)
			$gfxlib.viewMinX -= xStep;
			$gfxlib.viewMaxX -= xStep;
		}else if( xGoal > goalMaxX ){
			$gfxlib.viewMinX += xStep;
			$gfxlib.viewMaxX += xStep;
		}
		// Move up or down
		if( yGoal < goalMinY ){
			$gfxlib.viewMinY -= yStep;
			$gfxlib.viewMaxY -= yStep;
		}else if( yGoal > goalMaxY ){
			$gfxlib.viewMinY += yStep;
			$gfxlib.viewMaxY += yStep;
		}

		// DEBUG: This should never 'move' in the view port.
		//$gfxlib.drawSetStyle("#00F","#00F",0.5);
		//$gfxlib.drawRect(goalMinX,goalMinY,goalMaxX-goalMinX,goalMaxY-goalMinY);

		applyViewToCanvas();
	};

	$gfxlib.viewZoomTo = function(xScale,yScale){
	/// Sets the scale amount in the x and y directions.
	/// xScale: float: 1.0 means a physical pixel is same size as virtual
	///         pixel; 2.0 means a physical pixel is twice as big as
	///         virtual pixel; 0.5 means a  physical pixel is half as big
	///         as virtual pixel; 0 is not allowed
	/// yScale: float: same as xScale but in the y dimension

		$gfxlib.viewScaleX = xScale;
		$gfxlib.viewScaleY = yScale;
		// Keep stuff centered
		var xCenter = $gfxlib.viewMinX + $gfxlib.viewSizeX / 2,
		    yCenter = $gfxlib.viewMinY + $gfxlib.viewSizeY / 2;

		// Compute size.
		$gfxlib.viewSizeX = $gfxlib.windowSizeX / $gfxlib.viewScaleX;
		$gfxlib.viewSizeY = $gfxlib.windowSizeY / $gfxlib.viewScaleY;

		// Compute half sizes.
		var xHalf = $gfxlib.viewSizeX / 2,
		    yHalf = $gfxlib.viewSizeY / 2;

		// Compute new edges.
		$gfxlib.viewMinX = xCenter - xHalf;
		$gfxlib.viewMinY = yCenter - yHalf;
		$gfxlib.viewMaxX = xCenter + xHalf;
		$gfxlib.viewMaxY = yCenter + yHalf;

		applyViewToCanvas();
	};

	$gfxlib.viewZoomBy = function(dxScale,dyScale){
	/// Increases or decreases the xScale by dxScale.
	/// Increases or decreases the yScale by dyScale.
	/// dxScale: float: (-) decrease/zoom out; 0 no change;
	///          (+) increase/zoom in
	/// dxScale: float: (-) decrease/zoom out; 0 no change;
	///          (+) increase/zoom in

		$gfxlib.viewScaleX += dxScale;
		$gfxlib.viewScaleY += dyScale;

		// Keep stuff centered
		var xCenter = $gfxlib.viewMinX + $gfxlib.viewSizeX / 2,
		    yCenter = $gfxlib.viewMinY + $gfxlib.viewSizeY / 2;
		// Compute sizes:
		$gfxlib.viewSizeX = $gfxlib.windowSizeX / $gfxlib.viewScaleX;
		$gfxlib.viewSizeY = $gfxlib.windowSizeY / $gfxlib.viewScaleY;
		// Half size
		var xHalf = $gfxlib.viewSizeX / 2,
		    yHalf = $gfxlib.viewSizeY / 2;
		// Compute edges
		$gfxlib.viewMinX = xCenter - xHalf;
		$gfxlib.viewMinY = yCenter - yHalf;
		$gfxlib.viewMaxX = xCenter + xHalf;
		$gfxlib.viewMaxY = yCenter + yHalf;

		applyViewToCanvas();
	};

	$gfxlib.viewStayWithin = function(xMin,yMin,xMax,yMax){
	/// Ensures that the view stays within the region defined from xMin yMin
	/// to xMax yMax by panning the view in any direction. This can be used
	/// to prevent your view from showing regions that are outside of your
	/// world.
	/// xMin: float: Minimum x coordinate of the world that should be in the
	///              viewport. 
	/// yMin: float: Minimum y coordinate of the world that should be in the
	///              viewport. 
	/// xMax: float: Maximum x coordinate of the world that should be in the
	///              viewport. 
	/// yMax: float: Maximum y coordinate of the world that should be in the
	///              viewport.
 
		// What if the size is smaller than the current size?
		// 
		var dxMin = $gfxlib.viewMinX - xMin; // positive is ok
		if( dxMin < 0 ){
			$gfxlib.viewMinX -= dxMin;
			$gfxlib.viewMaxX -= dxMin;
		}
		var dyMin = $gfxlib.viewMinY - yMin;
		if( dyMin < 0 ){
			$gfxlib.viewMinY -= dyMin;
			$gfxlib.viewMaxY -= dyMin;
		}
		var dxMax = $gfxlib.viewMaxX - xMax; // negative is ok
		if( dxMax > 0 ){
			$gfxlib.viewMinX -= dxMax;
			$gfxlib.viewMaxX -= dxMax;
		}
		var dyMax = $gfxlib.viewMaxY - yMax;
		if( dyMax > 0 ){
			$gfxlib.viewMinY -= dyMax;
			$gfxlib.viewMaxY -= dyMax;
		}

		applyViewToCanvas();
	};

	$gfxlib.viewSetAspectRatio = function(xSize,ySize){
	/// Changes the xScale and the yScale so that it matches the aspect
	/// ratio described by xSize and ySize. 
	/// xSize: float: The width of your ideal aspect ratio.
	/// ySize: float: The height of your ideal aspect ratio.

		var aspectRatio = $gfxlib.viewSizeX / $gfxlib.viewSizeY,
		    idealRatio = xSize / ySize;
		if( aspectRatio !== idealRatio ){
			// Keep stuff centered
			var xCenter = $gfxlib.viewMinX + $gfxlib.viewSizeX / 2;
			var yCenter = $gfxlib.viewMinY + $gfxlib.viewSizeY / 2;
			// rescale so that the smaller dimension is enlarged
			if( $gfxlib.viewSizeX > $gfxlib.viewSizeY ){
				// rescale y
				$gfxlib.viewScaleY = $gfxlib.viewScaleX / idealRatio;
			}else{
				$gfxlib.viewScaleX = $gfxlib.viewScaleY * idealRatio;
			}
			// Compute sizes
			$gfxlib.viewSizeX = $gfxlib.windowSizeX / $gfxlib.viewScaleX;
			$gfxlib.viewSizeY = $gfxlib.windowSizeY / $gfxlib.viewScaleY;
			// Half size
			var xHalf = $gfxlib.viewSizeX / 2;
			var yHalf = $gfxlib.viewSizeY / 2;
			// 
			$gfxlib.viewMinX = xCenter - xHalf;
			$gfxlib.viewMinY = yCenter - yHalf;
			$gfxlib.viewMaxX = xCenter + xHalf;
			$gfxlib.viewMaxY = yCenter + yHalf;
		}

		applyViewToCanvas();
	};

	$gfxlib.viewPointFromWindow = function(xWin,yWin){
	/// Returns the world coordinate that is at xWin,yWin in the window.
	/// The world coordinate is an object {x:x,y:y}
	/// xWin: int: the horizontal position in the window. 0 is the left
	///       edge, it increases as you move right.
	/// yWin: int: the vertical position in the window. 0 is the top
	///       edge, it increases as you move down.
		
		// The middle of the window and the middle of the view should
		// be the same
		var windowMidX = $gfxlib.windowSizeX*0.5,
		    windowMidY = $gfxlib.windowSizeY*0.5;

		// Translate the center to the origin
		var dx = xWin - windowMidX,
		    dy = yWin - windowMidY;

		// Rotate it 
		var resCos = Math.cos($gfxlib.viewRotRad),
		    resSin = Math.sin($gfxlib.viewRotRad),
		    rotDX = dx * resCos + dy * resSin,
		    rotDY = -dx * resSin + dy * resCos;

		// Scale and translate it back
		var worldX = $gfxlib.viewMidX + rotDX / $gfxlib.viewScaleX,
		    worldY = $gfxlib.viewMidY + rotDY / $gfxlib.viewScaleY;

		return {x:worldX,y:worldY};

	};

	// ----------------------------------------------------- Style Stuff --

	$gfxlib.setStyle = function(fill,stroke,alpha){
	/// Sets the current fill color, stroke color and alpha level.
	/// fill: string: The color that you want to use to fill the shape
	///               examples: "#000"; "black"; "#000000"; "none"
	/// stroke: string: The color that you want to use to outline the shape
	///               examples: "#F00"; "red"; "#FF0000"; "none"
	/// alpha: float: The amount of transparency. 0 tranparent; 1 opaque
		var ctx = $gfxlib.canvasContext;
		ctx.fillStyle = fill;
		ctx.strokeStyle = stroke;
		ctx.globalAlpha = alpha;
	};

	$gfxlib.setLineStyle = function(width,join,cap){
	/// Sets the current cap, join, and width of a stroke.
	/// width: float: The width of a line in pixels
	/// join: string: The way to join a line segement to another.
	///       Can be one of: "miter" | "round" | "bevel"
	/// cap: string: The way to draw the end of the line segement.
	///      Can be one of: "butt"  | "round" | "square"
		var ctx = $gfxlib.canvasContext;
		ctx.lineWidth = width;
		ctx.lineJoin = join;
		ctx.lineCap = cap;
	};

	// ------------------------------------------------------ Draw Stuff --

	$gfxlib.drawClearAll = function(){
	/// Removes everything that was drawn on the canvas. It turns the
	/// canvas transparent until something new is drawn.
		var ctx = $gfxlib.canvasContext;
		ctx.save();
		ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0,0,$gfxlib.windowSizeX,$gfxlib.windowSizeY);
		ctx.restore();
	};

	$gfxlib.drawClearRect = function(xMin,yMin,xSize,ySize){
	/// Sets the region from xMin,yMin to xMax,yMax to be fully
	/// transparent.
	/// xMin: float: the left edge of the region to be cleared
	/// yMin: float: the top edge of the region to be cleared
	/// xSize: float: the width of the region to be cleared
	/// ySize: float: the height of the region to be cleared
		var ctx = $gfxlib.canvasContext;
		ctx.clearRect(xMin,yMin,xSize,ySize);
	};

	$gfxlib.drawCheckerBoard = function(xOffset,yOffset,xSize,ySize,nCellsX,nCellsY){
	/// Draws a checker board pattern on the canvas.
	/// xOffset: float: The starting x location in the world.
	/// yOffset: float: The starting y location in the world.
	/// xSize: float: The horizontal size (width) of each cell.
	/// ySize: float: The vertical size (height) of each cell.
	/// nCellsX: int: The number of cells that will be placed horizontally.
	/// nCellsY: int: The number of cells that will be placed vertically.

		var ctx = $gfxlib.canvasContext,
		    x = xOffset;
		for(var ix=0; ix<nCellsX; ix += 1){

			var y = yOffset;
			for(var iy=0; iy<nCellsY; iy += 1){
				if( ((ix + iy) % 2) === 0 ){
					ctx.fillRect(x,y,xSize,ySize);
				}
				y += ySize;
			}
			x += xSize;
		}
	};

	$gfxlib.drawRect = function(x,y,w,h){
	/// Draws a rectangle on the current canvas.
	/// x: float: the world coordinate of the left edge of the rectangle.
	/// y: float: the world coordinate of the top edge of the rectangle.
	/// w: float: the width of the rectangle (number of world coordinates in
	///    the x direction).
	/// h: float: the height of the rectangle (number of world coordinates in
	///    the y direction).
		var ctx = $gfxlib.canvasContext;
		ctx.fillRect(x,y,w,h);
		ctx.strokeRect(x,y,w,h);
	};

	$gfxlib.drawRectCenter = function(cx,cy,hw,hh){
	/// Draws a rectangle on the current canvas.
	/// cx: float: the world coordinate of the horizontal center.
	/// cy: float: the world coordinate of the vertical center.
	/// hw: float: half of the width of the rectangle (number of world
	///     coordinates in the x direction).
	/// hh: float: half of the height of the rectangle (number of world
	///     coordinates in the y direction).
		var ctx = $gfxlib.canvasContext;
		ctx.fillRect(cx-hw,cy-hh,hw*2,hh*2);
		ctx.strokeRect(cx-hw,cy-hh,hw*2,hh*2);
	};

	$gfxlib.drawCircle = function(cx,cy,r){
	/// Draws a circle on the current canvas.
	/// cx: float: the world coordinate of the horizontal center of the circle
	/// cy: float: the world coordinate of the vertical center of the circle
	/// r: float: the radius of the circle
		var ctx = $gfxlib.canvasContext;
		ctx.beginPath();
		ctx.arc(cx,cy,r,0,2*Math.PI,true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};

	$gfxlib.drawStar = function(cx,cy,rIn,rOut,nPoints,angle){
	/// Draws a star on the current canvas.
	/// cx: float: the world coordinate of the horizontal center of the star
	/// cy: float: the world coordinate of the vertical center of the star
	/// rIn: float: the length of the inner radius of the star
	/// rOut: float: the length of the outer radius of the star
	/// nPoints: int: the number of points or spokes that this star has
	/// angle: float: the degree to draw the first spoke (ie 0 to right,
	///        180 to left, 90 is up, 270 is down)
		var ctx = $gfxlib.canvasContext;
		ctx.beginPath();
		// Could use some math optomizations
		// ie combine # of constants mult to 1
		var dAngle = (360 / (nPoints*2))*degToRad,
		    iAngle = angle*degToRad,
		    x = cx + rOut*Math.cos(iAngle),
		    y = cy + rOut*Math.sin(iAngle);
		ctx.moveTo(x,y);
		for( var i=1; i<nPoints; i+=1 ){
			iAngle += dAngle;
			x = cx + rIn*Math.cos(iAngle);
			y = cy + rIn*Math.sin(iAngle);
			ctx.lineTo(x,y);
			iAngle += dAngle;
			x = cx + rOut*Math.cos(iAngle);
			y = cy + rOut*Math.sin(iAngle);
			ctx.lineTo(x,y);
		}
		iAngle += dAngle;
		x = cx + rIn*Math.cos(iAngle);
		y = cy + rIn*Math.sin(iAngle);
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};

	$gfxlib.drawPoly = function(cx,cy,r,nPoints,angle){
	/// Draws a regular polygon on the current canvas.
	/// cx: float: the world coordinate of the horizontal center of the polygon
	/// cy: float: the world coordinate of the vertical center of the polygon
	/// r: float: the length of the outer radius of the polygon
	/// nPoints: int: the number of sides that this star has
	/// angle: float: the degree to draw the first vertex
		var ctx = $gfxlib.canvasContext;
		ctx.beginPath();
		// Could use some math optomizations
		// ie combine # of constants mult to 1
		var dAngle = (360 / nPoints)*degToRad,
		    iAngle = angle*degToRad,
		    x = cx + r*Math.cos(iAngle),
		    y = cy + r*Math.sin(iAngle);
		ctx.moveTo(x,y);
		for( var i=1; i<nPoints; i+=1 ){
			iAngle += dAngle;
			x = cx + r*Math.cos(iAngle);
			y = cy + r*Math.sin(iAngle);
			ctx.lineTo(x,y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};	

	// ------------------------------------------------------ Path Stuff --

	var pathLastXs = [];
	var pathLastYs = [];
	var pathLastDirs = [];
	var pathLastPoint = 0;
	var degToRad = Math.PI/180;
	var radToDeg = 180/Math.PI;

	$gfxlib.pathBegin = function(x,y){
	/// Begins drawing a path on the current canvas
	/// x: float: the world x location that the path point should
	///    start at.
	/// y: float: the world y location that the path point should
	///    start at.
		var ctx = $gfxlib.canvasContext;
		ctx.beginPath();
		ctx.moveTo(x,y);
		pathLastXs = [x];
		pathLastYs = [y];
		pathLastDirs = [0];
		pathLastPoint = 0;
		return $gfxlib;
	};

	$gfxlib.pathMoveTo = function(x,y){
	/// Moves the path to x,y.
	/// x: float: the world x location that the path point should be
	///    moved to.
	/// y: float: the world y location that the path point should be
	///    moved to.

		var px = pathLastXs[pathLastXs.length-1],
		    py = pathLastYs[pathLastYs.length-1];
		// compute the direction:
		var dx = x - px,
		    dy = y - py;
		pathLastXs.push(x);
		pathLastYs.push(y);
		pathLastDirs.push(Math.atan2(dy,dx)*radToDeg);
		return $gfxlib;
	};

	$gfxlib.pathMoveBy = function(dx,dy){
	/// Moves the path by dx, dy.
	/// dx: float: the amount to move the point in the x direction
	/// dy: float: the amount to move the point in the y direction

		var px = pathLastXs[pathLastXs.length-1],
		    py = pathLastYs[pathLastYs.length-1],
		    x = px + dx,
		    y = py + dy;

		pathLastXs.push(x);
		pathLastYs.push(y);
		pathLastDirs.push(Math.atan2(dy,dx)*radToDeg);
		return $gfxlib;
	};

	$gfxlib.pathTurnTo = function(degrees,len){
	/// Moves the path by the specified length in the given direction.
	/// degrees: float: the direction the path should move in. 0 is
	///   in the positive x direction, 45 is equally in the +x and +y
	///   direction, 90 is +y, 180 is -x, 270 is -y and 360 is the 
	///   same as 0.
	/// len: float: the distance that point should be moved
		var px = pathLastXs[pathLastXs.length-1],
		    py = pathLastYs[pathLastYs.length-1],
		    rad = degrees * degToRad,
		    x = px + len*Math.cos(rad),
		    y = py + len*Math.sin(rad);

		pathLastXs.push(x);
		pathLastYs.push(y);
		pathLastDirs.push(degrees);
		return $gfxlib;
	};

	$gfxlib.pathTurnBy = function(degrees,len){
	/// Move the current point by the specified length
	/// after turning the specified amount.
	/// degrees: float: the amount to turn the line; 0 is no turn,
	///   90 is perpendicular to right, -90 is perpendicular to the
	///   left
	/// len: float: the distance to move the point
		var px = pathLastXs[pathLastXs.length-1],
		    py = pathLastYs[pathLastYs.length-1],
		    dir = degrees + pathLastDirs[pathLastDirs.length-1],
		    rad = dir * degToRad,
		    x = px + len*Math.cos(rad),
		    y = py + len*Math.sin(rad);

		pathLastXs.push(x);
		pathLastYs.push(y);
		pathLastDirs.push(dir);

		return $gfxlib;
	};

	$gfxlib.pathDoMove = function(){
	/// Moves the path to the last x,y.
	/// x: float: the world x location that the line should end on.
	/// y: float: the world y location that the line should end on.
		var ctx = $gfxlib.canvasContext,
		    x = pathLastXs[pathLastXs.length-1],
		    y = pathLastYs[pathLastYs.length-1];
		pathLastPoint = pathLastYs.length - 1;
		ctx.moveTo(x,y);
		return $gfxlib;
	};

	$gfxlib.pathLine = function(){
	/// Draws lines to the last x,y.
		var ctx = $gfxlib.canvasContext,
		    nPts = pathLastXs.length;
		for( var i = pathLastPoint; i<nPts; i+=1 ){
			ctx.lineTo(pathLastXs[i],pathLastYs[i]);
			pathLastPoint += 1;
		}
		return $gfxlib;
	};

	$gfxlib.pathCurve = function(curve){
	/// Draws a curved line to the last x,y.
	/// Draws a curved line to the last x,y.
	/// curve: float: how much to curve or bulge the line. 0 is
	///        no bulge (ie a straight line), +1 is to the right
	///         -1 is to the left.

		var ctx = $gfxlib.canvasContext,
		    nPts = pathLastXs.length;
		for( var i = pathLastPoint; i<=nPts; i+=1 ){
			var x0 = pathLastXs[i-2],
			    y0 = pathLastYs[i-2],
			    x1 = pathLastXs[i-1],
			    y1 = pathLastYs[i-1];
			//pathLastPoint = pathLastYs.length - 1;
	
			// get the change in x,y
			var dx = x1 - x0,
			    dy = y1 - y0;
	
			// the mid-point is our 0 control pt
			var xCntl = x0 + (dx / 2),
			    yCntl = y0 + (dy / 2);
	
			// We'll move perpendicularly along it
			var mag = Math.sqrt(dx*dx+dy*dy),
			    px = -dy/mag,
			    py = dx/mag;
	
			// Adjust the control point
			xCntl += curve * px;
			yCntl += curve * py;
	
			ctx.quadraticCurveTo(xCntl,yCntl,x1,y1);
			pathLastPoint += 1;
		}

		return $gfxlib;
	};

	$gfxlib.pathQuadCurve = function(){
	/// Draws a curved line to the last x,y. Note that the first line in
	/// a path cannot be curved using this method.
		var ctx = $gfxlib.canvasContext,
		    nPts = pathLastXs.length;
		for( var i = pathLastPoint+2; i<nPts; i+=2 ){
			var x0 = pathLastXs[i-1],
			    y0 = pathLastYs[i-1],
			    x1 = pathLastXs[i],
			    y1 = pathLastYs[i];
			ctx.quadraticCurveTo(x0,y0,x1,y1);
			pathLastPoint += 2;
		}

		return $gfxlib;
	};

	$gfxlib.pathBezier = function(){
	/// Draws a Bezier curved line to the last x,y.
		var ctx = $gfxlib.canvasContext,
		    nPts = pathLastXs.length;
		for( var i = pathLastPoint+2; i<nPts; i+=3 ){
			var x0 = pathLastXs[i-2],
			    y0 = pathLastYs[i-2],
			    x1 = pathLastXs[i-1],
			    y1 = pathLastYs[i-1],
			    x2 = pathLastXs[i],
			    y2 = pathLastYs[i];
			ctx.bezierCurveTo(x0,y0, x1,y1, x2,y2);
			pathLastPoint += 3;
		}
		return $gfxlib;
	};

	$gfxlib.pathHasPoint = function(x,y){
	/// Returns 1 if x,y is in the path, 0 otherwise.
	/// x: float: the x coordinate that should be in the path
	/// y: float: the y coordinate that should be in the path
		return $gfxlib.canvasContext.isPointInPath(x,y);
	};

	$gfxlib.pathClose = function(){
	/// Closes the path that has just been created. It adds a line
	/// from the last point to the starting point.
		$gfxlib.canvasContext.closePath();
	};

	$gfxlib.pathDraw = function(){
	/// Draws the path that has just been created.
		$gfxlib.canvasContext.fill();
		$gfxlib.canvasContext.stroke();
	};

	// -------------------------------------------------- Gradient Stuff --

	$gfxlib.createGradientLinear = function(x0,y0,x1,y1,colors){
	/// Returns a linear gradient.
	/// x0: float: the starting x location of the gradient.
	/// y0: float: the strating y location of the gradient.
	/// x1: float: the ending x location of the gradient.
	/// y1: float: the ending y location of the gradient.
	/// colors: array: an array of strings that represent the colors to be 
	///   evenly distributed from the start to the end of the gradient.
		var ctx = $gfxlib.canvasContext;
		var grad = ctx.createLinearGradient(x0,y0,x1,y1);
		var l = colors.length;
		var total = l-1;
		for(var i=0; i<l; i+=1){
			grad.addColorStop(i/total,colors[i]);
		}
		return grad;
	};

	$gfxlib.createGradientRadial = function(x0,y0,r0,x1,y1,r1,colors){
	/// Returns a radial (circular) gradient.
	/// x0: float: the starting x location of the gradient.
	/// y0: float: the strating y location of the gradient.
	/// r0: float: the radius of the starting circle (like the inner hole
	///     of a donut).
	/// x1: float: center x location of the circle that defines the outermost
	///     point of the gradient.
	/// y1: float: center y location of the circle that defines the outermost
	///     point of the gradient.
	/// r1: float: the radius of the ending circle (like the outer part of
	///     a donut).
	/// colors: array: an array of strings that represent the colors to be 
	///   evenly distributed from the start to the end of the gradient.
		var ctx = $gfxlib.canvasContext;
		var grad = ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);
		var l = colors.length;
		var total = l-1;
		for(var i=0; i<l; i+=1){
			grad.addColorStop(i/total,colors[i]);
		}
		return grad;
	};

	// ----------------------------------------------------------- Text  --

	$gfxlib.textSetFont = function(sizeAndName){
	/// Sets the size and name of the font that you want to use.
	/// sizeAndName: string: the font size and font name that you want to
	///              use. For example: "20px monospace"
		$gfxlib.canvasContext.font = sizeAndName;
	};

	$gfxlib.textSetAlign = function(align,base){
	/// Sets the reference point (origin) for the text.
	/// align: string: Depending on what you specify the x coordinate will
	///        represent the "left" edge, "right" edge, "center", "start"
	///        or "end" of the text. "start" are "end" vary depending on
	///        if the text is left-to-right or right-to-left.
	/// base: string: Depending on what you specifiy the y coordinate will
	///       represent the "alphabetic" baseline, "top" of the em square,
	///       "hanging" baseline, "middle" of the em square, "ideographic"
	///       baseline, or "bottom" of the em square.
		$gfxlib.canvasContext.textAlign = align;
		$gfxlib.canvasContext.textBaseline = base;
	};

	$gfxlib.textDraw = function(x,y,text){
	/// Draws the text at position x,y. The exact placement depends on the
	/// values you pass to textSetAlign.
	/// x: float: the x location of the text.
	/// y: float: the y location of the text.
	/// text: string: the information to be written
		var ctx = $gfxlib.canvasContext;
		ctx.fillText(text,x,y);
		ctx.strokeText(text,x,y);
	};

	$gfxlib.textGetWidth = function(text){
	/// Returns the width of text if it was drawn in the current style.
	/// text: string: text to be measure
		return $gfxlib.canvasContext.measureText(text).width;
	};

	// ---------------------------------------------- Pixel Manipulation --

	$gfxlib.filterConvolve3x3 = function(x,y,xSize,ySize,matrix){
	/// Convolves the image with the matrix provided.
	/// x: int: the x location of the starting point of the center
	///    of the convolution matrix
	/// y: int: the y location of the starting point of the center
	///    of the convolution matrix
	/// xSize: int: the number of pixels horizontally to convolve
	/// ySize: int: the number of pixels vertically to convolve
	/// matrix: array of 9 floats: the numbers that will 
	///         be multiplied and added to each pixel.
	///         The first 3 represent the weights for the pixels
	///         above the current row. The next 3 represent the
	///         weights for the current row (from left to right).
	///         The last 3 represent the weights for pixels below
	///         the current row.

		var ctx = $gfxlib.canvasContext,
		    imageData = ctx.getImageData(x, y, xSize, ySize),
		    pixels = imageData.data,
		    nPixels = pixels.length,
		    result = ctx.createImageData(xSize, ySize),
		    pos = 0, r = 0, g = 0, b = 0, a = 0,
		    yLimit = ySize -1,
		    xLimit = xSize -1;

		for(var iy=1; iy<yLimit; iy+=1){
			for(var ix=1; ix<xLimit; ix+=1){
				// i can optomize the postion calc (ie +- change)
				// top left
				iy -= 1; ix -=1; pos = (iy*xSize+ix)*4;
				r = matrix[0]*pixels[pos+0];
				g = matrix[0]*pixels[pos+1];
				b = matrix[0]*pixels[pos+2];
				a = matrix[0]*pixels[pos+3];
				// top middle
				ix +=1; pos = (iy*xSize+ix)*4;
				r += matrix[1]*pixels[pos+0];
				g += matrix[1]*pixels[pos+1];
				b += matrix[1]*pixels[pos+2];
				a += matrix[1]*pixels[pos+3];
				// top right
				ix +=1; pos = (iy*xSize+ix)*4;
				r += matrix[2]*pixels[pos+0];
				g += matrix[2]*pixels[pos+1];
				b += matrix[2]*pixels[pos+2];
				a += matrix[2]*pixels[pos+3];
				// middle right
				iy +=1; pos = (iy*xSize+ix)*4;
				r += matrix[5]*pixels[pos+0];
				g += matrix[5]*pixels[pos+1];
				b += matrix[5]*pixels[pos+2];
				a += matrix[5]*pixels[pos+3];
				// middle middle
				ix -=1; pos = (iy*xSize+ix)*4;
				r += matrix[4]*pixels[pos+0];
				g += matrix[4]*pixels[pos+1];
				b += matrix[4]*pixels[pos+2];
				a += matrix[4]*pixels[pos+3];
				// middle left
				ix -=1; pos = (iy*xSize+ix)*4;
				r += matrix[3]*pixels[pos+0];
				g += matrix[3]*pixels[pos+1];
				b += matrix[3]*pixels[pos+2];
				a += matrix[3]*pixels[pos+3];
				// bottom left
				iy +=1; pos = (iy*xSize+ix)*4;
				r += matrix[6]*pixels[pos+0];
				g += matrix[6]*pixels[pos+1];
				b += matrix[6]*pixels[pos+2];
				a += matrix[6]*pixels[pos+3];
				// bottom middle
				ix +=1; pos = (iy*xSize+ix)*4;
				r += matrix[7]*pixels[pos+0];
				g += matrix[7]*pixels[pos+1];
				b += matrix[7]*pixels[pos+2];
				a += matrix[7]*pixels[pos+3];
				// bottom right
				ix +=1; pos = (iy*xSize+ix)*4;
				r += matrix[8]*pixels[pos+0];
				g += matrix[8]*pixels[pos+1];
				b += matrix[8]*pixels[pos+2];
				a += matrix[8]*pixels[pos+3];

				// set back to center position
				iy -=1; ix -= 1; pos = (iy*xSize+ix)*4;
				// set the pixel color
				result.data[pos+0] = r;
				result.data[pos+1] = g;
				result.data[pos+2] = b;
				result.data[pos+3] = a;
			}
		}
		ctx.putImageData(result,x,y);
	};

	$gfxlib.filterFastConvolve3 = function(x,y,xSize,ySize,matrix){
	/// Convolves the image with the matrix provided.
	/// x: int: the x location of the starting point of the center
	///    of the convolution matrix
	/// y: int: the y location of the starting point of the center
	///    of the convolution matrix
	/// xSize: int: the number of pixels horizontally to convolve
	/// ySize: int: the number of pixels vertically to convolve
	/// matrix: array of 3 floats: the numbers that will 
	///         be multiplied and added to each pixel.
	///         The first 3 represent the weights for the pixels
	///         above the current row

		var ctx = $gfxlib.canvasContext,
		    imageData = ctx.getImageData(x, y, xSize, ySize),
		    pixels = imageData.data,
		    nPixels = pixels.length,
		    result = ctx.createImageData(xSize, ySize),
		    pos = 0, r = 0, g = 0, b = 0, a = 0,
		    yLimit = ySize -1,
		    xLimit = xSize -1;

		// Horizontal pass
		// Note: we're starting at 1,0 (not 0,0).
		for(var iy=0; iy<ySize; iy+=1){
			for(var ix=1; ix<xLimit; ix+=1){
				// i can optomize the postion calc (ie +- change)
				// left
				pos = (iy*xSize+ix-1)*4;
				r = matrix[0]*pixels[pos+0];
				g = matrix[0]*pixels[pos+1];
				b = matrix[0]*pixels[pos+2];
				a = matrix[0]*pixels[pos+3];
				// middle
				pos += 4;
				r += matrix[1]*pixels[pos+0];
				g += matrix[1]*pixels[pos+1];
				b += matrix[1]*pixels[pos+2];
				a += matrix[1]*pixels[pos+3];
				// right
				pos += 4;
				r += matrix[2]*pixels[pos+0];
				g += matrix[2]*pixels[pos+1];
				b += matrix[2]*pixels[pos+2];
				a += matrix[2]*pixels[pos+3];
				// Store it, we only use half, because the olther
				// half comes from the vertical pass
				pos -= 4;
				result.data[pos+0] = r*0.5;
				result.data[pos+1] = g*0.5;
				result.data[pos+2] = b*0.5;
				result.data[pos+3] = a*0.5;
			}
		}

		// Vertical pass (hit every row)
		// Note: we're starting at 0,1 not (0,0)
		for(var iy=1; iy<yLimit; iy+=1){
			for(var ix=0; ix<xSize; ix+=1){
				// i can optomize the postion calc (ie +- change)
				// above
				pos = ((iy-1)*xSize+ix)*4;
				r = matrix[0]*pixels[pos+0];
				g = matrix[0]*pixels[pos+1];
				b = matrix[0]*pixels[pos+2];
				a = matrix[0]*pixels[pos+3];
				// middle
				pos += 4*xSize;
				r += matrix[1]*pixels[pos+0];
				g += matrix[1]*pixels[pos+1];
				b += matrix[1]*pixels[pos+2];
				a += matrix[1]*pixels[pos+3];
				// below
				pos += 4*xSize;
				r += matrix[2]*pixels[pos+0];
				g += matrix[2]*pixels[pos+1];
				b += matrix[2]*pixels[pos+2];
				a += matrix[2]*pixels[pos+3];
				// Store it
				pos -= 4*xSize;
				result.data[pos+0] += r*0.5;
				result.data[pos+1] += g*0.5;
				result.data[pos+2] += b*0.5;
				result.data[pos+3] += a*0.5;
			}
		}
		ctx.putImageData(result,x,y);
	};

	$gfxlib.filterFastConvolveN = function(x,y,xSize,ySize,n,matrix){
	/// Convolves the image with the matrix provided.
	/// x: int: the x location of the starting point of the center
	///    of the convolution matrix
	/// y: int: the y location of the starting point of the center
	///    of the convolution matrix
	/// xSize: int: the number of pixels horizontally to convolve
	/// ySize: int: the number of pixels vertically to convolve
	/// n: int: the width and height of the matrix, must be odd.
	///    For example, 5 means you will be supplying 5 values in
	///    your matrix
	/// matrix: array of n floats: the numbers that will 
	///         be multiplied and added to each pixel. It will
	///         be applied in 2 passes. First horizontally, then
	///         it will be rotated and applied vertically.

	// This method actually ignores the contribution of diagonal
	// elements
		var ctx = $gfxlib.canvasContext,
		    imageData = ctx.getImageData(x, y, xSize, ySize),
		    pixels = imageData.data,
		    nPixels = pixels.length,
		    result = ctx.createImageData(xSize, ySize),
		    pos = 0, r = 0, g = 0, b = 0, a = 0,
		    border = Math.floor(n/2),
		    yLimit = ySize -border,
		    xLimit = xSize -border;

		// Horizontal pass (ie convolving a row)
		for(var iy=0; iy<ySize; iy+=1){
			for(var ix=border; ix<xLimit; ix+=1){
				// i can optomize the postion calc (ie +- change)
				// left
				pos = (iy*xSize+ix-border)*4;
				r = 0; g = 0; b = 0; a = 0;
				for(var j=0; j<n; j+=1){
					pos += 4;
					r += matrix[j]*pixels[pos+0];
					g += matrix[j]*pixels[pos+1];
					b += matrix[j]*pixels[pos+2];
					a += matrix[j]*pixels[pos+3];
				}
				pos -= 4*border;
				result.data[pos+0] = r*0.5;
				result.data[pos+1] = g*0.5;
				result.data[pos+2] = b*0.5;
				result.data[pos+3] = a*0.5;
			}
		}

		// Verticle pass (ie convolving a column)
		for(var iy=border; iy<yLimit; iy+=1){
			for(var ix=0; ix<xSize; ix+=1){
				// i can optomize the postion calc (ie +- change)
				pos = ((iy-border)*xSize+ix)*4;
				r = 0; g = 0; b = 0; a = 0;
				for(var j=0; j<n; j+=1){
					pos += 4*xSize;
					r += matrix[j]*pixels[pos+0];
					g += matrix[j]*pixels[pos+1];
					b += matrix[j]*pixels[pos+2];
					a += matrix[j]*pixels[pos+3];
				}
				pos -= 4*border*xSize;
				result.data[pos+0] += r*0.5;
				result.data[pos+1] += g*0.5;
				result.data[pos+2] += b*0.5;
				result.data[pos+3] += a*0.5;
			}
		}

		ctx.putImageData(result,x,y);
	};

	$gfxlib.filterApplyToAll = function(filter,option){
	/// Applies a filter function to the entire canvas.
	/// filter: function: the function to apply to each pixel. It
	///         should accept 7 arguments in this order: x, y, r,
	///         g,b,a,o. It should return an array of 6 elements:
	///         [x,y,r,g,b,a,o]. Note that x,y in the result are not
	///         used for anything. x and y are passed relative to
	///         the starting x,y location (ie if you start at x=32
	///         then x=32 is passed as 0, x=33 is passed as 1, etc).
	///         r is the amount of red (0-255), g is green (0-255),
	///         b is blue (0-255), a is alpha (0.0-1.0), o is an
	///         object that have any data you want. It is the option
	///         argument of this function.
	/// options: object: an object that is passed to the filter
	///          function as the last argument.

		var ctx = $gfxlib.canvasContext,
		    xSize = $gfxlib.viewSizeX,
		    ySize = $gfxlib.viewSizeY,
		    imageData = ctx.getImageData(0, 0, xSize, ySize),
		    pixels = imageData.data,
		    nPixels = pixels.length,
		    result = ctx.createImageData(xSize, ySize),
		    pos = 0, r = 0, g = 0, b = 0, a = 0,
		    filteredPixel;

		for(var iy=0; iy<ySize; iy+=1){
			for(var ix=0; ix<xSize; ix+=1){
				pos = (iy*xSize+ix)*4;
				r = pixels[pos+0];
				g = pixels[pos+1];
				b = pixels[pos+2];
				a = pixels[pos+3];
				filteredPixel = filter(ix,iy,r,g,b,a,option);
				result.data[pos+0] = filteredPixel[2];
				result.data[pos+1] = filteredPixel[3];
				result.data[pos+2] = filteredPixel[4];
				result.data[pos+3] = filteredPixel[5];
			}
		}
		ctx.putImageData(result,0,0);
	};

	$gfxlib.filterApplyToRegion = function(x,y,xSize,ySize,filter,option){
	/// Applies a filter function to a region from x,y to
	/// x+xSize,y+ySize.
	/// x: int: the left edge of the region to filter
	/// y: int: the top edge of the region to filter
	/// xSize: int: the number of units to filter in the x direction
	/// ySize: int: the number of units to filter in the y direction
	/// filter: function: the function to apply to each pixel. It
	///         should accept 6 arguments in this order: x, y, r,
	///         g,b,a. It should return an array of 6 elements:
	///         [x,y,r,g,b,a]. Note that x,y in the result are not
	///         used for anything. x and y are passed relative to
	///         the starting x,y location (ie if you start at x=32
	///         then x=32 is passed as 0, x=33 is passed as 1, etc).
	/// options: object: an object that is passed to the filter
	///          function as the last argument.

		var ctx = $gfxlib.canvasContext,
		    imageData = ctx.getImageData(x, y, xSize, ySize),
		    pixels = imageData.data,
		    nPixels = pixels.length,
		    result = ctx.createImageData(xSize, ySize),
		    pos = 0, r = 0, g = 0, b = 0, a = 0,
		    filteredPixel;

		for(var iy=0; iy<ySize; iy+=1){
			for(var ix=0; ix<xSize; ix+=1){
				pos = (iy*xSize+ix)*4;
				r = pixels[pos+0];
				g = pixels[pos+1];
				b = pixels[pos+2];
				a = pixels[pos+3];
				filteredPixel = filter(ix,iy,r,g,b,a,option);
				result.data[pos+0] = filteredPixel[2];
				result.data[pos+1] = filteredPixel[3];
				result.data[pos+2] = filteredPixel[4];
				result.data[pos+3] = filteredPixel[5];
			}
		}
		ctx.putImageData(result,x,y);
	};

	$gfxlib.filterFuncInvert = function(x,y,r,g,b,a,o){
	/// Inverts the current RGB color channels, for example black -> white.
		return [x,y, 255-r, 255-g, 255-b, a, o];
	};

	$gfxlib.filterFuncNoRed = function(x,y,r,g,b,a,o){
	/// Returns the pixel with the red component removed.
		return [x,y,0,g,b,a,o];
	};
	$gfxlib.filterFuncNoGreen = function(x,y,r,g,b,a,o){
	/// Returns the pixel with the green component removed.
		return [x,y,r,0,b,a,o];
	};
	$gfxlib.filterFuncNoBlue = function(x,y,r,g,b,a,o){
	/// Returns the pixel with the blue component removed.
		return [x,y,r,g,0,a,o];
	};

	$gfxlib.filterFuncToLuma = function(x,y,r,g,b,a,o){
	/// Returns the luminance value of the pixel.
		//extract "luma" channel based on "Rec. 601"
		var luma  = 0.30 * r;
		luma += 0.59 * g;
		luma += 0.11 * b;
		return [x,y, luma,luma,luma, a,o];
	};

	$gfxlib.filterFuncColorSwap = function(x,y,r,g,b,a,o){
	/// Returns the pixel after an optional swap. There are a few
	/// required options.
	/// fR, fG, fB: int: the red, green and blue values (0-255)
	///             that we will be changing from.
	/// tR, tG, tB: int: the red, green and blue values (0-255)
	///             that we will change to.
	/// minDist: int: the minimum manhattan distance the colors must 
	///          be away froom each other to perform a swap (0-765)
	/// maxDist: int: the maxium manhattan distance the colors must 
	///          be away froom each other to perform a swap (0-765)
		var dR = r - o.fR,
		    dG = g - o.fG,
		    dB = b - o.fB,
		    dist = Math.abs(dR)+Math.abs(dG)+Math.abs(dB);
		    rR = r,
		    rG = g,
		    rB = b;
		if( o.minDist <= dist && dist <= o.maxDist ){
			rR = o.tR + dR;
			rG = o.tG + dG;
			rB = o.tB + dB;
		}
		return [x,y, rR,rG,rB, a,o];
	};

	$gfxlib.filterFuncShiftHue = function(x,y,r,g,b,a,o){
	/// Returns the pixel after an optional swap. There are a few
	/// required options.
	/// degrees: float: the number of degress (0-360) to rotate
	///          the hue.

		r /= 255; g /= 255; b /= 255;
		// http://en.wikipedia.org/wiki/HSL_and_HSV
		// Convert to HSL
		var max = Math.max(r,g,b),
		    min = Math.min(r,g,b),
		    chroma = max - min,
		    luminance = chroma / 2,
		    saturation = chroma / (1 - Math.abs(2*luminance-1)),
		    hue = 0;

		if( max == r ){ hue = ((g-b)/chroma) % 6; }else
		if( max == g ){ hue =  (b-r)/chroma  + 2; }else
		if( max == b ){ hue =  (r-g)/chroma  + 4; }

		hue *= 60;
		hue %= 360;
		
		// Shift hue
		hue += o.degrees;
		hue %= 360;
		//hue /= 360;

		// hsl to rgb:
		hue /= 60;
		var rR = 0, rG = 0, rB = 0,
		    //chroma = saturation*(1 - Math.abs(2*luminance - 1)),
		    tmp = chroma * (1-Math.abs(hue % 2 - 1)),
		    m = luminance - chroma/2;

		if( 0 <= hue && hue < 1 ){ rR = chroma; rG = tmp; }else
		if( 1 <= hue && hue < 2 ){ rG = chroma; rR = tmp; }else
		if( 2 <= hue && hue < 3 ){ rG = chroma; rB = tmp; }else
		if( 3 <= hue && hue < 4 ){ rB = chroma; rG = tmp; }else
		if( 4 <= hue && hue < 5 ){ rB = chroma; rR = tmp; }else
		if( 5 <= hue && hue < 6 ){ rR = chroma; rB = tmp; }

		rR += m; rG += m; rB += m;
		rR = (255*rR);
		rG = (255*rG);
		rB = (255*rB);

		return [x,y, rR,rG,rB, a, o];
	};

	return $gfxlib;
}({}));

