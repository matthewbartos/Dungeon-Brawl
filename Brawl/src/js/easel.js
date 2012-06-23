//DisplayObject, Container, Graphics, Matrix2D, Stage, UID, MouseEvent, Shape


(function(window) {



/**
* Represents an affine transformation matrix, and provides tools for constructing and concatenating matrixes.
* @class Matrix2D
* @constructor
* @param {Number} a Specifies the a property for the new matrix.
* @param {Number} b Specifies the b property for the new matrix.
* @param {Number} c Specifies the c property for the new matrix.
* @param {Number} d Specifies the d property for the new matrix.
* @param {Number} tx Specifies the tx property for the new matrix.
* @param {Number} ty Specifies the ty property for the new matrix.
**/
var Matrix2D = function(a, b, c, d, tx, ty) {
  this.initialize(a, b, c, d, tx, ty);
}
var p = Matrix2D.prototype;

// static public properties:

	/**
	 * An identity matrix, representing a null transformation. Read-only.
	 * @property identity
	 * @static
	 * @type Matrix2D
	 **/
	Matrix2D.identity = null; // set at bottom of class definition.

	/**
	 * Multiplier for converting degrees to radians. Used internally by Matrix2D. Read-only.
	 * @property DEG_TO_RAD
	 * @static
	 * @final
	 * @type Number
	 **/
	Matrix2D.DEG_TO_RAD = Math.PI/180;


// public properties:
	/**
	 * Position (0, 0) in a 3x3 affine transformation matrix.
	 * @property a
	 * @type Number
	 **/
	p.a = 1;

	/**
	 * Position (0, 1) in a 3x3 affine transformation matrix.
	 * @property b
	 * @type Number
	 **/
	p.b = 0;

	/**
	 * Position (1, 0) in a 3x3 affine transformation matrix.
	 * @property c
	 * @type Number
	 **/
	p.c = 0;

	/**
	 * Position (1, 1) in a 3x3 affine transformation matrix.
	 * @property d
	 * @type Number
	 **/
	p.d = 1;

	/**
	 * Position (2, 0) in a 3x3 affine transformation matrix.
	 * @property atx
	 * @type Number
	 **/
	p.tx = 0;

	/**
	 * Position (2, 1) in a 3x3 affine transformation matrix.
	 * @property ty
	 * @type Number
	 **/
	p.ty = 0;

	/**
	 * Property representing the alpha that will be applied to a display object. This is not part of matrix
	 * operations, but is used for operations like getConcatenatedMatrix to provide concatenated alpha values.
	 * @property alpha
	 * @type Number
	 **/
	p.alpha = 1;

	/**
	 * Property representing the shadow that will be applied to a display object. This is not part of matrix
	 * operations, but is used for operations like getConcatenatedMatrix to provide concatenated shadow values.
	 * @property shadow
	 * @type Shadow
	 **/
	p.shadow  = null;

	/**
	 * Property representing the compositeOperation that will be applied to a display object. This is not part of
	 * matrix operations, but is used for operations like getConcatenatedMatrix to provide concatenated
	 * compositeOperation values. You can find a list of valid composite operations at:
	 * <a href="https://developer.mozilla.org/en/Canvas_tutorial/Compositing">https://developer.mozilla.org/en/Canvas_tutorial/Compositing</a>
	 * @property compositeOperation
	 * @type String
	 **/
	p.compositeOperation  = null;

// constructor:
	/**
	 * Initialization method.
	 * @method initialize
	 * @protected
	*/
	p.initialize = function(a, b, c, d, tx, ty) {
		if (a != null) { this.a = a; }
		this.b = b || 0;
		this.c = c || 0;
		if (d != null) { this.d = d; }
		this.tx = tx || 0;
		this.ty = ty || 0;
	}

// public methods:
	/**
	 * Concatenates the specified matrix properties with this matrix. All parameters are required.
	 * @method prepend
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 **/
	p.prepend = function(a, b, c, d, tx, ty) {
		var tx1 = this.tx;
		if (a != 1 || b != 0 || c != 0 || d != 1) {
			var a1 = this.a;
			var c1 = this.c;
			this.a  = a1*a+this.b*c;
			this.b  = a1*b+this.b*d;
			this.c  = c1*a+this.d*c;
			this.d  = c1*b+this.d*d;
		}
		this.tx = tx1*a+this.ty*c+tx;
		this.ty = tx1*b+this.ty*d+ty;
	}

	/**
	 * Appends the specified matrix properties with this matrix. All parameters are required.
	 * @method append
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 **/
	p.append = function(a, b, c, d, tx, ty) {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;

		this.a  = a*a1+b*c1;
		this.b  = a*b1+b*d1;
		this.c  = c*a1+d*c1;
		this.d  = c*b1+d*d1;
		this.tx = tx*a1+ty*c1+this.tx;
		this.ty = tx*b1+ty*d1+this.ty;
	}

	/**
	 * Prepends the specified matrix with this matrix.
	 * @method prependMatrix
	 * @param {Matrix2D} matrix
	 **/
	p.prependMatrix = function(matrix) {
		this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		this.prependProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
	}

	/**
	 * Appends the specified matrix with this matrix.
	 * @method appendMatrix
	 * @param {Matrix2D} matrix
	 **/
	p.appendMatrix = function(matrix) {
		this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		this.appendProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
	}

	/**
	 * Generates matrix properties from the specified display object transform properties, and prepends them with this matrix.
	 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
	 * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method prependTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX Optional.
	 * @param {Number} regY Optional.
	 **/
	p.prependTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		if (rotation%360) {
			var r = rotation*Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (regX || regY) {
			// append the registration offset:
			this.tx -= regX; this.ty -= regY;
		}
		if (skewX || skewY) {
			// TODO: can this be combined into a single prepend operation?
			skewX *= Matrix2D.DEG_TO_RAD;
			skewY *= Matrix2D.DEG_TO_RAD;
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
			this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
		} else {
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}

	}

	/**
	 * Generates matrix properties from the specified display object transform properties, and appends them with this matrix.
	 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
	 * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method appendTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX Optional.
	 * @param {Number} regY Optional.
	 **/
	p.appendTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		if (rotation%360) {
			var r = rotation*Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single append?
			skewX *= Matrix2D.DEG_TO_RAD;
			skewY *= Matrix2D.DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
		} else {
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}

		if (regX || regY) {
			// prepend the registration offset:
			this.tx -= regX*this.a+regY*this.c; 
			this.ty -= regX*this.b+regY*this.d;
		}
	}

	/**
	 * Applies a rotation transformation to the matrix.
	 * @method rotate
	 * @param {Number} angle The angle in degrees.
	 **/
	p.rotate = function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var a1 = this.a;
		var c1 = this.c;
		var tx1 = this.tx;

		this.a = a1*cos-this.b*sin;
		this.b = a1*sin+this.b*cos;
		this.c = c1*cos-this.d*sin;
		this.d = c1*sin+this.d*cos;
		this.tx = tx1*cos-this.ty*sin;
		this.ty = tx1*sin+this.ty*cos;
	}

	/**
	 * Applies a skew transformation to the matrix.
	 * @method skew
	 * @param {Number} skewX The amount to skew horizontally in degrees.
	 * @param {Number} skewY The amount to skew vertically in degrees.
	*/
	p.skew = function(skewX, skewY) {
		skewX = skewX*Matrix2D.DEG_TO_RAD;
		skewY = skewY*Matrix2D.DEG_TO_RAD;
		this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
	}

	/**
	 * Applies a scale transformation to the matrix.
	 * @method scale
	 * @param {Number} x
	 * @param {Number} y
	 **/
	p.scale = function(x, y) {
		this.a *= x;
		this.d *= y;
		this.tx *= x;
		this.ty *= y;
	}

	/**
	 * Translates the matrix on the x and y axes.
	 * @method translate
	 * @param {Number} x
	 * @param {Number} y
	 **/
	p.translate = function(x, y) {
		this.tx += x;
		this.ty += y;
	}

	/**
	 * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
	 * @method identity
	 **/
	p.identity = function() {
		this.alpha = this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;
		this.shadow = this.compositeOperation = null;
	}

	/**
	 * Inverts the matrix, causing it to perform the opposite transformation.
	 * @method invert
	 **/
	p.invert = function() {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1*d1-b1*c1;

		this.a = d1/n;
		this.b = -b1/n;
		this.c = -c1/n;
		this.d = a1/n;
		this.tx = (c1*this.ty-d1*tx1)/n;
		this.ty = -(a1*this.ty-b1*tx1)/n;
	}

	/**
	 * Returns true if the matrix is an identity matrix.
	 * @method isIdentity
	 * @returns Boolean
	 **/
	p.isIdentity = function() {
		return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
	}

	/**
	 * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that this these values
	 * may not match the transform properties you used to generate the matrix, though they will produce the same visual
	 * results.
	 * @method decompose
	 * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
	*/
	p.decompose = function(target) {
		// TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation
		// even when scale is negative
		if (target == null) { target = {}; }
		target.x = this.tx;
		target.y = this.ty;
		target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
		target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

		var skewX = Math.atan2(-this.c, this.d);
		var skewY = Math.atan2(this.b, this.a);

		if (skewX == skewY) {
			target.rotation = skewY/Matrix2D.DEG_TO_RAD;
			if (this.a < 0 && this.d >= 0) {
				target.rotation += (target.rotation <= 0) ? 180 : -180;
			}
			target.skewX = target.skewY = 0;
		} else {
			target.skewX = skewX/Matrix2D.DEG_TO_RAD;
			target.skewY = skewY/Matrix2D.DEG_TO_RAD;
		}
		return target;
	}

	/**
	 * Reinitializes all matrix properties to those specified.
	 * @method appendProperties
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @param {Number} alpha desired alpha value
	 * @param {Shadow} shadow desired shadow value
	 * @param {String} compositeOperation desired composite operation value
	*/
	p.reinitialize = function(a,b,c,d,tx,ty,alpha,shadow,compositeOperation) {
		this.initialize(a,b,c,d,tx,ty);
		this.alpha = alpha || 1;
		this.shadow = shadow;
		this.compositeOperation = compositeOperation;
		return this;
	}

	/**
	 * Appends the specified visual properties to the current matrix.
	 * @method appendProperties
	 * @param {Number} alpha desired alpha value
	 * @param {Shadow} shadow desired shadow value
	 * @param {String} compositeOperation desired composite operation value
	*/
	p.appendProperties = function(alpha, shadow, compositeOperation) {
		this.alpha *= alpha;
		this.shadow = shadow || this.shadow;
		this.compositeOperation = compositeOperation || this.compositeOperation;
	}

	/**
	 * Prepends the specified visual properties to the current matrix.
	 * @method prependProperties
	 * @param {Number} alpha desired alpha value
	 * @param {Shadow} shadow desired shadow value
	 * @param {String} compositeOperation desired composite operation value
	*/
	p.prependProperties = function(alpha, shadow, compositeOperation) {
		this.alpha *= alpha;
		this.shadow = this.shadow || shadow;
		this.compositeOperation = this.compositeOperation || compositeOperation;
	}

	/**
	 * Returns a clone of the Matrix2D instance.
	 * @method clone
	 * @return {Matrix2D} a clone of the Matrix2D instance.
	 **/
	p.clone = function() {
		var mtx = new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
		mtx.shadow = this.shadow;
		mtx.alpha = this.alpha;
		mtx.compositeOperation = this.compositeOperation;
		return mtx;
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Matrix2D (a="+this.a+" b="+this.b+" c="+this.c+" d="+this.d+" tx="+this.tx+" ty="+this.ty+")]";
	}

	// this has to be populated after the class is defined:
	Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);

window.Matrix2D = Matrix2D;
}(window));

(function(window) {

/**
* This is passed as the parameter to onPress, onMouseMove, onMouseUp, onMouseDown, and onClick handlers on
* DisplayObject instances.
* By default, mouse events are disabled for performance reasons. In order to enabled them for a specified stage
* set mouseEventsEnabled to true on your stage instance.
* @class MouseEvent
* @constructor
* @param {String} type The event type.
* @param {Number} stageX The mouseX position relative to the stage.
* @param {Number} stageY The mouseY position relative to the stage.
* @param {DisplayObject} target The display object this event relates to.
* @param {MouseEvent} nativeEvent The native DOM event related to this mouse event.
**/
var MouseEvent = function(type, stageX, stageY, target, nativeEvent) {
  this.initialize(type, stageX, stageY, target, nativeEvent);
}
var p = MouseEvent.prototype;

// public properties:

	/**
	 * The mouseX position on the stage.
	 * @property stageX
	 * @type Number
	*/
	p.stageX = 0;

	/**
	 * The mouseY position on the stage.
	 * @property stageY
	 * @type Number
	 **/
	p.stageY = 0;

	/**
	 * The type of mouse event. This will be the same as the handler it maps to (onPress,
	 * onMouseDown, onMouseUp, onMouseMove, or onClick).
	 * @property type
	 * @type String
	 **/
	p.type = null;

	/**
	 * The native MouseEvent generated by the browser. The properties and API for this
	 * event may differ between browsers. This property will be null if the
	 * EaselJS property was not directly generated from a native MouseEvent.
	 * @property nativeEvent
	 * @type MouseEvent
	 * @default null
	 **/
	p.nativeEvent = null;

	/**
	 * For events of type "onPress" and "onMouseDown" only you can assign a handler to the onMouseMove
	 * property. This handler will be called every time the mouse is moved until the mouse is released.
	 * This is useful for operations such as drag and drop.
	 * @event onMouseMove
	 * @param {MouseEvent} event A MouseEvent instance with information about the current mouse event.
	 **/
	p.onMouseMove = null;

	/**
	 * For events of type "onPress" and "onMouseDown" only you can assign a handler to the onMouseUp
	 * property. This handler will be called every time the mouse is moved until the mouse is released.
	 * This is useful for operations such as drag and drop.
	 * @event onMouseUp
	 * @param {MouseEvent} event A MouseEvent instance with information about the current mouse event.
	*/
	p.onMouseUp = null;

	/**
	 * The display object this event relates to.
	 * @property target
	 * @type DisplayObject
	 * @default null
	*/
	p.target = null;

// constructor:
	/**
	 * Initialization method.
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(type, stageX, stageY, target, nativeEvent) {
		this.type = type;
		this.stageX = stageX;
		this.stageY = stageY;
		this.target = target;
		this.nativeEvent = nativeEvent;
	}

// public methods:
	/**
	 * Returns a clone of the MouseEvent instance.
	 * @method clone
	 * @return {MouseEvent} a clone of the MouseEvent instance.
	 **/
	p.clone = function() {
		return new MouseEvent(this.type, this.stageX, this.stageY, this.target, this.nativeEvent);
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[MouseEvent (type="+this.type+" stageX="+this.stageX+" stageY="+this.stageY+")]";
	}

window.MouseEvent = MouseEvent;
}(window));

(function(window) {


/**
* Global utility for generating sequential unique ID numbers.
* The UID class uses a static interface (ex. UID.get()) and should not be instantiated.
* @class UID
* @static
**/
var UID = function() {
	throw "UID cannot be instantiated";
}

	/**
	 * @property _nextID
	 * @type Number
	 * @protected
	 **/
	UID._nextID = 0;

	/**
	 * Returns the next unique id.
	 * @method get
	 * @return {Number} The next unique id
	 * @static
	 **/
	UID.get = function() {
		return UID._nextID++;
	}

window.UID = UID;
}(window));

(function(window) {


/**
* DisplayObject is an abstract class that should not be constructed directly. Instead construct subclasses such as
* Sprite, Bitmap, and Shape. DisplayObject is the base class for all display classes in the CanvasDisplay library.
* It defines the core properties and methods that are shared between all display objects.
* @class DisplayObject
* @constructor
**/
var DisplayObject = function() {
  this.initialize();
}
var p = DisplayObject.prototype;

	/**
	 * Suppresses errors generated when using features like hitTest, onPress/onClick, and getObjectsUnderPoint with cross
	 * domain content
	 * @property suppressCrossDomainErrors
	 * @static
	 * @type Boolean
	 * @default false
	 **/
	DisplayObject.suppressCrossDomainErrors = false;

	/**
	 * @property _hitTestCanvas
	 * @type HTMLCanvasElement
	 * @static
	 * @protected
	 **/
	DisplayObject._hitTestCanvas = document.createElement("canvas");
	DisplayObject._hitTestCanvas.width = DisplayObject._hitTestCanvas.height = 1;

	/**
	 * @property _hitTestContext
	 * @type CanvasRenderingContext2D
	 * @static
	 * @protected
	 **/
	DisplayObject._hitTestContext = DisplayObject._hitTestCanvas.getContext("2d");

	/**
	 * @property _nextCacheID
	 * @type Number
	 * @static
	 * @protected
	 **/
	DisplayObject._nextCacheID = 1;

	/**
	 * The alpha (transparency) for this display object. 0 is fully transparent, 1 is fully opaque.
	 * @property alpha
	 * @type Number
	 * @default 1
	 **/
	p.alpha = 1;

	/**
	 * If a cache is active, this returns the canvas that holds the cached version of this display object. See cache()
	 * for more information. READ-ONLY.
	 * @property cacheCanvas
	 * @type HTMLCanvasElement
	 * @default null
	 **/
	p.cacheCanvas = null;

	/**
	 * Unique ID for this display object. Makes display objects easier for some uses.
	 * @property id
	 * @type Number
	 * @default -1
	 **/
	p.id = -1;

	/**
	 * Indicates whether to include this object when running Stage.getObjectsUnderPoint(). Setting this to true for
	 * Sprites will cause the Sprite to be returned (not its children) regardless of whether it's mouseChildren property
	 * is true.
	 * @property mouseEnabled
	 * @type Boolean
	 * @default true
	 **/
	p.mouseEnabled = true;

	/**
	 * An optional name for this display object. Included in toString(). Useful for debugging.
	 * @property name
	 * @type String
	 * @default null
	 **/
	p.name = null;

	/**
	 * A reference to the Sprite or Stage object that contains this display object, or null if it has not been added to
	 * one. READ-ONLY.
	 * @property parent
	 * @final
	 * @type DisplayObject
	 * @default null
	 **/
	p.parent = null;

	/**
	 * The x offset for this display object's registration point. For example, to make a 100x100px Bitmap rotate around
	 * it's center, you would set regX and regY to 50.
	 * @property regX
	 * @type Number
	 * @default 0
	 **/
	p.regX = 0;

	/**
	 * The y offset for this display object's registration point. For example, to make a 100x100px Bitmap rotate around
	 * it's center, you would set regX and regY to 50.
	 * @property regY
	 * @type Number
	 * @default 0
	 **/
	p.regY = 0;

	/**
	 * The rotation in degrees for this display object.
	 * @property rotation
	 * @type Number
	 * @default 0
	 **/
	p.rotation = 0;

	/**
	 * The factor to stretch this display object horizontally. For example, setting scaleX to 2 will stretch the display
	 * object to twice it's nominal width.
	 * @property scaleX
	 * @type Number
	 * @default 1
	 **/
	p.scaleX = 1;

	/**
	 * The factor to stretch this display object vertically. For example, setting scaleY to 0.5 will stretch the display
	 * object to half it's nominal height.
	 * @property scaleY
	 * @type Number
	 * @default 1
	 **/
	p.scaleY = 1;

	/**
	 * The factor to skew this display object horizontally.
	 * @property skewX
	 * @type Number
	 * @default 0
	 **/
	p.skewX = 0;

	/**
	 * The factor to skew this display object vertically.
	 * @property skewY
	 * @type Number
	 * @default 0
	 **/
	p.skewY = 0;

	/**
	 * A shadow object that defines the shadow to render on this display object. Set to null to remove a shadow. If
	 * null, this property is inherited from the parent container.
	 * @property shadow
	 * @type Shadow
	 * @default null
	 **/
	p.shadow = null;

	/**
	 * Indicates whether this display object should be rendered to the canvas and included when running
	 * Stage.getObjectsUnderPoint().
	 * @property visible
	 * @type Boolean
	 * @default true
	 **/
	p.visible = true;

	/**
	 * The x (horizontal) position of the display object, relative to its parent.
	 * @property x
	 * @type Number
	 * @default 0
	 **/
	p.x = 0;

	/** The y (vertical) position of the display object, relative to its parent.
	 * @property y
	 * @type Number
	 * @default 0
	 **/
	p.y = 0;

	/**
	 * The composite operation indicates how the pixels of this display object will be composited with the elements
	 * behind it. If null, this property is inherited from the parent container. For more information, read the
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#compositing">
	 * whatwg spec on compositing</a>.
	 * @property compositeOperation
	 * @type String
	 * @default null
	 **/
	p.compositeOperation = null;

	/**
	 * Indicates whether the display object should have it's x & y position rounded prior to drawing it to stage.
	 * This only applies if the enclosing stage has snapPixelsEnabled set to true, and the display object's composite
	 * transform does not include any scaling, rotation, or skewing. The snapToPixel property is true by default for
	 * Bitmap and BitmapAnimation instances, and false for all other display objects.
	 * @property snapToPixel
	 * @type Boolean
	 * @default false
	 **/
	p.snapToPixel = false;

	/**
	 * The onPress callback is called when the user presses down on their mouse over this display object. The handler
	 * is passed a single param containing the corresponding MouseEvent instance. You can subscribe to the onMouseMove
	 * and onMouseUp callbacks of the event object to receive these events until the user releases the mouse button.
	 * If an onPress handler is set on a container, it will receive the event if any of its children are clicked.
	 * @event onPress
	 * @param {MouseEvent} event MouseEvent with information about the event.
	 **/
	p.onPress = null;

	/**
	 * The onClick callback is called when the user presses down on and then releases the mouse button over this
	 * display object. The handler is passed a single param containing the corresponding MouseEvent instance. If an
	 * onClick handler is set on a container, it will receive the event if any of its children are clicked.
	 * @event onClick
	 * @param {MouseEvent} event MouseEvent with information about the event.
	 **/
	p.onClick = null;

	/**
	 * The onDoubleClick callback is called when the user double clicks over this display object. The handler is
	 * passed a single param containing the corresponding MouseEvent instance. If an onDoubleClick handler is set
	 * on a container, it will receive the event if any of its children are clicked.
	 * @event onDoubleClick
	 * @param {MouseEvent} event MouseEvent with information about the event.
	 **/
	p.onDoubleClick = null;

	/**
	 * The onMouseOver callback is called when the user rolls over the display object. You must enable this event using
	 * stage.enableMouseOver(). The handler is passed a single param containing the corresponding MouseEvent instance.
	 * @event onMouseOver
	 * @param {MouseEvent} event MouseEvent with information about the event.
	 **/
	p.onMouseOver = null;

	/**
	 * The onMouseOut callback is called when the user rolls off of the display object. You must enable this event using
	 * stage.enableMouseOver(). The handler is passed a single param containing the corresponding MouseEvent instance.
	 * @event onMouseOut
	 * @param {MouseEvent} event MouseEvent with information about the event.
	 **/
	p.onMouseOut = null;

	/**
	 * The onTick callback is called on each display object on a stage whenever the stage updates.
	 * This occurs immediately before the rendering (draw) pass.
	 * @event onTick
	 **/
	p.onTick = null;

	/**
	 * An array of Filter objects to apply to this display object. Filters are only applied / updated when cache() or
	 * updateCache() is called on the display object, and only apply to the area that is cached.
	 * @property filters
	 * @type Array[Filter]
	 * @default null
	 **/
	p.filters = null;

	/**
	* Returns an ID number that uniquely identifies the current cache for this display object.
	* This can be used to determine if the cache has changed since a previous check.
	* @property cacheID
	* @type Number
	* @default 0
	*/
	p.cacheID = 0;

// private properties:

	/**
	 * @property _cacheOffsetX
	 * @protected
	 * @type Number
	 * @default 0
	 **/
	p._cacheOffsetX = 0;

	/**
	 * @property _cacheOffsetY
	 * @protected
	 * @type Number
	 * @default 0
	 **/
	p._cacheOffsetY = 0;

	/**
	* @property _cacheDataURLID
	* @protected
	* @type Number
	* @default 0
	*/
	p._cacheDataURLID = 0;
	
	/**
	* @property _cacheDataURL
	* @protected
	* @type String
	* @default null
	*/
	p._cacheDataURL = null;

	/**
	 * @property _matrix
	 * @protected
	 * @type Matrix2D
	 * @default null
	 **/
	p._matrix = null;

// constructor:
	// separated so it can be easily addressed in subclasses:

	/**
	 * Initialization method.
	 * @method initialize
	 * @protected
	*/
	p.initialize = function() {
		this.id = UID.get();
		this._matrix = new Matrix2D();
	}

// public methods:
	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0;
	}

	/**
	 * Draws the display object into the specified context ignoring it's visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (ignoreCache || !this.cacheCanvas) { return false; }
		ctx.drawImage(this.cacheCanvas, this._cacheOffsetX, this._cacheOffsetY);
		return true;
	}

	/**
	 * Draws the display object into a new canvas, which is then used for subsequent draws. For complex content
	 * that does not change frequently (ex. a Sprite with many children that do not move, or a complex vector Shape),
	 * this can provide for much faster rendering because the content does not need to be re-rendered each tick. The
	 * cached display object can be moved, rotated, faded, etc freely, however if it's content changes, you must manually
	 * update the cache by calling updateCache() or cache() again. You must specify the cache area via the x, y, w,
	 * and h parameters. This defines the rectangle that will be rendered and cached using this display object's
	 * coordinates. For example if you defined a Shape that drew a circle at 0, 0 with a radius of 25, you could call
	 * myShape.cache(-25, -25, 50, 50) to cache the full shape.
	 * @method cache
	 * @param {Number} x The x coordinate origin for the cache region.
	 * @param {Number} y The y coordinate origin for the cache region.
	 * @param {Number} width The width of the cache region.
	 * @param {Number} height The height of the cache region.
	 **/
	p.cache = function(x, y, width, height) {
		// draw to canvas.
		var cacheCanvas = this.cacheCanvas;
		if (cacheCanvas == null) { cacheCanvas = this.cacheCanvas = document.createElement("canvas"); }
		var ctx = cacheCanvas.getContext("2d");
		cacheCanvas.width = width;
		cacheCanvas.height = height;
		ctx.setTransform(1, 0, 0, 1, -x, -y);
		ctx.clearRect(x, y, cacheCanvas.width, cacheCanvas.height); // some browsers don't clear correctly.
		this.draw(ctx, true, this._matrix.reinitialize(1,0,0,1,-x,-y)); // containers require the matrix to work from
		this._cacheOffsetX = x;
		this._cacheOffsetY = y;
		this._applyFilters();
		this.cacheID = DisplayObject._nextCacheID++;
	}

	/**
	 * Redraws the display object to its cache. Calling updateCache without an active cache will throw an error.
	 * If compositeOperation is null the current cache will be cleared prior to drawing. Otherwise the display object
	 * will be drawn over the existing cache using the specified compositeOperation.
	 * @method updateCache
	 * @param {String} compositeOperation The compositeOperation to use, or null to clear the cache and redraw it.
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#compositing">
	 * whatwg spec on compositing</a>.
	 **/
	p.updateCache = function(compositeOperation) {
		var cacheCanvas = this.cacheCanvas, offX = this._cacheOffsetX, offY = this._cacheOffsetY;
		if (cacheCanvas == null) { throw "cache() must be called before updateCache()"; }
		var ctx = cacheCanvas.getContext("2d");
		ctx.setTransform(1, 0, 0, 1, -offX, -offY);
		if (!compositeOperation) {
			ctx.clearRect(offX, offY, cacheCanvas.width, cacheCanvas.height);
		} else { ctx.globalCompositeOperation = compositeOperation; }
		this.draw(ctx, true);
		if (compositeOperation) { ctx.globalCompositeOperation = "source-over"; }
		this._applyFilters();
		this.cacheID = DisplayObject._nextCacheID++;
	}

	/**
	 * Clears the current cache. See cache() for more information.
	 * @method uncache
	 **/
	p.uncache = function() {
		this._cacheDataURL = this.cacheCanvas = null;
		this.cacheID = this._cacheOffsetX = this._cacheOffsetY = 0;
	}
	
	/**
	* Returns a data URL for the cache, or null if this display object is not cached.
	* Uses cacheID to ensure a new data URL is not generated if the cache has not changed.
	* @method getCacheDataURL.
	**/
	p.getCacheDataURL = function() {
		if (!this.cacheCanvas) { return null; }
		if (this.cacheID != this._cacheDataURLID) { this._cacheDataURL = this.cacheCanvas.toDataURL(); }
		return this._cacheDataURL;
	}

	/**
	 * Returns the stage that this display object will be rendered on, or null if it has not been added to one.
	 * @method getStage
	 * @return {Stage} The Stage instance that the display object is a descendent of. null if the DisplayObject has not
	 * been added to a Stage.
	 **/
	p.getStage = function() {
		var o = this;
		while (o.parent) {
			o = o.parent;
		}
		if (o instanceof Stage) { return o; }
		return null;
	}

	/**
	 * Transforms the specified x and y position from the coordinate space of the display object
	 * to the global (stage) coordinate space. For example, this could be used to position an HTML label
	 * over a specific point on a nested display object. Returns a Point instance with x and y properties
	 * correlating to the transformed coordinates on the stage.
	 * @method localToGlobal
	 * @param {Number} x The x position in the source display object to transform.
	 * @param {Number} y The y position in the source display object to transform.
	 * @return {Point} A Point instance with x and y properties correlating to the transformed coordinates
	 * on the stage.
	 **/
	p.localToGlobal = function(x, y) {
		var mtx = this.getConcatenatedMatrix(this._matrix);
		if (mtx == null) { return null; }
		mtx.append(1, 0, 0, 1, x, y);
		return new Point(mtx.tx, mtx.ty);
	}

	/**
	 * Transforms the specified x and y position from the global (stage) coordinate space to the
	 * coordinate space of the display object. For example, this could be used to determine
	 * the current mouse position within the display object. Returns a Point instance with x and y properties
	 * correlating to the transformed position in the display object's coordinate space.
	 * @method globalToLocal
	 * @param {Number} x The x position on the stage to transform.
	 * @param {Number} y The y position on the stage to transform.
	 * @return {Point} A Point instance with x and y properties correlating to the transformed position in the
	 * display object's coordinate space.
	 **/
	p.globalToLocal = function(x, y) {
		var mtx = this.getConcatenatedMatrix(this._matrix);
		if (mtx == null) { return null; }
		mtx.invert();
		mtx.append(1, 0, 0, 1, x, y);
		return new Point(mtx.tx, mtx.ty);
	}

	/**
	 * Transforms the specified x and y position from the coordinate space of this display object to the
	 * coordinate space of the target display object. Returns a Point instance with x and y properties
	 * correlating to the transformed position in the target's coordinate space. Effectively the same as calling
	 * var pt = this.localToGlobal(x, y); pt = target.globalToLocal(pt.x, pt.y);
	 * @method localToLocal
	 * @param {Number} x The x position in the source display object to transform.
	 * @param {Number} y The y position on the stage to transform.
	 * @param {DisplayObject} target The target display object to which the coordinates will be transformed.
	 * @return {Point} Returns a Point instance with x and y properties correlating to the transformed position
	 * in the target's coordinate space.
	 **/
	p.localToLocal = function(x, y, target) {
		var pt = this.localToGlobal(x, y);
		return target.globalToLocal(pt.x, pt.y);
	}

	/**
	 * Shortcut method to quickly set the transform properties on the display object. All parameters are optional.
	 * Omitted parameters will have the default value set (ex. 0 for x/y, 1 for scaleX/Y).
	 * @method setTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX
	 * @param {Number} regY
	*/
	p.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		this.x = x || 0;
		this.y = y || 0;
		this.scaleX = scaleX == null ? 1 : scaleX;
		this.scaleY = scaleY == null ? 1 : scaleY;
		this.rotation = rotation || 0;
		this.skewX = skewX || 0;
		this.skewY = skewY || 0;
		this.regX = regX || 0;
		this.regY = regY || 0;
	}

	/**
	 * Generates a concatenated Matrix2D object representing the combined transform of
	 * the display object and all of its parent Containers up to the highest level ancestor
	 * (usually the stage). This can be used to transform positions between coordinate spaces,
	 * such as with localToGlobal and globalToLocal.
	 * @method getConcatenatedMatrix
	 * @param {Matrix2D} mtx Optional. A Matrix2D object to populate with the calculated values. If null, a new
	 * Matrix object is returned.
	 * @return {Matrix2D} a concatenated Matrix2D object representing the combined transform of
	 * the display object and all of its parent Containers up to the highest level ancestor (usually the stage).
	 **/
	p.getConcatenatedMatrix = function(mtx) {
		if (mtx) { mtx.identity(); }
		else { mtx = new Matrix2D(); }
		var target = this;
		while (target != null) {
			mtx.prependTransform(target.x, target.y, target.scaleX, target.scaleY, target.rotation, target.skewX,
									target.skewY, target.regX, target.regY);
			mtx.prependProperties(target.alpha, target.shadow, target.compositeOperation);
			target = target.parent;
		}
		return mtx;
	}

	/**
	 * Tests whether the display object intersects the specified local point (ie. draws a pixel with alpha > 0 at
	 * the specified position). This ignores the alpha, shadow and compositeOperation of the display object, and all
	 * transform properties including regX/Y.
	 * @method hitTest
	 * @param {Number} x The x position to check in the display object's local coordinates.
	 * @param {Number} y The y position to check in the display object's local coordinates.
	 * @return {Boolean} A Boolean indicting whether a visible portion of the DisplayObject intersect the specified
	 * local Point.
	*/
	p.hitTest = function(x, y) {
		var ctx = DisplayObject._hitTestContext;
		var canvas = DisplayObject._hitTestCanvas;

		ctx.setTransform(1,  0, 0, 1, -x, -y);
		this.draw(ctx);

		var hit = this._testHit(ctx);

		canvas.width = 0;
		canvas.width = 1;
		return hit;
	}

	/**
	 * Returns a clone of this DisplayObject. Some properties that are specific to this instance's current context are
	 * reverted to their defaults (for example .parent).
	 * @method clone
	 @return {DisplayObject} A clone of the current DisplayObject instance.
	 **/
	p.clone = function() {
		var o = new DisplayObject();
		this.cloneProps(o);
		return o;
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[DisplayObject (name="+  this.name +")]";
	}

// private methods:

	// separated so it can be used more easily in subclasses:
	/**
	 * @method cloneProps
	 * @protected
	 * @param {DisplayObject} o The DisplayObject instance which will have properties from the current DisplayObject
	 * instance copied into.
	 **/
	p.cloneProps = function(o) {
		o.alpha = this.alpha;
		o.name = this.name;
		o.regX = this.regX;
		o.regY = this.regY;
		o.rotation = this.rotation;
		o.scaleX = this.scaleX;
		o.scaleY = this.scaleY;
		o.shadow = this.shadow;
		o.skewX = this.skewX;
		o.skewY = this.skewY;
		o.visible = this.visible;
		o.x  = this.x;
		o.y = this.y;
		o.mouseEnabled = this.mouseEnabled;
		o.compositeOperation = this.compositeOperation;
		if (this.cacheCanvas) {
			o.cacheCanvas = this.cacheCanvas.cloneNode(true);
			o.cacheCanvas.getContext("2d").putImageData(this.cacheCanvas.getContext("2d").getImageData(0,0,this.cacheCanvas.width,this.cacheCanvas.height),0,0);
		}
	}

	/**
	 * @method applyShadow
	 * @protected
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Shadow} shadow
	 **/
	p.applyShadow = function(ctx, shadow) {
		shadow = shadow || Shadow.identity;
		ctx.shadowColor = shadow.color;
		ctx.shadowOffsetX = shadow.offsetX;
		ctx.shadowOffsetY = shadow.offsetY;
		ctx.shadowBlur = shadow.blur;
	}
	
	
	/**
	 * @method _tick
	 * @protected
	 **/
	p._tick = function(data) {
		if (this.onTick) { this.onTick(data); }
	}

	/**
	 * @method _testHit
	 * @protected
	 * @param {CanvasRenderingContext2D} ctx
	 * @return {Boolean}
	 **/
	p._testHit = function(ctx) {
		try {
			var hit = ctx.getImageData(0, 0, 1, 1).data[3] > 1;
		} catch (e) {
			if (!DisplayObject.suppressCrossDomainErrors) {
				throw "An error has occured. This is most likely due to security restrictions on reading canvas pixel " +
				"data with local or cross-domain images.";
			}
		}
		return hit;
	}

	/**
	 * @method _applyFilters
	 * @protected
	 **/
	p._applyFilters = function() {
		if (!this.filters || this.filters.length == 0 || !this.cacheCanvas) { return; }
		var l = this.filters.length;
		var ctx = this.cacheCanvas.getContext("2d");
		var w = this.cacheCanvas.width;
		var h = this.cacheCanvas.height;
		for (var i=0; i<l; i++) {
			this.filters[i].applyFilter(ctx, 0, 0, w, h);
		}
	}

window.DisplayObject = DisplayObject;
}(window));

(function(window) {

/**
* A Bitmap represents an Image, Canvas, or Video in the display list.
* @class Bitmap
* @extends DisplayObject
* @constructor
* @param {Image | HTMLCanvasElement | HTMLVideoElement | String} imageOrUri The source object or URI to an image to display. This can be either an Image, Canvas, or Video object, or a string URI to an image file to load and use. If it is a URI, a new Image object will be constructed and assigned to the .image property.
**/
var Bitmap = function(imageOrUri) {
  this.initialize(imageOrUri);
}
var p = Bitmap.prototype = new DisplayObject();

// public properties:
	/**
	 * The image to render. This can be an Image, a Canvas, or a Video.
	 * @property image
	 * @type Image | HTMLCanvasElement | HTMLVideoElement
	 **/
	p.image = null;
	
	/**
	 * Whether or not the Bitmap should be draw to the canvas at whole pixel coordinates.
	 * @property snapToPixel
	 * @type Boolean
	 * @default true
	 **/
	p.snapToPixel = true;

	/**
	 * Specifies an area of the source image to draw. If omitted, the whole image will be drawn.
	 * @property sourceRect
	 * @type Rectangle
	 * @default null
	 */
	p.sourceRect = null;
	
	// constructor:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
    * @private
	 **/
	p.DisplayObject_initialize = p.initialize;

	/** 
	 * Initialization method.
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(imageOrUri) {
		this.DisplayObject_initialize();
		if (typeof imageOrUri == "string") {
			this.image = new Image();
			this.image.src = imageOrUri;
		} else {
			this.image = imageOrUri;
		}
	}
	
// public methods:

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.image && (this.image.complete || this.image.getContext || this.image.readyState >= 2);
	}

	/**
	 * @property DisplayObject_draw
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_draw = p.draw;
	
	/**
	 * Draws the display object into the specified context ignoring it's visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache. 
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		var rect = this.sourceRect;
		if (rect) {
			ctx.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
		} else {
			ctx.drawImage(this.image, 0, 0);
		}
		return true;
	}
	
	//Note, the doc sections below document using the specified APIs (from DisplayObject)  from
	//Bitmap. This is why they have no method implementations.
	
	/**
	 * Because the content of a Bitmap is already in a simple format, cache is unnecessary for Bitmap instances.
	 * You should not cache Bitmap instances as it can degrade performance.
	 * @method cache
	 **/
	
	/**
	 * Because the content of a Bitmap is already in a simple format, cache is unnecessary for Bitmap instances.
	 * You should not cache Bitmap instances as it can degrade performance.
	 * @method updateCache
	 **/
	
	/**
	 * Because the content of a Bitmap is already in a simple format, cache is unnecessary for Bitmap instances.
	 * You should not cache Bitmap instances as it can degrade performance.
	 * @method uncache
	 **/
	
	/**
	 * Returns a clone of the Bitmap instance.
	 * @method clone
	 * @return {Bitmap} a clone of the Bitmap instance.
	 **/
	p.clone = function() {
		var o = new Bitmap(this.image);
		this.cloneProps(o);
		return o;
	}
	
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Bitmap (name="+  this.name +")]";
	}

// private methods:

window.Bitmap = Bitmap;
}(window));


(function(window) {

/**
* A Container is a nestable display lists that allows you to work with compound display elements. For
* example you could group arm, leg, torso and head Bitmaps together into a Person Container, and
* transform them as a group, while still being able to move the individual parts relative to each
* other. Children of containers have their transform and alpha properties concatenated with their
* parent Container. For example, a Shape with x=100 and alpha=0.5, placed in a Container with
* x=50 and alpha=0.7 will be rendered to the canvas at x=150 and alpha=0.35. Containers have some
* overhead, so you generally shouldn't create a Container to hold a single child.
* @class Container
* @extends DisplayObject
* @constructor
**/
var Container = function() {
  this.initialize();
}
var p = Container.prototype = new DisplayObject();

// public properties:
	/**
	 * The array of children in the display list. You should usually use the child management methods,
	 * rather than accessing this directly, but it is included for advanced users.
	 * @property children
	 * @type Array[DisplayObject]
	 * @default null
	 **/
	p.children = null;

// constructor:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_initialize = p.initialize;

	/**
	 * Initialization method.
	 * @method initialize
	 * @protected
	*/
	p.initialize = function() {
		this.DisplayObject_initialize();
		this.children = [];
	}

// public methods:

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		return this.visible && this.alpha > 0 && this.children.length && this.scaleX != 0 && this.scaleY != 0;
	}

	/**
	 * @property DisplayObject_draw
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_draw = p.draw;

	/**
	 * Draws the display object into the specified context ignoring it's visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache, _mtx) {
		var snap = Stage._snapToPixelEnabled;
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		_mtx = _mtx || this._matrix.reinitialize(1,0,0,1,0,0,this.alpha, this.shadow, this.compositeOperation);
		var l = this.children.length;
		// this ensures we don't have issues with display list changes that occur during a draw:
		var list = this.children.slice(0);
		for (var i=0; i<l; i++) {
			var child = list[i];
			if (!child.isVisible()) { continue; }

			var shadow = false;
			var mtx = child._matrix.reinitialize(_mtx.a,_mtx.b,_mtx.c,_mtx.d,_mtx.tx,_mtx.ty,_mtx.alpha,_mtx.shadow,_mtx.compositeOperation);
			mtx.appendTransform(child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY,
									child.regX, child.regY);
			mtx.appendProperties(child.alpha, child.shadow, child.compositeOperation);

			if (!(child instanceof Container && child.cacheCanvas == null)) {
				if (snap && child.snapToPixel && mtx.a == 1 && mtx.b == 0 && mtx.c == 0 && mtx.d == 1) {
					ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx+0.5|0, mtx.ty+0.5|0);
				} else {
					ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
				}
				ctx.globalAlpha = mtx.alpha;
				ctx.globalCompositeOperation = mtx.compositeOperation || "source-over";
				if (shadow = mtx.shadow) { this.applyShadow(ctx, shadow); }
			}
			child.draw(ctx, false, mtx);
			if (shadow) { this.applyShadow(ctx); }
		}
		return true;
	}

	/**
	 * Adds a child to the top of the display list. You can also add multiple children, such as "addChild(child1, child2, ...);".
	 * Returns the child that was added, or the last child if multiple children were added.
	 * @method addChild
	 * @param {DisplayObject} child The display object to add.
	 * @return {DisplayObject} The child that was added, or the last child if multiple children were added.
	 **/
	p.addChild = function(child) {
		if (child == null) { return child; }
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addChild(arguments[i]); }
			return arguments[l-1];
		}
		if (child.parent) { child.parent.removeChild(child); }
		child.parent = this;
		this.children.push(child);
		return child;
	}

	/**
	 * Adds a child to the display list at the specified index, bumping children at equal or greater indexes up one, and setting
	 * its parent to this Container. You can also add multiple children, such as "addChildAt(child1, child2, ..., index);". The
	 * index must be between 0 and numChildren. For example, to add myShape under otherShape in the display list, you could use:
	 * container.addChildAt(myShape, container.getChildIndex(otherShape)). This would also bump otherShape's index up by one.
	 * Returns the last child that was added, or the last child if multiple children were added.
	 * @method addChildAt
	 * @param {DisplayObject} child The display object to add.
	 * @param {Number} index The index to add the child at.
	 * @return {DisplayObject} The child that was added, or the last child if multiple children were added.
	 **/
	p.addChildAt = function(child, index) {
		var l = arguments.length;
		if (l > 2) {
			index = arguments[i-1];
			for (var i=0; i<l-1; i++) { this.addChildAt(arguments[i], index+i); }
			return arguments[l-2];
		}
		if (child.parent) { child.parent.removeChild(child); }
		child.parent = this;
		this.children.splice(index, 0, child);
		return child;
	}

	/**
	 * Removes the specified child from the display list. Note that it is faster to use removeChildAt() if the index is already
	 * known. You can also remove multiple children, such as "removeChild(child1, child2, ...);". Returns true if the child
	 * (or children) was removed, or false if it was not in the display list.
	 * @method removeChild
	 * @param {DisplayObject} child The child to remove.
	 * @return {Boolean} true if the child (or children) was removed, or false if it was not in the display list.
	 **/
	p.removeChild = function(child) {
		var l = arguments.length;
		if (l > 1) {
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeChild(arguments[i]); }
			return good;
		}
		return this.removeChildAt(this.children.indexOf(child));
	}

	/**
	 * Removes the child at the specified index from the display list, and sets its parent to null. You can also remove multiple
	 * children, such as "removeChildAt(2, 7, ...);". Returns true if the child (or children) was removed, or false if any index
	 * was out of range.
	 * @param {Number} index The index of the child to remove.
	 * @return true if the child (or children) was removed, or false if any index was out of range.
	 **/
	p.removeChildAt = function(index) {
		var l = arguments.length;
		if (l > 1) {
			var a = [];
			for (var i=0; i<l; i++) { a[i] = arguments[i]; }
			a.sort(function(a, b) { return b-a; })
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeChildAt(a[i]); }
			return good;
		}
		if (index < 0 || index > this.children.length-1) { return false; }
		var child = this.children[index];
		if (child != null) { child.parent = null; }
		this.children.splice(index, 1);
		return true;
	}

	/**
	 * Removes all children from the display list.
	 * @method removeAllChildren
	 **/
	p.removeAllChildren = function() {
		var kids = this.children;
		while (kids.length) { kids.pop().parent = null; }
	}

	/**
	 * Returns the child at the specified index.
	 * @method getChildAt
	 * @param {Number} index The index of the child to return.
	 * @return {DisplayObject} The child at the specified index.
	 **/
	p.getChildAt = function(index) {
		return this.children[index];
	}

	/**
	 * Performs an array sort operation on the child list.
	 * @method sortChildren
	 * @param {Function} sortFunction the function to use to sort the child list. See javascript's Array.sort documentation
	 * for details.
	 **/
	p.sortChildren = function(sortFunction) {
		this.children.sort(sortFunction);
	}

	/**
	 * Returns the index of the specified child in the display list, or -1 if it is not in the display list.
	 * @method getChildIndex
	 * @param {DisplayObject} child The child to return the index of.
	 * @return {Number} The index of the specified child. -1 if the child is not found.
	 **/
	p.getChildIndex = function(child) {
		return this.children.indexOf(child);
	}

	/**
	 * Returns the number of children in the display list.
	 * @method getNumChildren
	 * @return {Number} The number of children in the display list.
	 **/
	p.getNumChildren = function() {
		return this.children.length;
	}
	
	/**
	 * Swaps the children at the specified indexes. Fails silently if either index is out of range.
	 * @param index1
	 * @param index2
	 * @method swapChildrenAt
	 **/
	p.swapChildrenAt = function(index1, index2) {
		var kids = this.children;
		var o1 = kids[index1];
		var o2 = kids[index2];
		if (!o1 || !o2) { return; } // TODO: throw error?
		kids[index1] = o2;
		kids[index2] = o1;
	}
	
	/**
	 * Swaps the specified children's depth in the display list. Fails silently if either child is not a child of this Container.
	 * @param child1
	 * @param child2
	 * @method swapChildren
	 **/
	p.swapChildren = function(child1, child2) {
		var kids = this.children;
		var index1,index2;
		for (var i=0,l=kids.length;i<l;i++) {
			if (kids[i] == child1) { index1 = i; }
			if (kids[i] == child2) { index2 = i; }
			if (index1 != null && index2 != null) { break; }
		}
		if (i==l) { return; } // TODO: throw error?
		kids[index1] = child2;
		kids[index2] = child1;
	}
	
	/**
	 * Changes the depth of the specified child. Fails silently if the child is not a child of this container, or the index is out of range.
	 * @param child
	 * @param index
	 * @method setChildIndex
	 **/
	p.setChildIndex = function(child, index) {
		var kids = this.children;
		for (var i=0,l=kids.length;i<l;i++) {
			if (kids[i] == child) { break; }
		}
		if (i==l || index < 0 || index > l || i == index) { return; }
		kids.splice(index,1);
		if (index<i) { i--; }
		kids.splice(child,i,0); // TODO: test.
	}

	/**
	 * Returns true if the specified display object either is this container or is a descendent.
	 * (child, grandchild, etc) of this container.
	 * @method contains
	 * @param {DisplayObject} child The DisplayObject to be checked.
	 * @return {Boolean} true if the specified display object either is this container or is a descendent.
	 **/
	p.contains = function(child) {
		while (child) {
			if (child == this) { return true; }
			child = child.parent;
		}
		return false;
	}

	/**
	 * Tests whether the display object intersects the specified local point (ie. draws a pixel with alpha > 0 at the specified
	 * position). This ignores the alpha, shadow and compositeOperation of the display object, and all transform properties
	 * including regX/Y.
	 * @method hitTest
	 * @param x The x position to check in the display object's local coordinates.
	 * @param y The y position to check in the display object's local coordinates.
	 * @return {Boolean} A Boolean indicating whether there is a visible section of a DisplayObject that overlaps the specified
	 * coordinates.
	 **/
	p.hitTest = function(x, y) {
		// TODO: optimize to use the fast cache check where possible.
		return (this.getObjectUnderPoint(x, y) != null);
	}

	/**
	 * Returns an array of all display objects under the specified coordinates that are in this container's display list.
	 * This routine ignores any display objects with mouseEnabled set to false. The array will be sorted in order of visual
	 * depth, with the top-most display object at index 0. This uses shape based hit detection, and can be an expensive operation
	 * to run, so it is best to use it carefully. For example, if testing for objects under the mouse, test on tick (instead of on
	 * mousemove), and only if the mouse's position has changed.
	 * @method getObjectsUnderPoint
	 * @param {Number} x The x position in the container to test.
	 * @param {Number} y The y position in the container to test.
	 * @return {Array[DisplayObject]} An Array of DisplayObjects under the specified coordinates.
	 **/
	p.getObjectsUnderPoint = function(x, y) {
		var arr = [];
		var pt = this.localToGlobal(x, y);
		this._getObjectsUnderPoint(pt.x, pt.y, arr);
		return arr;
	}

	/**
	 * Similar to getObjectsUnderPoint(), but returns only the top-most display object. This runs significantly faster than
	 * getObjectsUnderPoint(), but is still an expensive operation. See getObjectsUnderPoint() for more information.
	 * @method getObjectUnderPoint
	 * @param {Number} x The x position in the container to test.
	 * @param {Number} y The y position in the container to test.
	 * @return {DisplayObject} The top-most display object under the specified coordinates.
	 **/
	p.getObjectUnderPoint = function(x, y) {
		var pt = this.localToGlobal(x, y);
		return this._getObjectsUnderPoint(pt.x, pt.y);
	}

	/**
	 * Returns a clone of this Container. Some properties that are specific to this instance's current context are reverted to
	 * their defaults (for example .parent).
	 * @param {Boolean} recursive If true, all of the descendants of this container will be cloned recursively. If false, the
	 * properties of the container will be cloned, but the new instance will not have any children.
	 * @return {Container} A clone of the current Container instance.
	 **/
	p.clone = function(recursive) {
		var o = new Container();
		this.cloneProps(o);
		if (recursive) {
			var arr = o.children = [];
			for (var i=0, l=this.children.length; i<l; i++) {
				var clone = this.children[i].clone(recursive);
				clone.parent = o;
				arr.push(clone);
			}
		}
		return o;
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Container (name="+  this.name +")]";
	}

// private properties:
	/**
	 * @method _tick
	 * @protected
	 **/
	p._tick = function(data) {
		for (var i=this.children.length-1; i>=0; i--) {
			var child = this.children[i];
			if (child._tick) { child._tick(data); }
		}
		if (this.onTick) { this.onTick(data); }
	}

	/**
	 * @method _getObjectsUnderPoint
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Array} arr
	 * @param {Number} mouseEvents A bitmask indicating which mouseEvent types to look for. Bit 1 specifies onPress &
	 * onClick & onDoubleClick, bit 2 specifies it should look for onMouseOver and onMouseOut. This implementation may change.
	 * @return {Array[DisplayObject]}
	 * @protected
	 **/
	p._getObjectsUnderPoint = function(x, y, arr, mouseEvents) {
		var ctx = DisplayObject._hitTestContext;
		var canvas = DisplayObject._hitTestCanvas;
		var mtx = this._matrix;
		var hasHandler = (mouseEvents&1 && (this.onPress || this.onClick || this.onDoubleClick)) || (mouseEvents&2 &&
																(this.onMouseOver || this.onMouseOut));

		// if we have a cache handy, we can use it to do a quick check:
		if (this.cacheCanvas) {
			this.getConcatenatedMatrix(mtx);
			ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx-x, mtx.ty-y);
			ctx.globalAlpha = mtx.alpha;
			this.draw(ctx);
			if (this._testHit(ctx)) {
				canvas.width = 0;
				canvas.width = 1;
				if (hasHandler) { return this; }
			} else {
				return null;
			}
		}

		// draw children one at a time, and check if we get a hit:
		var l = this.children.length;
		for (var i=l-1; i>=0; i--) {
			var child = this.children[i];
			if (!child.isVisible() || !child.mouseEnabled) { continue; }

			if (child instanceof Container) {
				var result;
				if (hasHandler) {
					// only concerned about the first hit, because this container is going to claim it anyway:
					result = child._getObjectsUnderPoint(x, y);
					if (result) { return this; }
				} else {
					result = child._getObjectsUnderPoint(x, y, arr, mouseEvents);
					if (!arr && result) { return result; }
				}
			} else if (!mouseEvents || hasHandler || (mouseEvents&1 && (child.onPress || child.onClick || child.onDoubleClick)) ||
														(mouseEvents&2 && (child.onMouseOver || child.onMouseOut))) {
				child.getConcatenatedMatrix(mtx);
				ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx-x, mtx.ty-y);
				ctx.globalAlpha = mtx.alpha;
				child.draw(ctx);
				if (!this._testHit(ctx)) { continue; }
				canvas.width = 0;
				canvas.width = 1;
				if (hasHandler) { return this; }
				else if (arr) { arr.push(child); }
				else { return child; }
			}
		}
		return null;
	}

window.Container = Container;
}(window));

(function(window) {


/**
* A stage is the root level Container for a display list. Each time its tick method is called, it will render its display
* list to its target canvas.
* @class Stage
* @extends Container
* @constructor
* @param {HTMLCanvasElement} canvas The canvas the stage will render to.
**/
var Stage = function(canvas) {
  this.initialize(canvas);
}
var p = Stage.prototype = new Container();

// static properties:
	/**
	 * @property _snapToPixelEnabled
	 * @protected
	 * @static
	 * @type Boolean
	 * @default false
	 **/
	Stage._snapToPixelEnabled = false; // snapToPixelEnabled is temporarily copied here during a draw to provide global access.

// public properties:
	/**
	 * Indicates whether the stage should automatically clear the canvas before each render. You can set this to false to manually
	 * control clearing (for generative art, or when pointing multiple stages at the same canvas for example).
	 * @property autoClear
	 * @type Boolean
	 * @default true
	 **/
	p.autoClear = true;

	/** The canvas the stage will render to. Multiple stages can share a single canvas, but you must disable autoClear for all but the
	 * first stage that will be ticked (or they will clear each other's render).
	 * @property canvas
	 * @type HTMLCanvasElement
	 **/
	p.canvas = null;

	/**
	 * READ-ONLY. The current mouse X position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
	 * position over the canvas, and mouseInBounds will be set to false.
	 * @property mouseX
	 * @type Number
	 * @final
	 **/
	p.mouseX = null;

	/** READ-ONLY. The current mouse Y position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
	 * position over the canvas, and mouseInBounds will be set to false.
	 * @property mouseY
	 * @type Number
	 * @final
	 **/
	p.mouseY = null;

	/** The onMouseMove callback is called when the user moves the mouse over the canvas.  The handler is passed a single param
	 * containing the corresponding MouseEvent instance.
	 * @event onMouseMove
	 * @param {MouseEvent} event A MouseEvent instance with information about the current mouse event.
	 **/
	p.onMouseMove = null;

	/**
	 * The onMouseUp callback is called when the user releases the mouse button anywhere that the page can detect it.  The handler
	 * is passed a single param containing the corresponding MouseEvent instance.
	 * @event onMouseUp
	 * @param {MouseEvent} event A MouseEvent instance with information about the current mouse event.
	 **/
	p.onMouseUp = null;

	/**
	 * The onMouseDown callback is called when the user presses the mouse button over the canvas.  The handler is passed a single
	 * param containing the corresponding MouseEvent instance.
	 * @event onMouseDown
	 * @param {MouseEvent} event A MouseEvent instance with information about the current mouse event.
	 **/
	p.onMouseDown = null;

	/**
	 * Indicates whether this stage should use the snapToPixel property of display objects when rendering them.
	 * @property snapToPixelEnabled
	 * @type Boolean
	 * @default false
	 **/
	p.snapToPixelEnabled = false;

	/** Indicates whether the mouse is currently within the bounds of the canvas.
	 * @property mouseInBounds
	 * @type Boolean
	 * @default false
	 **/
	p.mouseInBounds = false;

	/** If false, tick callbacks will be called on all display objects on the stage prior to rendering to the canvas.
	 * @property tickOnUpdate
	 * @type Boolean
	 * @default false
	 **/
	p.tickOnUpdate = true;

// private properties:

	/**
	 * @property _activeMouseEvent
	 * @protected
	 * @type MouseEvent
	 **/
	p._activeMouseEvent = null;

	/**
	 * @property _activeMouseTarget
	 * @protected
	 * @type DisplayObject
	 **/
	p._activeMouseTarget = null;

	/**
	 * @property _mouseOverIntervalID
	 * @protected
	 * @type Number
	 **/
	p._mouseOverIntervalID = null;

	/**
	 * @property _mouseOverX
	 * @protected
	 * @type Number
	 **/
	p._mouseOverX = 0;

	/**
	 * @property _mouseOverY
	 * @protected
	 * @type Number
	 **/
	p._mouseOverY = 0;

	/**
	 * @property _mouseOverTarget
	 * @protected
	 * @type DisplayObject
	 **/
	p._mouseOverTarget = null;

// constructor:
	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.Container_initialize = p.initialize;

	/**
	 * Initialization method.
	 * @method initialize
	 * param {HTMLCanvasElement} canvas A canvas object, or the string id of a canvas object in the current document.
	 * @protected
	 **/
	p.initialize = function(canvas) {
		this.Container_initialize();
		this.canvas = (canvas instanceof HTMLCanvasElement) ? canvas : document.getElementById(canvas);
		this._enableMouseEvents(true);
	}

// public methods:

	/**
	 * @event tick
	 * Broadcast to children when the stage is updated.
	 **/

	/**
	 * Each time the update method is called, the stage will tick any descendants exposing a tick method (ex. BitmapAnimation)
	 * and render its entire display list to the canvas.
	 * @method update
	 **/
	p.update = function(data) {
		if (!this.canvas) { return; }
		if (this.autoClear) { this.clear(); }
		Stage._snapToPixelEnabled = this.snapToPixelEnabled;
		if (this.tickOnUpdate) {
			this._tick(data);
		}
		this.draw(this.canvas.getContext("2d"), false, this.getConcatenatedMatrix(this._matrix));
	}

	/**
	 * Calls the update method. Useful for adding stage as a listener to Ticker directly.
	 * @property tick
	 * @private
	 * @type Function
	 **/
	p.tick = p.update;

	/**
	 * Clears the target canvas. Useful if autoClear is set to false.
	 * @method clear
	 **/
	p.clear = function() {
		if (!this.canvas) { return; }
		var ctx = this.canvas.getContext("2d");
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * Returns a data url that contains a Base64 encoded image of the contents of the stage. The returned data url can be
	 * specified as the src value of an image element.
	 * @method toDataURL
	 * @param {String} backgroundColor The background color to be used for the generated image. The value can be any value HTML color
	 * value, including HEX colors, rgb and rgba. The default value is a transparent background.
	 * @param {String} mimeType The MIME type of the image format to be create. The default is "image/png". If an unknown MIME type
	 * is passed in, or if the browser does not support the specified MIME type, the default value will be used.
	 * @return {String} a Base64 encoded image.
	 **/
	p.toDataURL = function(backgroundColor, mimeType) {
		if(!mimeType) {
			mimeType = "image/png";
		}

		var ctx = this.canvas.getContext('2d');
		var w = this.canvas.width;
		var h = this.canvas.height;

		var data;

		if(backgroundColor) {

			//get the current ImageData for the canvas.
			data = ctx.getImageData(0, 0, w, h);

			//store the current globalCompositeOperation
			var compositeOperation = ctx.globalCompositeOperation;

			//set to draw behind current content
			ctx.globalCompositeOperation = "destination-over";

			//set background color
			ctx.fillStyle = backgroundColor;

			//draw background on entire canvas
			ctx.fillRect(0, 0, w, h);
		}

		//get the image data from the canvas
		var dataURL = this.canvas.toDataURL(mimeType);

		if(backgroundColor) {
			//clear the canvas
			ctx.clearRect (0, 0, w, h);

			//restore it with original settings
			ctx.putImageData(data, 0, 0);

			//reset the globalCompositeOperation to what it was
			ctx.globalCompositeOperation = compositeOperation;
		}

		return dataURL;
	}

	/**
	 * Enables or disables (by passing a frequency of 0) mouse over handlers (onMouseOver and onMouseOut) for this stage's display
	 * list. These events can be expensive to generate, so they are disabled by default, and the frequency of the events
	 * can be controlled independently of mouse move events via the optional frequency parameter.
	 * @method enableMouseOver
	 * @param {Number} frequency Optional param specifying the maximum number of times per second to broadcast mouse over/out events. Set to 0 to disable mouse
	 * over events completely. Maximum is 50. A lower frequency is less responsive, but uses less CPU. Default is 20.
	 **/
	p.enableMouseOver = function(frequency) {
		if (this._mouseOverIntervalID) {
			clearInterval(this._mouseOverIntervalID);
			this._mouseOverIntervalID = null;
		}
		if (frequency == null) { frequency = 20; }
		else if (frequency <= 0) { return; }
		var o = this;
		this._mouseOverIntervalID = setInterval(function(){ o._testMouseOver(); }, 1000/Math.min(50,frequency));
		this._mouseOverX = NaN;
		this._mouseOverTarget = null;
	}

	/**
	 * Returns a clone of this Stage.
	 * @return {Stage} A clone of the current Container instance.
	 **/
	p.clone = function() {
		var o = new Stage(null);
		this.cloneProps(o);
		return o;
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Stage (name="+  this.name +")]";
	}

	// private methods:

	/**
	 * @method _enableMouseEvents
	 * @protected
	 * @param {Boolean} enabled
	 **/
	p._enableMouseEvents = function() {
		var o = this;
		var evtTarget = window.addEventListener ? window : document;
		evtTarget.addEventListener("mouseup", function(e) { o._handleMouseUp(e); }, false);
		evtTarget.addEventListener("mousemove", function(e) { o._handleMouseMove(e); }, false);
		evtTarget.addEventListener("dblclick", function(e) { o._handleDoubleClick(e); }, false);
		// this is to facilitate extending Stage:
		if (this.canvas) { this.canvas.addEventListener("mousedown", function(e) { o._handleMouseDown(e); }, false); }
	}

	/**
	 * @method _handleMouseMove
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseMove = function(e) {

		if (!this.canvas) {
			this.mouseX = this.mouseY = null;
			return;
		}
		if(!e){ e = window.event; }

		var inBounds = this.mouseInBounds;
		this._updateMousePosition(e.pageX, e.pageY);
		if (!inBounds && !this.mouseInBounds) { return; }

		var evt = new MouseEvent("onMouseMove", this.mouseX, this.mouseY, this, e);

		if (this.onMouseMove) { this.onMouseMove(evt); }
		if (this._activeMouseEvent && this._activeMouseEvent.onMouseMove) { this._activeMouseEvent.onMouseMove(evt); }
	}

	/**
	 * @method _updateMousePosition
	 * @protected
	 * @param {Number} pageX
	 * @param {Number} pageY
	 **/
	p._updateMousePosition = function(pageX, pageY) {

		var o = this.canvas;
		do {
			pageX -= o.offsetLeft;
			pageY -= o.offsetTop;
		} while (o = o.offsetParent);

		this.mouseInBounds = (pageX >= 0 && pageY >= 0 && pageX < this.canvas.width && pageY < this.canvas.height);

		if (this.mouseInBounds) {
			this.mouseX = pageX;
			this.mouseY = pageY;
		}
	}

	/**
	 * @method _handleMouseUp
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseUp = function(e) {
		var evt = new MouseEvent("onMouseUp", this.mouseX, this.mouseY, this, e);
		if (this.onMouseUp) { this.onMouseUp(evt); }
		if (this._activeMouseEvent && this._activeMouseEvent.onMouseUp) { this._activeMouseEvent.onMouseUp(evt); }
		if (this._activeMouseTarget && this._activeMouseTarget.onClick &&
				this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, true, (this._mouseOverIntervalID ? 3 : 1)) == this._activeMouseTarget) {

			this._activeMouseTarget.onClick(new MouseEvent("onClick", this.mouseX, this.mouseY, this._activeMouseTarget, e));
		}
		this._activeMouseEvent = this._activeMouseTarget = null;
	}

	/**
	 * @method _handleMouseDown
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseDown = function(e) {
		if (this.onMouseDown) {
			this.onMouseDown(new MouseEvent("onMouseDown", this.mouseX, this.mouseY, this, e));
		}
		var target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, (this._mouseOverIntervalID ? 3 : 1));
		if (target) {
			if (target.onPress instanceof Function) {
				var evt = new MouseEvent("onPress", this.mouseX, this.mouseY, target, e);
				target.onPress(evt);
				if (evt.onMouseMove || evt.onMouseUp) { this._activeMouseEvent = evt; }
			}
			this._activeMouseTarget = target;
		}
	}

	/**
	 * @method _testMouseOver
	 * @protected
	 **/
	p._testMouseOver = function() {
		if (this.mouseX == this._mouseOverX && this.mouseY == this._mouseOverY && this.mouseInBounds) { return; }
		var target = null;
		if (this.mouseInBounds) {
			target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, 3);
			this._mouseOverX = this.mouseX;
			this._mouseOverY = this.mouseY;
		}

		if (this._mouseOverTarget != target) {
			if (this._mouseOverTarget && this._mouseOverTarget.onMouseOut) {
				this._mouseOverTarget.onMouseOut(new MouseEvent("onMouseOut", this.mouseX, this.mouseY, this._mouseOverTarget));
			}
			if (target && target.onMouseOver) {
				target.onMouseOver(new MouseEvent("onMouseOver", this.mouseX, this.mouseY, target));
			}
			this._mouseOverTarget = target;
		}
	}

	/**
	 * @method _handleDoubleClick
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleDoubleClick = function(e) {
		if (this.onDoubleClick) {
			this.onDoubleClick(new MouseEvent("onDoubleClick", this.mouseX, this.mouseY, this, e));
		}
		var target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, (this._mouseOverIntervalID ? 3 : 1));
		if (target) {
			if (target.onDoubleClick instanceof Function) {
				target.onDoubleClick(new MouseEvent("onPress", this.mouseX, this.mouseY, target, e));
			}
		}
	}

window.Stage = Stage;
}(window));

(function(window) {

// used to create the instruction lists used in Graphics:


/**
* Inner class used by the Graphics class. Used to create the instruction lists used in Graphics:
* @class Command
* @for Graphics
* @constructor
**/
function Command(f, params) {
	this.f = f;
	this.params = params;
}

/**
* @method exec
* @param {Object} scope
**/
Command.prototype.exec = function(scope) { this.f.apply(scope, this.params); }

/**
* The Graphics class exposes an easy to use API for generating vector drawing instructions and drawing them to a specified context.
* Note that you can use Graphics without any dependency on the Easel framework by calling draw() directly,
* or it can be used with the Shape object to draw vector graphics within the context of an Easel display list.<br/><br/>
* <pre><code>var g = new Graphics();
*	g.setStrokeStyle(1);
*	g.beginStroke(Graphics.getRGB(0,0,0));
*	g.beginFill(Graphics.getRGB(255,0,0));
*	g.drawCircle(0,0,3);
*
*	var s = new Shape(g);
*		s.x = 100;
*		s.y = 100;
*
*	stage.addChild(s);
*	stage.update();</code></pre><br />
* Note that all drawing methods in Graphics return the Graphics instance, so they can be chained together. For example, the following 
* line of code would generate the instructions to draw a rectangle with a red stroke and blue fill, then render it to the specified 
* context2D:<br />
* <pre><code>myGraphics.beginStroke("#F00").beginFill("#00F").drawRect(20, 20, 100, 50).draw(myContext2D);
* @class Graphics
* @constructor
* @for Graphics
**/
var Graphics = function() {
	this.initialize();
}
var p = Graphics.prototype;

// static public methods:
	
	
	/**
	 * Returns a CSS compatible color string based on the specified RGB numeric color values in the format 
	 * "rgba(255,255,255,1.0)", or if alpha is null then in the format "rgb(255,255,255)". For example,
	 * Graphics.getRGB(50, 100, 150, 0.5) will return "rgba(50,100,150,0.5)". It also supports passing a single hex color 
	 * value as the first param, and an optional alpha value as the second param. For example, Graphics.getRGB(0xFF00FF, 0.2)
	 * will return "rgba(255,0,255,0.2)".
	 * @method getRGB
	 * @static
	 * @param {Number} r The red component for the color, between 0 and 0xFF (255).
	 * @param {Number} g The green component for the color, between 0 and 0xFF (255).
	 * @param {Number} b The blue component for the color, between 0 and 0xFF (255).
	 * @param {Number} alpha Optional. The alpha component for the color where 0 is fully transparent and 1 is fully opaque.
	 * @return A CSS compatible color string based on the specified RGB numeric color values in the format 
	 * "rgba(255,255,255,1.0)", or if alpha is null then in the format "rgb(255,255,255)".
	 **/
	Graphics.getRGB = function(r, g, b, alpha) {
		if (r != null && b == null) {
			alpha = g;
			b = r&0xFF;
			g = r>>8&0xFF;
			r = r>>16&0xFF;
		}
		if (alpha == null) {
			return "rgb("+r+","+g+","+b+")";
		} else {
			return "rgba("+r+","+g+","+b+","+alpha+")";
		}
	}
	
	/**
	 * Returns a CSS compatible color string based on the specified HSL numeric color values in the format "hsla(360,100,100,1.0)", 
	 * or if alpha is null then in the format "hsl(360,100,100)". For example, Graphics.getHSL(150, 100, 70) will return 
	 * "hsl(150,100,70)".
	 * @method getHSL
	 * @static
	 * @param {Number} hue The hue component for the color, between 0 and 360.
	 * @param {Number} saturation The saturation component for the color, between 0 and 100.
	 * @param {Number} lightness The lightness component for the color, between 0 and 100.
	 * @param {Number} alpha Optional. The alpha component for the color where 0 is fully transparent and 1 is fully opaque.
	 * @return a CSS compatible color string based on the specified HSL numeric color values in the format 
	 * "hsla(360,100,100,1.0)", or if alpha is null then in the format "hsl(360,100,100)". For example, 
	 * Graphics.getHSL(150, 100, 70) will return "hsl(150,100,70)".
	 **/
	Graphics.getHSL = function(hue, saturation, lightness, alpha) {
		if (alpha == null) {
			return "hsl("+(hue%360)+","+saturation+"%,"+lightness+"%)";
		} else {
			return "hsla("+(hue%360)+","+saturation+"%,"+lightness+"%,"+alpha+")";
		}
	}
	
	/**
	 * Map of Base64 characters to values. Used by decodePath().
	 * @property BASE_64
	 * @static
	 * @final
	 * @type Object
	 **/
	Graphics.BASE_64 = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,"9":61,"+":62,"/":63};
		
	
	/**
	 * Maps numeric values for the caps parameter of setStrokeStyle to corresponding string values.
	 * This is primarily for use with the tiny API. The mappings are as follows: 0 to "butt",
	 * 1 to "round", and 2 to "square".
	 * For example, myGraphics.ss(16, 2) would set the line caps to "square".
	 * @property STROKE_CAPS_MAP
	 * @static
	 * @final
	 * @type Array[String]
	 **/
	Graphics.STROKE_CAPS_MAP = ["butt", "round", "square"];
	
	/**
	 * Maps numeric values for the joints parameter of setStrokeStyle to corresponding string values.
	 * This is primarily for use with the tiny API. The mappings are as follows: 0 to "miter",
	 * 1 to "round", and 2 to "bevel".
	 * For example, myGraphics.ss(16, 0, 2) would set the line joints to "bevel".
	 * @property STROKE_JOINTS_MAP
	 * @static
	 * @final
	 * @type Array[String]
	 **/
	Graphics.STROKE_JOINTS_MAP = ["miter", "round", "bevel"];
	
	/**
	 * @property _ctx
	 * @static
	 * @protected
	 * @type CanvasRenderingContext2D
	 **/
	Graphics._ctx = document.createElement("canvas").getContext("2d");
	
	/**
	 * @property beginCmd
	 * @static
	 * @protected
	 * @type Command
	 **/
	Graphics.beginCmd = new Command(Graphics._ctx.beginPath, []);
	
	/**
	 * @property fillCmd
	 * @static
	 * @protected
	 * @type Command
	 **/
	Graphics.fillCmd = new Command(Graphics._ctx.fill, []);
	
	/**
	 * @property strokeCmd
	 * @static
	 * @protected
	 * @type Command
	 **/
	Graphics.strokeCmd = new Command(Graphics._ctx.stroke, []);

	/**
	 * @property _strokeInstructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._strokeInstructions = null;

	/**
	 * @property _strokeStyleInstructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._strokeStyleInstructions = null;
	
	/**
	 * @property _fillInstructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._fillInstructions = null;
	
	/**
	 * @property _instructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._instructions = null;
	
	/**
	 * @property _oldInstructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._oldInstructions = null;
	
	/**
	 * @property _activeInstructions
	 * @protected
	 * @type Array[Command]
	 **/
	p._activeInstructions = null;
	
	/**
	 * @property _active
	 * @protected
	 * @type Boolean
	 * @default false
	 **/
	p._active = false;
	
	/**
	 * @property _dirty
	 * @protected
	 * @type Boolean
	 * @default false
	 **/
	p._dirty = false;
	
	/** 
	 * Initialization method.
	 * @method initialize
	 * @protected
	 * @param {String} instructions
	 **/
	p.initialize = function() {
		this.clear();
		this._ctx = Graphics._ctx;
	}
	
	/**
	 * Draws the display object into the specified context ignoring it's visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 **/
	p.draw = function(ctx) {
		if (this._dirty) {
			this._updateInstructions();
		}
		var instr = this._instructions;
		for (var i=0, l=instr.length; i<l; i++) {
			instr[i].exec(ctx);
		}
	}
	
// public methods that map directly to context 2D calls:
	/**
	 * Moves the drawing point to the specified position.
	 * @method moveTo
	 * @param {Number} x The x coordinate the drawing point should move to.
	 * @param {Number} y The y coordinate the drawing point should move to.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.moveTo = function(x, y) {
		this._activeInstructions.push(new Command(this._ctx.moveTo, [x, y]));
		return this;
	}
	
	/**
	 * Draws a line from the current drawing point to the specified position, which become the new current drawing point. 
	 * For detailed information, read the 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#complex-shapes-(paths)">
	 * whatwg spec</a>.
	 * @method lineTo
	 * @param {Number} x The x coordinate the drawing point should draw to.
	 * @param {Number} y The y coordinate the drawing point should draw to.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.lineTo = function(x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.lineTo, [x, y]));
		return this;
	}
	
	/**
	 * Draws an arc with the specified control points and radius.  For detailed information, read the 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-arcto">
	 * whatwg spec</a>.
	 * @method arcTo
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.arcTo = function(x1, y1, x2, y2, radius) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.arcTo, [x1, y1, x2, y2, radius]));
		return this;
	}
	
	/**
	 * Draws an arc defined by the radius, startAngle and endAngle arguments, centered at the position (x, y). For example 
	 * arc(100, 100, 20, 0, Math.PI*2) would draw a full circle with a radius of 20 centered at (100, 100). For detailed 
	 * information, read the 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-arc">whatwg spec</a>.
	 * @method arc
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 * @param {Number} startAngle Measured in radians.
	 * @param {Number} endAngle Measured in radians.
	 * @param {Boolean} anticlockwise
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
		this._dirty = this._active = true;
		if (anticlockwise == null) { anticlockwise = false; }
		this._activeInstructions.push(new Command(this._ctx.arc, [x, y, radius, startAngle, endAngle, anticlockwise]));
		return this;
	}
	
	/**
	 * Draws a quadratic curve from the current drawing point to (x, y) using the control point (cpx, cpy).  For detailed information, 
	 * read the <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-quadraticcurveto">
	 * whatwg spec</a>.
	 * @method quadraticCurveTo
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.quadraticCurveTo = function(cpx, cpy, x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.quadraticCurveTo, [cpx, cpy, x, y]));
		return this;
	}
	
	/**
	 * Draws a bezier curve from the current drawing point to (x, y) using the control points (cp1x, cp1y) and (cp2x, cp2y).  
	 * For detailed information, read the 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-beziercurveto">
	 * whatwg spec</a>.
	 * method @bezierCurveTo
	 * @param {Number} cp1x
	 * @param {Number} cp1y
	 * @param {Number} cp2x
	 * @param {Number} cp2y
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.bezierCurveTo, [cp1x, cp1y, cp2x, cp2y, x, y]));
		return this;
	}
	
	/**
	 * Draws a rectangle at (x, y) with the specified width and height using the current fill and/or stroke.
	 *  For detailed information, read the 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-rect">
	 * whatwg spec</a>.
	 * @method rect
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.rect = function(x, y, w, h) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.rect, [x, y, w, h]));
		return this;
	}
	
	/**
	 * Closes the current path, effectively drawing a line from the current drawing point to the first drawing point specified
	 * since the fill or stroke was last set.
	 * @method closePath
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.closePath = function() {
		if (this._active) {
			this._dirty = true;
			this._activeInstructions.push(new Command(this._ctx.closePath, []));
		}
		return this;
	}
	
	
// public methods that roughly map to Flash graphics APIs:
	/**
	 * Clears all drawing instructions, effectively reseting this Graphics instance.
	 * @method clear
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.clear = function() {
		this._instructions = [];
		this._oldInstructions = [];
		this._activeInstructions = [];
		this._strokeStyleInstructions = this._strokeInstructions = this._fillInstructions = null;
		this._active = this._dirty = false;
		return this;
	}
	
	/**
	 * Begins a fill with the specified color. This ends the current subpath.
	 * @method beginFill
	 * @param {String} color A CSS compatible color value (ex. "#FF0000" or "rgba(255,0,0,0.5)"). Setting to null will 
	 * result in no fill.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginFill = function(color) {
		if (this._active) { this._newPath(); }
		this._fillInstructions = color ? [new Command(this._setProp, ["fillStyle", color])] : null;
		return this;
	}
	
	/**
	 * Begins a linear gradient fill defined by the line (x0, y0) to (x1, y1). This ends the current subpath. For example, the
	 * following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a square to display it:<br/>
	 * myGraphics.beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, 20, 0, 120).drawRect(20, 20, 120, 120);
	 * @method beginLinearGradientFill
	 * @param {Array[String]} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient 
	 * drawing from red to blue.
	 * @param {Array[Number]} ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw 
	 * the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param {Number} y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginLinearGradientFill = function(colors, ratios, x0, y0, x1, y1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createLinearGradient(x0, y0, x1, y1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
		return this;
	}
	
	/**
	 * Begins a radial gradient fill. This ends the current subpath. For example, the following code defines a red to blue radial 
	 * gradient centered at (100, 100), with a radius of 50, and draws a circle to display it:<br/>
	 * myGraphics.beginRadialGradientFill(["#F00","#00F"], [0, 1], 100, 100, 0, 100, 100, 50).drawCircle(100, 100, 50);
	 * @method beginRadialGradientFill
	 * @param {Array[String]} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient 
	 * drawing from red to blue.
	 * @param {Array[Number]} ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would 
	 * draw the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 Center position of the inner circle that defines the gradient.
	 * @param {Number} y0 Center position of the inner circle that defines the gradient.
	 * @param {Number} r0 Radius of the inner circle that defines the gradient.
	 * @param {Number} x1 Center position of the outer circle that defines the gradient.
	 * @param {Number} y1 Center position of the outer circle that defines the gradient.
	 * @param {Number} r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginRadialGradientFill = function(colors, ratios, x0, y0, r0, x1, y1, r1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
		return this;
	}
	
	/**
	 * Begins a pattern fill using the specified image. This ends the current subpath.
	 * @method beginBitmapFill
	 * @param image The Image, Canvas, or Video object to use as the pattern.
	 * @param {String} repetition Optional. Indicates whether to repeat the image in the fill area. One of "repeat", "repeat-x",
	 * "repeat-y", or "no-repeat". Defaults to "repeat".
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginBitmapFill = function(image, repetition) {
		if (this._active) { this._newPath(); }
		repetition = repetition || "";
		var o = this._ctx.createPattern(image, repetition);
		this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
		return this;
	}
	
	/**
	 * Ends the current subpath, and begins a new one with no fill. Functionally identical to beginFill(null).
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.endFill = function() {
		this.beginFill();
		return this;
	}
	
	/**
	 * Sets the stroke style for the current subpath. Like all drawing methods, this can be chained, so you can define the stroke style and color in a single line of code like so:
	 * myGraphics.setStrokeStyle(8,"round").beginStroke("#F00");
	 * @param thickness The width of the stroke.
	 * @param caps Optional. Indicates the type of caps to use at the end of lines. One of butt, round, or square. Defaults to "butt". Also accepts the values 0 (butt), 1 (round), and 2 (square) for use with the tiny API.
	 * @param joints Optional. Specifies the type of joints that should be used where two lines meet. One of bevel, round, or miter. Defaults to "miter". Also accepts the values 0 (miter), 1 (round), and 2 (bevel) for use with the tiny API.
	 * @param miter Optional. If joints is set to "miter", then you can specify a miter limit ratio which controls at what point a mitered joint will be clipped.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.setStrokeStyle = function(thickness, caps, joints, miterLimit) {
		if (this._active) { this._newPath(); }
		this._strokeStyleInstructions = [
			new Command(this._setProp, ["lineWidth", (thickness == null ? "1" : thickness)]),
			new Command(this._setProp, ["lineCap", (caps == null ? "butt" : (isNaN(caps) ? caps : Graphics.STROKE_CAPS_MAP[caps]))]),
			new Command(this._setProp, ["lineJoin", (joints == null ? "miter" : (isNaN(joints) ? joints : Graphics.STROKE_JOINTS_MAP[joints]))]),
			new Command(this._setProp, ["miterLimit", (miterLimit == null ? "10" : miterLimit)])
			];
		return this;
	}
	
	/**
	 * Begins a stroke with the specified color. This ends the current subpath.
	 * @param color A CSS compatible color value (ex. "#FF0000" or "rgba(255,0,0,0.5)"). Setting to null will result in no stroke.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginStroke = function(color) {
		if (this._active) { this._newPath(); }
		this._strokeInstructions = color ? [new Command(this._setProp, ["strokeStyle", color])] : null;
		return this;
	}
	
	/**
	 * Begins a linear gradient stroke defined by the line (x0, y0) to (x1, y1). This ends the current subpath. For example, the following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a square to display it:<br/>
	 * myGraphics.setStrokeStyle(10).beginLinearGradientStroke(["#000","#FFF"], [0, 1], 0, 20, 0, 120).drawRect(20, 20, 120, 120);
	 * @param colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient drawing from red to blue.
	 * @param ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
	 * @param x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginLinearGradientStroke = function(colors, ratios, x0, y0, x1, y1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createLinearGradient(x0, y0, x1, y1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
		return this;
	}
	
	
	/**
	 * Begins a radial gradient stroke. This ends the current subpath. For example, the following code defines a red to blue radial gradient centered at (100, 100), with a radius of 50, and draws a rectangle to display it:<br/>
	 * myGraphics.setStrokeStyle(10).beginRadialGradientStroke(["#F00","#00F"], [0, 1], 100, 100, 0, 100, 100, 50).drawRect(50, 90, 150, 110);
	 * @param colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient drawing from red to blue.
	 * @param ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw the first color to 10% then interpolating to the second color at 90%, then draw the second color to 100%.
	 * @param x0 Center position of the inner circle that defines the gradient.
	 * @param y0 Center position of the inner circle that defines the gradient.
	 * @param r0 Radius of the inner circle that defines the gradient.
	 * @param x1 Center position of the outer circle that defines the gradient.
	 * @param y1 Center position of the outer circle that defines the gradient.
	 * @param r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)	
	 **/
	p.beginRadialGradientStroke = function(colors, ratios, x0, y0, r0, x1, y1, r1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
		return this;
	}
	
	/**
	 * Begins a pattern fill using the specified image. This ends the current subpath.
	 * @param {Image | HTMLCanvasElement | HTMLVideoElement} image The Image, Canvas, or Video object to use as the pattern.
	 * @param {String} repetition Optional. Indicates whether to repeat the image in the fill area. One of "repeat", "repeat-x",
	 * "repeat-y", or "no-repeat". Defaults to "repeat".
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)	
	 **/
	p.beginBitmapStroke = function(image, repetition) {
		if (this._active) { this._newPath(); }
		repetition = repetition || "";
		var o = this._ctx.createPattern(image, repetition);
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
		return this;
	}
	
	
	/**
	 * Ends the current subpath, and begins a new one with no stroke. Functionally identical to beginStroke(null).
	 * @method endStroke
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.endStroke = function() {
		this.beginStroke();
		return this;
	}
	
	/**
	 * Maps the familiar ActionScript curveTo() method to the functionally similar quatraticCurveTo() method.
	 * @property curveTo
	 * @type Function
	 **/
	p.curveTo = p.quadraticCurveTo;
	
	/**
	 * Maps the familiar ActionScript drawRect() method to the functionally similar rect() method.
	 * @property drawRect
	 * @type Function
	 **/
	p.drawRect = p.rect;
	
	/**
	 * Draws a rounded rectangle with all corners with the specified radius.
	 * @method drawRoundRect
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @param {Number} radius Corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawRoundRect = function(x, y, w, h, radius) {
		this.drawRoundRectComplex(x, y, w, h, radius, radius, radius, radius);
		return this;
	}
	
	/**
	 * Draws a rounded rectangle with different corner radiuses.
	 * @method drawRoundRectComplex
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @param {Number} radiusTL Top left corner radius.
	 * @param {Number} radiusTR Top right corner radius.
	 * @param {Number} radiusBR Bottom right corner radius.
	 * @param {Number} radiusBL Bottom left corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawRoundRectComplex = function(x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL) {
		this._dirty = this._active = true;
		var pi = Math.PI, arc=this._ctx.arc, lineTo=this._ctx.lineTo;
		
		this._activeInstructions.push(
			new Command(this._ctx.moveTo, [x+radiusTL, y]),
			new Command(lineTo, [x+w-radiusTR, y]),
			(radiusTR>=0) ?
				new Command(arc, [x+w-radiusTR, y+radiusTR, radiusTR, -pi/2, 0]) :
				new Command(arc, [x+w, y, -radiusTR, pi, pi/2, true]) ,
			new Command(lineTo, [x+w, y+h-radiusBR]),
			(radiusBL>=0) ?
				new Command(arc, [x+w-radiusBR, y+h-radiusBR, radiusBR, 0, pi/2]) :
				new Command(arc, [x+w, y+h, -radiusBR, -pi/2, pi, true]) ,
			new Command(lineTo, [x+radiusBL, y+h]),
			(radiusBL>=0) ?
				new Command(arc, [x+radiusBL, y+h-radiusBL, radiusBL, pi/2, pi]) :
				new Command(arc, [x, y+h, -radiusBL, 0, -pi/2, true]) ,
			new Command(lineTo, [x, y+radiusTL]),
			(radiusTL>=0) ?
				new Command(arc, [x+radiusTL, y+radiusTL, radiusTL, pi, -pi/2]) :
				new Command(arc, [x, y, -radiusTL, pi/2, 0, true])
		);
		return this;
	} 
	
	/**
	 * Draws a circle with the specified radius at (x, y).
	*
	 * <pre><code>var g = new Graphics();
	*	g.setStrokeStyle(1);
	*	g.beginStroke(Graphics.getRGB(0,0,0));
	*	g.beginFill(Graphics.getRGB(255,0,0));
	*	g.drawCircle(0,0,3);
	*
	*	var s = new Shape(g);
	*		s.x = 100;
	*		s.y = 100;
	*
	*	stage.addChild(s);
	*	stage.update();</code></pre>
	 * @method drawCircle
	 * @param {Number} x x coordinate center point of circle.
	 * @param {Number} y y coordinate center point of circle.
	 * @param {Number} radius Radius of circle.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawCircle = function(x, y, radius) {
		this.arc(x, y, radius, 0, Math.PI*2);
		return this;
	}
	
	/**
	 * Draws an ellipse (oval).
	 * @method drawEllipse
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawEllipse = function(x, y, w, h) {
		this._dirty = this._active = true;
		var k = 0.5522848;
		var ox = (w / 2) * k;
		var oy = (h / 2) * k;
		var xe = x + w;
		var ye = y + h;
		var xm = x + w / 2;
		var ym = y + h / 2;
			
		this._activeInstructions.push(
			new Command(this._ctx.moveTo, [x, ym]),
			new Command(this._ctx.bezierCurveTo, [x, ym-oy, xm-ox, y, xm, y]),
			new Command(this._ctx.bezierCurveTo, [xm+ox, y, xe, ym-oy, xe, ym]),
			new Command(this._ctx.bezierCurveTo, [xe, ym+oy, xm+ox, ye, xm, ye]),
			new Command(this._ctx.bezierCurveTo, [xm-ox, ye, x, ym+oy, x, ym])
		);
		return this;
	}
	
	/**
	 * Draws a star if pointSize is greater than 0 or a regular polygon if pointSize is 0 with the specified number of points.
	 * For example, the following code will draw a familiar 5 pointed star shape centered at 100, 100 and with a radius of 50:
	 * myGraphics.beginFill("#FF0").drawPolyStar(100, 100, 50, 5, 0.6, -90); // -90 makes the first point vertical
	 * @method drawPolyStar
	 * @param {Number} x Position of the center of the shape.
	 * @param {Number} y Position of the center of the shape.
	 * @param {Number} radius The outer radius of the shape.
	 * @param {Number} sides The number of points on the star or sides on the polygon.
	 * @param {Number} pointSize The depth or "pointy-ness" of the star points. A pointSize of 0 will draw a regular polygon (no points), 
	 * a pointSize of 1 will draw nothing because the points are infinitely pointy.
	 * @param {Number} angle The angle of the first point / corner. For example a value of 0 will draw the first point directly to the 
	 * right of the center.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawPolyStar = function(x, y, radius, sides, pointSize, angle) {
		this._dirty = this._active = true;
		if (pointSize == null) { pointSize = 0; }
		pointSize = 1-pointSize;
		if (angle == null) { angle = 0; }
		else { angle /= 180/Math.PI; }
		var a = Math.PI/sides;
		
		this._activeInstructions.push(new Command(this._ctx.moveTo, [x+Math.cos(angle)*radius, y+Math.sin(angle)*radius]));
		for (var i=0; i<sides; i++) {
			angle += a;
			if (pointSize != 1) {
				this._activeInstructions.push(new Command(this._ctx.lineTo, [x+Math.cos(angle)*radius*pointSize, y+Math.sin(angle)*radius*pointSize]));
			}
			angle += a;
			this._activeInstructions.push(new Command(this._ctx.lineTo, [x+Math.cos(angle)*radius, y+Math.sin(angle)*radius]));
		}
		return this;
	}
	
	/**
	 * Decodes a compact encoded path string into a series of draw instructions.
	 * This format is not intended to be human readable, and is meant for use by authoring tools.
	 * The format uses a base64 character set, with each character representing 6 bits, to define a series of draw commands.
	 * <br/><br/>
	 * Each command is comprised of a single "header" character followed by a variable number of alternating x and y position values.
	 * Reading the header bits from left to right (most to least significant): bits 1 to 3 specify the type of operation
	 * (0-moveTo, 1-lineTo, 2-quadraticCurveTo, 3-bezierCurveTo, 4-7 unused). Bit 4 indicates whether position values use 12 bits (2 characters) 
	 * or 18 bits (3 characters), with a one indicating the latter. Bits 5 and 6 are currently unused.
	 * <br/><br/>
	 * Following the header is a series of 2 (moveTo, lineTo), 4 (quadraticCurveTo), or 6 (bezierCurveTo) parameters.
	 * These parameters are alternating x/y positions represented by 2 or 3 characters (as indicated by the 4th bit in the command char).
	 * These characters consist of a 1 bit sign (1 is negative, 0 is positive), followed by an 11 (2 char) or 17 (3 char) bit integer value.
	 * All position values are in tenths of a pixel.
	 * Except in the case of move operations, this value is a delta from the previous x or y position (as appropriate).
	 * <br/><br/>
	 * For example, the string "A3cAAMAu4AAA" represents a line starting at -150,0 and ending at 150,0.
	 * A - bits 000000. First 3 bits (000) indicate a moveTo operation. 4th bit (0) indicates 2 chars per parameter.
	 * n0 - 110111011100. Absolute x position of -150.0px. First bit indicates a negative value, remaining bits indicate 1500 tenths of a pixel. 
	 * AA - 000000000000. Absolute y position of 0.
	 * I - 001100. First 3 bits (001) indicate a lineTo operation. 4th bit (1) indicates 3 chars per parameter.
	 * Au4 - 000000101110111000. An x delta of 300.0px, which is added to the previous x value of -150.0px to provide an absolute position of +150.0px.
	 * AAA - 000000000000000000. A y delta value of 0.
	 * 
	 * @method decodePath
	 * @param {String} str The path string to decode.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.p = p.decodePath = function(str) {
		var instructions = [this.moveTo, this.lineTo, this.quadraticCurveTo, this.bezierCurveTo];
		var paramCount = [2, 2, 4, 6];
		var i=0, l=str.length;
		var params = [];
		var x=0, y=0;
		var base64 = Graphics.BASE_64;
		
		while (i<l) {
			var n = base64[str.charAt(i)];
			var fi = n>>3; // highest order bits 1-3 code for operation.
			var f = instructions[fi];
			// check that we have a valid instruction & that the unused bits are empty:
			if (!f || (n&3)) { throw("bad path data"); }
			var pl = paramCount[fi];
			if (!fi) { x=y=0; }
			params.length = 0;
			i++;
			var charCount = (n>>2&1)+2;  // 4th header bit indicates number size for this operation.
			for (var p=0; p<pl; p++) {
				var num = base64[str.charAt(i)];
				var sign = (num>>5) ? -1 : 1;
				num = ((num&31)<<6)|(base64[str.charAt(i+1)]);
				if (charCount == 3) { num = (num<<6)|(base64[str.charAt(i+2)]); }
				num = sign*num/10;
				if (p%2) { x = (num += x); }
				else { y = (num += y); }
				params[p] = num;
				i += charCount;
			}
			f.apply(this,params);
		}
		return this;
	}
	
	/**
	 * Returns a clone of this Graphics instance.
	 * @method clone
	 @return {Graphics} A clone of the current Graphics instance.
	 **/
	p.clone = function() {
		var o = new Graphics();
		o._instructions = this._instructions.slice();
		o._activeInstructions = this._activeInstructions.slice();
		o._oldInstructions = this._oldInstructions.slice();
		if (this._fillInstructions) { o._fillInstructions = this._fillInstructions.slice(); }
		if (this._strokeInstructions) { o._strokeInstructions = this._strokeInstructions.slice(); }
		if (this._strokeStyleInstructions) { o._strokeStyleInstructions = this._strokeStyleInstructions.slice(); }
		o._active = this._active;
		o._dirty = this._dirty;
		return o;
	}
		
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Graphics]";
	}
	
	
// tiny API:
	/** Shortcut to moveTo.
	 * @property mt
	 * @protected
	 * type Function
	 **/
	p.mt = p.moveTo;
	
	/** Shortcut to lineTo.
	 * @property lt
	 * @protected
	 * type Function
	 **/
	p.lt = p.lineTo;
	
	/** Shortcut to arcTo.
	 * @property at
	 * @protected
	 * type Function
	 **/
	p.at = p.arcTo;
	
	/** Shortcut to bezierCurveTo.
	 * @property bt
	 * @protected
	 * type Function
	 **/
	p.bt = p.bezierCurveTo;
	
	/** Shortcut to quadraticCurveTo / curveTo.
	 * @property qt
	 * @protected
	 * type Function
	 **/
	p.qt = p.quadraticCurveTo;
	
	/** Shortcut to arc.
	 * @property a
	 * @protected
	 * type Function
	 **/
	p.a = p.arc;
	
	/** Shortcut to rect.
	 * @property r
	 * @protected
	 * type Function
	 **/
	p.r = p.rect;
	
	/** Shortcut to closePath.
	 * @property cp
	 * @protected
	 * type Function
	 **/
	p.cp = p.closePath;
	
	/** Shortcut to clear.
	 * @property c
	 * @protected
	 * type Function
	 **/
	p.c = p.clear;
	
	/** Shortcut to beginFill.
	 * @property f
	 * @protected
	 * type Function
	 **/
	p.f = p.beginFill;
	
	/** Shortcut to beginLinearGradientFill.
	 * @property lf
	 * @protected
	 * type Function
	 **/
	p.lf = p.beginLinearGradientFill;
	
	/** Shortcut to beginRadialGradientFill.
	 * @property rf
	 * @protected
	 * type Function
	 **/
	p.rf = p.beginRadialGradientFill;
	
	/** Shortcut to beginBitmapFill.
	 * @property bf
	 * @protected
	 * type Function
	 **/
	p.bf = p.beginBitmapFill;
	
	/** Shortcut to endFill.
	 * @property ef
	 * @protected
	 * type Function
	 **/
	p.ef = p.endFill;
	
	/** Shortcut to setStrokeStyle.
	 * @property ss
	 * @protected
	 * type Function
	 **/
	p.ss = p.setStrokeStyle;
	
	/** Shortcut to beginStroke.
	 * @property s
	 * @protected
	 * type Function
	 **/
	p.s = p.beginStroke;
	
	/** Shortcut to beginLinearGradientStroke.
	 * @property ls
	 * @protected
	 * type Function
	 **/
	p.ls = p.beginLinearGradientStroke;
	
	/** Shortcut to beginRadialGradientStroke.
	 * @property rs
	 * @protected
	 * type Function
	 **/
	p.rs = p.beginRadialGradientStroke;
	
	/** Shortcut to beginBitmapStroke.
	 * @property bs
	 * @protected
	 * type Function
	 **/
	p.bs = p.beginBitmapStroke;
	
	/** Shortcut to endStroke.
	 * @property es
	 * @protected
	 * type Function
	 **/
	p.es = p.endStroke;
	
	/** Shortcut to drawRect.
	 * @property dr
	 * @protected
	 * type Function
	 **/
	p.dr = p.drawRect;
	
	/** Shortcut to drawRoundRect.
	 * @property rr
	 * @protected
	 * type Function
	 **/
	p.rr = p.drawRoundRect;
	
	/** Shortcut to drawRoundRectComplex.
	 * @property rc
	 * @protected
	 * type Function
	 **/
	p.rc = p.drawRoundRectComplex;
	
	/** Shortcut to drawCircle.
	 * @property dc
	 * @protected
	 * type Function
	 **/
	p.dc = p.drawCircle;
	
	/** Shortcut to drawEllipse.
	 * @property de
	 * @protected
	 * type Function
	 **/
	p.de = p.drawEllipse;
	
	/** Shortcut to drawPolyStar.
	 * @property dp
	 * @protected
	 * type Function
	 **/
	p.dp = p.drawPolyStar;
	
	/** Shortcut to decodePath.
	 * @property p
	 * @protected
	 * type Function
	 **/
	p.p
	
	
// private methods:
	/**
	 * @method _updateInstructions
	 * @protected
	 **/
	p._updateInstructions = function() {
		this._instructions = this._oldInstructions.slice()
		this._instructions.push(Graphics.beginCmd);
		 
		if (this._fillInstructions) { this._instructions.push.apply(this._instructions, this._fillInstructions); }
		if (this._strokeInstructions) {
			this._instructions.push.apply(this._instructions, this._strokeInstructions);
			if (this._strokeStyleInstructions) {
				this._instructions.push.apply(this._instructions, this._strokeStyleInstructions);
			}
		}
		
		this._instructions.push.apply(this._instructions, this._activeInstructions);
		
		if (this._fillInstructions) { this._instructions.push(Graphics.fillCmd); }
		if (this._strokeInstructions) { this._instructions.push(Graphics.strokeCmd); }
	}
	
	/**
	 * @method _newPath
	 * @protected
	 **/
	p._newPath = function() {
		if (this._dirty) { this._updateInstructions(); }
		this._oldInstructions = this._instructions;
		this._activeInstructions = [];
		this._active = this._dirty = false;
	}
	
	// used to create Commands that set properties:
	/**
	 * used to create Commands that set properties
	 * @method _setProp
	 * @param {String} name
	 * @param {String} value
	 * @protected
	 **/
	p._setProp = function(name, value) {
		this[name] = value;
	}

window.Graphics = Graphics;
}(window));

(function(window) {

/**
* A Shape allows you to display vector art in the display list. It composites a Graphics instance which exposes all of the vector
* drawing methods. The Graphics instance can be shared between multiple Shape instances to display the same vector graphics with different
* positions or transforms. If the vector art will not change between draws, you may want to use the cache() method to reduce the rendering cost.
* @class Shape
* @extends DisplayObject
* @param {Graphics} graphics Optional. The graphics instance to display. If null, a new Graphics instance will be created.
**/
var Shape = function(graphics) {
  this.initialize(graphics);
}
var p = Shape.prototype = new DisplayObject();

// public properties:
	/**
	 * The graphics instance to display.
	 * @property graphics
	 * @type Graphics
	 **/
	p.graphics = null;
	
// constructor:
	/**
	 * @property DisplayObject_initialize
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_initialize = p.initialize;

	/** 
	 * Initialization method.
	 * @method initialize
	 * param {Graphics} graphics
	 * @protected
	 **/
	p.initialize = function(graphics) {
		this.DisplayObject_initialize();
		this.graphics = graphics ? graphics : new Graphics();
	}

	/**
	 * Returns true or false indicating whether the Shape would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the Shape would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.graphics;
	}

	/**
	 * @property DisplayObject_draw
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_draw = p.draw;
	
	/**
	 * Draws the Shape into the specified context ignoring it's visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache. 
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this.graphics.draw(ctx);
		return true;
	}
	
	/**
	 * Returns a clone of this Shape. Some properties that are specific to this instance's current context are reverted to 
	 * their defaults (for example .parent).
	 * @method clone
	 * @param {Boolean} recursive If true, this Shape's Graphics instance will also be cloned. If false, the Graphics instance 
	 * will be shared with the new Shape.
	 **/
	p.clone = function(recursive) {
		var o = new Shape((recursive && this.graphics) ? this.graphics.clone() : this.graphics);
		this.cloneProps(o);
		return o;
	}
		
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Shape (name="+  this.name +")]";
	}

window.Shape = Shape;
}(window));




