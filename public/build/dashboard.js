"use strict";
(self["webpackChunkkimai"] = self["webpackChunkkimai"] || []).push([["dashboard"],{

/***/ "./assets/dashboard.js":
/*!*****************************!*\
  !*** ./assets/dashboard.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var gridstack__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gridstack */ "./node_modules/gridstack/dist/gridstack.js");
/* harmony import */ var gridstack__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gridstack__WEBPACK_IMPORTED_MODULE_0__);
/**
 * https://gridstackjs.com
 * https://github.com/gridstack/gridstack.js/tree/master/doc
 */
__webpack_require__(/*! gridstack/dist/gridstack.min.css */ "./node_modules/gridstack/dist/gridstack.min.css");
__webpack_require__(/*! gridstack/dist/gridstack-extra.min.css */ "./node_modules/gridstack/dist/gridstack-extra.min.css");

__webpack_require__.g.GridStack = gridstack__WEBPACK_IMPORTED_MODULE_0__.GridStack;

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-base-impl.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-base-impl.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * dd-base-impl.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDBaseImplement = void 0;
class DDBaseImplement {
    constructor() {
        /** @internal */
        this._eventRegister = {};
    }
    /** returns the enable state, but you have to call enable()/disable() to change (as other things need to happen) */
    get disabled() { return this._disabled; }
    on(event, callback) {
        this._eventRegister[event] = callback;
    }
    off(event) {
        delete this._eventRegister[event];
    }
    enable() {
        this._disabled = false;
    }
    disable() {
        this._disabled = true;
    }
    destroy() {
        delete this._eventRegister;
    }
    triggerEvent(eventName, event) {
        if (!this.disabled && this._eventRegister && this._eventRegister[eventName])
            return this._eventRegister[eventName](event);
    }
}
exports.DDBaseImplement = DDBaseImplement;
//# sourceMappingURL=dd-base-impl.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-draggable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-draggable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-draggable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDDraggable = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
// let count = 0; // TEST
class DDDraggable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, option = {}) {
        super();
        this.el = el;
        this.option = option;
        // get the element that is actually supposed to be dragged by
        let handleName = option.handle.substring(1);
        this.dragEl = el.classList.contains(handleName) ? el : el.querySelector(option.handle) || el;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this.enable();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        if (this.disabled === false)
            return;
        super.enable();
        this.dragEl.addEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener('touchstart', dd_touch_1.touchstart);
            this.dragEl.addEventListener('pointerdown', dd_touch_1.pointerdown);
            // this.dragEl.style.touchAction = 'none'; // not needed unlike pointerdown doc comment
        }
        this.el.classList.remove('ui-draggable-disabled');
        this.el.classList.add('ui-draggable');
    }
    disable(forDestroy = false) {
        if (this.disabled === true)
            return;
        super.disable();
        this.dragEl.removeEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener('touchstart', dd_touch_1.touchstart);
            this.dragEl.removeEventListener('pointerdown', dd_touch_1.pointerdown);
        }
        this.el.classList.remove('ui-draggable');
        if (!forDestroy)
            this.el.classList.add('ui-draggable-disabled');
    }
    destroy() {
        if (this.dragTimeout)
            window.clearTimeout(this.dragTimeout);
        delete this.dragTimeout;
        if (this.dragging)
            this._mouseUp(this.mouseDownEvent);
        this.disable(true);
        delete this.el;
        delete this.helper;
        delete this.option;
        super.destroy();
    }
    updateOption(opts) {
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        return this;
    }
    /** @internal call when mouse goes down before a dragstart happens */
    _mouseDown(e) {
        // don't let more than one widget handle mouseStart
        if (dd_manager_1.DDManager.mouseHandled)
            return;
        if (e.button !== 0)
            return true; // only left click
        // make sure we are not clicking on known object that handles mouseDown (TODO: make this extensible ?) #2054
        const skipMouseDown = ['input', 'textarea', 'button', 'select', 'option'];
        const name = e.target.nodeName.toLowerCase();
        if (skipMouseDown.find(skip => skip === name))
            return true;
        // also check for content editable
        if (e.target.closest('[contenteditable="true"]'))
            return true;
        // REMOVE: why would we get the event if it wasn't for us or child ?
        // make sure we are clicking on a drag handle or child of it...
        // Note: we don't need to check that's handle is an immediate child, as mouseHandled will prevent parents from also handling it (lowest wins)
        // let className = this.option.handle.substring(1);
        // let el = e.target as HTMLElement;
        // while (el && !el.classList.contains(className)) { el = el.parentElement; }
        // if (!el) return;
        this.mouseDownEvent = e;
        delete this.dragging;
        delete dd_manager_1.DDManager.dragElement;
        delete dd_manager_1.DDManager.dropElement;
        // document handler so we can continue receiving moves as the item is 'fixed' position, and capture=true so WE get a first crack
        document.addEventListener('mousemove', this._mouseMove, true); // true=capture, not bubble
        document.addEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener('touchmove', dd_touch_1.touchmove);
            this.dragEl.addEventListener('touchend', dd_touch_1.touchend);
        }
        e.preventDefault();
        // preventDefault() prevents blur event which occurs just after mousedown event.
        // if an editable content has focus, then blur must be call
        if (document.activeElement)
            document.activeElement.blur();
        dd_manager_1.DDManager.mouseHandled = true;
        return true;
    }
    /** @internal method to call actual drag event */
    _callDrag(e) {
        if (!this.dragging)
            return;
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'drag' });
        if (this.option.drag) {
            this.option.drag(ev, this.ui());
        }
        this.triggerEvent('drag', ev);
    }
    /** @internal called when the main page (after successful mousedown) receives a move event to drag the item around the screen */
    _mouseMove(e) {
        var _a;
        // console.log(`${count++} move ${e.x},${e.y}`)
        let s = this.mouseDownEvent;
        if (this.dragging) {
            this._dragFollow(e);
            // delay actual grid handling drag until we pause for a while if set
            if (dd_manager_1.DDManager.pauseDrag) {
                const pause = Number.isInteger(dd_manager_1.DDManager.pauseDrag) ? dd_manager_1.DDManager.pauseDrag : 100;
                if (this.dragTimeout)
                    window.clearTimeout(this.dragTimeout);
                this.dragTimeout = window.setTimeout(() => this._callDrag(e), pause);
            }
            else {
                this._callDrag(e);
            }
        }
        else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 3) {
            /**
             * don't start unless we've moved at least 3 pixels
             */
            this.dragging = true;
            dd_manager_1.DDManager.dragElement = this;
            // if we're dragging an actual grid item, set the current drop as the grid (to detect enter/leave)
            let grid = (_a = this.el.gridstackNode) === null || _a === void 0 ? void 0 : _a.grid;
            if (grid) {
                dd_manager_1.DDManager.dropElement = grid.el.ddElement.ddDroppable;
            }
            else {
                delete dd_manager_1.DDManager.dropElement;
            }
            this.helper = this._createHelper(e);
            this._setupHelperContainmentStyle();
            this.dragOffset = this._getDragOffset(e, this.el, this.helperContainment);
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dragstart' });
            this._setupHelperStyle(e);
            if (this.option.start) {
                this.option.start(ev, this.ui());
            }
            this.triggerEvent('dragstart', ev);
        }
        e.preventDefault(); // needed otherwise we get text sweep text selection as we drag around
        return true;
    }
    /** @internal call when the mouse gets released to drop the item at current location */
    _mouseUp(e) {
        var _a;
        document.removeEventListener('mousemove', this._mouseMove, true);
        document.removeEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener('touchmove', dd_touch_1.touchmove, true);
            this.dragEl.removeEventListener('touchend', dd_touch_1.touchend, true);
        }
        if (this.dragging) {
            delete this.dragging;
            // reset the drop target if dragging over ourself (already parented, just moving during stop callback below)
            if (((_a = dd_manager_1.DDManager.dropElement) === null || _a === void 0 ? void 0 : _a.el) === this.el.parentElement) {
                delete dd_manager_1.DDManager.dropElement;
            }
            this.helperContainment.style.position = this.parentOriginStylePosition || null;
            if (this.helper === this.el) {
                this._removeHelperStyle();
            }
            else {
                this.helper.remove();
            }
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dragstop' });
            if (this.option.stop) {
                this.option.stop(ev); // NOTE: destroy() will be called when removing item, so expect NULL ptr after!
            }
            this.triggerEvent('dragstop', ev);
            // call the droppable method to receive the item
            if (dd_manager_1.DDManager.dropElement) {
                dd_manager_1.DDManager.dropElement.drop(e);
            }
        }
        delete this.helper;
        delete this.mouseDownEvent;
        delete dd_manager_1.DDManager.dragElement;
        delete dd_manager_1.DDManager.dropElement;
        delete dd_manager_1.DDManager.mouseHandled;
        e.preventDefault();
    }
    /** @internal create a clone copy (or user defined method) of the original drag item if set */
    _createHelper(event) {
        let helper = this.el;
        if (typeof this.option.helper === 'function') {
            helper = this.option.helper(event);
        }
        else if (this.option.helper === 'clone') {
            helper = utils_1.Utils.cloneNode(this.el);
        }
        if (!document.body.contains(helper)) {
            utils_1.Utils.appendTo(helper, this.option.appendTo === 'parent' ? this.el.parentNode : this.option.appendTo);
        }
        if (helper === this.el) {
            this.dragElementOriginStyle = DDDraggable.originStyleProp.map(prop => this.el.style[prop]);
        }
        return helper;
    }
    /** @internal set the fix position of the dragged item */
    _setupHelperStyle(e) {
        this.helper.classList.add('ui-draggable-dragging');
        // TODO: set all at once with style.cssText += ... ? https://stackoverflow.com/questions/3968593
        const style = this.helper.style;
        style.pointerEvents = 'none'; // needed for over items to get enter/leave
        // style.cursor = 'move'; //  TODO: can't set with pointerEvents=none ! (done in CSS as well)
        style['min-width'] = 0; // since we no longer relative to our parent and we don't resize anyway (normally 100/#column %)
        style.width = this.dragOffset.width + 'px';
        style.height = this.dragOffset.height + 'px';
        style.willChange = 'left, top';
        style.position = 'fixed'; // let us drag between grids by not clipping as parent .grid-stack is position: 'relative'
        this._dragFollow(e); // now position it
        style.transition = 'none'; // show up instantly
        setTimeout(() => {
            if (this.helper) {
                style.transition = null; // recover animation
            }
        }, 0);
        return this;
    }
    /** @internal restore back the original style before dragging */
    _removeHelperStyle() {
        var _a;
        this.helper.classList.remove('ui-draggable-dragging');
        let node = (_a = this.helper) === null || _a === void 0 ? void 0 : _a.gridstackNode;
        // don't bother restoring styles if we're gonna remove anyway...
        if (!(node === null || node === void 0 ? void 0 : node._isAboutToRemove) && this.dragElementOriginStyle) {
            let helper = this.helper;
            // don't animate, otherwise we animate offseted when switching back to 'absolute' from 'fixed'.
            // TODO: this also removes resizing animation which doesn't have this issue, but others.
            // Ideally both would animate ('move' would immediately restore 'absolute' and adjust coordinate to match,
            // then trigger a delay (repaint) to restore to final dest with animate) but then we need to make sure 'resizestop'
            // is called AFTER 'transitionend' event is received (see https://github.com/gridstack/gridstack.js/issues/2033)
            let transition = this.dragElementOriginStyle['transition'] || null;
            helper.style.transition = this.dragElementOriginStyle['transition'] = 'none'; // can't be NULL #1973
            DDDraggable.originStyleProp.forEach(prop => helper.style[prop] = this.dragElementOriginStyle[prop] || null);
            setTimeout(() => helper.style.transition = transition, 50); // recover animation from saved vars after a pause (0 isn't enough #1973)
        }
        delete this.dragElementOriginStyle;
        return this;
    }
    /** @internal updates the top/left position to follow the mouse */
    _dragFollow(e) {
        let containmentRect = { left: 0, top: 0 };
        // if (this.helper.style.position === 'absolute') { // we use 'fixed'
        //   const { left, top } = this.helperContainment.getBoundingClientRect();
        //   containmentRect = { left, top };
        // }
        const style = this.helper.style;
        const offset = this.dragOffset;
        style.left = e.clientX + offset.offsetLeft - containmentRect.left + 'px';
        style.top = e.clientY + offset.offsetTop - containmentRect.top + 'px';
    }
    /** @internal */
    _setupHelperContainmentStyle() {
        this.helperContainment = this.helper.parentElement;
        if (this.helper.style.position !== 'fixed') {
            this.parentOriginStylePosition = this.helperContainment.style.position;
            if (window.getComputedStyle(this.helperContainment).position.match(/static/)) {
                this.helperContainment.style.position = 'relative';
            }
        }
        return this;
    }
    /** @internal */
    _getDragOffset(event, el, parent) {
        // in case ancestor has transform/perspective css properties that change the viewpoint
        let xformOffsetX = 0;
        let xformOffsetY = 0;
        if (parent) {
            const testEl = document.createElement('div');
            utils_1.Utils.addElStyles(testEl, {
                opacity: '0',
                position: 'fixed',
                top: 0 + 'px',
                left: 0 + 'px',
                width: '1px',
                height: '1px',
                zIndex: '-999999',
            });
            parent.appendChild(testEl);
            const testElPosition = testEl.getBoundingClientRect();
            parent.removeChild(testEl);
            xformOffsetX = testElPosition.left;
            xformOffsetY = testElPosition.top;
            // TODO: scale ?
        }
        const targetOffset = el.getBoundingClientRect();
        return {
            left: targetOffset.left,
            top: targetOffset.top,
            offsetLeft: -event.clientX + targetOffset.left - xformOffsetX,
            offsetTop: -event.clientY + targetOffset.top - xformOffsetY,
            width: targetOffset.width,
            height: targetOffset.height
        };
    }
    /** @internal TODO: set to public as called by DDDroppable! */
    ui() {
        const containmentEl = this.el.parentElement;
        const containmentRect = containmentEl.getBoundingClientRect();
        const offset = this.helper.getBoundingClientRect();
        return {
            position: {
                top: offset.top - containmentRect.top,
                left: offset.left - containmentRect.left
            }
            /* not used by GridStack for now...
            helper: [this.helper], //The object arr representing the helper that's being dragged.
            offset: { top: offset.top, left: offset.left } // Current offset position of the helper as { top, left } object.
            */
        };
    }
}
exports.DDDraggable = DDDraggable;
/** @internal properties we change during dragging, and restore back */
DDDraggable.originStyleProp = ['transition', 'pointerEvents', 'position', 'left', 'top', 'minWidth', 'willChange'];
//# sourceMappingURL=dd-draggable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-droppable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-droppable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-droppable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDDroppable = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
// let count = 0; // TEST
class DDDroppable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, opts = {}) {
        super();
        this.el = el;
        this.option = opts;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseEnter = this._mouseEnter.bind(this);
        this._mouseLeave = this._mouseLeave.bind(this);
        this.enable();
        this._setupAccept();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        if (this.disabled === false)
            return;
        super.enable();
        this.el.classList.add('ui-droppable');
        this.el.classList.remove('ui-droppable-disabled');
        this.el.addEventListener('mouseenter', this._mouseEnter);
        this.el.addEventListener('mouseleave', this._mouseLeave);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('pointerenter', dd_touch_1.pointerenter);
            this.el.addEventListener('pointerleave', dd_touch_1.pointerleave);
        }
    }
    disable(forDestroy = false) {
        if (this.disabled === true)
            return;
        super.disable();
        this.el.classList.remove('ui-droppable');
        if (!forDestroy)
            this.el.classList.add('ui-droppable-disabled');
        this.el.removeEventListener('mouseenter', this._mouseEnter);
        this.el.removeEventListener('mouseleave', this._mouseLeave);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('pointerenter', dd_touch_1.pointerenter);
            this.el.removeEventListener('pointerleave', dd_touch_1.pointerleave);
        }
    }
    destroy() {
        this.disable(true);
        this.el.classList.remove('ui-droppable');
        this.el.classList.remove('ui-droppable-disabled');
        super.destroy();
    }
    updateOption(opts) {
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        this._setupAccept();
        return this;
    }
    /** @internal called when the cursor enters our area - prepare for a possible drop and track leaving */
    _mouseEnter(e) {
        // console.log(`${count++} Enter ${this.el.id || (this.el as GridHTMLElement).gridstack.opts.id}`); // TEST
        if (!dd_manager_1.DDManager.dragElement)
            return;
        if (!this._canDrop(dd_manager_1.DDManager.dragElement.el))
            return;
        e.preventDefault();
        e.stopPropagation();
        // make sure when we enter this, that the last one gets a leave FIRST to correctly cleanup as we don't always do
        if (dd_manager_1.DDManager.dropElement && dd_manager_1.DDManager.dropElement !== this) {
            dd_manager_1.DDManager.dropElement._mouseLeave(e);
        }
        dd_manager_1.DDManager.dropElement = this;
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dropover' });
        if (this.option.over) {
            this.option.over(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('dropover', ev);
        this.el.classList.add('ui-droppable-over');
        // console.log('tracking'); // TEST
    }
    /** @internal called when the item is leaving our area, stop tracking if we had moving item */
    _mouseLeave(e) {
        var _a;
        // console.log(`${count++} Leave ${this.el.id || (this.el as GridHTMLElement).gridstack.opts.id}`); // TEST
        if (!dd_manager_1.DDManager.dragElement || dd_manager_1.DDManager.dropElement !== this)
            return;
        e.preventDefault();
        e.stopPropagation();
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dropout' });
        if (this.option.out) {
            this.option.out(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('dropout', ev);
        if (dd_manager_1.DDManager.dropElement === this) {
            delete dd_manager_1.DDManager.dropElement;
            // console.log('not tracking'); // TEST
            // if we're still over a parent droppable, send it an enter as we don't get one from leaving nested children
            let parentDrop;
            let parent = this.el.parentElement;
            while (!parentDrop && parent) {
                parentDrop = (_a = parent.ddElement) === null || _a === void 0 ? void 0 : _a.ddDroppable;
                parent = parent.parentElement;
            }
            if (parentDrop) {
                parentDrop._mouseEnter(e);
            }
        }
    }
    /** item is being dropped on us - called by the drag mouseup handler - this calls the client drop event */
    drop(e) {
        e.preventDefault();
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'drop' });
        if (this.option.drop) {
            this.option.drop(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('drop', ev);
    }
    /** @internal true if element matches the string/method accept option */
    _canDrop(el) {
        return el && (!this.accept || this.accept(el));
    }
    /** @internal */
    _setupAccept() {
        if (!this.option.accept)
            return this;
        if (typeof this.option.accept === 'string') {
            this.accept = (el) => el.matches(this.option.accept);
        }
        else {
            this.accept = this.option.accept;
        }
        return this;
    }
    /** @internal */
    _ui(drag) {
        return Object.assign({ draggable: drag.el }, drag.ui());
    }
}
exports.DDDroppable = DDDroppable;
//# sourceMappingURL=dd-droppable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-element.js":
/*!***************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-element.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-elements.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDElement = void 0;
const dd_resizable_1 = __webpack_require__(/*! ./dd-resizable */ "./node_modules/gridstack/dist/dd-resizable.js");
const dd_draggable_1 = __webpack_require__(/*! ./dd-draggable */ "./node_modules/gridstack/dist/dd-draggable.js");
const dd_droppable_1 = __webpack_require__(/*! ./dd-droppable */ "./node_modules/gridstack/dist/dd-droppable.js");
class DDElement {
    constructor(el) {
        this.el = el;
    }
    static init(el) {
        if (!el.ddElement) {
            el.ddElement = new DDElement(el);
        }
        return el.ddElement;
    }
    on(eventName, callback) {
        if (this.ddDraggable && ['drag', 'dragstart', 'dragstop'].indexOf(eventName) > -1) {
            this.ddDraggable.on(eventName, callback);
        }
        else if (this.ddDroppable && ['drop', 'dropover', 'dropout'].indexOf(eventName) > -1) {
            this.ddDroppable.on(eventName, callback);
        }
        else if (this.ddResizable && ['resizestart', 'resize', 'resizestop'].indexOf(eventName) > -1) {
            this.ddResizable.on(eventName, callback);
        }
        return this;
    }
    off(eventName) {
        if (this.ddDraggable && ['drag', 'dragstart', 'dragstop'].indexOf(eventName) > -1) {
            this.ddDraggable.off(eventName);
        }
        else if (this.ddDroppable && ['drop', 'dropover', 'dropout'].indexOf(eventName) > -1) {
            this.ddDroppable.off(eventName);
        }
        else if (this.ddResizable && ['resizestart', 'resize', 'resizestop'].indexOf(eventName) > -1) {
            this.ddResizable.off(eventName);
        }
        return this;
    }
    setupDraggable(opts) {
        if (!this.ddDraggable) {
            this.ddDraggable = new dd_draggable_1.DDDraggable(this.el, opts);
        }
        else {
            this.ddDraggable.updateOption(opts);
        }
        return this;
    }
    cleanDraggable() {
        if (this.ddDraggable) {
            this.ddDraggable.destroy();
            delete this.ddDraggable;
        }
        return this;
    }
    setupResizable(opts) {
        if (!this.ddResizable) {
            this.ddResizable = new dd_resizable_1.DDResizable(this.el, opts);
        }
        else {
            this.ddResizable.updateOption(opts);
        }
        return this;
    }
    cleanResizable() {
        if (this.ddResizable) {
            this.ddResizable.destroy();
            delete this.ddResizable;
        }
        return this;
    }
    setupDroppable(opts) {
        if (!this.ddDroppable) {
            this.ddDroppable = new dd_droppable_1.DDDroppable(this.el, opts);
        }
        else {
            this.ddDroppable.updateOption(opts);
        }
        return this;
    }
    cleanDroppable() {
        if (this.ddDroppable) {
            this.ddDroppable.destroy();
            delete this.ddDroppable;
        }
        return this;
    }
}
exports.DDElement = DDElement;
//# sourceMappingURL=dd-element.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-gridstack.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-gridstack.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-gridstack.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDGridStack = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const dd_element_1 = __webpack_require__(/*! ./dd-element */ "./node_modules/gridstack/dist/dd-element.js");
// let count = 0; // TEST
/**
 * HTML Native Mouse and Touch Events Drag and Drop functionality.
 */
class DDGridStack {
    resizable(el, opts, key, value) {
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddResizable && dEl.ddResizable[opts](); // can't create DD as it requires options for setupResizable()
            }
            else if (opts === 'destroy') {
                dEl.ddResizable && dEl.cleanResizable();
            }
            else if (opts === 'option') {
                dEl.setupResizable({ [key]: value });
            }
            else {
                const grid = dEl.el.gridstackNode.grid;
                let handles = dEl.el.getAttribute('gs-resize-handles') ? dEl.el.getAttribute('gs-resize-handles') : grid.opts.resizable.handles;
                let autoHide = !grid.opts.alwaysShowResizeHandle;
                dEl.setupResizable(Object.assign(Object.assign(Object.assign({}, grid.opts.resizable), { handles, autoHide }), {
                    start: opts.start,
                    stop: opts.stop,
                    resize: opts.resize
                }));
            }
        });
        return this;
    }
    draggable(el, opts, key, value) {
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDraggable && dEl.ddDraggable[opts](); // can't create DD as it requires options for setupDraggable()
            }
            else if (opts === 'destroy') {
                dEl.ddDraggable && dEl.cleanDraggable();
            }
            else if (opts === 'option') {
                dEl.setupDraggable({ [key]: value });
            }
            else {
                const grid = dEl.el.gridstackNode.grid;
                dEl.setupDraggable(Object.assign(Object.assign({}, grid.opts.draggable), {
                    // containment: (grid.parentGridItem && !grid.opts.dragOut) ? grid.el.parentElement : (grid.opts.draggable.containment || null),
                    start: opts.start,
                    stop: opts.stop,
                    drag: opts.drag
                }));
            }
        });
        return this;
    }
    dragIn(el, opts) {
        this._getDDElements(el).forEach(dEl => dEl.setupDraggable(opts));
        return this;
    }
    droppable(el, opts, key, value) {
        if (typeof opts.accept === 'function' && !opts._accept) {
            opts._accept = opts.accept;
            opts.accept = (el) => opts._accept(el);
        }
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDroppable && dEl.ddDroppable[opts]();
            }
            else if (opts === 'destroy') {
                if (dEl.ddDroppable) { // error to call destroy if not there
                    dEl.cleanDroppable();
                }
            }
            else if (opts === 'option') {
                dEl.setupDroppable({ [key]: value });
            }
            else {
                dEl.setupDroppable(opts);
            }
        });
        return this;
    }
    /** true if element is droppable */
    isDroppable(el) {
        return !!(el && el.ddElement && el.ddElement.ddDroppable && !el.ddElement.ddDroppable.disabled);
    }
    /** true if element is draggable */
    isDraggable(el) {
        return !!(el && el.ddElement && el.ddElement.ddDraggable && !el.ddElement.ddDraggable.disabled);
    }
    /** true if element is draggable */
    isResizable(el) {
        return !!(el && el.ddElement && el.ddElement.ddResizable && !el.ddElement.ddResizable.disabled);
    }
    on(el, name, callback) {
        this._getDDElements(el).forEach(dEl => dEl.on(name, (event) => {
            callback(event, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.el : event.target, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.helper : null);
        }));
        return this;
    }
    off(el, name) {
        this._getDDElements(el).forEach(dEl => dEl.off(name));
        return this;
    }
    /** @internal returns a list of DD elements, creating them on the fly by default */
    _getDDElements(els, create = true) {
        let hosts = utils_1.Utils.getElements(els);
        if (!hosts.length)
            return [];
        let list = hosts.map(e => e.ddElement || (create ? dd_element_1.DDElement.init(e) : null));
        if (!create) {
            list.filter(d => d);
        } // remove nulls
        return list;
    }
}
exports.DDGridStack = DDGridStack;
//# sourceMappingURL=dd-gridstack.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-manager.js":
/*!***************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-manager.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * dd-manager.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDManager = void 0;
/**
 * globals that are shared across Drag & Drop instances
 */
class DDManager {
}
exports.DDManager = DDManager;
//# sourceMappingURL=dd-manager.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-resizable-handle.js":
/*!************************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-resizable-handle.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-resizable-handle.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDResizableHandle = void 0;
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
class DDResizableHandle {
    constructor(host, direction, option) {
        /** @internal true after we've moved enough pixels to start a resize */
        this.moving = false;
        this.host = host;
        this.dir = direction;
        this.option = option;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this._init();
    }
    /** @internal */
    _init() {
        const el = document.createElement('div');
        el.classList.add('ui-resizable-handle');
        el.classList.add(`${DDResizableHandle.prefix}${this.dir}`);
        el.style.zIndex = '100';
        el.style.userSelect = 'none';
        this.el = el;
        this.host.appendChild(this.el);
        this.el.addEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('touchstart', dd_touch_1.touchstart);
            this.el.addEventListener('pointerdown', dd_touch_1.pointerdown);
            // this.el.style.touchAction = 'none'; // not needed unlike pointerdown doc comment
        }
        return this;
    }
    /** call this when resize handle needs to be removed and cleaned up */
    destroy() {
        if (this.moving)
            this._mouseUp(this.mouseDownEvent);
        this.el.removeEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('touchstart', dd_touch_1.touchstart);
            this.el.removeEventListener('pointerdown', dd_touch_1.pointerdown);
        }
        this.host.removeChild(this.el);
        delete this.el;
        delete this.host;
        return this;
    }
    /** @internal called on mouse down on us: capture move on the entire document (mouse might not stay on us) until we release the mouse */
    _mouseDown(e) {
        this.mouseDownEvent = e;
        document.addEventListener('mousemove', this._mouseMove, true); // capture, not bubble
        document.addEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('touchmove', dd_touch_1.touchmove);
            this.el.addEventListener('touchend', dd_touch_1.touchend);
        }
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _mouseMove(e) {
        let s = this.mouseDownEvent;
        if (this.moving) {
            this._triggerEvent('move', e);
        }
        else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 2) {
            // don't start unless we've moved at least 3 pixels
            this.moving = true;
            this._triggerEvent('start', this.mouseDownEvent);
            this._triggerEvent('move', e);
        }
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _mouseUp(e) {
        if (this.moving) {
            this._triggerEvent('stop', e);
        }
        document.removeEventListener('mousemove', this._mouseMove, true);
        document.removeEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('touchmove', dd_touch_1.touchmove);
            this.el.removeEventListener('touchend', dd_touch_1.touchend);
        }
        delete this.moving;
        delete this.mouseDownEvent;
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _triggerEvent(name, event) {
        if (this.option[name])
            this.option[name](event);
        return this;
    }
}
exports.DDResizableHandle = DDResizableHandle;
/** @internal */
DDResizableHandle.prefix = 'ui-resizable-';
//# sourceMappingURL=dd-resizable-handle.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-resizable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-resizable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-resizable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDResizable = void 0;
const dd_resizable_handle_1 = __webpack_require__(/*! ./dd-resizable-handle */ "./node_modules/gridstack/dist/dd-resizable-handle.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
class DDResizable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, opts = {}) {
        super();
        /** @internal */
        this._ui = () => {
            const containmentEl = this.el.parentElement;
            const containmentRect = containmentEl.getBoundingClientRect();
            const newRect = {
                width: this.originalRect.width,
                height: this.originalRect.height + this.scrolled,
                left: this.originalRect.left,
                top: this.originalRect.top - this.scrolled
            };
            const rect = this.temporalRect || newRect;
            return {
                position: {
                    left: rect.left - containmentRect.left,
                    top: rect.top - containmentRect.top
                },
                size: {
                    width: rect.width,
                    height: rect.height
                }
                /* Gridstack ONLY needs position set above... keep around in case.
                element: [this.el], // The object representing the element to be resized
                helper: [], // TODO: not support yet - The object representing the helper that's being resized
                originalElement: [this.el],// we don't wrap here, so simplify as this.el //The object representing the original element before it is wrapped
                originalPosition: { // The position represented as { left, top } before the resizable is resized
                  left: this.originalRect.left - containmentRect.left,
                  top: this.originalRect.top - containmentRect.top
                },
                originalSize: { // The size represented as { width, height } before the resizable is resized
                  width: this.originalRect.width,
                  height: this.originalRect.height
                }
                */
            };
        };
        this.el = el;
        this.option = opts;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseOver = this._mouseOver.bind(this);
        this._mouseOut = this._mouseOut.bind(this);
        this.enable();
        this._setupAutoHide(this.option.autoHide);
        this._setupHandlers();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        super.enable();
        this.el.classList.add('ui-resizable');
        this.el.classList.remove('ui-resizable-disabled');
        this._setupAutoHide(this.option.autoHide);
    }
    disable() {
        super.disable();
        this.el.classList.add('ui-resizable-disabled');
        this.el.classList.remove('ui-resizable');
        this._setupAutoHide(false);
    }
    destroy() {
        this._removeHandlers();
        this._setupAutoHide(false);
        this.el.classList.remove('ui-resizable');
        delete this.el;
        super.destroy();
    }
    updateOption(opts) {
        let updateHandles = (opts.handles && opts.handles !== this.option.handles);
        let updateAutoHide = (opts.autoHide && opts.autoHide !== this.option.autoHide);
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        if (updateHandles) {
            this._removeHandlers();
            this._setupHandlers();
        }
        if (updateAutoHide) {
            this._setupAutoHide(this.option.autoHide);
        }
        return this;
    }
    /** @internal turns auto hide on/off */
    _setupAutoHide(auto) {
        if (auto) {
            this.el.classList.add('ui-resizable-autohide');
            // use mouseover and not mouseenter to get better performance and track for nested cases
            this.el.addEventListener('mouseover', this._mouseOver);
            this.el.addEventListener('mouseout', this._mouseOut);
        }
        else {
            this.el.classList.remove('ui-resizable-autohide');
            this.el.removeEventListener('mouseover', this._mouseOver);
            this.el.removeEventListener('mouseout', this._mouseOut);
            if (dd_manager_1.DDManager.overResizeElement === this) {
                delete dd_manager_1.DDManager.overResizeElement;
            }
        }
        return this;
    }
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mouseOver(e) {
        // console.log(`${count++} pre-enter ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        // already over a child, ignore. Ideally we just call e.stopPropagation() but see https://github.com/gridstack/gridstack.js/issues/2018
        if (dd_manager_1.DDManager.overResizeElement || dd_manager_1.DDManager.dragElement)
            return;
        dd_manager_1.DDManager.overResizeElement = this;
        // console.log(`${count++} enter ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        this.el.classList.remove('ui-resizable-autohide');
    }
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mouseOut(e) {
        // console.log(`${count++} pre-leave ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        if (dd_manager_1.DDManager.overResizeElement !== this)
            return;
        delete dd_manager_1.DDManager.overResizeElement;
        // console.log(`${count++} leave ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        this.el.classList.add('ui-resizable-autohide');
    }
    /** @internal */
    _setupHandlers() {
        let handlerDirection = this.option.handles || 'e,s,se';
        if (handlerDirection === 'all') {
            handlerDirection = 'n,e,s,w,se,sw,ne,nw';
        }
        this.handlers = handlerDirection.split(',')
            .map(dir => dir.trim())
            .map(dir => new dd_resizable_handle_1.DDResizableHandle(this.el, dir, {
            start: (event) => {
                this._resizeStart(event);
            },
            stop: (event) => {
                this._resizeStop(event);
            },
            move: (event) => {
                this._resizing(event, dir);
            }
        }));
        return this;
    }
    /** @internal */
    _resizeStart(event) {
        this.originalRect = this.el.getBoundingClientRect();
        this.scrollEl = utils_1.Utils.getScrollElement(this.el);
        this.scrollY = this.scrollEl.scrollTop;
        this.scrolled = 0;
        this.startEvent = event;
        this._setupHelper();
        this._applyChange();
        const ev = utils_1.Utils.initEvent(event, { type: 'resizestart', target: this.el });
        if (this.option.start) {
            this.option.start(ev, this._ui());
        }
        this.el.classList.add('ui-resizable-resizing');
        this.triggerEvent('resizestart', ev);
        return this;
    }
    /** @internal */
    _resizing(event, dir) {
        this.scrolled = this.scrollEl.scrollTop - this.scrollY;
        this.temporalRect = this._getChange(event, dir);
        this._applyChange();
        const ev = utils_1.Utils.initEvent(event, { type: 'resize', target: this.el });
        if (this.option.resize) {
            this.option.resize(ev, this._ui());
        }
        this.triggerEvent('resize', ev);
        return this;
    }
    /** @internal */
    _resizeStop(event) {
        const ev = utils_1.Utils.initEvent(event, { type: 'resizestop', target: this.el });
        if (this.option.stop) {
            this.option.stop(ev); // Note: ui() not used by gridstack so don't pass
        }
        this.el.classList.remove('ui-resizable-resizing');
        this.triggerEvent('resizestop', ev);
        this._cleanHelper();
        delete this.startEvent;
        delete this.originalRect;
        delete this.temporalRect;
        delete this.scrollY;
        delete this.scrolled;
        return this;
    }
    /** @internal */
    _setupHelper() {
        this.elOriginStyleVal = DDResizable._originStyleProp.map(prop => this.el.style[prop]);
        this.parentOriginStylePosition = this.el.parentElement.style.position;
        if (window.getComputedStyle(this.el.parentElement).position.match(/static/)) {
            this.el.parentElement.style.position = 'relative';
        }
        this.el.style.position = 'absolute';
        this.el.style.opacity = '0.8';
        return this;
    }
    /** @internal */
    _cleanHelper() {
        DDResizable._originStyleProp.forEach((prop, i) => {
            this.el.style[prop] = this.elOriginStyleVal[i] || null;
        });
        this.el.parentElement.style.position = this.parentOriginStylePosition || null;
        return this;
    }
    /** @internal */
    _getChange(event, dir) {
        const oEvent = this.startEvent;
        const newRect = {
            width: this.originalRect.width,
            height: this.originalRect.height + this.scrolled,
            left: this.originalRect.left,
            top: this.originalRect.top - this.scrolled
        };
        const offsetX = event.clientX - oEvent.clientX;
        const offsetY = event.clientY - oEvent.clientY;
        if (dir.indexOf('e') > -1) {
            newRect.width += offsetX;
        }
        else if (dir.indexOf('w') > -1) {
            newRect.width -= offsetX;
            newRect.left += offsetX;
        }
        if (dir.indexOf('s') > -1) {
            newRect.height += offsetY;
        }
        else if (dir.indexOf('n') > -1) {
            newRect.height -= offsetY;
            newRect.top += offsetY;
        }
        const constrain = this._constrainSize(newRect.width, newRect.height);
        if (Math.round(newRect.width) !== Math.round(constrain.width)) { // round to ignore slight round-off errors
            if (dir.indexOf('w') > -1) {
                newRect.left += newRect.width - constrain.width;
            }
            newRect.width = constrain.width;
        }
        if (Math.round(newRect.height) !== Math.round(constrain.height)) {
            if (dir.indexOf('n') > -1) {
                newRect.top += newRect.height - constrain.height;
            }
            newRect.height = constrain.height;
        }
        return newRect;
    }
    /** @internal constrain the size to the set min/max values */
    _constrainSize(oWidth, oHeight) {
        const maxWidth = this.option.maxWidth || Number.MAX_SAFE_INTEGER;
        const minWidth = this.option.minWidth || oWidth;
        const maxHeight = this.option.maxHeight || Number.MAX_SAFE_INTEGER;
        const minHeight = this.option.minHeight || oHeight;
        const width = Math.min(maxWidth, Math.max(minWidth, oWidth));
        const height = Math.min(maxHeight, Math.max(minHeight, oHeight));
        return { width, height };
    }
    /** @internal */
    _applyChange() {
        let containmentRect = { left: 0, top: 0, width: 0, height: 0 };
        if (this.el.style.position === 'absolute') {
            const containmentEl = this.el.parentElement;
            const { left, top } = containmentEl.getBoundingClientRect();
            containmentRect = { left, top, width: 0, height: 0 };
        }
        if (!this.temporalRect)
            return this;
        Object.keys(this.temporalRect).forEach(key => {
            const value = this.temporalRect[key];
            this.el.style[key] = value - containmentRect[key] + 'px';
        });
        return this;
    }
    /** @internal */
    _removeHandlers() {
        this.handlers.forEach(handle => handle.destroy());
        delete this.handlers;
        return this;
    }
}
exports.DDResizable = DDResizable;
/** @internal */
DDResizable._originStyleProp = ['width', 'height', 'position', 'left', 'top', 'opacity', 'zIndex'];
//# sourceMappingURL=dd-resizable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-touch.js":
/*!*************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-touch.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * touch.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pointerleave = exports.pointerenter = exports.pointerdown = exports.touchend = exports.touchmove = exports.touchstart = exports.isTouch = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
/**
 * Detect touch support - Windows Surface devices and other touch devices
 * should we use this instead ? (what we had for always showing resize handles)
 * /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 */
exports.isTouch = typeof window !== 'undefined' && typeof document !== 'undefined' &&
    ('ontouchstart' in document
        || 'ontouchstart' in window
        // || !!window.TouchEvent // true on Windows 10 Chrome desktop so don't use this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        || (window.DocumentTouch && document instanceof window.DocumentTouch)
        || navigator.maxTouchPoints > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        || navigator.msMaxTouchPoints > 0);
// interface TouchCoord {x: number, y: number};
class DDTouch {
}
/**
* Get the x,y position of a touch event
*/
// function getTouchCoords(e: TouchEvent): TouchCoord {
//   return {
//     x: e.changedTouches[0].pageX,
//     y: e.changedTouches[0].pageY
//   };
// }
/**
 * Simulate a mouse event based on a corresponding touch event
 * @param {Object} e A touch event
 * @param {String} simulatedType The corresponding mouse event
 */
function simulateMouseEvent(e, simulatedType) {
    // Ignore multi-touch events
    if (e.touches.length > 1)
        return;
    // Prevent "Ignored attempt to cancel a touchmove event with cancelable=false" errors
    if (e.cancelable)
        e.preventDefault();
    const touch = e.changedTouches[0], simulatedEvent = document.createEvent('MouseEvents');
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(simulatedType, // type
    true, // bubbles
    true, // cancelable
    window, // view
    1, // detail
    touch.screenX, // screenX
    touch.screenY, // screenY
    touch.clientX, // clientX
    touch.clientY, // clientY
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    0, // button
    null // relatedTarget
    );
    // Dispatch the simulated event to the target element
    e.target.dispatchEvent(simulatedEvent);
}
/**
 * Simulate a mouse event based on a corresponding Pointer event
 * @param {Object} e A pointer event
 * @param {String} simulatedType The corresponding mouse event
 */
function simulatePointerMouseEvent(e, simulatedType) {
    // Prevent "Ignored attempt to cancel a touchmove event with cancelable=false" errors
    if (e.cancelable)
        e.preventDefault();
    const simulatedEvent = document.createEvent('MouseEvents');
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(simulatedType, // type
    true, // bubbles
    true, // cancelable
    window, // view
    1, // detail
    e.screenX, // screenX
    e.screenY, // screenY
    e.clientX, // clientX
    e.clientY, // clientY
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    0, // button
    null // relatedTarget
    );
    // Dispatch the simulated event to the target element
    e.target.dispatchEvent(simulatedEvent);
}
/**
 * Handle the touchstart events
 * @param {Object} e The widget element's touchstart event
 */
function touchstart(e) {
    // Ignore the event if another widget is already being handled
    if (DDTouch.touchHandled)
        return;
    DDTouch.touchHandled = true;
    // Simulate the mouse events
    // simulateMouseEvent(e, 'mouseover');
    // simulateMouseEvent(e, 'mousemove');
    simulateMouseEvent(e, 'mousedown');
}
exports.touchstart = touchstart;
/**
 * Handle the touchmove events
 * @param {Object} e The document's touchmove event
 */
function touchmove(e) {
    // Ignore event if not handled by us
    if (!DDTouch.touchHandled)
        return;
    simulateMouseEvent(e, 'mousemove');
}
exports.touchmove = touchmove;
/**
 * Handle the touchend events
 * @param {Object} e The document's touchend event
 */
function touchend(e) {
    // Ignore event if not handled
    if (!DDTouch.touchHandled)
        return;
    // cancel delayed leave event when we release on ourself which happens BEFORE we get this!
    if (DDTouch.pointerLeaveTimeout) {
        window.clearTimeout(DDTouch.pointerLeaveTimeout);
        delete DDTouch.pointerLeaveTimeout;
    }
    const wasDragging = !!dd_manager_1.DDManager.dragElement;
    // Simulate the mouseup event
    simulateMouseEvent(e, 'mouseup');
    // simulateMouseEvent(event, 'mouseout');
    // If the touch interaction did not move, it should trigger a click
    if (!wasDragging) {
        simulateMouseEvent(e, 'click');
    }
    // Unset the flag to allow other widgets to inherit the touch event
    DDTouch.touchHandled = false;
}
exports.touchend = touchend;
/**
 * Note we don't get touchenter/touchleave (which are deprecated)
 * see https://stackoverflow.com/questions/27908339/js-touch-equivalent-for-mouseenter
 * so instead of PointerEvent to still get enter/leave and send the matching mouse event.
 */
function pointerdown(e) {
    // console.log("pointer down")
    e.target.releasePointerCapture(e.pointerId); // <- Important!
}
exports.pointerdown = pointerdown;
function pointerenter(e) {
    // ignore the initial one we get on pointerdown on ourself
    if (!dd_manager_1.DDManager.dragElement) {
        // console.log('pointerenter ignored');
        return;
    }
    // console.log('pointerenter');
    simulatePointerMouseEvent(e, 'mouseenter');
}
exports.pointerenter = pointerenter;
function pointerleave(e) {
    // ignore the leave on ourself we get before releasing the mouse over ourself
    // by delaying sending the event and having the up event cancel us
    if (!dd_manager_1.DDManager.dragElement) {
        // console.log('pointerleave ignored');
        return;
    }
    DDTouch.pointerLeaveTimeout = window.setTimeout(() => {
        delete DDTouch.pointerLeaveTimeout;
        // console.log('pointerleave delayed');
        simulatePointerMouseEvent(e, 'mouseleave');
    }, 10);
}
exports.pointerleave = pointerleave;
//# sourceMappingURL=dd-touch.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack-engine.js":
/*!*********************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack-engine.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * gridstack-engine.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GridStackEngine = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
/**
 * Defines the GridStack engine that does most no DOM grid manipulation.
 * See GridStack methods and vars for descriptions.
 *
 * NOTE: values should not be modified directly - call the main GridStack API instead
 */
class GridStackEngine {
    constructor(opts = {}) {
        this.addedNodes = [];
        this.removedNodes = [];
        this.column = opts.column || 12;
        this.maxRow = opts.maxRow;
        this._float = opts.float;
        this.nodes = opts.nodes || [];
        this.onChange = opts.onChange;
    }
    batchUpdate(flag = true) {
        if (!!this.batchMode === flag)
            return this;
        this.batchMode = flag;
        if (flag) {
            this._prevFloat = this._float;
            this._float = true; // let things go anywhere for now... will restore and possibly reposition later
            this.saveInitial(); // since begin update (which is called multiple times) won't do this
        }
        else {
            this._float = this._prevFloat;
            delete this._prevFloat;
            this._packNodes()._notify();
        }
        return this;
    }
    // use entire row for hitting area (will use bottom reverse sorted first) if we not actively moving DOWN and didn't already skip
    _useEntireRowArea(node, nn) {
        return (!this.float || this.batchMode && !this._prevFloat) && !this._hasLocked && (!node._moving || node._skipDown || nn.y <= node.y);
    }
    /** @internal fix collision on given 'node', going to given new location 'nn', with optional 'collide' node already found.
     * return true if we moved. */
    _fixCollisions(node, nn = node, collide, opt = {}) {
        this.sortNodes(-1); // from last to first, so recursive collision move items in the right order
        collide = collide || this.collide(node, nn); // REAL area collide for swap and skip if none...
        if (!collide)
            return false;
        // swap check: if we're actively moving in gravity mode, see if we collide with an object the same size
        if (node._moving && !opt.nested && !this.float) {
            if (this.swap(node, collide))
                return true;
        }
        // during while() collisions MAKE SURE to check entire row so larger items don't leap frog small ones (push them all down starting last in grid)
        let area = nn;
        if (this._useEntireRowArea(node, nn)) {
            area = { x: 0, w: this.column, y: nn.y, h: nn.h };
            collide = this.collide(node, area, opt.skip); // force new hit
        }
        let didMove = false;
        let newOpt = { nested: true, pack: false };
        while (collide = collide || this.collide(node, area, opt.skip)) { // could collide with more than 1 item... so repeat for each
            let moved;
            // if colliding with a locked item OR moving down with top gravity (and collide could move up) -> skip past the collide,
            // but remember that skip down so we only do this once (and push others otherwise).
            if (collide.locked || node._moving && !node._skipDown && nn.y > node.y && !this.float &&
                // can take space we had, or before where we're going
                (!this.collide(collide, Object.assign(Object.assign({}, collide), { y: node.y }), node) || !this.collide(collide, Object.assign(Object.assign({}, collide), { y: nn.y - collide.h }), node))) {
                node._skipDown = (node._skipDown || nn.y > node.y);
                moved = this.moveNode(node, Object.assign(Object.assign(Object.assign({}, nn), { y: collide.y + collide.h }), newOpt));
                if (collide.locked && moved) {
                    utils_1.Utils.copyPos(nn, node); // moving after lock become our new desired location
                }
                else if (!collide.locked && moved && opt.pack) {
                    // we moved after and will pack: do it now and keep the original drop location, but past the old collide to see what else we might push way
                    this._packNodes();
                    nn.y = collide.y + collide.h;
                    utils_1.Utils.copyPos(node, nn);
                }
                didMove = didMove || moved;
            }
            else {
                // move collide down *after* where we will be, ignoring where we are now (don't collide with us)
                moved = this.moveNode(collide, Object.assign(Object.assign(Object.assign({}, collide), { y: nn.y + nn.h, skip: node }), newOpt));
            }
            if (!moved) {
                return didMove;
            } // break inf loop if we couldn't move after all (ex: maxRow, fixed)
            collide = undefined;
        }
        return didMove;
    }
    /** return the nodes that intercept the given node. Optionally a different area can be used, as well as a second node to skip */
    collide(skip, area = skip, skip2) {
        return this.nodes.find(n => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
    }
    collideAll(skip, area = skip, skip2) {
        return this.nodes.filter(n => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
    }
    /** does a pixel coverage collision based on where we started, returning the node that has the most coverage that is >50% mid line */
    directionCollideCoverage(node, o, collides) {
        if (!o.rect || !node._rect)
            return;
        let r0 = node._rect; // where started
        let r = Object.assign({}, o.rect); // where we are
        // update dragged rect to show where it's coming from (above or below, etc...)
        if (r.y > r0.y) {
            r.h += r.y - r0.y;
            r.y = r0.y;
        }
        else {
            r.h += r0.y - r.y;
        }
        if (r.x > r0.x) {
            r.w += r.x - r0.x;
            r.x = r0.x;
        }
        else {
            r.w += r0.x - r.x;
        }
        let collide;
        collides.forEach(n => {
            if (n.locked || !n._rect)
                return;
            let r2 = n._rect; // overlapping target
            let yOver = Number.MAX_VALUE, xOver = Number.MAX_VALUE, overMax = 0.5; // need >50%
            // depending on which side we started from, compute the overlap % of coverage
            // (ex: from above/below we only compute the max horizontal line coverage)
            if (r0.y < r2.y) { // from above
                yOver = ((r.y + r.h) - r2.y) / r2.h;
            }
            else if (r0.y + r0.h > r2.y + r2.h) { // from below
                yOver = ((r2.y + r2.h) - r.y) / r2.h;
            }
            if (r0.x < r2.x) { // from the left
                xOver = ((r.x + r.w) - r2.x) / r2.w;
            }
            else if (r0.x + r0.w > r2.x + r2.w) { // from the right
                xOver = ((r2.x + r2.w) - r.x) / r2.w;
            }
            let over = Math.min(xOver, yOver);
            if (over > overMax) {
                overMax = over;
                collide = n;
            }
        });
        o.collide = collide; // save it so we don't have to find it again
        return collide;
    }
    /** does a pixel coverage returning the node that has the most coverage by area */
    /*
    protected collideCoverage(r: GridStackPosition, collides: GridStackNode[]): {collide: GridStackNode, over: number} {
      let collide: GridStackNode;
      let overMax = 0;
      collides.forEach(n => {
        if (n.locked || !n._rect) return;
        let over = Utils.areaIntercept(r, n._rect);
        if (over > overMax) {
          overMax = over;
          collide = n;
        }
      });
      return {collide, over: overMax};
    }
    */
    /** called to cache the nodes pixel rectangles used for collision detection during drag */
    cacheRects(w, h, top, right, bottom, left) {
        this.nodes.forEach(n => n._rect = {
            y: n.y * h + top,
            x: n.x * w + left,
            w: n.w * w - left - right,
            h: n.h * h - top - bottom
        });
        return this;
    }
    /** called to possibly swap between 2 nodes (same size or column, not locked, touching), returning true if successful */
    swap(a, b) {
        if (!b || b.locked || !a || a.locked)
            return false;
        function _doSwap() {
            let x = b.x, y = b.y;
            b.x = a.x;
            b.y = a.y; // b -> a position
            if (a.h != b.h) {
                a.x = x;
                a.y = b.y + b.h; // a -> goes after b
            }
            else if (a.w != b.w) {
                a.x = b.x + b.w;
                a.y = y; // a -> goes after b
            }
            else {
                a.x = x;
                a.y = y; // a -> old b position
            }
            a._dirty = b._dirty = true;
            return true;
        }
        let touching; // remember if we called it (vs undefined)
        // same size and same row or column, and touching
        if (a.w === b.w && a.h === b.h && (a.x === b.x || a.y === b.y) && (touching = utils_1.Utils.isTouching(a, b)))
            return _doSwap();
        if (touching === false)
            return; // IFF ran test and fail, bail out
        // check for taking same columns (but different height) and touching
        if (a.w === b.w && a.x === b.x && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.y < a.y) {
                let t = a;
                a = b;
                b = t;
            } // swap a <-> b vars so a is first
            return _doSwap();
        }
        if (touching === false)
            return;
        // check if taking same row (but different width) and touching
        if (a.h === b.h && a.y === b.y && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.x < a.x) {
                let t = a;
                a = b;
                b = t;
            } // swap a <-> b vars so a is first
            return _doSwap();
        }
        return false;
    }
    isAreaEmpty(x, y, w, h) {
        let nn = { x: x || 0, y: y || 0, w: w || 1, h: h || 1 };
        return !this.collide(nn);
    }
    /** re-layout grid items to reclaim any empty space */
    compact() {
        if (this.nodes.length === 0)
            return this;
        this.batchUpdate()
            .sortNodes();
        let copyNodes = this.nodes;
        this.nodes = []; // pretend we have no nodes to conflict layout to start with...
        copyNodes.forEach(node => {
            if (!node.locked) {
                node.autoPosition = true;
            }
            this.addNode(node, false); // 'false' for add event trigger
            node._dirty = true; // will force attr update
        });
        return this.batchUpdate(false);
    }
    /** enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html) */
    set float(val) {
        if (this._float === val)
            return;
        this._float = val || false;
        if (!val) {
            this._packNodes()._notify();
        }
    }
    /** float getter method */
    get float() { return this._float || false; }
    /** sort the nodes array from first to last, or reverse. Called during collision/placement to force an order */
    sortNodes(dir) {
        this.nodes = utils_1.Utils.sort(this.nodes, dir, this.column);
        return this;
    }
    /** @internal called to top gravity pack the items back OR revert back to original Y positions when floating */
    _packNodes() {
        if (this.batchMode) {
            return this;
        }
        this.sortNodes(); // first to last
        if (this.float) {
            // restore original Y pos
            this.nodes.forEach(n => {
                if (n._updating || n._orig === undefined || n.y === n._orig.y)
                    return;
                let newY = n.y;
                while (newY > n._orig.y) {
                    --newY;
                    let collide = this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                    if (!collide) {
                        n._dirty = true;
                        n.y = newY;
                    }
                }
            });
        }
        else {
            // top gravity pack
            this.nodes.forEach((n, i) => {
                if (n.locked)
                    return;
                while (n.y > 0) {
                    let newY = i === 0 ? 0 : n.y - 1;
                    let canBeMoved = i === 0 || !this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                    if (!canBeMoved)
                        break;
                    // Note: must be dirty (from last position) for GridStack::OnChange CB to update positions
                    // and move items back. The user 'change' CB should detect changes from the original
                    // starting position instead.
                    n._dirty = (n.y !== newY);
                    n.y = newY;
                }
            });
        }
        return this;
    }
    /**
     * given a random node, makes sure it's coordinates/values are valid in the current grid
     * @param node to adjust
     * @param resizing if out of bound, resize down or move into the grid to fit ?
     */
    prepareNode(node, resizing) {
        node = node || {};
        node._id = node._id || GridStackEngine._idSeq++;
        // if we're missing position, have the grid position us automatically (before we set them to 0,0)
        if (node.x === undefined || node.y === undefined || node.x === null || node.y === null) {
            node.autoPosition = true;
        }
        // assign defaults for missing required fields
        let defaults = { x: 0, y: 0, w: 1, h: 1 };
        utils_1.Utils.defaults(node, defaults);
        if (!node.autoPosition) {
            delete node.autoPosition;
        }
        if (!node.noResize) {
            delete node.noResize;
        }
        if (!node.noMove) {
            delete node.noMove;
        }
        // check for NaN (in case messed up strings were passed. can't do parseInt() || defaults.x above as 0 is valid #)
        if (typeof node.x == 'string') {
            node.x = Number(node.x);
        }
        if (typeof node.y == 'string') {
            node.y = Number(node.y);
        }
        if (typeof node.w == 'string') {
            node.w = Number(node.w);
        }
        if (typeof node.h == 'string') {
            node.h = Number(node.h);
        }
        if (isNaN(node.x)) {
            node.x = defaults.x;
            node.autoPosition = true;
        }
        if (isNaN(node.y)) {
            node.y = defaults.y;
            node.autoPosition = true;
        }
        if (isNaN(node.w)) {
            node.w = defaults.w;
        }
        if (isNaN(node.h)) {
            node.h = defaults.h;
        }
        return this.nodeBoundFix(node, resizing);
    }
    /** part2 of preparing a node to fit inside our grid - checks for x,y,w from grid dimensions */
    nodeBoundFix(node, resizing) {
        let before = node._orig || utils_1.Utils.copyPos({}, node);
        if (node.maxW) {
            node.w = Math.min(node.w, node.maxW);
        }
        if (node.maxH) {
            node.h = Math.min(node.h, node.maxH);
        }
        if (node.minW && node.minW <= this.column) {
            node.w = Math.max(node.w, node.minW);
        }
        if (node.minH) {
            node.h = Math.max(node.h, node.minH);
        }
        // if user loaded a larger than allowed widget for current # of columns (or force 1 column mode),
        // remember it's position & width so we can restore back (1 -> 12 column) #1655 #1985
        // IFF we're not in the middle of column resizing!
        const saveOrig = this.column === 1 || node.x + node.w > this.column;
        if (saveOrig && this.column < 12 && !this._inColumnResize && node._id && this.findCacheLayout(node, 12) === -1) {
            let copy = Object.assign({}, node); // need _id + positions
            if (copy.autoPosition) {
                delete copy.x;
                delete copy.y;
            }
            else
                copy.x = Math.min(11, copy.x);
            copy.w = Math.min(12, copy.w);
            this.cacheOneLayout(copy, 12);
        }
        if (node.w > this.column) {
            node.w = this.column;
        }
        else if (node.w < 1) {
            node.w = 1;
        }
        if (this.maxRow && node.h > this.maxRow) {
            node.h = this.maxRow;
        }
        else if (node.h < 1) {
            node.h = 1;
        }
        if (node.x < 0) {
            node.x = 0;
        }
        if (node.y < 0) {
            node.y = 0;
        }
        if (node.x + node.w > this.column) {
            if (resizing) {
                node.w = this.column - node.x;
            }
            else {
                node.x = this.column - node.w;
            }
        }
        if (this.maxRow && node.y + node.h > this.maxRow) {
            if (resizing) {
                node.h = this.maxRow - node.y;
            }
            else {
                node.y = this.maxRow - node.h;
            }
        }
        if (!utils_1.Utils.samePos(node, before)) {
            node._dirty = true;
        }
        return node;
    }
    /** returns a list of modified nodes from their original values */
    getDirtyNodes(verify) {
        // compare original x,y,w,h instead as _dirty can be a temporary state
        if (verify) {
            return this.nodes.filter(n => n._dirty && !utils_1.Utils.samePos(n, n._orig));
        }
        return this.nodes.filter(n => n._dirty);
    }
    /** @internal call this to call onChange callback with dirty nodes so DOM can be updated */
    _notify(removedNodes) {
        if (this.batchMode || !this.onChange)
            return this;
        let dirtyNodes = (removedNodes || []).concat(this.getDirtyNodes());
        this.onChange(dirtyNodes);
        return this;
    }
    /** @internal remove dirty and last tried info */
    cleanNodes() {
        if (this.batchMode)
            return this;
        this.nodes.forEach(n => {
            delete n._dirty;
            delete n._lastTried;
        });
        return this;
    }
    /** @internal called to save initial position/size to track real dirty state.
     * Note: should be called right after we call change event (so next API is can detect changes)
     * as well as right before we start move/resize/enter (so we can restore items to prev values) */
    saveInitial() {
        this.nodes.forEach(n => {
            n._orig = utils_1.Utils.copyPos({}, n);
            delete n._dirty;
        });
        this._hasLocked = this.nodes.some(n => n.locked);
        return this;
    }
    /** @internal restore all the nodes back to initial values (called when we leave) */
    restoreInitial() {
        this.nodes.forEach(n => {
            if (utils_1.Utils.samePos(n, n._orig))
                return;
            utils_1.Utils.copyPos(n, n._orig);
            n._dirty = true;
        });
        this._notify();
        return this;
    }
    /** find the first available empty spot for the given node width/height, updating the x,y attributes. return true if found.
     * optionally you can pass your own existing node list and column count, otherwise defaults to that engine data.
     */
    findEmptyPosition(node, nodeList = this.nodes, column = this.column) {
        nodeList = utils_1.Utils.sort(nodeList, -1, column);
        let found = false;
        for (let i = 0; !found; ++i) {
            let x = i % column;
            let y = Math.floor(i / column);
            if (x + node.w > column) {
                continue;
            }
            let box = { x, y, w: node.w, h: node.h };
            if (!nodeList.find(n => utils_1.Utils.isIntercepted(box, n))) {
                node.x = x;
                node.y = y;
                delete node.autoPosition;
                found = true;
            }
        }
        return found;
    }
    /** call to add the given node to our list, fixing collision and re-packing */
    addNode(node, triggerAddEvent = false) {
        let dup = this.nodes.find(n => n._id === node._id);
        if (dup)
            return dup; // prevent inserting twice! return it instead.
        // skip prepareNode if we're in middle of column resize (not new) but do check for bounds!
        node = this._inColumnResize ? this.nodeBoundFix(node) : this.prepareNode(node);
        delete node._temporaryRemoved;
        delete node._removeDOM;
        if (node.autoPosition && this.findEmptyPosition(node)) {
            delete node.autoPosition; // found our slot
        }
        this.nodes.push(node);
        if (triggerAddEvent) {
            this.addedNodes.push(node);
        }
        this._fixCollisions(node);
        if (!this.batchMode) {
            this._packNodes()._notify();
        }
        return node;
    }
    removeNode(node, removeDOM = true, triggerEvent = false) {
        if (!this.nodes.find(n => n === node)) {
            // TEST console.log(`Error: GridStackEngine.removeNode() node._id=${node._id} not found!`)
            return this;
        }
        if (triggerEvent) { // we wait until final drop to manually track removed items (rather than during drag)
            this.removedNodes.push(node);
        }
        if (removeDOM)
            node._removeDOM = true; // let CB remove actual HTML (used to set _id to null, but then we loose layout info)
        // don't use 'faster' .splice(findIndex(),1) in case node isn't in our list, or in multiple times.
        this.nodes = this.nodes.filter(n => n !== node);
        return this._packNodes()
            ._notify([node]);
    }
    removeAll(removeDOM = true) {
        delete this._layouts;
        if (this.nodes.length === 0)
            return this;
        removeDOM && this.nodes.forEach(n => n._removeDOM = true); // let CB remove actual HTML (used to set _id to null, but then we loose layout info)
        this.removedNodes = this.nodes;
        this.nodes = [];
        return this._notify(this.removedNodes);
    }
    /** checks if item can be moved (layout constrain) vs moveNode(), returning true if was able to move.
     * In more complicated cases (maxRow) it will attempt at moving the item and fixing
     * others in a clone first, then apply those changes if still within specs. */
    moveNodeCheck(node, o) {
        // if (node.locked) return false;
        if (!this.changedPosConstrain(node, o))
            return false;
        o.pack = true;
        // simpler case: move item directly...
        if (!this.maxRow) {
            return this.moveNode(node, o);
        }
        // complex case: create a clone with NO maxRow (will check for out of bounds at the end)
        let clonedNode;
        let clone = new GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map(n => {
                if (n === node) {
                    clonedNode = Object.assign({}, n);
                    return clonedNode;
                }
                return Object.assign({}, n);
            })
        });
        if (!clonedNode)
            return false;
        // check if we're covering 50% collision and could move
        let canMove = clone.moveNode(clonedNode, o) && clone.getRow() <= this.maxRow;
        // else check if we can force a swap (float=true, or different shapes) on non-resize
        if (!canMove && !o.resizing && o.collide) {
            let collide = o.collide.el.gridstackNode; // find the source node the clone collided with at 50%
            if (this.swap(node, collide)) { // swaps and mark dirty
                this._notify();
                return true;
            }
        }
        if (!canMove)
            return false;
        // if clone was able to move, copy those mods over to us now instead of caller trying to do this all over!
        // Note: we can't use the list directly as elements and other parts point to actual node, so copy content
        clone.nodes.filter(n => n._dirty).forEach(c => {
            let n = this.nodes.find(a => a._id === c._id);
            if (!n)
                return;
            utils_1.Utils.copyPos(n, c);
            n._dirty = true;
        });
        this._notify();
        return true;
    }
    /** return true if can fit in grid height constrain only (always true if no maxRow) */
    willItFit(node) {
        delete node._willFitPos;
        if (!this.maxRow)
            return true;
        // create a clone with NO maxRow and check if still within size
        let clone = new GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map(n => { return Object.assign({}, n); })
        });
        let n = Object.assign({}, node); // clone node so we don't mod any settings on it but have full autoPosition and min/max as well! #1687
        this.cleanupNode(n);
        delete n.el;
        delete n._id;
        delete n.content;
        delete n.grid;
        clone.addNode(n);
        if (clone.getRow() <= this.maxRow) {
            node._willFitPos = utils_1.Utils.copyPos({}, n);
            return true;
        }
        return false;
    }
    /** true if x,y or w,h are different after clamping to min/max */
    changedPosConstrain(node, p) {
        // first make sure w,h are set for caller
        p.w = p.w || node.w;
        p.h = p.h || node.h;
        if (node.x !== p.x || node.y !== p.y)
            return true;
        // check constrained w,h
        if (node.maxW) {
            p.w = Math.min(p.w, node.maxW);
        }
        if (node.maxH) {
            p.h = Math.min(p.h, node.maxH);
        }
        if (node.minW) {
            p.w = Math.max(p.w, node.minW);
        }
        if (node.minH) {
            p.h = Math.max(p.h, node.minH);
        }
        return (node.w !== p.w || node.h !== p.h);
    }
    /** return true if the passed in node was actually moved (checks for no-op and locked) */
    moveNode(node, o) {
        var _a, _b;
        if (!node || /*node.locked ||*/ !o)
            return false;
        let wasUndefinedPack;
        if (o.pack === undefined) {
            wasUndefinedPack = o.pack = true;
        }
        // constrain the passed in values and check if we're still changing our node
        if (typeof o.x !== 'number') {
            o.x = node.x;
        }
        if (typeof o.y !== 'number') {
            o.y = node.y;
        }
        if (typeof o.w !== 'number') {
            o.w = node.w;
        }
        if (typeof o.h !== 'number') {
            o.h = node.h;
        }
        let resizing = (node.w !== o.w || node.h !== o.h);
        let nn = utils_1.Utils.copyPos({}, node, true); // get min/max out first, then opt positions next
        utils_1.Utils.copyPos(nn, o);
        nn = this.nodeBoundFix(nn, resizing);
        utils_1.Utils.copyPos(o, nn);
        if (utils_1.Utils.samePos(node, o))
            return false;
        let prevPos = utils_1.Utils.copyPos({}, node);
        // check if we will need to fix collision at our new location
        let collides = this.collideAll(node, nn, o.skip);
        let needToMove = true;
        if (collides.length) {
            let activeDrag = node._moving && !o.nested;
            // check to make sure we actually collided over 50% surface area while dragging
            let collide = activeDrag ? this.directionCollideCoverage(node, o, collides) : collides[0];
            // if we're enabling creation of sub-grids on the fly, see if we're covering 80% of either one, if we didn't already do that
            if (activeDrag && collide && ((_b = (_a = node.grid) === null || _a === void 0 ? void 0 : _a.opts) === null || _b === void 0 ? void 0 : _b.subGridDynamic) && !node.grid._isTemp) {
                let over = utils_1.Utils.areaIntercept(o.rect, collide._rect);
                let a1 = utils_1.Utils.area(o.rect);
                let a2 = utils_1.Utils.area(collide._rect);
                let perc = over / (a1 < a2 ? a1 : a2);
                if (perc > .8) {
                    collide.grid.makeSubGrid(collide.el, undefined, node);
                    collide = undefined;
                }
            }
            if (collide) {
                needToMove = !this._fixCollisions(node, nn, collide, o); // check if already moved...
            }
            else {
                needToMove = false; // we didn't cover >50% for a move, skip...
                if (wasUndefinedPack)
                    delete o.pack;
            }
        }
        // now move (to the original ask vs the collision version which might differ) and repack things
        if (needToMove) {
            node._dirty = true;
            utils_1.Utils.copyPos(node, nn);
        }
        if (o.pack) {
            this._packNodes()
                ._notify();
        }
        return !utils_1.Utils.samePos(node, prevPos); // pack might have moved things back
    }
    getRow() {
        return this.nodes.reduce((row, n) => Math.max(row, n.y + n.h), 0);
    }
    beginUpdate(node) {
        if (!node._updating) {
            node._updating = true;
            delete node._skipDown;
            if (!this.batchMode)
                this.saveInitial();
        }
        return this;
    }
    endUpdate() {
        let n = this.nodes.find(n => n._updating);
        if (n) {
            delete n._updating;
            delete n._skipDown;
        }
        return this;
    }
    /** saves a copy of the largest column layout (eg 12 even when rendering oneColumnMode) so we don't loose orig layout,
     * returning a list of widgets for serialization */
    save(saveElement = true) {
        var _a;
        // use the highest layout for any saved info so we can have full detail on reload #1849
        let len = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a.length;
        let layout = len && this.column !== (len - 1) ? this._layouts[len - 1] : null;
        let list = [];
        this.sortNodes();
        this.nodes.forEach(n => {
            let wl = layout === null || layout === void 0 ? void 0 : layout.find(l => l._id === n._id);
            let w = Object.assign({}, n);
            // use layout info instead if set
            if (wl) {
                w.x = wl.x;
                w.y = wl.y;
                w.w = wl.w;
            }
            utils_1.Utils.removeInternalForSave(w, !saveElement);
            list.push(w);
        });
        return list;
    }
    /** @internal called whenever a node is added or moved - updates the cached layouts */
    layoutsNodesChange(nodes) {
        if (!this._layouts || this._inColumnResize)
            return this;
        // remove smaller layouts - we will re-generate those on the fly... larger ones need to update
        this._layouts.forEach((layout, column) => {
            if (!layout || column === this.column)
                return this;
            if (column < this.column) {
                this._layouts[column] = undefined;
            }
            else {
                // we save the original x,y,w (h isn't cached) to see what actually changed to propagate better.
                // NOTE: we don't need to check against out of bound scaling/moving as that will be done when using those cache values. #1785
                let ratio = column / this.column;
                nodes.forEach(node => {
                    if (!node._orig)
                        return; // didn't change (newly added ?)
                    let n = layout.find(l => l._id === node._id);
                    if (!n)
                        return; // no cache for new nodes. Will use those values.
                    // Y changed, push down same amount
                    // TODO: detect doing item 'swaps' will help instead of move (especially in 1 column mode)
                    if (node.y !== node._orig.y) {
                        n.y += (node.y - node._orig.y);
                    }
                    // X changed, scale from new position
                    if (node.x !== node._orig.x) {
                        n.x = Math.round(node.x * ratio);
                    }
                    // width changed, scale from new width
                    if (node.w !== node._orig.w) {
                        n.w = Math.round(node.w * ratio);
                    }
                    // ...height always carries over from cache
                });
            }
        });
        return this;
    }
    /**
     * @internal Called to scale the widget width & position up/down based on the column change.
     * Note we store previous layouts (especially original ones) to make it possible to go
     * from say 12 -> 1 -> 12 and get back to where we were.
     *
     * @param prevColumn previous number of columns
     * @param column  new column number
     * @param nodes different sorted list (ex: DOM order) instead of current list
     * @param layout specify the type of re-layout that will happen (position, size, etc...).
     * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
     */
    updateNodeWidths(prevColumn, column, nodes, layout = 'moveScale') {
        var _a;
        if (!this.nodes.length || !column || prevColumn === column)
            return this;
        // cache the current layout in case they want to go back (like 12 -> 1 -> 12) as it requires original data
        this.cacheLayout(this.nodes, prevColumn);
        this.batchUpdate(); // do this EARLY as it will call saveInitial() so we can detect where we started for _dirty and collision
        let newNodes = [];
        // if we're going to 1 column and using DOM order rather than default sorting, then generate that layout
        let domOrder = false;
        if (column === 1 && (nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
            domOrder = true;
            let top = 0;
            nodes.forEach(n => {
                n.x = 0;
                n.w = 1;
                n.y = Math.max(n.y, top);
                top = n.y + n.h;
            });
            newNodes = nodes;
            nodes = [];
        }
        else {
            nodes = utils_1.Utils.sort(this.nodes, -1, prevColumn); // current column reverse sorting so we can insert last to front (limit collision)
        }
        // see if we have cached previous layout IFF we are going up in size (restore) otherwise always
        // generate next size down from where we are (looks more natural as you gradually size down).
        let cacheNodes = [];
        if (column > prevColumn) {
            cacheNodes = this._layouts[column] || [];
            // ...if not, start with the largest layout (if not already there) as down-scaling is more accurate
            // by pretending we came from that larger column by assigning those values as starting point
            let lastIndex = this._layouts.length - 1;
            if (!cacheNodes.length && prevColumn !== lastIndex && ((_a = this._layouts[lastIndex]) === null || _a === void 0 ? void 0 : _a.length)) {
                prevColumn = lastIndex;
                this._layouts[lastIndex].forEach(cacheNode => {
                    let n = nodes.find(n => n._id === cacheNode._id);
                    if (n) {
                        // still current, use cache info positions
                        n.x = cacheNode.x;
                        n.y = cacheNode.y;
                        n.w = cacheNode.w;
                    }
                });
            }
        }
        // if we found cache re-use those nodes that are still current
        cacheNodes.forEach(cacheNode => {
            let j = nodes.findIndex(n => n._id === cacheNode._id);
            if (j !== -1) {
                // still current, use cache info positions
                if (cacheNode.autoPosition || isNaN(cacheNode.x) || isNaN(cacheNode.y)) {
                    this.findEmptyPosition(cacheNode, newNodes);
                }
                if (!cacheNode.autoPosition) {
                    nodes[j].x = cacheNode.x;
                    nodes[j].y = cacheNode.y;
                    nodes[j].w = cacheNode.w;
                    newNodes.push(nodes[j]);
                }
                nodes.splice(j, 1);
            }
        });
        // ...and add any extra non-cached ones
        if (nodes.length) {
            if (typeof layout === 'function') {
                layout(column, prevColumn, newNodes, nodes);
            }
            else if (!domOrder) {
                let ratio = column / prevColumn;
                let move = (layout === 'move' || layout === 'moveScale');
                let scale = (layout === 'scale' || layout === 'moveScale');
                nodes.forEach(node => {
                    // NOTE: x + w could be outside of the grid, but addNode() below will handle that
                    node.x = (column === 1 ? 0 : (move ? Math.round(node.x * ratio) : Math.min(node.x, column - 1)));
                    node.w = ((column === 1 || prevColumn === 1) ? 1 :
                        scale ? (Math.round(node.w * ratio) || 1) : (Math.min(node.w, column)));
                    newNodes.push(node);
                });
                nodes = [];
            }
        }
        // finally re-layout them in reverse order (to get correct placement)
        if (!domOrder)
            newNodes = utils_1.Utils.sort(newNodes, -1, column);
        this._inColumnResize = true; // prevent cache update
        this.nodes = []; // pretend we have no nodes to start with (add() will use same structures) to simplify layout
        newNodes.forEach(node => {
            this.addNode(node, false); // 'false' for add event trigger
            delete node._orig; // make sure the commit doesn't try to restore things back to original
        });
        this.batchUpdate(false);
        delete this._inColumnResize;
        return this;
    }
    /**
     * call to cache the given layout internally to the given location so we can restore back when column changes size
     * @param nodes list of nodes
     * @param column corresponding column index to save it under
     * @param clear if true, will force other caches to be removed (default false)
     */
    cacheLayout(nodes, column, clear = false) {
        let copy = [];
        nodes.forEach((n, i) => {
            n._id = n._id || GridStackEngine._idSeq++; // make sure we have an id in case this is new layout, else re-use id already set
            copy[i] = { x: n.x, y: n.y, w: n.w, _id: n._id }; // only thing we change is x,y,w and id to find it back
        });
        this._layouts = clear ? [] : this._layouts || []; // use array to find larger quick
        this._layouts[column] = copy;
        return this;
    }
    /**
     * call to cache the given node layout internally to the given location so we can restore back when column changes size
     * @param node single node to cache
     * @param column corresponding column index to save it under
     */
    cacheOneLayout(n, column) {
        n._id = n._id || GridStackEngine._idSeq++;
        let l = { x: n.x, y: n.y, w: n.w, _id: n._id };
        if (n.autoPosition) {
            delete l.x;
            delete l.y;
            l.autoPosition = true;
        }
        this._layouts = this._layouts || [];
        this._layouts[column] = this._layouts[column] || [];
        let index = this.findCacheLayout(n, column);
        if (index === -1)
            this._layouts[column].push(l);
        else
            this._layouts[column][index] = l;
        return this;
    }
    findCacheLayout(n, column) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a[column]) === null || _b === void 0 ? void 0 : _b.findIndex(l => l._id === n._id)) !== null && _c !== void 0 ? _c : -1;
    }
    /** called to remove all internal values but the _id */
    cleanupNode(node) {
        for (let prop in node) {
            if (prop[0] === '_' && prop !== '_id')
                delete node[prop];
        }
        return this;
    }
}
exports.GridStackEngine = GridStackEngine;
/** @internal unique global internal _id counter NOT starting at 0 */
GridStackEngine._idSeq = 1;
//# sourceMappingURL=gridstack-engine.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack.js":
/*!**************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GridStack = void 0;
/*!
 * GridStack 7.3.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2022 Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */
const gridstack_engine_1 = __webpack_require__(/*! ./gridstack-engine */ "./node_modules/gridstack/dist/gridstack-engine.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/gridstack/dist/types.js");
/*
 * and include D&D by default
 * TODO: while we could generate a gridstack-static.js at smaller size - saves about 31k (41k -> 72k)
 * I don't know how to generate the DD only code at the remaining 31k to delay load as code depends on Gridstack.ts
 * also it caused loading issues in prod - see https://github.com/gridstack/gridstack.js/issues/2039
 */
const dd_gridstack_1 = __webpack_require__(/*! ./dd-gridstack */ "./node_modules/gridstack/dist/dd-gridstack.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
/** global instance */
const dd = new dd_gridstack_1.DDGridStack;
// export all dependent file as well to make it easier for users to just import the main file
__exportStar(__webpack_require__(/*! ./types */ "./node_modules/gridstack/dist/types.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js"), exports);
__exportStar(__webpack_require__(/*! ./gridstack-engine */ "./node_modules/gridstack/dist/gridstack-engine.js"), exports);
__exportStar(__webpack_require__(/*! ./dd-gridstack */ "./node_modules/gridstack/dist/dd-gridstack.js"), exports);
/**
 * Main gridstack class - you will need to call `GridStack.init()` first to initialize your grid.
 * Note: your grid elements MUST have the following classes for the CSS layout to work:
 * @example
 * <div class="grid-stack">
 *   <div class="grid-stack-item">
 *     <div class="grid-stack-item-content">Item 1</div>
 *   </div>
 * </div>
 */
class GridStack {
    /**
     * Construct a grid item from the given element and options
     * @param el
     * @param opts
     */
    constructor(el, opts = {}) {
        var _a, _b;
        /** @internal */
        this._gsEventHandler = {};
        /** @internal extra row added when dragging at the bottom of the grid */
        this._extraDragRow = 0;
        this.el = el; // exposed HTML element to the user
        opts = opts || {}; // handles null/undefined/0
        if (!el.classList.contains('grid-stack')) {
            this.el.classList.add('grid-stack');
        }
        // if row property exists, replace minRow and maxRow instead
        if (opts.row) {
            opts.minRow = opts.maxRow = opts.row;
            delete opts.row;
        }
        let rowAttr = utils_1.Utils.toNumber(el.getAttribute('gs-row'));
        // flag only valid in sub-grids (handled by parent, not here)
        if (opts.column === 'auto') {
            delete opts.column;
        }
        // 'minWidth' legacy support in 5.1
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        let anyOpts = opts;
        if (anyOpts.minWidth !== undefined) {
            opts.oneColumnSize = opts.oneColumnSize || anyOpts.minWidth;
            delete anyOpts.minWidth;
        }
        // save original setting so we can restore on save
        if (opts.alwaysShowResizeHandle !== undefined) {
            opts._alwaysShowResizeHandle = opts.alwaysShowResizeHandle;
        }
        // elements DOM attributes override any passed options (like CSS style) - merge the two together
        let defaults = Object.assign(Object.assign({}, utils_1.Utils.cloneDeep(types_1.gridDefaults)), { column: utils_1.Utils.toNumber(el.getAttribute('gs-column')) || types_1.gridDefaults.column, minRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-min-row')) || types_1.gridDefaults.minRow, maxRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-max-row')) || types_1.gridDefaults.maxRow, staticGrid: utils_1.Utils.toBool(el.getAttribute('gs-static')) || types_1.gridDefaults.staticGrid, draggable: {
                handle: (opts.handleClass ? '.' + opts.handleClass : (opts.handle ? opts.handle : '')) || types_1.gridDefaults.draggable.handle,
            }, removableOptions: {
                accept: opts.itemClass ? '.' + opts.itemClass : types_1.gridDefaults.removableOptions.accept,
            } });
        if (el.getAttribute('gs-animate')) { // default to true, but if set to false use that instead
            defaults.animate = utils_1.Utils.toBool(el.getAttribute('gs-animate'));
        }
        this.opts = utils_1.Utils.defaults(opts, defaults);
        opts = null; // make sure we use this.opts instead
        this._initMargin(); // part of settings defaults...
        // Now check if we're loading into 1 column mode FIRST so we don't do un-necessary work (like cellHeight = width / 12 then go 1 column)
        if (this.opts.column !== 1 && !this.opts.disableOneColumnMode && this._widthOrContainer() <= this.opts.oneColumnSize) {
            this._prevColumn = this.getColumn();
            this.opts.column = 1;
        }
        if (this.opts.rtl === 'auto') {
            this.opts.rtl = (el.style.direction === 'rtl');
        }
        if (this.opts.rtl) {
            this.el.classList.add('grid-stack-rtl');
        }
        // check if we're been nested, and if so update our style and keep pointer around (used during save)
        let parentGridItem = (_a = utils_1.Utils.closestUpByClass(this.el, types_1.gridDefaults.itemClass)) === null || _a === void 0 ? void 0 : _a.gridstackNode;
        if (parentGridItem) {
            parentGridItem.subGrid = this;
            this.parentGridItem = parentGridItem;
            this.el.classList.add('grid-stack-nested');
            parentGridItem.el.classList.add('grid-stack-sub-grid');
        }
        this._isAutoCellHeight = (this.opts.cellHeight === 'auto');
        if (this._isAutoCellHeight || this.opts.cellHeight === 'initial') {
            // make the cell content square initially (will use resize/column event to keep it square)
            this.cellHeight(undefined, false);
        }
        else {
            // append unit if any are set
            if (typeof this.opts.cellHeight == 'number' && this.opts.cellHeightUnit && this.opts.cellHeightUnit !== types_1.gridDefaults.cellHeightUnit) {
                this.opts.cellHeight = this.opts.cellHeight + this.opts.cellHeightUnit;
                delete this.opts.cellHeightUnit;
            }
            this.cellHeight(this.opts.cellHeight, false);
        }
        // see if we need to adjust auto-hide
        if (this.opts.alwaysShowResizeHandle === 'mobile') {
            this.opts.alwaysShowResizeHandle = dd_touch_1.isTouch;
        }
        this._styleSheetClass = 'grid-stack-instance-' + gridstack_engine_1.GridStackEngine._idSeq++;
        this.el.classList.add(this._styleSheetClass);
        this._setStaticClass();
        let engineClass = this.opts.engineClass || GridStack.engineClass || gridstack_engine_1.GridStackEngine;
        this.engine = new engineClass({
            column: this.getColumn(),
            float: this.opts.float,
            maxRow: this.opts.maxRow,
            onChange: (cbNodes) => {
                let maxH = 0;
                this.engine.nodes.forEach(n => { maxH = Math.max(maxH, n.y + n.h); });
                cbNodes.forEach(n => {
                    let el = n.el;
                    if (!el)
                        return;
                    if (n._removeDOM) {
                        if (el)
                            el.remove();
                        delete n._removeDOM;
                    }
                    else {
                        this._writePosAttr(el, n);
                    }
                });
                this._updateStyles(false, maxH); // false = don't recreate, just append if need be
            }
        });
        if (this.opts.auto) {
            this.batchUpdate(); // prevent in between re-layout #1535 TODO: this only set float=true, need to prevent collision check...
            this.getGridItems().forEach(el => this._prepareElement(el));
            this.batchUpdate(false);
        }
        // load any passed in children as well, which overrides any DOM layout done above
        if (this.opts.children) {
            let children = this.opts.children;
            delete this.opts.children;
            if (children.length)
                this.load(children); // don't load empty
        }
        this.setAnimation(this.opts.animate);
        this._updateStyles();
        if (this.opts.column != 12) {
            this.el.classList.add('grid-stack-' + this.opts.column);
        }
        // legacy support to appear 'per grid` options when really global.
        if (this.opts.dragIn)
            GridStack.setupDragIn(this.opts.dragIn, this.opts.dragInOptions);
        delete this.opts.dragIn;
        delete this.opts.dragInOptions;
        // dynamic grids require pausing during drag to detect over to nest vs push
        if (this.opts.subGridDynamic && !dd_manager_1.DDManager.pauseDrag)
            dd_manager_1.DDManager.pauseDrag = true;
        if (((_b = this.opts.draggable) === null || _b === void 0 ? void 0 : _b.pause) !== undefined)
            dd_manager_1.DDManager.pauseDrag = this.opts.draggable.pause;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this._updateWindowResizeEvent();
    }
    /**
     * initializing the HTML element, or selector string, into a grid will return the grid. Calling it again will
     * simply return the existing instance (ignore any passed options). There is also an initAll() version that support
     * multiple grids initialization at once. Or you can use addGrid() to create the entire grid from JSON.
     * @param options grid options (optional)
     * @param elOrString element or CSS selector (first one used) to convert to a grid (default to '.grid-stack' class selector)
     *
     * @example
     * let grid = GridStack.init();
     *
     * Note: the HTMLElement (of type GridHTMLElement) will store a `gridstack: GridStack` value that can be retrieve later
     * let grid = document.querySelector('.grid-stack').gridstack;
     */
    static init(options = {}, elOrString = '.grid-stack') {
        let el = GridStack.getGridElement(elOrString);
        if (!el) {
            if (typeof elOrString === 'string') {
                console.error('GridStack.initAll() no grid was found with selector "' + elOrString + '" - element missing or wrong selector ?' +
                    '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
            }
            else {
                console.error('GridStack.init() no grid element was passed.');
            }
            return null;
        }
        if (!el.gridstack) {
            el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
        }
        return el.gridstack;
    }
    /**
     * Will initialize a list of elements (given a selector) and return an array of grids.
     * @param options grid options (optional)
     * @param selector elements selector to convert to grids (default to '.grid-stack' class selector)
     *
     * @example
     * let grids = GridStack.initAll();
     * grids.forEach(...)
     */
    static initAll(options = {}, selector = '.grid-stack') {
        let grids = [];
        GridStack.getGridElements(selector).forEach(el => {
            if (!el.gridstack) {
                el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
                delete options.dragIn;
                delete options.dragInOptions; // only need to be done once (really a static global thing, not per grid)
            }
            grids.push(el.gridstack);
        });
        if (grids.length === 0) {
            console.error('GridStack.initAll() no grid was found with selector "' + selector + '" - element missing or wrong selector ?' +
                '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
        }
        return grids;
    }
    /**
     * call to create a grid with the given options, including loading any children from JSON structure. This will call GridStack.init(), then
     * grid.load() on any passed children (recursively). Great alternative to calling init() if you want entire grid to come from
     * JSON serialized data, including options.
     * @param parent HTML element parent to the grid
     * @param opt grids options used to initialize the grid, and list of children
     */
    static addGrid(parent, opt = {}) {
        if (!parent)
            return null;
        // create the grid element, but check if the passed 'parent' already has grid styling and should be used instead
        let el = parent;
        const parentIsGrid = parent.classList.contains('grid-stack');
        if (!parentIsGrid || opt.addRemoveCB) {
            if (opt.addRemoveCB) {
                el = opt.addRemoveCB(parent, opt, true, true);
            }
            else {
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack ${opt.class || ''}"></div>`;
                el = doc.body.children[0];
                parent.appendChild(el);
            }
        }
        // create grid class and load any children
        let grid = GridStack.init(opt, el);
        return grid;
    }
    /** call this method to register your engine instead of the default one.
     * See instead `GridStackOptions.engineClass` if you only need to
     * replace just one instance.
     */
    static registerEngine(engineClass) {
        GridStack.engineClass = engineClass;
    }
    /** @internal create placeholder DIV as needed */
    get placeholder() {
        if (!this._placeholder) {
            let placeholderChild = document.createElement('div'); // child so padding match item-content
            placeholderChild.className = 'placeholder-content';
            if (this.opts.placeholderText) {
                placeholderChild.innerHTML = this.opts.placeholderText;
            }
            this._placeholder = document.createElement('div');
            this._placeholder.classList.add(this.opts.placeholderClass, types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.placeholder.appendChild(placeholderChild);
        }
        return this._placeholder;
    }
    /**
     * add a new widget and returns it.
     *
     * Widget will be always placed even if result height is more than actual grid height.
     * You need to use `willItFit()` before calling addWidget for additional check.
     * See also `makeWidget()`.
     *
     * @example
     * let grid = GridStack.init();
     * grid.addWidget({w: 3, content: 'hello'});
     * grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content">hello</div></div>', {w: 3});
     *
     * @param el  GridStackWidget (which can have content string as well), html element, or string definition to add
     * @param options widget position/size options (optional, and ignore if first param is already option) - see GridStackWidget
     */
    addWidget(els, options) {
        function isGridStackWidget(w) {
            return w.el !== undefined || w.x !== undefined || w.y !== undefined || w.w !== undefined || w.h !== undefined || w.content !== undefined ? true : false;
        }
        let el;
        let node;
        if (typeof els === 'string') {
            let doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = els;
            el = doc.body.children[0];
        }
        else if (arguments.length === 0 || arguments.length === 1 && isGridStackWidget(els)) {
            node = options = els;
            if (node === null || node === void 0 ? void 0 : node.el) {
                el = node.el; // re-use element stored in the node
            }
            else if (this.opts.addRemoveCB) {
                el = this.opts.addRemoveCB(this.el, options, true, false);
            }
            else {
                let content = (options === null || options === void 0 ? void 0 : options.content) || '';
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack-item ${this.opts.itemClass || ''}"><div class="grid-stack-item-content">${content}</div></div>`;
                el = doc.body.children[0];
            }
        }
        else {
            el = els;
        }
        if (!el)
            return;
        // Tempting to initialize the passed in opt with default and valid values, but this break knockout demos
        // as the actual value are filled in when _prepareElement() calls el.getAttribute('gs-xyz') before adding the node.
        // So make sure we load any DOM attributes that are not specified in passed in options (which override)
        let domAttr = this._readAttr(el);
        options = utils_1.Utils.cloneDeep(options) || {}; // make a copy before we modify in case caller re-uses it
        utils_1.Utils.defaults(options, domAttr);
        node = this.engine.prepareNode(options);
        this._writeAttr(el, options);
        if (this._insertNotAppend) {
            this.el.prepend(el);
        }
        else {
            this.el.appendChild(el);
        }
        // similar to makeWidget() that doesn't read attr again and worse re-create a new node and loose any _id
        this._prepareElement(el, true, options);
        this._updateContainerHeight();
        // see if there is a sub-grid to create
        if (node.subGrid) {
            this.makeSubGrid(node.el, undefined, undefined, false); //node.subGrid will be used as option in method, no need to pass
        }
        // if we're adding an item into 1 column (_prevColumn is set only when going to 1) make sure
        // we don't override the larger 12 column layout that was already saved. #1985
        if (this._prevColumn && this.opts.column === 1) {
            this._ignoreLayoutsNodeChange = true;
        }
        this._triggerAddEvent();
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return el;
    }
    /**
     * Convert an existing gridItem element into a sub-grid with the given (optional) options, else inherit them
     * from the parent's subGrid options.
     * @param el gridItem element to convert
     * @param ops (optional) sub-grid options, else default to node, then parent settings, else defaults
     * @param nodeToAdd (optional) node to add to the newly created sub grid (used when dragging over existing regular item)
     * @returns newly created grid
     */
    makeSubGrid(el, ops, nodeToAdd, saveContent = true) {
        var _a, _b, _c;
        let node = el.gridstackNode;
        if (!node) {
            node = this.makeWidget(el).gridstackNode;
        }
        if ((_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el)
            return node.subGrid; // already done
        // find the template subGrid stored on a parent as fallback...
        let subGridTemplate; // eslint-disable-next-line @typescript-eslint/no-this-alias
        let grid = this;
        while (grid && !subGridTemplate) {
            subGridTemplate = (_b = grid.opts) === null || _b === void 0 ? void 0 : _b.subGrid;
            grid = (_c = grid.parentGridItem) === null || _c === void 0 ? void 0 : _c.grid;
        }
        //... and set the create options
        ops = utils_1.Utils.cloneDeep(Object.assign(Object.assign(Object.assign({}, (subGridTemplate || {})), { children: undefined }), (ops || node.subGrid)));
        node.subGrid = ops;
        // if column special case it set, remember that flag and set default
        let autoColumn;
        if (ops.column === 'auto') {
            autoColumn = true;
            ops.column = Math.max(node.w || 1, (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd.w) || 1);
            ops.disableOneColumnMode = true; // driven by parent
        }
        // if we're converting an existing full item, move over the content to be the first sub item in the new grid
        let content = node.el.querySelector('.grid-stack-item-content');
        let newItem;
        let newItemOpt;
        if (saveContent) {
            this._removeDD(node.el); // remove D&D since it's set on content div
            newItemOpt = Object.assign(Object.assign({}, node), { x: 0, y: 0 });
            utils_1.Utils.removeInternalForSave(newItemOpt);
            delete newItemOpt.subGrid;
            if (node.content) {
                newItemOpt.content = node.content;
                delete node.content;
            }
            if (this.opts.addRemoveCB) {
                newItem = this.opts.addRemoveCB(this.el, newItemOpt, true, false);
            }
            else {
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack-item"></div>`;
                newItem = doc.body.children[0];
                newItem.appendChild(content);
                doc.body.innerHTML = `<div class="grid-stack-item-content"></div>`;
                content = doc.body.children[0];
                node.el.appendChild(content);
            }
            this._prepareDragDropByNode(node); // ... and restore original D&D
        }
        // if we're adding an additional item, make the container large enough to have them both
        if (nodeToAdd) {
            let w = autoColumn ? ops.column : node.w;
            let h = node.h + nodeToAdd.h;
            let style = node.el.style;
            style.transition = 'none'; // show up instantly so we don't see scrollbar with nodeToAdd
            this.update(node.el, { w, h });
            setTimeout(() => style.transition = null); // recover animation
        }
        if (this.opts.addRemoveCB) {
            ops.addRemoveCB = ops.addRemoveCB || this.opts.addRemoveCB;
        }
        let subGrid = node.subGrid = GridStack.addGrid(content, ops);
        if (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd._moving)
            subGrid._isTemp = true; // prevent re-nesting as we add over
        if (autoColumn)
            subGrid._autoColumn = true;
        // add the original content back as a child of hte newly created grid
        if (saveContent) {
            subGrid.addWidget(newItem, newItemOpt);
        }
        // now add any additional node
        if (nodeToAdd) {
            if (nodeToAdd._moving) {
                // create an artificial event even for the just created grid to receive this item
                window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeToAdd._event, 'mouseenter', subGrid.el), 0);
            }
            else {
                subGrid.addWidget(node.el, node);
            }
        }
        return subGrid;
    }
    /**
     * called when an item was converted into a nested grid to accommodate a dragged over item, but then item leaves - return back
     * to the original grid-item. Also called to remove empty sub-grids when last item is dragged out (since re-creating is simple)
     */
    removeAsSubGrid(nodeThatRemoved) {
        var _a;
        let pGrid = (_a = this.parentGridItem) === null || _a === void 0 ? void 0 : _a.grid;
        if (!pGrid)
            return;
        pGrid.batchUpdate();
        pGrid.removeWidget(this.parentGridItem.el, true, true);
        this.engine.nodes.forEach(n => {
            // migrate any children over and offsetting by our location
            n.x += this.parentGridItem.x;
            n.y += this.parentGridItem.y;
            pGrid.addWidget(n.el, n);
        });
        pGrid.batchUpdate(false);
        if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
        delete this.parentGridItem;
        // create an artificial event for the original grid now that this one is gone (got a leave, but won't get enter)
        if (nodeThatRemoved) {
            window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeThatRemoved._event, 'mouseenter', pGrid.el), 0);
        }
    }
    /**
    /**
     * saves the current layout returning a list of widgets for serialization which might include any nested grids.
     * @param saveContent if true (default) the latest html inside .grid-stack-content will be saved to GridStackWidget.content field, else it will
     * be removed.
     * @param saveGridOpt if true (default false), save the grid options itself, so you can call the new GridStack.addGrid()
     * to recreate everything from scratch. GridStackOptions.children would then contain the widget list instead.
     * @returns list of widgets or full grid option, including .children list of widgets
     */
    save(saveContent = true, saveGridOpt = false) {
        // return copied nodes we can modify at will...
        let list = this.engine.save(saveContent);
        // check for HTML content and nested grids
        list.forEach(n => {
            var _a;
            if (saveContent && n.el && !n.subGrid) { // sub-grid are saved differently, not plain content
                let sub = n.el.querySelector('.grid-stack-item-content');
                n.content = sub ? sub.innerHTML : undefined;
                if (!n.content)
                    delete n.content;
            }
            else {
                if (!saveContent) {
                    delete n.content;
                }
                // check for nested grid
                if ((_a = n.subGrid) === null || _a === void 0 ? void 0 : _a.el) {
                    const listOrOpt = n.subGrid.save(saveContent, saveGridOpt);
                    n.subGrid = (saveGridOpt ? listOrOpt : { children: listOrOpt });
                }
            }
            delete n.el;
        });
        // check if save entire grid options (needed for recursive) + children...
        if (saveGridOpt) {
            let o = utils_1.Utils.cloneDeep(this.opts);
            // delete default values that will be recreated on launch
            if (o.marginBottom === o.marginTop && o.marginRight === o.marginLeft && o.marginTop === o.marginRight) {
                o.margin = o.marginTop;
                delete o.marginTop;
                delete o.marginRight;
                delete o.marginBottom;
                delete o.marginLeft;
            }
            if (o.rtl === (this.el.style.direction === 'rtl')) {
                o.rtl = 'auto';
            }
            if (this._isAutoCellHeight) {
                o.cellHeight = 'auto';
            }
            if (this._autoColumn) {
                o.column = 'auto';
                delete o.disableOneColumnMode;
            }
            const origShow = o._alwaysShowResizeHandle;
            delete o._alwaysShowResizeHandle;
            if (origShow !== undefined) {
                o.alwaysShowResizeHandle = origShow;
            }
            else {
                delete o.alwaysShowResizeHandle;
            }
            utils_1.Utils.removeInternalAndSame(o, types_1.gridDefaults);
            o.children = list;
            return o;
        }
        return list;
    }
    /**
     * load the widgets from a list. This will call update() on each (matching by id) or add/remove widgets that are not there.
     *
     * @param layout list of widgets definition to update/create
     * @param addAndRemove boolean (default true) or callback method can be passed to control if and how missing widgets can be added/removed, giving
     * the user control of insertion.
     *
     * @example
     * see http://gridstackjs.com/demo/serialization.html
     **/
    load(layout, addRemove = this.opts.addRemoveCB || true) {
        let items = GridStack.Utils.sort([...layout], -1, this._prevColumn || this.getColumn()); // make copy before we mod/sort
        this._insertNotAppend = true; // since create in reverse order...
        // if we're loading a layout into for example 1 column (_prevColumn is set only when going to 1) and items don't fit, make sure to save
        // the original wanted layout so we can scale back up correctly #1471
        if (this._prevColumn && this._prevColumn !== this.opts.column && items.some(n => (n.x + n.w) > this.opts.column)) {
            this._ignoreLayoutsNodeChange = true; // skip layout update
            this.engine.cacheLayout(items, this._prevColumn, true);
        }
        // if given a different callback, temporally set it as global option to creating will use it
        const prevCB = this.opts.addRemoveCB;
        if (typeof (addRemove) === 'function')
            this.opts.addRemoveCB = addRemove;
        let removed = [];
        this.batchUpdate();
        // see if any items are missing from new layout and need to be removed first
        if (addRemove) {
            let copyNodes = [...this.engine.nodes]; // don't loop through array you modify
            copyNodes.forEach(n => {
                let item = items.find(w => n.id === w.id);
                if (!item) {
                    if (this.opts.addRemoveCB)
                        this.opts.addRemoveCB(this.el, n, false, false);
                    removed.push(n); // batch keep track
                    this.removeWidget(n.el, true, false);
                }
            });
        }
        // now add/update the widgets
        items.forEach(w => {
            let item = (w.id || w.id === 0) ? this.engine.nodes.find(n => n.id === w.id) : undefined;
            if (item) {
                this.update(item.el, w);
                if (w.subGrid && w.subGrid.children) { // update any sub grid as well
                    let sub = item.el.querySelector('.grid-stack');
                    if (sub && sub.gridstack) {
                        sub.gridstack.load(w.subGrid.children); // TODO: support updating grid options ?
                        this._insertNotAppend = true; // got reset by above call
                    }
                }
            }
            else if (addRemove) {
                this.addWidget(w);
            }
        });
        this.engine.removedNodes = removed;
        this.batchUpdate(false);
        // after commit, clear that flag
        delete this._ignoreLayoutsNodeChange;
        delete this._insertNotAppend;
        prevCB ? this.opts.addRemoveCB = prevCB : delete this.opts.addRemoveCB;
        return this;
    }
    /**
     * use before calling a bunch of `addWidget()` to prevent un-necessary relayouts in between (more efficient)
     * and get a single event callback. You will see no changes until `batchUpdate(false)` is called.
     */
    batchUpdate(flag = true) {
        this.engine.batchUpdate(flag);
        if (!flag) {
            this._triggerRemoveEvent();
            this._triggerAddEvent();
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * Gets current cell height.
     */
    getCellHeight(forcePixel = false) {
        if (this.opts.cellHeight && this.opts.cellHeight !== 'auto' &&
            (!forcePixel || !this.opts.cellHeightUnit || this.opts.cellHeightUnit === 'px')) {
            return this.opts.cellHeight;
        }
        // else get first cell height
        let el = this.el.querySelector('.' + this.opts.itemClass);
        if (el) {
            let height = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
            return Math.round(el.offsetHeight / height);
        }
        // else do entire grid and # of rows (but doesn't work if min-height is the actual constrain)
        let rows = parseInt(this.el.getAttribute('gs-current-row'));
        return rows ? Math.round(this.el.getBoundingClientRect().height / rows) : this.opts.cellHeight;
    }
    /**
     * Update current cell height - see `GridStackOptions.cellHeight` for format.
     * This method rebuilds an internal CSS style sheet.
     * Note: You can expect performance issues if call this method too often.
     *
     * @param val the cell height. If not passed (undefined), cells content will be made square (match width minus margin),
     * if pass 0 the CSS will be generated by the application instead.
     * @param update (Optional) if false, styles will not be updated
     *
     * @example
     * grid.cellHeight(100); // same as 100px
     * grid.cellHeight('70px');
     * grid.cellHeight(grid.cellWidth() * 1.2);
     */
    cellHeight(val, update = true) {
        // if not called internally, check if we're changing mode
        if (update && val !== undefined) {
            if (this._isAutoCellHeight !== (val === 'auto')) {
                this._isAutoCellHeight = (val === 'auto');
                this._updateWindowResizeEvent();
            }
        }
        if (val === 'initial' || val === 'auto') {
            val = undefined;
        }
        // make item content be square
        if (val === undefined) {
            let marginDiff = -this.opts.marginRight - this.opts.marginLeft
                + this.opts.marginTop + this.opts.marginBottom;
            val = this.cellWidth() + marginDiff;
        }
        let data = utils_1.Utils.parseHeight(val);
        if (this.opts.cellHeightUnit === data.unit && this.opts.cellHeight === data.h) {
            return this;
        }
        this.opts.cellHeightUnit = data.unit;
        this.opts.cellHeight = data.h;
        if (update) {
            this._updateStyles(true); // true = force re-create for current # of rows
        }
        return this;
    }
    /** Gets current cell width. */
    cellWidth() {
        return this._widthOrContainer() / this.getColumn();
    }
    /** return our expected width (or parent) for 1 column check */
    _widthOrContainer() {
        // use `offsetWidth` or `clientWidth` (no scrollbar) ?
        // https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
        return (this.el.clientWidth || this.el.parentElement.clientWidth || window.innerWidth);
    }
    /** re-layout grid items to reclaim any empty space */
    compact() {
        this.engine.compact();
        this._triggerChangeEvent();
        return this;
    }
    /**
     * set the number of columns in the grid. Will update existing widgets to conform to new number of columns,
     * as well as cache the original layout so you can revert back to previous positions without loss.
     * Requires `gridstack-extra.css` or `gridstack-extra.min.css` for [2-11],
     * else you will need to generate correct CSS (see https://github.com/gridstack/gridstack.js#change-grid-columns)
     * @param column - Integer > 0 (default 12).
     * @param layout specify the type of re-layout that will happen (position, size, etc...).
     * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
     */
    column(column, layout = 'moveScale') {
        if (column < 1 || this.opts.column === column)
            return this;
        let oldColumn = this.getColumn();
        // if we go into 1 column mode (which happens if we're sized less than minW unless disableOneColumnMode is on)
        // then remember the original columns so we can restore.
        if (column === 1) {
            this._prevColumn = oldColumn;
        }
        else {
            delete this._prevColumn;
        }
        this.el.classList.remove('grid-stack-' + oldColumn);
        this.el.classList.add('grid-stack-' + column);
        this.opts.column = this.engine.column = column;
        // update the items now - see if the dom order nodes should be passed instead (else default to current list)
        let domNodes;
        if (column === 1 && this.opts.oneColumnModeDomSort) {
            domNodes = [];
            this.getGridItems().forEach(el => {
                if (el.gridstackNode) {
                    domNodes.push(el.gridstackNode);
                }
            });
            if (!domNodes.length) {
                domNodes = undefined;
            }
        }
        this.engine.updateNodeWidths(oldColumn, column, domNodes, layout);
        if (this._isAutoCellHeight)
            this.cellHeight();
        // and trigger our event last...
        this._ignoreLayoutsNodeChange = true; // skip layout update
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return this;
    }
    /**
     * get the number of columns in the grid (default 12)
     */
    getColumn() {
        return this.opts.column;
    }
    /** returns an array of grid HTML elements (no placeholder) - used to iterate through our children in DOM order */
    getGridItems() {
        return Array.from(this.el.children)
            .filter((el) => el.matches('.' + this.opts.itemClass) && !el.matches('.' + this.opts.placeholderClass));
    }
    /**
     * Destroys a grid instance. DO NOT CALL any methods or access any vars after this as it will free up members.
     * @param removeDOM if `false` grid and items HTML elements will not be removed from the DOM (Optional. Default `true`).
     */
    destroy(removeDOM = true) {
        if (!this.el)
            return; // prevent multiple calls
        this._updateWindowResizeEvent(true);
        this.setStatic(true, false); // permanently removes DD but don't set CSS class (we're going away)
        this.setAnimation(false);
        if (!removeDOM) {
            this.removeAll(removeDOM);
            this.el.classList.remove(this._styleSheetClass);
        }
        else {
            this.el.parentNode.removeChild(this.el);
        }
        this._removeStylesheet();
        this.el.removeAttribute('gs-current-row');
        if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
        delete this.parentGridItem;
        delete this.opts;
        delete this._placeholder;
        delete this.engine;
        delete this.el.gridstack; // remove circular dependency that would prevent a freeing
        delete this.el;
        return this;
    }
    /**
     * enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html)
     */
    float(val) {
        if (this.opts.float !== val) {
            this.opts.float = this.engine.float = val;
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * get the current float mode
     */
    getFloat() {
        return this.engine.float;
    }
    /**
     * Get the position of the cell under a pixel on screen.
     * @param position the position of the pixel to resolve in
     * absolute coordinates, as an object with top and left properties
     * @param useDocRelative if true, value will be based on document position vs parent position (Optional. Default false).
     * Useful when grid is within `position: relative` element
     *
     * Returns an object with properties `x` and `y` i.e. the column and row in the grid.
     */
    getCellFromPixel(position, useDocRelative = false) {
        let box = this.el.getBoundingClientRect();
        // console.log(`getBoundingClientRect left: ${box.left} top: ${box.top} w: ${box.w} h: ${box.h}`)
        let containerPos;
        if (useDocRelative) {
            containerPos = { top: box.top + document.documentElement.scrollTop, left: box.left };
            // console.log(`getCellFromPixel scrollTop: ${document.documentElement.scrollTop}`)
        }
        else {
            containerPos = { top: this.el.offsetTop, left: this.el.offsetLeft };
            // console.log(`getCellFromPixel offsetTop: ${containerPos.left} offsetLeft: ${containerPos.top}`)
        }
        let relativeLeft = position.left - containerPos.left;
        let relativeTop = position.top - containerPos.top;
        let columnWidth = (box.width / this.getColumn());
        let rowHeight = (box.height / parseInt(this.el.getAttribute('gs-current-row')));
        return { x: Math.floor(relativeLeft / columnWidth), y: Math.floor(relativeTop / rowHeight) };
    }
    /** returns the current number of rows, which will be at least `minRow` if set */
    getRow() {
        return Math.max(this.engine.getRow(), this.opts.minRow);
    }
    /**
     * Checks if specified area is empty.
     * @param x the position x.
     * @param y the position y.
     * @param w the width of to check
     * @param h the height of to check
     */
    isAreaEmpty(x, y, w, h) {
        return this.engine.isAreaEmpty(x, y, w, h);
    }
    /**
     * If you add elements to your grid by hand, you have to tell gridstack afterwards to make them widgets.
     * If you want gridstack to add the elements for you, use `addWidget()` instead.
     * Makes the given element a widget and returns it.
     * @param els widget or single selector to convert.
     *
     * @example
     * let grid = GridStack.init();
     * grid.el.appendChild('<div id="gsi-1" gs-w="3"></div>');
     * grid.makeWidget('#gsi-1');
     */
    makeWidget(els) {
        let el = GridStack.getElement(els);
        this._prepareElement(el, true);
        this._updateContainerHeight();
        this._triggerAddEvent();
        this._triggerChangeEvent();
        return el;
    }
    /**
     * Event handler that extracts our CustomEvent data out automatically for receiving custom
     * notifications (see doc for supported events)
     * @param name of the event (see possible values) or list of names space separated
     * @param callback function called with event and optional second/third param
     * (see README documentation for each signature).
     *
     * @example
     * grid.on('added', function(e, items) { log('added ', items)} );
     * or
     * grid.on('added removed change', function(e, items) { log(e.type, items)} );
     *
     * Note: in some cases it is the same as calling native handler and parsing the event.
     * grid.el.addEventListener('added', function(event) { log('added ', event.detail)} );
     *
     */
    on(name, callback) {
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            let names = name.split(' ');
            names.forEach(name => this.on(name, callback));
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // native CustomEvent handlers - cash the generic handlers so we can easily remove
            let noData = (name === 'enable' || name === 'disable');
            if (noData) {
                this._gsEventHandler[name] = (event) => callback(event);
            }
            else {
                this._gsEventHandler[name] = (event) => callback(event, event.detail);
            }
            this.el.addEventListener(name, this._gsEventHandler[name]);
        }
        else if (name === 'drag' || name === 'dragstart' || name === 'dragstop' || name === 'resizestart' || name === 'resize' || name === 'resizestop' || name === 'dropped') {
            // drag&drop stop events NEED to be call them AFTER we update node attributes so handle them ourself.
            // do same for start event to make it easier...
            this._gsEventHandler[name] = callback;
        }
        else {
            console.log('GridStack.on(' + name + ') event not supported, but you can still use $(".grid-stack").on(...) while jquery-ui is still used internally.');
        }
        return this;
    }
    /**
     * unsubscribe from the 'on' event below
     * @param name of the event (see possible values)
     */
    off(name) {
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            let names = name.split(' ');
            names.forEach(name => this.off(name));
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // remove native CustomEvent handlers
            if (this._gsEventHandler[name]) {
                this.el.removeEventListener(name, this._gsEventHandler[name]);
            }
        }
        delete this._gsEventHandler[name];
        return this;
    }
    /**
     * Removes widget from the grid.
     * @param el  widget or selector to modify
     * @param removeDOM if `false` DOM element won't be removed from the tree (Default? true).
     * @param triggerEvent if `false` (quiet mode) element will not be added to removed list and no 'removed' callbacks will be called (Default? true).
     */
    removeWidget(els, removeDOM = true, triggerEvent = true) {
        GridStack.getElements(els).forEach(el => {
            if (el.parentElement && el.parentElement !== this.el)
                return; // not our child!
            let node = el.gridstackNode;
            // For Meteor support: https://github.com/gridstack/gridstack.js/pull/272
            if (!node) {
                node = this.engine.nodes.find(n => el === n.el);
            }
            if (!node)
                return;
            // remove our DOM data (circular link) and drag&drop permanently
            delete el.gridstackNode;
            this._removeDD(el);
            this.engine.removeNode(node, removeDOM, triggerEvent);
            if (removeDOM && el.parentElement) {
                el.remove(); // in batch mode engine.removeNode doesn't call back to remove DOM
            }
        });
        if (triggerEvent) {
            this._triggerRemoveEvent();
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * Removes all widgets from the grid.
     * @param removeDOM if `false` DOM elements won't be removed from the tree (Default? `true`).
     */
    removeAll(removeDOM = true) {
        // always remove our DOM data (circular link) before list gets emptied and drag&drop permanently
        this.engine.nodes.forEach(n => {
            delete n.el.gridstackNode;
            this._removeDD(n.el);
        });
        this.engine.removeAll(removeDOM);
        this._triggerRemoveEvent();
        return this;
    }
    /**
     * Toggle the grid animation state.  Toggles the `grid-stack-animate` class.
     * @param doAnimate if true the grid will animate.
     */
    setAnimation(doAnimate) {
        if (doAnimate) {
            this.el.classList.add('grid-stack-animate');
        }
        else {
            this.el.classList.remove('grid-stack-animate');
        }
        return this;
    }
    /**
     * Toggle the grid static state, which permanently removes/add Drag&Drop support, unlike disable()/enable() that just turns it off/on.
     * Also toggle the grid-stack-static class.
     * @param val if true the grid become static.
     * @param updateClass true (default) if css class gets updated
     * @param recurse true (default) if sub-grids also get updated
     */
    setStatic(val, updateClass = true, recurse = true) {
        if (this.opts.staticGrid === val)
            return this;
        this.opts.staticGrid = val;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this.engine.nodes.forEach(n => {
            this._prepareDragDropByNode(n); // either delete or init Drag&drop
            if (n.subGrid && recurse)
                n.subGrid.setStatic(val, updateClass, recurse);
        });
        if (updateClass) {
            this._setStaticClass();
        }
        return this;
    }
    /**
     * Updates widget position/size and other info. Note: if you need to call this on all nodes, use load() instead which will update what changed.
     * @param els  widget or selector of objects to modify (note: setting the same x,y for multiple items will be indeterministic and likely unwanted)
     * @param opt new widget options (x,y,w,h, etc..). Only those set will be updated.
     */
    update(els, opt) {
        // support legacy call for now ?
        if (arguments.length > 2) {
            console.warn('gridstack.ts: `update(el, x, y, w, h)` is deprecated. Use `update(el, {x, w, content, ...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            let a = arguments, i = 1;
            opt = { x: a[i++], y: a[i++], w: a[i++], h: a[i++] };
            return this.update(els, opt);
        }
        GridStack.getElements(els).forEach(el => {
            if (!el || !el.gridstackNode)
                return;
            let n = el.gridstackNode;
            let w = utils_1.Utils.cloneDeep(opt); // make a copy we can modify in case they re-use it or multiple items
            delete w.autoPosition;
            // move/resize widget if anything changed
            let keys = ['x', 'y', 'w', 'h'];
            let m;
            if (keys.some(k => w[k] !== undefined && w[k] !== n[k])) {
                m = {};
                keys.forEach(k => {
                    m[k] = (w[k] !== undefined) ? w[k] : n[k];
                    delete w[k];
                });
            }
            // for a move as well IFF there is any min/max fields set
            if (!m && (w.minW || w.minH || w.maxW || w.maxH)) {
                m = {}; // will use node position but validate values
            }
            // check for content changing
            if (w.content) {
                let sub = el.querySelector('.grid-stack-item-content');
                if (sub && sub.innerHTML !== w.content) {
                    sub.innerHTML = w.content;
                }
                delete w.content;
            }
            // any remaining fields are assigned, but check for dragging changes, resize constrain
            let changed = false;
            let ddChanged = false;
            for (const key in w) {
                if (key[0] !== '_' && n[key] !== w[key]) {
                    n[key] = w[key];
                    changed = true;
                    ddChanged = ddChanged || (!this.opts.staticGrid && (key === 'noResize' || key === 'noMove' || key === 'locked'));
                }
            }
            // finally move the widget
            if (m) {
                this.engine.cleanNodes()
                    .beginUpdate(n)
                    .moveNode(n, m);
                this._updateContainerHeight();
                this._triggerChangeEvent();
                this.engine.endUpdate();
            }
            if (changed) { // move will only update x,y,w,h so update the rest too
                this._writeAttr(el, n);
            }
            if (ddChanged) {
                this._prepareDragDropByNode(n);
            }
        });
        return this;
    }
    /**
     * Updates the margins which will set all 4 sides at once - see `GridStackOptions.margin` for format options (CSS string format of 1,2,4 values or single number).
     * @param value margin value
     */
    margin(value) {
        let isMultiValue = (typeof value === 'string' && value.split(' ').length > 1);
        // check if we can skip re-creating our CSS file... won't check if multi values (too much hassle)
        if (!isMultiValue) {
            let data = utils_1.Utils.parseHeight(value);
            if (this.opts.marginUnit === data.unit && this.opts.margin === data.h)
                return;
        }
        // re-use existing margin handling
        this.opts.margin = value;
        this.opts.marginTop = this.opts.marginBottom = this.opts.marginLeft = this.opts.marginRight = undefined;
        this._initMargin();
        this._updateStyles(true); // true = force re-create
        return this;
    }
    /** returns current margin number value (undefined if 4 sides don't match) */
    getMargin() { return this.opts.margin; }
    /**
     * Returns true if the height of the grid will be less than the vertical
     * constraint. Always returns true if grid doesn't have height constraint.
     * @param node contains x,y,w,h,auto-position options
     *
     * @example
     * if (grid.willItFit(newWidget)) {
     *   grid.addWidget(newWidget);
     * } else {
     *   alert('Not enough free space to place the widget');
     * }
     */
    willItFit(node) {
        // support legacy call for now
        if (arguments.length > 1) {
            console.warn('gridstack.ts: `willItFit(x,y,w,h,autoPosition)` is deprecated. Use `willItFit({x, y,...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            let a = arguments, i = 0, w = { x: a[i++], y: a[i++], w: a[i++], h: a[i++], autoPosition: a[i++] };
            return this.willItFit(w);
        }
        return this.engine.willItFit(node);
    }
    /** @internal */
    _triggerChangeEvent() {
        if (this.engine.batchMode)
            return this;
        let elements = this.engine.getDirtyNodes(true); // verify they really changed
        if (elements && elements.length) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(elements);
            }
            this._triggerEvent('change', elements);
        }
        this.engine.saveInitial(); // we called, now reset initial values & dirty flags
        return this;
    }
    /** @internal */
    _triggerAddEvent() {
        if (this.engine.batchMode)
            return this;
        if (this.engine.addedNodes && this.engine.addedNodes.length > 0) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(this.engine.addedNodes);
            }
            // prevent added nodes from also triggering 'change' event (which is called next)
            this.engine.addedNodes.forEach(n => { delete n._dirty; });
            this._triggerEvent('added', this.engine.addedNodes);
            this.engine.addedNodes = [];
        }
        return this;
    }
    /** @internal */
    _triggerRemoveEvent() {
        if (this.engine.batchMode)
            return this;
        if (this.engine.removedNodes && this.engine.removedNodes.length > 0) {
            this._triggerEvent('removed', this.engine.removedNodes);
            this.engine.removedNodes = [];
        }
        return this;
    }
    /** @internal */
    _triggerEvent(type, data) {
        let event = data ? new CustomEvent(type, { bubbles: false, detail: data }) : new Event(type);
        this.el.dispatchEvent(event);
        return this;
    }
    /** @internal called to delete the current dynamic style sheet used for our layout */
    _removeStylesheet() {
        if (this._styles) {
            utils_1.Utils.removeStylesheet(this._styleSheetClass);
            delete this._styles;
        }
        return this;
    }
    /** @internal updated/create the CSS styles for row based layout and initial margin setting */
    _updateStyles(forceUpdate = false, maxH) {
        // call to delete existing one if we change cellHeight / margin
        if (forceUpdate) {
            this._removeStylesheet();
        }
        if (!maxH)
            maxH = this.getRow();
        this._updateContainerHeight();
        // if user is telling us they will handle the CSS themselves by setting heights to 0. Do we need this opts really ??
        if (this.opts.cellHeight === 0) {
            return this;
        }
        let cellHeight = this.opts.cellHeight;
        let cellHeightUnit = this.opts.cellHeightUnit;
        let prefix = `.${this._styleSheetClass} > .${this.opts.itemClass}`;
        // create one as needed
        if (!this._styles) {
            // insert style to parent (instead of 'head' by default) to support WebComponent
            let styleLocation = this.opts.styleInHead ? undefined : this.el.parentNode;
            this._styles = utils_1.Utils.createStylesheet(this._styleSheetClass, styleLocation, {
                nonce: this.opts.nonce,
            });
            if (!this._styles)
                return this;
            this._styles._max = 0;
            // these are done once only
            utils_1.Utils.addCSSRule(this._styles, prefix, `min-height: ${cellHeight}${cellHeightUnit}`);
            // content margins
            let top = this.opts.marginTop + this.opts.marginUnit;
            let bottom = this.opts.marginBottom + this.opts.marginUnit;
            let right = this.opts.marginRight + this.opts.marginUnit;
            let left = this.opts.marginLeft + this.opts.marginUnit;
            let content = `${prefix} > .grid-stack-item-content`;
            let placeholder = `.${this._styleSheetClass} > .grid-stack-placeholder > .placeholder-content`;
            utils_1.Utils.addCSSRule(this._styles, content, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            utils_1.Utils.addCSSRule(this._styles, placeholder, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            // resize handles offset (to match margin)
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-ne`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-e`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-se`, `right: ${right}; bottom: ${bottom}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-nw`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-w`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-sw`, `left: ${left}; bottom: ${bottom}`);
        }
        // now update the height specific fields
        maxH = maxH || this._styles._max;
        if (maxH > this._styles._max) {
            let getHeight = (rows) => (cellHeight * rows) + cellHeightUnit;
            for (let i = this._styles._max + 1; i <= maxH; i++) { // start at 1
                let h = getHeight(i);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-y="${i - 1}"]`, `top: ${getHeight(i - 1)}`); // start at 0
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-h="${i}"]`, `height: ${h}`);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-min-h="${i}"]`, `min-height: ${h}`);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-max-h="${i}"]`, `max-height: ${h}`);
            }
            this._styles._max = maxH;
        }
        return this;
    }
    /** @internal */
    _updateContainerHeight() {
        if (!this.engine || this.engine.batchMode)
            return this;
        let row = this.getRow() + this._extraDragRow; // checks for minRow already
        // check for css min height
        // Note: we don't handle %,rem correctly so comment out, beside we don't need need to create un-necessary
        // rows as the CSS will make us bigger than our set height if needed... not sure why we had this.
        // let cssMinHeight = parseInt(getComputedStyle(this.el)['min-height']);
        // if (cssMinHeight > 0) {
        //   let minRow = Math.round(cssMinHeight / this.getCellHeight(true));
        //   if (row < minRow) {
        //     row = minRow;
        //   }
        // }
        this.el.setAttribute('gs-current-row', String(row));
        if (row === 0) {
            this.el.style.removeProperty('min-height');
            return this;
        }
        let cellHeight = this.opts.cellHeight;
        let unit = this.opts.cellHeightUnit;
        if (!cellHeight)
            return this;
        this.el.style.minHeight = row * cellHeight + unit;
        return this;
    }
    /** @internal */
    _prepareElement(el, triggerAddEvent = false, node) {
        el.classList.add(this.opts.itemClass);
        node = node || this._readAttr(el);
        el.gridstackNode = node;
        node.el = el;
        node.grid = this;
        let copy = Object.assign({}, node);
        node = this.engine.addNode(node, triggerAddEvent);
        // write node attr back in case there was collision or we have to fix bad values during addNode()
        if (!utils_1.Utils.same(node, copy)) {
            this._writeAttr(el, node);
        }
        this._prepareDragDropByNode(node);
        return this;
    }
    /** @internal call to write position x,y,w,h attributes back to element */
    _writePosAttr(el, n) {
        if (n.x !== undefined && n.x !== null) {
            el.setAttribute('gs-x', String(n.x));
        }
        if (n.y !== undefined && n.y !== null) {
            el.setAttribute('gs-y', String(n.y));
        }
        if (n.w) {
            el.setAttribute('gs-w', String(n.w));
        }
        if (n.h) {
            el.setAttribute('gs-h', String(n.h));
        }
        return this;
    }
    /** @internal call to write any default attributes back to element */
    _writeAttr(el, node) {
        if (!node)
            return this;
        this._writePosAttr(el, node);
        let attrs /*: GridStackWidget but strings */ = {
            autoPosition: 'gs-auto-position',
            minW: 'gs-min-w',
            minH: 'gs-min-h',
            maxW: 'gs-max-w',
            maxH: 'gs-max-h',
            noResize: 'gs-no-resize',
            noMove: 'gs-no-move',
            locked: 'gs-locked',
            id: 'gs-id',
        };
        for (const key in attrs) {
            if (node[key]) { // 0 is valid for x,y only but done above already and not in list anyway
                el.setAttribute(attrs[key], String(node[key]));
            }
            else {
                el.removeAttribute(attrs[key]);
            }
        }
        return this;
    }
    /** @internal call to read any default attributes from element */
    _readAttr(el) {
        let node = {};
        node.x = utils_1.Utils.toNumber(el.getAttribute('gs-x'));
        node.y = utils_1.Utils.toNumber(el.getAttribute('gs-y'));
        node.w = utils_1.Utils.toNumber(el.getAttribute('gs-w'));
        node.h = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
        node.maxW = utils_1.Utils.toNumber(el.getAttribute('gs-max-w'));
        node.minW = utils_1.Utils.toNumber(el.getAttribute('gs-min-w'));
        node.maxH = utils_1.Utils.toNumber(el.getAttribute('gs-max-h'));
        node.minH = utils_1.Utils.toNumber(el.getAttribute('gs-min-h'));
        node.autoPosition = utils_1.Utils.toBool(el.getAttribute('gs-auto-position'));
        node.noResize = utils_1.Utils.toBool(el.getAttribute('gs-no-resize'));
        node.noMove = utils_1.Utils.toBool(el.getAttribute('gs-no-move'));
        node.locked = utils_1.Utils.toBool(el.getAttribute('gs-locked'));
        node.id = el.getAttribute('gs-id');
        // remove any key not found (null or false which is default)
        for (const key in node) {
            if (!node.hasOwnProperty(key))
                return;
            if (!node[key] && node[key] !== 0) { // 0 can be valid value (x,y only really)
                delete node[key];
            }
        }
        return node;
    }
    /** @internal */
    _setStaticClass() {
        let classes = ['grid-stack-static'];
        if (this.opts.staticGrid) {
            this.el.classList.add(...classes);
            this.el.setAttribute('gs-static', 'true');
        }
        else {
            this.el.classList.remove(...classes);
            this.el.removeAttribute('gs-static');
        }
        return this;
    }
    /**
     * called when we are being resized by the window - check if the one Column Mode needs to be turned on/off
     * and remember the prev columns we used, or get our count from parent, as well as check for auto cell height (square)
     */
    onParentResize() {
        if (!this.el || !this.el.clientWidth)
            return; // return if we're gone or no size yet (will get called again)
        let changedColumn = false;
        // see if we're nested and take our column count from our parent....
        if (this._autoColumn && this.parentGridItem) {
            if (this.opts.column !== this.parentGridItem.w) {
                changedColumn = true;
                this.column(this.parentGridItem.w, 'none');
            }
        }
        else {
            // else check for 1 column in/out behavior
            let oneColumn = !this.opts.disableOneColumnMode && this.el.clientWidth <= this.opts.oneColumnSize;
            if ((this.opts.column === 1) !== oneColumn) {
                changedColumn = true;
                if (this.opts.animate) {
                    this.setAnimation(false);
                } // 1 <-> 12 is too radical, turn off animation
                this.column(oneColumn ? 1 : this._prevColumn);
                if (this.opts.animate) {
                    this.setAnimation(true);
                }
            }
        }
        // make the cells content square again
        if (this._isAutoCellHeight) {
            if (!changedColumn && this.opts.cellHeightThrottle) {
                if (!this._cellHeightThrottle) {
                    this._cellHeightThrottle = utils_1.Utils.throttle(() => this.cellHeight(), this.opts.cellHeightThrottle);
                }
                this._cellHeightThrottle();
            }
            else {
                // immediate update if we've changed column count or have no threshold
                this.cellHeight();
            }
        }
        // finally update any nested grids
        this.engine.nodes.forEach(n => {
            if (n.subGrid) {
                n.subGrid.onParentResize();
            }
        });
        return this;
    }
    /** add or remove the window size event handler */
    _updateWindowResizeEvent(forceRemove = false) {
        // only add event if we're not nested (parent will call us) and we're auto sizing cells or supporting oneColumn (i.e. doing work)
        const workTodo = (this._isAutoCellHeight || !this.opts.disableOneColumnMode) && !this.parentGridItem;
        if (!forceRemove && workTodo && !this._windowResizeBind) {
            this._windowResizeBind = this.onParentResize.bind(this); // so we can properly remove later
            window.addEventListener('resize', this._windowResizeBind);
        }
        else if ((forceRemove || !workTodo) && this._windowResizeBind) {
            window.removeEventListener('resize', this._windowResizeBind);
            delete this._windowResizeBind; // remove link to us so we can free
        }
        return this;
    }
    /** @internal convert a potential selector into actual element */
    static getElement(els = '.grid-stack-item') { return utils_1.Utils.getElement(els); }
    /** @internal */
    static getElements(els = '.grid-stack-item') { return utils_1.Utils.getElements(els); }
    /** @internal */
    static getGridElement(els) { return GridStack.getElement(els); }
    /** @internal */
    static getGridElements(els) { return utils_1.Utils.getElements(els); }
    /** @internal initialize margin top/bottom/left/right and units */
    _initMargin() {
        let data;
        let margin = 0;
        // support passing multiple values like CSS (ex: '5px 10px 0 20px')
        let margins = [];
        if (typeof this.opts.margin === 'string') {
            margins = this.opts.margin.split(' ');
        }
        if (margins.length === 2) { // top/bot, left/right like CSS
            this.opts.marginTop = this.opts.marginBottom = margins[0];
            this.opts.marginLeft = this.opts.marginRight = margins[1];
        }
        else if (margins.length === 4) { // Clockwise like CSS
            this.opts.marginTop = margins[0];
            this.opts.marginRight = margins[1];
            this.opts.marginBottom = margins[2];
            this.opts.marginLeft = margins[3];
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.margin);
            this.opts.marginUnit = data.unit;
            margin = this.opts.margin = data.h;
        }
        // see if top/bottom/left/right need to be set as well
        if (this.opts.marginTop === undefined) {
            this.opts.marginTop = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginTop);
            this.opts.marginTop = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginBottom === undefined) {
            this.opts.marginBottom = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginBottom);
            this.opts.marginBottom = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginRight === undefined) {
            this.opts.marginRight = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginRight);
            this.opts.marginRight = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginLeft === undefined) {
            this.opts.marginLeft = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginLeft);
            this.opts.marginLeft = data.h;
            delete this.opts.margin;
        }
        this.opts.marginUnit = data.unit; // in case side were spelled out, use those units instead...
        if (this.opts.marginTop === this.opts.marginBottom && this.opts.marginLeft === this.opts.marginRight && this.opts.marginTop === this.opts.marginRight) {
            this.opts.margin = this.opts.marginTop; // makes it easier to check for no-ops in setMargin()
        }
        return this;
    }
    /* ===========================================================================================
     * drag&drop methods that used to be stubbed out and implemented in dd-gridstack.ts
     * but caused loading issues in prod - see https://github.com/gridstack/gridstack.js/issues/2039
     * ===========================================================================================
     */
    /** get the global (but static to this code) DD implementation */
    static getDD() {
        return dd;
    }
    /**
     * call to setup dragging in from the outside (say toolbar), by specifying the class selection and options.
     * Called during GridStack.init() as options, but can also be called directly (last param are used) in case the toolbar
     * is dynamically create and needs to be set later.
     * @param dragIn string selector (ex: '.sidebar .grid-stack-item')
     * @param dragInOptions options - see DDDragInOpt. (default: {handle: '.grid-stack-item-content', appendTo: 'body'}
     **/
    static setupDragIn(dragIn, dragInOptions) {
        if ((dragInOptions === null || dragInOptions === void 0 ? void 0 : dragInOptions.pause) !== undefined) {
            dd_manager_1.DDManager.pauseDrag = dragInOptions.pause;
        }
        if (typeof dragIn === 'string') {
            dragInOptions = Object.assign(Object.assign({}, types_1.dragInDefaultOptions), (dragInOptions || {}));
            utils_1.Utils.getElements(dragIn).forEach(el => {
                if (!dd.isDraggable(el))
                    dd.dragIn(el, dragInOptions);
            });
        }
    }
    /**
     * Enables/Disables dragging by the user of specific grid element. If you want all items, and have it affect future items, use enableMove() instead. No-op for static grids.
     * IF you are looking to prevent an item from moving (due to being pushed around by another during collision) use locked property instead.
     * @param els widget or selector to modify.
     * @param val if true widget will be draggable.
     */
    movable(els, val) {
        if (this.opts.staticGrid)
            return this; // can't move a static grid!
        GridStack.getElements(els).forEach(el => {
            let node = el.gridstackNode;
            if (!node)
                return;
            if (val)
                delete node.noMove;
            else
                node.noMove = true;
            this._prepareDragDropByNode(node); // init DD if need be, and adjust
        });
        return this;
    }
    /**
     * Enables/Disables user resizing of specific grid element. If you want all items, and have it affect future items, use enableResize() instead. No-op for static grids.
     * @param els  widget or selector to modify
     * @param val  if true widget will be resizable.
     */
    resizable(els, val) {
        if (this.opts.staticGrid)
            return this; // can't resize a static grid!
        GridStack.getElements(els).forEach(el => {
            let node = el.gridstackNode;
            if (!node)
                return;
            if (val)
                delete node.noResize;
            else
                node.noResize = true;
            this._prepareDragDropByNode(node); // init DD if need be, and adjust
        });
        return this;
    }
    /**
     * Temporarily disables widgets moving/resizing.
     * If you want a more permanent way (which freezes up resources) use `setStatic(true)` instead.
     * Note: no-op for static grid
     * This is a shortcut for:
     * @example
     *  grid.enableMove(false);
     *  grid.enableResize(false);
     * @param recurse true (default) if sub-grids also get updated
     */
    disable(recurse = true) {
        if (this.opts.staticGrid)
            return;
        this.enableMove(false, recurse);
        this.enableResize(false, recurse); // @ts-ignore
        this._triggerEvent('disable');
        return this;
    }
    /**
     * Re-enables widgets moving/resizing - see disable().
     * Note: no-op for static grid.
     * This is a shortcut for:
     * @example
     *  grid.enableMove(true);
     *  grid.enableResize(true);
     * @param recurse true (default) if sub-grids also get updated
     */
    enable(recurse = true) {
        if (this.opts.staticGrid)
            return;
        this.enableMove(true, recurse);
        this.enableResize(true, recurse); // @ts-ignore
        this._triggerEvent('enable');
        return this;
    }
    /**
     * Enables/disables widget moving. No-op for static grids.
     * @param recurse true (default) if sub-grids also get updated
     */
    enableMove(doEnable, recurse = true) {
        if (this.opts.staticGrid)
            return this; // can't move a static grid!
        this.opts.disableDrag = !doEnable; // FIRST before we update children as grid overrides #1658
        this.engine.nodes.forEach(n => {
            this.movable(n.el, doEnable);
            if (n.subGrid && recurse)
                n.subGrid.enableMove(doEnable, recurse);
        });
        return this;
    }
    /**
     * Enables/disables widget resizing. No-op for static grids.
     * @param recurse true (default) if sub-grids also get updated
     */
    enableResize(doEnable, recurse = true) {
        if (this.opts.staticGrid)
            return this; // can't size a static grid!
        this.opts.disableResize = !doEnable; // FIRST before we update children as grid overrides #1658
        this.engine.nodes.forEach(n => {
            this.resizable(n.el, doEnable);
            if (n.subGrid && recurse)
                n.subGrid.enableResize(doEnable, recurse);
        });
        return this;
    }
    /** @internal removes any drag&drop present (called during destroy) */
    _removeDD(el) {
        dd.draggable(el, 'destroy').resizable(el, 'destroy');
        if (el.gridstackNode) {
            delete el.gridstackNode._initDD; // reset our DD init flag
        }
        delete el.ddElement;
        return this;
    }
    /** @internal called to add drag over to support widgets being added externally */
    _setupAcceptWidget() {
        // check if we need to disable things
        if (this.opts.staticGrid || (!this.opts.acceptWidgets && !this.opts.removable)) {
            dd.droppable(this.el, 'destroy');
            return this;
        }
        // vars shared across all methods
        let cellHeight, cellWidth;
        let onDrag = (event, el, helper) => {
            let node = el.gridstackNode;
            if (!node)
                return;
            helper = helper || el;
            let parent = this.el.getBoundingClientRect();
            let { top, left } = helper.getBoundingClientRect();
            left -= parent.left;
            top -= parent.top;
            let ui = { position: { top, left } };
            if (node._temporaryRemoved) {
                node.x = Math.max(0, Math.round(left / cellWidth));
                node.y = Math.max(0, Math.round(top / cellHeight));
                delete node.autoPosition;
                this.engine.nodeBoundFix(node);
                // don't accept *initial* location if doesn't fit #1419 (locked drop region, or can't grow), but maybe try if it will go somewhere
                if (!this.engine.willItFit(node)) {
                    node.autoPosition = true; // ignore x,y and try for any slot...
                    if (!this.engine.willItFit(node)) {
                        dd.off(el, 'drag'); // stop calling us
                        return; // full grid or can't grow
                    }
                    if (node._willFitPos) {
                        // use the auto position instead #1687
                        utils_1.Utils.copyPos(node, node._willFitPos);
                        delete node._willFitPos;
                    }
                }
                // re-use the existing node dragging method
                this._onStartMoving(helper, event, ui, node, cellWidth, cellHeight);
            }
            else {
                // re-use the existing node dragging that does so much of the collision detection
                this._dragOrResize(helper, event, ui, node, cellWidth, cellHeight);
            }
        };
        dd.droppable(this.el, {
            accept: (el) => {
                let node = el.gridstackNode;
                // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
                if ((node === null || node === void 0 ? void 0 : node.grid) === this)
                    return true;
                if (!this.opts.acceptWidgets)
                    return false;
                // check for accept method or class matching
                let canAccept = true;
                if (typeof this.opts.acceptWidgets === 'function') {
                    canAccept = this.opts.acceptWidgets(el);
                }
                else {
                    let selector = (this.opts.acceptWidgets === true ? '.grid-stack-item' : this.opts.acceptWidgets);
                    canAccept = el.matches(selector);
                }
                // finally check to make sure we actually have space left #1571
                if (canAccept && node && this.opts.maxRow) {
                    let n = { w: node.w, h: node.h, minW: node.minW, minH: node.minH }; // only width/height matters and autoPosition
                    canAccept = this.engine.willItFit(n);
                }
                return canAccept;
            }
        })
            /**
             * entering our grid area
             */
            .on(this.el, 'dropover', (event, el, helper) => {
            // console.log(`over ${this.el.gridstack.opts.id} ${count++}`); // TEST
            let node = el.gridstackNode;
            // ignore drop enter on ourself (unless we temporarily removed) which happens on a simple drag of our item
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._temporaryRemoved) {
                // delete node._added; // reset this to track placeholder again in case we were over other grid #1484 (dropout doesn't always clear)
                return false; // prevent parent from receiving msg (which may be a grid as well)
            }
            // fix #1578 when dragging fast, we may not get a leave on the previous grid so force one now
            if ((node === null || node === void 0 ? void 0 : node.grid) && node.grid !== this && !node._temporaryRemoved) {
                // console.log('dropover without leave'); // TEST
                let otherGrid = node.grid;
                otherGrid._leave(el, helper);
            }
            // cache cell dimensions (which don't change), position can animate if we removed an item in otherGrid that affects us...
            cellWidth = this.cellWidth();
            cellHeight = this.getCellHeight(true);
            // load any element attributes if we don't have a node
            if (!node) { // @ts-ignore private read only on ourself
                node = this._readAttr(el);
            }
            if (!node.grid) {
                node._isExternal = true;
                el.gridstackNode = node;
            }
            // calculate the grid size based on element outer size
            helper = helper || el;
            let w = node.w || Math.round(helper.offsetWidth / cellWidth) || 1;
            let h = node.h || Math.round(helper.offsetHeight / cellHeight) || 1;
            // if the item came from another grid, make a copy and save the original info in case we go back there
            if (node.grid && node.grid !== this) {
                // copy the node original values (min/max/id/etc...) but override width/height/other flags which are this grid specific
                // console.log('dropover cloning node'); // TEST
                if (!el._gridstackNodeOrig)
                    el._gridstackNodeOrig = node; // shouldn't have multiple nested!
                el.gridstackNode = node = Object.assign(Object.assign({}, node), { w, h, grid: this });
                this.engine.cleanupNode(node)
                    .nodeBoundFix(node);
                // restore some internal fields we need after clearing them all
                node._initDD =
                    node._isExternal = // DOM needs to be re-parented on a drop
                        node._temporaryRemoved = true; // so it can be inserted onDrag below
            }
            else {
                node.w = w;
                node.h = h;
                node._temporaryRemoved = true; // so we can insert it
            }
            // clear any marked for complete removal (Note: don't check _isAboutToRemove as that is cleared above - just do it)
            this._itemRemoving(node.el, false);
            dd.on(el, 'drag', onDrag);
            // make sure this is called at least once when going fast #1578
            onDrag(event, el, helper);
            return false; // prevent parent from receiving msg (which may be a grid as well)
        })
            /**
             * Leaving our grid area...
             */
            .on(this.el, 'dropout', (event, el, helper) => {
            // console.log(`out ${this.el.gridstack.opts.id} ${count++}`); // TEST
            let node = el.gridstackNode;
            if (!node)
                return false;
            // fix #1578 when dragging fast, we might get leave after other grid gets enter (which calls us to clean)
            // so skip this one if we're not the active grid really..
            if (!node.grid || node.grid === this) {
                this._leave(el, helper);
                // if we were created as temporary nested grid, go back to before state
                if (this._isTemp) {
                    this.removeAsSubGrid(node);
                }
            }
            return false; // prevent parent from receiving msg (which may be grid as well)
        })
            /**
             * end - releasing the mouse
             */
            .on(this.el, 'drop', (event, el, helper) => {
            var _a, _b;
            let node = el.gridstackNode;
            // ignore drop on ourself from ourself that didn't come from the outside - dragend will handle the simple move instead
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._isExternal)
                return false;
            let wasAdded = !!this.placeholder.parentElement; // skip items not actually added to us because of constrains, but do cleanup #1419
            this.placeholder.remove();
            // notify previous grid of removal
            // console.log('drop delete _gridstackNodeOrig') // TEST
            let origNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
            if (wasAdded && (origNode === null || origNode === void 0 ? void 0 : origNode.grid) && origNode.grid !== this) {
                let oGrid = origNode.grid;
                oGrid.engine.removedNodes.push(origNode);
                oGrid._triggerRemoveEvent()._triggerChangeEvent();
                // if it's an empty sub-grid that got auto-created, nuke it
                if (oGrid.parentGridItem && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
                    oGrid.removeAsSubGrid();
                }
            }
            if (!node)
                return false;
            // use existing placeholder node as it's already in our list with drop location
            if (wasAdded) {
                this.engine.cleanupNode(node); // removes all internal _xyz values
                node.grid = this;
            }
            dd.off(el, 'drag');
            // if we made a copy ('helper' which is temp) of the original node then insert a copy, else we move the original node (#1102)
            // as the helper will be nuked by jquery-ui otherwise. TODO: update old code path
            if (helper !== el) {
                helper.remove();
                el.gridstackNode = origNode; // original item (left behind) is re-stored to pre dragging as the node now has drop info
                if (wasAdded) {
                    el = el.cloneNode(true);
                }
            }
            else {
                el.remove(); // reduce flicker as we change depth here, and size further down
                this._removeDD(el);
            }
            if (!wasAdded)
                return false;
            el.gridstackNode = node;
            node.el = el;
            let subGrid = (_b = (_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el) === null || _b === void 0 ? void 0 : _b.gridstack; // set when actual sub-grid present
            // @ts-ignore
            utils_1.Utils.copyPos(node, this._readAttr(this.placeholder)); // placeholder values as moving VERY fast can throw things off #1578
            utils_1.Utils.removePositioningStyles(el); // @ts-ignore
            this._writeAttr(el, node);
            el.classList.add(types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.el.appendChild(el); // @ts-ignore // TODO: now would be ideal time to _removeHelperStyle() overriding floating styles (native only)
            if (subGrid) {
                subGrid.parentGridItem = node;
                if (!subGrid.opts.styleInHead)
                    subGrid._updateStyles(true); // re-create sub-grid styles now that we've moved
            }
            this._updateContainerHeight();
            this.engine.addedNodes.push(node); // @ts-ignore
            this._triggerAddEvent(); // @ts-ignore
            this._triggerChangeEvent();
            this.engine.endUpdate();
            if (this._gsEventHandler['dropped']) {
                this._gsEventHandler['dropped'](Object.assign(Object.assign({}, event), { type: 'dropped' }), origNode && origNode.grid ? origNode : undefined, node);
            }
            // wait till we return out of the drag callback to set the new drag&resize handler or they may get messed up
            window.setTimeout(() => {
                // IFF we are still there (some application will use as placeholder and insert their real widget instead and better call makeWidget())
                if (node.el && node.el.parentElement) {
                    this._prepareDragDropByNode(node);
                }
                else {
                    this.engine.removeNode(node);
                }
                delete node.grid._isTemp;
            });
            return false; // prevent parent from receiving msg (which may be grid as well)
        });
        return this;
    }
    /** @internal mark item for removal */
    _itemRemoving(el, remove) {
        let node = el ? el.gridstackNode : undefined;
        if (!node || !node.grid)
            return;
        remove ? node._isAboutToRemove = true : delete node._isAboutToRemove;
        remove ? el.classList.add('grid-stack-item-removing') : el.classList.remove('grid-stack-item-removing');
    }
    /** @internal called to setup a trash drop zone if the user specifies it */
    _setupRemoveDrop() {
        if (!this.opts.staticGrid && typeof this.opts.removable === 'string') {
            let trashEl = document.querySelector(this.opts.removable);
            if (!trashEl)
                return this;
            // only register ONE drop-over/dropout callback for the 'trash', and it will
            // update the passed in item and parent grid because the 'trash' is a shared resource anyway,
            // and Native DD only has 1 event CB (having a list and technically a per grid removableOptions complicates things greatly)
            if (!dd.isDroppable(trashEl)) {
                dd.droppable(trashEl, this.opts.removableOptions)
                    .on(trashEl, 'dropover', (event, el) => this._itemRemoving(el, true))
                    .on(trashEl, 'dropout', (event, el) => this._itemRemoving(el, false));
            }
        }
        return this;
    }
    /** @internal prepares the element for drag&drop **/
    _prepareDragDropByNode(node) {
        let el = node.el;
        const noMove = node.noMove || this.opts.disableDrag;
        const noResize = node.noResize || this.opts.disableResize;
        // check for disabled grid first
        if (this.opts.staticGrid || (noMove && noResize)) {
            if (node._initDD) {
                this._removeDD(el); // nukes everything instead of just disable, will add some styles back next
                delete node._initDD;
            }
            el.classList.add('ui-draggable-disabled', 'ui-resizable-disabled'); // add styles one might depend on #1435
            return this;
        }
        if (!node._initDD) {
            // variables used/cashed between the 3 start/move/end methods, in addition to node passed above
            let cellWidth;
            let cellHeight;
            /** called when item starts moving/resizing */
            let onStartMoving = (event, ui) => {
                // trigger any 'dragstart' / 'resizestart' manually
                if (this._gsEventHandler[event.type]) {
                    this._gsEventHandler[event.type](event, event.target);
                }
                cellWidth = this.cellWidth();
                cellHeight = this.getCellHeight(true); // force pixels for calculations
                this._onStartMoving(el, event, ui, node, cellWidth, cellHeight);
            };
            /** called when item is being dragged/resized */
            let dragOrResize = (event, ui) => {
                this._dragOrResize(el, event, ui, node, cellWidth, cellHeight);
            };
            /** called when the item stops moving/resizing */
            let onEndMoving = (event) => {
                this.placeholder.remove();
                delete node._moving;
                delete node._event;
                delete node._lastTried;
                // if the item has moved to another grid, we're done here
                let target = event.target;
                if (!target.gridstackNode || target.gridstackNode.grid !== this)
                    return;
                node.el = target;
                if (node._isAboutToRemove) {
                    let gridToNotify = el.gridstackNode.grid;
                    if (gridToNotify._gsEventHandler[event.type]) {
                        gridToNotify._gsEventHandler[event.type](event, target);
                    }
                    this._removeDD(el);
                    gridToNotify.engine.removedNodes.push(node);
                    gridToNotify._triggerRemoveEvent();
                    // break circular links and remove DOM
                    delete el.gridstackNode;
                    delete node.el;
                    el.remove();
                }
                else {
                    utils_1.Utils.removePositioningStyles(target);
                    if (node._temporaryRemoved) {
                        // got removed - restore item back to before dragging position
                        utils_1.Utils.copyPos(node, node._orig); // @ts-ignore
                        this._writePosAttr(target, node);
                        this.engine.addNode(node);
                    }
                    else {
                        // move to new placeholder location
                        this._writePosAttr(target, node);
                    }
                    if (this._gsEventHandler[event.type]) {
                        this._gsEventHandler[event.type](event, target);
                    }
                }
                // @ts-ignore
                this._extraDragRow = 0; // @ts-ignore
                this._updateContainerHeight(); // @ts-ignore
                this._triggerChangeEvent();
                this.engine.endUpdate();
            };
            dd.draggable(el, {
                start: onStartMoving,
                stop: onEndMoving,
                drag: dragOrResize
            }).resizable(el, {
                start: onStartMoving,
                stop: onEndMoving,
                resize: dragOrResize
            });
            node._initDD = true; // we've set DD support now
        }
        // finally fine tune move vs resize by disabling any part...
        dd.draggable(el, noMove ? 'disable' : 'enable')
            .resizable(el, noResize ? 'disable' : 'enable');
        return this;
    }
    /** @internal handles actual drag/resize start **/
    _onStartMoving(el, event, ui, node, cellWidth, cellHeight) {
        this.engine.cleanNodes()
            .beginUpdate(node);
        // @ts-ignore
        this._writePosAttr(this.placeholder, node);
        this.el.appendChild(this.placeholder);
        // console.log('_onStartMoving placeholder') // TEST
        node.el = this.placeholder;
        node._lastUiPosition = ui.position;
        node._prevYPix = ui.position.top;
        node._moving = (event.type === 'dragstart'); // 'dropover' are not initially moving so they can go exactly where they enter (will push stuff out of the way)
        delete node._lastTried;
        if (event.type === 'dropover' && node._temporaryRemoved) {
            // console.log('engine.addNode x=' + node.x); // TEST
            this.engine.addNode(node); // will add, fix collisions, update attr and clear _temporaryRemoved
            node._moving = true; // AFTER, mark as moving object (wanted fix location before)
        }
        // set the min/max resize info
        this.engine.cacheRects(cellWidth, cellHeight, this.opts.marginTop, this.opts.marginRight, this.opts.marginBottom, this.opts.marginLeft);
        if (event.type === 'resizestart') {
            dd.resizable(el, 'option', 'minWidth', cellWidth * (node.minW || 1))
                .resizable(el, 'option', 'minHeight', cellHeight * (node.minH || 1));
            if (node.maxW) {
                dd.resizable(el, 'option', 'maxWidth', cellWidth * node.maxW);
            }
            if (node.maxH) {
                dd.resizable(el, 'option', 'maxHeight', cellHeight * node.maxH);
            }
        }
    }
    /** @internal handles actual drag/resize **/
    _dragOrResize(el, event, ui, node, cellWidth, cellHeight) {
        let p = Object.assign({}, node._orig); // could be undefined (_isExternal) which is ok (drag only set x,y and w,h will default to node value)
        let resizing;
        let mLeft = this.opts.marginLeft, mRight = this.opts.marginRight, mTop = this.opts.marginTop, mBottom = this.opts.marginBottom;
        // if margins (which are used to pass mid point by) are large relative to cell height/width, reduce them down #1855
        let mHeight = Math.round(cellHeight * 0.1), mWidth = Math.round(cellWidth * 0.1);
        mLeft = Math.min(mLeft, mWidth);
        mRight = Math.min(mRight, mWidth);
        mTop = Math.min(mTop, mHeight);
        mBottom = Math.min(mBottom, mHeight);
        if (event.type === 'drag') {
            if (node._temporaryRemoved)
                return; // handled by dropover
            let distance = ui.position.top - node._prevYPix;
            node._prevYPix = ui.position.top;
            if (this.opts.draggable.scroll !== false) {
                utils_1.Utils.updateScrollPosition(el, ui.position, distance);
            }
            // get new position taking into account the margin in the direction we are moving! (need to pass mid point by margin)
            let left = ui.position.left + (ui.position.left > node._lastUiPosition.left ? -mRight : mLeft);
            let top = ui.position.top + (ui.position.top > node._lastUiPosition.top ? -mBottom : mTop);
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            // @ts-ignore// if we're at the bottom hitting something else, grow the grid so cursor doesn't leave when trying to place below others
            let prev = this._extraDragRow;
            if (this.engine.collide(node, p)) {
                let row = this.getRow();
                let extra = Math.max(0, (p.y + node.h) - row);
                if (this.opts.maxRow && row + extra > this.opts.maxRow) {
                    extra = Math.max(0, this.opts.maxRow - row);
                } // @ts-ignore
                this._extraDragRow = extra; // @ts-ignore
            }
            else
                this._extraDragRow = 0; // @ts-ignore
            if (this._extraDragRow !== prev)
                this._updateContainerHeight();
            if (node.x === p.x && node.y === p.y)
                return; // skip same
            // DON'T skip one we tried as we might have failed because of coverage <50% before
            // if (node._lastTried && node._lastTried.x === x && node._lastTried.y === y) return;
        }
        else if (event.type === 'resize') {
            if (p.x < 0)
                return;
            // Scrolling page if needed
            utils_1.Utils.updateScrollResize(event, el, cellHeight);
            // get new size
            p.w = Math.round((ui.size.width - mLeft) / cellWidth);
            p.h = Math.round((ui.size.height - mTop) / cellHeight);
            if (node.w === p.w && node.h === p.h)
                return;
            if (node._lastTried && node._lastTried.w === p.w && node._lastTried.h === p.h)
                return; // skip one we tried (but failed)
            // if we size on left/top side this might move us, so get possible new position as well
            let left = ui.position.left + mLeft;
            let top = ui.position.top + mTop;
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            resizing = true;
        }
        node._event = event;
        node._lastTried = p; // set as last tried (will nuke if we go there)
        let rect = {
            x: ui.position.left + mLeft,
            y: ui.position.top + mTop,
            w: (ui.size ? ui.size.width : node.w * cellWidth) - mLeft - mRight,
            h: (ui.size ? ui.size.height : node.h * cellHeight) - mTop - mBottom
        };
        if (this.engine.moveNodeCheck(node, Object.assign(Object.assign({}, p), { cellWidth, cellHeight, rect, resizing }))) {
            node._lastUiPosition = ui.position;
            this.engine.cacheRects(cellWidth, cellHeight, mTop, mRight, mBottom, mLeft);
            delete node._skipDown;
            if (resizing && node.subGrid) {
                node.subGrid.onParentResize();
            } // @ts-ignore
            this._extraDragRow = 0; // @ts-ignore
            this._updateContainerHeight();
            let target = event.target; // @ts-ignore
            this._writePosAttr(target, node);
            if (this._gsEventHandler[event.type]) {
                this._gsEventHandler[event.type](event, target);
            }
        }
    }
    /** @internal called when item leaving our area by either cursor dropout event
     * or shape is outside our boundaries. remove it from us, and mark temporary if this was
     * our item to start with else restore prev node values from prev grid it came from.
     **/
    _leave(el, helper) {
        let node = el.gridstackNode;
        if (!node)
            return;
        dd.off(el, 'drag'); // no need to track while being outside
        // this gets called when cursor leaves and shape is outside, so only do this once
        if (node._temporaryRemoved)
            return;
        node._temporaryRemoved = true;
        this.engine.removeNode(node); // remove placeholder as well, otherwise it's a sign node is not in our list, which is a bigger issue
        node.el = node._isExternal && helper ? helper : el; // point back to real item being dragged
        if (this.opts.removable === true) { // boolean vs a class string
            // item leaving us and we are supposed to remove on leave (no need to drag onto trash) mark it so
            this._itemRemoving(el, true);
        }
        // finally if item originally came from another grid, but left us, restore things back to prev info
        if (el._gridstackNodeOrig) {
            // console.log('leave delete _gridstackNodeOrig') // TEST
            el.gridstackNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
        }
        else if (node._isExternal) {
            // item came from outside (like a toolbar) so nuke any node info
            delete node.el;
            delete el.gridstackNode;
            // and restore all nodes back to original
            this.engine.restoreInitial();
        }
    }
    // legacy method removed
    commit() { utils_1.obsolete(this, this.batchUpdate(false), 'commit', 'batchUpdate', '5.2'); return this; }
}
exports.GridStack = GridStack;
/** scoping so users can call GridStack.Utils.sort() for example */
GridStack.Utils = utils_1.Utils;
/** scoping so users can call new GridStack.Engine(12) for example */
GridStack.Engine = gridstack_engine_1.GridStackEngine;
GridStack.GDRev = '7.3.0';
//# sourceMappingURL=gridstack.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/types.js":
/*!**********************************************!*\
  !*** ./node_modules/gridstack/dist/types.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * types.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dragInDefaultOptions = exports.gridDefaults = void 0;
// default values for grid options - used during init and when saving out
exports.gridDefaults = {
    alwaysShowResizeHandle: 'mobile',
    animate: true,
    auto: true,
    cellHeight: 'auto',
    cellHeightThrottle: 100,
    cellHeightUnit: 'px',
    column: 12,
    draggable: { handle: '.grid-stack-item-content', appendTo: 'body', scroll: true },
    handle: '.grid-stack-item-content',
    itemClass: 'grid-stack-item',
    margin: 10,
    marginUnit: 'px',
    maxRow: 0,
    minRow: 0,
    oneColumnSize: 768,
    placeholderClass: 'grid-stack-placeholder',
    placeholderText: '',
    removableOptions: { accept: '.grid-stack-item' },
    resizable: { handles: 'se' },
    rtl: 'auto',
};
/** default dragIn options */
exports.dragInDefaultOptions = {
    handle: '.grid-stack-item-content',
    appendTo: 'body',
};
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/gridstack/dist/utils.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * utils.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = exports.obsoleteAttr = exports.obsoleteOptsDel = exports.obsoleteOpts = exports.obsolete = void 0;
/** checks for obsolete method names */
// eslint-disable-next-line
function obsolete(self, f, oldName, newName, rev) {
    let wrapper = (...args) => {
        console.warn('gridstack.js: Function `' + oldName + '` is deprecated in ' + rev + ' and has been replaced ' +
            'with `' + newName + '`. It will be **removed** in a future release');
        return f.apply(self, args);
    };
    wrapper.prototype = f.prototype;
    return wrapper;
}
exports.obsolete = obsolete;
/** checks for obsolete grid options (can be used for any fields, but msg is about options) */
function obsoleteOpts(opts, oldName, newName, rev) {
    if (opts[oldName] !== undefined) {
        opts[newName] = opts[oldName];
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **removed** in a future release');
    }
}
exports.obsoleteOpts = obsoleteOpts;
/** checks for obsolete grid options which are gone */
function obsoleteOptsDel(opts, oldName, rev, info) {
    if (opts[oldName] !== undefined) {
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + info);
    }
}
exports.obsoleteOptsDel = obsoleteOptsDel;
/** checks for obsolete Jquery element attributes */
function obsoleteAttr(el, oldName, newName, rev) {
    let oldAttr = el.getAttribute(oldName);
    if (oldAttr !== null) {
        el.setAttribute(newName, oldAttr);
        console.warn('gridstack.js: attribute `' + oldName + '`=' + oldAttr + ' is deprecated on this object in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **removed** in a future release');
    }
}
exports.obsoleteAttr = obsoleteAttr;
/**
 * Utility methods
 */
class Utils {
    /** convert a potential selector into actual list of html elements */
    static getElements(els) {
        if (typeof els === 'string') {
            let list = document.querySelectorAll(els);
            if (!list.length && els[0] !== '.' && els[0] !== '#') {
                list = document.querySelectorAll('.' + els);
                if (!list.length) {
                    list = document.querySelectorAll('#' + els);
                }
            }
            return Array.from(list);
        }
        return [els];
    }
    /** convert a potential selector into actual single element */
    static getElement(els) {
        if (typeof els === 'string') {
            if (!els.length)
                return null;
            if (els[0] === '#') {
                return document.getElementById(els.substring(1));
            }
            if (els[0] === '.' || els[0] === '[') {
                return document.querySelector(els);
            }
            // if we start with a digit, assume it's an id (error calling querySelector('#1')) as class are not valid CSS
            if (!isNaN(+els[0])) { // start with digit
                return document.getElementById(els);
            }
            // finally try string, then id then class
            let el = document.querySelector(els);
            if (!el) {
                el = document.getElementById(els);
            }
            if (!el) {
                el = document.querySelector('.' + els);
            }
            return el;
        }
        return els;
    }
    /** returns true if a and b overlap */
    static isIntercepted(a, b) {
        return !(a.y >= b.y + b.h || a.y + a.h <= b.y || a.x + a.w <= b.x || a.x >= b.x + b.w);
    }
    /** returns true if a and b touch edges or corners */
    static isTouching(a, b) {
        return Utils.isIntercepted(a, { x: b.x - 0.5, y: b.y - 0.5, w: b.w + 1, h: b.h + 1 });
    }
    /** returns the area a and b overlap */
    static areaIntercept(a, b) {
        let x0 = (a.x > b.x) ? a.x : b.x;
        let x1 = (a.x + a.w < b.x + b.w) ? a.x + a.w : b.x + b.w;
        if (x1 <= x0)
            return 0; // no overlap
        let y0 = (a.y > b.y) ? a.y : b.y;
        let y1 = (a.y + a.h < b.y + b.h) ? a.y + a.h : b.y + b.h;
        if (y1 <= y0)
            return 0; // no overlap
        return (x1 - x0) * (y1 - y0);
    }
    /** returns the area */
    static area(a) {
        return a.w * a.h;
    }
    /**
     * Sorts array of nodes
     * @param nodes array to sort
     * @param dir 1 for asc, -1 for desc (optional)
     * @param width width of the grid. If undefined the width will be calculated automatically (optional).
     **/
    static sort(nodes, dir, column) {
        column = column || nodes.reduce((col, n) => Math.max(n.x + n.w, col), 0) || 12;
        if (dir === -1)
            return nodes.sort((a, b) => (b.x + b.y * column) - (a.x + a.y * column));
        else
            return nodes.sort((b, a) => (b.x + b.y * column) - (a.x + a.y * column));
    }
    /**
     * creates a style sheet with style id under given parent
     * @param id will set the 'gs-style-id' attribute to that id
     * @param parent to insert the stylesheet as first child,
     * if none supplied it will be appended to the document head instead.
     */
    static createStylesheet(id, parent, options) {
        let style = document.createElement('style');
        const nonce = options === null || options === void 0 ? void 0 : options.nonce;
        if (nonce)
            style.nonce = nonce;
        style.setAttribute('type', 'text/css');
        style.setAttribute('gs-style-id', id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (style.styleSheet) { // TODO: only CSSImportRule have that and different beast ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style.styleSheet.cssText = '';
        }
        else {
            style.appendChild(document.createTextNode('')); // WebKit hack
        }
        if (!parent) {
            // default to head
            parent = document.getElementsByTagName('head')[0];
            parent.appendChild(style);
        }
        else {
            parent.insertBefore(style, parent.firstChild);
        }
        return style.sheet;
    }
    /** removed the given stylesheet id */
    static removeStylesheet(id) {
        let el = document.querySelector('STYLE[gs-style-id=' + id + ']');
        if (el && el.parentNode)
            el.remove();
    }
    /** inserts a CSS rule */
    static addCSSRule(sheet, selector, rules) {
        if (typeof sheet.addRule === 'function') {
            sheet.addRule(selector, rules);
        }
        else if (typeof sheet.insertRule === 'function') {
            sheet.insertRule(`${selector}{${rules}}`);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toBool(v) {
        if (typeof v === 'boolean') {
            return v;
        }
        if (typeof v === 'string') {
            v = v.toLowerCase();
            return !(v === '' || v === 'no' || v === 'false' || v === '0');
        }
        return Boolean(v);
    }
    static toNumber(value) {
        return (value === null || value.length === 0) ? undefined : Number(value);
    }
    static parseHeight(val) {
        let h;
        let unit = 'px';
        if (typeof val === 'string') {
            let match = val.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%)?$/);
            if (!match) {
                throw new Error('Invalid height');
            }
            unit = match[2] || 'px';
            h = parseFloat(match[1]);
        }
        else {
            h = val;
        }
        return { h, unit };
    }
    /** copies unset fields in target to use the given default sources values */
    // eslint-disable-next-line
    static defaults(target, ...sources) {
        sources.forEach(source => {
            for (const key in source) {
                if (!source.hasOwnProperty(key))
                    return;
                if (target[key] === null || target[key] === undefined) {
                    target[key] = source[key];
                }
                else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                    // property is an object, recursively add it's field over... #1373
                    this.defaults(target[key], source[key]);
                }
            }
        });
        return target;
    }
    /** given 2 objects return true if they have the same values. Checks for Object {} having same fields and values (just 1 level down) */
    static same(a, b) {
        if (typeof a !== 'object')
            return a == b;
        if (typeof a !== typeof b)
            return false;
        // else we have object, check just 1 level deep for being same things...
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (const key in a) {
            if (a[key] !== b[key])
                return false;
        }
        return true;
    }
    /** copies over b size & position (GridStackPosition), and optionally min/max as well */
    static copyPos(a, b, doMinMax = false) {
        a.x = b.x;
        a.y = b.y;
        a.w = b.w;
        a.h = b.h;
        if (doMinMax) {
            if (b.minW)
                a.minW = b.minW;
            if (b.minH)
                a.minH = b.minH;
            if (b.maxW)
                a.maxW = b.maxW;
            if (b.maxH)
                a.maxH = b.maxH;
        }
        return a;
    }
    /** true if a and b has same size & position */
    static samePos(a, b) {
        return a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
    }
    /** removes field from the first object if same as the second objects (like diffing) and internal '_' for saving */
    static removeInternalAndSame(a, b) {
        if (typeof a !== 'object' || typeof b !== 'object')
            return;
        for (let key in a) {
            let val = a[key];
            if (key[0] === '_' || val === b[key]) {
                delete a[key];
            }
            else if (val && typeof val === 'object' && b[key] !== undefined) {
                for (let i in val) {
                    if (val[i] === b[key][i] || i[0] === '_') {
                        delete val[i];
                    }
                }
                if (!Object.keys(val).length) {
                    delete a[key];
                }
            }
        }
    }
    /** removes internal fields '_' and default values for saving */
    static removeInternalForSave(n, removeEl = true) {
        for (let key in n) {
            if (key[0] === '_' || n[key] === null || n[key] === undefined)
                delete n[key];
        }
        delete n.grid;
        if (removeEl)
            delete n.el;
        // delete default values (will be re-created on read)
        if (!n.autoPosition)
            delete n.autoPosition;
        if (!n.noResize)
            delete n.noResize;
        if (!n.noMove)
            delete n.noMove;
        if (!n.locked)
            delete n.locked;
        if (n.w === 1 || n.w === n.minW)
            delete n.w;
        if (n.h === 1 || n.h === n.minH)
            delete n.h;
    }
    /** return the closest parent (or itself) matching the given class */
    static closestUpByClass(el, name) {
        while (el) {
            if (el.classList.contains(name))
                return el;
            el = el.parentElement;
        }
        return null;
    }
    /** delay calling the given function for given delay, preventing new calls from happening while waiting */
    static throttle(func, delay) {
        let isWaiting = false;
        return (...args) => {
            if (!isWaiting) {
                isWaiting = true;
                setTimeout(() => { func(...args); isWaiting = false; }, delay);
            }
        };
    }
    static removePositioningStyles(el) {
        let style = el.style;
        if (style.position) {
            style.removeProperty('position');
        }
        if (style.left) {
            style.removeProperty('left');
        }
        if (style.top) {
            style.removeProperty('top');
        }
        if (style.width) {
            style.removeProperty('width');
        }
        if (style.height) {
            style.removeProperty('height');
        }
    }
    /** @internal returns the passed element if scrollable, else the closest parent that will, up to the entire document scrolling element */
    static getScrollElement(el) {
        if (!el)
            return document.scrollingElement || document.documentElement; // IE support
        const style = getComputedStyle(el);
        const overflowRegex = /(auto|scroll)/;
        if (overflowRegex.test(style.overflow + style.overflowY)) {
            return el;
        }
        else {
            return this.getScrollElement(el.parentElement);
        }
    }
    /** @internal */
    static updateScrollPosition(el, position, distance) {
        // is widget in view?
        let rect = el.getBoundingClientRect();
        let innerHeightOrClientHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (rect.top < 0 ||
            rect.bottom > innerHeightOrClientHeight) {
            // set scrollTop of first parent that scrolls
            // if parent is larger than el, set as low as possible
            // to get entire widget on screen
            let offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            let offsetDiffUp = rect.top;
            let scrollEl = this.getScrollElement(el);
            if (scrollEl !== null) {
                let prevScroll = scrollEl.scrollTop;
                if (rect.top < 0 && distance < 0) {
                    // moving up
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                    }
                }
                else if (distance > 0) {
                    // moving down
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                    }
                }
                // move widget y by amount scrolled
                position.top += scrollEl.scrollTop - prevScroll;
            }
        }
    }
    /**
     * @internal Function used to scroll the page.
     *
     * @param event `MouseEvent` that triggers the resize
     * @param el `HTMLElement` that's being resized
     * @param distance Distance from the V edges to start scrolling
     */
    static updateScrollResize(event, el, distance) {
        const scrollEl = this.getScrollElement(el);
        const height = scrollEl.clientHeight;
        // #1727 event.clientY is relative to viewport, so must compare this against position of scrollEl getBoundingClientRect().top
        // #1745 Special situation if scrollEl is document 'html': here browser spec states that
        // clientHeight is height of viewport, but getBoundingClientRect() is rectangle of html element;
        // this discrepancy arises because in reality scrollbar is attached to viewport, not html element itself.
        const offsetTop = (scrollEl === this.getScrollElement()) ? 0 : scrollEl.getBoundingClientRect().top;
        const pointerPosY = event.clientY - offsetTop;
        const top = pointerPosY < distance;
        const bottom = pointerPosY > height - distance;
        if (top) {
            // This also can be done with a timeout to keep scrolling while the mouse is
            // in the scrolling zone. (will have smoother behavior)
            scrollEl.scrollBy({ behavior: 'smooth', top: pointerPosY - distance });
        }
        else if (bottom) {
            scrollEl.scrollBy({ behavior: 'smooth', top: distance - (height - pointerPosY) });
        }
    }
    /** single level clone, returning a new object with same top fields. This will share sub objects and arrays */
    static clone(obj) {
        if (obj === null || obj === undefined || typeof (obj) !== 'object') {
            return obj;
        }
        // return Object.assign({}, obj);
        if (obj instanceof Array) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return [...obj];
        }
        return Object.assign({}, obj);
    }
    /**
     * Recursive clone version that returns a full copy, checking for nested objects and arrays ONLY.
     * Note: this will use as-is any key starting with double __ (and not copy inside) some lib have circular dependencies.
     */
    static cloneDeep(obj) {
        // list of fields we will skip during cloneDeep (nested objects, other internal)
        const skipFields = ['parentGrid', 'el', 'grid', 'subGrid', 'engine'];
        // return JSON.parse(JSON.stringify(obj)); // doesn't work with date format ?
        const ret = Utils.clone(obj);
        for (const key in ret) {
            // NOTE: we don't support function/circular dependencies so skip those properties for now...
            if (ret.hasOwnProperty(key) && typeof (ret[key]) === 'object' && key.substring(0, 2) !== '__' && !skipFields.find(k => k === key)) {
                ret[key] = Utils.cloneDeep(obj[key]);
            }
        }
        return ret;
    }
    /** deep clone the given HTML node, removing teh unique id field */
    static cloneNode(el) {
        const node = el.cloneNode(true);
        node.removeAttribute('id');
        return node;
    }
    static appendTo(el, parent) {
        let parentNode;
        if (typeof parent === 'string') {
            parentNode = document.querySelector(parent);
        }
        else {
            parentNode = parent;
        }
        if (parentNode) {
            parentNode.appendChild(el);
        }
    }
    // public static setPositionRelative(el: HTMLElement): void {
    //   if (!(/^(?:r|a|f)/).test(window.getComputedStyle(el).position)) {
    //     el.style.position = "relative";
    //   }
    // }
    static addElStyles(el, styles) {
        if (styles instanceof Object) {
            for (const s in styles) {
                if (styles.hasOwnProperty(s)) {
                    if (Array.isArray(styles[s])) {
                        // support fallback value
                        styles[s].forEach(val => {
                            el.style[s] = val;
                        });
                    }
                    else {
                        el.style[s] = styles[s];
                    }
                }
            }
        }
    }
    static initEvent(e, info) {
        const evt = { type: info.type };
        const obj = {
            button: 0,
            which: 0,
            buttons: 1,
            bubbles: true,
            cancelable: true,
            target: info.target ? info.target : e.target
        };
        // don't check for `instanceof DragEvent` as Safari use MouseEvent #1540
        if (e.dataTransfer) {
            evt['dataTransfer'] = e.dataTransfer; // workaround 'readonly' field.
        }
        ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].forEach(p => evt[p] = e[p]); // keys
        ['pageX', 'pageY', 'clientX', 'clientY', 'screenX', 'screenY'].forEach(p => evt[p] = e[p]); // point info
        return Object.assign(Object.assign({}, evt), obj);
    }
    /** copies the MouseEvent properties and sends it as another event to the given target */
    static simulateMouseEvent(e, simulatedType, target) {
        const simulatedEvent = document.createEvent('MouseEvents');
        simulatedEvent.initMouseEvent(simulatedType, // type
        true, // bubbles
        true, // cancelable
        window, // view
        1, // detail
        e.screenX, // screenX
        e.screenY, // screenY
        e.clientX, // clientX
        e.clientY, // clientY
        e.ctrlKey, // ctrlKey
        e.altKey, // altKey
        e.shiftKey, // shiftKey
        e.metaKey, // metaKey
        0, // button
        e.target // relatedTarget
        );
        (target || e.target).dispatchEvent(simulatedEvent);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack-extra.min.css":
/*!*************************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack-extra.min.css ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack.min.css":
/*!*******************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack.min.css ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__("./assets/dashboard.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsdUZBQXVGO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsZUFBZSxvQkFBb0I7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsaURBQWlEO0FBQ2pGO0FBQ0E7QUFDQSxnQ0FBZ0MsNERBQTREO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0Esa0ZBQWtGO0FBQ2xGLG9HQUFvRztBQUNwRyw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixpQzs7Ozs7Ozs7Ozs7QUMvZ0JBOzs7Ozs7Ozs7Ozs7QUNBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2tpbWFpLy4vYXNzZXRzL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1iYXNlLWltcGwuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZGQtZHJhZ2dhYmxlLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLWRyb3BwYWJsZS5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1lbGVtZW50LmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLWdyaWRzdGFjay5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1tYW5hZ2VyLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLXJlc2l6YWJsZS1oYW5kbGUuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZGQtcmVzaXphYmxlLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLXRvdWNoLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2dyaWRzdGFjay1lbmdpbmUuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZ3JpZHN0YWNrLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L3R5cGVzLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L3V0aWxzLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2dyaWRzdGFjay1leHRyYS5taW4uY3NzP2NlODEiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZ3JpZHN0YWNrLm1pbi5jc3M/ZjA1YyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGh0dHBzOi8vZ3JpZHN0YWNranMuY29tXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ3JpZHN0YWNrL2dyaWRzdGFjay5qcy90cmVlL21hc3Rlci9kb2NcbiAqL1xucmVxdWlyZSgnZ3JpZHN0YWNrL2Rpc3QvZ3JpZHN0YWNrLm1pbi5jc3MnKTtcbnJlcXVpcmUoJ2dyaWRzdGFjay9kaXN0L2dyaWRzdGFjay1leHRyYS5taW4uY3NzJyk7XG5pbXBvcnQgeyBHcmlkU3RhY2sgfSBmcm9tICdncmlkc3RhY2snO1xuZ2xvYmFsLkdyaWRTdGFjayA9IEdyaWRTdGFjazsiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLWJhc2UtaW1wbC50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjAyMiBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5EREJhc2VJbXBsZW1lbnQgPSB2b2lkIDA7XHJcbmNsYXNzIEREQmFzZUltcGxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvKiogQGludGVybmFsICovXHJcbiAgICAgICAgdGhpcy5fZXZlbnRSZWdpc3RlciA9IHt9O1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybnMgdGhlIGVuYWJsZSBzdGF0ZSwgYnV0IHlvdSBoYXZlIHRvIGNhbGwgZW5hYmxlKCkvZGlzYWJsZSgpIHRvIGNoYW5nZSAoYXMgb3RoZXIgdGhpbmdzIG5lZWQgdG8gaGFwcGVuKSAqL1xyXG4gICAgZ2V0IGRpc2FibGVkKCkgeyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cclxuICAgIG9uKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50UmVnaXN0ZXJbZXZlbnRdID0gY2FsbGJhY2s7XHJcbiAgICB9XHJcbiAgICBvZmYoZXZlbnQpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRSZWdpc3RlcltldmVudF07XHJcbiAgICB9XHJcbiAgICBlbmFibGUoKSB7XHJcbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGRpc2FibGUoKSB7XHJcbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRSZWdpc3RlcjtcclxuICAgIH1cclxuICAgIHRyaWdnZXJFdmVudChldmVudE5hbWUsIGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkICYmIHRoaXMuX2V2ZW50UmVnaXN0ZXIgJiYgdGhpcy5fZXZlbnRSZWdpc3RlcltldmVudE5hbWVdKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRSZWdpc3RlcltldmVudE5hbWVdKGV2ZW50KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkREQmFzZUltcGxlbWVudCA9IEREQmFzZUltcGxlbWVudDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtYmFzZS1pbXBsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogZGQtZHJhZ2dhYmxlLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMS0yMDIyIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRERHJhZ2dhYmxlID0gdm9pZCAwO1xyXG5jb25zdCBkZF9tYW5hZ2VyXzEgPSByZXF1aXJlKFwiLi9kZC1tYW5hZ2VyXCIpO1xyXG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IGRkX2Jhc2VfaW1wbF8xID0gcmVxdWlyZShcIi4vZGQtYmFzZS1pbXBsXCIpO1xyXG5jb25zdCBkZF90b3VjaF8xID0gcmVxdWlyZShcIi4vZGQtdG91Y2hcIik7XHJcbi8vIGxldCBjb3VudCA9IDA7IC8vIFRFU1RcclxuY2xhc3MgREREcmFnZ2FibGUgZXh0ZW5kcyBkZF9iYXNlX2ltcGxfMS5EREJhc2VJbXBsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdGlvbiA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgLy8gZ2V0IHRoZSBlbGVtZW50IHRoYXQgaXMgYWN0dWFsbHkgc3VwcG9zZWQgdG8gYmUgZHJhZ2dlZCBieVxyXG4gICAgICAgIGxldCBoYW5kbGVOYW1lID0gb3B0aW9uLmhhbmRsZS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgdGhpcy5kcmFnRWwgPSBlbC5jbGFzc0xpc3QuY29udGFpbnMoaGFuZGxlTmFtZSkgPyBlbCA6IGVsLnF1ZXJ5U2VsZWN0b3Iob3B0aW9uLmhhbmRsZSkgfHwgZWw7XHJcbiAgICAgICAgLy8gY3JlYXRlIHZhciBldmVudCBiaW5kaW5nIHNvIHdlIGNhbiBlYXNpbHkgcmVtb3ZlIGFuZCBzdGlsbCBsb29rIGxpa2UgVFMgbWV0aG9kcyAodW5saWtlIGFub255bW91cyBmdW5jdGlvbnMpXHJcbiAgICAgICAgdGhpcy5fbW91c2VEb3duID0gdGhpcy5fbW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VNb3ZlID0gdGhpcy5fbW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VVcCA9IHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgfVxyXG4gICAgb24oZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgc3VwZXIub24oZXZlbnQsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIG9mZihldmVudCkge1xyXG4gICAgICAgIHN1cGVyLm9mZihldmVudCk7XHJcbiAgICB9XHJcbiAgICBlbmFibGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgc3VwZXIuZW5hYmxlKCk7XHJcbiAgICAgICAgdGhpcy5kcmFnRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2VEb3duKTtcclxuICAgICAgICBpZiAoZGRfdG91Y2hfMS5pc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkZF90b3VjaF8xLnRvdWNoc3RhcnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGRkX3RvdWNoXzEucG9pbnRlcmRvd24pO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYWdFbC5zdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJzsgLy8gbm90IG5lZWRlZCB1bmxpa2UgcG9pbnRlcmRvd24gZG9jIGNvbW1lbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1kcmFnZ2FibGUtZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLWRyYWdnYWJsZScpO1xyXG4gICAgfVxyXG4gICAgZGlzYWJsZShmb3JEZXN0cm95ID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHN1cGVyLmRpc2FibGUoKTtcclxuICAgICAgICB0aGlzLmRyYWdFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZURvd24pO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRkX3RvdWNoXzEudG91Y2hzdGFydCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZGRfdG91Y2hfMS5wb2ludGVyZG93bik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJhZ2dhYmxlJyk7XHJcbiAgICAgICAgaWYgKCFmb3JEZXN0cm95KVxyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLWRyYWdnYWJsZS1kaXNhYmxlZCcpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnVGltZW91dClcclxuICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLmRyYWdUaW1lb3V0KTtcclxuICAgICAgICBkZWxldGUgdGhpcy5kcmFnVGltZW91dDtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICAgICAgdGhpcy5fbW91c2VVcCh0aGlzLm1vdXNlRG93bkV2ZW50KTtcclxuICAgICAgICB0aGlzLmRpc2FibGUodHJ1ZSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZWw7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuaGVscGVyO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbjtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVPcHRpb24ob3B0cykge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKG9wdHMpLmZvckVhY2goa2V5ID0+IHRoaXMub3B0aW9uW2tleV0gPSBvcHRzW2tleV0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsIHdoZW4gbW91c2UgZ29lcyBkb3duIGJlZm9yZSBhIGRyYWdzdGFydCBoYXBwZW5zICovXHJcbiAgICBfbW91c2VEb3duKGUpIHtcclxuICAgICAgICAvLyBkb24ndCBsZXQgbW9yZSB0aGFuIG9uZSB3aWRnZXQgaGFuZGxlIG1vdXNlU3RhcnRcclxuICAgICAgICBpZiAoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5tb3VzZUhhbmRsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoZS5idXR0b24gIT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBvbmx5IGxlZnQgY2xpY2tcclxuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgYXJlIG5vdCBjbGlja2luZyBvbiBrbm93biBvYmplY3QgdGhhdCBoYW5kbGVzIG1vdXNlRG93biAoVE9ETzogbWFrZSB0aGlzIGV4dGVuc2libGUgPykgIzIwNTRcclxuICAgICAgICBjb25zdCBza2lwTW91c2VEb3duID0gWydpbnB1dCcsICd0ZXh0YXJlYScsICdidXR0b24nLCAnc2VsZWN0JywgJ29wdGlvbiddO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChza2lwTW91c2VEb3duLmZpbmQoc2tpcCA9PiBza2lwID09PSBuYW1lKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgLy8gYWxzbyBjaGVjayBmb3IgY29udGVudCBlZGl0YWJsZVxyXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAvLyBSRU1PVkU6IHdoeSB3b3VsZCB3ZSBnZXQgdGhlIGV2ZW50IGlmIGl0IHdhc24ndCBmb3IgdXMgb3IgY2hpbGQgP1xyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgY2xpY2tpbmcgb24gYSBkcmFnIGhhbmRsZSBvciBjaGlsZCBvZiBpdC4uLlxyXG4gICAgICAgIC8vIE5vdGU6IHdlIGRvbid0IG5lZWQgdG8gY2hlY2sgdGhhdCdzIGhhbmRsZSBpcyBhbiBpbW1lZGlhdGUgY2hpbGQsIGFzIG1vdXNlSGFuZGxlZCB3aWxsIHByZXZlbnQgcGFyZW50cyBmcm9tIGFsc28gaGFuZGxpbmcgaXQgKGxvd2VzdCB3aW5zKVxyXG4gICAgICAgIC8vIGxldCBjbGFzc05hbWUgPSB0aGlzLm9wdGlvbi5oYW5kbGUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIC8vIGxldCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIC8vIHdoaWxlIChlbCAmJiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHsgZWwgPSBlbC5wYXJlbnRFbGVtZW50OyB9XHJcbiAgICAgICAgLy8gaWYgKCFlbCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMubW91c2VEb3duRXZlbnQgPSBlO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50O1xyXG4gICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50O1xyXG4gICAgICAgIC8vIGRvY3VtZW50IGhhbmRsZXIgc28gd2UgY2FuIGNvbnRpbnVlIHJlY2VpdmluZyBtb3ZlcyBhcyB0aGUgaXRlbSBpcyAnZml4ZWQnIHBvc2l0aW9uLCBhbmQgY2FwdHVyZT10cnVlIHNvIFdFIGdldCBhIGZpcnN0IGNyYWNrXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLCB0cnVlKTsgLy8gdHJ1ZT1jYXB0dXJlLCBub3QgYnViYmxlXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAsIHRydWUpO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGRfdG91Y2hfMS50b3VjaG1vdmUpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGRkX3RvdWNoXzEudG91Y2hlbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgLy8gcHJldmVudERlZmF1bHQoKSBwcmV2ZW50cyBibHVyIGV2ZW50IHdoaWNoIG9jY3VycyBqdXN0IGFmdGVyIG1vdXNlZG93biBldmVudC5cclxuICAgICAgICAvLyBpZiBhbiBlZGl0YWJsZSBjb250ZW50IGhhcyBmb2N1cywgdGhlbiBibHVyIG11c3QgYmUgY2FsbFxyXG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxyXG4gICAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcclxuICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm1vdXNlSGFuZGxlZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIG1ldGhvZCB0byBjYWxsIGFjdHVhbCBkcmFnIGV2ZW50ICovXHJcbiAgICBfY2FsbERyYWcoZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5kcmFnZ2luZylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZSwgeyB0YXJnZXQ6IHRoaXMuZWwsIHR5cGU6ICdkcmFnJyB9KTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb24uZHJhZykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbi5kcmFnKGV2LCB0aGlzLnVpKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnZHJhZycsIGV2KTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHdoZW4gdGhlIG1haW4gcGFnZSAoYWZ0ZXIgc3VjY2Vzc2Z1bCBtb3VzZWRvd24pIHJlY2VpdmVzIGEgbW92ZSBldmVudCB0byBkcmFnIHRoZSBpdGVtIGFyb3VuZCB0aGUgc2NyZWVuICovXHJcbiAgICBfbW91c2VNb3ZlKGUpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gbW92ZSAke2UueH0sJHtlLnl9YClcclxuICAgICAgICBsZXQgcyA9IHRoaXMubW91c2VEb3duRXZlbnQ7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZHJhZ0ZvbGxvdyhlKTtcclxuICAgICAgICAgICAgLy8gZGVsYXkgYWN0dWFsIGdyaWQgaGFuZGxpbmcgZHJhZyB1bnRpbCB3ZSBwYXVzZSBmb3IgYSB3aGlsZSBpZiBzZXRcclxuICAgICAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIucGF1c2VEcmFnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXVzZSA9IE51bWJlci5pc0ludGVnZXIoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcpID8gZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcgOiAxMDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnVGltZW91dClcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuZHJhZ1RpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuX2NhbGxEcmFnKGUpLCBwYXVzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxsRHJhZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChNYXRoLmFicyhlLnggLSBzLngpICsgTWF0aC5hYnMoZS55IC0gcy55KSA+IDMpIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIGRvbid0IHN0YXJ0IHVubGVzcyB3ZSd2ZSBtb3ZlZCBhdCBsZWFzdCAzIHBpeGVsc1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQgPSB0aGlzO1xyXG4gICAgICAgICAgICAvLyBpZiB3ZSdyZSBkcmFnZ2luZyBhbiBhY3R1YWwgZ3JpZCBpdGVtLCBzZXQgdGhlIGN1cnJlbnQgZHJvcCBhcyB0aGUgZ3JpZCAodG8gZGV0ZWN0IGVudGVyL2xlYXZlKVxyXG4gICAgICAgICAgICBsZXQgZ3JpZCA9IChfYSA9IHRoaXMuZWwuZ3JpZHN0YWNrTm9kZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdyaWQ7XHJcbiAgICAgICAgICAgIGlmIChncmlkKSB7XHJcbiAgICAgICAgICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50ID0gZ3JpZC5lbC5kZEVsZW1lbnQuZGREcm9wcGFibGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmhlbHBlciA9IHRoaXMuX2NyZWF0ZUhlbHBlcihlKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0dXBIZWxwZXJDb250YWlubWVudFN0eWxlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ09mZnNldCA9IHRoaXMuX2dldERyYWdPZmZzZXQoZSwgdGhpcy5lbCwgdGhpcy5oZWxwZXJDb250YWlubWVudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZSwgeyB0YXJnZXQ6IHRoaXMuZWwsIHR5cGU6ICdkcmFnc3RhcnQnIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXR1cEhlbHBlclN0eWxlKGUpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb24uc3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uLnN0YXJ0KGV2LCB0aGlzLnVpKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcmFnc3RhcnQnLCBldik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gbmVlZGVkIG90aGVyd2lzZSB3ZSBnZXQgdGV4dCBzd2VlcCB0ZXh0IHNlbGVjdGlvbiBhcyB3ZSBkcmFnIGFyb3VuZFxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsIHdoZW4gdGhlIG1vdXNlIGdldHMgcmVsZWFzZWQgdG8gZHJvcCB0aGUgaXRlbSBhdCBjdXJyZW50IGxvY2F0aW9uICovXHJcbiAgICBfbW91c2VVcChlKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlTW92ZSwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAsIHRydWUpO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGRfdG91Y2hfMS50b3VjaG1vdmUsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGRkX3RvdWNoXzEudG91Y2hlbmQsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kcmFnZ2luZztcclxuICAgICAgICAgICAgLy8gcmVzZXQgdGhlIGRyb3AgdGFyZ2V0IGlmIGRyYWdnaW5nIG92ZXIgb3Vyc2VsZiAoYWxyZWFkeSBwYXJlbnRlZCwganVzdCBtb3ZpbmcgZHVyaW5nIHN0b3AgY2FsbGJhY2sgYmVsb3cpXHJcbiAgICAgICAgICAgIGlmICgoKF9hID0gZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmVsKSA9PT0gdGhpcy5lbC5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmhlbHBlckNvbnRhaW5tZW50LnN0eWxlLnBvc2l0aW9uID0gdGhpcy5wYXJlbnRPcmlnaW5TdHlsZVBvc2l0aW9uIHx8IG51bGw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhlbHBlciA9PT0gdGhpcy5lbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSGVscGVyU3R5bGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVscGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZSwgeyB0YXJnZXQ6IHRoaXMuZWwsIHR5cGU6ICdkcmFnc3RvcCcgfSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbi5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbi5zdG9wKGV2KTsgLy8gTk9URTogZGVzdHJveSgpIHdpbGwgYmUgY2FsbGVkIHdoZW4gcmVtb3ZpbmcgaXRlbSwgc28gZXhwZWN0IE5VTEwgcHRyIGFmdGVyIVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcmFnc3RvcCcsIGV2KTtcclxuICAgICAgICAgICAgLy8gY2FsbCB0aGUgZHJvcHBhYmxlIG1ldGhvZCB0byByZWNlaXZlIHRoZSBpdGVtXHJcbiAgICAgICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50LmRyb3AoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuaGVscGVyO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm1vdXNlRG93bkV2ZW50O1xyXG4gICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50O1xyXG4gICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50O1xyXG4gICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm1vdXNlSGFuZGxlZDtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNyZWF0ZSBhIGNsb25lIGNvcHkgKG9yIHVzZXIgZGVmaW5lZCBtZXRob2QpIG9mIHRoZSBvcmlnaW5hbCBkcmFnIGl0ZW0gaWYgc2V0ICovXHJcbiAgICBfY3JlYXRlSGVscGVyKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGhlbHBlciA9IHRoaXMuZWw7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbi5oZWxwZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaGVscGVyID0gdGhpcy5vcHRpb24uaGVscGVyKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb24uaGVscGVyID09PSAnY2xvbmUnKSB7XHJcbiAgICAgICAgICAgIGhlbHBlciA9IHV0aWxzXzEuVXRpbHMuY2xvbmVOb2RlKHRoaXMuZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoaGVscGVyKSkge1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFwcGVuZFRvKGhlbHBlciwgdGhpcy5vcHRpb24uYXBwZW5kVG8gPT09ICdwYXJlbnQnID8gdGhpcy5lbC5wYXJlbnROb2RlIDogdGhpcy5vcHRpb24uYXBwZW5kVG8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGVscGVyID09PSB0aGlzLmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsZW1lbnRPcmlnaW5TdHlsZSA9IERERHJhZ2dhYmxlLm9yaWdpblN0eWxlUHJvcC5tYXAocHJvcCA9PiB0aGlzLmVsLnN0eWxlW3Byb3BdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhlbHBlcjtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgc2V0IHRoZSBmaXggcG9zaXRpb24gb2YgdGhlIGRyYWdnZWQgaXRlbSAqL1xyXG4gICAgX3NldHVwSGVscGVyU3R5bGUoZSkge1xyXG4gICAgICAgIHRoaXMuaGVscGVyLmNsYXNzTGlzdC5hZGQoJ3VpLWRyYWdnYWJsZS1kcmFnZ2luZycpO1xyXG4gICAgICAgIC8vIFRPRE86IHNldCBhbGwgYXQgb25jZSB3aXRoIHN0eWxlLmNzc1RleHQgKz0gLi4uID8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzk2ODU5M1xyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gdGhpcy5oZWxwZXIuc3R5bGU7XHJcbiAgICAgICAgc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJzsgLy8gbmVlZGVkIGZvciBvdmVyIGl0ZW1zIHRvIGdldCBlbnRlci9sZWF2ZVxyXG4gICAgICAgIC8vIHN0eWxlLmN1cnNvciA9ICdtb3ZlJzsgLy8gIFRPRE86IGNhbid0IHNldCB3aXRoIHBvaW50ZXJFdmVudHM9bm9uZSAhIChkb25lIGluIENTUyBhcyB3ZWxsKVxyXG4gICAgICAgIHN0eWxlWydtaW4td2lkdGgnXSA9IDA7IC8vIHNpbmNlIHdlIG5vIGxvbmdlciByZWxhdGl2ZSB0byBvdXIgcGFyZW50IGFuZCB3ZSBkb24ndCByZXNpemUgYW55d2F5IChub3JtYWxseSAxMDAvI2NvbHVtbiAlKVxyXG4gICAgICAgIHN0eWxlLndpZHRoID0gdGhpcy5kcmFnT2Zmc2V0LndpZHRoICsgJ3B4JztcclxuICAgICAgICBzdHlsZS5oZWlnaHQgPSB0aGlzLmRyYWdPZmZzZXQuaGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICBzdHlsZS53aWxsQ2hhbmdlID0gJ2xlZnQsIHRvcCc7XHJcbiAgICAgICAgc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnOyAvLyBsZXQgdXMgZHJhZyBiZXR3ZWVuIGdyaWRzIGJ5IG5vdCBjbGlwcGluZyBhcyBwYXJlbnQgLmdyaWQtc3RhY2sgaXMgcG9zaXRpb246ICdyZWxhdGl2ZSdcclxuICAgICAgICB0aGlzLl9kcmFnRm9sbG93KGUpOyAvLyBub3cgcG9zaXRpb24gaXRcclxuICAgICAgICBzdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnOyAvLyBzaG93IHVwIGluc3RhbnRseVxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oZWxwZXIpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlLnRyYW5zaXRpb24gPSBudWxsOyAvLyByZWNvdmVyIGFuaW1hdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHJlc3RvcmUgYmFjayB0aGUgb3JpZ2luYWwgc3R5bGUgYmVmb3JlIGRyYWdnaW5nICovXHJcbiAgICBfcmVtb3ZlSGVscGVyU3R5bGUoKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHRoaXMuaGVscGVyLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLWRyYWdnYWJsZS1kcmFnZ2luZycpO1xyXG4gICAgICAgIGxldCBub2RlID0gKF9hID0gdGhpcy5oZWxwZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgIC8vIGRvbid0IGJvdGhlciByZXN0b3Jpbmcgc3R5bGVzIGlmIHdlJ3JlIGdvbm5hIHJlbW92ZSBhbnl3YXkuLi5cclxuICAgICAgICBpZiAoIShub2RlID09PSBudWxsIHx8IG5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGUuX2lzQWJvdXRUb1JlbW92ZSkgJiYgdGhpcy5kcmFnRWxlbWVudE9yaWdpblN0eWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWxwZXIgPSB0aGlzLmhlbHBlcjtcclxuICAgICAgICAgICAgLy8gZG9uJ3QgYW5pbWF0ZSwgb3RoZXJ3aXNlIHdlIGFuaW1hdGUgb2Zmc2V0ZWQgd2hlbiBzd2l0Y2hpbmcgYmFjayB0byAnYWJzb2x1dGUnIGZyb20gJ2ZpeGVkJy5cclxuICAgICAgICAgICAgLy8gVE9ETzogdGhpcyBhbHNvIHJlbW92ZXMgcmVzaXppbmcgYW5pbWF0aW9uIHdoaWNoIGRvZXNuJ3QgaGF2ZSB0aGlzIGlzc3VlLCBidXQgb3RoZXJzLlxyXG4gICAgICAgICAgICAvLyBJZGVhbGx5IGJvdGggd291bGQgYW5pbWF0ZSAoJ21vdmUnIHdvdWxkIGltbWVkaWF0ZWx5IHJlc3RvcmUgJ2Fic29sdXRlJyBhbmQgYWRqdXN0IGNvb3JkaW5hdGUgdG8gbWF0Y2gsXHJcbiAgICAgICAgICAgIC8vIHRoZW4gdHJpZ2dlciBhIGRlbGF5IChyZXBhaW50KSB0byByZXN0b3JlIHRvIGZpbmFsIGRlc3Qgd2l0aCBhbmltYXRlKSBidXQgdGhlbiB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSAncmVzaXplc3RvcCdcclxuICAgICAgICAgICAgLy8gaXMgY2FsbGVkIEFGVEVSICd0cmFuc2l0aW9uZW5kJyBldmVudCBpcyByZWNlaXZlZCAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzL2lzc3Vlcy8yMDMzKVxyXG4gICAgICAgICAgICBsZXQgdHJhbnNpdGlvbiA9IHRoaXMuZHJhZ0VsZW1lbnRPcmlnaW5TdHlsZVsndHJhbnNpdGlvbiddIHx8IG51bGw7XHJcbiAgICAgICAgICAgIGhlbHBlci5zdHlsZS50cmFuc2l0aW9uID0gdGhpcy5kcmFnRWxlbWVudE9yaWdpblN0eWxlWyd0cmFuc2l0aW9uJ10gPSAnbm9uZSc7IC8vIGNhbid0IGJlIE5VTEwgIzE5NzNcclxuICAgICAgICAgICAgREREcmFnZ2FibGUub3JpZ2luU3R5bGVQcm9wLmZvckVhY2gocHJvcCA9PiBoZWxwZXIuc3R5bGVbcHJvcF0gPSB0aGlzLmRyYWdFbGVtZW50T3JpZ2luU3R5bGVbcHJvcF0gfHwgbnVsbCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gaGVscGVyLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uLCA1MCk7IC8vIHJlY292ZXIgYW5pbWF0aW9uIGZyb20gc2F2ZWQgdmFycyBhZnRlciBhIHBhdXNlICgwIGlzbid0IGVub3VnaCAjMTk3MylcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZHJhZ0VsZW1lbnRPcmlnaW5TdHlsZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgdXBkYXRlcyB0aGUgdG9wL2xlZnQgcG9zaXRpb24gdG8gZm9sbG93IHRoZSBtb3VzZSAqL1xyXG4gICAgX2RyYWdGb2xsb3coZSkge1xyXG4gICAgICAgIGxldCBjb250YWlubWVudFJlY3QgPSB7IGxlZnQ6IDAsIHRvcDogMCB9O1xyXG4gICAgICAgIC8vIGlmICh0aGlzLmhlbHBlci5zdHlsZS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJykgeyAvLyB3ZSB1c2UgJ2ZpeGVkJ1xyXG4gICAgICAgIC8vICAgY29uc3QgeyBsZWZ0LCB0b3AgfSA9IHRoaXMuaGVscGVyQ29udGFpbm1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgLy8gICBjb250YWlubWVudFJlY3QgPSB7IGxlZnQsIHRvcCB9O1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBjb25zdCBzdHlsZSA9IHRoaXMuaGVscGVyLnN0eWxlO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuZHJhZ09mZnNldDtcclxuICAgICAgICBzdHlsZS5sZWZ0ID0gZS5jbGllbnRYICsgb2Zmc2V0Lm9mZnNldExlZnQgLSBjb250YWlubWVudFJlY3QubGVmdCArICdweCc7XHJcbiAgICAgICAgc3R5bGUudG9wID0gZS5jbGllbnRZICsgb2Zmc2V0Lm9mZnNldFRvcCAtIGNvbnRhaW5tZW50UmVjdC50b3AgKyAncHgnO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3NldHVwSGVscGVyQ29udGFpbm1lbnRTdHlsZSgpIHtcclxuICAgICAgICB0aGlzLmhlbHBlckNvbnRhaW5tZW50ID0gdGhpcy5oZWxwZXIucGFyZW50RWxlbWVudDtcclxuICAgICAgICBpZiAodGhpcy5oZWxwZXIuc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnRPcmlnaW5TdHlsZVBvc2l0aW9uID0gdGhpcy5oZWxwZXJDb250YWlubWVudC5zdHlsZS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuaGVscGVyQ29udGFpbm1lbnQpLnBvc2l0aW9uLm1hdGNoKC9zdGF0aWMvKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWxwZXJDb250YWlubWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfZ2V0RHJhZ09mZnNldChldmVudCwgZWwsIHBhcmVudCkge1xyXG4gICAgICAgIC8vIGluIGNhc2UgYW5jZXN0b3IgaGFzIHRyYW5zZm9ybS9wZXJzcGVjdGl2ZSBjc3MgcHJvcGVydGllcyB0aGF0IGNoYW5nZSB0aGUgdmlld3BvaW50XHJcbiAgICAgICAgbGV0IHhmb3JtT2Zmc2V0WCA9IDA7XHJcbiAgICAgICAgbGV0IHhmb3JtT2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRFbFN0eWxlcyh0ZXN0RWwsIHtcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAwICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IDAgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMXB4JyxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogJy05OTk5OTknLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRlc3RFbCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3RFbFBvc2l0aW9uID0gdGVzdEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodGVzdEVsKTtcclxuICAgICAgICAgICAgeGZvcm1PZmZzZXRYID0gdGVzdEVsUG9zaXRpb24ubGVmdDtcclxuICAgICAgICAgICAgeGZvcm1PZmZzZXRZID0gdGVzdEVsUG9zaXRpb24udG9wO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzY2FsZSA/XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRhcmdldE9mZnNldCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxlZnQ6IHRhcmdldE9mZnNldC5sZWZ0LFxyXG4gICAgICAgICAgICB0b3A6IHRhcmdldE9mZnNldC50b3AsXHJcbiAgICAgICAgICAgIG9mZnNldExlZnQ6IC1ldmVudC5jbGllbnRYICsgdGFyZ2V0T2Zmc2V0LmxlZnQgLSB4Zm9ybU9mZnNldFgsXHJcbiAgICAgICAgICAgIG9mZnNldFRvcDogLWV2ZW50LmNsaWVudFkgKyB0YXJnZXRPZmZzZXQudG9wIC0geGZvcm1PZmZzZXRZLFxyXG4gICAgICAgICAgICB3aWR0aDogdGFyZ2V0T2Zmc2V0LndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRhcmdldE9mZnNldC5oZWlnaHRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBUT0RPOiBzZXQgdG8gcHVibGljIGFzIGNhbGxlZCBieSBERERyb3BwYWJsZSEgKi9cclxuICAgIHVpKCkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5tZW50RWwgPSB0aGlzLmVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgY29udGFpbm1lbnRSZWN0ID0gY29udGFpbm1lbnRFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmhlbHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wIC0gY29udGFpbm1lbnRSZWN0LnRvcCxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0IC0gY29udGFpbm1lbnRSZWN0LmxlZnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBub3QgdXNlZCBieSBHcmlkU3RhY2sgZm9yIG5vdy4uLlxyXG4gICAgICAgICAgICBoZWxwZXI6IFt0aGlzLmhlbHBlcl0sIC8vVGhlIG9iamVjdCBhcnIgcmVwcmVzZW50aW5nIHRoZSBoZWxwZXIgdGhhdCdzIGJlaW5nIGRyYWdnZWQuXHJcbiAgICAgICAgICAgIG9mZnNldDogeyB0b3A6IG9mZnNldC50b3AsIGxlZnQ6IG9mZnNldC5sZWZ0IH0gLy8gQ3VycmVudCBvZmZzZXQgcG9zaXRpb24gb2YgdGhlIGhlbHBlciBhcyB7IHRvcCwgbGVmdCB9IG9iamVjdC5cclxuICAgICAgICAgICAgKi9cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuREREcmFnZ2FibGUgPSBERERyYWdnYWJsZTtcclxuLyoqIEBpbnRlcm5hbCBwcm9wZXJ0aWVzIHdlIGNoYW5nZSBkdXJpbmcgZHJhZ2dpbmcsIGFuZCByZXN0b3JlIGJhY2sgKi9cclxuREREcmFnZ2FibGUub3JpZ2luU3R5bGVQcm9wID0gWyd0cmFuc2l0aW9uJywgJ3BvaW50ZXJFdmVudHMnLCAncG9zaXRpb24nLCAnbGVmdCcsICd0b3AnLCAnbWluV2lkdGgnLCAnd2lsbENoYW5nZSddO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZC1kcmFnZ2FibGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1kcm9wcGFibGUudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxLTIwMjIgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuREREcm9wcGFibGUgPSB2b2lkIDA7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbmNvbnN0IGRkX2Jhc2VfaW1wbF8xID0gcmVxdWlyZShcIi4vZGQtYmFzZS1pbXBsXCIpO1xyXG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IGRkX3RvdWNoXzEgPSByZXF1aXJlKFwiLi9kZC10b3VjaFwiKTtcclxuLy8gbGV0IGNvdW50ID0gMDsgLy8gVEVTVFxyXG5jbGFzcyBERERyb3BwYWJsZSBleHRlbmRzIGRkX2Jhc2VfaW1wbF8xLkREQmFzZUltcGxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0cyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRzO1xyXG4gICAgICAgIC8vIGNyZWF0ZSB2YXIgZXZlbnQgYmluZGluZyBzbyB3ZSBjYW4gZWFzaWx5IHJlbW92ZSBhbmQgc3RpbGwgbG9vayBsaWtlIFRTIG1ldGhvZHMgKHVubGlrZSBhbm9ueW1vdXMgZnVuY3Rpb25zKVxyXG4gICAgICAgIHRoaXMuX21vdXNlRW50ZXIgPSB0aGlzLl9tb3VzZUVudGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VMZWF2ZSA9IHRoaXMuX21vdXNlTGVhdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQWNjZXB0KCk7XHJcbiAgICB9XHJcbiAgICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBzdXBlci5vbihldmVudCwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgb2ZmKGV2ZW50KSB7XHJcbiAgICAgICAgc3VwZXIub2ZmKGV2ZW50KTtcclxuICAgIH1cclxuICAgIGVuYWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBzdXBlci5lbmFibGUoKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLWRyb3BwYWJsZScpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJvcHBhYmxlLWRpc2FibGVkJyk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fbW91c2VFbnRlcik7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fbW91c2VMZWF2ZSk7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJlbnRlcicsIGRkX3RvdWNoXzEucG9pbnRlcmVudGVyKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybGVhdmUnLCBkZF90b3VjaF8xLnBvaW50ZXJsZWF2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGlzYWJsZShmb3JEZXN0cm95ID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHN1cGVyLmRpc2FibGUoKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLWRyb3BwYWJsZScpO1xyXG4gICAgICAgIGlmICghZm9yRGVzdHJveSlcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1kcm9wcGFibGUtZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9tb3VzZUVudGVyKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9tb3VzZUxlYXZlKTtcclxuICAgICAgICBpZiAoZGRfdG91Y2hfMS5pc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmVudGVyJywgZGRfdG91Y2hfMS5wb2ludGVyZW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJsZWF2ZScsIGRkX3RvdWNoXzEucG9pbnRlcmxlYXZlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZSh0cnVlKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLWRyb3BwYWJsZScpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJvcHBhYmxlLWRpc2FibGVkJyk7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlT3B0aW9uKG9wdHMpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhvcHRzKS5mb3JFYWNoKGtleSA9PiB0aGlzLm9wdGlvbltrZXldID0gb3B0c1trZXldKTtcclxuICAgICAgICB0aGlzLl9zZXR1cEFjY2VwdCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgd2hlbiB0aGUgY3Vyc29yIGVudGVycyBvdXIgYXJlYSAtIHByZXBhcmUgZm9yIGEgcG9zc2libGUgZHJvcCBhbmQgdHJhY2sgbGVhdmluZyAqL1xyXG4gICAgX21vdXNlRW50ZXIoZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGAke2NvdW50Kyt9IEVudGVyICR7dGhpcy5lbC5pZCB8fCAodGhpcy5lbCBhcyBHcmlkSFRNTEVsZW1lbnQpLmdyaWRzdGFjay5vcHRzLmlkfWApOyAvLyBURVNUXHJcbiAgICAgICAgaWYgKCFkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jYW5Ecm9wKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQuZWwpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdoZW4gd2UgZW50ZXIgdGhpcywgdGhhdCB0aGUgbGFzdCBvbmUgZ2V0cyBhIGxlYXZlIEZJUlNUIHRvIGNvcnJlY3RseSBjbGVhbnVwIGFzIHdlIGRvbid0IGFsd2F5cyBkb1xyXG4gICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50ICYmIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQgIT09IHRoaXMpIHtcclxuICAgICAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudC5fbW91c2VMZWF2ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudCA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2Ryb3BvdmVyJyB9KTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb24ub3Zlcikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbi5vdmVyKGV2LCB0aGlzLl91aShkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcm9wb3ZlcicsIGV2KTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLWRyb3BwYWJsZS1vdmVyJyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3RyYWNraW5nJyk7IC8vIFRFU1RcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHdoZW4gdGhlIGl0ZW0gaXMgbGVhdmluZyBvdXIgYXJlYSwgc3RvcCB0cmFja2luZyBpZiB3ZSBoYWQgbW92aW5nIGl0ZW0gKi9cclxuICAgIF9tb3VzZUxlYXZlKGUpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gTGVhdmUgJHt0aGlzLmVsLmlkIHx8ICh0aGlzLmVsIGFzIEdyaWRIVE1MRWxlbWVudCkuZ3JpZHN0YWNrLm9wdHMuaWR9YCk7IC8vIFRFU1RcclxuICAgICAgICBpZiAoIWRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQgfHwgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudCAhPT0gdGhpcylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZSwgeyB0YXJnZXQ6IHRoaXMuZWwsIHR5cGU6ICdkcm9wb3V0JyB9KTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb24ub3V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLm91dChldiwgdGhpcy5fdWkoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnZHJvcG91dCcsIGV2KTtcclxuICAgICAgICBpZiAoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudCA9PT0gdGhpcykge1xyXG4gICAgICAgICAgICBkZWxldGUgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudDtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ25vdCB0cmFja2luZycpOyAvLyBURVNUXHJcbiAgICAgICAgICAgIC8vIGlmIHdlJ3JlIHN0aWxsIG92ZXIgYSBwYXJlbnQgZHJvcHBhYmxlLCBzZW5kIGl0IGFuIGVudGVyIGFzIHdlIGRvbid0IGdldCBvbmUgZnJvbSBsZWF2aW5nIG5lc3RlZCBjaGlsZHJlblxyXG4gICAgICAgICAgICBsZXQgcGFyZW50RHJvcDtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuZWwucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgd2hpbGUgKCFwYXJlbnREcm9wICYmIHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RHJvcCA9IChfYSA9IHBhcmVudC5kZEVsZW1lbnQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5kZERyb3BwYWJsZTtcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnREcm9wKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnREcm9wLl9tb3VzZUVudGVyKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIGl0ZW0gaXMgYmVpbmcgZHJvcHBlZCBvbiB1cyAtIGNhbGxlZCBieSB0aGUgZHJhZyBtb3VzZXVwIGhhbmRsZXIgLSB0aGlzIGNhbGxzIHRoZSBjbGllbnQgZHJvcCBldmVudCAqL1xyXG4gICAgZHJvcChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZSwgeyB0YXJnZXQ6IHRoaXMuZWwsIHR5cGU6ICdkcm9wJyB9KTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb24uZHJvcCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbi5kcm9wKGV2LCB0aGlzLl91aShkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcm9wJywgZXYpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCB0cnVlIGlmIGVsZW1lbnQgbWF0Y2hlcyB0aGUgc3RyaW5nL21ldGhvZCBhY2NlcHQgb3B0aW9uICovXHJcbiAgICBfY2FuRHJvcChlbCkge1xyXG4gICAgICAgIHJldHVybiBlbCAmJiAoIXRoaXMuYWNjZXB0IHx8IHRoaXMuYWNjZXB0KGVsKSk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfc2V0dXBBY2NlcHQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbi5hY2NlcHQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb24uYWNjZXB0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLmFjY2VwdCA9IChlbCkgPT4gZWwubWF0Y2hlcyh0aGlzLm9wdGlvbi5hY2NlcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hY2NlcHQgPSB0aGlzLm9wdGlvbi5hY2NlcHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3VpKGRyYWcpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IGRyYWdnYWJsZTogZHJhZy5lbCB9LCBkcmFnLnVpKCkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuREREcm9wcGFibGUgPSBERERyb3BwYWJsZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtZHJvcHBhYmxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogZGQtZWxlbWVudHMudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRERWxlbWVudCA9IHZvaWQgMDtcclxuY29uc3QgZGRfcmVzaXphYmxlXzEgPSByZXF1aXJlKFwiLi9kZC1yZXNpemFibGVcIik7XHJcbmNvbnN0IGRkX2RyYWdnYWJsZV8xID0gcmVxdWlyZShcIi4vZGQtZHJhZ2dhYmxlXCIpO1xyXG5jb25zdCBkZF9kcm9wcGFibGVfMSA9IHJlcXVpcmUoXCIuL2RkLWRyb3BwYWJsZVwiKTtcclxuY2xhc3MgRERFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVsKSB7XHJcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGluaXQoZWwpIHtcclxuICAgICAgICBpZiAoIWVsLmRkRWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbC5kZEVsZW1lbnQgPSBuZXcgRERFbGVtZW50KGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsLmRkRWxlbWVudDtcclxuICAgIH1cclxuICAgIG9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAodGhpcy5kZERyYWdnYWJsZSAmJiBbJ2RyYWcnLCAnZHJhZ3N0YXJ0JywgJ2RyYWdzdG9wJ10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyYWdnYWJsZS5vbihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZERyb3BwYWJsZSAmJiBbJ2Ryb3AnLCAnZHJvcG92ZXInLCAnZHJvcG91dCddLmluZGV4T2YoZXZlbnROYW1lKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcm9wcGFibGUub24oZXZlbnROYW1lLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGRSZXNpemFibGUgJiYgWydyZXNpemVzdGFydCcsICdyZXNpemUnLCAncmVzaXplc3RvcCddLmluZGV4T2YoZXZlbnROYW1lKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGRSZXNpemFibGUub24oZXZlbnROYW1lLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgb2ZmKGV2ZW50TmFtZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRkRHJhZ2dhYmxlICYmIFsnZHJhZycsICdkcmFnc3RhcnQnLCAnZHJhZ3N0b3AnXS5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJhZ2dhYmxlLm9mZihldmVudE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRkRHJvcHBhYmxlICYmIFsnZHJvcCcsICdkcm9wb3ZlcicsICdkcm9wb3V0J10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyb3BwYWJsZS5vZmYoZXZlbnROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZFJlc2l6YWJsZSAmJiBbJ3Jlc2l6ZXN0YXJ0JywgJ3Jlc2l6ZScsICdyZXNpemVzdG9wJ10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZFJlc2l6YWJsZS5vZmYoZXZlbnROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXR1cERyYWdnYWJsZShvcHRzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRkRHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcmFnZ2FibGUgPSBuZXcgZGRfZHJhZ2dhYmxlXzEuREREcmFnZ2FibGUodGhpcy5lbCwgb3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJhZ2dhYmxlLnVwZGF0ZU9wdGlvbihvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBjbGVhbkRyYWdnYWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kZERyYWdnYWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJhZ2dhYmxlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGREcmFnZ2FibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgc2V0dXBSZXNpemFibGUob3B0cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kZFJlc2l6YWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkUmVzaXphYmxlID0gbmV3IGRkX3Jlc2l6YWJsZV8xLkREUmVzaXphYmxlKHRoaXMuZWwsIG9wdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZFJlc2l6YWJsZS51cGRhdGVPcHRpb24ob3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgY2xlYW5SZXNpemFibGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGRSZXNpemFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZFJlc2l6YWJsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRkUmVzaXphYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldHVwRHJvcHBhYmxlKG9wdHMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGREcm9wcGFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyb3BwYWJsZSA9IG5ldyBkZF9kcm9wcGFibGVfMS5ERERyb3BwYWJsZSh0aGlzLmVsLCBvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcm9wcGFibGUudXBkYXRlT3B0aW9uKG9wdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGNsZWFuRHJvcHBhYmxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRkRHJvcHBhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcm9wcGFibGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kZERyb3BwYWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5EREVsZW1lbnQgPSBEREVsZW1lbnQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLWVsZW1lbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1ncmlkc3RhY2sudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRER3JpZFN0YWNrID0gdm9pZCAwO1xyXG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbmNvbnN0IGRkX2VsZW1lbnRfMSA9IHJlcXVpcmUoXCIuL2RkLWVsZW1lbnRcIik7XHJcbi8vIGxldCBjb3VudCA9IDA7IC8vIFRFU1RcclxuLyoqXHJcbiAqIEhUTUwgTmF0aXZlIE1vdXNlIGFuZCBUb3VjaCBFdmVudHMgRHJhZyBhbmQgRHJvcCBmdW5jdGlvbmFsaXR5LlxyXG4gKi9cclxuY2xhc3MgRERHcmlkU3RhY2sge1xyXG4gICAgcmVzaXphYmxlKGVsLCBvcHRzLCBrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fZ2V0RERFbGVtZW50cyhlbCkuZm9yRWFjaChkRWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAob3B0cyA9PT0gJ2Rpc2FibGUnIHx8IG9wdHMgPT09ICdlbmFibGUnKSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuZGRSZXNpemFibGUgJiYgZEVsLmRkUmVzaXphYmxlW29wdHNdKCk7IC8vIGNhbid0IGNyZWF0ZSBERCBhcyBpdCByZXF1aXJlcyBvcHRpb25zIGZvciBzZXR1cFJlc2l6YWJsZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0cyA9PT0gJ2Rlc3Ryb3knKSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuZGRSZXNpemFibGUgJiYgZEVsLmNsZWFuUmVzaXphYmxlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0cyA9PT0gJ29wdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5zZXR1cFJlc2l6YWJsZSh7IFtrZXldOiB2YWx1ZSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBkRWwuZWwuZ3JpZHN0YWNrTm9kZS5ncmlkO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXMgPSBkRWwuZWwuZ2V0QXR0cmlidXRlKCdncy1yZXNpemUtaGFuZGxlcycpID8gZEVsLmVsLmdldEF0dHJpYnV0ZSgnZ3MtcmVzaXplLWhhbmRsZXMnKSA6IGdyaWQub3B0cy5yZXNpemFibGUuaGFuZGxlcztcclxuICAgICAgICAgICAgICAgIGxldCBhdXRvSGlkZSA9ICFncmlkLm9wdHMuYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZTtcclxuICAgICAgICAgICAgICAgIGRFbC5zZXR1cFJlc2l6YWJsZShPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgZ3JpZC5vcHRzLnJlc2l6YWJsZSksIHsgaGFuZGxlcywgYXV0b0hpZGUgfSksIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb3B0cy5zdGFydCxcclxuICAgICAgICAgICAgICAgICAgICBzdG9wOiBvcHRzLnN0b3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplOiBvcHRzLnJlc2l6ZVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkcmFnZ2FibGUoZWwsIG9wdHMsIGtleSwgdmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvcHRzID09PSAnZGlzYWJsZScgfHwgb3B0cyA9PT0gJ2VuYWJsZScpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5kZERyYWdnYWJsZSAmJiBkRWwuZGREcmFnZ2FibGVbb3B0c10oKTsgLy8gY2FuJ3QgY3JlYXRlIEREIGFzIGl0IHJlcXVpcmVzIG9wdGlvbnMgZm9yIHNldHVwRHJhZ2dhYmxlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnZGVzdHJveScpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5kZERyYWdnYWJsZSAmJiBkRWwuY2xlYW5EcmFnZ2FibGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnb3B0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgZEVsLnNldHVwRHJhZ2dhYmxlKHsgW2tleV06IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGRFbC5lbC5ncmlkc3RhY2tOb2RlLmdyaWQ7XHJcbiAgICAgICAgICAgICAgICBkRWwuc2V0dXBEcmFnZ2FibGUoT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBncmlkLm9wdHMuZHJhZ2dhYmxlKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5tZW50OiAoZ3JpZC5wYXJlbnRHcmlkSXRlbSAmJiAhZ3JpZC5vcHRzLmRyYWdPdXQpID8gZ3JpZC5lbC5wYXJlbnRFbGVtZW50IDogKGdyaWQub3B0cy5kcmFnZ2FibGUuY29udGFpbm1lbnQgfHwgbnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9wdHMuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcDogb3B0cy5zdG9wLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWc6IG9wdHMuZHJhZ1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkcmFnSW4oZWwsIG9wdHMpIHtcclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiBkRWwuc2V0dXBEcmFnZ2FibGUob3B0cykpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZHJvcHBhYmxlKGVsLCBvcHRzLCBrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzLmFjY2VwdCA9PT0gJ2Z1bmN0aW9uJyAmJiAhb3B0cy5fYWNjZXB0KSB7XHJcbiAgICAgICAgICAgIG9wdHMuX2FjY2VwdCA9IG9wdHMuYWNjZXB0O1xyXG4gICAgICAgICAgICBvcHRzLmFjY2VwdCA9IChlbCkgPT4gb3B0cy5fYWNjZXB0KGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2V0RERFbGVtZW50cyhlbCkuZm9yRWFjaChkRWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAob3B0cyA9PT0gJ2Rpc2FibGUnIHx8IG9wdHMgPT09ICdlbmFibGUnKSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuZGREcm9wcGFibGUgJiYgZEVsLmRkRHJvcHBhYmxlW29wdHNdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0cyA9PT0gJ2Rlc3Ryb3knKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZEVsLmRkRHJvcHBhYmxlKSB7IC8vIGVycm9yIHRvIGNhbGwgZGVzdHJveSBpZiBub3QgdGhlcmVcclxuICAgICAgICAgICAgICAgICAgICBkRWwuY2xlYW5Ecm9wcGFibGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnb3B0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgZEVsLnNldHVwRHJvcHBhYmxlKHsgW2tleV06IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZEVsLnNldHVwRHJvcHBhYmxlKG9wdHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogdHJ1ZSBpZiBlbGVtZW50IGlzIGRyb3BwYWJsZSAqL1xyXG4gICAgaXNEcm9wcGFibGUoZWwpIHtcclxuICAgICAgICByZXR1cm4gISEoZWwgJiYgZWwuZGRFbGVtZW50ICYmIGVsLmRkRWxlbWVudC5kZERyb3BwYWJsZSAmJiAhZWwuZGRFbGVtZW50LmRkRHJvcHBhYmxlLmRpc2FibGVkKTtcclxuICAgIH1cclxuICAgIC8qKiB0cnVlIGlmIGVsZW1lbnQgaXMgZHJhZ2dhYmxlICovXHJcbiAgICBpc0RyYWdnYWJsZShlbCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbCAmJiBlbC5kZEVsZW1lbnQgJiYgZWwuZGRFbGVtZW50LmRkRHJhZ2dhYmxlICYmICFlbC5kZEVsZW1lbnQuZGREcmFnZ2FibGUuZGlzYWJsZWQpO1xyXG4gICAgfVxyXG4gICAgLyoqIHRydWUgaWYgZWxlbWVudCBpcyBkcmFnZ2FibGUgKi9cclxuICAgIGlzUmVzaXphYmxlKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsICYmIGVsLmRkRWxlbWVudCAmJiBlbC5kZEVsZW1lbnQuZGRSZXNpemFibGUgJiYgIWVsLmRkRWxlbWVudC5kZFJlc2l6YWJsZS5kaXNhYmxlZCk7XHJcbiAgICB9XHJcbiAgICBvbihlbCwgbmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiBkRWwub24obmFtZSwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGV2ZW50LCBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50ID8gZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudC5lbCA6IGV2ZW50LnRhcmdldCwgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCA/IGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQuaGVscGVyIDogbnVsbCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgb2ZmKGVsLCBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5fZ2V0RERFbGVtZW50cyhlbCkuZm9yRWFjaChkRWwgPT4gZEVsLm9mZihuYW1lKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHJldHVybnMgYSBsaXN0IG9mIEREIGVsZW1lbnRzLCBjcmVhdGluZyB0aGVtIG9uIHRoZSBmbHkgYnkgZGVmYXVsdCAqL1xyXG4gICAgX2dldERERWxlbWVudHMoZWxzLCBjcmVhdGUgPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGhvc3RzID0gdXRpbHNfMS5VdGlscy5nZXRFbGVtZW50cyhlbHMpO1xyXG4gICAgICAgIGlmICghaG9zdHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgbGV0IGxpc3QgPSBob3N0cy5tYXAoZSA9PiBlLmRkRWxlbWVudCB8fCAoY3JlYXRlID8gZGRfZWxlbWVudF8xLkRERWxlbWVudC5pbml0KGUpIDogbnVsbCkpO1xyXG4gICAgICAgIGlmICghY3JlYXRlKSB7XHJcbiAgICAgICAgICAgIGxpc3QuZmlsdGVyKGQgPT4gZCk7XHJcbiAgICAgICAgfSAvLyByZW1vdmUgbnVsbHNcclxuICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkRER3JpZFN0YWNrID0gRERHcmlkU3RhY2s7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLWdyaWRzdGFjay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLW1hbmFnZXIudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRETWFuYWdlciA9IHZvaWQgMDtcclxuLyoqXHJcbiAqIGdsb2JhbHMgdGhhdCBhcmUgc2hhcmVkIGFjcm9zcyBEcmFnICYgRHJvcCBpbnN0YW5jZXNcclxuICovXHJcbmNsYXNzIERETWFuYWdlciB7XHJcbn1cclxuZXhwb3J0cy5ERE1hbmFnZXIgPSBERE1hbmFnZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLW1hbmFnZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1yZXNpemFibGUtaGFuZGxlLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMS0yMDIyIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkREUmVzaXphYmxlSGFuZGxlID0gdm9pZCAwO1xyXG5jb25zdCBkZF90b3VjaF8xID0gcmVxdWlyZShcIi4vZGQtdG91Y2hcIik7XHJcbmNsYXNzIEREUmVzaXphYmxlSGFuZGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKGhvc3QsIGRpcmVjdGlvbiwgb3B0aW9uKSB7XHJcbiAgICAgICAgLyoqIEBpbnRlcm5hbCB0cnVlIGFmdGVyIHdlJ3ZlIG1vdmVkIGVub3VnaCBwaXhlbHMgdG8gc3RhcnQgYSByZXNpemUgKi9cclxuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XHJcbiAgICAgICAgdGhpcy5kaXIgPSBkaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgLy8gY3JlYXRlIHZhciBldmVudCBiaW5kaW5nIHNvIHdlIGNhbiBlYXNpbHkgcmVtb3ZlIGFuZCBzdGlsbCBsb29rIGxpa2UgVFMgbWV0aG9kcyAodW5saWtlIGFub255bW91cyBmdW5jdGlvbnMpXHJcbiAgICAgICAgdGhpcy5fbW91c2VEb3duID0gdGhpcy5fbW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VNb3ZlID0gdGhpcy5fbW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VVcCA9IHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3VpLXJlc2l6YWJsZS1oYW5kbGUnKTtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGAke0REUmVzaXphYmxlSGFuZGxlLnByZWZpeH0ke3RoaXMuZGlyfWApO1xyXG4gICAgICAgIGVsLnN0eWxlLnpJbmRleCA9ICcxMDAnO1xyXG4gICAgICAgIGVsLnN0eWxlLnVzZXJTZWxlY3QgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaG9zdC5hcHBlbmRDaGlsZCh0aGlzLmVsKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bik7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkZF90b3VjaF8xLnRvdWNoc3RhcnQpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZGRfdG91Y2hfMS5wb2ludGVyZG93bik7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZWwuc3R5bGUudG91Y2hBY3Rpb24gPSAnbm9uZSc7IC8vIG5vdCBuZWVkZWQgdW5saWtlIHBvaW50ZXJkb3duIGRvYyBjb21tZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIGNhbGwgdGhpcyB3aGVuIHJlc2l6ZSBoYW5kbGUgbmVlZHMgdG8gYmUgcmVtb3ZlZCBhbmQgY2xlYW5lZCB1cCAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5tb3ZpbmcpXHJcbiAgICAgICAgICAgIHRoaXMuX21vdXNlVXAodGhpcy5tb3VzZURvd25FdmVudCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZURvd24pO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZGRfdG91Y2hfMS50b3VjaHN0YXJ0KTtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGRkX3RvdWNoXzEucG9pbnRlcmRvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhvc3QucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZWw7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuaG9zdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIG9uIG1vdXNlIGRvd24gb24gdXM6IGNhcHR1cmUgbW92ZSBvbiB0aGUgZW50aXJlIGRvY3VtZW50IChtb3VzZSBtaWdodCBub3Qgc3RheSBvbiB1cykgdW50aWwgd2UgcmVsZWFzZSB0aGUgbW91c2UgKi9cclxuICAgIF9tb3VzZURvd24oZSkge1xyXG4gICAgICAgIHRoaXMubW91c2VEb3duRXZlbnQgPSBlO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlTW92ZSwgdHJ1ZSk7IC8vIGNhcHR1cmUsIG5vdCBidWJibGVcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcCwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRkX3RvdWNoXzEudG91Y2htb3ZlKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGRkX3RvdWNoXzEudG91Y2hlbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9tb3VzZU1vdmUoZSkge1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5tb3VzZURvd25FdmVudDtcclxuICAgICAgICBpZiAodGhpcy5tb3ZpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdtb3ZlJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKE1hdGguYWJzKGUueCAtIHMueCkgKyBNYXRoLmFicyhlLnkgLSBzLnkpID4gMikge1xyXG4gICAgICAgICAgICAvLyBkb24ndCBzdGFydCB1bmxlc3Mgd2UndmUgbW92ZWQgYXQgbGVhc3QgMyBwaXhlbHNcclxuICAgICAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRXZlbnQoJ3N0YXJ0JywgdGhpcy5tb3VzZURvd25FdmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnbW92ZScsIGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9tb3VzZVVwKGUpIHtcclxuICAgICAgICBpZiAodGhpcy5tb3ZpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdzdG9wJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlTW92ZSwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAsIHRydWUpO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZF90b3VjaF8xLnRvdWNobW92ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBkZF90b3VjaF8xLnRvdWNoZW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMubW92aW5nO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm1vdXNlRG93bkV2ZW50O1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3RyaWdnZXJFdmVudChuYW1lLCBldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbltuYW1lXSlcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25bbmFtZV0oZXZlbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRERSZXNpemFibGVIYW5kbGUgPSBERFJlc2l6YWJsZUhhbmRsZTtcclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5ERFJlc2l6YWJsZUhhbmRsZS5wcmVmaXggPSAndWktcmVzaXphYmxlLSc7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLXJlc2l6YWJsZS1oYW5kbGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1yZXNpemFibGUudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxLTIwMjIgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRERSZXNpemFibGUgPSB2b2lkIDA7XHJcbmNvbnN0IGRkX3Jlc2l6YWJsZV9oYW5kbGVfMSA9IHJlcXVpcmUoXCIuL2RkLXJlc2l6YWJsZS1oYW5kbGVcIik7XHJcbmNvbnN0IGRkX2Jhc2VfaW1wbF8xID0gcmVxdWlyZShcIi4vZGQtYmFzZS1pbXBsXCIpO1xyXG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbmNsYXNzIEREUmVzaXphYmxlIGV4dGVuZHMgZGRfYmFzZV9pbXBsXzEuRERCYXNlSW1wbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRzID0ge30pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgICAgICB0aGlzLl91aSA9ICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbm1lbnRFbCA9IHRoaXMuZWwucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbm1lbnRSZWN0ID0gY29udGFpbm1lbnRFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgY29uc3QgbmV3UmVjdCA9IHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsUmVjdC53aWR0aCxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbFJlY3QuaGVpZ2h0ICsgdGhpcy5zY3JvbGxlZCxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMub3JpZ2luYWxSZWN0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB0b3A6IHRoaXMub3JpZ2luYWxSZWN0LnRvcCAtIHRoaXMuc2Nyb2xsZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMudGVtcG9yYWxSZWN0IHx8IG5ld1JlY3Q7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHJlY3QubGVmdCAtIGNvbnRhaW5tZW50UmVjdC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogcmVjdC50b3AgLSBjb250YWlubWVudFJlY3QudG9wXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2l6ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIEdyaWRzdGFjayBPTkxZIG5lZWRzIHBvc2l0aW9uIHNldCBhYm92ZS4uLiBrZWVwIGFyb3VuZCBpbiBjYXNlLlxyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogW3RoaXMuZWxdLCAvLyBUaGUgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZWxlbWVudCB0byBiZSByZXNpemVkXHJcbiAgICAgICAgICAgICAgICBoZWxwZXI6IFtdLCAvLyBUT0RPOiBub3Qgc3VwcG9ydCB5ZXQgLSBUaGUgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgaGVscGVyIHRoYXQncyBiZWluZyByZXNpemVkXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEVsZW1lbnQ6IFt0aGlzLmVsXSwvLyB3ZSBkb24ndCB3cmFwIGhlcmUsIHNvIHNpbXBsaWZ5IGFzIHRoaXMuZWwgLy9UaGUgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgb3JpZ2luYWwgZWxlbWVudCBiZWZvcmUgaXQgaXMgd3JhcHBlZFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjogeyAvLyBUaGUgcG9zaXRpb24gcmVwcmVzZW50ZWQgYXMgeyBsZWZ0LCB0b3AgfSBiZWZvcmUgdGhlIHJlc2l6YWJsZSBpcyByZXNpemVkXHJcbiAgICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMub3JpZ2luYWxSZWN0LmxlZnQgLSBjb250YWlubWVudFJlY3QubGVmdCxcclxuICAgICAgICAgICAgICAgICAgdG9wOiB0aGlzLm9yaWdpbmFsUmVjdC50b3AgLSBjb250YWlubWVudFJlY3QudG9wXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxTaXplOiB7IC8vIFRoZSBzaXplIHJlcHJlc2VudGVkIGFzIHsgd2lkdGgsIGhlaWdodCB9IGJlZm9yZSB0aGUgcmVzaXphYmxlIGlzIHJlc2l6ZWRcclxuICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3JpZ2luYWxSZWN0LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3JpZ2luYWxSZWN0LmhlaWdodFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdHM7XHJcbiAgICAgICAgLy8gY3JlYXRlIHZhciBldmVudCBiaW5kaW5nIHNvIHdlIGNhbiBlYXNpbHkgcmVtb3ZlIGFuZCBzdGlsbCBsb29rIGxpa2UgVFMgbWV0aG9kcyAodW5saWtlIGFub255bW91cyBmdW5jdGlvbnMpXHJcbiAgICAgICAgdGhpcy5fbW91c2VPdmVyID0gdGhpcy5fbW91c2VPdmVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbW91c2VPdXQgPSB0aGlzLl9tb3VzZU91dC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBdXRvSGlkZSh0aGlzLm9wdGlvbi5hdXRvSGlkZSk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBIYW5kbGVycygpO1xyXG4gICAgfVxyXG4gICAgb24oZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgc3VwZXIub24oZXZlbnQsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIG9mZihldmVudCkge1xyXG4gICAgICAgIHN1cGVyLm9mZihldmVudCk7XHJcbiAgICB9XHJcbiAgICBlbmFibGUoKSB7XHJcbiAgICAgICAgc3VwZXIuZW5hYmxlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1yZXNpemFibGUnKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLXJlc2l6YWJsZS1kaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQXV0b0hpZGUodGhpcy5vcHRpb24uYXV0b0hpZGUpO1xyXG4gICAgfVxyXG4gICAgZGlzYWJsZSgpIHtcclxuICAgICAgICBzdXBlci5kaXNhYmxlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1yZXNpemFibGUtZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLXJlc2l6YWJsZScpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQXV0b0hpZGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQXV0b0hpZGUoZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlJyk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZWw7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlT3B0aW9uKG9wdHMpIHtcclxuICAgICAgICBsZXQgdXBkYXRlSGFuZGxlcyA9IChvcHRzLmhhbmRsZXMgJiYgb3B0cy5oYW5kbGVzICE9PSB0aGlzLm9wdGlvbi5oYW5kbGVzKTtcclxuICAgICAgICBsZXQgdXBkYXRlQXV0b0hpZGUgPSAob3B0cy5hdXRvSGlkZSAmJiBvcHRzLmF1dG9IaWRlICE9PSB0aGlzLm9wdGlvbi5hdXRvSGlkZSk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob3B0cykuZm9yRWFjaChrZXkgPT4gdGhpcy5vcHRpb25ba2V5XSA9IG9wdHNba2V5XSk7XHJcbiAgICAgICAgaWYgKHVwZGF0ZUhhbmRsZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSGFuZGxlcnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0dXBIYW5kbGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlQXV0b0hpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0dXBBdXRvSGlkZSh0aGlzLm9wdGlvbi5hdXRvSGlkZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCB0dXJucyBhdXRvIGhpZGUgb24vb2ZmICovXHJcbiAgICBfc2V0dXBBdXRvSGlkZShhdXRvKSB7XHJcbiAgICAgICAgaWYgKGF1dG8pIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1yZXNpemFibGUtYXV0b2hpZGUnKTtcclxuICAgICAgICAgICAgLy8gdXNlIG1vdXNlb3ZlciBhbmQgbm90IG1vdXNlZW50ZXIgdG8gZ2V0IGJldHRlciBwZXJmb3JtYW5jZSBhbmQgdHJhY2sgZm9yIG5lc3RlZCBjYXNlc1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX21vdXNlT3Zlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9tb3VzZU91dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLXJlc2l6YWJsZS1hdXRvaGlkZScpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX21vdXNlT3Zlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9tb3VzZU91dCk7XHJcbiAgICAgICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm92ZXJSZXNpemVFbGVtZW50ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5vdmVyUmVzaXplRWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcclxuICAgIF9tb3VzZU92ZXIoZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGAke2NvdW50Kyt9IHByZS1lbnRlciAkeyh0aGlzLmVsIGFzIEdyaWRJdGVtSFRNTEVsZW1lbnQpLmdyaWRzdGFja05vZGUuX2lkfWApXHJcbiAgICAgICAgLy8gYWxyZWFkeSBvdmVyIGEgY2hpbGQsIGlnbm9yZS4gSWRlYWxseSB3ZSBqdXN0IGNhbGwgZS5zdG9wUHJvcGFnYXRpb24oKSBidXQgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzL2lzc3Vlcy8yMDE4XHJcbiAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIub3ZlclJlc2l6ZUVsZW1lbnQgfHwgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIub3ZlclJlc2l6ZUVsZW1lbnQgPSB0aGlzO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGAke2NvdW50Kyt9IGVudGVyICR7KHRoaXMuZWwgYXMgR3JpZEl0ZW1IVE1MRWxlbWVudCkuZ3JpZHN0YWNrTm9kZS5faWR9YClcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLXJlc2l6YWJsZS1hdXRvaGlkZScpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xyXG4gICAgX21vdXNlT3V0KGUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtjb3VudCsrfSBwcmUtbGVhdmUgJHsodGhpcy5lbCBhcyBHcmlkSXRlbUhUTUxFbGVtZW50KS5ncmlkc3RhY2tOb2RlLl9pZH1gKVxyXG4gICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm92ZXJSZXNpemVFbGVtZW50ICE9PSB0aGlzKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIub3ZlclJlc2l6ZUVsZW1lbnQ7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gbGVhdmUgJHsodGhpcy5lbCBhcyBHcmlkSXRlbUhUTUxFbGVtZW50KS5ncmlkc3RhY2tOb2RlLl9pZH1gKVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktcmVzaXphYmxlLWF1dG9oaWRlJyk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfc2V0dXBIYW5kbGVycygpIHtcclxuICAgICAgICBsZXQgaGFuZGxlckRpcmVjdGlvbiA9IHRoaXMub3B0aW9uLmhhbmRsZXMgfHwgJ2UscyxzZSc7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJEaXJlY3Rpb24gPT09ICdhbGwnKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJEaXJlY3Rpb24gPSAnbixlLHMsdyxzZSxzdyxuZSxudyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSBoYW5kbGVyRGlyZWN0aW9uLnNwbGl0KCcsJylcclxuICAgICAgICAgICAgLm1hcChkaXIgPT4gZGlyLnRyaW0oKSlcclxuICAgICAgICAgICAgLm1hcChkaXIgPT4gbmV3IGRkX3Jlc2l6YWJsZV9oYW5kbGVfMS5ERFJlc2l6YWJsZUhhbmRsZSh0aGlzLmVsLCBkaXIsIHtcclxuICAgICAgICAgICAgc3RhcnQ6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzaXplU3RhcnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdG9wOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZVN0b3AoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3ZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2l6aW5nKGV2ZW50LCBkaXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3Jlc2l6ZVN0YXJ0KGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFJlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsRWwgPSB1dGlsc18xLlV0aWxzLmdldFNjcm9sbEVsZW1lbnQodGhpcy5lbCk7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxZID0gdGhpcy5zY3JvbGxFbC5zY3JvbGxUb3A7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGFydEV2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBIZWxwZXIoKTtcclxuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZSgpO1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZXZlbnQsIHsgdHlwZTogJ3Jlc2l6ZXN0YXJ0JywgdGFyZ2V0OiB0aGlzLmVsIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5zdGFydCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbi5zdGFydChldiwgdGhpcy5fdWkoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktcmVzaXphYmxlLXJlc2l6aW5nJyk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3Jlc2l6ZXN0YXJ0JywgZXYpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3Jlc2l6aW5nKGV2ZW50LCBkaXIpIHtcclxuICAgICAgICB0aGlzLnNjcm9sbGVkID0gdGhpcy5zY3JvbGxFbC5zY3JvbGxUb3AgLSB0aGlzLnNjcm9sbFk7XHJcbiAgICAgICAgdGhpcy50ZW1wb3JhbFJlY3QgPSB0aGlzLl9nZXRDaGFuZ2UoZXZlbnQsIGRpcik7XHJcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2UoKTtcclxuICAgICAgICBjb25zdCBldiA9IHV0aWxzXzEuVXRpbHMuaW5pdEV2ZW50KGV2ZW50LCB7IHR5cGU6ICdyZXNpemUnLCB0YXJnZXQ6IHRoaXMuZWwgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uLnJlc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbi5yZXNpemUoZXYsIHRoaXMuX3VpKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgncmVzaXplJywgZXYpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3Jlc2l6ZVN0b3AoZXZlbnQpIHtcclxuICAgICAgICBjb25zdCBldiA9IHV0aWxzXzEuVXRpbHMuaW5pdEV2ZW50KGV2ZW50LCB7IHR5cGU6ICdyZXNpemVzdG9wJywgdGFyZ2V0OiB0aGlzLmVsIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5zdG9wKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLnN0b3AoZXYpOyAvLyBOb3RlOiB1aSgpIG5vdCB1c2VkIGJ5IGdyaWRzdGFjayBzbyBkb24ndCBwYXNzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlLXJlc2l6aW5nJyk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3Jlc2l6ZXN0b3AnLCBldik7XHJcbiAgICAgICAgdGhpcy5fY2xlYW5IZWxwZXIoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydEV2ZW50O1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9yaWdpbmFsUmVjdDtcclxuICAgICAgICBkZWxldGUgdGhpcy50ZW1wb3JhbFJlY3Q7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuc2Nyb2xsWTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zY3JvbGxlZDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9zZXR1cEhlbHBlcigpIHtcclxuICAgICAgICB0aGlzLmVsT3JpZ2luU3R5bGVWYWwgPSBERFJlc2l6YWJsZS5fb3JpZ2luU3R5bGVQcm9wLm1hcChwcm9wID0+IHRoaXMuZWwuc3R5bGVbcHJvcF0pO1xyXG4gICAgICAgIHRoaXMucGFyZW50T3JpZ2luU3R5bGVQb3NpdGlvbiA9IHRoaXMuZWwucGFyZW50RWxlbWVudC5zdHlsZS5wb3NpdGlvbjtcclxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbC5wYXJlbnRFbGVtZW50KS5wb3NpdGlvbi5tYXRjaCgvc3RhdGljLykpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5wYXJlbnRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5vcGFjaXR5ID0gJzAuOCc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfY2xlYW5IZWxwZXIoKSB7XHJcbiAgICAgICAgRERSZXNpemFibGUuX29yaWdpblN0eWxlUHJvcC5mb3JFYWNoKChwcm9wLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGVbcHJvcF0gPSB0aGlzLmVsT3JpZ2luU3R5bGVWYWxbaV0gfHwgbnVsbDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSB0aGlzLnBhcmVudE9yaWdpblN0eWxlUG9zaXRpb24gfHwgbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9nZXRDaGFuZ2UoZXZlbnQsIGRpcikge1xyXG4gICAgICAgIGNvbnN0IG9FdmVudCA9IHRoaXMuc3RhcnRFdmVudDtcclxuICAgICAgICBjb25zdCBuZXdSZWN0ID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vcmlnaW5hbFJlY3Qud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbFJlY3QuaGVpZ2h0ICsgdGhpcy5zY3JvbGxlZCxcclxuICAgICAgICAgICAgbGVmdDogdGhpcy5vcmlnaW5hbFJlY3QubGVmdCxcclxuICAgICAgICAgICAgdG9wOiB0aGlzLm9yaWdpbmFsUmVjdC50b3AgLSB0aGlzLnNjcm9sbGVkXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBvZmZzZXRYID0gZXZlbnQuY2xpZW50WCAtIG9FdmVudC5jbGllbnRYO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSBldmVudC5jbGllbnRZIC0gb0V2ZW50LmNsaWVudFk7XHJcbiAgICAgICAgaWYgKGRpci5pbmRleE9mKCdlJykgPiAtMSkge1xyXG4gICAgICAgICAgICBuZXdSZWN0LndpZHRoICs9IG9mZnNldFg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRpci5pbmRleE9mKCd3JykgPiAtMSkge1xyXG4gICAgICAgICAgICBuZXdSZWN0LndpZHRoIC09IG9mZnNldFg7XHJcbiAgICAgICAgICAgIG5ld1JlY3QubGVmdCArPSBvZmZzZXRYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlyLmluZGV4T2YoJ3MnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG5ld1JlY3QuaGVpZ2h0ICs9IG9mZnNldFk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRpci5pbmRleE9mKCduJykgPiAtMSkge1xyXG4gICAgICAgICAgICBuZXdSZWN0LmhlaWdodCAtPSBvZmZzZXRZO1xyXG4gICAgICAgICAgICBuZXdSZWN0LnRvcCArPSBvZmZzZXRZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb25zdHJhaW4gPSB0aGlzLl9jb25zdHJhaW5TaXplKG5ld1JlY3Qud2lkdGgsIG5ld1JlY3QuaGVpZ2h0KTtcclxuICAgICAgICBpZiAoTWF0aC5yb3VuZChuZXdSZWN0LndpZHRoKSAhPT0gTWF0aC5yb3VuZChjb25zdHJhaW4ud2lkdGgpKSB7IC8vIHJvdW5kIHRvIGlnbm9yZSBzbGlnaHQgcm91bmQtb2ZmIGVycm9yc1xyXG4gICAgICAgICAgICBpZiAoZGlyLmluZGV4T2YoJ3cnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdSZWN0LmxlZnQgKz0gbmV3UmVjdC53aWR0aCAtIGNvbnN0cmFpbi53aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXdSZWN0LndpZHRoID0gY29uc3RyYWluLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTWF0aC5yb3VuZChuZXdSZWN0LmhlaWdodCkgIT09IE1hdGgucm91bmQoY29uc3RyYWluLmhlaWdodCkpIHtcclxuICAgICAgICAgICAgaWYgKGRpci5pbmRleE9mKCduJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgbmV3UmVjdC50b3AgKz0gbmV3UmVjdC5oZWlnaHQgLSBjb25zdHJhaW4uaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld1JlY3QuaGVpZ2h0ID0gY29uc3RyYWluLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ld1JlY3Q7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNvbnN0cmFpbiB0aGUgc2l6ZSB0byB0aGUgc2V0IG1pbi9tYXggdmFsdWVzICovXHJcbiAgICBfY29uc3RyYWluU2l6ZShvV2lkdGgsIG9IZWlnaHQpIHtcclxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IHRoaXMub3B0aW9uLm1heFdpZHRoIHx8IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG4gICAgICAgIGNvbnN0IG1pbldpZHRoID0gdGhpcy5vcHRpb24ubWluV2lkdGggfHwgb1dpZHRoO1xyXG4gICAgICAgIGNvbnN0IG1heEhlaWdodCA9IHRoaXMub3B0aW9uLm1heEhlaWdodCB8fCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBjb25zdCBtaW5IZWlnaHQgPSB0aGlzLm9wdGlvbi5taW5IZWlnaHQgfHwgb0hlaWdodDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKG1heFdpZHRoLCBNYXRoLm1heChtaW5XaWR0aCwgb1dpZHRoKSk7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4obWF4SGVpZ2h0LCBNYXRoLm1heChtaW5IZWlnaHQsIG9IZWlnaHQpKTtcclxuICAgICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfYXBwbHlDaGFuZ2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5tZW50UmVjdCA9IHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XHJcbiAgICAgICAgaWYgKHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPT09ICdhYnNvbHV0ZScpIHtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbm1lbnRFbCA9IHRoaXMuZWwucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3QgeyBsZWZ0LCB0b3AgfSA9IGNvbnRhaW5tZW50RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5tZW50UmVjdCA9IHsgbGVmdCwgdG9wLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy50ZW1wb3JhbFJlY3QpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMudGVtcG9yYWxSZWN0KS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy50ZW1wb3JhbFJlY3Rba2V5XTtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZVtrZXldID0gdmFsdWUgLSBjb250YWlubWVudFJlY3Rba2V5XSArICdweCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfcmVtb3ZlSGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVycy5mb3JFYWNoKGhhbmRsZSA9PiBoYW5kbGUuZGVzdHJveSgpKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5oYW5kbGVycztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkREUmVzaXphYmxlID0gRERSZXNpemFibGU7XHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuRERSZXNpemFibGUuX29yaWdpblN0eWxlUHJvcCA9IFsnd2lkdGgnLCAnaGVpZ2h0JywgJ3Bvc2l0aW9uJywgJ2xlZnQnLCAndG9wJywgJ29wYWNpdHknLCAnekluZGV4J107XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLXJlc2l6YWJsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIHRvdWNoLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMSBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5wb2ludGVybGVhdmUgPSBleHBvcnRzLnBvaW50ZXJlbnRlciA9IGV4cG9ydHMucG9pbnRlcmRvd24gPSBleHBvcnRzLnRvdWNoZW5kID0gZXhwb3J0cy50b3VjaG1vdmUgPSBleHBvcnRzLnRvdWNoc3RhcnQgPSBleHBvcnRzLmlzVG91Y2ggPSB2b2lkIDA7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbi8qKlxyXG4gKiBEZXRlY3QgdG91Y2ggc3VwcG9ydCAtIFdpbmRvd3MgU3VyZmFjZSBkZXZpY2VzIGFuZCBvdGhlciB0b3VjaCBkZXZpY2VzXHJcbiAqIHNob3VsZCB3ZSB1c2UgdGhpcyBpbnN0ZWFkID8gKHdoYXQgd2UgaGFkIGZvciBhbHdheXMgc2hvd2luZyByZXNpemUgaGFuZGxlcylcclxuICogL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXHJcbiAqL1xyXG5leHBvcnRzLmlzVG91Y2ggPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgICAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnRcclxuICAgICAgICB8fCAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3dcclxuICAgICAgICAvLyB8fCAhIXdpbmRvdy5Ub3VjaEV2ZW50IC8vIHRydWUgb24gV2luZG93cyAxMCBDaHJvbWUgZGVza3RvcCBzbyBkb24ndCB1c2UgdGhpc1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgfHwgKHdpbmRvdy5Eb2N1bWVudFRvdWNoICYmIGRvY3VtZW50IGluc3RhbmNlb2Ygd2luZG93LkRvY3VtZW50VG91Y2gpXHJcbiAgICAgICAgfHwgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMFxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgfHwgbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKTtcclxuLy8gaW50ZXJmYWNlIFRvdWNoQ29vcmQge3g6IG51bWJlciwgeTogbnVtYmVyfTtcclxuY2xhc3MgRERUb3VjaCB7XHJcbn1cclxuLyoqXHJcbiogR2V0IHRoZSB4LHkgcG9zaXRpb24gb2YgYSB0b3VjaCBldmVudFxyXG4qL1xyXG4vLyBmdW5jdGlvbiBnZXRUb3VjaENvb3JkcyhlOiBUb3VjaEV2ZW50KTogVG91Y2hDb29yZCB7XHJcbi8vICAgcmV0dXJuIHtcclxuLy8gICAgIHg6IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsXHJcbi8vICAgICB5OiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZXHJcbi8vICAgfTtcclxuLy8gfVxyXG4vKipcclxuICogU2ltdWxhdGUgYSBtb3VzZSBldmVudCBiYXNlZCBvbiBhIGNvcnJlc3BvbmRpbmcgdG91Y2ggZXZlbnRcclxuICogQHBhcmFtIHtPYmplY3R9IGUgQSB0b3VjaCBldmVudFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc2ltdWxhdGVkVHlwZSBUaGUgY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxyXG4gKi9cclxuZnVuY3Rpb24gc2ltdWxhdGVNb3VzZUV2ZW50KGUsIHNpbXVsYXRlZFR5cGUpIHtcclxuICAgIC8vIElnbm9yZSBtdWx0aS10b3VjaCBldmVudHNcclxuICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID4gMSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICAvLyBQcmV2ZW50IFwiSWdub3JlZCBhdHRlbXB0IHRvIGNhbmNlbCBhIHRvdWNobW92ZSBldmVudCB3aXRoIGNhbmNlbGFibGU9ZmFsc2VcIiBlcnJvcnNcclxuICAgIGlmIChlLmNhbmNlbGFibGUpXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgY29uc3QgdG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLCBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2ltdWxhdGVkIG1vdXNlIGV2ZW50IHVzaW5nIHRoZSB0b3VjaCBldmVudCdzIGNvb3JkaW5hdGVzXHJcbiAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudChzaW11bGF0ZWRUeXBlLCAvLyB0eXBlXHJcbiAgICB0cnVlLCAvLyBidWJibGVzXHJcbiAgICB0cnVlLCAvLyBjYW5jZWxhYmxlXHJcbiAgICB3aW5kb3csIC8vIHZpZXdcclxuICAgIDEsIC8vIGRldGFpbFxyXG4gICAgdG91Y2guc2NyZWVuWCwgLy8gc2NyZWVuWFxyXG4gICAgdG91Y2guc2NyZWVuWSwgLy8gc2NyZWVuWVxyXG4gICAgdG91Y2guY2xpZW50WCwgLy8gY2xpZW50WFxyXG4gICAgdG91Y2guY2xpZW50WSwgLy8gY2xpZW50WVxyXG4gICAgZmFsc2UsIC8vIGN0cmxLZXlcclxuICAgIGZhbHNlLCAvLyBhbHRLZXlcclxuICAgIGZhbHNlLCAvLyBzaGlmdEtleVxyXG4gICAgZmFsc2UsIC8vIG1ldGFLZXlcclxuICAgIDAsIC8vIGJ1dHRvblxyXG4gICAgbnVsbCAvLyByZWxhdGVkVGFyZ2V0XHJcbiAgICApO1xyXG4gICAgLy8gRGlzcGF0Y2ggdGhlIHNpbXVsYXRlZCBldmVudCB0byB0aGUgdGFyZ2V0IGVsZW1lbnRcclxuICAgIGUudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xyXG59XHJcbi8qKlxyXG4gKiBTaW11bGF0ZSBhIG1vdXNlIGV2ZW50IGJhc2VkIG9uIGEgY29ycmVzcG9uZGluZyBQb2ludGVyIGV2ZW50XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlIEEgcG9pbnRlciBldmVudFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc2ltdWxhdGVkVHlwZSBUaGUgY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxyXG4gKi9cclxuZnVuY3Rpb24gc2ltdWxhdGVQb2ludGVyTW91c2VFdmVudChlLCBzaW11bGF0ZWRUeXBlKSB7XHJcbiAgICAvLyBQcmV2ZW50IFwiSWdub3JlZCBhdHRlbXB0IHRvIGNhbmNlbCBhIHRvdWNobW92ZSBldmVudCB3aXRoIGNhbmNlbGFibGU9ZmFsc2VcIiBlcnJvcnNcclxuICAgIGlmIChlLmNhbmNlbGFibGUpXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgY29uc3Qgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcclxuICAgIC8vIEluaXRpYWxpemUgdGhlIHNpbXVsYXRlZCBtb3VzZSBldmVudCB1c2luZyB0aGUgdG91Y2ggZXZlbnQncyBjb29yZGluYXRlc1xyXG4gICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQoc2ltdWxhdGVkVHlwZSwgLy8gdHlwZVxyXG4gICAgdHJ1ZSwgLy8gYnViYmxlc1xyXG4gICAgdHJ1ZSwgLy8gY2FuY2VsYWJsZVxyXG4gICAgd2luZG93LCAvLyB2aWV3XHJcbiAgICAxLCAvLyBkZXRhaWxcclxuICAgIGUuc2NyZWVuWCwgLy8gc2NyZWVuWFxyXG4gICAgZS5zY3JlZW5ZLCAvLyBzY3JlZW5ZXHJcbiAgICBlLmNsaWVudFgsIC8vIGNsaWVudFhcclxuICAgIGUuY2xpZW50WSwgLy8gY2xpZW50WVxyXG4gICAgZmFsc2UsIC8vIGN0cmxLZXlcclxuICAgIGZhbHNlLCAvLyBhbHRLZXlcclxuICAgIGZhbHNlLCAvLyBzaGlmdEtleVxyXG4gICAgZmFsc2UsIC8vIG1ldGFLZXlcclxuICAgIDAsIC8vIGJ1dHRvblxyXG4gICAgbnVsbCAvLyByZWxhdGVkVGFyZ2V0XHJcbiAgICApO1xyXG4gICAgLy8gRGlzcGF0Y2ggdGhlIHNpbXVsYXRlZCBldmVudCB0byB0aGUgdGFyZ2V0IGVsZW1lbnRcclxuICAgIGUudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xyXG59XHJcbi8qKlxyXG4gKiBIYW5kbGUgdGhlIHRvdWNoc3RhcnQgZXZlbnRzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSB3aWRnZXQgZWxlbWVudCdzIHRvdWNoc3RhcnQgZXZlbnRcclxuICovXHJcbmZ1bmN0aW9uIHRvdWNoc3RhcnQoZSkge1xyXG4gICAgLy8gSWdub3JlIHRoZSBldmVudCBpZiBhbm90aGVyIHdpZGdldCBpcyBhbHJlYWR5IGJlaW5nIGhhbmRsZWRcclxuICAgIGlmIChERFRvdWNoLnRvdWNoSGFuZGxlZClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBERFRvdWNoLnRvdWNoSGFuZGxlZCA9IHRydWU7XHJcbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2UgZXZlbnRzXHJcbiAgICAvLyBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgJ21vdXNlb3ZlcicpO1xyXG4gICAgLy8gc2ltdWxhdGVNb3VzZUV2ZW50KGUsICdtb3VzZW1vdmUnKTtcclxuICAgIHNpbXVsYXRlTW91c2VFdmVudChlLCAnbW91c2Vkb3duJyk7XHJcbn1cclxuZXhwb3J0cy50b3VjaHN0YXJ0ID0gdG91Y2hzdGFydDtcclxuLyoqXHJcbiAqIEhhbmRsZSB0aGUgdG91Y2htb3ZlIGV2ZW50c1xyXG4gKiBAcGFyYW0ge09iamVjdH0gZSBUaGUgZG9jdW1lbnQncyB0b3VjaG1vdmUgZXZlbnRcclxuICovXHJcbmZ1bmN0aW9uIHRvdWNobW92ZShlKSB7XHJcbiAgICAvLyBJZ25vcmUgZXZlbnQgaWYgbm90IGhhbmRsZWQgYnkgdXNcclxuICAgIGlmICghRERUb3VjaC50b3VjaEhhbmRsZWQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgc2ltdWxhdGVNb3VzZUV2ZW50KGUsICdtb3VzZW1vdmUnKTtcclxufVxyXG5leHBvcnRzLnRvdWNobW92ZSA9IHRvdWNobW92ZTtcclxuLyoqXHJcbiAqIEhhbmRsZSB0aGUgdG91Y2hlbmQgZXZlbnRzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBkb2N1bWVudCdzIHRvdWNoZW5kIGV2ZW50XHJcbiAqL1xyXG5mdW5jdGlvbiB0b3VjaGVuZChlKSB7XHJcbiAgICAvLyBJZ25vcmUgZXZlbnQgaWYgbm90IGhhbmRsZWRcclxuICAgIGlmICghRERUb3VjaC50b3VjaEhhbmRsZWQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gY2FuY2VsIGRlbGF5ZWQgbGVhdmUgZXZlbnQgd2hlbiB3ZSByZWxlYXNlIG9uIG91cnNlbGYgd2hpY2ggaGFwcGVucyBCRUZPUkUgd2UgZ2V0IHRoaXMhXHJcbiAgICBpZiAoRERUb3VjaC5wb2ludGVyTGVhdmVUaW1lb3V0KSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChERFRvdWNoLnBvaW50ZXJMZWF2ZVRpbWVvdXQpO1xyXG4gICAgICAgIGRlbGV0ZSBERFRvdWNoLnBvaW50ZXJMZWF2ZVRpbWVvdXQ7XHJcbiAgICB9XHJcbiAgICBjb25zdCB3YXNEcmFnZ2luZyA9ICEhZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudDtcclxuICAgIC8vIFNpbXVsYXRlIHRoZSBtb3VzZXVwIGV2ZW50XHJcbiAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgJ21vdXNldXAnKTtcclxuICAgIC8vIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlb3V0Jyk7XHJcbiAgICAvLyBJZiB0aGUgdG91Y2ggaW50ZXJhY3Rpb24gZGlkIG5vdCBtb3ZlLCBpdCBzaG91bGQgdHJpZ2dlciBhIGNsaWNrXHJcbiAgICBpZiAoIXdhc0RyYWdnaW5nKSB7XHJcbiAgICAgICAgc2ltdWxhdGVNb3VzZUV2ZW50KGUsICdjbGljaycpO1xyXG4gICAgfVxyXG4gICAgLy8gVW5zZXQgdGhlIGZsYWcgdG8gYWxsb3cgb3RoZXIgd2lkZ2V0cyB0byBpbmhlcml0IHRoZSB0b3VjaCBldmVudFxyXG4gICAgRERUb3VjaC50b3VjaEhhbmRsZWQgPSBmYWxzZTtcclxufVxyXG5leHBvcnRzLnRvdWNoZW5kID0gdG91Y2hlbmQ7XHJcbi8qKlxyXG4gKiBOb3RlIHdlIGRvbid0IGdldCB0b3VjaGVudGVyL3RvdWNobGVhdmUgKHdoaWNoIGFyZSBkZXByZWNhdGVkKVxyXG4gKiBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc5MDgzMzkvanMtdG91Y2gtZXF1aXZhbGVudC1mb3ItbW91c2VlbnRlclxyXG4gKiBzbyBpbnN0ZWFkIG9mIFBvaW50ZXJFdmVudCB0byBzdGlsbCBnZXQgZW50ZXIvbGVhdmUgYW5kIHNlbmQgdGhlIG1hdGNoaW5nIG1vdXNlIGV2ZW50LlxyXG4gKi9cclxuZnVuY3Rpb24gcG9pbnRlcmRvd24oZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2ludGVyIGRvd25cIilcclxuICAgIGUudGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShlLnBvaW50ZXJJZCk7IC8vIDwtIEltcG9ydGFudCFcclxufVxyXG5leHBvcnRzLnBvaW50ZXJkb3duID0gcG9pbnRlcmRvd247XHJcbmZ1bmN0aW9uIHBvaW50ZXJlbnRlcihlKSB7XHJcbiAgICAvLyBpZ25vcmUgdGhlIGluaXRpYWwgb25lIHdlIGdldCBvbiBwb2ludGVyZG93biBvbiBvdXJzZWxmXHJcbiAgICBpZiAoIWRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncG9pbnRlcmVudGVyIGlnbm9yZWQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLmxvZygncG9pbnRlcmVudGVyJyk7XHJcbiAgICBzaW11bGF0ZVBvaW50ZXJNb3VzZUV2ZW50KGUsICdtb3VzZWVudGVyJyk7XHJcbn1cclxuZXhwb3J0cy5wb2ludGVyZW50ZXIgPSBwb2ludGVyZW50ZXI7XHJcbmZ1bmN0aW9uIHBvaW50ZXJsZWF2ZShlKSB7XHJcbiAgICAvLyBpZ25vcmUgdGhlIGxlYXZlIG9uIG91cnNlbGYgd2UgZ2V0IGJlZm9yZSByZWxlYXNpbmcgdGhlIG1vdXNlIG92ZXIgb3Vyc2VsZlxyXG4gICAgLy8gYnkgZGVsYXlpbmcgc2VuZGluZyB0aGUgZXZlbnQgYW5kIGhhdmluZyB0aGUgdXAgZXZlbnQgY2FuY2VsIHVzXHJcbiAgICBpZiAoIWRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncG9pbnRlcmxlYXZlIGlnbm9yZWQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBERFRvdWNoLnBvaW50ZXJMZWF2ZVRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIEREVG91Y2gucG9pbnRlckxlYXZlVGltZW91dDtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncG9pbnRlcmxlYXZlIGRlbGF5ZWQnKTtcclxuICAgICAgICBzaW11bGF0ZVBvaW50ZXJNb3VzZUV2ZW50KGUsICdtb3VzZWxlYXZlJyk7XHJcbiAgICB9LCAxMCk7XHJcbn1cclxuZXhwb3J0cy5wb2ludGVybGVhdmUgPSBwb2ludGVybGVhdmU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLXRvdWNoLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogZ3JpZHN0YWNrLWVuZ2luZS50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjAyMiBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5HcmlkU3RhY2tFbmdpbmUgPSB2b2lkIDA7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuLyoqXHJcbiAqIERlZmluZXMgdGhlIEdyaWRTdGFjayBlbmdpbmUgdGhhdCBkb2VzIG1vc3Qgbm8gRE9NIGdyaWQgbWFuaXB1bGF0aW9uLlxyXG4gKiBTZWUgR3JpZFN0YWNrIG1ldGhvZHMgYW5kIHZhcnMgZm9yIGRlc2NyaXB0aW9ucy5cclxuICpcclxuICogTk9URTogdmFsdWVzIHNob3VsZCBub3QgYmUgbW9kaWZpZWQgZGlyZWN0bHkgLSBjYWxsIHRoZSBtYWluIEdyaWRTdGFjayBBUEkgaW5zdGVhZFxyXG4gKi9cclxuY2xhc3MgR3JpZFN0YWNrRW5naW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xyXG4gICAgICAgIHRoaXMuYWRkZWROb2RlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlZE5vZGVzID0gW107XHJcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBvcHRzLmNvbHVtbiB8fCAxMjtcclxuICAgICAgICB0aGlzLm1heFJvdyA9IG9wdHMubWF4Um93O1xyXG4gICAgICAgIHRoaXMuX2Zsb2F0ID0gb3B0cy5mbG9hdDtcclxuICAgICAgICB0aGlzLm5vZGVzID0gb3B0cy5ub2RlcyB8fCBbXTtcclxuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gb3B0cy5vbkNoYW5nZTtcclxuICAgIH1cclxuICAgIGJhdGNoVXBkYXRlKGZsYWcgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5iYXRjaE1vZGUgPT09IGZsYWcpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHRoaXMuYmF0Y2hNb2RlID0gZmxhZztcclxuICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmV2RmxvYXQgPSB0aGlzLl9mbG9hdDtcclxuICAgICAgICAgICAgdGhpcy5fZmxvYXQgPSB0cnVlOyAvLyBsZXQgdGhpbmdzIGdvIGFueXdoZXJlIGZvciBub3cuLi4gd2lsbCByZXN0b3JlIGFuZCBwb3NzaWJseSByZXBvc2l0aW9uIGxhdGVyXHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZUluaXRpYWwoKTsgLy8gc2luY2UgYmVnaW4gdXBkYXRlICh3aGljaCBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMpIHdvbid0IGRvIHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0ID0gdGhpcy5fcHJldkZsb2F0O1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHJldkZsb2F0O1xyXG4gICAgICAgICAgICB0aGlzLl9wYWNrTm9kZXMoKS5fbm90aWZ5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8gdXNlIGVudGlyZSByb3cgZm9yIGhpdHRpbmcgYXJlYSAod2lsbCB1c2UgYm90dG9tIHJldmVyc2Ugc29ydGVkIGZpcnN0KSBpZiB3ZSBub3QgYWN0aXZlbHkgbW92aW5nIERPV04gYW5kIGRpZG4ndCBhbHJlYWR5IHNraXBcclxuICAgIF91c2VFbnRpcmVSb3dBcmVhKG5vZGUsIG5uKSB7XHJcbiAgICAgICAgcmV0dXJuICghdGhpcy5mbG9hdCB8fCB0aGlzLmJhdGNoTW9kZSAmJiAhdGhpcy5fcHJldkZsb2F0KSAmJiAhdGhpcy5faGFzTG9ja2VkICYmICghbm9kZS5fbW92aW5nIHx8IG5vZGUuX3NraXBEb3duIHx8IG5uLnkgPD0gbm9kZS55KTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgZml4IGNvbGxpc2lvbiBvbiBnaXZlbiAnbm9kZScsIGdvaW5nIHRvIGdpdmVuIG5ldyBsb2NhdGlvbiAnbm4nLCB3aXRoIG9wdGlvbmFsICdjb2xsaWRlJyBub2RlIGFscmVhZHkgZm91bmQuXHJcbiAgICAgKiByZXR1cm4gdHJ1ZSBpZiB3ZSBtb3ZlZC4gKi9cclxuICAgIF9maXhDb2xsaXNpb25zKG5vZGUsIG5uID0gbm9kZSwgY29sbGlkZSwgb3B0ID0ge30pIHtcclxuICAgICAgICB0aGlzLnNvcnROb2RlcygtMSk7IC8vIGZyb20gbGFzdCB0byBmaXJzdCwgc28gcmVjdXJzaXZlIGNvbGxpc2lvbiBtb3ZlIGl0ZW1zIGluIHRoZSByaWdodCBvcmRlclxyXG4gICAgICAgIGNvbGxpZGUgPSBjb2xsaWRlIHx8IHRoaXMuY29sbGlkZShub2RlLCBubik7IC8vIFJFQUwgYXJlYSBjb2xsaWRlIGZvciBzd2FwIGFuZCBza2lwIGlmIG5vbmUuLi5cclxuICAgICAgICBpZiAoIWNvbGxpZGUpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyBzd2FwIGNoZWNrOiBpZiB3ZSdyZSBhY3RpdmVseSBtb3ZpbmcgaW4gZ3Jhdml0eSBtb2RlLCBzZWUgaWYgd2UgY29sbGlkZSB3aXRoIGFuIG9iamVjdCB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgaWYgKG5vZGUuX21vdmluZyAmJiAhb3B0Lm5lc3RlZCAmJiAhdGhpcy5mbG9hdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zd2FwKG5vZGUsIGNvbGxpZGUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGR1cmluZyB3aGlsZSgpIGNvbGxpc2lvbnMgTUFLRSBTVVJFIHRvIGNoZWNrIGVudGlyZSByb3cgc28gbGFyZ2VyIGl0ZW1zIGRvbid0IGxlYXAgZnJvZyBzbWFsbCBvbmVzIChwdXNoIHRoZW0gYWxsIGRvd24gc3RhcnRpbmcgbGFzdCBpbiBncmlkKVxyXG4gICAgICAgIGxldCBhcmVhID0gbm47XHJcbiAgICAgICAgaWYgKHRoaXMuX3VzZUVudGlyZVJvd0FyZWEobm9kZSwgbm4pKSB7XHJcbiAgICAgICAgICAgIGFyZWEgPSB7IHg6IDAsIHc6IHRoaXMuY29sdW1uLCB5OiBubi55LCBoOiBubi5oIH07XHJcbiAgICAgICAgICAgIGNvbGxpZGUgPSB0aGlzLmNvbGxpZGUobm9kZSwgYXJlYSwgb3B0LnNraXApOyAvLyBmb3JjZSBuZXcgaGl0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaWRNb3ZlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5ld09wdCA9IHsgbmVzdGVkOiB0cnVlLCBwYWNrOiBmYWxzZSB9O1xyXG4gICAgICAgIHdoaWxlIChjb2xsaWRlID0gY29sbGlkZSB8fCB0aGlzLmNvbGxpZGUobm9kZSwgYXJlYSwgb3B0LnNraXApKSB7IC8vIGNvdWxkIGNvbGxpZGUgd2l0aCBtb3JlIHRoYW4gMSBpdGVtLi4uIHNvIHJlcGVhdCBmb3IgZWFjaFxyXG4gICAgICAgICAgICBsZXQgbW92ZWQ7XHJcbiAgICAgICAgICAgIC8vIGlmIGNvbGxpZGluZyB3aXRoIGEgbG9ja2VkIGl0ZW0gT1IgbW92aW5nIGRvd24gd2l0aCB0b3AgZ3Jhdml0eSAoYW5kIGNvbGxpZGUgY291bGQgbW92ZSB1cCkgLT4gc2tpcCBwYXN0IHRoZSBjb2xsaWRlLFxyXG4gICAgICAgICAgICAvLyBidXQgcmVtZW1iZXIgdGhhdCBza2lwIGRvd24gc28gd2Ugb25seSBkbyB0aGlzIG9uY2UgKGFuZCBwdXNoIG90aGVycyBvdGhlcndpc2UpLlxyXG4gICAgICAgICAgICBpZiAoY29sbGlkZS5sb2NrZWQgfHwgbm9kZS5fbW92aW5nICYmICFub2RlLl9za2lwRG93biAmJiBubi55ID4gbm9kZS55ICYmICF0aGlzLmZsb2F0ICYmXHJcbiAgICAgICAgICAgICAgICAvLyBjYW4gdGFrZSBzcGFjZSB3ZSBoYWQsIG9yIGJlZm9yZSB3aGVyZSB3ZSdyZSBnb2luZ1xyXG4gICAgICAgICAgICAgICAgKCF0aGlzLmNvbGxpZGUoY29sbGlkZSwgT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBjb2xsaWRlKSwgeyB5OiBub2RlLnkgfSksIG5vZGUpIHx8ICF0aGlzLmNvbGxpZGUoY29sbGlkZSwgT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBjb2xsaWRlKSwgeyB5OiBubi55IC0gY29sbGlkZS5oIH0pLCBub2RlKSkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuX3NraXBEb3duID0gKG5vZGUuX3NraXBEb3duIHx8IG5uLnkgPiBub2RlLnkpO1xyXG4gICAgICAgICAgICAgICAgbW92ZWQgPSB0aGlzLm1vdmVOb2RlKG5vZGUsIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBubiksIHsgeTogY29sbGlkZS55ICsgY29sbGlkZS5oIH0pLCBuZXdPcHQpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlLmxvY2tlZCAmJiBtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhubiwgbm9kZSk7IC8vIG1vdmluZyBhZnRlciBsb2NrIGJlY29tZSBvdXIgbmV3IGRlc2lyZWQgbG9jYXRpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFjb2xsaWRlLmxvY2tlZCAmJiBtb3ZlZCAmJiBvcHQucGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIG1vdmVkIGFmdGVyIGFuZCB3aWxsIHBhY2s6IGRvIGl0IG5vdyBhbmQga2VlcCB0aGUgb3JpZ2luYWwgZHJvcCBsb2NhdGlvbiwgYnV0IHBhc3QgdGhlIG9sZCBjb2xsaWRlIHRvIHNlZSB3aGF0IGVsc2Ugd2UgbWlnaHQgcHVzaCB3YXlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYWNrTm9kZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBubi55ID0gY29sbGlkZS55ICsgY29sbGlkZS5oO1xyXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhub2RlLCBubik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkaWRNb3ZlID0gZGlkTW92ZSB8fCBtb3ZlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG1vdmUgY29sbGlkZSBkb3duICphZnRlciogd2hlcmUgd2Ugd2lsbCBiZSwgaWdub3Jpbmcgd2hlcmUgd2UgYXJlIG5vdyAoZG9uJ3QgY29sbGlkZSB3aXRoIHVzKVxyXG4gICAgICAgICAgICAgICAgbW92ZWQgPSB0aGlzLm1vdmVOb2RlKGNvbGxpZGUsIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBjb2xsaWRlKSwgeyB5OiBubi55ICsgbm4uaCwgc2tpcDogbm9kZSB9KSwgbmV3T3B0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpZE1vdmU7XHJcbiAgICAgICAgICAgIH0gLy8gYnJlYWsgaW5mIGxvb3AgaWYgd2UgY291bGRuJ3QgbW92ZSBhZnRlciBhbGwgKGV4OiBtYXhSb3csIGZpeGVkKVxyXG4gICAgICAgICAgICBjb2xsaWRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGlkTW92ZTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm4gdGhlIG5vZGVzIHRoYXQgaW50ZXJjZXB0IHRoZSBnaXZlbiBub2RlLiBPcHRpb25hbGx5IGEgZGlmZmVyZW50IGFyZWEgY2FuIGJlIHVzZWQsIGFzIHdlbGwgYXMgYSBzZWNvbmQgbm9kZSB0byBza2lwICovXHJcbiAgICBjb2xsaWRlKHNraXAsIGFyZWEgPSBza2lwLCBza2lwMikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzLmZpbmQobiA9PiBuICE9PSBza2lwICYmIG4gIT09IHNraXAyICYmIHV0aWxzXzEuVXRpbHMuaXNJbnRlcmNlcHRlZChuLCBhcmVhKSk7XHJcbiAgICB9XHJcbiAgICBjb2xsaWRlQWxsKHNraXAsIGFyZWEgPSBza2lwLCBza2lwMikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzLmZpbHRlcihuID0+IG4gIT09IHNraXAgJiYgbiAhPT0gc2tpcDIgJiYgdXRpbHNfMS5VdGlscy5pc0ludGVyY2VwdGVkKG4sIGFyZWEpKTtcclxuICAgIH1cclxuICAgIC8qKiBkb2VzIGEgcGl4ZWwgY292ZXJhZ2UgY29sbGlzaW9uIGJhc2VkIG9uIHdoZXJlIHdlIHN0YXJ0ZWQsIHJldHVybmluZyB0aGUgbm9kZSB0aGF0IGhhcyB0aGUgbW9zdCBjb3ZlcmFnZSB0aGF0IGlzID41MCUgbWlkIGxpbmUgKi9cclxuICAgIGRpcmVjdGlvbkNvbGxpZGVDb3ZlcmFnZShub2RlLCBvLCBjb2xsaWRlcykge1xyXG4gICAgICAgIGlmICghby5yZWN0IHx8ICFub2RlLl9yZWN0KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0IHIwID0gbm9kZS5fcmVjdDsgLy8gd2hlcmUgc3RhcnRlZFxyXG4gICAgICAgIGxldCByID0gT2JqZWN0LmFzc2lnbih7fSwgby5yZWN0KTsgLy8gd2hlcmUgd2UgYXJlXHJcbiAgICAgICAgLy8gdXBkYXRlIGRyYWdnZWQgcmVjdCB0byBzaG93IHdoZXJlIGl0J3MgY29taW5nIGZyb20gKGFib3ZlIG9yIGJlbG93LCBldGMuLi4pXHJcbiAgICAgICAgaWYgKHIueSA+IHIwLnkpIHtcclxuICAgICAgICAgICAgci5oICs9IHIueSAtIHIwLnk7XHJcbiAgICAgICAgICAgIHIueSA9IHIwLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByLmggKz0gcjAueSAtIHIueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHIueCA+IHIwLngpIHtcclxuICAgICAgICAgICAgci53ICs9IHIueCAtIHIwLng7XHJcbiAgICAgICAgICAgIHIueCA9IHIwLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByLncgKz0gcjAueCAtIHIueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbGxpZGU7XHJcbiAgICAgICAgY29sbGlkZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgaWYgKG4ubG9ja2VkIHx8ICFuLl9yZWN0KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgcjIgPSBuLl9yZWN0OyAvLyBvdmVybGFwcGluZyB0YXJnZXRcclxuICAgICAgICAgICAgbGV0IHlPdmVyID0gTnVtYmVyLk1BWF9WQUxVRSwgeE92ZXIgPSBOdW1iZXIuTUFYX1ZBTFVFLCBvdmVyTWF4ID0gMC41OyAvLyBuZWVkID41MCVcclxuICAgICAgICAgICAgLy8gZGVwZW5kaW5nIG9uIHdoaWNoIHNpZGUgd2Ugc3RhcnRlZCBmcm9tLCBjb21wdXRlIHRoZSBvdmVybGFwICUgb2YgY292ZXJhZ2VcclxuICAgICAgICAgICAgLy8gKGV4OiBmcm9tIGFib3ZlL2JlbG93IHdlIG9ubHkgY29tcHV0ZSB0aGUgbWF4IGhvcml6b250YWwgbGluZSBjb3ZlcmFnZSlcclxuICAgICAgICAgICAgaWYgKHIwLnkgPCByMi55KSB7IC8vIGZyb20gYWJvdmVcclxuICAgICAgICAgICAgICAgIHlPdmVyID0gKChyLnkgKyByLmgpIC0gcjIueSkgLyByMi5oO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHIwLnkgKyByMC5oID4gcjIueSArIHIyLmgpIHsgLy8gZnJvbSBiZWxvd1xyXG4gICAgICAgICAgICAgICAgeU92ZXIgPSAoKHIyLnkgKyByMi5oKSAtIHIueSkgLyByMi5oO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyMC54IDwgcjIueCkgeyAvLyBmcm9tIHRoZSBsZWZ0XHJcbiAgICAgICAgICAgICAgICB4T3ZlciA9ICgoci54ICsgci53KSAtIHIyLngpIC8gcjIudztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyMC54ICsgcjAudyA+IHIyLnggKyByMi53KSB7IC8vIGZyb20gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICB4T3ZlciA9ICgocjIueCArIHIyLncpIC0gci54KSAvIHIyLnc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG92ZXIgPSBNYXRoLm1pbih4T3ZlciwgeU92ZXIpO1xyXG4gICAgICAgICAgICBpZiAob3ZlciA+IG92ZXJNYXgpIHtcclxuICAgICAgICAgICAgICAgIG92ZXJNYXggPSBvdmVyO1xyXG4gICAgICAgICAgICAgICAgY29sbGlkZSA9IG47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBvLmNvbGxpZGUgPSBjb2xsaWRlOyAvLyBzYXZlIGl0IHNvIHdlIGRvbid0IGhhdmUgdG8gZmluZCBpdCBhZ2FpblxyXG4gICAgICAgIHJldHVybiBjb2xsaWRlO1xyXG4gICAgfVxyXG4gICAgLyoqIGRvZXMgYSBwaXhlbCBjb3ZlcmFnZSByZXR1cm5pbmcgdGhlIG5vZGUgdGhhdCBoYXMgdGhlIG1vc3QgY292ZXJhZ2UgYnkgYXJlYSAqL1xyXG4gICAgLypcclxuICAgIHByb3RlY3RlZCBjb2xsaWRlQ292ZXJhZ2UocjogR3JpZFN0YWNrUG9zaXRpb24sIGNvbGxpZGVzOiBHcmlkU3RhY2tOb2RlW10pOiB7Y29sbGlkZTogR3JpZFN0YWNrTm9kZSwgb3ZlcjogbnVtYmVyfSB7XHJcbiAgICAgIGxldCBjb2xsaWRlOiBHcmlkU3RhY2tOb2RlO1xyXG4gICAgICBsZXQgb3Zlck1heCA9IDA7XHJcbiAgICAgIGNvbGxpZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgaWYgKG4ubG9ja2VkIHx8ICFuLl9yZWN0KSByZXR1cm47XHJcbiAgICAgICAgbGV0IG92ZXIgPSBVdGlscy5hcmVhSW50ZXJjZXB0KHIsIG4uX3JlY3QpO1xyXG4gICAgICAgIGlmIChvdmVyID4gb3Zlck1heCkge1xyXG4gICAgICAgICAgb3Zlck1heCA9IG92ZXI7XHJcbiAgICAgICAgICBjb2xsaWRlID0gbjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4ge2NvbGxpZGUsIG92ZXI6IG92ZXJNYXh9O1xyXG4gICAgfVxyXG4gICAgKi9cclxuICAgIC8qKiBjYWxsZWQgdG8gY2FjaGUgdGhlIG5vZGVzIHBpeGVsIHJlY3RhbmdsZXMgdXNlZCBmb3IgY29sbGlzaW9uIGRldGVjdGlvbiBkdXJpbmcgZHJhZyAqL1xyXG4gICAgY2FjaGVSZWN0cyh3LCBoLCB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQpIHtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiBuLl9yZWN0ID0ge1xyXG4gICAgICAgICAgICB5OiBuLnkgKiBoICsgdG9wLFxyXG4gICAgICAgICAgICB4OiBuLnggKiB3ICsgbGVmdCxcclxuICAgICAgICAgICAgdzogbi53ICogdyAtIGxlZnQgLSByaWdodCxcclxuICAgICAgICAgICAgaDogbi5oICogaCAtIHRvcCAtIGJvdHRvbVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIGNhbGxlZCB0byBwb3NzaWJseSBzd2FwIGJldHdlZW4gMiBub2RlcyAoc2FtZSBzaXplIG9yIGNvbHVtbiwgbm90IGxvY2tlZCwgdG91Y2hpbmcpLCByZXR1cm5pbmcgdHJ1ZSBpZiBzdWNjZXNzZnVsICovXHJcbiAgICBzd2FwKGEsIGIpIHtcclxuICAgICAgICBpZiAoIWIgfHwgYi5sb2NrZWQgfHwgIWEgfHwgYS5sb2NrZWQpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBmdW5jdGlvbiBfZG9Td2FwKCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGIueCwgeSA9IGIueTtcclxuICAgICAgICAgICAgYi54ID0gYS54O1xyXG4gICAgICAgICAgICBiLnkgPSBhLnk7IC8vIGIgLT4gYSBwb3NpdGlvblxyXG4gICAgICAgICAgICBpZiAoYS5oICE9IGIuaCkge1xyXG4gICAgICAgICAgICAgICAgYS54ID0geDtcclxuICAgICAgICAgICAgICAgIGEueSA9IGIueSArIGIuaDsgLy8gYSAtPiBnb2VzIGFmdGVyIGJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChhLncgIT0gYi53KSB7XHJcbiAgICAgICAgICAgICAgICBhLnggPSBiLnggKyBiLnc7XHJcbiAgICAgICAgICAgICAgICBhLnkgPSB5OyAvLyBhIC0+IGdvZXMgYWZ0ZXIgYlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYS54ID0geDtcclxuICAgICAgICAgICAgICAgIGEueSA9IHk7IC8vIGEgLT4gb2xkIGIgcG9zaXRpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhLl9kaXJ0eSA9IGIuX2RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0b3VjaGluZzsgLy8gcmVtZW1iZXIgaWYgd2UgY2FsbGVkIGl0ICh2cyB1bmRlZmluZWQpXHJcbiAgICAgICAgLy8gc2FtZSBzaXplIGFuZCBzYW1lIHJvdyBvciBjb2x1bW4sIGFuZCB0b3VjaGluZ1xyXG4gICAgICAgIGlmIChhLncgPT09IGIudyAmJiBhLmggPT09IGIuaCAmJiAoYS54ID09PSBiLnggfHwgYS55ID09PSBiLnkpICYmICh0b3VjaGluZyA9IHV0aWxzXzEuVXRpbHMuaXNUb3VjaGluZyhhLCBiKSkpXHJcbiAgICAgICAgICAgIHJldHVybiBfZG9Td2FwKCk7XHJcbiAgICAgICAgaWYgKHRvdWNoaW5nID09PSBmYWxzZSlcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBJRkYgcmFuIHRlc3QgYW5kIGZhaWwsIGJhaWwgb3V0XHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIHRha2luZyBzYW1lIGNvbHVtbnMgKGJ1dCBkaWZmZXJlbnQgaGVpZ2h0KSBhbmQgdG91Y2hpbmdcclxuICAgICAgICBpZiAoYS53ID09PSBiLncgJiYgYS54ID09PSBiLnggJiYgKHRvdWNoaW5nIHx8ICh0b3VjaGluZyA9IHV0aWxzXzEuVXRpbHMuaXNUb3VjaGluZyhhLCBiKSkpKSB7XHJcbiAgICAgICAgICAgIGlmIChiLnkgPCBhLnkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gYTtcclxuICAgICAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICAgICAgYiA9IHQ7XHJcbiAgICAgICAgICAgIH0gLy8gc3dhcCBhIDwtPiBiIHZhcnMgc28gYSBpcyBmaXJzdFxyXG4gICAgICAgICAgICByZXR1cm4gX2RvU3dhcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodG91Y2hpbmcgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgdGFraW5nIHNhbWUgcm93IChidXQgZGlmZmVyZW50IHdpZHRoKSBhbmQgdG91Y2hpbmdcclxuICAgICAgICBpZiAoYS5oID09PSBiLmggJiYgYS55ID09PSBiLnkgJiYgKHRvdWNoaW5nIHx8ICh0b3VjaGluZyA9IHV0aWxzXzEuVXRpbHMuaXNUb3VjaGluZyhhLCBiKSkpKSB7XHJcbiAgICAgICAgICAgIGlmIChiLnggPCBhLngpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gYTtcclxuICAgICAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICAgICAgYiA9IHQ7XHJcbiAgICAgICAgICAgIH0gLy8gc3dhcCBhIDwtPiBiIHZhcnMgc28gYSBpcyBmaXJzdFxyXG4gICAgICAgICAgICByZXR1cm4gX2RvU3dhcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpc0FyZWFFbXB0eSh4LCB5LCB3LCBoKSB7XHJcbiAgICAgICAgbGV0IG5uID0geyB4OiB4IHx8IDAsIHk6IHkgfHwgMCwgdzogdyB8fCAxLCBoOiBoIHx8IDEgfTtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY29sbGlkZShubik7XHJcbiAgICB9XHJcbiAgICAvKiogcmUtbGF5b3V0IGdyaWQgaXRlbXMgdG8gcmVjbGFpbSBhbnkgZW1wdHkgc3BhY2UgKi9cclxuICAgIGNvbXBhY3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB0aGlzLmJhdGNoVXBkYXRlKClcclxuICAgICAgICAgICAgLnNvcnROb2RlcygpO1xyXG4gICAgICAgIGxldCBjb3B5Tm9kZXMgPSB0aGlzLm5vZGVzO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBbXTsgLy8gcHJldGVuZCB3ZSBoYXZlIG5vIG5vZGVzIHRvIGNvbmZsaWN0IGxheW91dCB0byBzdGFydCB3aXRoLi4uXHJcbiAgICAgICAgY29weU5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghbm9kZS5sb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuYXV0b1Bvc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFkZE5vZGUobm9kZSwgZmFsc2UpOyAvLyAnZmFsc2UnIGZvciBhZGQgZXZlbnQgdHJpZ2dlclxyXG4gICAgICAgICAgICBub2RlLl9kaXJ0eSA9IHRydWU7IC8vIHdpbGwgZm9yY2UgYXR0ciB1cGRhdGVcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5iYXRjaFVwZGF0ZShmYWxzZSk7XHJcbiAgICB9XHJcbiAgICAvKiogZW5hYmxlL2Rpc2FibGUgZmxvYXRpbmcgd2lkZ2V0cyAoZGVmYXVsdDogYGZhbHNlYCkgU2VlIFtleGFtcGxlXShodHRwOi8vZ3JpZHN0YWNranMuY29tL2RlbW8vZmxvYXQuaHRtbCkgKi9cclxuICAgIHNldCBmbG9hdCh2YWwpIHtcclxuICAgICAgICBpZiAodGhpcy5fZmxvYXQgPT09IHZhbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2Zsb2F0ID0gdmFsIHx8IGZhbHNlO1xyXG4gICAgICAgIGlmICghdmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhY2tOb2RlcygpLl9ub3RpZnkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogZmxvYXQgZ2V0dGVyIG1ldGhvZCAqL1xyXG4gICAgZ2V0IGZsb2F0KCkgeyByZXR1cm4gdGhpcy5fZmxvYXQgfHwgZmFsc2U7IH1cclxuICAgIC8qKiBzb3J0IHRoZSBub2RlcyBhcnJheSBmcm9tIGZpcnN0IHRvIGxhc3QsIG9yIHJldmVyc2UuIENhbGxlZCBkdXJpbmcgY29sbGlzaW9uL3BsYWNlbWVudCB0byBmb3JjZSBhbiBvcmRlciAqL1xyXG4gICAgc29ydE5vZGVzKGRpcikge1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSB1dGlsc18xLlV0aWxzLnNvcnQodGhpcy5ub2RlcywgZGlyLCB0aGlzLmNvbHVtbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB0byB0b3AgZ3Jhdml0eSBwYWNrIHRoZSBpdGVtcyBiYWNrIE9SIHJldmVydCBiYWNrIHRvIG9yaWdpbmFsIFkgcG9zaXRpb25zIHdoZW4gZmxvYXRpbmcgKi9cclxuICAgIF9wYWNrTm9kZXMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmF0Y2hNb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvcnROb2RlcygpOyAvLyBmaXJzdCB0byBsYXN0XHJcbiAgICAgICAgaWYgKHRoaXMuZmxvYXQpIHtcclxuICAgICAgICAgICAgLy8gcmVzdG9yZSBvcmlnaW5hbCBZIHBvc1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobi5fdXBkYXRpbmcgfHwgbi5fb3JpZyA9PT0gdW5kZWZpbmVkIHx8IG4ueSA9PT0gbi5fb3JpZy55KVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdZID0gbi55O1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld1kgPiBuLl9vcmlnLnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAtLW5ld1k7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbGxpZGUgPSB0aGlzLmNvbGxpZGUobiwgeyB4OiBuLngsIHk6IG5ld1ksIHc6IG4udywgaDogbi5oIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29sbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuLl9kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ueSA9IG5ld1k7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHRvcCBncmF2aXR5IHBhY2tcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChuLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobi5sb2NrZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKG4ueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3WSA9IGkgPT09IDAgPyAwIDogbi55IC0gMTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2FuQmVNb3ZlZCA9IGkgPT09IDAgfHwgIXRoaXMuY29sbGlkZShuLCB7IHg6IG4ueCwgeTogbmV3WSwgdzogbi53LCBoOiBuLmggfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYW5CZU1vdmVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBtdXN0IGJlIGRpcnR5IChmcm9tIGxhc3QgcG9zaXRpb24pIGZvciBHcmlkU3RhY2s6Ok9uQ2hhbmdlIENCIHRvIHVwZGF0ZSBwb3NpdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAvLyBhbmQgbW92ZSBpdGVtcyBiYWNrLiBUaGUgdXNlciAnY2hhbmdlJyBDQiBzaG91bGQgZGV0ZWN0IGNoYW5nZXMgZnJvbSB0aGUgb3JpZ2luYWxcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdGFydGluZyBwb3NpdGlvbiBpbnN0ZWFkLlxyXG4gICAgICAgICAgICAgICAgICAgIG4uX2RpcnR5ID0gKG4ueSAhPT0gbmV3WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbi55ID0gbmV3WTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnaXZlbiBhIHJhbmRvbSBub2RlLCBtYWtlcyBzdXJlIGl0J3MgY29vcmRpbmF0ZXMvdmFsdWVzIGFyZSB2YWxpZCBpbiB0aGUgY3VycmVudCBncmlkXHJcbiAgICAgKiBAcGFyYW0gbm9kZSB0byBhZGp1c3RcclxuICAgICAqIEBwYXJhbSByZXNpemluZyBpZiBvdXQgb2YgYm91bmQsIHJlc2l6ZSBkb3duIG9yIG1vdmUgaW50byB0aGUgZ3JpZCB0byBmaXQgP1xyXG4gICAgICovXHJcbiAgICBwcmVwYXJlTm9kZShub2RlLCByZXNpemluZykge1xyXG4gICAgICAgIG5vZGUgPSBub2RlIHx8IHt9O1xyXG4gICAgICAgIG5vZGUuX2lkID0gbm9kZS5faWQgfHwgR3JpZFN0YWNrRW5naW5lLl9pZFNlcSsrO1xyXG4gICAgICAgIC8vIGlmIHdlJ3JlIG1pc3NpbmcgcG9zaXRpb24sIGhhdmUgdGhlIGdyaWQgcG9zaXRpb24gdXMgYXV0b21hdGljYWxseSAoYmVmb3JlIHdlIHNldCB0aGVtIHRvIDAsMClcclxuICAgICAgICBpZiAobm9kZS54ID09PSB1bmRlZmluZWQgfHwgbm9kZS55ID09PSB1bmRlZmluZWQgfHwgbm9kZS54ID09PSBudWxsIHx8IG5vZGUueSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBub2RlLmF1dG9Qb3NpdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFzc2lnbiBkZWZhdWx0cyBmb3IgbWlzc2luZyByZXF1aXJlZCBmaWVsZHNcclxuICAgICAgICBsZXQgZGVmYXVsdHMgPSB7IHg6IDAsIHk6IDAsIHc6IDEsIGg6IDEgfTtcclxuICAgICAgICB1dGlsc18xLlV0aWxzLmRlZmF1bHRzKG5vZGUsIGRlZmF1bHRzKTtcclxuICAgICAgICBpZiAoIW5vZGUuYXV0b1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLmF1dG9Qb3NpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFub2RlLm5vUmVzaXplKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLm5vUmVzaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW5vZGUubm9Nb3ZlKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLm5vTW92ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIE5hTiAoaW4gY2FzZSBtZXNzZWQgdXAgc3RyaW5ncyB3ZXJlIHBhc3NlZC4gY2FuJ3QgZG8gcGFyc2VJbnQoKSB8fCBkZWZhdWx0cy54IGFib3ZlIGFzIDAgaXMgdmFsaWQgIylcclxuICAgICAgICBpZiAodHlwZW9mIG5vZGUueCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBub2RlLnggPSBOdW1iZXIobm9kZS54KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlLnkgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbm9kZS55ID0gTnVtYmVyKG5vZGUueSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZS53ID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IE51bWJlcihub2RlLncpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG5vZGUuaCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBub2RlLmggPSBOdW1iZXIobm9kZS5oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKG5vZGUueCkpIHtcclxuICAgICAgICAgICAgbm9kZS54ID0gZGVmYXVsdHMueDtcclxuICAgICAgICAgICAgbm9kZS5hdXRvUG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4obm9kZS55KSkge1xyXG4gICAgICAgICAgICBub2RlLnkgPSBkZWZhdWx0cy55O1xyXG4gICAgICAgICAgICBub2RlLmF1dG9Qb3NpdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTihub2RlLncpKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IGRlZmF1bHRzLnc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTihub2RlLmgpKSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IGRlZmF1bHRzLmg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVCb3VuZEZpeChub2RlLCByZXNpemluZyk7XHJcbiAgICB9XHJcbiAgICAvKiogcGFydDIgb2YgcHJlcGFyaW5nIGEgbm9kZSB0byBmaXQgaW5zaWRlIG91ciBncmlkIC0gY2hlY2tzIGZvciB4LHksdyBmcm9tIGdyaWQgZGltZW5zaW9ucyAqL1xyXG4gICAgbm9kZUJvdW5kRml4KG5vZGUsIHJlc2l6aW5nKSB7XHJcbiAgICAgICAgbGV0IGJlZm9yZSA9IG5vZGUuX29yaWcgfHwgdXRpbHNfMS5VdGlscy5jb3B5UG9zKHt9LCBub2RlKTtcclxuICAgICAgICBpZiAobm9kZS5tYXhXKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IE1hdGgubWluKG5vZGUudywgbm9kZS5tYXhXKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUubWF4SCkge1xyXG4gICAgICAgICAgICBub2RlLmggPSBNYXRoLm1pbihub2RlLmgsIG5vZGUubWF4SCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLm1pblcgJiYgbm9kZS5taW5XIDw9IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IE1hdGgubWF4KG5vZGUudywgbm9kZS5taW5XKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUubWluSCkge1xyXG4gICAgICAgICAgICBub2RlLmggPSBNYXRoLm1heChub2RlLmgsIG5vZGUubWluSCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHVzZXIgbG9hZGVkIGEgbGFyZ2VyIHRoYW4gYWxsb3dlZCB3aWRnZXQgZm9yIGN1cnJlbnQgIyBvZiBjb2x1bW5zIChvciBmb3JjZSAxIGNvbHVtbiBtb2RlKSxcclxuICAgICAgICAvLyByZW1lbWJlciBpdCdzIHBvc2l0aW9uICYgd2lkdGggc28gd2UgY2FuIHJlc3RvcmUgYmFjayAoMSAtPiAxMiBjb2x1bW4pICMxNjU1ICMxOTg1XHJcbiAgICAgICAgLy8gSUZGIHdlJ3JlIG5vdCBpbiB0aGUgbWlkZGxlIG9mIGNvbHVtbiByZXNpemluZyFcclxuICAgICAgICBjb25zdCBzYXZlT3JpZyA9IHRoaXMuY29sdW1uID09PSAxIHx8IG5vZGUueCArIG5vZGUudyA+IHRoaXMuY29sdW1uO1xyXG4gICAgICAgIGlmIChzYXZlT3JpZyAmJiB0aGlzLmNvbHVtbiA8IDEyICYmICF0aGlzLl9pbkNvbHVtblJlc2l6ZSAmJiBub2RlLl9pZCAmJiB0aGlzLmZpbmRDYWNoZUxheW91dChub2RlLCAxMikgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGxldCBjb3B5ID0gT2JqZWN0LmFzc2lnbih7fSwgbm9kZSk7IC8vIG5lZWQgX2lkICsgcG9zaXRpb25zXHJcbiAgICAgICAgICAgIGlmIChjb3B5LmF1dG9Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvcHkueDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb3B5Lnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29weS54ID0gTWF0aC5taW4oMTEsIGNvcHkueCk7XHJcbiAgICAgICAgICAgIGNvcHkudyA9IE1hdGgubWluKDEyLCBjb3B5LncpO1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlT25lTGF5b3V0KGNvcHksIDEyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUudyA+IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IHRoaXMuY29sdW1uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChub2RlLncgPCAxKSB7XHJcbiAgICAgICAgICAgIG5vZGUudyA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1heFJvdyAmJiBub2RlLmggPiB0aGlzLm1heFJvdykge1xyXG4gICAgICAgICAgICBub2RlLmggPSB0aGlzLm1heFJvdztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobm9kZS5oIDwgMSkge1xyXG4gICAgICAgICAgICBub2RlLmggPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS54IDwgMCkge1xyXG4gICAgICAgICAgICBub2RlLnggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS55IDwgMCkge1xyXG4gICAgICAgICAgICBub2RlLnkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS54ICsgbm9kZS53ID4gdGhpcy5jb2x1bW4pIHtcclxuICAgICAgICAgICAgaWYgKHJlc2l6aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLncgPSB0aGlzLmNvbHVtbiAtIG5vZGUueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vZGUueCA9IHRoaXMuY29sdW1uIC0gbm9kZS53O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1heFJvdyAmJiBub2RlLnkgKyBub2RlLmggPiB0aGlzLm1heFJvdykge1xyXG4gICAgICAgICAgICBpZiAocmVzaXppbmcpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuaCA9IHRoaXMubWF4Um93IC0gbm9kZS55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9kZS55ID0gdGhpcy5tYXhSb3cgLSBub2RlLmg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF1dGlsc18xLlV0aWxzLnNhbWVQb3Mobm9kZSwgYmVmb3JlKSkge1xyXG4gICAgICAgICAgICBub2RlLl9kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybnMgYSBsaXN0IG9mIG1vZGlmaWVkIG5vZGVzIGZyb20gdGhlaXIgb3JpZ2luYWwgdmFsdWVzICovXHJcbiAgICBnZXREaXJ0eU5vZGVzKHZlcmlmeSkge1xyXG4gICAgICAgIC8vIGNvbXBhcmUgb3JpZ2luYWwgeCx5LHcsaCBpbnN0ZWFkIGFzIF9kaXJ0eSBjYW4gYmUgYSB0ZW1wb3Jhcnkgc3RhdGVcclxuICAgICAgICBpZiAodmVyaWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGVzLmZpbHRlcihuID0+IG4uX2RpcnR5ICYmICF1dGlsc18xLlV0aWxzLnNhbWVQb3Mobiwgbi5fb3JpZykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlcy5maWx0ZXIobiA9PiBuLl9kaXJ0eSk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGwgdGhpcyB0byBjYWxsIG9uQ2hhbmdlIGNhbGxiYWNrIHdpdGggZGlydHkgbm9kZXMgc28gRE9NIGNhbiBiZSB1cGRhdGVkICovXHJcbiAgICBfbm90aWZ5KHJlbW92ZWROb2Rlcykge1xyXG4gICAgICAgIGlmICh0aGlzLmJhdGNoTW9kZSB8fCAhdGhpcy5vbkNoYW5nZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IGRpcnR5Tm9kZXMgPSAocmVtb3ZlZE5vZGVzIHx8IFtdKS5jb25jYXQodGhpcy5nZXREaXJ0eU5vZGVzKCkpO1xyXG4gICAgICAgIHRoaXMub25DaGFuZ2UoZGlydHlOb2Rlcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHJlbW92ZSBkaXJ0eSBhbmQgbGFzdCB0cmllZCBpbmZvICovXHJcbiAgICBjbGVhbk5vZGVzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJhdGNoTW9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICBkZWxldGUgbi5fZGlydHk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLl9sYXN0VHJpZWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB0byBzYXZlIGluaXRpYWwgcG9zaXRpb24vc2l6ZSB0byB0cmFjayByZWFsIGRpcnR5IHN0YXRlLlxyXG4gICAgICogTm90ZTogc2hvdWxkIGJlIGNhbGxlZCByaWdodCBhZnRlciB3ZSBjYWxsIGNoYW5nZSBldmVudCAoc28gbmV4dCBBUEkgaXMgY2FuIGRldGVjdCBjaGFuZ2VzKVxyXG4gICAgICogYXMgd2VsbCBhcyByaWdodCBiZWZvcmUgd2Ugc3RhcnQgbW92ZS9yZXNpemUvZW50ZXIgKHNvIHdlIGNhbiByZXN0b3JlIGl0ZW1zIHRvIHByZXYgdmFsdWVzKSAqL1xyXG4gICAgc2F2ZUluaXRpYWwoKSB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICBuLl9vcmlnID0gdXRpbHNfMS5VdGlscy5jb3B5UG9zKHt9LCBuKTtcclxuICAgICAgICAgICAgZGVsZXRlIG4uX2RpcnR5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2hhc0xvY2tlZCA9IHRoaXMubm9kZXMuc29tZShuID0+IG4ubG9ja2VkKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmVzdG9yZSBhbGwgdGhlIG5vZGVzIGJhY2sgdG8gaW5pdGlhbCB2YWx1ZXMgKGNhbGxlZCB3aGVuIHdlIGxlYXZlKSAqL1xyXG4gICAgcmVzdG9yZUluaXRpYWwoKSB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICBpZiAodXRpbHNfMS5VdGlscy5zYW1lUG9zKG4sIG4uX29yaWcpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmNvcHlQb3Mobiwgbi5fb3JpZyk7XHJcbiAgICAgICAgICAgIG4uX2RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9ub3RpZnkoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBmaW5kIHRoZSBmaXJzdCBhdmFpbGFibGUgZW1wdHkgc3BvdCBmb3IgdGhlIGdpdmVuIG5vZGUgd2lkdGgvaGVpZ2h0LCB1cGRhdGluZyB0aGUgeCx5IGF0dHJpYnV0ZXMuIHJldHVybiB0cnVlIGlmIGZvdW5kLlxyXG4gICAgICogb3B0aW9uYWxseSB5b3UgY2FuIHBhc3MgeW91ciBvd24gZXhpc3Rpbmcgbm9kZSBsaXN0IGFuZCBjb2x1bW4gY291bnQsIG90aGVyd2lzZSBkZWZhdWx0cyB0byB0aGF0IGVuZ2luZSBkYXRhLlxyXG4gICAgICovXHJcbiAgICBmaW5kRW1wdHlQb3NpdGlvbihub2RlLCBub2RlTGlzdCA9IHRoaXMubm9kZXMsIGNvbHVtbiA9IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgbm9kZUxpc3QgPSB1dGlsc18xLlV0aWxzLnNvcnQobm9kZUxpc3QsIC0xLCBjb2x1bW4pO1xyXG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyAhZm91bmQ7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IGkgJSBjb2x1bW47XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gY29sdW1uKTtcclxuICAgICAgICAgICAgaWYgKHggKyBub2RlLncgPiBjb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBib3ggPSB7IHgsIHksIHc6IG5vZGUudywgaDogbm9kZS5oIH07XHJcbiAgICAgICAgICAgIGlmICghbm9kZUxpc3QuZmluZChuID0+IHV0aWxzXzEuVXRpbHMuaXNJbnRlcmNlcHRlZChib3gsIG4pKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS54ID0geDtcclxuICAgICAgICAgICAgICAgIG5vZGUueSA9IHk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5hdXRvUG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG4gICAgLyoqIGNhbGwgdG8gYWRkIHRoZSBnaXZlbiBub2RlIHRvIG91ciBsaXN0LCBmaXhpbmcgY29sbGlzaW9uIGFuZCByZS1wYWNraW5nICovXHJcbiAgICBhZGROb2RlKG5vZGUsIHRyaWdnZXJBZGRFdmVudCA9IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IGR1cCA9IHRoaXMubm9kZXMuZmluZChuID0+IG4uX2lkID09PSBub2RlLl9pZCk7XHJcbiAgICAgICAgaWYgKGR1cClcclxuICAgICAgICAgICAgcmV0dXJuIGR1cDsgLy8gcHJldmVudCBpbnNlcnRpbmcgdHdpY2UhIHJldHVybiBpdCBpbnN0ZWFkLlxyXG4gICAgICAgIC8vIHNraXAgcHJlcGFyZU5vZGUgaWYgd2UncmUgaW4gbWlkZGxlIG9mIGNvbHVtbiByZXNpemUgKG5vdCBuZXcpIGJ1dCBkbyBjaGVjayBmb3IgYm91bmRzIVxyXG4gICAgICAgIG5vZGUgPSB0aGlzLl9pbkNvbHVtblJlc2l6ZSA/IHRoaXMubm9kZUJvdW5kRml4KG5vZGUpIDogdGhpcy5wcmVwYXJlTm9kZShub2RlKTtcclxuICAgICAgICBkZWxldGUgbm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZDtcclxuICAgICAgICBkZWxldGUgbm9kZS5fcmVtb3ZlRE9NO1xyXG4gICAgICAgIGlmIChub2RlLmF1dG9Qb3NpdGlvbiAmJiB0aGlzLmZpbmRFbXB0eVBvc2l0aW9uKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLmF1dG9Qb3NpdGlvbjsgLy8gZm91bmQgb3VyIHNsb3RcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIGlmICh0cmlnZ2VyQWRkRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRlZE5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2ZpeENvbGxpc2lvbnMobm9kZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJhdGNoTW9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYWNrTm9kZXMoKS5fbm90aWZ5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlTm9kZShub2RlLCByZW1vdmVET00gPSB0cnVlLCB0cmlnZ2VyRXZlbnQgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5ub2Rlcy5maW5kKG4gPT4gbiA9PT0gbm9kZSkpIHtcclxuICAgICAgICAgICAgLy8gVEVTVCBjb25zb2xlLmxvZyhgRXJyb3I6IEdyaWRTdGFja0VuZ2luZS5yZW1vdmVOb2RlKCkgbm9kZS5faWQ9JHtub2RlLl9pZH0gbm90IGZvdW5kIWApXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHJpZ2dlckV2ZW50KSB7IC8vIHdlIHdhaXQgdW50aWwgZmluYWwgZHJvcCB0byBtYW51YWxseSB0cmFjayByZW1vdmVkIGl0ZW1zIChyYXRoZXIgdGhhbiBkdXJpbmcgZHJhZylcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlbW92ZURPTSlcclxuICAgICAgICAgICAgbm9kZS5fcmVtb3ZlRE9NID0gdHJ1ZTsgLy8gbGV0IENCIHJlbW92ZSBhY3R1YWwgSFRNTCAodXNlZCB0byBzZXQgX2lkIHRvIG51bGwsIGJ1dCB0aGVuIHdlIGxvb3NlIGxheW91dCBpbmZvKVxyXG4gICAgICAgIC8vIGRvbid0IHVzZSAnZmFzdGVyJyAuc3BsaWNlKGZpbmRJbmRleCgpLDEpIGluIGNhc2Ugbm9kZSBpc24ndCBpbiBvdXIgbGlzdCwgb3IgaW4gbXVsdGlwbGUgdGltZXMuXHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMubm9kZXMuZmlsdGVyKG4gPT4gbiAhPT0gbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhY2tOb2RlcygpXHJcbiAgICAgICAgICAgIC5fbm90aWZ5KFtub2RlXSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVBbGwocmVtb3ZlRE9NID0gdHJ1ZSkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9sYXlvdXRzO1xyXG4gICAgICAgIGlmICh0aGlzLm5vZGVzLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgcmVtb3ZlRE9NICYmIHRoaXMubm9kZXMuZm9yRWFjaChuID0+IG4uX3JlbW92ZURPTSA9IHRydWUpOyAvLyBsZXQgQ0IgcmVtb3ZlIGFjdHVhbCBIVE1MICh1c2VkIHRvIHNldCBfaWQgdG8gbnVsbCwgYnV0IHRoZW4gd2UgbG9vc2UgbGF5b3V0IGluZm8pXHJcbiAgICAgICAgdGhpcy5yZW1vdmVkTm9kZXMgPSB0aGlzLm5vZGVzO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBbXTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbm90aWZ5KHRoaXMucmVtb3ZlZE5vZGVzKTtcclxuICAgIH1cclxuICAgIC8qKiBjaGVja3MgaWYgaXRlbSBjYW4gYmUgbW92ZWQgKGxheW91dCBjb25zdHJhaW4pIHZzIG1vdmVOb2RlKCksIHJldHVybmluZyB0cnVlIGlmIHdhcyBhYmxlIHRvIG1vdmUuXHJcbiAgICAgKiBJbiBtb3JlIGNvbXBsaWNhdGVkIGNhc2VzIChtYXhSb3cpIGl0IHdpbGwgYXR0ZW1wdCBhdCBtb3ZpbmcgdGhlIGl0ZW0gYW5kIGZpeGluZ1xyXG4gICAgICogb3RoZXJzIGluIGEgY2xvbmUgZmlyc3QsIHRoZW4gYXBwbHkgdGhvc2UgY2hhbmdlcyBpZiBzdGlsbCB3aXRoaW4gc3BlY3MuICovXHJcbiAgICBtb3ZlTm9kZUNoZWNrKG5vZGUsIG8pIHtcclxuICAgICAgICAvLyBpZiAobm9kZS5sb2NrZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAoIXRoaXMuY2hhbmdlZFBvc0NvbnN0cmFpbihub2RlLCBvKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIG8ucGFjayA9IHRydWU7XHJcbiAgICAgICAgLy8gc2ltcGxlciBjYXNlOiBtb3ZlIGl0ZW0gZGlyZWN0bHkuLi5cclxuICAgICAgICBpZiAoIXRoaXMubWF4Um93KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVOb2RlKG5vZGUsIG8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb21wbGV4IGNhc2U6IGNyZWF0ZSBhIGNsb25lIHdpdGggTk8gbWF4Um93ICh3aWxsIGNoZWNrIGZvciBvdXQgb2YgYm91bmRzIGF0IHRoZSBlbmQpXHJcbiAgICAgICAgbGV0IGNsb25lZE5vZGU7XHJcbiAgICAgICAgbGV0IGNsb25lID0gbmV3IEdyaWRTdGFja0VuZ2luZSh7XHJcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5jb2x1bW4sXHJcbiAgICAgICAgICAgIGZsb2F0OiB0aGlzLmZsb2F0LFxyXG4gICAgICAgICAgICBub2RlczogdGhpcy5ub2Rlcy5tYXAobiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobiA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb25lZE5vZGUgPSBPYmplY3QuYXNzaWduKHt9LCBuKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVkTm9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBuKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIWNsb25lZE5vZGUpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyBjaGVjayBpZiB3ZSdyZSBjb3ZlcmluZyA1MCUgY29sbGlzaW9uIGFuZCBjb3VsZCBtb3ZlXHJcbiAgICAgICAgbGV0IGNhbk1vdmUgPSBjbG9uZS5tb3ZlTm9kZShjbG9uZWROb2RlLCBvKSAmJiBjbG9uZS5nZXRSb3coKSA8PSB0aGlzLm1heFJvdztcclxuICAgICAgICAvLyBlbHNlIGNoZWNrIGlmIHdlIGNhbiBmb3JjZSBhIHN3YXAgKGZsb2F0PXRydWUsIG9yIGRpZmZlcmVudCBzaGFwZXMpIG9uIG5vbi1yZXNpemVcclxuICAgICAgICBpZiAoIWNhbk1vdmUgJiYgIW8ucmVzaXppbmcgJiYgby5jb2xsaWRlKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xsaWRlID0gby5jb2xsaWRlLmVsLmdyaWRzdGFja05vZGU7IC8vIGZpbmQgdGhlIHNvdXJjZSBub2RlIHRoZSBjbG9uZSBjb2xsaWRlZCB3aXRoIGF0IDUwJVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zd2FwKG5vZGUsIGNvbGxpZGUpKSB7IC8vIHN3YXBzIGFuZCBtYXJrIGRpcnR5XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnkoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY2FuTW92ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vIGlmIGNsb25lIHdhcyBhYmxlIHRvIG1vdmUsIGNvcHkgdGhvc2UgbW9kcyBvdmVyIHRvIHVzIG5vdyBpbnN0ZWFkIG9mIGNhbGxlciB0cnlpbmcgdG8gZG8gdGhpcyBhbGwgb3ZlciFcclxuICAgICAgICAvLyBOb3RlOiB3ZSBjYW4ndCB1c2UgdGhlIGxpc3QgZGlyZWN0bHkgYXMgZWxlbWVudHMgYW5kIG90aGVyIHBhcnRzIHBvaW50IHRvIGFjdHVhbCBub2RlLCBzbyBjb3B5IGNvbnRlbnRcclxuICAgICAgICBjbG9uZS5ub2Rlcy5maWx0ZXIobiA9PiBuLl9kaXJ0eSkuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLm5vZGVzLmZpbmQoYSA9PiBhLl9pZCA9PT0gYy5faWQpO1xyXG4gICAgICAgICAgICBpZiAoIW4pXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhuLCBjKTtcclxuICAgICAgICAgICAgbi5fZGlydHkgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX25vdGlmeSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybiB0cnVlIGlmIGNhbiBmaXQgaW4gZ3JpZCBoZWlnaHQgY29uc3RyYWluIG9ubHkgKGFsd2F5cyB0cnVlIGlmIG5vIG1heFJvdykgKi9cclxuICAgIHdpbGxJdEZpdChub2RlKSB7XHJcbiAgICAgICAgZGVsZXRlIG5vZGUuX3dpbGxGaXRQb3M7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1heFJvdylcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgLy8gY3JlYXRlIGEgY2xvbmUgd2l0aCBOTyBtYXhSb3cgYW5kIGNoZWNrIGlmIHN0aWxsIHdpdGhpbiBzaXplXHJcbiAgICAgICAgbGV0IGNsb25lID0gbmV3IEdyaWRTdGFja0VuZ2luZSh7XHJcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5jb2x1bW4sXHJcbiAgICAgICAgICAgIGZsb2F0OiB0aGlzLmZsb2F0LFxyXG4gICAgICAgICAgICBub2RlczogdGhpcy5ub2Rlcy5tYXAobiA9PiB7IHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBuKTsgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbiA9IE9iamVjdC5hc3NpZ24oe30sIG5vZGUpOyAvLyBjbG9uZSBub2RlIHNvIHdlIGRvbid0IG1vZCBhbnkgc2V0dGluZ3Mgb24gaXQgYnV0IGhhdmUgZnVsbCBhdXRvUG9zaXRpb24gYW5kIG1pbi9tYXggYXMgd2VsbCEgIzE2ODdcclxuICAgICAgICB0aGlzLmNsZWFudXBOb2RlKG4pO1xyXG4gICAgICAgIGRlbGV0ZSBuLmVsO1xyXG4gICAgICAgIGRlbGV0ZSBuLl9pZDtcclxuICAgICAgICBkZWxldGUgbi5jb250ZW50O1xyXG4gICAgICAgIGRlbGV0ZSBuLmdyaWQ7XHJcbiAgICAgICAgY2xvbmUuYWRkTm9kZShuKTtcclxuICAgICAgICBpZiAoY2xvbmUuZ2V0Um93KCkgPD0gdGhpcy5tYXhSb3cpIHtcclxuICAgICAgICAgICAgbm9kZS5fd2lsbEZpdFBvcyA9IHV0aWxzXzEuVXRpbHMuY29weVBvcyh7fSwgbik7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvKiogdHJ1ZSBpZiB4LHkgb3IgdyxoIGFyZSBkaWZmZXJlbnQgYWZ0ZXIgY2xhbXBpbmcgdG8gbWluL21heCAqL1xyXG4gICAgY2hhbmdlZFBvc0NvbnN0cmFpbihub2RlLCBwKSB7XHJcbiAgICAgICAgLy8gZmlyc3QgbWFrZSBzdXJlIHcsaCBhcmUgc2V0IGZvciBjYWxsZXJcclxuICAgICAgICBwLncgPSBwLncgfHwgbm9kZS53O1xyXG4gICAgICAgIHAuaCA9IHAuaCB8fCBub2RlLmg7XHJcbiAgICAgICAgaWYgKG5vZGUueCAhPT0gcC54IHx8IG5vZGUueSAhPT0gcC55KVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAvLyBjaGVjayBjb25zdHJhaW5lZCB3LGhcclxuICAgICAgICBpZiAobm9kZS5tYXhXKSB7XHJcbiAgICAgICAgICAgIHAudyA9IE1hdGgubWluKHAudywgbm9kZS5tYXhXKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUubWF4SCkge1xyXG4gICAgICAgICAgICBwLmggPSBNYXRoLm1pbihwLmgsIG5vZGUubWF4SCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLm1pblcpIHtcclxuICAgICAgICAgICAgcC53ID0gTWF0aC5tYXgocC53LCBub2RlLm1pblcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5taW5IKSB7XHJcbiAgICAgICAgICAgIHAuaCA9IE1hdGgubWF4KHAuaCwgbm9kZS5taW5IKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChub2RlLncgIT09IHAudyB8fCBub2RlLmggIT09IHAuaCk7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJuIHRydWUgaWYgdGhlIHBhc3NlZCBpbiBub2RlIHdhcyBhY3R1YWxseSBtb3ZlZCAoY2hlY2tzIGZvciBuby1vcCBhbmQgbG9ja2VkKSAqL1xyXG4gICAgbW92ZU5vZGUobm9kZSwgbykge1xyXG4gICAgICAgIHZhciBfYSwgX2I7XHJcbiAgICAgICAgaWYgKCFub2RlIHx8IC8qbm9kZS5sb2NrZWQgfHwqLyAhbylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGxldCB3YXNVbmRlZmluZWRQYWNrO1xyXG4gICAgICAgIGlmIChvLnBhY2sgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB3YXNVbmRlZmluZWRQYWNrID0gby5wYWNrID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc3RyYWluIHRoZSBwYXNzZWQgaW4gdmFsdWVzIGFuZCBjaGVjayBpZiB3ZSdyZSBzdGlsbCBjaGFuZ2luZyBvdXIgbm9kZVxyXG4gICAgICAgIGlmICh0eXBlb2Ygby54ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBvLnggPSBub2RlLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygby55ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBvLnkgPSBub2RlLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygby53ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBvLncgPSBub2RlLnc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygby5oICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBvLmggPSBub2RlLmg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXNpemluZyA9IChub2RlLncgIT09IG8udyB8fCBub2RlLmggIT09IG8uaCk7XHJcbiAgICAgICAgbGV0IG5uID0gdXRpbHNfMS5VdGlscy5jb3B5UG9zKHt9LCBub2RlLCB0cnVlKTsgLy8gZ2V0IG1pbi9tYXggb3V0IGZpcnN0LCB0aGVuIG9wdCBwb3NpdGlvbnMgbmV4dFxyXG4gICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhubiwgbyk7XHJcbiAgICAgICAgbm4gPSB0aGlzLm5vZGVCb3VuZEZpeChubiwgcmVzaXppbmcpO1xyXG4gICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhvLCBubik7XHJcbiAgICAgICAgaWYgKHV0aWxzXzEuVXRpbHMuc2FtZVBvcyhub2RlLCBvKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGxldCBwcmV2UG9zID0gdXRpbHNfMS5VdGlscy5jb3B5UG9zKHt9LCBub2RlKTtcclxuICAgICAgICAvLyBjaGVjayBpZiB3ZSB3aWxsIG5lZWQgdG8gZml4IGNvbGxpc2lvbiBhdCBvdXIgbmV3IGxvY2F0aW9uXHJcbiAgICAgICAgbGV0IGNvbGxpZGVzID0gdGhpcy5jb2xsaWRlQWxsKG5vZGUsIG5uLCBvLnNraXApO1xyXG4gICAgICAgIGxldCBuZWVkVG9Nb3ZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAoY29sbGlkZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBhY3RpdmVEcmFnID0gbm9kZS5fbW92aW5nICYmICFvLm5lc3RlZDtcclxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHdlIGFjdHVhbGx5IGNvbGxpZGVkIG92ZXIgNTAlIHN1cmZhY2UgYXJlYSB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgICAgICBsZXQgY29sbGlkZSA9IGFjdGl2ZURyYWcgPyB0aGlzLmRpcmVjdGlvbkNvbGxpZGVDb3ZlcmFnZShub2RlLCBvLCBjb2xsaWRlcykgOiBjb2xsaWRlc1swXTtcclxuICAgICAgICAgICAgLy8gaWYgd2UncmUgZW5hYmxpbmcgY3JlYXRpb24gb2Ygc3ViLWdyaWRzIG9uIHRoZSBmbHksIHNlZSBpZiB3ZSdyZSBjb3ZlcmluZyA4MCUgb2YgZWl0aGVyIG9uZSwgaWYgd2UgZGlkbid0IGFscmVhZHkgZG8gdGhhdFxyXG4gICAgICAgICAgICBpZiAoYWN0aXZlRHJhZyAmJiBjb2xsaWRlICYmICgoX2IgPSAoX2EgPSBub2RlLmdyaWQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5vcHRzKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iuc3ViR3JpZER5bmFtaWMpICYmICFub2RlLmdyaWQuX2lzVGVtcCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXIgPSB1dGlsc18xLlV0aWxzLmFyZWFJbnRlcmNlcHQoby5yZWN0LCBjb2xsaWRlLl9yZWN0KTtcclxuICAgICAgICAgICAgICAgIGxldCBhMSA9IHV0aWxzXzEuVXRpbHMuYXJlYShvLnJlY3QpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGEyID0gdXRpbHNfMS5VdGlscy5hcmVhKGNvbGxpZGUuX3JlY3QpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBlcmMgPSBvdmVyIC8gKGExIDwgYTIgPyBhMSA6IGEyKTtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjID4gLjgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsaWRlLmdyaWQubWFrZVN1YkdyaWQoY29sbGlkZS5lbCwgdW5kZWZpbmVkLCBub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsaWRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2xsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICBuZWVkVG9Nb3ZlID0gIXRoaXMuX2ZpeENvbGxpc2lvbnMobm9kZSwgbm4sIGNvbGxpZGUsIG8pOyAvLyBjaGVjayBpZiBhbHJlYWR5IG1vdmVkLi4uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZWVkVG9Nb3ZlID0gZmFsc2U7IC8vIHdlIGRpZG4ndCBjb3ZlciA+NTAlIGZvciBhIG1vdmUsIHNraXAuLi5cclxuICAgICAgICAgICAgICAgIGlmICh3YXNVbmRlZmluZWRQYWNrKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvLnBhY2s7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbm93IG1vdmUgKHRvIHRoZSBvcmlnaW5hbCBhc2sgdnMgdGhlIGNvbGxpc2lvbiB2ZXJzaW9uIHdoaWNoIG1pZ2h0IGRpZmZlcikgYW5kIHJlcGFjayB0aGluZ3NcclxuICAgICAgICBpZiAobmVlZFRvTW92ZSkge1xyXG4gICAgICAgICAgICBub2RlLl9kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhub2RlLCBubik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvLnBhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcGFja05vZGVzKClcclxuICAgICAgICAgICAgICAgIC5fbm90aWZ5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAhdXRpbHNfMS5VdGlscy5zYW1lUG9zKG5vZGUsIHByZXZQb3MpOyAvLyBwYWNrIG1pZ2h0IGhhdmUgbW92ZWQgdGhpbmdzIGJhY2tcclxuICAgIH1cclxuICAgIGdldFJvdygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlcy5yZWR1Y2UoKHJvdywgbikgPT4gTWF0aC5tYXgocm93LCBuLnkgKyBuLmgpLCAwKTtcclxuICAgIH1cclxuICAgIGJlZ2luVXBkYXRlKG5vZGUpIHtcclxuICAgICAgICBpZiAoIW5vZGUuX3VwZGF0aW5nKSB7XHJcbiAgICAgICAgICAgIG5vZGUuX3VwZGF0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUuX3NraXBEb3duO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuYmF0Y2hNb2RlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlSW5pdGlhbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGVuZFVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgbiA9IHRoaXMubm9kZXMuZmluZChuID0+IG4uX3VwZGF0aW5nKTtcclxuICAgICAgICBpZiAobikge1xyXG4gICAgICAgICAgICBkZWxldGUgbi5fdXBkYXRpbmc7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLl9za2lwRG93bjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogc2F2ZXMgYSBjb3B5IG9mIHRoZSBsYXJnZXN0IGNvbHVtbiBsYXlvdXQgKGVnIDEyIGV2ZW4gd2hlbiByZW5kZXJpbmcgb25lQ29sdW1uTW9kZSkgc28gd2UgZG9uJ3QgbG9vc2Ugb3JpZyBsYXlvdXQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBsaXN0IG9mIHdpZGdldHMgZm9yIHNlcmlhbGl6YXRpb24gKi9cclxuICAgIHNhdmUoc2F2ZUVsZW1lbnQgPSB0cnVlKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIC8vIHVzZSB0aGUgaGlnaGVzdCBsYXlvdXQgZm9yIGFueSBzYXZlZCBpbmZvIHNvIHdlIGNhbiBoYXZlIGZ1bGwgZGV0YWlsIG9uIHJlbG9hZCAjMTg0OVxyXG4gICAgICAgIGxldCBsZW4gPSAoX2EgPSB0aGlzLl9sYXlvdXRzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoO1xyXG4gICAgICAgIGxldCBsYXlvdXQgPSBsZW4gJiYgdGhpcy5jb2x1bW4gIT09IChsZW4gLSAxKSA/IHRoaXMuX2xheW91dHNbbGVuIC0gMV0gOiBudWxsO1xyXG4gICAgICAgIGxldCBsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5zb3J0Tm9kZXMoKTtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIGxldCB3bCA9IGxheW91dCA9PT0gbnVsbCB8fCBsYXlvdXQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGxheW91dC5maW5kKGwgPT4gbC5faWQgPT09IG4uX2lkKTtcclxuICAgICAgICAgICAgbGV0IHcgPSBPYmplY3QuYXNzaWduKHt9LCBuKTtcclxuICAgICAgICAgICAgLy8gdXNlIGxheW91dCBpbmZvIGluc3RlYWQgaWYgc2V0XHJcbiAgICAgICAgICAgIGlmICh3bCkge1xyXG4gICAgICAgICAgICAgICAgdy54ID0gd2wueDtcclxuICAgICAgICAgICAgICAgIHcueSA9IHdsLnk7XHJcbiAgICAgICAgICAgICAgICB3LncgPSB3bC53O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlSW50ZXJuYWxGb3JTYXZlKHcsICFzYXZlRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxpc3QucHVzaCh3KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHdoZW5ldmVyIGEgbm9kZSBpcyBhZGRlZCBvciBtb3ZlZCAtIHVwZGF0ZXMgdGhlIGNhY2hlZCBsYXlvdXRzICovXHJcbiAgICBsYXlvdXRzTm9kZXNDaGFuZ2Uobm9kZXMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheW91dHMgfHwgdGhpcy5faW5Db2x1bW5SZXNpemUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIC8vIHJlbW92ZSBzbWFsbGVyIGxheW91dHMgLSB3ZSB3aWxsIHJlLWdlbmVyYXRlIHRob3NlIG9uIHRoZSBmbHkuLi4gbGFyZ2VyIG9uZXMgbmVlZCB0byB1cGRhdGVcclxuICAgICAgICB0aGlzLl9sYXlvdXRzLmZvckVhY2goKGxheW91dCwgY29sdW1uKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghbGF5b3V0IHx8IGNvbHVtbiA9PT0gdGhpcy5jb2x1bW4pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgaWYgKGNvbHVtbiA8IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXlvdXRzW2NvbHVtbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyB3ZSBzYXZlIHRoZSBvcmlnaW5hbCB4LHksdyAoaCBpc24ndCBjYWNoZWQpIHRvIHNlZSB3aGF0IGFjdHVhbGx5IGNoYW5nZWQgdG8gcHJvcGFnYXRlIGJldHRlci5cclxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIGRvbid0IG5lZWQgdG8gY2hlY2sgYWdhaW5zdCBvdXQgb2YgYm91bmQgc2NhbGluZy9tb3ZpbmcgYXMgdGhhdCB3aWxsIGJlIGRvbmUgd2hlbiB1c2luZyB0aG9zZSBjYWNoZSB2YWx1ZXMuICMxNzg1XHJcbiAgICAgICAgICAgICAgICBsZXQgcmF0aW8gPSBjb2x1bW4gLyB0aGlzLmNvbHVtbjtcclxuICAgICAgICAgICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLl9vcmlnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIGRpZG4ndCBjaGFuZ2UgKG5ld2x5IGFkZGVkID8pXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG4gPSBsYXlvdXQuZmluZChsID0+IGwuX2lkID09PSBub2RlLl9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIG5vIGNhY2hlIGZvciBuZXcgbm9kZXMuIFdpbGwgdXNlIHRob3NlIHZhbHVlcy5cclxuICAgICAgICAgICAgICAgICAgICAvLyBZIGNoYW5nZWQsIHB1c2ggZG93biBzYW1lIGFtb3VudFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGRldGVjdCBkb2luZyBpdGVtICdzd2Fwcycgd2lsbCBoZWxwIGluc3RlYWQgb2YgbW92ZSAoZXNwZWNpYWxseSBpbiAxIGNvbHVtbiBtb2RlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnkgIT09IG5vZGUuX29yaWcueSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuLnkgKz0gKG5vZGUueSAtIG5vZGUuX29yaWcueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFggY2hhbmdlZCwgc2NhbGUgZnJvbSBuZXcgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS54ICE9PSBub2RlLl9vcmlnLngpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbi54ID0gTWF0aC5yb3VuZChub2RlLnggKiByYXRpbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpZHRoIGNoYW5nZWQsIHNjYWxlIGZyb20gbmV3IHdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUudyAhPT0gbm9kZS5fb3JpZy53KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4udyA9IE1hdGgucm91bmQobm9kZS53ICogcmF0aW8pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAuLi5oZWlnaHQgYWx3YXlzIGNhcnJpZXMgb3ZlciBmcm9tIGNhY2hlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJuYWwgQ2FsbGVkIHRvIHNjYWxlIHRoZSB3aWRnZXQgd2lkdGggJiBwb3NpdGlvbiB1cC9kb3duIGJhc2VkIG9uIHRoZSBjb2x1bW4gY2hhbmdlLlxyXG4gICAgICogTm90ZSB3ZSBzdG9yZSBwcmV2aW91cyBsYXlvdXRzIChlc3BlY2lhbGx5IG9yaWdpbmFsIG9uZXMpIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gZ29cclxuICAgICAqIGZyb20gc2F5IDEyIC0+IDEgLT4gMTIgYW5kIGdldCBiYWNrIHRvIHdoZXJlIHdlIHdlcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHByZXZDb2x1bW4gcHJldmlvdXMgbnVtYmVyIG9mIGNvbHVtbnNcclxuICAgICAqIEBwYXJhbSBjb2x1bW4gIG5ldyBjb2x1bW4gbnVtYmVyXHJcbiAgICAgKiBAcGFyYW0gbm9kZXMgZGlmZmVyZW50IHNvcnRlZCBsaXN0IChleDogRE9NIG9yZGVyKSBpbnN0ZWFkIG9mIGN1cnJlbnQgbGlzdFxyXG4gICAgICogQHBhcmFtIGxheW91dCBzcGVjaWZ5IHRoZSB0eXBlIG9mIHJlLWxheW91dCB0aGF0IHdpbGwgaGFwcGVuIChwb3NpdGlvbiwgc2l6ZSwgZXRjLi4uKS5cclxuICAgICAqIE5vdGU6IGl0ZW1zIHdpbGwgbmV2ZXIgYmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBjb2x1bW4gYm91bmRhcmllcy4gZGVmYXVsdCAobW92ZVNjYWxlKS4gSWdub3JlZCBmb3IgMSBjb2x1bW5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlTm9kZVdpZHRocyhwcmV2Q29sdW1uLCBjb2x1bW4sIG5vZGVzLCBsYXlvdXQgPSAnbW92ZVNjYWxlJykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBpZiAoIXRoaXMubm9kZXMubGVuZ3RoIHx8ICFjb2x1bW4gfHwgcHJldkNvbHVtbiA9PT0gY29sdW1uKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAvLyBjYWNoZSB0aGUgY3VycmVudCBsYXlvdXQgaW4gY2FzZSB0aGV5IHdhbnQgdG8gZ28gYmFjayAobGlrZSAxMiAtPiAxIC0+IDEyKSBhcyBpdCByZXF1aXJlcyBvcmlnaW5hbCBkYXRhXHJcbiAgICAgICAgdGhpcy5jYWNoZUxheW91dCh0aGlzLm5vZGVzLCBwcmV2Q29sdW1uKTtcclxuICAgICAgICB0aGlzLmJhdGNoVXBkYXRlKCk7IC8vIGRvIHRoaXMgRUFSTFkgYXMgaXQgd2lsbCBjYWxsIHNhdmVJbml0aWFsKCkgc28gd2UgY2FuIGRldGVjdCB3aGVyZSB3ZSBzdGFydGVkIGZvciBfZGlydHkgYW5kIGNvbGxpc2lvblxyXG4gICAgICAgIGxldCBuZXdOb2RlcyA9IFtdO1xyXG4gICAgICAgIC8vIGlmIHdlJ3JlIGdvaW5nIHRvIDEgY29sdW1uIGFuZCB1c2luZyBET00gb3JkZXIgcmF0aGVyIHRoYW4gZGVmYXVsdCBzb3J0aW5nLCB0aGVuIGdlbmVyYXRlIHRoYXQgbGF5b3V0XHJcbiAgICAgICAgbGV0IGRvbU9yZGVyID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGNvbHVtbiA9PT0gMSAmJiAobm9kZXMgPT09IG51bGwgfHwgbm9kZXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGVzLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgZG9tT3JkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICBsZXQgdG9wID0gMDtcclxuICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgICAgIG4ueCA9IDA7XHJcbiAgICAgICAgICAgICAgICBuLncgPSAxO1xyXG4gICAgICAgICAgICAgICAgbi55ID0gTWF0aC5tYXgobi55LCB0b3ApO1xyXG4gICAgICAgICAgICAgICAgdG9wID0gbi55ICsgbi5oO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmV3Tm9kZXMgPSBub2RlcztcclxuICAgICAgICAgICAgbm9kZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5vZGVzID0gdXRpbHNfMS5VdGlscy5zb3J0KHRoaXMubm9kZXMsIC0xLCBwcmV2Q29sdW1uKTsgLy8gY3VycmVudCBjb2x1bW4gcmV2ZXJzZSBzb3J0aW5nIHNvIHdlIGNhbiBpbnNlcnQgbGFzdCB0byBmcm9udCAobGltaXQgY29sbGlzaW9uKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZWUgaWYgd2UgaGF2ZSBjYWNoZWQgcHJldmlvdXMgbGF5b3V0IElGRiB3ZSBhcmUgZ29pbmcgdXAgaW4gc2l6ZSAocmVzdG9yZSkgb3RoZXJ3aXNlIGFsd2F5c1xyXG4gICAgICAgIC8vIGdlbmVyYXRlIG5leHQgc2l6ZSBkb3duIGZyb20gd2hlcmUgd2UgYXJlIChsb29rcyBtb3JlIG5hdHVyYWwgYXMgeW91IGdyYWR1YWxseSBzaXplIGRvd24pLlxyXG4gICAgICAgIGxldCBjYWNoZU5vZGVzID0gW107XHJcbiAgICAgICAgaWYgKGNvbHVtbiA+IHByZXZDb2x1bW4pIHtcclxuICAgICAgICAgICAgY2FjaGVOb2RlcyA9IHRoaXMuX2xheW91dHNbY29sdW1uXSB8fCBbXTtcclxuICAgICAgICAgICAgLy8gLi4uaWYgbm90LCBzdGFydCB3aXRoIHRoZSBsYXJnZXN0IGxheW91dCAoaWYgbm90IGFscmVhZHkgdGhlcmUpIGFzIGRvd24tc2NhbGluZyBpcyBtb3JlIGFjY3VyYXRlXHJcbiAgICAgICAgICAgIC8vIGJ5IHByZXRlbmRpbmcgd2UgY2FtZSBmcm9tIHRoYXQgbGFyZ2VyIGNvbHVtbiBieSBhc3NpZ25pbmcgdGhvc2UgdmFsdWVzIGFzIHN0YXJ0aW5nIHBvaW50XHJcbiAgICAgICAgICAgIGxldCBsYXN0SW5kZXggPSB0aGlzLl9sYXlvdXRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGlmICghY2FjaGVOb2Rlcy5sZW5ndGggJiYgcHJldkNvbHVtbiAhPT0gbGFzdEluZGV4ICYmICgoX2EgPSB0aGlzLl9sYXlvdXRzW2xhc3RJbmRleF0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2Q29sdW1uID0gbGFzdEluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5b3V0c1tsYXN0SW5kZXhdLmZvckVhY2goY2FjaGVOb2RlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbiA9IG5vZGVzLmZpbmQobiA9PiBuLl9pZCA9PT0gY2FjaGVOb2RlLl9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RpbGwgY3VycmVudCwgdXNlIGNhY2hlIGluZm8gcG9zaXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ueCA9IGNhY2hlTm9kZS54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuLnkgPSBjYWNoZU5vZGUueTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbi53ID0gY2FjaGVOb2RlLnc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgd2UgZm91bmQgY2FjaGUgcmUtdXNlIHRob3NlIG5vZGVzIHRoYXQgYXJlIHN0aWxsIGN1cnJlbnRcclxuICAgICAgICBjYWNoZU5vZGVzLmZvckVhY2goY2FjaGVOb2RlID0+IHtcclxuICAgICAgICAgICAgbGV0IGogPSBub2Rlcy5maW5kSW5kZXgobiA9PiBuLl9pZCA9PT0gY2FjaGVOb2RlLl9pZCk7XHJcbiAgICAgICAgICAgIGlmIChqICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gc3RpbGwgY3VycmVudCwgdXNlIGNhY2hlIGluZm8gcG9zaXRpb25zXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGVOb2RlLmF1dG9Qb3NpdGlvbiB8fCBpc05hTihjYWNoZU5vZGUueCkgfHwgaXNOYU4oY2FjaGVOb2RlLnkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kRW1wdHlQb3NpdGlvbihjYWNoZU5vZGUsIG5ld05vZGVzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghY2FjaGVOb2RlLmF1dG9Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2pdLnggPSBjYWNoZU5vZGUueDtcclxuICAgICAgICAgICAgICAgICAgICBub2Rlc1tqXS55ID0gY2FjaGVOb2RlLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbal0udyA9IGNhY2hlTm9kZS53O1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld05vZGVzLnB1c2gobm9kZXNbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlKGosIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gLi4uYW5kIGFkZCBhbnkgZXh0cmEgbm9uLWNhY2hlZCBvbmVzXHJcbiAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxheW91dCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgbGF5b3V0KGNvbHVtbiwgcHJldkNvbHVtbiwgbmV3Tm9kZXMsIG5vZGVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghZG9tT3JkZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCByYXRpbyA9IGNvbHVtbiAvIHByZXZDb2x1bW47XHJcbiAgICAgICAgICAgICAgICBsZXQgbW92ZSA9IChsYXlvdXQgPT09ICdtb3ZlJyB8fCBsYXlvdXQgPT09ICdtb3ZlU2NhbGUnKTtcclxuICAgICAgICAgICAgICAgIGxldCBzY2FsZSA9IChsYXlvdXQgPT09ICdzY2FsZScgfHwgbGF5b3V0ID09PSAnbW92ZVNjYWxlJyk7XHJcbiAgICAgICAgICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHggKyB3IGNvdWxkIGJlIG91dHNpZGUgb2YgdGhlIGdyaWQsIGJ1dCBhZGROb2RlKCkgYmVsb3cgd2lsbCBoYW5kbGUgdGhhdFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUueCA9IChjb2x1bW4gPT09IDEgPyAwIDogKG1vdmUgPyBNYXRoLnJvdW5kKG5vZGUueCAqIHJhdGlvKSA6IE1hdGgubWluKG5vZGUueCwgY29sdW1uIC0gMSkpKTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLncgPSAoKGNvbHVtbiA9PT0gMSB8fCBwcmV2Q29sdW1uID09PSAxKSA/IDEgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZSA/IChNYXRoLnJvdW5kKG5vZGUudyAqIHJhdGlvKSB8fCAxKSA6IChNYXRoLm1pbihub2RlLncsIGNvbHVtbikpKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdOb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBub2RlcyA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmFsbHkgcmUtbGF5b3V0IHRoZW0gaW4gcmV2ZXJzZSBvcmRlciAodG8gZ2V0IGNvcnJlY3QgcGxhY2VtZW50KVxyXG4gICAgICAgIGlmICghZG9tT3JkZXIpXHJcbiAgICAgICAgICAgIG5ld05vZGVzID0gdXRpbHNfMS5VdGlscy5zb3J0KG5ld05vZGVzLCAtMSwgY29sdW1uKTtcclxuICAgICAgICB0aGlzLl9pbkNvbHVtblJlc2l6ZSA9IHRydWU7IC8vIHByZXZlbnQgY2FjaGUgdXBkYXRlXHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IFtdOyAvLyBwcmV0ZW5kIHdlIGhhdmUgbm8gbm9kZXMgdG8gc3RhcnQgd2l0aCAoYWRkKCkgd2lsbCB1c2Ugc2FtZSBzdHJ1Y3R1cmVzKSB0byBzaW1wbGlmeSBsYXlvdXRcclxuICAgICAgICBuZXdOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZE5vZGUobm9kZSwgZmFsc2UpOyAvLyAnZmFsc2UnIGZvciBhZGQgZXZlbnQgdHJpZ2dlclxyXG4gICAgICAgICAgICBkZWxldGUgbm9kZS5fb3JpZzsgLy8gbWFrZSBzdXJlIHRoZSBjb21taXQgZG9lc24ndCB0cnkgdG8gcmVzdG9yZSB0aGluZ3MgYmFjayB0byBvcmlnaW5hbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoZmFsc2UpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9pbkNvbHVtblJlc2l6ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY2FsbCB0byBjYWNoZSB0aGUgZ2l2ZW4gbGF5b3V0IGludGVybmFsbHkgdG8gdGhlIGdpdmVuIGxvY2F0aW9uIHNvIHdlIGNhbiByZXN0b3JlIGJhY2sgd2hlbiBjb2x1bW4gY2hhbmdlcyBzaXplXHJcbiAgICAgKiBAcGFyYW0gbm9kZXMgbGlzdCBvZiBub2Rlc1xyXG4gICAgICogQHBhcmFtIGNvbHVtbiBjb3JyZXNwb25kaW5nIGNvbHVtbiBpbmRleCB0byBzYXZlIGl0IHVuZGVyXHJcbiAgICAgKiBAcGFyYW0gY2xlYXIgaWYgdHJ1ZSwgd2lsbCBmb3JjZSBvdGhlciBjYWNoZXMgdG8gYmUgcmVtb3ZlZCAoZGVmYXVsdCBmYWxzZSlcclxuICAgICAqL1xyXG4gICAgY2FjaGVMYXlvdXQobm9kZXMsIGNvbHVtbiwgY2xlYXIgPSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBjb3B5ID0gW107XHJcbiAgICAgICAgbm9kZXMuZm9yRWFjaCgobiwgaSkgPT4ge1xyXG4gICAgICAgICAgICBuLl9pZCA9IG4uX2lkIHx8IEdyaWRTdGFja0VuZ2luZS5faWRTZXErKzsgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYW4gaWQgaW4gY2FzZSB0aGlzIGlzIG5ldyBsYXlvdXQsIGVsc2UgcmUtdXNlIGlkIGFscmVhZHkgc2V0XHJcbiAgICAgICAgICAgIGNvcHlbaV0gPSB7IHg6IG4ueCwgeTogbi55LCB3OiBuLncsIF9pZDogbi5faWQgfTsgLy8gb25seSB0aGluZyB3ZSBjaGFuZ2UgaXMgeCx5LHcgYW5kIGlkIHRvIGZpbmQgaXQgYmFja1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2xheW91dHMgPSBjbGVhciA/IFtdIDogdGhpcy5fbGF5b3V0cyB8fCBbXTsgLy8gdXNlIGFycmF5IHRvIGZpbmQgbGFyZ2VyIHF1aWNrXHJcbiAgICAgICAgdGhpcy5fbGF5b3V0c1tjb2x1bW5dID0gY29weTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY2FsbCB0byBjYWNoZSB0aGUgZ2l2ZW4gbm9kZSBsYXlvdXQgaW50ZXJuYWxseSB0byB0aGUgZ2l2ZW4gbG9jYXRpb24gc28gd2UgY2FuIHJlc3RvcmUgYmFjayB3aGVuIGNvbHVtbiBjaGFuZ2VzIHNpemVcclxuICAgICAqIEBwYXJhbSBub2RlIHNpbmdsZSBub2RlIHRvIGNhY2hlXHJcbiAgICAgKiBAcGFyYW0gY29sdW1uIGNvcnJlc3BvbmRpbmcgY29sdW1uIGluZGV4IHRvIHNhdmUgaXQgdW5kZXJcclxuICAgICAqL1xyXG4gICAgY2FjaGVPbmVMYXlvdXQobiwgY29sdW1uKSB7XHJcbiAgICAgICAgbi5faWQgPSBuLl9pZCB8fCBHcmlkU3RhY2tFbmdpbmUuX2lkU2VxKys7XHJcbiAgICAgICAgbGV0IGwgPSB7IHg6IG4ueCwgeTogbi55LCB3OiBuLncsIF9pZDogbi5faWQgfTtcclxuICAgICAgICBpZiAobi5hdXRvUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgZGVsZXRlIGwueDtcclxuICAgICAgICAgICAgZGVsZXRlIGwueTtcclxuICAgICAgICAgICAgbC5hdXRvUG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXlvdXRzID0gdGhpcy5fbGF5b3V0cyB8fCBbXTtcclxuICAgICAgICB0aGlzLl9sYXlvdXRzW2NvbHVtbl0gPSB0aGlzLl9sYXlvdXRzW2NvbHVtbl0gfHwgW107XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5maW5kQ2FjaGVMYXlvdXQobiwgY29sdW1uKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKVxyXG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRzW2NvbHVtbl0ucHVzaChsKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuX2xheW91dHNbY29sdW1uXVtpbmRleF0gPSBsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZmluZENhY2hlTGF5b3V0KG4sIGNvbHVtbikge1xyXG4gICAgICAgIHZhciBfYSwgX2IsIF9jO1xyXG4gICAgICAgIHJldHVybiAoX2MgPSAoX2IgPSAoX2EgPSB0aGlzLl9sYXlvdXRzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2FbY29sdW1uXSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmZpbmRJbmRleChsID0+IGwuX2lkID09PSBuLl9pZCkpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IC0xO1xyXG4gICAgfVxyXG4gICAgLyoqIGNhbGxlZCB0byByZW1vdmUgYWxsIGludGVybmFsIHZhbHVlcyBidXQgdGhlIF9pZCAqL1xyXG4gICAgY2xlYW51cE5vZGUobm9kZSkge1xyXG4gICAgICAgIGZvciAobGV0IHByb3AgaW4gbm9kZSkge1xyXG4gICAgICAgICAgICBpZiAocHJvcFswXSA9PT0gJ18nICYmIHByb3AgIT09ICdfaWQnKVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGVbcHJvcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuR3JpZFN0YWNrRW5naW5lID0gR3JpZFN0YWNrRW5naW5lO1xyXG4vKiogQGludGVybmFsIHVuaXF1ZSBnbG9iYWwgaW50ZXJuYWwgX2lkIGNvdW50ZXIgTk9UIHN0YXJ0aW5nIGF0IDAgKi9cclxuR3JpZFN0YWNrRW5naW5lLl9pZFNlcSA9IDE7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdyaWRzdGFjay1lbmdpbmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KSk7XHJcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkdyaWRTdGFjayA9IHZvaWQgMDtcclxuLyohXHJcbiAqIEdyaWRTdGFjayA3LjMuMFxyXG4gKiBodHRwczovL2dyaWRzdGFja2pzLmNvbS9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDIxLTIwMjIgQWxhaW4gRHVtZXNueVxyXG4gKiBzZWUgcm9vdCBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzL3RyZWUvbWFzdGVyL0xJQ0VOU0VcclxuICovXHJcbmNvbnN0IGdyaWRzdGFja19lbmdpbmVfMSA9IHJlcXVpcmUoXCIuL2dyaWRzdGFjay1lbmdpbmVcIik7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xyXG4vKlxyXG4gKiBhbmQgaW5jbHVkZSBEJkQgYnkgZGVmYXVsdFxyXG4gKiBUT0RPOiB3aGlsZSB3ZSBjb3VsZCBnZW5lcmF0ZSBhIGdyaWRzdGFjay1zdGF0aWMuanMgYXQgc21hbGxlciBzaXplIC0gc2F2ZXMgYWJvdXQgMzFrICg0MWsgLT4gNzJrKVxyXG4gKiBJIGRvbid0IGtub3cgaG93IHRvIGdlbmVyYXRlIHRoZSBERCBvbmx5IGNvZGUgYXQgdGhlIHJlbWFpbmluZyAzMWsgdG8gZGVsYXkgbG9hZCBhcyBjb2RlIGRlcGVuZHMgb24gR3JpZHN0YWNrLnRzXHJcbiAqIGFsc28gaXQgY2F1c2VkIGxvYWRpbmcgaXNzdWVzIGluIHByb2QgLSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvaXNzdWVzLzIwMzlcclxuICovXHJcbmNvbnN0IGRkX2dyaWRzdGFja18xID0gcmVxdWlyZShcIi4vZGQtZ3JpZHN0YWNrXCIpO1xyXG5jb25zdCBkZF90b3VjaF8xID0gcmVxdWlyZShcIi4vZGQtdG91Y2hcIik7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbi8qKiBnbG9iYWwgaW5zdGFuY2UgKi9cclxuY29uc3QgZGQgPSBuZXcgZGRfZ3JpZHN0YWNrXzEuRERHcmlkU3RhY2s7XHJcbi8vIGV4cG9ydCBhbGwgZGVwZW5kZW50IGZpbGUgYXMgd2VsbCB0byBtYWtlIGl0IGVhc2llciBmb3IgdXNlcnMgdG8ganVzdCBpbXBvcnQgdGhlIG1haW4gZmlsZVxyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vdHlwZXNcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vdXRpbHNcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZ3JpZHN0YWNrLWVuZ2luZVwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9kZC1ncmlkc3RhY2tcIiksIGV4cG9ydHMpO1xyXG4vKipcclxuICogTWFpbiBncmlkc3RhY2sgY2xhc3MgLSB5b3Ugd2lsbCBuZWVkIHRvIGNhbGwgYEdyaWRTdGFjay5pbml0KClgIGZpcnN0IHRvIGluaXRpYWxpemUgeW91ciBncmlkLlxyXG4gKiBOb3RlOiB5b3VyIGdyaWQgZWxlbWVudHMgTVVTVCBoYXZlIHRoZSBmb2xsb3dpbmcgY2xhc3NlcyBmb3IgdGhlIENTUyBsYXlvdXQgdG8gd29yazpcclxuICogQGV4YW1wbGVcclxuICogPGRpdiBjbGFzcz1cImdyaWQtc3RhY2tcIj5cclxuICogICA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtXCI+XHJcbiAqICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnRcIj5JdGVtIDE8L2Rpdj5cclxuICogICA8L2Rpdj5cclxuICogPC9kaXY+XHJcbiAqL1xyXG5jbGFzcyBHcmlkU3RhY2sge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSBncmlkIGl0ZW0gZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudCBhbmQgb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIGVsXHJcbiAgICAgKiBAcGFyYW0gb3B0c1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0cyA9IHt9KSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYjtcclxuICAgICAgICAvKiogQGludGVybmFsICovXHJcbiAgICAgICAgdGhpcy5fZ3NFdmVudEhhbmRsZXIgPSB7fTtcclxuICAgICAgICAvKiogQGludGVybmFsIGV4dHJhIHJvdyBhZGRlZCB3aGVuIGRyYWdnaW5nIGF0IHRoZSBib3R0b20gb2YgdGhlIGdyaWQgKi9cclxuICAgICAgICB0aGlzLl9leHRyYURyYWdSb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDsgLy8gZXhwb3NlZCBIVE1MIGVsZW1lbnQgdG8gdGhlIHVzZXJcclxuICAgICAgICBvcHRzID0gb3B0cyB8fCB7fTsgLy8gaGFuZGxlcyBudWxsL3VuZGVmaW5lZC8wXHJcbiAgICAgICAgaWYgKCFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2dyaWQtc3RhY2snKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2snKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgcm93IHByb3BlcnR5IGV4aXN0cywgcmVwbGFjZSBtaW5Sb3cgYW5kIG1heFJvdyBpbnN0ZWFkXHJcbiAgICAgICAgaWYgKG9wdHMucm93KSB7XHJcbiAgICAgICAgICAgIG9wdHMubWluUm93ID0gb3B0cy5tYXhSb3cgPSBvcHRzLnJvdztcclxuICAgICAgICAgICAgZGVsZXRlIG9wdHMucm93O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcm93QXR0ciA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1yb3cnKSk7XHJcbiAgICAgICAgLy8gZmxhZyBvbmx5IHZhbGlkIGluIHN1Yi1ncmlkcyAoaGFuZGxlZCBieSBwYXJlbnQsIG5vdCBoZXJlKVxyXG4gICAgICAgIGlmIChvcHRzLmNvbHVtbiA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRzLmNvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gJ21pbldpZHRoJyBsZWdhY3kgc3VwcG9ydCBpbiA1LjFcclxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xyXG4gICAgICAgIGxldCBhbnlPcHRzID0gb3B0cztcclxuICAgICAgICBpZiAoYW55T3B0cy5taW5XaWR0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIG9wdHMub25lQ29sdW1uU2l6ZSA9IG9wdHMub25lQ29sdW1uU2l6ZSB8fCBhbnlPcHRzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICBkZWxldGUgYW55T3B0cy5taW5XaWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2F2ZSBvcmlnaW5hbCBzZXR0aW5nIHNvIHdlIGNhbiByZXN0b3JlIG9uIHNhdmVcclxuICAgICAgICBpZiAob3B0cy5hbHdheXNTaG93UmVzaXplSGFuZGxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0cy5fYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZSA9IG9wdHMuYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZWxlbWVudHMgRE9NIGF0dHJpYnV0ZXMgb3ZlcnJpZGUgYW55IHBhc3NlZCBvcHRpb25zIChsaWtlIENTUyBzdHlsZSkgLSBtZXJnZSB0aGUgdHdvIHRvZ2V0aGVyXHJcbiAgICAgICAgbGV0IGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCB1dGlsc18xLlV0aWxzLmNsb25lRGVlcCh0eXBlc18xLmdyaWREZWZhdWx0cykpLCB7IGNvbHVtbjogdXRpbHNfMS5VdGlscy50b051bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2dzLWNvbHVtbicpKSB8fCB0eXBlc18xLmdyaWREZWZhdWx0cy5jb2x1bW4sIG1pblJvdzogcm93QXR0ciA/IHJvd0F0dHIgOiB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtbWluLXJvdycpKSB8fCB0eXBlc18xLmdyaWREZWZhdWx0cy5taW5Sb3csIG1heFJvdzogcm93QXR0ciA/IHJvd0F0dHIgOiB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtbWF4LXJvdycpKSB8fCB0eXBlc18xLmdyaWREZWZhdWx0cy5tYXhSb3csIHN0YXRpY0dyaWQ6IHV0aWxzXzEuVXRpbHMudG9Cb29sKGVsLmdldEF0dHJpYnV0ZSgnZ3Mtc3RhdGljJykpIHx8IHR5cGVzXzEuZ3JpZERlZmF1bHRzLnN0YXRpY0dyaWQsIGRyYWdnYWJsZToge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlOiAob3B0cy5oYW5kbGVDbGFzcyA/ICcuJyArIG9wdHMuaGFuZGxlQ2xhc3MgOiAob3B0cy5oYW5kbGUgPyBvcHRzLmhhbmRsZSA6ICcnKSkgfHwgdHlwZXNfMS5ncmlkRGVmYXVsdHMuZHJhZ2dhYmxlLmhhbmRsZSxcclxuICAgICAgICAgICAgfSwgcmVtb3ZhYmxlT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBvcHRzLml0ZW1DbGFzcyA/ICcuJyArIG9wdHMuaXRlbUNsYXNzIDogdHlwZXNfMS5ncmlkRGVmYXVsdHMucmVtb3ZhYmxlT3B0aW9ucy5hY2NlcHQsXHJcbiAgICAgICAgICAgIH0gfSk7XHJcbiAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgnZ3MtYW5pbWF0ZScpKSB7IC8vIGRlZmF1bHQgdG8gdHJ1ZSwgYnV0IGlmIHNldCB0byBmYWxzZSB1c2UgdGhhdCBpbnN0ZWFkXHJcbiAgICAgICAgICAgIGRlZmF1bHRzLmFuaW1hdGUgPSB1dGlsc18xLlV0aWxzLnRvQm9vbChlbC5nZXRBdHRyaWJ1dGUoJ2dzLWFuaW1hdGUnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0cyA9IHV0aWxzXzEuVXRpbHMuZGVmYXVsdHMob3B0cywgZGVmYXVsdHMpO1xyXG4gICAgICAgIG9wdHMgPSBudWxsOyAvLyBtYWtlIHN1cmUgd2UgdXNlIHRoaXMub3B0cyBpbnN0ZWFkXHJcbiAgICAgICAgdGhpcy5faW5pdE1hcmdpbigpOyAvLyBwYXJ0IG9mIHNldHRpbmdzIGRlZmF1bHRzLi4uXHJcbiAgICAgICAgLy8gTm93IGNoZWNrIGlmIHdlJ3JlIGxvYWRpbmcgaW50byAxIGNvbHVtbiBtb2RlIEZJUlNUIHNvIHdlIGRvbid0IGRvIHVuLW5lY2Vzc2FyeSB3b3JrIChsaWtlIGNlbGxIZWlnaHQgPSB3aWR0aCAvIDEyIHRoZW4gZ28gMSBjb2x1bW4pXHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5jb2x1bW4gIT09IDEgJiYgIXRoaXMub3B0cy5kaXNhYmxlT25lQ29sdW1uTW9kZSAmJiB0aGlzLl93aWR0aE9yQ29udGFpbmVyKCkgPD0gdGhpcy5vcHRzLm9uZUNvbHVtblNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJldkNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5jb2x1bW4gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRzLnJ0bCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5ydGwgPSAoZWwuc3R5bGUuZGlyZWN0aW9uID09PSAncnRsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMucnRsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjay1ydGwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgd2UncmUgYmVlbiBuZXN0ZWQsIGFuZCBpZiBzbyB1cGRhdGUgb3VyIHN0eWxlIGFuZCBrZWVwIHBvaW50ZXIgYXJvdW5kICh1c2VkIGR1cmluZyBzYXZlKVxyXG4gICAgICAgIGxldCBwYXJlbnRHcmlkSXRlbSA9IChfYSA9IHV0aWxzXzEuVXRpbHMuY2xvc2VzdFVwQnlDbGFzcyh0aGlzLmVsLCB0eXBlc18xLmdyaWREZWZhdWx0cy5pdGVtQ2xhc3MpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICBpZiAocGFyZW50R3JpZEl0ZW0pIHtcclxuICAgICAgICAgICAgcGFyZW50R3JpZEl0ZW0uc3ViR3JpZCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50R3JpZEl0ZW0gPSBwYXJlbnRHcmlkSXRlbTtcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdncmlkLXN0YWNrLW5lc3RlZCcpO1xyXG4gICAgICAgICAgICBwYXJlbnRHcmlkSXRlbS5lbC5jbGFzc0xpc3QuYWRkKCdncmlkLXN0YWNrLXN1Yi1ncmlkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQgPSAodGhpcy5vcHRzLmNlbGxIZWlnaHQgPT09ICdhdXRvJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQgfHwgdGhpcy5vcHRzLmNlbGxIZWlnaHQgPT09ICdpbml0aWFsJykge1xyXG4gICAgICAgICAgICAvLyBtYWtlIHRoZSBjZWxsIGNvbnRlbnQgc3F1YXJlIGluaXRpYWxseSAod2lsbCB1c2UgcmVzaXplL2NvbHVtbiBldmVudCB0byBrZWVwIGl0IHNxdWFyZSlcclxuICAgICAgICAgICAgdGhpcy5jZWxsSGVpZ2h0KHVuZGVmaW5lZCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gYXBwZW5kIHVuaXQgaWYgYW55IGFyZSBzZXRcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdHMuY2VsbEhlaWdodCA9PSAnbnVtYmVyJyAmJiB0aGlzLm9wdHMuY2VsbEhlaWdodFVuaXQgJiYgdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0ICE9PSB0eXBlc18xLmdyaWREZWZhdWx0cy5jZWxsSGVpZ2h0VW5pdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzLmNlbGxIZWlnaHQgPSB0aGlzLm9wdHMuY2VsbEhlaWdodCArIHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMuY2VsbEhlaWdodFVuaXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jZWxsSGVpZ2h0KHRoaXMub3B0cy5jZWxsSGVpZ2h0LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlZSBpZiB3ZSBuZWVkIHRvIGFkanVzdCBhdXRvLWhpZGVcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmFsd2F5c1Nob3dSZXNpemVIYW5kbGUgPT09ICdtb2JpbGUnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5hbHdheXNTaG93UmVzaXplSGFuZGxlID0gZGRfdG91Y2hfMS5pc1RvdWNoO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdHlsZVNoZWV0Q2xhc3MgPSAnZ3JpZC1zdGFjay1pbnN0YW5jZS0nICsgZ3JpZHN0YWNrX2VuZ2luZV8xLkdyaWRTdGFja0VuZ2luZS5faWRTZXErKztcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQodGhpcy5fc3R5bGVTaGVldENsYXNzKTtcclxuICAgICAgICB0aGlzLl9zZXRTdGF0aWNDbGFzcygpO1xyXG4gICAgICAgIGxldCBlbmdpbmVDbGFzcyA9IHRoaXMub3B0cy5lbmdpbmVDbGFzcyB8fCBHcmlkU3RhY2suZW5naW5lQ2xhc3MgfHwgZ3JpZHN0YWNrX2VuZ2luZV8xLkdyaWRTdGFja0VuZ2luZTtcclxuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyBlbmdpbmVDbGFzcyh7XHJcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5nZXRDb2x1bW4oKSxcclxuICAgICAgICAgICAgZmxvYXQ6IHRoaXMub3B0cy5mbG9hdCxcclxuICAgICAgICAgICAgbWF4Um93OiB0aGlzLm9wdHMubWF4Um93LFxyXG4gICAgICAgICAgICBvbkNoYW5nZTogKGNiTm9kZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhIID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLm5vZGVzLmZvckVhY2gobiA9PiB7IG1heEggPSBNYXRoLm1heChtYXhILCBuLnkgKyBuLmgpOyB9KTtcclxuICAgICAgICAgICAgICAgIGNiTm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZWwgPSBuLmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobi5fcmVtb3ZlRE9NKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbi5fcmVtb3ZlRE9NO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKGVsLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlcyhmYWxzZSwgbWF4SCk7IC8vIGZhbHNlID0gZG9uJ3QgcmVjcmVhdGUsIGp1c3QgYXBwZW5kIGlmIG5lZWQgYmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0bykge1xyXG4gICAgICAgICAgICB0aGlzLmJhdGNoVXBkYXRlKCk7IC8vIHByZXZlbnQgaW4gYmV0d2VlbiByZS1sYXlvdXQgIzE1MzUgVE9ETzogdGhpcyBvbmx5IHNldCBmbG9hdD10cnVlLCBuZWVkIHRvIHByZXZlbnQgY29sbGlzaW9uIGNoZWNrLi4uXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0R3JpZEl0ZW1zKCkuZm9yRWFjaChlbCA9PiB0aGlzLl9wcmVwYXJlRWxlbWVudChlbCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJhdGNoVXBkYXRlKGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbG9hZCBhbnkgcGFzc2VkIGluIGNoaWxkcmVuIGFzIHdlbGwsIHdoaWNoIG92ZXJyaWRlcyBhbnkgRE9NIGxheW91dCBkb25lIGFib3ZlXHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLm9wdHMuY2hpbGRyZW47XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMuY2hpbGRyZW47XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWQoY2hpbGRyZW4pOyAvLyBkb24ndCBsb2FkIGVtcHR5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0QW5pbWF0aW9uKHRoaXMub3B0cy5hbmltYXRlKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdHlsZXMoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNvbHVtbiAhPSAxMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2stJyArIHRoaXMub3B0cy5jb2x1bW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBsZWdhY3kgc3VwcG9ydCB0byBhcHBlYXIgJ3BlciBncmlkYCBvcHRpb25zIHdoZW4gcmVhbGx5IGdsb2JhbC5cclxuICAgICAgICBpZiAodGhpcy5vcHRzLmRyYWdJbilcclxuICAgICAgICAgICAgR3JpZFN0YWNrLnNldHVwRHJhZ0luKHRoaXMub3B0cy5kcmFnSW4sIHRoaXMub3B0cy5kcmFnSW5PcHRpb25zKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5vcHRzLmRyYWdJbjtcclxuICAgICAgICBkZWxldGUgdGhpcy5vcHRzLmRyYWdJbk9wdGlvbnM7XHJcbiAgICAgICAgLy8gZHluYW1pYyBncmlkcyByZXF1aXJlIHBhdXNpbmcgZHVyaW5nIGRyYWcgdG8gZGV0ZWN0IG92ZXIgdG8gbmVzdCB2cyBwdXNoXHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdWJHcmlkRHluYW1pYyAmJiAhZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcpXHJcbiAgICAgICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIucGF1c2VEcmFnID0gdHJ1ZTtcclxuICAgICAgICBpZiAoKChfYiA9IHRoaXMub3B0cy5kcmFnZ2FibGUpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5wYXVzZSkgIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcgPSB0aGlzLm9wdHMuZHJhZ2dhYmxlLnBhdXNlO1xyXG4gICAgICAgIHRoaXMuX3NldHVwUmVtb3ZlRHJvcCgpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQWNjZXB0V2lkZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlV2luZG93UmVzaXplRXZlbnQoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogaW5pdGlhbGl6aW5nIHRoZSBIVE1MIGVsZW1lbnQsIG9yIHNlbGVjdG9yIHN0cmluZywgaW50byBhIGdyaWQgd2lsbCByZXR1cm4gdGhlIGdyaWQuIENhbGxpbmcgaXQgYWdhaW4gd2lsbFxyXG4gICAgICogc2ltcGx5IHJldHVybiB0aGUgZXhpc3RpbmcgaW5zdGFuY2UgKGlnbm9yZSBhbnkgcGFzc2VkIG9wdGlvbnMpLiBUaGVyZSBpcyBhbHNvIGFuIGluaXRBbGwoKSB2ZXJzaW9uIHRoYXQgc3VwcG9ydFxyXG4gICAgICogbXVsdGlwbGUgZ3JpZHMgaW5pdGlhbGl6YXRpb24gYXQgb25jZS4gT3IgeW91IGNhbiB1c2UgYWRkR3JpZCgpIHRvIGNyZWF0ZSB0aGUgZW50aXJlIGdyaWQgZnJvbSBKU09OLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgZ3JpZCBvcHRpb25zIChvcHRpb25hbClcclxuICAgICAqIEBwYXJhbSBlbE9yU3RyaW5nIGVsZW1lbnQgb3IgQ1NTIHNlbGVjdG9yIChmaXJzdCBvbmUgdXNlZCkgdG8gY29udmVydCB0byBhIGdyaWQgKGRlZmF1bHQgdG8gJy5ncmlkLXN0YWNrJyBjbGFzcyBzZWxlY3RvcilcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogbGV0IGdyaWQgPSBHcmlkU3RhY2suaW5pdCgpO1xyXG4gICAgICpcclxuICAgICAqIE5vdGU6IHRoZSBIVE1MRWxlbWVudCAob2YgdHlwZSBHcmlkSFRNTEVsZW1lbnQpIHdpbGwgc3RvcmUgYSBgZ3JpZHN0YWNrOiBHcmlkU3RhY2tgIHZhbHVlIHRoYXQgY2FuIGJlIHJldHJpZXZlIGxhdGVyXHJcbiAgICAgKiBsZXQgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkLXN0YWNrJykuZ3JpZHN0YWNrO1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW5pdChvcHRpb25zID0ge30sIGVsT3JTdHJpbmcgPSAnLmdyaWQtc3RhY2snKSB7XHJcbiAgICAgICAgbGV0IGVsID0gR3JpZFN0YWNrLmdldEdyaWRFbGVtZW50KGVsT3JTdHJpbmcpO1xyXG4gICAgICAgIGlmICghZWwpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbE9yU3RyaW5nID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignR3JpZFN0YWNrLmluaXRBbGwoKSBubyBncmlkIHdhcyBmb3VuZCB3aXRoIHNlbGVjdG9yIFwiJyArIGVsT3JTdHJpbmcgKyAnXCIgLSBlbGVtZW50IG1pc3Npbmcgb3Igd3Jvbmcgc2VsZWN0b3IgPycgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcXG5Ob3RlOiBcIi5ncmlkLXN0YWNrXCIgaXMgcmVxdWlyZWQgZm9yIHByb3BlciBDU1Mgc3R5bGluZyBhbmQgZHJhZy9kcm9wLCBhbmQgaXMgdGhlIGRlZmF1bHQgc2VsZWN0b3IuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdHcmlkU3RhY2suaW5pdCgpIG5vIGdyaWQgZWxlbWVudCB3YXMgcGFzc2VkLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVsLmdyaWRzdGFjaykge1xyXG4gICAgICAgICAgICBlbC5ncmlkc3RhY2sgPSBuZXcgR3JpZFN0YWNrKGVsLCB1dGlsc18xLlV0aWxzLmNsb25lRGVlcChvcHRpb25zKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbC5ncmlkc3RhY2s7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFdpbGwgaW5pdGlhbGl6ZSBhIGxpc3Qgb2YgZWxlbWVudHMgKGdpdmVuIGEgc2VsZWN0b3IpIGFuZCByZXR1cm4gYW4gYXJyYXkgb2YgZ3JpZHMuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBncmlkIG9wdGlvbnMgKG9wdGlvbmFsKVxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIGVsZW1lbnRzIHNlbGVjdG9yIHRvIGNvbnZlcnQgdG8gZ3JpZHMgKGRlZmF1bHQgdG8gJy5ncmlkLXN0YWNrJyBjbGFzcyBzZWxlY3RvcilcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogbGV0IGdyaWRzID0gR3JpZFN0YWNrLmluaXRBbGwoKTtcclxuICAgICAqIGdyaWRzLmZvckVhY2goLi4uKVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW5pdEFsbChvcHRpb25zID0ge30sIHNlbGVjdG9yID0gJy5ncmlkLXN0YWNrJykge1xyXG4gICAgICAgIGxldCBncmlkcyA9IFtdO1xyXG4gICAgICAgIEdyaWRTdGFjay5nZXRHcmlkRWxlbWVudHMoc2VsZWN0b3IpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVsLmdyaWRzdGFjaykge1xyXG4gICAgICAgICAgICAgICAgZWwuZ3JpZHN0YWNrID0gbmV3IEdyaWRTdGFjayhlbCwgdXRpbHNfMS5VdGlscy5jbG9uZURlZXAob3B0aW9ucykpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZHJhZ0luO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZHJhZ0luT3B0aW9uczsgLy8gb25seSBuZWVkIHRvIGJlIGRvbmUgb25jZSAocmVhbGx5IGEgc3RhdGljIGdsb2JhbCB0aGluZywgbm90IHBlciBncmlkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdyaWRzLnB1c2goZWwuZ3JpZHN0YWNrKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZ3JpZHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dyaWRTdGFjay5pbml0QWxsKCkgbm8gZ3JpZCB3YXMgZm91bmQgd2l0aCBzZWxlY3RvciBcIicgKyBzZWxlY3RvciArICdcIiAtIGVsZW1lbnQgbWlzc2luZyBvciB3cm9uZyBzZWxlY3RvciA/JyArXHJcbiAgICAgICAgICAgICAgICAnXFxuTm90ZTogXCIuZ3JpZC1zdGFja1wiIGlzIHJlcXVpcmVkIGZvciBwcm9wZXIgQ1NTIHN0eWxpbmcgYW5kIGRyYWcvZHJvcCwgYW5kIGlzIHRoZSBkZWZhdWx0IHNlbGVjdG9yLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZ3JpZHM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNhbGwgdG8gY3JlYXRlIGEgZ3JpZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLCBpbmNsdWRpbmcgbG9hZGluZyBhbnkgY2hpbGRyZW4gZnJvbSBKU09OIHN0cnVjdHVyZS4gVGhpcyB3aWxsIGNhbGwgR3JpZFN0YWNrLmluaXQoKSwgdGhlblxyXG4gICAgICogZ3JpZC5sb2FkKCkgb24gYW55IHBhc3NlZCBjaGlsZHJlbiAocmVjdXJzaXZlbHkpLiBHcmVhdCBhbHRlcm5hdGl2ZSB0byBjYWxsaW5nIGluaXQoKSBpZiB5b3Ugd2FudCBlbnRpcmUgZ3JpZCB0byBjb21lIGZyb21cclxuICAgICAqIEpTT04gc2VyaWFsaXplZCBkYXRhLCBpbmNsdWRpbmcgb3B0aW9ucy5cclxuICAgICAqIEBwYXJhbSBwYXJlbnQgSFRNTCBlbGVtZW50IHBhcmVudCB0byB0aGUgZ3JpZFxyXG4gICAgICogQHBhcmFtIG9wdCBncmlkcyBvcHRpb25zIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgZ3JpZCwgYW5kIGxpc3Qgb2YgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZEdyaWQocGFyZW50LCBvcHQgPSB7fSkge1xyXG4gICAgICAgIGlmICghcGFyZW50KVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAvLyBjcmVhdGUgdGhlIGdyaWQgZWxlbWVudCwgYnV0IGNoZWNrIGlmIHRoZSBwYXNzZWQgJ3BhcmVudCcgYWxyZWFkeSBoYXMgZ3JpZCBzdHlsaW5nIGFuZCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkXHJcbiAgICAgICAgbGV0IGVsID0gcGFyZW50O1xyXG4gICAgICAgIGNvbnN0IHBhcmVudElzR3JpZCA9IHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2dyaWQtc3RhY2snKTtcclxuICAgICAgICBpZiAoIXBhcmVudElzR3JpZCB8fCBvcHQuYWRkUmVtb3ZlQ0IpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5hZGRSZW1vdmVDQikge1xyXG4gICAgICAgICAgICAgICAgZWwgPSBvcHQuYWRkUmVtb3ZlQ0IocGFyZW50LCBvcHQsIHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnJyk7IC8vIElFIG5lZWRzIGEgcGFyYW1cclxuICAgICAgICAgICAgICAgIGRvYy5ib2R5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjayAke29wdC5jbGFzcyB8fCAnJ31cIj48L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2MuYm9keS5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY3JlYXRlIGdyaWQgY2xhc3MgYW5kIGxvYWQgYW55IGNoaWxkcmVuXHJcbiAgICAgICAgbGV0IGdyaWQgPSBHcmlkU3RhY2suaW5pdChvcHQsIGVsKTtcclxuICAgICAgICByZXR1cm4gZ3JpZDtcclxuICAgIH1cclxuICAgIC8qKiBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlZ2lzdGVyIHlvdXIgZW5naW5lIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgb25lLlxyXG4gICAgICogU2VlIGluc3RlYWQgYEdyaWRTdGFja09wdGlvbnMuZW5naW5lQ2xhc3NgIGlmIHlvdSBvbmx5IG5lZWQgdG9cclxuICAgICAqIHJlcGxhY2UganVzdCBvbmUgaW5zdGFuY2UuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZWdpc3RlckVuZ2luZShlbmdpbmVDbGFzcykge1xyXG4gICAgICAgIEdyaWRTdGFjay5lbmdpbmVDbGFzcyA9IGVuZ2luZUNsYXNzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjcmVhdGUgcGxhY2Vob2xkZXIgRElWIGFzIG5lZWRlZCAqL1xyXG4gICAgZ2V0IHBsYWNlaG9sZGVyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fcGxhY2Vob2xkZXIpIHtcclxuICAgICAgICAgICAgbGV0IHBsYWNlaG9sZGVyQ2hpbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTsgLy8gY2hpbGQgc28gcGFkZGluZyBtYXRjaCBpdGVtLWNvbnRlbnRcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXJDaGlsZC5jbGFzc05hbWUgPSAncGxhY2Vob2xkZXItY29udGVudCc7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucGxhY2Vob2xkZXJUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlckNoaWxkLmlubmVySFRNTCA9IHRoaXMub3B0cy5wbGFjZWhvbGRlclRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2xhc3NMaXN0LmFkZCh0aGlzLm9wdHMucGxhY2Vob2xkZXJDbGFzcywgdHlwZXNfMS5ncmlkRGVmYXVsdHMuaXRlbUNsYXNzLCB0aGlzLm9wdHMuaXRlbUNsYXNzKTtcclxuICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlci5hcHBlbmRDaGlsZChwbGFjZWhvbGRlckNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BsYWNlaG9sZGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBuZXcgd2lkZ2V0IGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICpcclxuICAgICAqIFdpZGdldCB3aWxsIGJlIGFsd2F5cyBwbGFjZWQgZXZlbiBpZiByZXN1bHQgaGVpZ2h0IGlzIG1vcmUgdGhhbiBhY3R1YWwgZ3JpZCBoZWlnaHQuXHJcbiAgICAgKiBZb3UgbmVlZCB0byB1c2UgYHdpbGxJdEZpdCgpYCBiZWZvcmUgY2FsbGluZyBhZGRXaWRnZXQgZm9yIGFkZGl0aW9uYWwgY2hlY2suXHJcbiAgICAgKiBTZWUgYWxzbyBgbWFrZVdpZGdldCgpYC5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogbGV0IGdyaWQgPSBHcmlkU3RhY2suaW5pdCgpO1xyXG4gICAgICogZ3JpZC5hZGRXaWRnZXQoe3c6IDMsIGNvbnRlbnQ6ICdoZWxsbyd9KTtcclxuICAgICAqIGdyaWQuYWRkV2lkZ2V0KCc8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtXCI+PGRpdiBjbGFzcz1cImdyaWQtc3RhY2staXRlbS1jb250ZW50XCI+aGVsbG88L2Rpdj48L2Rpdj4nLCB7dzogM30pO1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbCAgR3JpZFN0YWNrV2lkZ2V0ICh3aGljaCBjYW4gaGF2ZSBjb250ZW50IHN0cmluZyBhcyB3ZWxsKSwgaHRtbCBlbGVtZW50LCBvciBzdHJpbmcgZGVmaW5pdGlvbiB0byBhZGRcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIHdpZGdldCBwb3NpdGlvbi9zaXplIG9wdGlvbnMgKG9wdGlvbmFsLCBhbmQgaWdub3JlIGlmIGZpcnN0IHBhcmFtIGlzIGFscmVhZHkgb3B0aW9uKSAtIHNlZSBHcmlkU3RhY2tXaWRnZXRcclxuICAgICAqL1xyXG4gICAgYWRkV2lkZ2V0KGVscywgb3B0aW9ucykge1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzR3JpZFN0YWNrV2lkZ2V0KHcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHcuZWwgIT09IHVuZGVmaW5lZCB8fCB3LnggIT09IHVuZGVmaW5lZCB8fCB3LnkgIT09IHVuZGVmaW5lZCB8fCB3LncgIT09IHVuZGVmaW5lZCB8fCB3LmggIT09IHVuZGVmaW5lZCB8fCB3LmNvbnRlbnQgIT09IHVuZGVmaW5lZCA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGVsO1xyXG4gICAgICAgIGxldCBub2RlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCcnKTsgLy8gSUUgbmVlZHMgYSBwYXJhbVxyXG4gICAgICAgICAgICBkb2MuYm9keS5pbm5lckhUTUwgPSBlbHM7XHJcbiAgICAgICAgICAgIGVsID0gZG9jLmJvZHkuY2hpbGRyZW5bMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDAgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBpc0dyaWRTdGFja1dpZGdldChlbHMpKSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBvcHRpb25zID0gZWxzO1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmVsKSB7XHJcbiAgICAgICAgICAgICAgICBlbCA9IG5vZGUuZWw7IC8vIHJlLXVzZSBlbGVtZW50IHN0b3JlZCBpbiB0aGUgbm9kZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0cy5hZGRSZW1vdmVDQikge1xyXG4gICAgICAgICAgICAgICAgZWwgPSB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IodGhpcy5lbCwgb3B0aW9ucywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSAob3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLmNvbnRlbnQpIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnJyk7IC8vIElFIG5lZWRzIGEgcGFyYW1cclxuICAgICAgICAgICAgICAgIGRvYy5ib2R5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtICR7dGhpcy5vcHRzLml0ZW1DbGFzcyB8fCAnJ31cIj48ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnRcIj4ke2NvbnRlbnR9PC9kaXY+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jLmJvZHkuY2hpbGRyZW5bMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGVsID0gZWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgLy8gVGVtcHRpbmcgdG8gaW5pdGlhbGl6ZSB0aGUgcGFzc2VkIGluIG9wdCB3aXRoIGRlZmF1bHQgYW5kIHZhbGlkIHZhbHVlcywgYnV0IHRoaXMgYnJlYWsga25vY2tvdXQgZGVtb3NcclxuICAgICAgICAvLyBhcyB0aGUgYWN0dWFsIHZhbHVlIGFyZSBmaWxsZWQgaW4gd2hlbiBfcHJlcGFyZUVsZW1lbnQoKSBjYWxscyBlbC5nZXRBdHRyaWJ1dGUoJ2dzLXh5eicpIGJlZm9yZSBhZGRpbmcgdGhlIG5vZGUuXHJcbiAgICAgICAgLy8gU28gbWFrZSBzdXJlIHdlIGxvYWQgYW55IERPTSBhdHRyaWJ1dGVzIHRoYXQgYXJlIG5vdCBzcGVjaWZpZWQgaW4gcGFzc2VkIGluIG9wdGlvbnMgKHdoaWNoIG92ZXJyaWRlKVxyXG4gICAgICAgIGxldCBkb21BdHRyID0gdGhpcy5fcmVhZEF0dHIoZWwpO1xyXG4gICAgICAgIG9wdGlvbnMgPSB1dGlsc18xLlV0aWxzLmNsb25lRGVlcChvcHRpb25zKSB8fCB7fTsgLy8gbWFrZSBhIGNvcHkgYmVmb3JlIHdlIG1vZGlmeSBpbiBjYXNlIGNhbGxlciByZS11c2VzIGl0XHJcbiAgICAgICAgdXRpbHNfMS5VdGlscy5kZWZhdWx0cyhvcHRpb25zLCBkb21BdHRyKTtcclxuICAgICAgICBub2RlID0gdGhpcy5lbmdpbmUucHJlcGFyZU5vZGUob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fd3JpdGVBdHRyKGVsLCBvcHRpb25zKTtcclxuICAgICAgICBpZiAodGhpcy5faW5zZXJ0Tm90QXBwZW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucHJlcGVuZChlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFwcGVuZENoaWxkKGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2ltaWxhciB0byBtYWtlV2lkZ2V0KCkgdGhhdCBkb2Vzbid0IHJlYWQgYXR0ciBhZ2FpbiBhbmQgd29yc2UgcmUtY3JlYXRlIGEgbmV3IG5vZGUgYW5kIGxvb3NlIGFueSBfaWRcclxuICAgICAgICB0aGlzLl9wcmVwYXJlRWxlbWVudChlbCwgdHJ1ZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgLy8gc2VlIGlmIHRoZXJlIGlzIGEgc3ViLWdyaWQgdG8gY3JlYXRlXHJcbiAgICAgICAgaWYgKG5vZGUuc3ViR3JpZCkge1xyXG4gICAgICAgICAgICB0aGlzLm1ha2VTdWJHcmlkKG5vZGUuZWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7IC8vbm9kZS5zdWJHcmlkIHdpbGwgYmUgdXNlZCBhcyBvcHRpb24gaW4gbWV0aG9kLCBubyBuZWVkIHRvIHBhc3NcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgd2UncmUgYWRkaW5nIGFuIGl0ZW0gaW50byAxIGNvbHVtbiAoX3ByZXZDb2x1bW4gaXMgc2V0IG9ubHkgd2hlbiBnb2luZyB0byAxKSBtYWtlIHN1cmVcclxuICAgICAgICAvLyB3ZSBkb24ndCBvdmVycmlkZSB0aGUgbGFyZ2VyIDEyIGNvbHVtbiBsYXlvdXQgdGhhdCB3YXMgYWxyZWFkeSBzYXZlZC4gIzE5ODVcclxuICAgICAgICBpZiAodGhpcy5fcHJldkNvbHVtbiAmJiB0aGlzLm9wdHMuY29sdW1uID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckFkZEV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlO1xyXG4gICAgICAgIHJldHVybiBlbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhbiBleGlzdGluZyBncmlkSXRlbSBlbGVtZW50IGludG8gYSBzdWItZ3JpZCB3aXRoIHRoZSBnaXZlbiAob3B0aW9uYWwpIG9wdGlvbnMsIGVsc2UgaW5oZXJpdCB0aGVtXHJcbiAgICAgKiBmcm9tIHRoZSBwYXJlbnQncyBzdWJHcmlkIG9wdGlvbnMuXHJcbiAgICAgKiBAcGFyYW0gZWwgZ3JpZEl0ZW0gZWxlbWVudCB0byBjb252ZXJ0XHJcbiAgICAgKiBAcGFyYW0gb3BzIChvcHRpb25hbCkgc3ViLWdyaWQgb3B0aW9ucywgZWxzZSBkZWZhdWx0IHRvIG5vZGUsIHRoZW4gcGFyZW50IHNldHRpbmdzLCBlbHNlIGRlZmF1bHRzXHJcbiAgICAgKiBAcGFyYW0gbm9kZVRvQWRkIChvcHRpb25hbCkgbm9kZSB0byBhZGQgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgc3ViIGdyaWQgKHVzZWQgd2hlbiBkcmFnZ2luZyBvdmVyIGV4aXN0aW5nIHJlZ3VsYXIgaXRlbSlcclxuICAgICAqIEByZXR1cm5zIG5ld2x5IGNyZWF0ZWQgZ3JpZFxyXG4gICAgICovXHJcbiAgICBtYWtlU3ViR3JpZChlbCwgb3BzLCBub2RlVG9BZGQsIHNhdmVDb250ZW50ID0gdHJ1ZSkge1xyXG4gICAgICAgIHZhciBfYSwgX2IsIF9jO1xyXG4gICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgbm9kZSA9IHRoaXMubWFrZVdpZGdldChlbCkuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKChfYSA9IG5vZGUuc3ViR3JpZCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmVsKVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5zdWJHcmlkOyAvLyBhbHJlYWR5IGRvbmVcclxuICAgICAgICAvLyBmaW5kIHRoZSB0ZW1wbGF0ZSBzdWJHcmlkIHN0b3JlZCBvbiBhIHBhcmVudCBhcyBmYWxsYmFjay4uLlxyXG4gICAgICAgIGxldCBzdWJHcmlkVGVtcGxhdGU7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgICAgIGxldCBncmlkID0gdGhpcztcclxuICAgICAgICB3aGlsZSAoZ3JpZCAmJiAhc3ViR3JpZFRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHN1YkdyaWRUZW1wbGF0ZSA9IChfYiA9IGdyaWQub3B0cykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLnN1YkdyaWQ7XHJcbiAgICAgICAgICAgIGdyaWQgPSAoX2MgPSBncmlkLnBhcmVudEdyaWRJdGVtKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuZ3JpZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8uLi4gYW5kIHNldCB0aGUgY3JlYXRlIG9wdGlvbnNcclxuICAgICAgICBvcHMgPSB1dGlsc18xLlV0aWxzLmNsb25lRGVlcChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgKHN1YkdyaWRUZW1wbGF0ZSB8fCB7fSkpLCB7IGNoaWxkcmVuOiB1bmRlZmluZWQgfSksIChvcHMgfHwgbm9kZS5zdWJHcmlkKSkpO1xyXG4gICAgICAgIG5vZGUuc3ViR3JpZCA9IG9wcztcclxuICAgICAgICAvLyBpZiBjb2x1bW4gc3BlY2lhbCBjYXNlIGl0IHNldCwgcmVtZW1iZXIgdGhhdCBmbGFnIGFuZCBzZXQgZGVmYXVsdFxyXG4gICAgICAgIGxldCBhdXRvQ29sdW1uO1xyXG4gICAgICAgIGlmIChvcHMuY29sdW1uID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgYXV0b0NvbHVtbiA9IHRydWU7XHJcbiAgICAgICAgICAgIG9wcy5jb2x1bW4gPSBNYXRoLm1heChub2RlLncgfHwgMSwgKG5vZGVUb0FkZCA9PT0gbnVsbCB8fCBub2RlVG9BZGQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGVUb0FkZC53KSB8fCAxKTtcclxuICAgICAgICAgICAgb3BzLmRpc2FibGVPbmVDb2x1bW5Nb2RlID0gdHJ1ZTsgLy8gZHJpdmVuIGJ5IHBhcmVudFxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiB3ZSdyZSBjb252ZXJ0aW5nIGFuIGV4aXN0aW5nIGZ1bGwgaXRlbSwgbW92ZSBvdmVyIHRoZSBjb250ZW50IHRvIGJlIHRoZSBmaXJzdCBzdWIgaXRlbSBpbiB0aGUgbmV3IGdyaWRcclxuICAgICAgICBsZXQgY29udGVudCA9IG5vZGUuZWwucXVlcnlTZWxlY3RvcignLmdyaWQtc3RhY2staXRlbS1jb250ZW50Jyk7XHJcbiAgICAgICAgbGV0IG5ld0l0ZW07XHJcbiAgICAgICAgbGV0IG5ld0l0ZW1PcHQ7XHJcbiAgICAgICAgaWYgKHNhdmVDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUREKG5vZGUuZWwpOyAvLyByZW1vdmUgRCZEIHNpbmNlIGl0J3Mgc2V0IG9uIGNvbnRlbnQgZGl2XHJcbiAgICAgICAgICAgIG5ld0l0ZW1PcHQgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIG5vZGUpLCB7IHg6IDAsIHk6IDAgfSk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlSW50ZXJuYWxGb3JTYXZlKG5ld0l0ZW1PcHQpO1xyXG4gICAgICAgICAgICBkZWxldGUgbmV3SXRlbU9wdC5zdWJHcmlkO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5jb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBuZXdJdGVtT3B0LmNvbnRlbnQgPSBub2RlLmNvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5jb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IpIHtcclxuICAgICAgICAgICAgICAgIG5ld0l0ZW0gPSB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IodGhpcy5lbCwgbmV3SXRlbU9wdCwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnJyk7IC8vIElFIG5lZWRzIGEgcGFyYW1cclxuICAgICAgICAgICAgICAgIGRvYy5ib2R5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtXCI+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgIG5ld0l0ZW0gPSBkb2MuYm9keS5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgICAgIG5ld0l0ZW0uYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICBkb2MuYm9keS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImdyaWQtc3RhY2staXRlbS1jb250ZW50XCI+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBkb2MuYm9keS5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgICAgIG5vZGUuZWwuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZURyYWdEcm9wQnlOb2RlKG5vZGUpOyAvLyAuLi4gYW5kIHJlc3RvcmUgb3JpZ2luYWwgRCZEXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHdlJ3JlIGFkZGluZyBhbiBhZGRpdGlvbmFsIGl0ZW0sIG1ha2UgdGhlIGNvbnRhaW5lciBsYXJnZSBlbm91Z2ggdG8gaGF2ZSB0aGVtIGJvdGhcclxuICAgICAgICBpZiAobm9kZVRvQWRkKSB7XHJcbiAgICAgICAgICAgIGxldCB3ID0gYXV0b0NvbHVtbiA/IG9wcy5jb2x1bW4gOiBub2RlLnc7XHJcbiAgICAgICAgICAgIGxldCBoID0gbm9kZS5oICsgbm9kZVRvQWRkLmg7XHJcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IG5vZGUuZWwuc3R5bGU7XHJcbiAgICAgICAgICAgIHN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7IC8vIHNob3cgdXAgaW5zdGFudGx5IHNvIHdlIGRvbid0IHNlZSBzY3JvbGxiYXIgd2l0aCBub2RlVG9BZGRcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUobm9kZS5lbCwgeyB3LCBoIH0pO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0eWxlLnRyYW5zaXRpb24gPSBudWxsKTsgLy8gcmVjb3ZlciBhbmltYXRpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hZGRSZW1vdmVDQikge1xyXG4gICAgICAgICAgICBvcHMuYWRkUmVtb3ZlQ0IgPSBvcHMuYWRkUmVtb3ZlQ0IgfHwgdGhpcy5vcHRzLmFkZFJlbW92ZUNCO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3ViR3JpZCA9IG5vZGUuc3ViR3JpZCA9IEdyaWRTdGFjay5hZGRHcmlkKGNvbnRlbnQsIG9wcyk7XHJcbiAgICAgICAgaWYgKG5vZGVUb0FkZCA9PT0gbnVsbCB8fCBub2RlVG9BZGQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGVUb0FkZC5fbW92aW5nKVxyXG4gICAgICAgICAgICBzdWJHcmlkLl9pc1RlbXAgPSB0cnVlOyAvLyBwcmV2ZW50IHJlLW5lc3RpbmcgYXMgd2UgYWRkIG92ZXJcclxuICAgICAgICBpZiAoYXV0b0NvbHVtbilcclxuICAgICAgICAgICAgc3ViR3JpZC5fYXV0b0NvbHVtbiA9IHRydWU7XHJcbiAgICAgICAgLy8gYWRkIHRoZSBvcmlnaW5hbCBjb250ZW50IGJhY2sgYXMgYSBjaGlsZCBvZiBodGUgbmV3bHkgY3JlYXRlZCBncmlkXHJcbiAgICAgICAgaWYgKHNhdmVDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHN1YkdyaWQuYWRkV2lkZ2V0KG5ld0l0ZW0sIG5ld0l0ZW1PcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgYWRkIGFueSBhZGRpdGlvbmFsIG5vZGVcclxuICAgICAgICBpZiAobm9kZVRvQWRkKSB7XHJcbiAgICAgICAgICAgIGlmIChub2RlVG9BZGQuX21vdmluZykge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGFuIGFydGlmaWNpYWwgZXZlbnQgZXZlbiBmb3IgdGhlIGp1c3QgY3JlYXRlZCBncmlkIHRvIHJlY2VpdmUgdGhpcyBpdGVtXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB1dGlsc18xLlV0aWxzLnNpbXVsYXRlTW91c2VFdmVudChub2RlVG9BZGQuX2V2ZW50LCAnbW91c2VlbnRlcicsIHN1YkdyaWQuZWwpLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN1YkdyaWQuYWRkV2lkZ2V0KG5vZGUuZWwsIG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWJHcmlkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgd2hlbiBhbiBpdGVtIHdhcyBjb252ZXJ0ZWQgaW50byBhIG5lc3RlZCBncmlkIHRvIGFjY29tbW9kYXRlIGEgZHJhZ2dlZCBvdmVyIGl0ZW0sIGJ1dCB0aGVuIGl0ZW0gbGVhdmVzIC0gcmV0dXJuIGJhY2tcclxuICAgICAqIHRvIHRoZSBvcmlnaW5hbCBncmlkLWl0ZW0uIEFsc28gY2FsbGVkIHRvIHJlbW92ZSBlbXB0eSBzdWItZ3JpZHMgd2hlbiBsYXN0IGl0ZW0gaXMgZHJhZ2dlZCBvdXQgKHNpbmNlIHJlLWNyZWF0aW5nIGlzIHNpbXBsZSlcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQXNTdWJHcmlkKG5vZGVUaGF0UmVtb3ZlZCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBsZXQgcEdyaWQgPSAoX2EgPSB0aGlzLnBhcmVudEdyaWRJdGVtKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ3JpZDtcclxuICAgICAgICBpZiAoIXBHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcEdyaWQuYmF0Y2hVcGRhdGUoKTtcclxuICAgICAgICBwR3JpZC5yZW1vdmVXaWRnZXQodGhpcy5wYXJlbnRHcmlkSXRlbS5lbCwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgLy8gbWlncmF0ZSBhbnkgY2hpbGRyZW4gb3ZlciBhbmQgb2Zmc2V0dGluZyBieSBvdXIgbG9jYXRpb25cclxuICAgICAgICAgICAgbi54ICs9IHRoaXMucGFyZW50R3JpZEl0ZW0ueDtcclxuICAgICAgICAgICAgbi55ICs9IHRoaXMucGFyZW50R3JpZEl0ZW0ueTtcclxuICAgICAgICAgICAgcEdyaWQuYWRkV2lkZ2V0KG4uZWwsIG4pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBHcmlkLmJhdGNoVXBkYXRlKGZhbHNlKTtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnRHcmlkSXRlbSlcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMucGFyZW50R3JpZEl0ZW0uc3ViR3JpZDtcclxuICAgICAgICBkZWxldGUgdGhpcy5wYXJlbnRHcmlkSXRlbTtcclxuICAgICAgICAvLyBjcmVhdGUgYW4gYXJ0aWZpY2lhbCBldmVudCBmb3IgdGhlIG9yaWdpbmFsIGdyaWQgbm93IHRoYXQgdGhpcyBvbmUgaXMgZ29uZSAoZ290IGEgbGVhdmUsIGJ1dCB3b24ndCBnZXQgZW50ZXIpXHJcbiAgICAgICAgaWYgKG5vZGVUaGF0UmVtb3ZlZCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB1dGlsc18xLlV0aWxzLnNpbXVsYXRlTW91c2VFdmVudChub2RlVGhhdFJlbW92ZWQuX2V2ZW50LCAnbW91c2VlbnRlcicsIHBHcmlkLmVsKSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAvKipcclxuICAgICAqIHNhdmVzIHRoZSBjdXJyZW50IGxheW91dCByZXR1cm5pbmcgYSBsaXN0IG9mIHdpZGdldHMgZm9yIHNlcmlhbGl6YXRpb24gd2hpY2ggbWlnaHQgaW5jbHVkZSBhbnkgbmVzdGVkIGdyaWRzLlxyXG4gICAgICogQHBhcmFtIHNhdmVDb250ZW50IGlmIHRydWUgKGRlZmF1bHQpIHRoZSBsYXRlc3QgaHRtbCBpbnNpZGUgLmdyaWQtc3RhY2stY29udGVudCB3aWxsIGJlIHNhdmVkIHRvIEdyaWRTdGFja1dpZGdldC5jb250ZW50IGZpZWxkLCBlbHNlIGl0IHdpbGxcclxuICAgICAqIGJlIHJlbW92ZWQuXHJcbiAgICAgKiBAcGFyYW0gc2F2ZUdyaWRPcHQgaWYgdHJ1ZSAoZGVmYXVsdCBmYWxzZSksIHNhdmUgdGhlIGdyaWQgb3B0aW9ucyBpdHNlbGYsIHNvIHlvdSBjYW4gY2FsbCB0aGUgbmV3IEdyaWRTdGFjay5hZGRHcmlkKClcclxuICAgICAqIHRvIHJlY3JlYXRlIGV2ZXJ5dGhpbmcgZnJvbSBzY3JhdGNoLiBHcmlkU3RhY2tPcHRpb25zLmNoaWxkcmVuIHdvdWxkIHRoZW4gY29udGFpbiB0aGUgd2lkZ2V0IGxpc3QgaW5zdGVhZC5cclxuICAgICAqIEByZXR1cm5zIGxpc3Qgb2Ygd2lkZ2V0cyBvciBmdWxsIGdyaWQgb3B0aW9uLCBpbmNsdWRpbmcgLmNoaWxkcmVuIGxpc3Qgb2Ygd2lkZ2V0c1xyXG4gICAgICovXHJcbiAgICBzYXZlKHNhdmVDb250ZW50ID0gdHJ1ZSwgc2F2ZUdyaWRPcHQgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIHJldHVybiBjb3BpZWQgbm9kZXMgd2UgY2FuIG1vZGlmeSBhdCB3aWxsLi4uXHJcbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmVuZ2luZS5zYXZlKHNhdmVDb250ZW50KTtcclxuICAgICAgICAvLyBjaGVjayBmb3IgSFRNTCBjb250ZW50IGFuZCBuZXN0ZWQgZ3JpZHNcclxuICAgICAgICBsaXN0LmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIHZhciBfYTtcclxuICAgICAgICAgICAgaWYgKHNhdmVDb250ZW50ICYmIG4uZWwgJiYgIW4uc3ViR3JpZCkgeyAvLyBzdWItZ3JpZCBhcmUgc2F2ZWQgZGlmZmVyZW50bHksIG5vdCBwbGFpbiBjb250ZW50XHJcbiAgICAgICAgICAgICAgICBsZXQgc3ViID0gbi5lbC5xdWVyeVNlbGVjdG9yKCcuZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgICAgIG4uY29udGVudCA9IHN1YiA/IHN1Yi5pbm5lckhUTUwgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW4uY29udGVudClcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbi5jb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzYXZlQ29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuLmNvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgbmVzdGVkIGdyaWRcclxuICAgICAgICAgICAgICAgIGlmICgoX2EgPSBuLnN1YkdyaWQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RPck9wdCA9IG4uc3ViR3JpZC5zYXZlKHNhdmVDb250ZW50LCBzYXZlR3JpZE9wdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbi5zdWJHcmlkID0gKHNhdmVHcmlkT3B0ID8gbGlzdE9yT3B0IDogeyBjaGlsZHJlbjogbGlzdE9yT3B0IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLmVsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHNhdmUgZW50aXJlIGdyaWQgb3B0aW9ucyAobmVlZGVkIGZvciByZWN1cnNpdmUpICsgY2hpbGRyZW4uLi5cclxuICAgICAgICBpZiAoc2F2ZUdyaWRPcHQpIHtcclxuICAgICAgICAgICAgbGV0IG8gPSB1dGlsc18xLlV0aWxzLmNsb25lRGVlcCh0aGlzLm9wdHMpO1xyXG4gICAgICAgICAgICAvLyBkZWxldGUgZGVmYXVsdCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHJlY3JlYXRlZCBvbiBsYXVuY2hcclxuICAgICAgICAgICAgaWYgKG8ubWFyZ2luQm90dG9tID09PSBvLm1hcmdpblRvcCAmJiBvLm1hcmdpblJpZ2h0ID09PSBvLm1hcmdpbkxlZnQgJiYgby5tYXJnaW5Ub3AgPT09IG8ubWFyZ2luUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIG8ubWFyZ2luID0gby5tYXJnaW5Ub3A7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgby5tYXJnaW5Ub3A7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgby5tYXJnaW5SaWdodDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLm1hcmdpbkJvdHRvbTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLm1hcmdpbkxlZnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG8ucnRsID09PSAodGhpcy5lbC5zdHlsZS5kaXJlY3Rpb24gPT09ICdydGwnKSkge1xyXG4gICAgICAgICAgICAgICAgby5ydGwgPSAnYXV0byc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIG8uY2VsbEhlaWdodCA9ICdhdXRvJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fYXV0b0NvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgby5jb2x1bW4gPSAnYXV0byc7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgby5kaXNhYmxlT25lQ29sdW1uTW9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBvcmlnU2hvdyA9IG8uX2Fsd2F5c1Nob3dSZXNpemVIYW5kbGU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvLl9hbHdheXNTaG93UmVzaXplSGFuZGxlO1xyXG4gICAgICAgICAgICBpZiAob3JpZ1Nob3cgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgby5hbHdheXNTaG93UmVzaXplSGFuZGxlID0gb3JpZ1Nob3c7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgby5hbHdheXNTaG93UmVzaXplSGFuZGxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlSW50ZXJuYWxBbmRTYW1lKG8sIHR5cGVzXzEuZ3JpZERlZmF1bHRzKTtcclxuICAgICAgICAgICAgby5jaGlsZHJlbiA9IGxpc3Q7XHJcbiAgICAgICAgICAgIHJldHVybiBvO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogbG9hZCB0aGUgd2lkZ2V0cyBmcm9tIGEgbGlzdC4gVGhpcyB3aWxsIGNhbGwgdXBkYXRlKCkgb24gZWFjaCAobWF0Y2hpbmcgYnkgaWQpIG9yIGFkZC9yZW1vdmUgd2lkZ2V0cyB0aGF0IGFyZSBub3QgdGhlcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGxheW91dCBsaXN0IG9mIHdpZGdldHMgZGVmaW5pdGlvbiB0byB1cGRhdGUvY3JlYXRlXHJcbiAgICAgKiBAcGFyYW0gYWRkQW5kUmVtb3ZlIGJvb2xlYW4gKGRlZmF1bHQgdHJ1ZSkgb3IgY2FsbGJhY2sgbWV0aG9kIGNhbiBiZSBwYXNzZWQgdG8gY29udHJvbCBpZiBhbmQgaG93IG1pc3Npbmcgd2lkZ2V0cyBjYW4gYmUgYWRkZWQvcmVtb3ZlZCwgZ2l2aW5nXHJcbiAgICAgKiB0aGUgdXNlciBjb250cm9sIG9mIGluc2VydGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogc2VlIGh0dHA6Ly9ncmlkc3RhY2tqcy5jb20vZGVtby9zZXJpYWxpemF0aW9uLmh0bWxcclxuICAgICAqKi9cclxuICAgIGxvYWQobGF5b3V0LCBhZGRSZW1vdmUgPSB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IgfHwgdHJ1ZSkge1xyXG4gICAgICAgIGxldCBpdGVtcyA9IEdyaWRTdGFjay5VdGlscy5zb3J0KFsuLi5sYXlvdXRdLCAtMSwgdGhpcy5fcHJldkNvbHVtbiB8fCB0aGlzLmdldENvbHVtbigpKTsgLy8gbWFrZSBjb3B5IGJlZm9yZSB3ZSBtb2Qvc29ydFxyXG4gICAgICAgIHRoaXMuX2luc2VydE5vdEFwcGVuZCA9IHRydWU7IC8vIHNpbmNlIGNyZWF0ZSBpbiByZXZlcnNlIG9yZGVyLi4uXHJcbiAgICAgICAgLy8gaWYgd2UncmUgbG9hZGluZyBhIGxheW91dCBpbnRvIGZvciBleGFtcGxlIDEgY29sdW1uIChfcHJldkNvbHVtbiBpcyBzZXQgb25seSB3aGVuIGdvaW5nIHRvIDEpIGFuZCBpdGVtcyBkb24ndCBmaXQsIG1ha2Ugc3VyZSB0byBzYXZlXHJcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIHdhbnRlZCBsYXlvdXQgc28gd2UgY2FuIHNjYWxlIGJhY2sgdXAgY29ycmVjdGx5ICMxNDcxXHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZDb2x1bW4gJiYgdGhpcy5fcHJldkNvbHVtbiAhPT0gdGhpcy5vcHRzLmNvbHVtbiAmJiBpdGVtcy5zb21lKG4gPT4gKG4ueCArIG4udykgPiB0aGlzLm9wdHMuY29sdW1uKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pZ25vcmVMYXlvdXRzTm9kZUNoYW5nZSA9IHRydWU7IC8vIHNraXAgbGF5b3V0IHVwZGF0ZVxyXG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jYWNoZUxheW91dChpdGVtcywgdGhpcy5fcHJldkNvbHVtbiwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIGdpdmVuIGEgZGlmZmVyZW50IGNhbGxiYWNrLCB0ZW1wb3JhbGx5IHNldCBpdCBhcyBnbG9iYWwgb3B0aW9uIHRvIGNyZWF0aW5nIHdpbGwgdXNlIGl0XHJcbiAgICAgICAgY29uc3QgcHJldkNCID0gdGhpcy5vcHRzLmFkZFJlbW92ZUNCO1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGFkZFJlbW92ZSkgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5hZGRSZW1vdmVDQiA9IGFkZFJlbW92ZTtcclxuICAgICAgICBsZXQgcmVtb3ZlZCA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoKTtcclxuICAgICAgICAvLyBzZWUgaWYgYW55IGl0ZW1zIGFyZSBtaXNzaW5nIGZyb20gbmV3IGxheW91dCBhbmQgbmVlZCB0byBiZSByZW1vdmVkIGZpcnN0XHJcbiAgICAgICAgaWYgKGFkZFJlbW92ZSkge1xyXG4gICAgICAgICAgICBsZXQgY29weU5vZGVzID0gWy4uLnRoaXMuZW5naW5lLm5vZGVzXTsgLy8gZG9uJ3QgbG9vcCB0aHJvdWdoIGFycmF5IHlvdSBtb2RpZnlcclxuICAgICAgICAgICAgY29weU5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGl0ZW1zLmZpbmQodyA9PiBuLmlkID09PSB3LmlkKTtcclxuICAgICAgICAgICAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0cy5hZGRSZW1vdmVDQih0aGlzLmVsLCBuLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChuKTsgLy8gYmF0Y2gga2VlcCB0cmFja1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlV2lkZ2V0KG4uZWwsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBhZGQvdXBkYXRlIHRoZSB3aWRnZXRzXHJcbiAgICAgICAgaXRlbXMuZm9yRWFjaCh3ID0+IHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSAody5pZCB8fCB3LmlkID09PSAwKSA/IHRoaXMuZW5naW5lLm5vZGVzLmZpbmQobiA9PiBuLmlkID09PSB3LmlkKSA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKGl0ZW0uZWwsIHcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHcuc3ViR3JpZCAmJiB3LnN1YkdyaWQuY2hpbGRyZW4pIHsgLy8gdXBkYXRlIGFueSBzdWIgZ3JpZCBhcyB3ZWxsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YiA9IGl0ZW0uZWwucXVlcnlTZWxlY3RvcignLmdyaWQtc3RhY2snKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViICYmIHN1Yi5ncmlkc3RhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViLmdyaWRzdGFjay5sb2FkKHcuc3ViR3JpZC5jaGlsZHJlbik7IC8vIFRPRE86IHN1cHBvcnQgdXBkYXRpbmcgZ3JpZCBvcHRpb25zID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5zZXJ0Tm90QXBwZW5kID0gdHJ1ZTsgLy8gZ290IHJlc2V0IGJ5IGFib3ZlIGNhbGxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYWRkUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFdpZGdldCh3KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZWROb2RlcyA9IHJlbW92ZWQ7XHJcbiAgICAgICAgdGhpcy5iYXRjaFVwZGF0ZShmYWxzZSk7XHJcbiAgICAgICAgLy8gYWZ0ZXIgY29tbWl0LCBjbGVhciB0aGF0IGZsYWdcclxuICAgICAgICBkZWxldGUgdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2U7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2luc2VydE5vdEFwcGVuZDtcclxuICAgICAgICBwcmV2Q0IgPyB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0IgPSBwcmV2Q0IgOiBkZWxldGUgdGhpcy5vcHRzLmFkZFJlbW92ZUNCO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgYmVmb3JlIGNhbGxpbmcgYSBidW5jaCBvZiBgYWRkV2lkZ2V0KClgIHRvIHByZXZlbnQgdW4tbmVjZXNzYXJ5IHJlbGF5b3V0cyBpbiBiZXR3ZWVuIChtb3JlIGVmZmljaWVudClcclxuICAgICAqIGFuZCBnZXQgYSBzaW5nbGUgZXZlbnQgY2FsbGJhY2suIFlvdSB3aWxsIHNlZSBubyBjaGFuZ2VzIHVudGlsIGBiYXRjaFVwZGF0ZShmYWxzZSlgIGlzIGNhbGxlZC5cclxuICAgICAqL1xyXG4gICAgYmF0Y2hVcGRhdGUoZmxhZyA9IHRydWUpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZS5iYXRjaFVwZGF0ZShmbGFnKTtcclxuICAgICAgICBpZiAoIWZsYWcpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlclJlbW92ZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJBZGRFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEdldHMgY3VycmVudCBjZWxsIGhlaWdodC5cclxuICAgICAqL1xyXG4gICAgZ2V0Q2VsbEhlaWdodChmb3JjZVBpeGVsID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNlbGxIZWlnaHQgJiYgdGhpcy5vcHRzLmNlbGxIZWlnaHQgIT09ICdhdXRvJyAmJlxyXG4gICAgICAgICAgICAoIWZvcmNlUGl4ZWwgfHwgIXRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdCB8fCB0aGlzLm9wdHMuY2VsbEhlaWdodFVuaXQgPT09ICdweCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMuY2VsbEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZWxzZSBnZXQgZmlyc3QgY2VsbCBoZWlnaHRcclxuICAgICAgICBsZXQgZWwgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5vcHRzLml0ZW1DbGFzcyk7XHJcbiAgICAgICAgaWYgKGVsKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQgPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtaCcpKTtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWwub2Zmc2V0SGVpZ2h0IC8gaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZWxzZSBkbyBlbnRpcmUgZ3JpZCBhbmQgIyBvZiByb3dzIChidXQgZG9lc24ndCB3b3JrIGlmIG1pbi1oZWlnaHQgaXMgdGhlIGFjdHVhbCBjb25zdHJhaW4pXHJcbiAgICAgICAgbGV0IHJvd3MgPSBwYXJzZUludCh0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZ3MtY3VycmVudC1yb3cnKSk7XHJcbiAgICAgICAgcmV0dXJuIHJvd3MgPyBNYXRoLnJvdW5kKHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcm93cykgOiB0aGlzLm9wdHMuY2VsbEhlaWdodDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIGN1cnJlbnQgY2VsbCBoZWlnaHQgLSBzZWUgYEdyaWRTdGFja09wdGlvbnMuY2VsbEhlaWdodGAgZm9yIGZvcm1hdC5cclxuICAgICAqIFRoaXMgbWV0aG9kIHJlYnVpbGRzIGFuIGludGVybmFsIENTUyBzdHlsZSBzaGVldC5cclxuICAgICAqIE5vdGU6IFlvdSBjYW4gZXhwZWN0IHBlcmZvcm1hbmNlIGlzc3VlcyBpZiBjYWxsIHRoaXMgbWV0aG9kIHRvbyBvZnRlbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdmFsIHRoZSBjZWxsIGhlaWdodC4gSWYgbm90IHBhc3NlZCAodW5kZWZpbmVkKSwgY2VsbHMgY29udGVudCB3aWxsIGJlIG1hZGUgc3F1YXJlIChtYXRjaCB3aWR0aCBtaW51cyBtYXJnaW4pLFxyXG4gICAgICogaWYgcGFzcyAwIHRoZSBDU1Mgd2lsbCBiZSBnZW5lcmF0ZWQgYnkgdGhlIGFwcGxpY2F0aW9uIGluc3RlYWQuXHJcbiAgICAgKiBAcGFyYW0gdXBkYXRlIChPcHRpb25hbCkgaWYgZmFsc2UsIHN0eWxlcyB3aWxsIG5vdCBiZSB1cGRhdGVkXHJcbiAgICAgKlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGdyaWQuY2VsbEhlaWdodCgxMDApOyAvLyBzYW1lIGFzIDEwMHB4XHJcbiAgICAgKiBncmlkLmNlbGxIZWlnaHQoJzcwcHgnKTtcclxuICAgICAqIGdyaWQuY2VsbEhlaWdodChncmlkLmNlbGxXaWR0aCgpICogMS4yKTtcclxuICAgICAqL1xyXG4gICAgY2VsbEhlaWdodCh2YWwsIHVwZGF0ZSA9IHRydWUpIHtcclxuICAgICAgICAvLyBpZiBub3QgY2FsbGVkIGludGVybmFsbHksIGNoZWNrIGlmIHdlJ3JlIGNoYW5naW5nIG1vZGVcclxuICAgICAgICBpZiAodXBkYXRlICYmIHZhbCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0F1dG9DZWxsSGVpZ2h0ICE9PSAodmFsID09PSAnYXV0bycpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0F1dG9DZWxsSGVpZ2h0ID0gKHZhbCA9PT0gJ2F1dG8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVdpbmRvd1Jlc2l6ZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gJ2luaXRpYWwnIHx8IHZhbCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgIHZhbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbWFrZSBpdGVtIGNvbnRlbnQgYmUgc3F1YXJlXHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5EaWZmID0gLXRoaXMub3B0cy5tYXJnaW5SaWdodCAtIHRoaXMub3B0cy5tYXJnaW5MZWZ0XHJcbiAgICAgICAgICAgICAgICArIHRoaXMub3B0cy5tYXJnaW5Ub3AgKyB0aGlzLm9wdHMubWFyZ2luQm90dG9tO1xyXG4gICAgICAgICAgICB2YWwgPSB0aGlzLmNlbGxXaWR0aCgpICsgbWFyZ2luRGlmZjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRhdGEgPSB1dGlsc18xLlV0aWxzLnBhcnNlSGVpZ2h0KHZhbCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdCA9PT0gZGF0YS51bml0ICYmIHRoaXMub3B0cy5jZWxsSGVpZ2h0ID09PSBkYXRhLmgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdCA9IGRhdGEudW5pdDtcclxuICAgICAgICB0aGlzLm9wdHMuY2VsbEhlaWdodCA9IGRhdGEuaDtcclxuICAgICAgICBpZiAodXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlcyh0cnVlKTsgLy8gdHJ1ZSA9IGZvcmNlIHJlLWNyZWF0ZSBmb3IgY3VycmVudCAjIG9mIHJvd3NcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogR2V0cyBjdXJyZW50IGNlbGwgd2lkdGguICovXHJcbiAgICBjZWxsV2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dpZHRoT3JDb250YWluZXIoKSAvIHRoaXMuZ2V0Q29sdW1uKCk7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJuIG91ciBleHBlY3RlZCB3aWR0aCAob3IgcGFyZW50KSBmb3IgMSBjb2x1bW4gY2hlY2sgKi9cclxuICAgIF93aWR0aE9yQ29udGFpbmVyKCkge1xyXG4gICAgICAgIC8vIHVzZSBgb2Zmc2V0V2lkdGhgIG9yIGBjbGllbnRXaWR0aGAgKG5vIHNjcm9sbGJhcikgP1xyXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxMDY0MTAxL3VuZGVyc3RhbmRpbmctb2Zmc2V0d2lkdGgtY2xpZW50d2lkdGgtc2Nyb2xsd2lkdGgtYW5kLWhlaWdodC1yZXNwZWN0aXZlbHlcclxuICAgICAgICByZXR1cm4gKHRoaXMuZWwuY2xpZW50V2lkdGggfHwgdGhpcy5lbC5wYXJlbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoKTtcclxuICAgIH1cclxuICAgIC8qKiByZS1sYXlvdXQgZ3JpZCBpdGVtcyB0byByZWNsYWltIGFueSBlbXB0eSBzcGFjZSAqL1xyXG4gICAgY29tcGFjdCgpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZS5jb21wYWN0KCk7XHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNldCB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIGdyaWQuIFdpbGwgdXBkYXRlIGV4aXN0aW5nIHdpZGdldHMgdG8gY29uZm9ybSB0byBuZXcgbnVtYmVyIG9mIGNvbHVtbnMsXHJcbiAgICAgKiBhcyB3ZWxsIGFzIGNhY2hlIHRoZSBvcmlnaW5hbCBsYXlvdXQgc28geW91IGNhbiByZXZlcnQgYmFjayB0byBwcmV2aW91cyBwb3NpdGlvbnMgd2l0aG91dCBsb3NzLlxyXG4gICAgICogUmVxdWlyZXMgYGdyaWRzdGFjay1leHRyYS5jc3NgIG9yIGBncmlkc3RhY2stZXh0cmEubWluLmNzc2AgZm9yIFsyLTExXSxcclxuICAgICAqIGVsc2UgeW91IHdpbGwgbmVlZCB0byBnZW5lcmF0ZSBjb3JyZWN0IENTUyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzI2NoYW5nZS1ncmlkLWNvbHVtbnMpXHJcbiAgICAgKiBAcGFyYW0gY29sdW1uIC0gSW50ZWdlciA+IDAgKGRlZmF1bHQgMTIpLlxyXG4gICAgICogQHBhcmFtIGxheW91dCBzcGVjaWZ5IHRoZSB0eXBlIG9mIHJlLWxheW91dCB0aGF0IHdpbGwgaGFwcGVuIChwb3NpdGlvbiwgc2l6ZSwgZXRjLi4uKS5cclxuICAgICAqIE5vdGU6IGl0ZW1zIHdpbGwgbmV2ZXIgYmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBjb2x1bW4gYm91bmRhcmllcy4gZGVmYXVsdCAobW92ZVNjYWxlKS4gSWdub3JlZCBmb3IgMSBjb2x1bW5cclxuICAgICAqL1xyXG4gICAgY29sdW1uKGNvbHVtbiwgbGF5b3V0ID0gJ21vdmVTY2FsZScpIHtcclxuICAgICAgICBpZiAoY29sdW1uIDwgMSB8fCB0aGlzLm9wdHMuY29sdW1uID09PSBjb2x1bW4pXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGxldCBvbGRDb2x1bW4gPSB0aGlzLmdldENvbHVtbigpO1xyXG4gICAgICAgIC8vIGlmIHdlIGdvIGludG8gMSBjb2x1bW4gbW9kZSAod2hpY2ggaGFwcGVucyBpZiB3ZSdyZSBzaXplZCBsZXNzIHRoYW4gbWluVyB1bmxlc3MgZGlzYWJsZU9uZUNvbHVtbk1vZGUgaXMgb24pXHJcbiAgICAgICAgLy8gdGhlbiByZW1lbWJlciB0aGUgb3JpZ2luYWwgY29sdW1ucyBzbyB3ZSBjYW4gcmVzdG9yZS5cclxuICAgICAgICBpZiAoY29sdW1uID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXZDb2x1bW4gPSBvbGRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHJldkNvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLXN0YWNrLScgKyBvbGRDb2x1bW4pO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjay0nICsgY29sdW1uKTtcclxuICAgICAgICB0aGlzLm9wdHMuY29sdW1uID0gdGhpcy5lbmdpbmUuY29sdW1uID0gY29sdW1uO1xyXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgaXRlbXMgbm93IC0gc2VlIGlmIHRoZSBkb20gb3JkZXIgbm9kZXMgc2hvdWxkIGJlIHBhc3NlZCBpbnN0ZWFkIChlbHNlIGRlZmF1bHQgdG8gY3VycmVudCBsaXN0KVxyXG4gICAgICAgIGxldCBkb21Ob2RlcztcclxuICAgICAgICBpZiAoY29sdW1uID09PSAxICYmIHRoaXMub3B0cy5vbmVDb2x1bW5Nb2RlRG9tU29ydCkge1xyXG4gICAgICAgICAgICBkb21Ob2RlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmdldEdyaWRJdGVtcygpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsLmdyaWRzdGFja05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkb21Ob2Rlcy5wdXNoKGVsLmdyaWRzdGFja05vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCFkb21Ob2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGRvbU5vZGVzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW5naW5lLnVwZGF0ZU5vZGVXaWR0aHMob2xkQ29sdW1uLCBjb2x1bW4sIGRvbU5vZGVzLCBsYXlvdXQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0F1dG9DZWxsSGVpZ2h0KVxyXG4gICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQoKTtcclxuICAgICAgICAvLyBhbmQgdHJpZ2dlciBvdXIgZXZlbnQgbGFzdC4uLlxyXG4gICAgICAgIHRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlID0gdHJ1ZTsgLy8gc2tpcCBsYXlvdXQgdXBkYXRlXHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgdGhlIG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSBncmlkIChkZWZhdWx0IDEyKVxyXG4gICAgICovXHJcbiAgICBnZXRDb2x1bW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5jb2x1bW47XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyBhbiBhcnJheSBvZiBncmlkIEhUTUwgZWxlbWVudHMgKG5vIHBsYWNlaG9sZGVyKSAtIHVzZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIG91ciBjaGlsZHJlbiBpbiBET00gb3JkZXIgKi9cclxuICAgIGdldEdyaWRJdGVtcygpIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmVsLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChlbCkgPT4gZWwubWF0Y2hlcygnLicgKyB0aGlzLm9wdHMuaXRlbUNsYXNzKSAmJiAhZWwubWF0Y2hlcygnLicgKyB0aGlzLm9wdHMucGxhY2Vob2xkZXJDbGFzcykpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95cyBhIGdyaWQgaW5zdGFuY2UuIERPIE5PVCBDQUxMIGFueSBtZXRob2RzIG9yIGFjY2VzcyBhbnkgdmFycyBhZnRlciB0aGlzIGFzIGl0IHdpbGwgZnJlZSB1cCBtZW1iZXJzLlxyXG4gICAgICogQHBhcmFtIHJlbW92ZURPTSBpZiBgZmFsc2VgIGdyaWQgYW5kIGl0ZW1zIEhUTUwgZWxlbWVudHMgd2lsbCBub3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSBET00gKE9wdGlvbmFsLiBEZWZhdWx0IGB0cnVlYCkuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3kocmVtb3ZlRE9NID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5lbClcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBwcmV2ZW50IG11bHRpcGxlIGNhbGxzXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlV2luZG93UmVzaXplRXZlbnQodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0aWModHJ1ZSwgZmFsc2UpOyAvLyBwZXJtYW5lbnRseSByZW1vdmVzIEREIGJ1dCBkb24ndCBzZXQgQ1NTIGNsYXNzICh3ZSdyZSBnb2luZyBhd2F5KVxyXG4gICAgICAgIHRoaXMuc2V0QW5pbWF0aW9uKGZhbHNlKTtcclxuICAgICAgICBpZiAoIXJlbW92ZURPTSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFsbChyZW1vdmVET00pO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fc3R5bGVTaGVldENsYXNzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3R5bGVzaGVldCgpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdncy1jdXJyZW50LXJvdycpO1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudEdyaWRJdGVtKVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wYXJlbnRHcmlkSXRlbS5zdWJHcmlkO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmVudEdyaWRJdGVtO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdHM7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3BsYWNlaG9sZGVyO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmVuZ2luZTtcclxuICAgICAgICBkZWxldGUgdGhpcy5lbC5ncmlkc3RhY2s7IC8vIHJlbW92ZSBjaXJjdWxhciBkZXBlbmRlbmN5IHRoYXQgd291bGQgcHJldmVudCBhIGZyZWVpbmdcclxuICAgICAgICBkZWxldGUgdGhpcy5lbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlL2Rpc2FibGUgZmxvYXRpbmcgd2lkZ2V0cyAoZGVmYXVsdDogYGZhbHNlYCkgU2VlIFtleGFtcGxlXShodHRwOi8vZ3JpZHN0YWNranMuY29tL2RlbW8vZmxvYXQuaHRtbClcclxuICAgICAqL1xyXG4gICAgZmxvYXQodmFsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5mbG9hdCAhPT0gdmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5mbG9hdCA9IHRoaXMuZW5naW5lLmZsb2F0ID0gdmFsO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGdldCB0aGUgY3VycmVudCBmbG9hdCBtb2RlXHJcbiAgICAgKi9cclxuICAgIGdldEZsb2F0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZ2luZS5mbG9hdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VsbCB1bmRlciBhIHBpeGVsIG9uIHNjcmVlbi5cclxuICAgICAqIEBwYXJhbSBwb3NpdGlvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBpeGVsIHRvIHJlc29sdmUgaW5cclxuICAgICAqIGFic29sdXRlIGNvb3JkaW5hdGVzLCBhcyBhbiBvYmplY3Qgd2l0aCB0b3AgYW5kIGxlZnQgcHJvcGVydGllc1xyXG4gICAgICogQHBhcmFtIHVzZURvY1JlbGF0aXZlIGlmIHRydWUsIHZhbHVlIHdpbGwgYmUgYmFzZWQgb24gZG9jdW1lbnQgcG9zaXRpb24gdnMgcGFyZW50IHBvc2l0aW9uIChPcHRpb25hbC4gRGVmYXVsdCBmYWxzZSkuXHJcbiAgICAgKiBVc2VmdWwgd2hlbiBncmlkIGlzIHdpdGhpbiBgcG9zaXRpb246IHJlbGF0aXZlYCBlbGVtZW50XHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGB4YCBhbmQgYHlgIGkuZS4gdGhlIGNvbHVtbiBhbmQgcm93IGluIHRoZSBncmlkLlxyXG4gICAgICovXHJcbiAgICBnZXRDZWxsRnJvbVBpeGVsKHBvc2l0aW9uLCB1c2VEb2NSZWxhdGl2ZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IGJveCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYGdldEJvdW5kaW5nQ2xpZW50UmVjdCBsZWZ0OiAke2JveC5sZWZ0fSB0b3A6ICR7Ym94LnRvcH0gdzogJHtib3gud30gaDogJHtib3guaH1gKVxyXG4gICAgICAgIGxldCBjb250YWluZXJQb3M7XHJcbiAgICAgICAgaWYgKHVzZURvY1JlbGF0aXZlKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lclBvcyA9IHsgdG9wOiBib3gudG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCwgbGVmdDogYm94LmxlZnQgfTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYGdldENlbGxGcm9tUGl4ZWwgc2Nyb2xsVG9wOiAke2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3B9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lclBvcyA9IHsgdG9wOiB0aGlzLmVsLm9mZnNldFRvcCwgbGVmdDogdGhpcy5lbC5vZmZzZXRMZWZ0IH07XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBnZXRDZWxsRnJvbVBpeGVsIG9mZnNldFRvcDogJHtjb250YWluZXJQb3MubGVmdH0gb2Zmc2V0TGVmdDogJHtjb250YWluZXJQb3MudG9wfWApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZWxhdGl2ZUxlZnQgPSBwb3NpdGlvbi5sZWZ0IC0gY29udGFpbmVyUG9zLmxlZnQ7XHJcbiAgICAgICAgbGV0IHJlbGF0aXZlVG9wID0gcG9zaXRpb24udG9wIC0gY29udGFpbmVyUG9zLnRvcDtcclxuICAgICAgICBsZXQgY29sdW1uV2lkdGggPSAoYm94LndpZHRoIC8gdGhpcy5nZXRDb2x1bW4oKSk7XHJcbiAgICAgICAgbGV0IHJvd0hlaWdodCA9IChib3guaGVpZ2h0IC8gcGFyc2VJbnQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2dzLWN1cnJlbnQtcm93JykpKTtcclxuICAgICAgICByZXR1cm4geyB4OiBNYXRoLmZsb29yKHJlbGF0aXZlTGVmdCAvIGNvbHVtbldpZHRoKSwgeTogTWF0aC5mbG9vcihyZWxhdGl2ZVRvcCAvIHJvd0hlaWdodCkgfTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIHRoZSBjdXJyZW50IG51bWJlciBvZiByb3dzLCB3aGljaCB3aWxsIGJlIGF0IGxlYXN0IGBtaW5Sb3dgIGlmIHNldCAqL1xyXG4gICAgZ2V0Um93KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0aGlzLmVuZ2luZS5nZXRSb3coKSwgdGhpcy5vcHRzLm1pblJvdyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiBzcGVjaWZpZWQgYXJlYSBpcyBlbXB0eS5cclxuICAgICAqIEBwYXJhbSB4IHRoZSBwb3NpdGlvbiB4LlxyXG4gICAgICogQHBhcmFtIHkgdGhlIHBvc2l0aW9uIHkuXHJcbiAgICAgKiBAcGFyYW0gdyB0aGUgd2lkdGggb2YgdG8gY2hlY2tcclxuICAgICAqIEBwYXJhbSBoIHRoZSBoZWlnaHQgb2YgdG8gY2hlY2tcclxuICAgICAqL1xyXG4gICAgaXNBcmVhRW1wdHkoeCwgeSwgdywgaCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZ2luZS5pc0FyZWFFbXB0eSh4LCB5LCB3LCBoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSWYgeW91IGFkZCBlbGVtZW50cyB0byB5b3VyIGdyaWQgYnkgaGFuZCwgeW91IGhhdmUgdG8gdGVsbCBncmlkc3RhY2sgYWZ0ZXJ3YXJkcyB0byBtYWtlIHRoZW0gd2lkZ2V0cy5cclxuICAgICAqIElmIHlvdSB3YW50IGdyaWRzdGFjayB0byBhZGQgdGhlIGVsZW1lbnRzIGZvciB5b3UsIHVzZSBgYWRkV2lkZ2V0KClgIGluc3RlYWQuXHJcbiAgICAgKiBNYWtlcyB0aGUgZ2l2ZW4gZWxlbWVudCBhIHdpZGdldCBhbmQgcmV0dXJucyBpdC5cclxuICAgICAqIEBwYXJhbSBlbHMgd2lkZ2V0IG9yIHNpbmdsZSBzZWxlY3RvciB0byBjb252ZXJ0LlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBsZXQgZ3JpZCA9IEdyaWRTdGFjay5pbml0KCk7XHJcbiAgICAgKiBncmlkLmVsLmFwcGVuZENoaWxkKCc8ZGl2IGlkPVwiZ3NpLTFcIiBncy13PVwiM1wiPjwvZGl2PicpO1xyXG4gICAgICogZ3JpZC5tYWtlV2lkZ2V0KCcjZ3NpLTEnKTtcclxuICAgICAqL1xyXG4gICAgbWFrZVdpZGdldChlbHMpIHtcclxuICAgICAgICBsZXQgZWwgPSBHcmlkU3RhY2suZ2V0RWxlbWVudChlbHMpO1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVFbGVtZW50KGVsLCB0cnVlKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICB0aGlzLl90cmlnZ2VyQWRkRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICByZXR1cm4gZWw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEV2ZW50IGhhbmRsZXIgdGhhdCBleHRyYWN0cyBvdXIgQ3VzdG9tRXZlbnQgZGF0YSBvdXQgYXV0b21hdGljYWxseSBmb3IgcmVjZWl2aW5nIGN1c3RvbVxyXG4gICAgICogbm90aWZpY2F0aW9ucyAoc2VlIGRvYyBmb3Igc3VwcG9ydGVkIGV2ZW50cylcclxuICAgICAqIEBwYXJhbSBuYW1lIG9mIHRoZSBldmVudCAoc2VlIHBvc3NpYmxlIHZhbHVlcykgb3IgbGlzdCBvZiBuYW1lcyBzcGFjZSBzZXBhcmF0ZWRcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2l0aCBldmVudCBhbmQgb3B0aW9uYWwgc2Vjb25kL3RoaXJkIHBhcmFtXHJcbiAgICAgKiAoc2VlIFJFQURNRSBkb2N1bWVudGF0aW9uIGZvciBlYWNoIHNpZ25hdHVyZSkuXHJcbiAgICAgKlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGdyaWQub24oJ2FkZGVkJywgZnVuY3Rpb24oZSwgaXRlbXMpIHsgbG9nKCdhZGRlZCAnLCBpdGVtcyl9ICk7XHJcbiAgICAgKiBvclxyXG4gICAgICogZ3JpZC5vbignYWRkZWQgcmVtb3ZlZCBjaGFuZ2UnLCBmdW5jdGlvbihlLCBpdGVtcykgeyBsb2coZS50eXBlLCBpdGVtcyl9ICk7XHJcbiAgICAgKlxyXG4gICAgICogTm90ZTogaW4gc29tZSBjYXNlcyBpdCBpcyB0aGUgc2FtZSBhcyBjYWxsaW5nIG5hdGl2ZSBoYW5kbGVyIGFuZCBwYXJzaW5nIHRoZSBldmVudC5cclxuICAgICAqIGdyaWQuZWwuYWRkRXZlbnRMaXN0ZW5lcignYWRkZWQnLCBmdW5jdGlvbihldmVudCkgeyBsb2coJ2FkZGVkICcsIGV2ZW50LmRldGFpbCl9ICk7XHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBvbihuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgIC8vIGNoZWNrIGZvciBhcnJheSBvZiBuYW1lcyBiZWluZyBwYXNzZWQgaW5zdGVhZFxyXG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJyAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzID0gbmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4gdGhpcy5vbihuYW1lLCBjYWxsYmFjaykpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5hbWUgPT09ICdjaGFuZ2UnIHx8IG5hbWUgPT09ICdhZGRlZCcgfHwgbmFtZSA9PT0gJ3JlbW92ZWQnIHx8IG5hbWUgPT09ICdlbmFibGUnIHx8IG5hbWUgPT09ICdkaXNhYmxlJykge1xyXG4gICAgICAgICAgICAvLyBuYXRpdmUgQ3VzdG9tRXZlbnQgaGFuZGxlcnMgLSBjYXNoIHRoZSBnZW5lcmljIGhhbmRsZXJzIHNvIHdlIGNhbiBlYXNpbHkgcmVtb3ZlXHJcbiAgICAgICAgICAgIGxldCBub0RhdGEgPSAobmFtZSA9PT0gJ2VuYWJsZScgfHwgbmFtZSA9PT0gJ2Rpc2FibGUnKTtcclxuICAgICAgICAgICAgaWYgKG5vRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV0gPSAoZXZlbnQpID0+IGNhbGxiYWNrKGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dzRXZlbnRIYW5kbGVyW25hbWVdID0gKGV2ZW50KSA9PiBjYWxsYmFjayhldmVudCwgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgdGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lID09PSAnZHJhZycgfHwgbmFtZSA9PT0gJ2RyYWdzdGFydCcgfHwgbmFtZSA9PT0gJ2RyYWdzdG9wJyB8fCBuYW1lID09PSAncmVzaXplc3RhcnQnIHx8IG5hbWUgPT09ICdyZXNpemUnIHx8IG5hbWUgPT09ICdyZXNpemVzdG9wJyB8fCBuYW1lID09PSAnZHJvcHBlZCcpIHtcclxuICAgICAgICAgICAgLy8gZHJhZyZkcm9wIHN0b3AgZXZlbnRzIE5FRUQgdG8gYmUgY2FsbCB0aGVtIEFGVEVSIHdlIHVwZGF0ZSBub2RlIGF0dHJpYnV0ZXMgc28gaGFuZGxlIHRoZW0gb3Vyc2VsZi5cclxuICAgICAgICAgICAgLy8gZG8gc2FtZSBmb3Igc3RhcnQgZXZlbnQgdG8gbWFrZSBpdCBlYXNpZXIuLi5cclxuICAgICAgICAgICAgdGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV0gPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHcmlkU3RhY2sub24oJyArIG5hbWUgKyAnKSBldmVudCBub3Qgc3VwcG9ydGVkLCBidXQgeW91IGNhbiBzdGlsbCB1c2UgJChcIi5ncmlkLXN0YWNrXCIpLm9uKC4uLikgd2hpbGUganF1ZXJ5LXVpIGlzIHN0aWxsIHVzZWQgaW50ZXJuYWxseS4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHVuc3Vic2NyaWJlIGZyb20gdGhlICdvbicgZXZlbnQgYmVsb3dcclxuICAgICAqIEBwYXJhbSBuYW1lIG9mIHRoZSBldmVudCAoc2VlIHBvc3NpYmxlIHZhbHVlcylcclxuICAgICAqL1xyXG4gICAgb2ZmKG5hbWUpIHtcclxuICAgICAgICAvLyBjaGVjayBmb3IgYXJyYXkgb2YgbmFtZXMgYmVpbmcgcGFzc2VkIGluc3RlYWRcclxuICAgICAgICBpZiAobmFtZS5pbmRleE9mKCcgJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lcyA9IG5hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgbmFtZXMuZm9yRWFjaChuYW1lID0+IHRoaXMub2ZmKG5hbWUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuYW1lID09PSAnY2hhbmdlJyB8fCBuYW1lID09PSAnYWRkZWQnIHx8IG5hbWUgPT09ICdyZW1vdmVkJyB8fCBuYW1lID09PSAnZW5hYmxlJyB8fCBuYW1lID09PSAnZGlzYWJsZScpIHtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIG5hdGl2ZSBDdXN0b21FdmVudCBoYW5kbGVyc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB0aGlzLl9nc0V2ZW50SGFuZGxlcltuYW1lXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2dzRXZlbnRIYW5kbGVyW25hbWVdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHdpZGdldCBmcm9tIHRoZSBncmlkLlxyXG4gICAgICogQHBhcmFtIGVsICB3aWRnZXQgb3Igc2VsZWN0b3IgdG8gbW9kaWZ5XHJcbiAgICAgKiBAcGFyYW0gcmVtb3ZlRE9NIGlmIGBmYWxzZWAgRE9NIGVsZW1lbnQgd29uJ3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmVlIChEZWZhdWx0PyB0cnVlKS5cclxuICAgICAqIEBwYXJhbSB0cmlnZ2VyRXZlbnQgaWYgYGZhbHNlYCAocXVpZXQgbW9kZSkgZWxlbWVudCB3aWxsIG5vdCBiZSBhZGRlZCB0byByZW1vdmVkIGxpc3QgYW5kIG5vICdyZW1vdmVkJyBjYWxsYmFja3Mgd2lsbCBiZSBjYWxsZWQgKERlZmF1bHQ/IHRydWUpLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVXaWRnZXQoZWxzLCByZW1vdmVET00gPSB0cnVlLCB0cmlnZ2VyRXZlbnQgPSB0cnVlKSB7XHJcbiAgICAgICAgR3JpZFN0YWNrLmdldEVsZW1lbnRzKGVscykuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbC5wYXJlbnRFbGVtZW50ICYmIGVsLnBhcmVudEVsZW1lbnQgIT09IHRoaXMuZWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIG5vdCBvdXIgY2hpbGQhXHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgLy8gRm9yIE1ldGVvciBzdXBwb3J0OiBodHRwczovL2dpdGh1Yi5jb20vZ3JpZHN0YWNrL2dyaWRzdGFjay5qcy9wdWxsLzI3MlxyXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSB0aGlzLmVuZ2luZS5ub2Rlcy5maW5kKG4gPT4gZWwgPT09IG4uZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIG91ciBET00gZGF0YSAoY2lyY3VsYXIgbGluaykgYW5kIGRyYWcmZHJvcCBwZXJtYW5lbnRseVxyXG4gICAgICAgICAgICBkZWxldGUgZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlREQoZWwpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVOb2RlKG5vZGUsIHJlbW92ZURPTSwgdHJpZ2dlckV2ZW50KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZURPTSAmJiBlbC5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmUoKTsgLy8gaW4gYmF0Y2ggbW9kZSBlbmdpbmUucmVtb3ZlTm9kZSBkb2Vzbid0IGNhbGwgYmFjayB0byByZW1vdmUgRE9NXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodHJpZ2dlckV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJSZW1vdmVFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIHdpZGdldHMgZnJvbSB0aGUgZ3JpZC5cclxuICAgICAqIEBwYXJhbSByZW1vdmVET00gaWYgYGZhbHNlYCBET00gZWxlbWVudHMgd29uJ3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmVlIChEZWZhdWx0PyBgdHJ1ZWApLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVBbGwocmVtb3ZlRE9NID0gdHJ1ZSkge1xyXG4gICAgICAgIC8vIGFsd2F5cyByZW1vdmUgb3VyIERPTSBkYXRhIChjaXJjdWxhciBsaW5rKSBiZWZvcmUgbGlzdCBnZXRzIGVtcHRpZWQgYW5kIGRyYWcmZHJvcCBwZXJtYW5lbnRseVxyXG4gICAgICAgIHRoaXMuZW5naW5lLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLmVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUREKG4uZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUFsbChyZW1vdmVET00pO1xyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJSZW1vdmVFdmVudCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGUgdGhlIGdyaWQgYW5pbWF0aW9uIHN0YXRlLiAgVG9nZ2xlcyB0aGUgYGdyaWQtc3RhY2stYW5pbWF0ZWAgY2xhc3MuXHJcbiAgICAgKiBAcGFyYW0gZG9BbmltYXRlIGlmIHRydWUgdGhlIGdyaWQgd2lsbCBhbmltYXRlLlxyXG4gICAgICovXHJcbiAgICBzZXRBbmltYXRpb24oZG9BbmltYXRlKSB7XHJcbiAgICAgICAgaWYgKGRvQW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2stYW5pbWF0ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLXN0YWNrLWFuaW1hdGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZSB0aGUgZ3JpZCBzdGF0aWMgc3RhdGUsIHdoaWNoIHBlcm1hbmVudGx5IHJlbW92ZXMvYWRkIERyYWcmRHJvcCBzdXBwb3J0LCB1bmxpa2UgZGlzYWJsZSgpL2VuYWJsZSgpIHRoYXQganVzdCB0dXJucyBpdCBvZmYvb24uXHJcbiAgICAgKiBBbHNvIHRvZ2dsZSB0aGUgZ3JpZC1zdGFjay1zdGF0aWMgY2xhc3MuXHJcbiAgICAgKiBAcGFyYW0gdmFsIGlmIHRydWUgdGhlIGdyaWQgYmVjb21lIHN0YXRpYy5cclxuICAgICAqIEBwYXJhbSB1cGRhdGVDbGFzcyB0cnVlIChkZWZhdWx0KSBpZiBjc3MgY2xhc3MgZ2V0cyB1cGRhdGVkXHJcbiAgICAgKiBAcGFyYW0gcmVjdXJzZSB0cnVlIChkZWZhdWx0KSBpZiBzdWItZ3JpZHMgYWxzbyBnZXQgdXBkYXRlZFxyXG4gICAgICovXHJcbiAgICBzZXRTdGF0aWModmFsLCB1cGRhdGVDbGFzcyA9IHRydWUsIHJlY3Vyc2UgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkID09PSB2YWwpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHRoaXMub3B0cy5zdGF0aWNHcmlkID0gdmFsO1xyXG4gICAgICAgIHRoaXMuX3NldHVwUmVtb3ZlRHJvcCgpO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQWNjZXB0V2lkZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZURyYWdEcm9wQnlOb2RlKG4pOyAvLyBlaXRoZXIgZGVsZXRlIG9yIGluaXQgRHJhZyZkcm9wXHJcbiAgICAgICAgICAgIGlmIChuLnN1YkdyaWQgJiYgcmVjdXJzZSlcclxuICAgICAgICAgICAgICAgIG4uc3ViR3JpZC5zZXRTdGF0aWModmFsLCB1cGRhdGVDbGFzcywgcmVjdXJzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHVwZGF0ZUNsYXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFN0YXRpY0NsYXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHdpZGdldCBwb3NpdGlvbi9zaXplIGFuZCBvdGhlciBpbmZvLiBOb3RlOiBpZiB5b3UgbmVlZCB0byBjYWxsIHRoaXMgb24gYWxsIG5vZGVzLCB1c2UgbG9hZCgpIGluc3RlYWQgd2hpY2ggd2lsbCB1cGRhdGUgd2hhdCBjaGFuZ2VkLlxyXG4gICAgICogQHBhcmFtIGVscyAgd2lkZ2V0IG9yIHNlbGVjdG9yIG9mIG9iamVjdHMgdG8gbW9kaWZ5IChub3RlOiBzZXR0aW5nIHRoZSBzYW1lIHgseSBmb3IgbXVsdGlwbGUgaXRlbXMgd2lsbCBiZSBpbmRldGVybWluaXN0aWMgYW5kIGxpa2VseSB1bndhbnRlZClcclxuICAgICAqIEBwYXJhbSBvcHQgbmV3IHdpZGdldCBvcHRpb25zICh4LHksdyxoLCBldGMuLikuIE9ubHkgdGhvc2Ugc2V0IHdpbGwgYmUgdXBkYXRlZC5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlKGVscywgb3B0KSB7XHJcbiAgICAgICAgLy8gc3VwcG9ydCBsZWdhY3kgY2FsbCBmb3Igbm93ID9cclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdncmlkc3RhY2sudHM6IGB1cGRhdGUoZWwsIHgsIHksIHcsIGgpYCBpcyBkZXByZWNhdGVkLiBVc2UgYHVwZGF0ZShlbCwge3gsIHcsIGNvbnRlbnQsIC4uLn0pYC4gSXQgd2lsbCBiZSByZW1vdmVkIHNvb24nKTtcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xyXG4gICAgICAgICAgICBsZXQgYSA9IGFyZ3VtZW50cywgaSA9IDE7XHJcbiAgICAgICAgICAgIG9wdCA9IHsgeDogYVtpKytdLCB5OiBhW2krK10sIHc6IGFbaSsrXSwgaDogYVtpKytdIH07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShlbHMsIG9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEdyaWRTdGFjay5nZXRFbGVtZW50cyhlbHMpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVsIHx8ICFlbC5ncmlkc3RhY2tOb2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgbiA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIGxldCB3ID0gdXRpbHNfMS5VdGlscy5jbG9uZURlZXAob3B0KTsgLy8gbWFrZSBhIGNvcHkgd2UgY2FuIG1vZGlmeSBpbiBjYXNlIHRoZXkgcmUtdXNlIGl0IG9yIG11bHRpcGxlIGl0ZW1zXHJcbiAgICAgICAgICAgIGRlbGV0ZSB3LmF1dG9Qb3NpdGlvbjtcclxuICAgICAgICAgICAgLy8gbW92ZS9yZXNpemUgd2lkZ2V0IGlmIGFueXRoaW5nIGNoYW5nZWRcclxuICAgICAgICAgICAgbGV0IGtleXMgPSBbJ3gnLCAneScsICd3JywgJ2gnXTtcclxuICAgICAgICAgICAgbGV0IG07XHJcbiAgICAgICAgICAgIGlmIChrZXlzLnNvbWUoayA9PiB3W2tdICE9PSB1bmRlZmluZWQgJiYgd1trXSAhPT0gbltrXSkpIHtcclxuICAgICAgICAgICAgICAgIG0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGtleXMuZm9yRWFjaChrID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtW2tdID0gKHdba10gIT09IHVuZGVmaW5lZCkgPyB3W2tdIDogbltrXTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd1trXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZvciBhIG1vdmUgYXMgd2VsbCBJRkYgdGhlcmUgaXMgYW55IG1pbi9tYXggZmllbGRzIHNldFxyXG4gICAgICAgICAgICBpZiAoIW0gJiYgKHcubWluVyB8fCB3Lm1pbkggfHwgdy5tYXhXIHx8IHcubWF4SCkpIHtcclxuICAgICAgICAgICAgICAgIG0gPSB7fTsgLy8gd2lsbCB1c2Ugbm9kZSBwb3NpdGlvbiBidXQgdmFsaWRhdGUgdmFsdWVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNvbnRlbnQgY2hhbmdpbmdcclxuICAgICAgICAgICAgaWYgKHcuY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN1YiA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5ncmlkLXN0YWNrLWl0ZW0tY29udGVudCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1YiAmJiBzdWIuaW5uZXJIVE1MICE9PSB3LmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWIuaW5uZXJIVE1MID0gdy5jb250ZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHcuY29udGVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBhbnkgcmVtYWluaW5nIGZpZWxkcyBhcmUgYXNzaWduZWQsIGJ1dCBjaGVjayBmb3IgZHJhZ2dpbmcgY2hhbmdlcywgcmVzaXplIGNvbnN0cmFpblxyXG4gICAgICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgZGRDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXlbMF0gIT09ICdfJyAmJiBuW2tleV0gIT09IHdba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ba2V5XSA9IHdba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBkZENoYW5nZWQgPSBkZENoYW5nZWQgfHwgKCF0aGlzLm9wdHMuc3RhdGljR3JpZCAmJiAoa2V5ID09PSAnbm9SZXNpemUnIHx8IGtleSA9PT0gJ25vTW92ZScgfHwga2V5ID09PSAnbG9ja2VkJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZpbmFsbHkgbW92ZSB0aGUgd2lkZ2V0XHJcbiAgICAgICAgICAgIGlmIChtKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5jbGVhbk5vZGVzKClcclxuICAgICAgICAgICAgICAgICAgICAuYmVnaW5VcGRhdGUobilcclxuICAgICAgICAgICAgICAgICAgICAubW92ZU5vZGUobiwgbSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUuZW5kVXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHsgLy8gbW92ZSB3aWxsIG9ubHkgdXBkYXRlIHgseSx3LGggc28gdXBkYXRlIHRoZSByZXN0IHRvb1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd3JpdGVBdHRyKGVsLCBuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGRDaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgbWFyZ2lucyB3aGljaCB3aWxsIHNldCBhbGwgNCBzaWRlcyBhdCBvbmNlIC0gc2VlIGBHcmlkU3RhY2tPcHRpb25zLm1hcmdpbmAgZm9yIGZvcm1hdCBvcHRpb25zIChDU1Mgc3RyaW5nIGZvcm1hdCBvZiAxLDIsNCB2YWx1ZXMgb3Igc2luZ2xlIG51bWJlcikuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgbWFyZ2luIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIG1hcmdpbih2YWx1ZSkge1xyXG4gICAgICAgIGxldCBpc011bHRpVmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5zcGxpdCgnICcpLmxlbmd0aCA+IDEpO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGNhbiBza2lwIHJlLWNyZWF0aW5nIG91ciBDU1MgZmlsZS4uLiB3b24ndCBjaGVjayBpZiBtdWx0aSB2YWx1ZXMgKHRvbyBtdWNoIGhhc3NsZSlcclxuICAgICAgICBpZiAoIWlzTXVsdGlWYWx1ZSkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm1hcmdpblVuaXQgPT09IGRhdGEudW5pdCAmJiB0aGlzLm9wdHMubWFyZ2luID09PSBkYXRhLmgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJlLXVzZSBleGlzdGluZyBtYXJnaW4gaGFuZGxpbmdcclxuICAgICAgICB0aGlzLm9wdHMubWFyZ2luID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5vcHRzLm1hcmdpblRvcCA9IHRoaXMub3B0cy5tYXJnaW5Cb3R0b20gPSB0aGlzLm9wdHMubWFyZ2luTGVmdCA9IHRoaXMub3B0cy5tYXJnaW5SaWdodCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9pbml0TWFyZ2luKCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3R5bGVzKHRydWUpOyAvLyB0cnVlID0gZm9yY2UgcmUtY3JlYXRlXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyBjdXJyZW50IG1hcmdpbiBudW1iZXIgdmFsdWUgKHVuZGVmaW5lZCBpZiA0IHNpZGVzIGRvbid0IG1hdGNoKSAqL1xyXG4gICAgZ2V0TWFyZ2luKCkgeyByZXR1cm4gdGhpcy5vcHRzLm1hcmdpbjsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGhlaWdodCBvZiB0aGUgZ3JpZCB3aWxsIGJlIGxlc3MgdGhhbiB0aGUgdmVydGljYWxcclxuICAgICAqIGNvbnN0cmFpbnQuIEFsd2F5cyByZXR1cm5zIHRydWUgaWYgZ3JpZCBkb2Vzbid0IGhhdmUgaGVpZ2h0IGNvbnN0cmFpbnQuXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBjb250YWlucyB4LHksdyxoLGF1dG8tcG9zaXRpb24gb3B0aW9uc1xyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBpZiAoZ3JpZC53aWxsSXRGaXQobmV3V2lkZ2V0KSkge1xyXG4gICAgICogICBncmlkLmFkZFdpZGdldChuZXdXaWRnZXQpO1xyXG4gICAgICogfSBlbHNlIHtcclxuICAgICAqICAgYWxlcnQoJ05vdCBlbm91Z2ggZnJlZSBzcGFjZSB0byBwbGFjZSB0aGUgd2lkZ2V0Jyk7XHJcbiAgICAgKiB9XHJcbiAgICAgKi9cclxuICAgIHdpbGxJdEZpdChub2RlKSB7XHJcbiAgICAgICAgLy8gc3VwcG9ydCBsZWdhY3kgY2FsbCBmb3Igbm93XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ3JpZHN0YWNrLnRzOiBgd2lsbEl0Rml0KHgseSx3LGgsYXV0b1Bvc2l0aW9uKWAgaXMgZGVwcmVjYXRlZC4gVXNlIGB3aWxsSXRGaXQoe3gsIHksLi4ufSlgLiBJdCB3aWxsIGJlIHJlbW92ZWQgc29vbicpO1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXHJcbiAgICAgICAgICAgIGxldCBhID0gYXJndW1lbnRzLCBpID0gMCwgdyA9IHsgeDogYVtpKytdLCB5OiBhW2krK10sIHc6IGFbaSsrXSwgaDogYVtpKytdLCBhdXRvUG9zaXRpb246IGFbaSsrXSB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWxsSXRGaXQodyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZ2luZS53aWxsSXRGaXQobm9kZSk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdHJpZ2dlckNoYW5nZUV2ZW50KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVuZ2luZS5iYXRjaE1vZGUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGxldCBlbGVtZW50cyA9IHRoaXMuZW5naW5lLmdldERpcnR5Tm9kZXModHJ1ZSk7IC8vIHZlcmlmeSB0aGV5IHJlYWxseSBjaGFuZ2VkXHJcbiAgICAgICAgaWYgKGVsZW1lbnRzICYmIGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5sYXlvdXRzTm9kZXNDaGFuZ2UoZWxlbWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnY2hhbmdlJywgZWxlbWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVuZ2luZS5zYXZlSW5pdGlhbCgpOyAvLyB3ZSBjYWxsZWQsIG5vdyByZXNldCBpbml0aWFsIHZhbHVlcyAmIGRpcnR5IGZsYWdzXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdHJpZ2dlckFkZEV2ZW50KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVuZ2luZS5iYXRjaE1vZGUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGlmICh0aGlzLmVuZ2luZS5hZGRlZE5vZGVzICYmIHRoaXMuZW5naW5lLmFkZGVkTm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5sYXlvdXRzTm9kZXNDaGFuZ2UodGhpcy5lbmdpbmUuYWRkZWROb2Rlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gcHJldmVudCBhZGRlZCBub2RlcyBmcm9tIGFsc28gdHJpZ2dlcmluZyAnY2hhbmdlJyBldmVudCAod2hpY2ggaXMgY2FsbGVkIG5leHQpXHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmFkZGVkTm9kZXMuZm9yRWFjaChuID0+IHsgZGVsZXRlIG4uX2RpcnR5OyB9KTtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdhZGRlZCcsIHRoaXMuZW5naW5lLmFkZGVkTm9kZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5hZGRlZE5vZGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3RyaWdnZXJSZW1vdmVFdmVudCgpIHtcclxuICAgICAgICBpZiAodGhpcy5lbmdpbmUuYmF0Y2hNb2RlKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICBpZiAodGhpcy5lbmdpbmUucmVtb3ZlZE5vZGVzICYmIHRoaXMuZW5naW5lLnJlbW92ZWROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgncmVtb3ZlZCcsIHRoaXMuZW5naW5lLnJlbW92ZWROb2Rlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF90cmlnZ2VyRXZlbnQodHlwZSwgZGF0YSkge1xyXG4gICAgICAgIGxldCBldmVudCA9IGRhdGEgPyBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBidWJibGVzOiBmYWxzZSwgZGV0YWlsOiBkYXRhIH0pIDogbmV3IEV2ZW50KHR5cGUpO1xyXG4gICAgICAgIHRoaXMuZWwuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB0byBkZWxldGUgdGhlIGN1cnJlbnQgZHluYW1pYyBzdHlsZSBzaGVldCB1c2VkIGZvciBvdXIgbGF5b3V0ICovXHJcbiAgICBfcmVtb3ZlU3R5bGVzaGVldCgpIHtcclxuICAgICAgICBpZiAodGhpcy5fc3R5bGVzKSB7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlU3R5bGVzaGVldCh0aGlzLl9zdHlsZVNoZWV0Q2xhc3MpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fc3R5bGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgdXBkYXRlZC9jcmVhdGUgdGhlIENTUyBzdHlsZXMgZm9yIHJvdyBiYXNlZCBsYXlvdXQgYW5kIGluaXRpYWwgbWFyZ2luIHNldHRpbmcgKi9cclxuICAgIF91cGRhdGVTdHlsZXMoZm9yY2VVcGRhdGUgPSBmYWxzZSwgbWF4SCkge1xyXG4gICAgICAgIC8vIGNhbGwgdG8gZGVsZXRlIGV4aXN0aW5nIG9uZSBpZiB3ZSBjaGFuZ2UgY2VsbEhlaWdodCAvIG1hcmdpblxyXG4gICAgICAgIGlmIChmb3JjZVVwZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVTdHlsZXNoZWV0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbWF4SClcclxuICAgICAgICAgICAgbWF4SCA9IHRoaXMuZ2V0Um93KCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgLy8gaWYgdXNlciBpcyB0ZWxsaW5nIHVzIHRoZXkgd2lsbCBoYW5kbGUgdGhlIENTUyB0aGVtc2VsdmVzIGJ5IHNldHRpbmcgaGVpZ2h0cyB0byAwLiBEbyB3ZSBuZWVkIHRoaXMgb3B0cyByZWFsbHkgPz9cclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNlbGxIZWlnaHQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjZWxsSGVpZ2h0ID0gdGhpcy5vcHRzLmNlbGxIZWlnaHQ7XHJcbiAgICAgICAgbGV0IGNlbGxIZWlnaHRVbml0ID0gdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0O1xyXG4gICAgICAgIGxldCBwcmVmaXggPSBgLiR7dGhpcy5fc3R5bGVTaGVldENsYXNzfSA+IC4ke3RoaXMub3B0cy5pdGVtQ2xhc3N9YDtcclxuICAgICAgICAvLyBjcmVhdGUgb25lIGFzIG5lZWRlZFxyXG4gICAgICAgIGlmICghdGhpcy5fc3R5bGVzKSB7XHJcbiAgICAgICAgICAgIC8vIGluc2VydCBzdHlsZSB0byBwYXJlbnQgKGluc3RlYWQgb2YgJ2hlYWQnIGJ5IGRlZmF1bHQpIHRvIHN1cHBvcnQgV2ViQ29tcG9uZW50XHJcbiAgICAgICAgICAgIGxldCBzdHlsZUxvY2F0aW9uID0gdGhpcy5vcHRzLnN0eWxlSW5IZWFkID8gdW5kZWZpbmVkIDogdGhpcy5lbC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB0aGlzLl9zdHlsZXMgPSB1dGlsc18xLlV0aWxzLmNyZWF0ZVN0eWxlc2hlZXQodGhpcy5fc3R5bGVTaGVldENsYXNzLCBzdHlsZUxvY2F0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICBub25jZTogdGhpcy5vcHRzLm5vbmNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9zdHlsZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5fc3R5bGVzLl9tYXggPSAwO1xyXG4gICAgICAgICAgICAvLyB0aGVzZSBhcmUgZG9uZSBvbmNlIG9ubHlcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgcHJlZml4LCBgbWluLWhlaWdodDogJHtjZWxsSGVpZ2h0fSR7Y2VsbEhlaWdodFVuaXR9YCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnRlbnQgbWFyZ2luc1xyXG4gICAgICAgICAgICBsZXQgdG9wID0gdGhpcy5vcHRzLm1hcmdpblRvcCArIHRoaXMub3B0cy5tYXJnaW5Vbml0O1xyXG4gICAgICAgICAgICBsZXQgYm90dG9tID0gdGhpcy5vcHRzLm1hcmdpbkJvdHRvbSArIHRoaXMub3B0cy5tYXJnaW5Vbml0O1xyXG4gICAgICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLm9wdHMubWFyZ2luUmlnaHQgKyB0aGlzLm9wdHMubWFyZ2luVW5pdDtcclxuICAgICAgICAgICAgbGV0IGxlZnQgPSB0aGlzLm9wdHMubWFyZ2luTGVmdCArIHRoaXMub3B0cy5tYXJnaW5Vbml0O1xyXG4gICAgICAgICAgICBsZXQgY29udGVudCA9IGAke3ByZWZpeH0gPiAuZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnRgO1xyXG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXIgPSBgLiR7dGhpcy5fc3R5bGVTaGVldENsYXNzfSA+IC5ncmlkLXN0YWNrLXBsYWNlaG9sZGVyID4gLnBsYWNlaG9sZGVyLWNvbnRlbnRgO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBjb250ZW50LCBgdG9wOiAke3RvcH07IHJpZ2h0OiAke3JpZ2h0fTsgYm90dG9tOiAke2JvdHRvbX07IGxlZnQ6ICR7bGVmdH07YCk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIHBsYWNlaG9sZGVyLCBgdG9wOiAke3RvcH07IHJpZ2h0OiAke3JpZ2h0fTsgYm90dG9tOiAke2JvdHRvbX07IGxlZnQ6ICR7bGVmdH07YCk7XHJcbiAgICAgICAgICAgIC8vIHJlc2l6ZSBoYW5kbGVzIG9mZnNldCAodG8gbWF0Y2ggbWFyZ2luKVxyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9ID4gLnVpLXJlc2l6YWJsZS1uZWAsIGByaWdodDogJHtyaWdodH1gKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fSA+IC51aS1yZXNpemFibGUtZWAsIGByaWdodDogJHtyaWdodH1gKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fSA+IC51aS1yZXNpemFibGUtc2VgLCBgcmlnaHQ6ICR7cmlnaHR9OyBib3R0b206ICR7Ym90dG9tfWApO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9ID4gLnVpLXJlc2l6YWJsZS1ud2AsIGBsZWZ0OiAke2xlZnR9YCk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH0gPiAudWktcmVzaXphYmxlLXdgLCBgbGVmdDogJHtsZWZ0fWApO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9ID4gLnVpLXJlc2l6YWJsZS1zd2AsIGBsZWZ0OiAke2xlZnR9OyBib3R0b206ICR7Ym90dG9tfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgdXBkYXRlIHRoZSBoZWlnaHQgc3BlY2lmaWMgZmllbGRzXHJcbiAgICAgICAgbWF4SCA9IG1heEggfHwgdGhpcy5fc3R5bGVzLl9tYXg7XHJcbiAgICAgICAgaWYgKG1heEggPiB0aGlzLl9zdHlsZXMuX21heCkge1xyXG4gICAgICAgICAgICBsZXQgZ2V0SGVpZ2h0ID0gKHJvd3MpID0+IChjZWxsSGVpZ2h0ICogcm93cykgKyBjZWxsSGVpZ2h0VW5pdDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX3N0eWxlcy5fbWF4ICsgMTsgaSA8PSBtYXhIOyBpKyspIHsgLy8gc3RhcnQgYXQgMVxyXG4gICAgICAgICAgICAgICAgbGV0IGggPSBnZXRIZWlnaHQoaSk7XHJcbiAgICAgICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9W2dzLXk9XCIke2kgLSAxfVwiXWAsIGB0b3A6ICR7Z2V0SGVpZ2h0KGkgLSAxKX1gKTsgLy8gc3RhcnQgYXQgMFxyXG4gICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fVtncy1oPVwiJHtpfVwiXWAsIGBoZWlnaHQ6ICR7aH1gKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH1bZ3MtbWluLWg9XCIke2l9XCJdYCwgYG1pbi1oZWlnaHQ6ICR7aH1gKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH1bZ3MtbWF4LWg9XCIke2l9XCJdYCwgYG1heC1oZWlnaHQ6ICR7aH1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zdHlsZXMuX21heCA9IG1heEg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3VwZGF0ZUNvbnRhaW5lckhlaWdodCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZW5naW5lIHx8IHRoaXMuZW5naW5lLmJhdGNoTW9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IHJvdyA9IHRoaXMuZ2V0Um93KCkgKyB0aGlzLl9leHRyYURyYWdSb3c7IC8vIGNoZWNrcyBmb3IgbWluUm93IGFscmVhZHlcclxuICAgICAgICAvLyBjaGVjayBmb3IgY3NzIG1pbiBoZWlnaHRcclxuICAgICAgICAvLyBOb3RlOiB3ZSBkb24ndCBoYW5kbGUgJSxyZW0gY29ycmVjdGx5IHNvIGNvbW1lbnQgb3V0LCBiZXNpZGUgd2UgZG9uJ3QgbmVlZCBuZWVkIHRvIGNyZWF0ZSB1bi1uZWNlc3NhcnlcclxuICAgICAgICAvLyByb3dzIGFzIHRoZSBDU1Mgd2lsbCBtYWtlIHVzIGJpZ2dlciB0aGFuIG91ciBzZXQgaGVpZ2h0IGlmIG5lZWRlZC4uLiBub3Qgc3VyZSB3aHkgd2UgaGFkIHRoaXMuXHJcbiAgICAgICAgLy8gbGV0IGNzc01pbkhlaWdodCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5lbClbJ21pbi1oZWlnaHQnXSk7XHJcbiAgICAgICAgLy8gaWYgKGNzc01pbkhlaWdodCA+IDApIHtcclxuICAgICAgICAvLyAgIGxldCBtaW5Sb3cgPSBNYXRoLnJvdW5kKGNzc01pbkhlaWdodCAvIHRoaXMuZ2V0Q2VsbEhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgLy8gICBpZiAocm93IDwgbWluUm93KSB7XHJcbiAgICAgICAgLy8gICAgIHJvdyA9IG1pblJvdztcclxuICAgICAgICAvLyAgIH1cclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2dzLWN1cnJlbnQtcm93JywgU3RyaW5nKHJvdykpO1xyXG4gICAgICAgIGlmIChyb3cgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbWluLWhlaWdodCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNlbGxIZWlnaHQgPSB0aGlzLm9wdHMuY2VsbEhlaWdodDtcclxuICAgICAgICBsZXQgdW5pdCA9IHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdDtcclxuICAgICAgICBpZiAoIWNlbGxIZWlnaHQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUubWluSGVpZ2h0ID0gcm93ICogY2VsbEhlaWdodCArIHVuaXQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfcHJlcGFyZUVsZW1lbnQoZWwsIHRyaWdnZXJBZGRFdmVudCA9IGZhbHNlLCBub2RlKSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCh0aGlzLm9wdHMuaXRlbUNsYXNzKTtcclxuICAgICAgICBub2RlID0gbm9kZSB8fCB0aGlzLl9yZWFkQXR0cihlbCk7XHJcbiAgICAgICAgZWwuZ3JpZHN0YWNrTm9kZSA9IG5vZGU7XHJcbiAgICAgICAgbm9kZS5lbCA9IGVsO1xyXG4gICAgICAgIG5vZGUuZ3JpZCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlKTtcclxuICAgICAgICBub2RlID0gdGhpcy5lbmdpbmUuYWRkTm9kZShub2RlLCB0cmlnZ2VyQWRkRXZlbnQpO1xyXG4gICAgICAgIC8vIHdyaXRlIG5vZGUgYXR0ciBiYWNrIGluIGNhc2UgdGhlcmUgd2FzIGNvbGxpc2lvbiBvciB3ZSBoYXZlIHRvIGZpeCBiYWQgdmFsdWVzIGR1cmluZyBhZGROb2RlKClcclxuICAgICAgICBpZiAoIXV0aWxzXzEuVXRpbHMuc2FtZShub2RlLCBjb3B5KSkge1xyXG4gICAgICAgICAgICB0aGlzLl93cml0ZUF0dHIoZWwsIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGwgdG8gd3JpdGUgcG9zaXRpb24geCx5LHcsaCBhdHRyaWJ1dGVzIGJhY2sgdG8gZWxlbWVudCAqL1xyXG4gICAgX3dyaXRlUG9zQXR0cihlbCwgbikge1xyXG4gICAgICAgIGlmIChuLnggIT09IHVuZGVmaW5lZCAmJiBuLnggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdncy14JywgU3RyaW5nKG4ueCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobi55ICE9PSB1bmRlZmluZWQgJiYgbi55ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnZ3MteScsIFN0cmluZyhuLnkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG4udykge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2dzLXcnLCBTdHJpbmcobi53KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuLmgpIHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdncy1oJywgU3RyaW5nKG4uaCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbCB0byB3cml0ZSBhbnkgZGVmYXVsdCBhdHRyaWJ1dGVzIGJhY2sgdG8gZWxlbWVudCAqL1xyXG4gICAgX3dyaXRlQXR0cihlbCwgbm9kZSkge1xyXG4gICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKGVsLCBub2RlKTtcclxuICAgICAgICBsZXQgYXR0cnMgLyo6IEdyaWRTdGFja1dpZGdldCBidXQgc3RyaW5ncyAqLyA9IHtcclxuICAgICAgICAgICAgYXV0b1Bvc2l0aW9uOiAnZ3MtYXV0by1wb3NpdGlvbicsXHJcbiAgICAgICAgICAgIG1pblc6ICdncy1taW4tdycsXHJcbiAgICAgICAgICAgIG1pbkg6ICdncy1taW4taCcsXHJcbiAgICAgICAgICAgIG1heFc6ICdncy1tYXgtdycsXHJcbiAgICAgICAgICAgIG1heEg6ICdncy1tYXgtaCcsXHJcbiAgICAgICAgICAgIG5vUmVzaXplOiAnZ3Mtbm8tcmVzaXplJyxcclxuICAgICAgICAgICAgbm9Nb3ZlOiAnZ3Mtbm8tbW92ZScsXHJcbiAgICAgICAgICAgIGxvY2tlZDogJ2dzLWxvY2tlZCcsXHJcbiAgICAgICAgICAgIGlkOiAnZ3MtaWQnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcclxuICAgICAgICAgICAgaWYgKG5vZGVba2V5XSkgeyAvLyAwIGlzIHZhbGlkIGZvciB4LHkgb25seSBidXQgZG9uZSBhYm92ZSBhbHJlYWR5IGFuZCBub3QgaW4gbGlzdCBhbnl3YXlcclxuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyc1trZXldLCBTdHJpbmcobm9kZVtrZXldKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cnNba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGwgdG8gcmVhZCBhbnkgZGVmYXVsdCBhdHRyaWJ1dGVzIGZyb20gZWxlbWVudCAqL1xyXG4gICAgX3JlYWRBdHRyKGVsKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB7fTtcclxuICAgICAgICBub2RlLnggPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MteCcpKTtcclxuICAgICAgICBub2RlLnkgPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MteScpKTtcclxuICAgICAgICBub2RlLncgPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtdycpKTtcclxuICAgICAgICBub2RlLmggPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtaCcpKTtcclxuICAgICAgICBub2RlLm1heFcgPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtbWF4LXcnKSk7XHJcbiAgICAgICAgbm9kZS5taW5XID0gdXRpbHNfMS5VdGlscy50b051bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2dzLW1pbi13JykpO1xyXG4gICAgICAgIG5vZGUubWF4SCA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1tYXgtaCcpKTtcclxuICAgICAgICBub2RlLm1pbkggPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtbWluLWgnKSk7XHJcbiAgICAgICAgbm9kZS5hdXRvUG9zaXRpb24gPSB1dGlsc18xLlV0aWxzLnRvQm9vbChlbC5nZXRBdHRyaWJ1dGUoJ2dzLWF1dG8tcG9zaXRpb24nKSk7XHJcbiAgICAgICAgbm9kZS5ub1Jlc2l6ZSA9IHV0aWxzXzEuVXRpbHMudG9Cb29sKGVsLmdldEF0dHJpYnV0ZSgnZ3Mtbm8tcmVzaXplJykpO1xyXG4gICAgICAgIG5vZGUubm9Nb3ZlID0gdXRpbHNfMS5VdGlscy50b0Jvb2woZWwuZ2V0QXR0cmlidXRlKCdncy1uby1tb3ZlJykpO1xyXG4gICAgICAgIG5vZGUubG9ja2VkID0gdXRpbHNfMS5VdGlscy50b0Jvb2woZWwuZ2V0QXR0cmlidXRlKCdncy1sb2NrZWQnKSk7XHJcbiAgICAgICAgbm9kZS5pZCA9IGVsLmdldEF0dHJpYnV0ZSgnZ3MtaWQnKTtcclxuICAgICAgICAvLyByZW1vdmUgYW55IGtleSBub3QgZm91bmQgKG51bGwgb3IgZmFsc2Ugd2hpY2ggaXMgZGVmYXVsdClcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBub2RlKSB7XHJcbiAgICAgICAgICAgIGlmICghbm9kZS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoIW5vZGVba2V5XSAmJiBub2RlW2tleV0gIT09IDApIHsgLy8gMCBjYW4gYmUgdmFsaWQgdmFsdWUgKHgseSBvbmx5IHJlYWxseSlcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfc2V0U3RhdGljQ2xhc3MoKSB7XHJcbiAgICAgICAgbGV0IGNsYXNzZXMgPSBbJ2dyaWQtc3RhY2stc3RhdGljJ107XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCguLi5jbGFzc2VzKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2dzLXN0YXRpYycsICd0cnVlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdncy1zdGF0aWMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCB3aGVuIHdlIGFyZSBiZWluZyByZXNpemVkIGJ5IHRoZSB3aW5kb3cgLSBjaGVjayBpZiB0aGUgb25lIENvbHVtbiBNb2RlIG5lZWRzIHRvIGJlIHR1cm5lZCBvbi9vZmZcclxuICAgICAqIGFuZCByZW1lbWJlciB0aGUgcHJldiBjb2x1bW5zIHdlIHVzZWQsIG9yIGdldCBvdXIgY291bnQgZnJvbSBwYXJlbnQsIGFzIHdlbGwgYXMgY2hlY2sgZm9yIGF1dG8gY2VsbCBoZWlnaHQgKHNxdWFyZSlcclxuICAgICAqL1xyXG4gICAgb25QYXJlbnRSZXNpemUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVsIHx8ICF0aGlzLmVsLmNsaWVudFdpZHRoKVxyXG4gICAgICAgICAgICByZXR1cm47IC8vIHJldHVybiBpZiB3ZSdyZSBnb25lIG9yIG5vIHNpemUgeWV0ICh3aWxsIGdldCBjYWxsZWQgYWdhaW4pXHJcbiAgICAgICAgbGV0IGNoYW5nZWRDb2x1bW4gPSBmYWxzZTtcclxuICAgICAgICAvLyBzZWUgaWYgd2UncmUgbmVzdGVkIGFuZCB0YWtlIG91ciBjb2x1bW4gY291bnQgZnJvbSBvdXIgcGFyZW50Li4uLlxyXG4gICAgICAgIGlmICh0aGlzLl9hdXRvQ29sdW1uICYmIHRoaXMucGFyZW50R3JpZEl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jb2x1bW4gIT09IHRoaXMucGFyZW50R3JpZEl0ZW0udykge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlZENvbHVtbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbHVtbih0aGlzLnBhcmVudEdyaWRJdGVtLncsICdub25lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGVsc2UgY2hlY2sgZm9yIDEgY29sdW1uIGluL291dCBiZWhhdmlvclxyXG4gICAgICAgICAgICBsZXQgb25lQ29sdW1uID0gIXRoaXMub3B0cy5kaXNhYmxlT25lQ29sdW1uTW9kZSAmJiB0aGlzLmVsLmNsaWVudFdpZHRoIDw9IHRoaXMub3B0cy5vbmVDb2x1bW5TaXplO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMub3B0cy5jb2x1bW4gPT09IDEpICE9PSBvbmVDb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIGNoYW5nZWRDb2x1bW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5hbmltYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBbmltYXRpb24oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSAvLyAxIDwtPiAxMiBpcyB0b28gcmFkaWNhbCwgdHVybiBvZmYgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbHVtbihvbmVDb2x1bW4gPyAxIDogdGhpcy5fcHJldkNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLmFuaW1hdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFuaW1hdGlvbih0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtYWtlIHRoZSBjZWxscyBjb250ZW50IHNxdWFyZSBhZ2FpblxyXG4gICAgICAgIGlmICh0aGlzLl9pc0F1dG9DZWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICghY2hhbmdlZENvbHVtbiAmJiB0aGlzLm9wdHMuY2VsbEhlaWdodFRocm90dGxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2NlbGxIZWlnaHRUaHJvdHRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NlbGxIZWlnaHRUaHJvdHRsZSA9IHV0aWxzXzEuVXRpbHMudGhyb3R0bGUoKCkgPT4gdGhpcy5jZWxsSGVpZ2h0KCksIHRoaXMub3B0cy5jZWxsSGVpZ2h0VGhyb3R0bGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2VsbEhlaWdodFRocm90dGxlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpbW1lZGlhdGUgdXBkYXRlIGlmIHdlJ3ZlIGNoYW5nZWQgY29sdW1uIGNvdW50IG9yIGhhdmUgbm8gdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmaW5hbGx5IHVwZGF0ZSBhbnkgbmVzdGVkIGdyaWRzXHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgaWYgKG4uc3ViR3JpZCkge1xyXG4gICAgICAgICAgICAgICAgbi5zdWJHcmlkLm9uUGFyZW50UmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBhZGQgb3IgcmVtb3ZlIHRoZSB3aW5kb3cgc2l6ZSBldmVudCBoYW5kbGVyICovXHJcbiAgICBfdXBkYXRlV2luZG93UmVzaXplRXZlbnQoZm9yY2VSZW1vdmUgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIG9ubHkgYWRkIGV2ZW50IGlmIHdlJ3JlIG5vdCBuZXN0ZWQgKHBhcmVudCB3aWxsIGNhbGwgdXMpIGFuZCB3ZSdyZSBhdXRvIHNpemluZyBjZWxscyBvciBzdXBwb3J0aW5nIG9uZUNvbHVtbiAoaS5lLiBkb2luZyB3b3JrKVxyXG4gICAgICAgIGNvbnN0IHdvcmtUb2RvID0gKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQgfHwgIXRoaXMub3B0cy5kaXNhYmxlT25lQ29sdW1uTW9kZSkgJiYgIXRoaXMucGFyZW50R3JpZEl0ZW07XHJcbiAgICAgICAgaWYgKCFmb3JjZVJlbW92ZSAmJiB3b3JrVG9kbyAmJiAhdGhpcy5fd2luZG93UmVzaXplQmluZCkge1xyXG4gICAgICAgICAgICB0aGlzLl93aW5kb3dSZXNpemVCaW5kID0gdGhpcy5vblBhcmVudFJlc2l6ZS5iaW5kKHRoaXMpOyAvLyBzbyB3ZSBjYW4gcHJvcGVybHkgcmVtb3ZlIGxhdGVyXHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl93aW5kb3dSZXNpemVCaW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoKGZvcmNlUmVtb3ZlIHx8ICF3b3JrVG9kbykgJiYgdGhpcy5fd2luZG93UmVzaXplQmluZCkge1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fd2luZG93UmVzaXplQmluZCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl93aW5kb3dSZXNpemVCaW5kOyAvLyByZW1vdmUgbGluayB0byB1cyBzbyB3ZSBjYW4gZnJlZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY29udmVydCBhIHBvdGVudGlhbCBzZWxlY3RvciBpbnRvIGFjdHVhbCBlbGVtZW50ICovXHJcbiAgICBzdGF0aWMgZ2V0RWxlbWVudChlbHMgPSAnLmdyaWQtc3RhY2staXRlbScpIHsgcmV0dXJuIHV0aWxzXzEuVXRpbHMuZ2V0RWxlbWVudChlbHMpOyB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBzdGF0aWMgZ2V0RWxlbWVudHMoZWxzID0gJy5ncmlkLXN0YWNrLWl0ZW0nKSB7IHJldHVybiB1dGlsc18xLlV0aWxzLmdldEVsZW1lbnRzKGVscyk7IH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHN0YXRpYyBnZXRHcmlkRWxlbWVudChlbHMpIHsgcmV0dXJuIEdyaWRTdGFjay5nZXRFbGVtZW50KGVscyk7IH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHN0YXRpYyBnZXRHcmlkRWxlbWVudHMoZWxzKSB7IHJldHVybiB1dGlsc18xLlV0aWxzLmdldEVsZW1lbnRzKGVscyk7IH1cclxuICAgIC8qKiBAaW50ZXJuYWwgaW5pdGlhbGl6ZSBtYXJnaW4gdG9wL2JvdHRvbS9sZWZ0L3JpZ2h0IGFuZCB1bml0cyAqL1xyXG4gICAgX2luaXRNYXJnaW4oKSB7XHJcbiAgICAgICAgbGV0IGRhdGE7XHJcbiAgICAgICAgbGV0IG1hcmdpbiA9IDA7XHJcbiAgICAgICAgLy8gc3VwcG9ydCBwYXNzaW5nIG11bHRpcGxlIHZhbHVlcyBsaWtlIENTUyAoZXg6ICc1cHggMTBweCAwIDIwcHgnKVxyXG4gICAgICAgIGxldCBtYXJnaW5zID0gW107XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdHMubWFyZ2luID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBtYXJnaW5zID0gdGhpcy5vcHRzLm1hcmdpbi5zcGxpdCgnICcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWFyZ2lucy5sZW5ndGggPT09IDIpIHsgLy8gdG9wL2JvdCwgbGVmdC9yaWdodCBsaWtlIENTU1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luVG9wID0gdGhpcy5vcHRzLm1hcmdpbkJvdHRvbSA9IG1hcmdpbnNbMF07XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5MZWZ0ID0gdGhpcy5vcHRzLm1hcmdpblJpZ2h0ID0gbWFyZ2luc1sxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobWFyZ2lucy5sZW5ndGggPT09IDQpIHsgLy8gQ2xvY2t3aXNlIGxpa2UgQ1NTXHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Ub3AgPSBtYXJnaW5zWzBdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luUmlnaHQgPSBtYXJnaW5zWzFdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luQm90dG9tID0gbWFyZ2luc1syXTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpbkxlZnQgPSBtYXJnaW5zWzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodGhpcy5vcHRzLm1hcmdpbik7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Vbml0ID0gZGF0YS51bml0O1xyXG4gICAgICAgICAgICBtYXJnaW4gPSB0aGlzLm9wdHMubWFyZ2luID0gZGF0YS5oO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZWUgaWYgdG9wL2JvdHRvbS9sZWZ0L3JpZ2h0IG5lZWQgdG8gYmUgc2V0IGFzIHdlbGxcclxuICAgICAgICBpZiAodGhpcy5vcHRzLm1hcmdpblRvcCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Ub3AgPSBtYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhID0gdXRpbHNfMS5VdGlscy5wYXJzZUhlaWdodCh0aGlzLm9wdHMubWFyZ2luVG9wKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblRvcCA9IGRhdGEuaDtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0cy5tYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMubWFyZ2luQm90dG9tID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpbkJvdHRvbSA9IG1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB1dGlsc18xLlV0aWxzLnBhcnNlSGVpZ2h0KHRoaXMub3B0cy5tYXJnaW5Cb3R0b20pO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luQm90dG9tID0gZGF0YS5oO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRzLm1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5tYXJnaW5SaWdodCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5SaWdodCA9IG1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB1dGlsc18xLlV0aWxzLnBhcnNlSGVpZ2h0KHRoaXMub3B0cy5tYXJnaW5SaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5SaWdodCA9IGRhdGEuaDtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0cy5tYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMubWFyZ2luTGVmdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5MZWZ0ID0gbWFyZ2luO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodGhpcy5vcHRzLm1hcmdpbkxlZnQpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luTGVmdCA9IGRhdGEuaDtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0cy5tYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0cy5tYXJnaW5Vbml0ID0gZGF0YS51bml0OyAvLyBpbiBjYXNlIHNpZGUgd2VyZSBzcGVsbGVkIG91dCwgdXNlIHRob3NlIHVuaXRzIGluc3RlYWQuLi5cclxuICAgICAgICBpZiAodGhpcy5vcHRzLm1hcmdpblRvcCA9PT0gdGhpcy5vcHRzLm1hcmdpbkJvdHRvbSAmJiB0aGlzLm9wdHMubWFyZ2luTGVmdCA9PT0gdGhpcy5vcHRzLm1hcmdpblJpZ2h0ICYmIHRoaXMub3B0cy5tYXJnaW5Ub3AgPT09IHRoaXMub3B0cy5tYXJnaW5SaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luID0gdGhpcy5vcHRzLm1hcmdpblRvcDsgLy8gbWFrZXMgaXQgZWFzaWVyIHRvIGNoZWNrIGZvciBuby1vcHMgaW4gc2V0TWFyZ2luKClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgKiBkcmFnJmRyb3AgbWV0aG9kcyB0aGF0IHVzZWQgdG8gYmUgc3R1YmJlZCBvdXQgYW5kIGltcGxlbWVudGVkIGluIGRkLWdyaWRzdGFjay50c1xyXG4gICAgICogYnV0IGNhdXNlZCBsb2FkaW5nIGlzc3VlcyBpbiBwcm9kIC0gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzL2lzc3Vlcy8yMDM5XHJcbiAgICAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgKi9cclxuICAgIC8qKiBnZXQgdGhlIGdsb2JhbCAoYnV0IHN0YXRpYyB0byB0aGlzIGNvZGUpIEREIGltcGxlbWVudGF0aW9uICovXHJcbiAgICBzdGF0aWMgZ2V0REQoKSB7XHJcbiAgICAgICAgcmV0dXJuIGRkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsIHRvIHNldHVwIGRyYWdnaW5nIGluIGZyb20gdGhlIG91dHNpZGUgKHNheSB0b29sYmFyKSwgYnkgc3BlY2lmeWluZyB0aGUgY2xhc3Mgc2VsZWN0aW9uIGFuZCBvcHRpb25zLlxyXG4gICAgICogQ2FsbGVkIGR1cmluZyBHcmlkU3RhY2suaW5pdCgpIGFzIG9wdGlvbnMsIGJ1dCBjYW4gYWxzbyBiZSBjYWxsZWQgZGlyZWN0bHkgKGxhc3QgcGFyYW0gYXJlIHVzZWQpIGluIGNhc2UgdGhlIHRvb2xiYXJcclxuICAgICAqIGlzIGR5bmFtaWNhbGx5IGNyZWF0ZSBhbmQgbmVlZHMgdG8gYmUgc2V0IGxhdGVyLlxyXG4gICAgICogQHBhcmFtIGRyYWdJbiBzdHJpbmcgc2VsZWN0b3IgKGV4OiAnLnNpZGViYXIgLmdyaWQtc3RhY2staXRlbScpXHJcbiAgICAgKiBAcGFyYW0gZHJhZ0luT3B0aW9ucyBvcHRpb25zIC0gc2VlIERERHJhZ0luT3B0LiAoZGVmYXVsdDoge2hhbmRsZTogJy5ncmlkLXN0YWNrLWl0ZW0tY29udGVudCcsIGFwcGVuZFRvOiAnYm9keSd9XHJcbiAgICAgKiovXHJcbiAgICBzdGF0aWMgc2V0dXBEcmFnSW4oZHJhZ0luLCBkcmFnSW5PcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKChkcmFnSW5PcHRpb25zID09PSBudWxsIHx8IGRyYWdJbk9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRyYWdJbk9wdGlvbnMucGF1c2UpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcgPSBkcmFnSW5PcHRpb25zLnBhdXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGRyYWdJbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZHJhZ0luT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgdHlwZXNfMS5kcmFnSW5EZWZhdWx0T3B0aW9ucyksIChkcmFnSW5PcHRpb25zIHx8IHt9KSk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuZ2V0RWxlbWVudHMoZHJhZ0luKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghZGQuaXNEcmFnZ2FibGUoZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgIGRkLmRyYWdJbihlbCwgZHJhZ0luT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcy9EaXNhYmxlcyBkcmFnZ2luZyBieSB0aGUgdXNlciBvZiBzcGVjaWZpYyBncmlkIGVsZW1lbnQuIElmIHlvdSB3YW50IGFsbCBpdGVtcywgYW5kIGhhdmUgaXQgYWZmZWN0IGZ1dHVyZSBpdGVtcywgdXNlIGVuYWJsZU1vdmUoKSBpbnN0ZWFkLiBOby1vcCBmb3Igc3RhdGljIGdyaWRzLlxyXG4gICAgICogSUYgeW91IGFyZSBsb29raW5nIHRvIHByZXZlbnQgYW4gaXRlbSBmcm9tIG1vdmluZyAoZHVlIHRvIGJlaW5nIHB1c2hlZCBhcm91bmQgYnkgYW5vdGhlciBkdXJpbmcgY29sbGlzaW9uKSB1c2UgbG9ja2VkIHByb3BlcnR5IGluc3RlYWQuXHJcbiAgICAgKiBAcGFyYW0gZWxzIHdpZGdldCBvciBzZWxlY3RvciB0byBtb2RpZnkuXHJcbiAgICAgKiBAcGFyYW0gdmFsIGlmIHRydWUgd2lkZ2V0IHdpbGwgYmUgZHJhZ2dhYmxlLlxyXG4gICAgICovXHJcbiAgICBtb3ZhYmxlKGVscywgdmFsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gY2FuJ3QgbW92ZSBhIHN0YXRpYyBncmlkIVxyXG4gICAgICAgIEdyaWRTdGFjay5nZXRFbGVtZW50cyhlbHMpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHZhbClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLm5vTW92ZTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgbm9kZS5ub01vdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobm9kZSk7IC8vIGluaXQgREQgaWYgbmVlZCBiZSwgYW5kIGFkanVzdFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzL0Rpc2FibGVzIHVzZXIgcmVzaXppbmcgb2Ygc3BlY2lmaWMgZ3JpZCBlbGVtZW50LiBJZiB5b3Ugd2FudCBhbGwgaXRlbXMsIGFuZCBoYXZlIGl0IGFmZmVjdCBmdXR1cmUgaXRlbXMsIHVzZSBlbmFibGVSZXNpemUoKSBpbnN0ZWFkLiBOby1vcCBmb3Igc3RhdGljIGdyaWRzLlxyXG4gICAgICogQHBhcmFtIGVscyAgd2lkZ2V0IG9yIHNlbGVjdG9yIHRvIG1vZGlmeVxyXG4gICAgICogQHBhcmFtIHZhbCAgaWYgdHJ1ZSB3aWRnZXQgd2lsbCBiZSByZXNpemFibGUuXHJcbiAgICAgKi9cclxuICAgIHJlc2l6YWJsZShlbHMsIHZhbCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhdGljR3JpZClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7IC8vIGNhbid0IHJlc2l6ZSBhIHN0YXRpYyBncmlkIVxyXG4gICAgICAgIEdyaWRTdGFjay5nZXRFbGVtZW50cyhlbHMpLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHZhbClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLm5vUmVzaXplO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBub2RlLm5vUmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZURyYWdEcm9wQnlOb2RlKG5vZGUpOyAvLyBpbml0IEREIGlmIG5lZWQgYmUsIGFuZCBhZGp1c3RcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVtcG9yYXJpbHkgZGlzYWJsZXMgd2lkZ2V0cyBtb3ZpbmcvcmVzaXppbmcuXHJcbiAgICAgKiBJZiB5b3Ugd2FudCBhIG1vcmUgcGVybWFuZW50IHdheSAod2hpY2ggZnJlZXplcyB1cCByZXNvdXJjZXMpIHVzZSBgc2V0U3RhdGljKHRydWUpYCBpbnN0ZWFkLlxyXG4gICAgICogTm90ZTogbm8tb3AgZm9yIHN0YXRpYyBncmlkXHJcbiAgICAgKiBUaGlzIGlzIGEgc2hvcnRjdXQgZm9yOlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqICBncmlkLmVuYWJsZU1vdmUoZmFsc2UpO1xyXG4gICAgICogIGdyaWQuZW5hYmxlUmVzaXplKGZhbHNlKTtcclxuICAgICAqIEBwYXJhbSByZWN1cnNlIHRydWUgKGRlZmF1bHQpIGlmIHN1Yi1ncmlkcyBhbHNvIGdldCB1cGRhdGVkXHJcbiAgICAgKi9cclxuICAgIGRpc2FibGUocmVjdXJzZSA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLmVuYWJsZU1vdmUoZmFsc2UsIHJlY3Vyc2UpO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlUmVzaXplKGZhbHNlLCByZWN1cnNlKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnZGlzYWJsZScpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZS1lbmFibGVzIHdpZGdldHMgbW92aW5nL3Jlc2l6aW5nIC0gc2VlIGRpc2FibGUoKS5cclxuICAgICAqIE5vdGU6IG5vLW9wIGZvciBzdGF0aWMgZ3JpZC5cclxuICAgICAqIFRoaXMgaXMgYSBzaG9ydGN1dCBmb3I6XHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogIGdyaWQuZW5hYmxlTW92ZSh0cnVlKTtcclxuICAgICAqICBncmlkLmVuYWJsZVJlc2l6ZSh0cnVlKTtcclxuICAgICAqIEBwYXJhbSByZWN1cnNlIHRydWUgKGRlZmF1bHQpIGlmIHN1Yi1ncmlkcyBhbHNvIGdldCB1cGRhdGVkXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZShyZWN1cnNlID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhdGljR3JpZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlTW92ZSh0cnVlLCByZWN1cnNlKTtcclxuICAgICAgICB0aGlzLmVuYWJsZVJlc2l6ZSh0cnVlLCByZWN1cnNlKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnZW5hYmxlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEVuYWJsZXMvZGlzYWJsZXMgd2lkZ2V0IG1vdmluZy4gTm8tb3AgZm9yIHN0YXRpYyBncmlkcy5cclxuICAgICAqIEBwYXJhbSByZWN1cnNlIHRydWUgKGRlZmF1bHQpIGlmIHN1Yi1ncmlkcyBhbHNvIGdldCB1cGRhdGVkXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZU1vdmUoZG9FbmFibGUsIHJlY3Vyc2UgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gY2FuJ3QgbW92ZSBhIHN0YXRpYyBncmlkIVxyXG4gICAgICAgIHRoaXMub3B0cy5kaXNhYmxlRHJhZyA9ICFkb0VuYWJsZTsgLy8gRklSU1QgYmVmb3JlIHdlIHVwZGF0ZSBjaGlsZHJlbiBhcyBncmlkIG92ZXJyaWRlcyAjMTY1OFxyXG4gICAgICAgIHRoaXMuZW5naW5lLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW92YWJsZShuLmVsLCBkb0VuYWJsZSk7XHJcbiAgICAgICAgICAgIGlmIChuLnN1YkdyaWQgJiYgcmVjdXJzZSlcclxuICAgICAgICAgICAgICAgIG4uc3ViR3JpZC5lbmFibGVNb3ZlKGRvRW5hYmxlLCByZWN1cnNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcy9kaXNhYmxlcyB3aWRnZXQgcmVzaXppbmcuIE5vLW9wIGZvciBzdGF0aWMgZ3JpZHMuXHJcbiAgICAgKiBAcGFyYW0gcmVjdXJzZSB0cnVlIChkZWZhdWx0KSBpZiBzdWItZ3JpZHMgYWxzbyBnZXQgdXBkYXRlZFxyXG4gICAgICovXHJcbiAgICBlbmFibGVSZXNpemUoZG9FbmFibGUsIHJlY3Vyc2UgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gY2FuJ3Qgc2l6ZSBhIHN0YXRpYyBncmlkIVxyXG4gICAgICAgIHRoaXMub3B0cy5kaXNhYmxlUmVzaXplID0gIWRvRW5hYmxlOyAvLyBGSVJTVCBiZWZvcmUgd2UgdXBkYXRlIGNoaWxkcmVuIGFzIGdyaWQgb3ZlcnJpZGVzICMxNjU4XHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemFibGUobi5lbCwgZG9FbmFibGUpO1xyXG4gICAgICAgICAgICBpZiAobi5zdWJHcmlkICYmIHJlY3Vyc2UpXHJcbiAgICAgICAgICAgICAgICBuLnN1YkdyaWQuZW5hYmxlUmVzaXplKGRvRW5hYmxlLCByZWN1cnNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmVtb3ZlcyBhbnkgZHJhZyZkcm9wIHByZXNlbnQgKGNhbGxlZCBkdXJpbmcgZGVzdHJveSkgKi9cclxuICAgIF9yZW1vdmVERChlbCkge1xyXG4gICAgICAgIGRkLmRyYWdnYWJsZShlbCwgJ2Rlc3Ryb3knKS5yZXNpemFibGUoZWwsICdkZXN0cm95Jyk7XHJcbiAgICAgICAgaWYgKGVsLmdyaWRzdGFja05vZGUpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGVsLmdyaWRzdGFja05vZGUuX2luaXRERDsgLy8gcmVzZXQgb3VyIEREIGluaXQgZmxhZ1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgZWwuZGRFbGVtZW50O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgdG8gYWRkIGRyYWcgb3ZlciB0byBzdXBwb3J0IHdpZGdldHMgYmVpbmcgYWRkZWQgZXh0ZXJuYWxseSAqL1xyXG4gICAgX3NldHVwQWNjZXB0V2lkZ2V0KCkge1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gZGlzYWJsZSB0aGluZ3NcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQgfHwgKCF0aGlzLm9wdHMuYWNjZXB0V2lkZ2V0cyAmJiAhdGhpcy5vcHRzLnJlbW92YWJsZSkpIHtcclxuICAgICAgICAgICAgZGQuZHJvcHBhYmxlKHRoaXMuZWwsICdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB2YXJzIHNoYXJlZCBhY3Jvc3MgYWxsIG1ldGhvZHNcclxuICAgICAgICBsZXQgY2VsbEhlaWdodCwgY2VsbFdpZHRoO1xyXG4gICAgICAgIGxldCBvbkRyYWcgPSAoZXZlbnQsIGVsLCBoZWxwZXIpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICBpZiAoIW5vZGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGhlbHBlciA9IGhlbHBlciB8fCBlbDtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGxldCB7IHRvcCwgbGVmdCB9ID0gaGVscGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBsZWZ0IC09IHBhcmVudC5sZWZ0O1xyXG4gICAgICAgICAgICB0b3AgLT0gcGFyZW50LnRvcDtcclxuICAgICAgICAgICAgbGV0IHVpID0geyBwb3NpdGlvbjogeyB0b3AsIGxlZnQgfSB9O1xyXG4gICAgICAgICAgICBpZiAobm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS54ID0gTWF0aC5tYXgoMCwgTWF0aC5yb3VuZChsZWZ0IC8gY2VsbFdpZHRoKSk7XHJcbiAgICAgICAgICAgICAgICBub2RlLnkgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKHRvcCAvIGNlbGxIZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLmF1dG9Qb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLm5vZGVCb3VuZEZpeChub2RlKTtcclxuICAgICAgICAgICAgICAgIC8vIGRvbid0IGFjY2VwdCAqaW5pdGlhbCogbG9jYXRpb24gaWYgZG9lc24ndCBmaXQgIzE0MTkgKGxvY2tlZCBkcm9wIHJlZ2lvbiwgb3IgY2FuJ3QgZ3JvdyksIGJ1dCBtYXliZSB0cnkgaWYgaXQgd2lsbCBnbyBzb21ld2hlcmVcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5lbmdpbmUud2lsbEl0Rml0KG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hdXRvUG9zaXRpb24gPSB0cnVlOyAvLyBpZ25vcmUgeCx5IGFuZCB0cnkgZm9yIGFueSBzbG90Li4uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmVuZ2luZS53aWxsSXRGaXQobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGQub2ZmKGVsLCAnZHJhZycpOyAvLyBzdG9wIGNhbGxpbmcgdXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBmdWxsIGdyaWQgb3IgY2FuJ3QgZ3Jvd1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5fd2lsbEZpdFBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGF1dG8gcG9zaXRpb24gaW5zdGVhZCAjMTY4N1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlsc18xLlV0aWxzLmNvcHlQb3Mobm9kZSwgbm9kZS5fd2lsbEZpdFBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLl93aWxsRml0UG9zO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIHJlLXVzZSB0aGUgZXhpc3Rpbmcgbm9kZSBkcmFnZ2luZyBtZXRob2RcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uU3RhcnRNb3ZpbmcoaGVscGVyLCBldmVudCwgdWksIG5vZGUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZS11c2UgdGhlIGV4aXN0aW5nIG5vZGUgZHJhZ2dpbmcgdGhhdCBkb2VzIHNvIG11Y2ggb2YgdGhlIGNvbGxpc2lvbiBkZXRlY3Rpb25cclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdPclJlc2l6ZShoZWxwZXIsIGV2ZW50LCB1aSwgbm9kZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZGQuZHJvcHBhYmxlKHRoaXMuZWwsIHtcclxuICAgICAgICAgICAgYWNjZXB0OiAoZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgICAgIC8vIHNldCBhY2NlcHQgZHJvcCB0byB0cnVlIG9uIG91cnNlbGYgKHdoaWNoIHdlIGlnbm9yZSkgc28gd2UgZG9uJ3QgZ2V0IFwiY2FuJ3QgZHJvcFwiIGljb24gaW4gSFRNTDUgbW9kZSB3aGlsZSBtb3ZpbmdcclxuICAgICAgICAgICAgICAgIGlmICgobm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdyaWQpID09PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuYWNjZXB0V2lkZ2V0cylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgYWNjZXB0IG1ldGhvZCBvciBjbGFzcyBtYXRjaGluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IGNhbkFjY2VwdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0cy5hY2NlcHRXaWRnZXRzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuQWNjZXB0ID0gdGhpcy5vcHRzLmFjY2VwdFdpZGdldHMoZWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gKHRoaXMub3B0cy5hY2NlcHRXaWRnZXRzID09PSB0cnVlID8gJy5ncmlkLXN0YWNrLWl0ZW0nIDogdGhpcy5vcHRzLmFjY2VwdFdpZGdldHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbkFjY2VwdCA9IGVsLm1hdGNoZXMoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gZmluYWxseSBjaGVjayB0byBtYWtlIHN1cmUgd2UgYWN0dWFsbHkgaGF2ZSBzcGFjZSBsZWZ0ICMxNTcxXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuQWNjZXB0ICYmIG5vZGUgJiYgdGhpcy5vcHRzLm1heFJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuID0geyB3OiBub2RlLncsIGg6IG5vZGUuaCwgbWluVzogbm9kZS5taW5XLCBtaW5IOiBub2RlLm1pbkggfTsgLy8gb25seSB3aWR0aC9oZWlnaHQgbWF0dGVycyBhbmQgYXV0b1Bvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgY2FuQWNjZXB0ID0gdGhpcy5lbmdpbmUud2lsbEl0Rml0KG4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbkFjY2VwdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBlbnRlcmluZyBvdXIgZ3JpZCBhcmVhXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAub24odGhpcy5lbCwgJ2Ryb3BvdmVyJywgKGV2ZW50LCBlbCwgaGVscGVyKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBvdmVyICR7dGhpcy5lbC5ncmlkc3RhY2sub3B0cy5pZH0gJHtjb3VudCsrfWApOyAvLyBURVNUXHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgLy8gaWdub3JlIGRyb3AgZW50ZXIgb24gb3Vyc2VsZiAodW5sZXNzIHdlIHRlbXBvcmFyaWx5IHJlbW92ZWQpIHdoaWNoIGhhcHBlbnMgb24gYSBzaW1wbGUgZHJhZyBvZiBvdXIgaXRlbVxyXG4gICAgICAgICAgICBpZiAoKG5vZGUgPT09IG51bGwgfHwgbm9kZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZS5ncmlkKSA9PT0gdGhpcyAmJiAhbm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gZGVsZXRlIG5vZGUuX2FkZGVkOyAvLyByZXNldCB0aGlzIHRvIHRyYWNrIHBsYWNlaG9sZGVyIGFnYWluIGluIGNhc2Ugd2Ugd2VyZSBvdmVyIG90aGVyIGdyaWQgIzE0ODQgKGRyb3BvdXQgZG9lc24ndCBhbHdheXMgY2xlYXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHByZXZlbnQgcGFyZW50IGZyb20gcmVjZWl2aW5nIG1zZyAod2hpY2ggbWF5IGJlIGEgZ3JpZCBhcyB3ZWxsKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZpeCAjMTU3OCB3aGVuIGRyYWdnaW5nIGZhc3QsIHdlIG1heSBub3QgZ2V0IGEgbGVhdmUgb24gdGhlIHByZXZpb3VzIGdyaWQgc28gZm9yY2Ugb25lIG5vd1xyXG4gICAgICAgICAgICBpZiAoKG5vZGUgPT09IG51bGwgfHwgbm9kZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZS5ncmlkKSAmJiBub2RlLmdyaWQgIT09IHRoaXMgJiYgIW5vZGUuX3RlbXBvcmFyeVJlbW92ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkcm9wb3ZlciB3aXRob3V0IGxlYXZlJyk7IC8vIFRFU1RcclxuICAgICAgICAgICAgICAgIGxldCBvdGhlckdyaWQgPSBub2RlLmdyaWQ7XHJcbiAgICAgICAgICAgICAgICBvdGhlckdyaWQuX2xlYXZlKGVsLCBoZWxwZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNhY2hlIGNlbGwgZGltZW5zaW9ucyAod2hpY2ggZG9uJ3QgY2hhbmdlKSwgcG9zaXRpb24gY2FuIGFuaW1hdGUgaWYgd2UgcmVtb3ZlZCBhbiBpdGVtIGluIG90aGVyR3JpZCB0aGF0IGFmZmVjdHMgdXMuLi5cclxuICAgICAgICAgICAgY2VsbFdpZHRoID0gdGhpcy5jZWxsV2lkdGgoKTtcclxuICAgICAgICAgICAgY2VsbEhlaWdodCA9IHRoaXMuZ2V0Q2VsbEhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgLy8gbG9hZCBhbnkgZWxlbWVudCBhdHRyaWJ1dGVzIGlmIHdlIGRvbid0IGhhdmUgYSBub2RlXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkgeyAvLyBAdHMtaWdub3JlIHByaXZhdGUgcmVhZCBvbmx5IG9uIG91cnNlbGZcclxuICAgICAgICAgICAgICAgIG5vZGUgPSB0aGlzLl9yZWFkQXR0cihlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFub2RlLmdyaWQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuX2lzRXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZWwuZ3JpZHN0YWNrTm9kZSA9IG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBncmlkIHNpemUgYmFzZWQgb24gZWxlbWVudCBvdXRlciBzaXplXHJcbiAgICAgICAgICAgIGhlbHBlciA9IGhlbHBlciB8fCBlbDtcclxuICAgICAgICAgICAgbGV0IHcgPSBub2RlLncgfHwgTWF0aC5yb3VuZChoZWxwZXIub2Zmc2V0V2lkdGggLyBjZWxsV2lkdGgpIHx8IDE7XHJcbiAgICAgICAgICAgIGxldCBoID0gbm9kZS5oIHx8IE1hdGgucm91bmQoaGVscGVyLm9mZnNldEhlaWdodCAvIGNlbGxIZWlnaHQpIHx8IDE7XHJcbiAgICAgICAgICAgIC8vIGlmIHRoZSBpdGVtIGNhbWUgZnJvbSBhbm90aGVyIGdyaWQsIG1ha2UgYSBjb3B5IGFuZCBzYXZlIHRoZSBvcmlnaW5hbCBpbmZvIGluIGNhc2Ugd2UgZ28gYmFjayB0aGVyZVxyXG4gICAgICAgICAgICBpZiAobm9kZS5ncmlkICYmIG5vZGUuZ3JpZCAhPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgbm9kZSBvcmlnaW5hbCB2YWx1ZXMgKG1pbi9tYXgvaWQvZXRjLi4uKSBidXQgb3ZlcnJpZGUgd2lkdGgvaGVpZ2h0L290aGVyIGZsYWdzIHdoaWNoIGFyZSB0aGlzIGdyaWQgc3BlY2lmaWNcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkcm9wb3ZlciBjbG9uaW5nIG5vZGUnKTsgLy8gVEVTVFxyXG4gICAgICAgICAgICAgICAgaWYgKCFlbC5fZ3JpZHN0YWNrTm9kZU9yaWcpXHJcbiAgICAgICAgICAgICAgICAgICAgZWwuX2dyaWRzdGFja05vZGVPcmlnID0gbm9kZTsgLy8gc2hvdWxkbid0IGhhdmUgbXVsdGlwbGUgbmVzdGVkIVxyXG4gICAgICAgICAgICAgICAgZWwuZ3JpZHN0YWNrTm9kZSA9IG5vZGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIG5vZGUpLCB7IHcsIGgsIGdyaWQ6IHRoaXMgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5jbGVhbnVwTm9kZShub2RlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5ub2RlQm91bmRGaXgobm9kZSk7XHJcbiAgICAgICAgICAgICAgICAvLyByZXN0b3JlIHNvbWUgaW50ZXJuYWwgZmllbGRzIHdlIG5lZWQgYWZ0ZXIgY2xlYXJpbmcgdGhlbSBhbGxcclxuICAgICAgICAgICAgICAgIG5vZGUuX2luaXRERCA9XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5faXNFeHRlcm5hbCA9IC8vIERPTSBuZWVkcyB0byBiZSByZS1wYXJlbnRlZCBvbiBhIGRyb3BcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCA9IHRydWU7IC8vIHNvIGl0IGNhbiBiZSBpbnNlcnRlZCBvbkRyYWcgYmVsb3dcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vZGUudyA9IHc7XHJcbiAgICAgICAgICAgICAgICBub2RlLmggPSBoO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCA9IHRydWU7IC8vIHNvIHdlIGNhbiBpbnNlcnQgaXRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjbGVhciBhbnkgbWFya2VkIGZvciBjb21wbGV0ZSByZW1vdmFsIChOb3RlOiBkb24ndCBjaGVjayBfaXNBYm91dFRvUmVtb3ZlIGFzIHRoYXQgaXMgY2xlYXJlZCBhYm92ZSAtIGp1c3QgZG8gaXQpXHJcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1SZW1vdmluZyhub2RlLmVsLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGRkLm9uKGVsLCAnZHJhZycsIG9uRHJhZyk7XHJcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGlzIGNhbGxlZCBhdCBsZWFzdCBvbmNlIHdoZW4gZ29pbmcgZmFzdCAjMTU3OFxyXG4gICAgICAgICAgICBvbkRyYWcoZXZlbnQsIGVsLCBoZWxwZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHByZXZlbnQgcGFyZW50IGZyb20gcmVjZWl2aW5nIG1zZyAod2hpY2ggbWF5IGJlIGEgZ3JpZCBhcyB3ZWxsKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBMZWF2aW5nIG91ciBncmlkIGFyZWEuLi5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC5vbih0aGlzLmVsLCAnZHJvcG91dCcsIChldmVudCwgZWwsIGhlbHBlcikgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgb3V0ICR7dGhpcy5lbC5ncmlkc3RhY2sub3B0cy5pZH0gJHtjb3VudCsrfWApOyAvLyBURVNUXHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAvLyBmaXggIzE1Nzggd2hlbiBkcmFnZ2luZyBmYXN0LCB3ZSBtaWdodCBnZXQgbGVhdmUgYWZ0ZXIgb3RoZXIgZ3JpZCBnZXRzIGVudGVyICh3aGljaCBjYWxscyB1cyB0byBjbGVhbilcclxuICAgICAgICAgICAgLy8gc28gc2tpcCB0aGlzIG9uZSBpZiB3ZSdyZSBub3QgdGhlIGFjdGl2ZSBncmlkIHJlYWxseS4uXHJcbiAgICAgICAgICAgIGlmICghbm9kZS5ncmlkIHx8IG5vZGUuZ3JpZCA9PT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGVhdmUoZWwsIGhlbHBlcik7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIGNyZWF0ZWQgYXMgdGVtcG9yYXJ5IG5lc3RlZCBncmlkLCBnbyBiYWNrIHRvIGJlZm9yZSBzdGF0ZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVGVtcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXNTdWJHcmlkKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcHJldmVudCBwYXJlbnQgZnJvbSByZWNlaXZpbmcgbXNnICh3aGljaCBtYXkgYmUgZ3JpZCBhcyB3ZWxsKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBlbmQgLSByZWxlYXNpbmcgdGhlIG1vdXNlXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAub24odGhpcy5lbCwgJ2Ryb3AnLCAoZXZlbnQsIGVsLCBoZWxwZXIpID0+IHtcclxuICAgICAgICAgICAgdmFyIF9hLCBfYjtcclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICAvLyBpZ25vcmUgZHJvcCBvbiBvdXJzZWxmIGZyb20gb3Vyc2VsZiB0aGF0IGRpZG4ndCBjb21lIGZyb20gdGhlIG91dHNpZGUgLSBkcmFnZW5kIHdpbGwgaGFuZGxlIHRoZSBzaW1wbGUgbW92ZSBpbnN0ZWFkXHJcbiAgICAgICAgICAgIGlmICgobm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdyaWQpID09PSB0aGlzICYmICFub2RlLl9pc0V4dGVybmFsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgd2FzQWRkZWQgPSAhIXRoaXMucGxhY2Vob2xkZXIucGFyZW50RWxlbWVudDsgLy8gc2tpcCBpdGVtcyBub3QgYWN0dWFsbHkgYWRkZWQgdG8gdXMgYmVjYXVzZSBvZiBjb25zdHJhaW5zLCBidXQgZG8gY2xlYW51cCAjMTQxOVxyXG4gICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAvLyBub3RpZnkgcHJldmlvdXMgZ3JpZCBvZiByZW1vdmFsXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkcm9wIGRlbGV0ZSBfZ3JpZHN0YWNrTm9kZU9yaWcnKSAvLyBURVNUXHJcbiAgICAgICAgICAgIGxldCBvcmlnTm9kZSA9IGVsLl9ncmlkc3RhY2tOb2RlT3JpZztcclxuICAgICAgICAgICAgZGVsZXRlIGVsLl9ncmlkc3RhY2tOb2RlT3JpZztcclxuICAgICAgICAgICAgaWYgKHdhc0FkZGVkICYmIChvcmlnTm9kZSA9PT0gbnVsbCB8fCBvcmlnTm9kZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3JpZ05vZGUuZ3JpZCkgJiYgb3JpZ05vZGUuZ3JpZCAhPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9HcmlkID0gb3JpZ05vZGUuZ3JpZDtcclxuICAgICAgICAgICAgICAgIG9HcmlkLmVuZ2luZS5yZW1vdmVkTm9kZXMucHVzaChvcmlnTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBvR3JpZC5fdHJpZ2dlclJlbW92ZUV2ZW50KCkuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgaXQncyBhbiBlbXB0eSBzdWItZ3JpZCB0aGF0IGdvdCBhdXRvLWNyZWF0ZWQsIG51a2UgaXRcclxuICAgICAgICAgICAgICAgIGlmIChvR3JpZC5wYXJlbnRHcmlkSXRlbSAmJiAhb0dyaWQuZW5naW5lLm5vZGVzLmxlbmd0aCAmJiBvR3JpZC5vcHRzLnN1YkdyaWREeW5hbWljKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb0dyaWQucmVtb3ZlQXNTdWJHcmlkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB1c2UgZXhpc3RpbmcgcGxhY2Vob2xkZXIgbm9kZSBhcyBpdCdzIGFscmVhZHkgaW4gb3VyIGxpc3Qgd2l0aCBkcm9wIGxvY2F0aW9uXHJcbiAgICAgICAgICAgIGlmICh3YXNBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUuY2xlYW51cE5vZGUobm9kZSk7IC8vIHJlbW92ZXMgYWxsIGludGVybmFsIF94eXogdmFsdWVzXHJcbiAgICAgICAgICAgICAgICBub2RlLmdyaWQgPSB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRkLm9mZihlbCwgJ2RyYWcnKTtcclxuICAgICAgICAgICAgLy8gaWYgd2UgbWFkZSBhIGNvcHkgKCdoZWxwZXInIHdoaWNoIGlzIHRlbXApIG9mIHRoZSBvcmlnaW5hbCBub2RlIHRoZW4gaW5zZXJ0IGEgY29weSwgZWxzZSB3ZSBtb3ZlIHRoZSBvcmlnaW5hbCBub2RlICgjMTEwMilcclxuICAgICAgICAgICAgLy8gYXMgdGhlIGhlbHBlciB3aWxsIGJlIG51a2VkIGJ5IGpxdWVyeS11aSBvdGhlcndpc2UuIFRPRE86IHVwZGF0ZSBvbGQgY29kZSBwYXRoXHJcbiAgICAgICAgICAgIGlmIChoZWxwZXIgIT09IGVsKSB7XHJcbiAgICAgICAgICAgICAgICBoZWxwZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBlbC5ncmlkc3RhY2tOb2RlID0gb3JpZ05vZGU7IC8vIG9yaWdpbmFsIGl0ZW0gKGxlZnQgYmVoaW5kKSBpcyByZS1zdG9yZWQgdG8gcHJlIGRyYWdnaW5nIGFzIHRoZSBub2RlIG5vdyBoYXMgZHJvcCBpbmZvXHJcbiAgICAgICAgICAgICAgICBpZiAod2FzQWRkZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbCA9IGVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLnJlbW92ZSgpOyAvLyByZWR1Y2UgZmxpY2tlciBhcyB3ZSBjaGFuZ2UgZGVwdGggaGVyZSwgYW5kIHNpemUgZnVydGhlciBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVERChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF3YXNBZGRlZClcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgZWwuZ3JpZHN0YWNrTm9kZSA9IG5vZGU7XHJcbiAgICAgICAgICAgIG5vZGUuZWwgPSBlbDtcclxuICAgICAgICAgICAgbGV0IHN1YkdyaWQgPSAoX2IgPSAoX2EgPSBub2RlLnN1YkdyaWQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lbCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdyaWRzdGFjazsgLy8gc2V0IHdoZW4gYWN0dWFsIHN1Yi1ncmlkIHByZXNlbnRcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmNvcHlQb3Mobm9kZSwgdGhpcy5fcmVhZEF0dHIodGhpcy5wbGFjZWhvbGRlcikpOyAvLyBwbGFjZWhvbGRlciB2YWx1ZXMgYXMgbW92aW5nIFZFUlkgZmFzdCBjYW4gdGhyb3cgdGhpbmdzIG9mZiAjMTU3OFxyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLnJlbW92ZVBvc2l0aW9uaW5nU3R5bGVzKGVsKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0aGlzLl93cml0ZUF0dHIoZWwsIG5vZGUpO1xyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKHR5cGVzXzEuZ3JpZERlZmF1bHRzLml0ZW1DbGFzcywgdGhpcy5vcHRzLml0ZW1DbGFzcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoZWwpOyAvLyBAdHMtaWdub3JlIC8vIFRPRE86IG5vdyB3b3VsZCBiZSBpZGVhbCB0aW1lIHRvIF9yZW1vdmVIZWxwZXJTdHlsZSgpIG92ZXJyaWRpbmcgZmxvYXRpbmcgc3R5bGVzIChuYXRpdmUgb25seSlcclxuICAgICAgICAgICAgaWYgKHN1YkdyaWQpIHtcclxuICAgICAgICAgICAgICAgIHN1YkdyaWQucGFyZW50R3JpZEl0ZW0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzdWJHcmlkLm9wdHMuc3R5bGVJbkhlYWQpXHJcbiAgICAgICAgICAgICAgICAgICAgc3ViR3JpZC5fdXBkYXRlU3R5bGVzKHRydWUpOyAvLyByZS1jcmVhdGUgc3ViLWdyaWQgc3R5bGVzIG5vdyB0aGF0IHdlJ3ZlIG1vdmVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmFkZGVkTm9kZXMucHVzaChub2RlKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQWRkRXZlbnQoKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUuZW5kVXBkYXRlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9nc0V2ZW50SGFuZGxlclsnZHJvcHBlZCddKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlclsnZHJvcHBlZCddKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQpLCB7IHR5cGU6ICdkcm9wcGVkJyB9KSwgb3JpZ05vZGUgJiYgb3JpZ05vZGUuZ3JpZCA/IG9yaWdOb2RlIDogdW5kZWZpbmVkLCBub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB3YWl0IHRpbGwgd2UgcmV0dXJuIG91dCBvZiB0aGUgZHJhZyBjYWxsYmFjayB0byBzZXQgdGhlIG5ldyBkcmFnJnJlc2l6ZSBoYW5kbGVyIG9yIHRoZXkgbWF5IGdldCBtZXNzZWQgdXBcclxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gSUZGIHdlIGFyZSBzdGlsbCB0aGVyZSAoc29tZSBhcHBsaWNhdGlvbiB3aWxsIHVzZSBhcyBwbGFjZWhvbGRlciBhbmQgaW5zZXJ0IHRoZWlyIHJlYWwgd2lkZ2V0IGluc3RlYWQgYW5kIGJldHRlciBjYWxsIG1ha2VXaWRnZXQoKSlcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmVsICYmIG5vZGUuZWwucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVEcmFnRHJvcEJ5Tm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZU5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5ncmlkLl9pc1RlbXA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHByZXZlbnQgcGFyZW50IGZyb20gcmVjZWl2aW5nIG1zZyAod2hpY2ggbWF5IGJlIGdyaWQgYXMgd2VsbClcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgbWFyayBpdGVtIGZvciByZW1vdmFsICovXHJcbiAgICBfaXRlbVJlbW92aW5nKGVsLCByZW1vdmUpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IGVsID8gZWwuZ3JpZHN0YWNrTm9kZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuZ3JpZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJlbW92ZSA/IG5vZGUuX2lzQWJvdXRUb1JlbW92ZSA9IHRydWUgOiBkZWxldGUgbm9kZS5faXNBYm91dFRvUmVtb3ZlO1xyXG4gICAgICAgIHJlbW92ZSA/IGVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2staXRlbS1yZW1vdmluZycpIDogZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ3JpZC1zdGFjay1pdGVtLXJlbW92aW5nJyk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB0byBzZXR1cCBhIHRyYXNoIGRyb3Agem9uZSBpZiB0aGUgdXNlciBzcGVjaWZpZXMgaXQgKi9cclxuICAgIF9zZXR1cFJlbW92ZURyb3AoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdHMuc3RhdGljR3JpZCAmJiB0eXBlb2YgdGhpcy5vcHRzLnJlbW92YWJsZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbGV0IHRyYXNoRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5yZW1vdmFibGUpO1xyXG4gICAgICAgICAgICBpZiAoIXRyYXNoRWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgLy8gb25seSByZWdpc3RlciBPTkUgZHJvcC1vdmVyL2Ryb3BvdXQgY2FsbGJhY2sgZm9yIHRoZSAndHJhc2gnLCBhbmQgaXQgd2lsbFxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHBhc3NlZCBpbiBpdGVtIGFuZCBwYXJlbnQgZ3JpZCBiZWNhdXNlIHRoZSAndHJhc2gnIGlzIGEgc2hhcmVkIHJlc291cmNlIGFueXdheSxcclxuICAgICAgICAgICAgLy8gYW5kIE5hdGl2ZSBERCBvbmx5IGhhcyAxIGV2ZW50IENCIChoYXZpbmcgYSBsaXN0IGFuZCB0ZWNobmljYWxseSBhIHBlciBncmlkIHJlbW92YWJsZU9wdGlvbnMgY29tcGxpY2F0ZXMgdGhpbmdzIGdyZWF0bHkpXHJcbiAgICAgICAgICAgIGlmICghZGQuaXNEcm9wcGFibGUodHJhc2hFbCkpIHtcclxuICAgICAgICAgICAgICAgIGRkLmRyb3BwYWJsZSh0cmFzaEVsLCB0aGlzLm9wdHMucmVtb3ZhYmxlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAub24odHJhc2hFbCwgJ2Ryb3BvdmVyJywgKGV2ZW50LCBlbCkgPT4gdGhpcy5faXRlbVJlbW92aW5nKGVsLCB0cnVlKSlcclxuICAgICAgICAgICAgICAgICAgICAub24odHJhc2hFbCwgJ2Ryb3BvdXQnLCAoZXZlbnQsIGVsKSA9PiB0aGlzLl9pdGVtUmVtb3ZpbmcoZWwsIGZhbHNlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHByZXBhcmVzIHRoZSBlbGVtZW50IGZvciBkcmFnJmRyb3AgKiovXHJcbiAgICBfcHJlcGFyZURyYWdEcm9wQnlOb2RlKG5vZGUpIHtcclxuICAgICAgICBsZXQgZWwgPSBub2RlLmVsO1xyXG4gICAgICAgIGNvbnN0IG5vTW92ZSA9IG5vZGUubm9Nb3ZlIHx8IHRoaXMub3B0cy5kaXNhYmxlRHJhZztcclxuICAgICAgICBjb25zdCBub1Jlc2l6ZSA9IG5vZGUubm9SZXNpemUgfHwgdGhpcy5vcHRzLmRpc2FibGVSZXNpemU7XHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGRpc2FibGVkIGdyaWQgZmlyc3RcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQgfHwgKG5vTW92ZSAmJiBub1Jlc2l6ZSkpIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUuX2luaXRERCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlREQoZWwpOyAvLyBudWtlcyBldmVyeXRoaW5nIGluc3RlYWQgb2YganVzdCBkaXNhYmxlLCB3aWxsIGFkZCBzb21lIHN0eWxlcyBiYWNrIG5leHRcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9pbml0REQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgndWktZHJhZ2dhYmxlLWRpc2FibGVkJywgJ3VpLXJlc2l6YWJsZS1kaXNhYmxlZCcpOyAvLyBhZGQgc3R5bGVzIG9uZSBtaWdodCBkZXBlbmQgb24gIzE0MzVcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbm9kZS5faW5pdEREKSB7XHJcbiAgICAgICAgICAgIC8vIHZhcmlhYmxlcyB1c2VkL2Nhc2hlZCBiZXR3ZWVuIHRoZSAzIHN0YXJ0L21vdmUvZW5kIG1ldGhvZHMsIGluIGFkZGl0aW9uIHRvIG5vZGUgcGFzc2VkIGFib3ZlXHJcbiAgICAgICAgICAgIGxldCBjZWxsV2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBjZWxsSGVpZ2h0O1xyXG4gICAgICAgICAgICAvKiogY2FsbGVkIHdoZW4gaXRlbSBzdGFydHMgbW92aW5nL3Jlc2l6aW5nICovXHJcbiAgICAgICAgICAgIGxldCBvblN0YXJ0TW92aW5nID0gKGV2ZW50LCB1aSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBhbnkgJ2RyYWdzdGFydCcgLyAncmVzaXplc3RhcnQnIG1hbnVhbGx5XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ3NFdmVudEhhbmRsZXJbZXZlbnQudHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXShldmVudCwgZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNlbGxXaWR0aCA9IHRoaXMuY2VsbFdpZHRoKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsSGVpZ2h0ID0gdGhpcy5nZXRDZWxsSGVpZ2h0KHRydWUpOyAvLyBmb3JjZSBwaXhlbHMgZm9yIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25TdGFydE1vdmluZyhlbCwgZXZlbnQsIHVpLCBub2RlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvKiogY2FsbGVkIHdoZW4gaXRlbSBpcyBiZWluZyBkcmFnZ2VkL3Jlc2l6ZWQgKi9cclxuICAgICAgICAgICAgbGV0IGRyYWdPclJlc2l6ZSA9IChldmVudCwgdWkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdPclJlc2l6ZShlbCwgZXZlbnQsIHVpLCBub2RlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvKiogY2FsbGVkIHdoZW4gdGhlIGl0ZW0gc3RvcHMgbW92aW5nL3Jlc2l6aW5nICovXHJcbiAgICAgICAgICAgIGxldCBvbkVuZE1vdmluZyA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9tb3Zpbmc7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5fZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5fbGFzdFRyaWVkO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGl0ZW0gaGFzIG1vdmVkIHRvIGFub3RoZXIgZ3JpZCwgd2UncmUgZG9uZSBoZXJlXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQuZ3JpZHN0YWNrTm9kZSB8fCB0YXJnZXQuZ3JpZHN0YWNrTm9kZS5ncmlkICE9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIG5vZGUuZWwgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5faXNBYm91dFRvUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdyaWRUb05vdGlmeSA9IGVsLmdyaWRzdGFja05vZGUuZ3JpZDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZFRvTm90aWZ5Ll9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkVG9Ob3RpZnkuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKGV2ZW50LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVERChlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JpZFRvTm90aWZ5LmVuZ2luZS5yZW1vdmVkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBncmlkVG9Ob3RpZnkuX3RyaWdnZXJSZW1vdmVFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIGNpcmN1bGFyIGxpbmtzIGFuZCByZW1vdmUgRE9NXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLlV0aWxzLnJlbW92ZVBvc2l0aW9uaW5nU3R5bGVzKHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuX3RlbXBvcmFyeVJlbW92ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ290IHJlbW92ZWQgLSByZXN0b3JlIGl0ZW0gYmFjayB0byBiZWZvcmUgZHJhZ2dpbmcgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG5vZGUsIG5vZGUuX29yaWcpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dyaXRlUG9zQXR0cih0YXJnZXQsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5hZGROb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbW92ZSB0byBuZXcgcGxhY2Vob2xkZXIgbG9jYXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKHRhcmdldCwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXShldmVudCwgdGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9leHRyYURyYWdSb3cgPSAwOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5lbmRVcGRhdGUoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGQuZHJhZ2dhYmxlKGVsLCB7XHJcbiAgICAgICAgICAgICAgICBzdGFydDogb25TdGFydE1vdmluZyxcclxuICAgICAgICAgICAgICAgIHN0b3A6IG9uRW5kTW92aW5nLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogZHJhZ09yUmVzaXplXHJcbiAgICAgICAgICAgIH0pLnJlc2l6YWJsZShlbCwge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG9uU3RhcnRNb3ZpbmcsXHJcbiAgICAgICAgICAgICAgICBzdG9wOiBvbkVuZE1vdmluZyxcclxuICAgICAgICAgICAgICAgIHJlc2l6ZTogZHJhZ09yUmVzaXplXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBub2RlLl9pbml0REQgPSB0cnVlOyAvLyB3ZSd2ZSBzZXQgREQgc3VwcG9ydCBub3dcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluYWxseSBmaW5lIHR1bmUgbW92ZSB2cyByZXNpemUgYnkgZGlzYWJsaW5nIGFueSBwYXJ0Li4uXHJcbiAgICAgICAgZGQuZHJhZ2dhYmxlKGVsLCBub01vdmUgPyAnZGlzYWJsZScgOiAnZW5hYmxlJylcclxuICAgICAgICAgICAgLnJlc2l6YWJsZShlbCwgbm9SZXNpemUgPyAnZGlzYWJsZScgOiAnZW5hYmxlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGhhbmRsZXMgYWN0dWFsIGRyYWcvcmVzaXplIHN0YXJ0ICoqL1xyXG4gICAgX29uU3RhcnRNb3ZpbmcoZWwsIGV2ZW50LCB1aSwgbm9kZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUuY2xlYW5Ob2RlcygpXHJcbiAgICAgICAgICAgIC5iZWdpblVwZGF0ZShub2RlKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKHRoaXMucGxhY2Vob2xkZXIsIG5vZGUpO1xyXG4gICAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQodGhpcy5wbGFjZWhvbGRlcik7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ19vblN0YXJ0TW92aW5nIHBsYWNlaG9sZGVyJykgLy8gVEVTVFxyXG4gICAgICAgIG5vZGUuZWwgPSB0aGlzLnBsYWNlaG9sZGVyO1xyXG4gICAgICAgIG5vZGUuX2xhc3RVaVBvc2l0aW9uID0gdWkucG9zaXRpb247XHJcbiAgICAgICAgbm9kZS5fcHJldllQaXggPSB1aS5wb3NpdGlvbi50b3A7XHJcbiAgICAgICAgbm9kZS5fbW92aW5nID0gKGV2ZW50LnR5cGUgPT09ICdkcmFnc3RhcnQnKTsgLy8gJ2Ryb3BvdmVyJyBhcmUgbm90IGluaXRpYWxseSBtb3Zpbmcgc28gdGhleSBjYW4gZ28gZXhhY3RseSB3aGVyZSB0aGV5IGVudGVyICh3aWxsIHB1c2ggc3R1ZmYgb3V0IG9mIHRoZSB3YXkpXHJcbiAgICAgICAgZGVsZXRlIG5vZGUuX2xhc3RUcmllZDtcclxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2Ryb3BvdmVyJyAmJiBub2RlLl90ZW1wb3JhcnlSZW1vdmVkKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmdpbmUuYWRkTm9kZSB4PScgKyBub2RlLngpOyAvLyBURVNUXHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmFkZE5vZGUobm9kZSk7IC8vIHdpbGwgYWRkLCBmaXggY29sbGlzaW9ucywgdXBkYXRlIGF0dHIgYW5kIGNsZWFyIF90ZW1wb3JhcnlSZW1vdmVkXHJcbiAgICAgICAgICAgIG5vZGUuX21vdmluZyA9IHRydWU7IC8vIEFGVEVSLCBtYXJrIGFzIG1vdmluZyBvYmplY3QgKHdhbnRlZCBmaXggbG9jYXRpb24gYmVmb3JlKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgdGhlIG1pbi9tYXggcmVzaXplIGluZm9cclxuICAgICAgICB0aGlzLmVuZ2luZS5jYWNoZVJlY3RzKGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgdGhpcy5vcHRzLm1hcmdpblRvcCwgdGhpcy5vcHRzLm1hcmdpblJpZ2h0LCB0aGlzLm9wdHMubWFyZ2luQm90dG9tLCB0aGlzLm9wdHMubWFyZ2luTGVmdCk7XHJcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdyZXNpemVzdGFydCcpIHtcclxuICAgICAgICAgICAgZGQucmVzaXphYmxlKGVsLCAnb3B0aW9uJywgJ21pbldpZHRoJywgY2VsbFdpZHRoICogKG5vZGUubWluVyB8fCAxKSlcclxuICAgICAgICAgICAgICAgIC5yZXNpemFibGUoZWwsICdvcHRpb24nLCAnbWluSGVpZ2h0JywgY2VsbEhlaWdodCAqIChub2RlLm1pbkggfHwgMSkpO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5tYXhXKSB7XHJcbiAgICAgICAgICAgICAgICBkZC5yZXNpemFibGUoZWwsICdvcHRpb24nLCAnbWF4V2lkdGgnLCBjZWxsV2lkdGggKiBub2RlLm1heFcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChub2RlLm1heEgpIHtcclxuICAgICAgICAgICAgICAgIGRkLnJlc2l6YWJsZShlbCwgJ29wdGlvbicsICdtYXhIZWlnaHQnLCBjZWxsSGVpZ2h0ICogbm9kZS5tYXhIKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgaGFuZGxlcyBhY3R1YWwgZHJhZy9yZXNpemUgKiovXHJcbiAgICBfZHJhZ09yUmVzaXplKGVsLCBldmVudCwgdWksIG5vZGUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCkge1xyXG4gICAgICAgIGxldCBwID0gT2JqZWN0LmFzc2lnbih7fSwgbm9kZS5fb3JpZyk7IC8vIGNvdWxkIGJlIHVuZGVmaW5lZCAoX2lzRXh0ZXJuYWwpIHdoaWNoIGlzIG9rIChkcmFnIG9ubHkgc2V0IHgseSBhbmQgdyxoIHdpbGwgZGVmYXVsdCB0byBub2RlIHZhbHVlKVxyXG4gICAgICAgIGxldCByZXNpemluZztcclxuICAgICAgICBsZXQgbUxlZnQgPSB0aGlzLm9wdHMubWFyZ2luTGVmdCwgbVJpZ2h0ID0gdGhpcy5vcHRzLm1hcmdpblJpZ2h0LCBtVG9wID0gdGhpcy5vcHRzLm1hcmdpblRvcCwgbUJvdHRvbSA9IHRoaXMub3B0cy5tYXJnaW5Cb3R0b207XHJcbiAgICAgICAgLy8gaWYgbWFyZ2lucyAod2hpY2ggYXJlIHVzZWQgdG8gcGFzcyBtaWQgcG9pbnQgYnkpIGFyZSBsYXJnZSByZWxhdGl2ZSB0byBjZWxsIGhlaWdodC93aWR0aCwgcmVkdWNlIHRoZW0gZG93biAjMTg1NVxyXG4gICAgICAgIGxldCBtSGVpZ2h0ID0gTWF0aC5yb3VuZChjZWxsSGVpZ2h0ICogMC4xKSwgbVdpZHRoID0gTWF0aC5yb3VuZChjZWxsV2lkdGggKiAwLjEpO1xyXG4gICAgICAgIG1MZWZ0ID0gTWF0aC5taW4obUxlZnQsIG1XaWR0aCk7XHJcbiAgICAgICAgbVJpZ2h0ID0gTWF0aC5taW4obVJpZ2h0LCBtV2lkdGgpO1xyXG4gICAgICAgIG1Ub3AgPSBNYXRoLm1pbihtVG9wLCBtSGVpZ2h0KTtcclxuICAgICAgICBtQm90dG9tID0gTWF0aC5taW4obUJvdHRvbSwgbUhlaWdodCk7XHJcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdkcmFnJykge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZClcclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gaGFuZGxlZCBieSBkcm9wb3ZlclxyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSB1aS5wb3NpdGlvbi50b3AgLSBub2RlLl9wcmV2WVBpeDtcclxuICAgICAgICAgICAgbm9kZS5fcHJldllQaXggPSB1aS5wb3NpdGlvbi50b3A7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZHJhZ2dhYmxlLnNjcm9sbCAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMudXBkYXRlU2Nyb2xsUG9zaXRpb24oZWwsIHVpLnBvc2l0aW9uLCBkaXN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZ2V0IG5ldyBwb3NpdGlvbiB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBtYXJnaW4gaW4gdGhlIGRpcmVjdGlvbiB3ZSBhcmUgbW92aW5nISAobmVlZCB0byBwYXNzIG1pZCBwb2ludCBieSBtYXJnaW4pXHJcbiAgICAgICAgICAgIGxldCBsZWZ0ID0gdWkucG9zaXRpb24ubGVmdCArICh1aS5wb3NpdGlvbi5sZWZ0ID4gbm9kZS5fbGFzdFVpUG9zaXRpb24ubGVmdCA/IC1tUmlnaHQgOiBtTGVmdCk7XHJcbiAgICAgICAgICAgIGxldCB0b3AgPSB1aS5wb3NpdGlvbi50b3AgKyAodWkucG9zaXRpb24udG9wID4gbm9kZS5fbGFzdFVpUG9zaXRpb24udG9wID8gLW1Cb3R0b20gOiBtVG9wKTtcclxuICAgICAgICAgICAgcC54ID0gTWF0aC5yb3VuZChsZWZ0IC8gY2VsbFdpZHRoKTtcclxuICAgICAgICAgICAgcC55ID0gTWF0aC5yb3VuZCh0b3AgLyBjZWxsSGVpZ2h0KTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZS8vIGlmIHdlJ3JlIGF0IHRoZSBib3R0b20gaGl0dGluZyBzb21ldGhpbmcgZWxzZSwgZ3JvdyB0aGUgZ3JpZCBzbyBjdXJzb3IgZG9lc24ndCBsZWF2ZSB3aGVuIHRyeWluZyB0byBwbGFjZSBiZWxvdyBvdGhlcnNcclxuICAgICAgICAgICAgbGV0IHByZXYgPSB0aGlzLl9leHRyYURyYWdSb3c7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZ2luZS5jb2xsaWRlKG5vZGUsIHApKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5nZXRSb3coKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHRyYSA9IE1hdGgubWF4KDAsIChwLnkgKyBub2RlLmgpIC0gcm93KTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMubWF4Um93ICYmIHJvdyArIGV4dHJhID4gdGhpcy5vcHRzLm1heFJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhID0gTWF0aC5tYXgoMCwgdGhpcy5vcHRzLm1heFJvdyAtIHJvdyk7XHJcbiAgICAgICAgICAgICAgICB9IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V4dHJhRHJhZ1JvdyA9IGV4dHJhOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0cmFEcmFnUm93ID0gMDsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fZXh0cmFEcmFnUm93ICE9PSBwcmV2KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnggPT09IHAueCAmJiBub2RlLnkgPT09IHAueSlcclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gc2tpcCBzYW1lXHJcbiAgICAgICAgICAgIC8vIERPTidUIHNraXAgb25lIHdlIHRyaWVkIGFzIHdlIG1pZ2h0IGhhdmUgZmFpbGVkIGJlY2F1c2Ugb2YgY292ZXJhZ2UgPDUwJSBiZWZvcmVcclxuICAgICAgICAgICAgLy8gaWYgKG5vZGUuX2xhc3RUcmllZCAmJiBub2RlLl9sYXN0VHJpZWQueCA9PT0geCAmJiBub2RlLl9sYXN0VHJpZWQueSA9PT0geSkgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChldmVudC50eXBlID09PSAncmVzaXplJykge1xyXG4gICAgICAgICAgICBpZiAocC54IDwgMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8gU2Nyb2xsaW5nIHBhZ2UgaWYgbmVlZGVkXHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMudXBkYXRlU2Nyb2xsUmVzaXplKGV2ZW50LCBlbCwgY2VsbEhlaWdodCk7XHJcbiAgICAgICAgICAgIC8vIGdldCBuZXcgc2l6ZVxyXG4gICAgICAgICAgICBwLncgPSBNYXRoLnJvdW5kKCh1aS5zaXplLndpZHRoIC0gbUxlZnQpIC8gY2VsbFdpZHRoKTtcclxuICAgICAgICAgICAgcC5oID0gTWF0aC5yb3VuZCgodWkuc2l6ZS5oZWlnaHQgLSBtVG9wKSAvIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICBpZiAobm9kZS53ID09PSBwLncgJiYgbm9kZS5oID09PSBwLmgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmIChub2RlLl9sYXN0VHJpZWQgJiYgbm9kZS5fbGFzdFRyaWVkLncgPT09IHAudyAmJiBub2RlLl9sYXN0VHJpZWQuaCA9PT0gcC5oKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBza2lwIG9uZSB3ZSB0cmllZCAoYnV0IGZhaWxlZClcclxuICAgICAgICAgICAgLy8gaWYgd2Ugc2l6ZSBvbiBsZWZ0L3RvcCBzaWRlIHRoaXMgbWlnaHQgbW92ZSB1cywgc28gZ2V0IHBvc3NpYmxlIG5ldyBwb3NpdGlvbiBhcyB3ZWxsXHJcbiAgICAgICAgICAgIGxldCBsZWZ0ID0gdWkucG9zaXRpb24ubGVmdCArIG1MZWZ0O1xyXG4gICAgICAgICAgICBsZXQgdG9wID0gdWkucG9zaXRpb24udG9wICsgbVRvcDtcclxuICAgICAgICAgICAgcC54ID0gTWF0aC5yb3VuZChsZWZ0IC8gY2VsbFdpZHRoKTtcclxuICAgICAgICAgICAgcC55ID0gTWF0aC5yb3VuZCh0b3AgLyBjZWxsSGVpZ2h0KTtcclxuICAgICAgICAgICAgcmVzaXppbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLl9ldmVudCA9IGV2ZW50O1xyXG4gICAgICAgIG5vZGUuX2xhc3RUcmllZCA9IHA7IC8vIHNldCBhcyBsYXN0IHRyaWVkICh3aWxsIG51a2UgaWYgd2UgZ28gdGhlcmUpXHJcbiAgICAgICAgbGV0IHJlY3QgPSB7XHJcbiAgICAgICAgICAgIHg6IHVpLnBvc2l0aW9uLmxlZnQgKyBtTGVmdCxcclxuICAgICAgICAgICAgeTogdWkucG9zaXRpb24udG9wICsgbVRvcCxcclxuICAgICAgICAgICAgdzogKHVpLnNpemUgPyB1aS5zaXplLndpZHRoIDogbm9kZS53ICogY2VsbFdpZHRoKSAtIG1MZWZ0IC0gbVJpZ2h0LFxyXG4gICAgICAgICAgICBoOiAodWkuc2l6ZSA/IHVpLnNpemUuaGVpZ2h0IDogbm9kZS5oICogY2VsbEhlaWdodCkgLSBtVG9wIC0gbUJvdHRvbVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lLm1vdmVOb2RlQ2hlY2sobm9kZSwgT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwKSwgeyBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIHJlY3QsIHJlc2l6aW5nIH0pKSkge1xyXG4gICAgICAgICAgICBub2RlLl9sYXN0VWlQb3NpdGlvbiA9IHVpLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jYWNoZVJlY3RzKGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgbVRvcCwgbVJpZ2h0LCBtQm90dG9tLCBtTGVmdCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9za2lwRG93bjtcclxuICAgICAgICAgICAgaWYgKHJlc2l6aW5nICYmIG5vZGUuc3ViR3JpZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5zdWJHcmlkLm9uUGFyZW50UmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0aGlzLl9leHRyYURyYWdSb3cgPSAwOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0OyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX3dyaXRlUG9zQXR0cih0YXJnZXQsIG5vZGUpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fZ3NFdmVudEhhbmRsZXJbZXZlbnQudHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKGV2ZW50LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgd2hlbiBpdGVtIGxlYXZpbmcgb3VyIGFyZWEgYnkgZWl0aGVyIGN1cnNvciBkcm9wb3V0IGV2ZW50XHJcbiAgICAgKiBvciBzaGFwZSBpcyBvdXRzaWRlIG91ciBib3VuZGFyaWVzLiByZW1vdmUgaXQgZnJvbSB1cywgYW5kIG1hcmsgdGVtcG9yYXJ5IGlmIHRoaXMgd2FzXHJcbiAgICAgKiBvdXIgaXRlbSB0byBzdGFydCB3aXRoIGVsc2UgcmVzdG9yZSBwcmV2IG5vZGUgdmFsdWVzIGZyb20gcHJldiBncmlkIGl0IGNhbWUgZnJvbS5cclxuICAgICAqKi9cclxuICAgIF9sZWF2ZShlbCwgaGVscGVyKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRkLm9mZihlbCwgJ2RyYWcnKTsgLy8gbm8gbmVlZCB0byB0cmFjayB3aGlsZSBiZWluZyBvdXRzaWRlXHJcbiAgICAgICAgLy8gdGhpcyBnZXRzIGNhbGxlZCB3aGVuIGN1cnNvciBsZWF2ZXMgYW5kIHNoYXBlIGlzIG91dHNpZGUsIHNvIG9ubHkgZG8gdGhpcyBvbmNlXHJcbiAgICAgICAgaWYgKG5vZGUuX3RlbXBvcmFyeVJlbW92ZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBub2RlLl90ZW1wb3JhcnlSZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVOb2RlKG5vZGUpOyAvLyByZW1vdmUgcGxhY2Vob2xkZXIgYXMgd2VsbCwgb3RoZXJ3aXNlIGl0J3MgYSBzaWduIG5vZGUgaXMgbm90IGluIG91ciBsaXN0LCB3aGljaCBpcyBhIGJpZ2dlciBpc3N1ZVxyXG4gICAgICAgIG5vZGUuZWwgPSBub2RlLl9pc0V4dGVybmFsICYmIGhlbHBlciA/IGhlbHBlciA6IGVsOyAvLyBwb2ludCBiYWNrIHRvIHJlYWwgaXRlbSBiZWluZyBkcmFnZ2VkXHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5yZW1vdmFibGUgPT09IHRydWUpIHsgLy8gYm9vbGVhbiB2cyBhIGNsYXNzIHN0cmluZ1xyXG4gICAgICAgICAgICAvLyBpdGVtIGxlYXZpbmcgdXMgYW5kIHdlIGFyZSBzdXBwb3NlZCB0byByZW1vdmUgb24gbGVhdmUgKG5vIG5lZWQgdG8gZHJhZyBvbnRvIHRyYXNoKSBtYXJrIGl0IHNvXHJcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1SZW1vdmluZyhlbCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmFsbHkgaWYgaXRlbSBvcmlnaW5hbGx5IGNhbWUgZnJvbSBhbm90aGVyIGdyaWQsIGJ1dCBsZWZ0IHVzLCByZXN0b3JlIHRoaW5ncyBiYWNrIHRvIHByZXYgaW5mb1xyXG4gICAgICAgIGlmIChlbC5fZ3JpZHN0YWNrTm9kZU9yaWcpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xlYXZlIGRlbGV0ZSBfZ3JpZHN0YWNrTm9kZU9yaWcnKSAvLyBURVNUXHJcbiAgICAgICAgICAgIGVsLmdyaWRzdGFja05vZGUgPSBlbC5fZ3JpZHN0YWNrTm9kZU9yaWc7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBlbC5fZ3JpZHN0YWNrTm9kZU9yaWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5vZGUuX2lzRXh0ZXJuYWwpIHtcclxuICAgICAgICAgICAgLy8gaXRlbSBjYW1lIGZyb20gb3V0c2lkZSAobGlrZSBhIHRvb2xiYXIpIHNvIG51a2UgYW55IG5vZGUgaW5mb1xyXG4gICAgICAgICAgICBkZWxldGUgbm9kZS5lbDtcclxuICAgICAgICAgICAgZGVsZXRlIGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIC8vIGFuZCByZXN0b3JlIGFsbCBub2RlcyBiYWNrIHRvIG9yaWdpbmFsXHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLnJlc3RvcmVJbml0aWFsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gbGVnYWN5IG1ldGhvZCByZW1vdmVkXHJcbiAgICBjb21taXQoKSB7IHV0aWxzXzEub2Jzb2xldGUodGhpcywgdGhpcy5iYXRjaFVwZGF0ZShmYWxzZSksICdjb21taXQnLCAnYmF0Y2hVcGRhdGUnLCAnNS4yJyk7IHJldHVybiB0aGlzOyB9XHJcbn1cclxuZXhwb3J0cy5HcmlkU3RhY2sgPSBHcmlkU3RhY2s7XHJcbi8qKiBzY29waW5nIHNvIHVzZXJzIGNhbiBjYWxsIEdyaWRTdGFjay5VdGlscy5zb3J0KCkgZm9yIGV4YW1wbGUgKi9cclxuR3JpZFN0YWNrLlV0aWxzID0gdXRpbHNfMS5VdGlscztcclxuLyoqIHNjb3Bpbmcgc28gdXNlcnMgY2FuIGNhbGwgbmV3IEdyaWRTdGFjay5FbmdpbmUoMTIpIGZvciBleGFtcGxlICovXHJcbkdyaWRTdGFjay5FbmdpbmUgPSBncmlkc3RhY2tfZW5naW5lXzEuR3JpZFN0YWNrRW5naW5lO1xyXG5HcmlkU3RhY2suR0RSZXYgPSAnNy4zLjAnO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ncmlkc3RhY2suanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiB0eXBlcy50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuZHJhZ0luRGVmYXVsdE9wdGlvbnMgPSBleHBvcnRzLmdyaWREZWZhdWx0cyA9IHZvaWQgMDtcclxuLy8gZGVmYXVsdCB2YWx1ZXMgZm9yIGdyaWQgb3B0aW9ucyAtIHVzZWQgZHVyaW5nIGluaXQgYW5kIHdoZW4gc2F2aW5nIG91dFxyXG5leHBvcnRzLmdyaWREZWZhdWx0cyA9IHtcclxuICAgIGFsd2F5c1Nob3dSZXNpemVIYW5kbGU6ICdtb2JpbGUnLFxyXG4gICAgYW5pbWF0ZTogdHJ1ZSxcclxuICAgIGF1dG86IHRydWUsXHJcbiAgICBjZWxsSGVpZ2h0OiAnYXV0bycsXHJcbiAgICBjZWxsSGVpZ2h0VGhyb3R0bGU6IDEwMCxcclxuICAgIGNlbGxIZWlnaHRVbml0OiAncHgnLFxyXG4gICAgY29sdW1uOiAxMixcclxuICAgIGRyYWdnYWJsZTogeyBoYW5kbGU6ICcuZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnQnLCBhcHBlbmRUbzogJ2JvZHknLCBzY3JvbGw6IHRydWUgfSxcclxuICAgIGhhbmRsZTogJy5ncmlkLXN0YWNrLWl0ZW0tY29udGVudCcsXHJcbiAgICBpdGVtQ2xhc3M6ICdncmlkLXN0YWNrLWl0ZW0nLFxyXG4gICAgbWFyZ2luOiAxMCxcclxuICAgIG1hcmdpblVuaXQ6ICdweCcsXHJcbiAgICBtYXhSb3c6IDAsXHJcbiAgICBtaW5Sb3c6IDAsXHJcbiAgICBvbmVDb2x1bW5TaXplOiA3NjgsXHJcbiAgICBwbGFjZWhvbGRlckNsYXNzOiAnZ3JpZC1zdGFjay1wbGFjZWhvbGRlcicsXHJcbiAgICBwbGFjZWhvbGRlclRleHQ6ICcnLFxyXG4gICAgcmVtb3ZhYmxlT3B0aW9uczogeyBhY2NlcHQ6ICcuZ3JpZC1zdGFjay1pdGVtJyB9LFxyXG4gICAgcmVzaXphYmxlOiB7IGhhbmRsZXM6ICdzZScgfSxcclxuICAgIHJ0bDogJ2F1dG8nLFxyXG59O1xyXG4vKiogZGVmYXVsdCBkcmFnSW4gb3B0aW9ucyAqL1xyXG5leHBvcnRzLmRyYWdJbkRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgaGFuZGxlOiAnLmdyaWQtc3RhY2staXRlbS1jb250ZW50JyxcclxuICAgIGFwcGVuZFRvOiAnYm9keScsXHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR5cGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogdXRpbHMudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlV0aWxzID0gZXhwb3J0cy5vYnNvbGV0ZUF0dHIgPSBleHBvcnRzLm9ic29sZXRlT3B0c0RlbCA9IGV4cG9ydHMub2Jzb2xldGVPcHRzID0gZXhwb3J0cy5vYnNvbGV0ZSA9IHZvaWQgMDtcclxuLyoqIGNoZWNrcyBmb3Igb2Jzb2xldGUgbWV0aG9kIG5hbWVzICovXHJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxyXG5mdW5jdGlvbiBvYnNvbGV0ZShzZWxmLCBmLCBvbGROYW1lLCBuZXdOYW1lLCByZXYpIHtcclxuICAgIGxldCB3cmFwcGVyID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2dyaWRzdGFjay5qczogRnVuY3Rpb24gYCcgKyBvbGROYW1lICsgJ2AgaXMgZGVwcmVjYXRlZCBpbiAnICsgcmV2ICsgJyBhbmQgaGFzIGJlZW4gcmVwbGFjZWQgJyArXHJcbiAgICAgICAgICAgICd3aXRoIGAnICsgbmV3TmFtZSArICdgLiBJdCB3aWxsIGJlICoqcmVtb3ZlZCoqIGluIGEgZnV0dXJlIHJlbGVhc2UnKTtcclxuICAgICAgICByZXR1cm4gZi5hcHBseShzZWxmLCBhcmdzKTtcclxuICAgIH07XHJcbiAgICB3cmFwcGVyLnByb3RvdHlwZSA9IGYucHJvdG90eXBlO1xyXG4gICAgcmV0dXJuIHdyYXBwZXI7XHJcbn1cclxuZXhwb3J0cy5vYnNvbGV0ZSA9IG9ic29sZXRlO1xyXG4vKiogY2hlY2tzIGZvciBvYnNvbGV0ZSBncmlkIG9wdGlvbnMgKGNhbiBiZSB1c2VkIGZvciBhbnkgZmllbGRzLCBidXQgbXNnIGlzIGFib3V0IG9wdGlvbnMpICovXHJcbmZ1bmN0aW9uIG9ic29sZXRlT3B0cyhvcHRzLCBvbGROYW1lLCBuZXdOYW1lLCByZXYpIHtcclxuICAgIGlmIChvcHRzW29sZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBvcHRzW25ld05hbWVdID0gb3B0c1tvbGROYW1lXTtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2dyaWRzdGFjay5qczogT3B0aW9uIGAnICsgb2xkTmFtZSArICdgIGlzIGRlcHJlY2F0ZWQgaW4gJyArIHJldiArICcgYW5kIGhhcyBiZWVuIHJlcGxhY2VkIHdpdGggYCcgK1xyXG4gICAgICAgICAgICBuZXdOYW1lICsgJ2AuIEl0IHdpbGwgYmUgKipyZW1vdmVkKiogaW4gYSBmdXR1cmUgcmVsZWFzZScpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMub2Jzb2xldGVPcHRzID0gb2Jzb2xldGVPcHRzO1xyXG4vKiogY2hlY2tzIGZvciBvYnNvbGV0ZSBncmlkIG9wdGlvbnMgd2hpY2ggYXJlIGdvbmUgKi9cclxuZnVuY3Rpb24gb2Jzb2xldGVPcHRzRGVsKG9wdHMsIG9sZE5hbWUsIHJldiwgaW5mbykge1xyXG4gICAgaWYgKG9wdHNbb2xkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignZ3JpZHN0YWNrLmpzOiBPcHRpb24gYCcgKyBvbGROYW1lICsgJ2AgaXMgZGVwcmVjYXRlZCBpbiAnICsgcmV2ICsgaW5mbyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5vYnNvbGV0ZU9wdHNEZWwgPSBvYnNvbGV0ZU9wdHNEZWw7XHJcbi8qKiBjaGVja3MgZm9yIG9ic29sZXRlIEpxdWVyeSBlbGVtZW50IGF0dHJpYnV0ZXMgKi9cclxuZnVuY3Rpb24gb2Jzb2xldGVBdHRyKGVsLCBvbGROYW1lLCBuZXdOYW1lLCByZXYpIHtcclxuICAgIGxldCBvbGRBdHRyID0gZWwuZ2V0QXR0cmlidXRlKG9sZE5hbWUpO1xyXG4gICAgaWYgKG9sZEF0dHIgIT09IG51bGwpIHtcclxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUobmV3TmFtZSwgb2xkQXR0cik7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdncmlkc3RhY2suanM6IGF0dHJpYnV0ZSBgJyArIG9sZE5hbWUgKyAnYD0nICsgb2xkQXR0ciArICcgaXMgZGVwcmVjYXRlZCBvbiB0aGlzIG9iamVjdCBpbiAnICsgcmV2ICsgJyBhbmQgaGFzIGJlZW4gcmVwbGFjZWQgd2l0aCBgJyArXHJcbiAgICAgICAgICAgIG5ld05hbWUgKyAnYC4gSXQgd2lsbCBiZSAqKnJlbW92ZWQqKiBpbiBhIGZ1dHVyZSByZWxlYXNlJyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5vYnNvbGV0ZUF0dHIgPSBvYnNvbGV0ZUF0dHI7XHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1ldGhvZHNcclxuICovXHJcbmNsYXNzIFV0aWxzIHtcclxuICAgIC8qKiBjb252ZXJ0IGEgcG90ZW50aWFsIHNlbGVjdG9yIGludG8gYWN0dWFsIGxpc3Qgb2YgaHRtbCBlbGVtZW50cyAqL1xyXG4gICAgc3RhdGljIGdldEVsZW1lbnRzKGVscykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBsZXQgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxzKTtcclxuICAgICAgICAgICAgaWYgKCFsaXN0Lmxlbmd0aCAmJiBlbHNbMF0gIT09ICcuJyAmJiBlbHNbMF0gIT09ICcjJykge1xyXG4gICAgICAgICAgICAgICAgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgZWxzKTtcclxuICAgICAgICAgICAgICAgIGlmICghbGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnIycgKyBlbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW2Vsc107XHJcbiAgICB9XHJcbiAgICAvKiogY29udmVydCBhIHBvdGVudGlhbCBzZWxlY3RvciBpbnRvIGFjdHVhbCBzaW5nbGUgZWxlbWVudCAqL1xyXG4gICAgc3RhdGljIGdldEVsZW1lbnQoZWxzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbHMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICghZWxzLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBpZiAoZWxzWzBdID09PSAnIycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbHMuc3Vic3RyaW5nKDEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxzWzBdID09PSAnLicgfHwgZWxzWzBdID09PSAnWycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVscyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaWYgd2Ugc3RhcnQgd2l0aCBhIGRpZ2l0LCBhc3N1bWUgaXQncyBhbiBpZCAoZXJyb3IgY2FsbGluZyBxdWVyeVNlbGVjdG9yKCcjMScpKSBhcyBjbGFzcyBhcmUgbm90IHZhbGlkIENTU1xyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKCtlbHNbMF0pKSB7IC8vIHN0YXJ0IHdpdGggZGlnaXRcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZpbmFsbHkgdHJ5IHN0cmluZywgdGhlbiBpZCB0aGVuIGNsYXNzXHJcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxzKTtcclxuICAgICAgICAgICAgaWYgKCFlbCkge1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZWwpIHtcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBlbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVscztcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBvdmVybGFwICovXHJcbiAgICBzdGF0aWMgaXNJbnRlcmNlcHRlZChhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuICEoYS55ID49IGIueSArIGIuaCB8fCBhLnkgKyBhLmggPD0gYi55IHx8IGEueCArIGEudyA8PSBiLnggfHwgYS54ID49IGIueCArIGIudyk7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyB0cnVlIGlmIGEgYW5kIGIgdG91Y2ggZWRnZXMgb3IgY29ybmVycyAqL1xyXG4gICAgc3RhdGljIGlzVG91Y2hpbmcoYSwgYikge1xyXG4gICAgICAgIHJldHVybiBVdGlscy5pc0ludGVyY2VwdGVkKGEsIHsgeDogYi54IC0gMC41LCB5OiBiLnkgLSAwLjUsIHc6IGIudyArIDEsIGg6IGIuaCArIDEgfSk7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyB0aGUgYXJlYSBhIGFuZCBiIG92ZXJsYXAgKi9cclxuICAgIHN0YXRpYyBhcmVhSW50ZXJjZXB0KGEsIGIpIHtcclxuICAgICAgICBsZXQgeDAgPSAoYS54ID4gYi54KSA/IGEueCA6IGIueDtcclxuICAgICAgICBsZXQgeDEgPSAoYS54ICsgYS53IDwgYi54ICsgYi53KSA/IGEueCArIGEudyA6IGIueCArIGIudztcclxuICAgICAgICBpZiAoeDEgPD0geDApXHJcbiAgICAgICAgICAgIHJldHVybiAwOyAvLyBubyBvdmVybGFwXHJcbiAgICAgICAgbGV0IHkwID0gKGEueSA+IGIueSkgPyBhLnkgOiBiLnk7XHJcbiAgICAgICAgbGV0IHkxID0gKGEueSArIGEuaCA8IGIueSArIGIuaCkgPyBhLnkgKyBhLmggOiBiLnkgKyBiLmg7XHJcbiAgICAgICAgaWYgKHkxIDw9IHkwKVxyXG4gICAgICAgICAgICByZXR1cm4gMDsgLy8gbm8gb3ZlcmxhcFxyXG4gICAgICAgIHJldHVybiAoeDEgLSB4MCkgKiAoeTEgLSB5MCk7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyB0aGUgYXJlYSAqL1xyXG4gICAgc3RhdGljIGFyZWEoYSkge1xyXG4gICAgICAgIHJldHVybiBhLncgKiBhLmg7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNvcnRzIGFycmF5IG9mIG5vZGVzXHJcbiAgICAgKiBAcGFyYW0gbm9kZXMgYXJyYXkgdG8gc29ydFxyXG4gICAgICogQHBhcmFtIGRpciAxIGZvciBhc2MsIC0xIGZvciBkZXNjIChvcHRpb25hbClcclxuICAgICAqIEBwYXJhbSB3aWR0aCB3aWR0aCBvZiB0aGUgZ3JpZC4gSWYgdW5kZWZpbmVkIHRoZSB3aWR0aCB3aWxsIGJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSAob3B0aW9uYWwpLlxyXG4gICAgICoqL1xyXG4gICAgc3RhdGljIHNvcnQobm9kZXMsIGRpciwgY29sdW1uKSB7XHJcbiAgICAgICAgY29sdW1uID0gY29sdW1uIHx8IG5vZGVzLnJlZHVjZSgoY29sLCBuKSA9PiBNYXRoLm1heChuLnggKyBuLncsIGNvbCksIDApIHx8IDEyO1xyXG4gICAgICAgIGlmIChkaXIgPT09IC0xKVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc29ydCgoYSwgYikgPT4gKGIueCArIGIueSAqIGNvbHVtbikgLSAoYS54ICsgYS55ICogY29sdW1uKSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc29ydCgoYiwgYSkgPT4gKGIueCArIGIueSAqIGNvbHVtbikgLSAoYS54ICsgYS55ICogY29sdW1uKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZXMgYSBzdHlsZSBzaGVldCB3aXRoIHN0eWxlIGlkIHVuZGVyIGdpdmVuIHBhcmVudFxyXG4gICAgICogQHBhcmFtIGlkIHdpbGwgc2V0IHRoZSAnZ3Mtc3R5bGUtaWQnIGF0dHJpYnV0ZSB0byB0aGF0IGlkXHJcbiAgICAgKiBAcGFyYW0gcGFyZW50IHRvIGluc2VydCB0aGUgc3R5bGVzaGVldCBhcyBmaXJzdCBjaGlsZCxcclxuICAgICAqIGlmIG5vbmUgc3VwcGxpZWQgaXQgd2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQgaGVhZCBpbnN0ZWFkLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlU3R5bGVzaGVldChpZCwgcGFyZW50LCBvcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICBjb25zdCBub25jZSA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5ub25jZTtcclxuICAgICAgICBpZiAobm9uY2UpXHJcbiAgICAgICAgICAgIHN0eWxlLm5vbmNlID0gbm9uY2U7XHJcbiAgICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XHJcbiAgICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKCdncy1zdHlsZS1pZCcsIGlkKTtcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7IC8vIFRPRE86IG9ubHkgQ1NTSW1wb3J0UnVsZSBoYXZlIHRoYXQgYW5kIGRpZmZlcmVudCBiZWFzdCA/P1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7IC8vIFdlYktpdCBoYWNrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgdG8gaGVhZFxyXG4gICAgICAgICAgICBwYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShzdHlsZSwgcGFyZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3R5bGUuc2hlZXQ7XHJcbiAgICB9XHJcbiAgICAvKiogcmVtb3ZlZCB0aGUgZ2l2ZW4gc3R5bGVzaGVldCBpZCAqL1xyXG4gICAgc3RhdGljIHJlbW92ZVN0eWxlc2hlZXQoaWQpIHtcclxuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdTVFlMRVtncy1zdHlsZS1pZD0nICsgaWQgKyAnXScpO1xyXG4gICAgICAgIGlmIChlbCAmJiBlbC5wYXJlbnROb2RlKVxyXG4gICAgICAgICAgICBlbC5yZW1vdmUoKTtcclxuICAgIH1cclxuICAgIC8qKiBpbnNlcnRzIGEgQ1NTIHJ1bGUgKi9cclxuICAgIHN0YXRpYyBhZGRDU1NSdWxlKHNoZWV0LCBzZWxlY3RvciwgcnVsZXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHNoZWV0LmFkZFJ1bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgc2hlZXQuYWRkUnVsZShzZWxlY3RvciwgcnVsZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc2hlZXQuaW5zZXJ0UnVsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBzaGVldC5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfXske3J1bGVzfX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgc3RhdGljIHRvQm9vbCh2KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdiA9IHYudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuICEodiA9PT0gJycgfHwgdiA9PT0gJ25vJyB8fCB2ID09PSAnZmFsc2UnIHx8IHYgPT09ICcwJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBCb29sZWFuKHYpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHRvTnVtYmVyKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZS5sZW5ndGggPT09IDApID8gdW5kZWZpbmVkIDogTnVtYmVyKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBwYXJzZUhlaWdodCh2YWwpIHtcclxuICAgICAgICBsZXQgaDtcclxuICAgICAgICBsZXQgdW5pdCA9ICdweCc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IHZhbC5tYXRjaCgvXigtWzAtOV0rXFwuWzAtOV0rfFswLTldKlxcLlswLTldK3wtWzAtOV0rfFswLTldKykocHh8ZW18cmVtfHZofHZ3fCUpPyQvKTtcclxuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhlaWdodCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVuaXQgPSBtYXRjaFsyXSB8fCAncHgnO1xyXG4gICAgICAgICAgICBoID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBoID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBoLCB1bml0IH07XHJcbiAgICB9XHJcbiAgICAvKiogY29waWVzIHVuc2V0IGZpZWxkcyBpbiB0YXJnZXQgdG8gdXNlIHRoZSBnaXZlbiBkZWZhdWx0IHNvdXJjZXMgdmFsdWVzICovXHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcclxuICAgIHN0YXRpYyBkZWZhdWx0cyh0YXJnZXQsIC4uLnNvdXJjZXMpIHtcclxuICAgICAgICBzb3VyY2VzLmZvckVhY2goc291cmNlID0+IHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRba2V5XSA9PT0gbnVsbCB8fCB0YXJnZXRba2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzb3VyY2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldFtrZXldID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHByb3BlcnR5IGlzIGFuIG9iamVjdCwgcmVjdXJzaXZlbHkgYWRkIGl0J3MgZmllbGQgb3Zlci4uLiAjMTM3M1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9XHJcbiAgICAvKiogZ2l2ZW4gMiBvYmplY3RzIHJldHVybiB0cnVlIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZXMuIENoZWNrcyBmb3IgT2JqZWN0IHt9IGhhdmluZyBzYW1lIGZpZWxkcyBhbmQgdmFsdWVzIChqdXN0IDEgbGV2ZWwgZG93bikgKi9cclxuICAgIHN0YXRpYyBzYW1lKGEsIGIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGEgIT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICByZXR1cm4gYSA9PSBiO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gdHlwZW9mIGIpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyBlbHNlIHdlIGhhdmUgb2JqZWN0LCBjaGVjayBqdXN0IDEgbGV2ZWwgZGVlcCBmb3IgYmVpbmcgc2FtZSB0aGluZ3MuLi5cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoYSkubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhiKS5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhKSB7XHJcbiAgICAgICAgICAgIGlmIChhW2tleV0gIT09IGJba2V5XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKiogY29waWVzIG92ZXIgYiBzaXplICYgcG9zaXRpb24gKEdyaWRTdGFja1Bvc2l0aW9uKSwgYW5kIG9wdGlvbmFsbHkgbWluL21heCBhcyB3ZWxsICovXHJcbiAgICBzdGF0aWMgY29weVBvcyhhLCBiLCBkb01pbk1heCA9IGZhbHNlKSB7XHJcbiAgICAgICAgYS54ID0gYi54O1xyXG4gICAgICAgIGEueSA9IGIueTtcclxuICAgICAgICBhLncgPSBiLnc7XHJcbiAgICAgICAgYS5oID0gYi5oO1xyXG4gICAgICAgIGlmIChkb01pbk1heCkge1xyXG4gICAgICAgICAgICBpZiAoYi5taW5XKVxyXG4gICAgICAgICAgICAgICAgYS5taW5XID0gYi5taW5XO1xyXG4gICAgICAgICAgICBpZiAoYi5taW5IKVxyXG4gICAgICAgICAgICAgICAgYS5taW5IID0gYi5taW5IO1xyXG4gICAgICAgICAgICBpZiAoYi5tYXhXKVxyXG4gICAgICAgICAgICAgICAgYS5tYXhXID0gYi5tYXhXO1xyXG4gICAgICAgICAgICBpZiAoYi5tYXhIKVxyXG4gICAgICAgICAgICAgICAgYS5tYXhIID0gYi5tYXhIO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYTtcclxuICAgIH1cclxuICAgIC8qKiB0cnVlIGlmIGEgYW5kIGIgaGFzIHNhbWUgc2l6ZSAmIHBvc2l0aW9uICovXHJcbiAgICBzdGF0aWMgc2FtZVBvcyhhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIGEgJiYgYiAmJiBhLnggPT09IGIueCAmJiBhLnkgPT09IGIueSAmJiBhLncgPT09IGIudyAmJiBhLmggPT09IGIuaDtcclxuICAgIH1cclxuICAgIC8qKiByZW1vdmVzIGZpZWxkIGZyb20gdGhlIGZpcnN0IG9iamVjdCBpZiBzYW1lIGFzIHRoZSBzZWNvbmQgb2JqZWN0cyAobGlrZSBkaWZmaW5nKSBhbmQgaW50ZXJuYWwgJ18nIGZvciBzYXZpbmcgKi9cclxuICAgIHN0YXRpYyByZW1vdmVJbnRlcm5hbEFuZFNhbWUoYSwgYikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGEpIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IGFba2V5XTtcclxuICAgICAgICAgICAgaWYgKGtleVswXSA9PT0gJ18nIHx8IHZhbCA9PT0gYltrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgYVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JyAmJiBiW2tleV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSBpbiB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsW2ldID09PSBiW2tleV1baV0gfHwgaVswXSA9PT0gJ18nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyh2YWwpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogcmVtb3ZlcyBpbnRlcm5hbCBmaWVsZHMgJ18nIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3Igc2F2aW5nICovXHJcbiAgICBzdGF0aWMgcmVtb3ZlSW50ZXJuYWxGb3JTYXZlKG4sIHJlbW92ZUVsID0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBuKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlbMF0gPT09ICdfJyB8fCBuW2tleV0gPT09IG51bGwgfHwgbltrZXldID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbltrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgbi5ncmlkO1xyXG4gICAgICAgIGlmIChyZW1vdmVFbClcclxuICAgICAgICAgICAgZGVsZXRlIG4uZWw7XHJcbiAgICAgICAgLy8gZGVsZXRlIGRlZmF1bHQgdmFsdWVzICh3aWxsIGJlIHJlLWNyZWF0ZWQgb24gcmVhZClcclxuICAgICAgICBpZiAoIW4uYXV0b1Bvc2l0aW9uKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5hdXRvUG9zaXRpb247XHJcbiAgICAgICAgaWYgKCFuLm5vUmVzaXplKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5ub1Jlc2l6ZTtcclxuICAgICAgICBpZiAoIW4ubm9Nb3ZlKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5ub01vdmU7XHJcbiAgICAgICAgaWYgKCFuLmxvY2tlZClcclxuICAgICAgICAgICAgZGVsZXRlIG4ubG9ja2VkO1xyXG4gICAgICAgIGlmIChuLncgPT09IDEgfHwgbi53ID09PSBuLm1pblcpXHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLnc7XHJcbiAgICAgICAgaWYgKG4uaCA9PT0gMSB8fCBuLmggPT09IG4ubWluSClcclxuICAgICAgICAgICAgZGVsZXRlIG4uaDtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm4gdGhlIGNsb3Nlc3QgcGFyZW50IChvciBpdHNlbGYpIG1hdGNoaW5nIHRoZSBnaXZlbiBjbGFzcyAqL1xyXG4gICAgc3RhdGljIGNsb3Nlc3RVcEJ5Q2xhc3MoZWwsIG5hbWUpIHtcclxuICAgICAgICB3aGlsZSAoZWwpIHtcclxuICAgICAgICAgICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKiBkZWxheSBjYWxsaW5nIHRoZSBnaXZlbiBmdW5jdGlvbiBmb3IgZ2l2ZW4gZGVsYXksIHByZXZlbnRpbmcgbmV3IGNhbGxzIGZyb20gaGFwcGVuaW5nIHdoaWxlIHdhaXRpbmcgKi9cclxuICAgIHN0YXRpYyB0aHJvdHRsZShmdW5jLCBkZWxheSkge1xyXG4gICAgICAgIGxldCBpc1dhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFpc1dhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIGlzV2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgZnVuYyguLi5hcmdzKTsgaXNXYWl0aW5nID0gZmFsc2U7IH0sIGRlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmVtb3ZlUG9zaXRpb25pbmdTdHlsZXMoZWwpIHtcclxuICAgICAgICBsZXQgc3R5bGUgPSBlbC5zdHlsZTtcclxuICAgICAgICBpZiAoc3R5bGUucG9zaXRpb24pIHtcclxuICAgICAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3Bvc2l0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdHlsZS5sZWZ0KSB7XHJcbiAgICAgICAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KCdsZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdHlsZS50b3ApIHtcclxuICAgICAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3R5bGUud2lkdGgpIHtcclxuICAgICAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3dpZHRoJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdHlsZS5oZWlnaHQpIHtcclxuICAgICAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2hlaWdodCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmV0dXJucyB0aGUgcGFzc2VkIGVsZW1lbnQgaWYgc2Nyb2xsYWJsZSwgZWxzZSB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCB3aWxsLCB1cCB0byB0aGUgZW50aXJlIGRvY3VtZW50IHNjcm9sbGluZyBlbGVtZW50ICovXHJcbiAgICBzdGF0aWMgZ2V0U2Nyb2xsRWxlbWVudChlbCkge1xyXG4gICAgICAgIGlmICghZWwpXHJcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsgLy8gSUUgc3VwcG9ydFxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmZsb3dSZWdleCA9IC8oYXV0b3xzY3JvbGwpLztcclxuICAgICAgICBpZiAob3ZlcmZsb3dSZWdleC50ZXN0KHN0eWxlLm92ZXJmbG93ICsgc3R5bGUub3ZlcmZsb3dZKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTY3JvbGxFbGVtZW50KGVsLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHN0YXRpYyB1cGRhdGVTY3JvbGxQb3NpdGlvbihlbCwgcG9zaXRpb24sIGRpc3RhbmNlKSB7XHJcbiAgICAgICAgLy8gaXMgd2lkZ2V0IGluIHZpZXc/XHJcbiAgICAgICAgbGV0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBsZXQgaW5uZXJIZWlnaHRPckNsaWVudEhlaWdodCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XHJcbiAgICAgICAgaWYgKHJlY3QudG9wIDwgMCB8fFxyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSA+IGlubmVySGVpZ2h0T3JDbGllbnRIZWlnaHQpIHtcclxuICAgICAgICAgICAgLy8gc2V0IHNjcm9sbFRvcCBvZiBmaXJzdCBwYXJlbnQgdGhhdCBzY3JvbGxzXHJcbiAgICAgICAgICAgIC8vIGlmIHBhcmVudCBpcyBsYXJnZXIgdGhhbiBlbCwgc2V0IGFzIGxvdyBhcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICAvLyB0byBnZXQgZW50aXJlIHdpZGdldCBvbiBzY3JlZW5cclxuICAgICAgICAgICAgbGV0IG9mZnNldERpZmZEb3duID0gcmVjdC5ib3R0b20gLSBpbm5lckhlaWdodE9yQ2xpZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0RGlmZlVwID0gcmVjdC50b3A7XHJcbiAgICAgICAgICAgIGxldCBzY3JvbGxFbCA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudChlbCk7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxFbCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZTY3JvbGwgPSBzY3JvbGxFbC5zY3JvbGxUb3A7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVjdC50b3AgPCAwICYmIGRpc3RhbmNlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdmluZyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbC5vZmZzZXRIZWlnaHQgPiBpbm5lckhlaWdodE9yQ2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsLnNjcm9sbFRvcCArPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsLnNjcm9sbFRvcCArPSBNYXRoLmFicyhvZmZzZXREaWZmVXApID4gTWF0aC5hYnMoZGlzdGFuY2UpID8gZGlzdGFuY2UgOiBvZmZzZXREaWZmVXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGlzdGFuY2UgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbW92aW5nIGRvd25cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWwub2Zmc2V0SGVpZ2h0ID4gaW5uZXJIZWlnaHRPckNsaWVudEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxFbC5zY3JvbGxUb3AgKz0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxFbC5zY3JvbGxUb3AgKz0gb2Zmc2V0RGlmZkRvd24gPiBkaXN0YW5jZSA/IGRpc3RhbmNlIDogb2Zmc2V0RGlmZkRvd247XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSB3aWRnZXQgeSBieSBhbW91bnQgc2Nyb2xsZWRcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCArPSBzY3JvbGxFbC5zY3JvbGxUb3AgLSBwcmV2U2Nyb2xsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJuYWwgRnVuY3Rpb24gdXNlZCB0byBzY3JvbGwgdGhlIHBhZ2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGV2ZW50IGBNb3VzZUV2ZW50YCB0aGF0IHRyaWdnZXJzIHRoZSByZXNpemVcclxuICAgICAqIEBwYXJhbSBlbCBgSFRNTEVsZW1lbnRgIHRoYXQncyBiZWluZyByZXNpemVkXHJcbiAgICAgKiBAcGFyYW0gZGlzdGFuY2UgRGlzdGFuY2UgZnJvbSB0aGUgViBlZGdlcyB0byBzdGFydCBzY3JvbGxpbmdcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHVwZGF0ZVNjcm9sbFJlc2l6ZShldmVudCwgZWwsIGRpc3RhbmNlKSB7XHJcbiAgICAgICAgY29uc3Qgc2Nyb2xsRWwgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoZWwpO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHNjcm9sbEVsLmNsaWVudEhlaWdodDtcclxuICAgICAgICAvLyAjMTcyNyBldmVudC5jbGllbnRZIGlzIHJlbGF0aXZlIHRvIHZpZXdwb3J0LCBzbyBtdXN0IGNvbXBhcmUgdGhpcyBhZ2FpbnN0IHBvc2l0aW9uIG9mIHNjcm9sbEVsIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxyXG4gICAgICAgIC8vICMxNzQ1IFNwZWNpYWwgc2l0dWF0aW9uIGlmIHNjcm9sbEVsIGlzIGRvY3VtZW50ICdodG1sJzogaGVyZSBicm93c2VyIHNwZWMgc3RhdGVzIHRoYXRcclxuICAgICAgICAvLyBjbGllbnRIZWlnaHQgaXMgaGVpZ2h0IG9mIHZpZXdwb3J0LCBidXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgaXMgcmVjdGFuZ2xlIG9mIGh0bWwgZWxlbWVudDtcclxuICAgICAgICAvLyB0aGlzIGRpc2NyZXBhbmN5IGFyaXNlcyBiZWNhdXNlIGluIHJlYWxpdHkgc2Nyb2xsYmFyIGlzIGF0dGFjaGVkIHRvIHZpZXdwb3J0LCBub3QgaHRtbCBlbGVtZW50IGl0c2VsZi5cclxuICAgICAgICBjb25zdCBvZmZzZXRUb3AgPSAoc2Nyb2xsRWwgPT09IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpKSA/IDAgOiBzY3JvbGxFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgY29uc3QgcG9pbnRlclBvc1kgPSBldmVudC5jbGllbnRZIC0gb2Zmc2V0VG9wO1xyXG4gICAgICAgIGNvbnN0IHRvcCA9IHBvaW50ZXJQb3NZIDwgZGlzdGFuY2U7XHJcbiAgICAgICAgY29uc3QgYm90dG9tID0gcG9pbnRlclBvc1kgPiBoZWlnaHQgLSBkaXN0YW5jZTtcclxuICAgICAgICBpZiAodG9wKSB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgYWxzbyBjYW4gYmUgZG9uZSB3aXRoIGEgdGltZW91dCB0byBrZWVwIHNjcm9sbGluZyB3aGlsZSB0aGUgbW91c2UgaXNcclxuICAgICAgICAgICAgLy8gaW4gdGhlIHNjcm9sbGluZyB6b25lLiAod2lsbCBoYXZlIHNtb290aGVyIGJlaGF2aW9yKVxyXG4gICAgICAgICAgICBzY3JvbGxFbC5zY3JvbGxCeSh7IGJlaGF2aW9yOiAnc21vb3RoJywgdG9wOiBwb2ludGVyUG9zWSAtIGRpc3RhbmNlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChib3R0b20pIHtcclxuICAgICAgICAgICAgc2Nyb2xsRWwuc2Nyb2xsQnkoeyBiZWhhdmlvcjogJ3Ntb290aCcsIHRvcDogZGlzdGFuY2UgLSAoaGVpZ2h0IC0gcG9pbnRlclBvc1kpIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBzaW5nbGUgbGV2ZWwgY2xvbmUsIHJldHVybmluZyBhIG5ldyBvYmplY3Qgd2l0aCBzYW1lIHRvcCBmaWVsZHMuIFRoaXMgd2lsbCBzaGFyZSBzdWIgb2JqZWN0cyBhbmQgYXJyYXlzICovXHJcbiAgICBzdGF0aWMgY2xvbmUob2JqKSB7XHJcbiAgICAgICAgaWYgKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgKG9iaikgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvYmopO1xyXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICAgICAgICByZXR1cm4gWy4uLm9ial07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvYmopO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWN1cnNpdmUgY2xvbmUgdmVyc2lvbiB0aGF0IHJldHVybnMgYSBmdWxsIGNvcHksIGNoZWNraW5nIGZvciBuZXN0ZWQgb2JqZWN0cyBhbmQgYXJyYXlzIE9OTFkuXHJcbiAgICAgKiBOb3RlOiB0aGlzIHdpbGwgdXNlIGFzLWlzIGFueSBrZXkgc3RhcnRpbmcgd2l0aCBkb3VibGUgX18gKGFuZCBub3QgY29weSBpbnNpZGUpIHNvbWUgbGliIGhhdmUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY2xvbmVEZWVwKG9iaikge1xyXG4gICAgICAgIC8vIGxpc3Qgb2YgZmllbGRzIHdlIHdpbGwgc2tpcCBkdXJpbmcgY2xvbmVEZWVwIChuZXN0ZWQgb2JqZWN0cywgb3RoZXIgaW50ZXJuYWwpXHJcbiAgICAgICAgY29uc3Qgc2tpcEZpZWxkcyA9IFsncGFyZW50R3JpZCcsICdlbCcsICdncmlkJywgJ3N1YkdyaWQnLCAnZW5naW5lJ107XHJcbiAgICAgICAgLy8gcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7IC8vIGRvZXNuJ3Qgd29yayB3aXRoIGRhdGUgZm9ybWF0ID9cclxuICAgICAgICBjb25zdCByZXQgPSBVdGlscy5jbG9uZShvYmopO1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHJldCkge1xyXG4gICAgICAgICAgICAvLyBOT1RFOiB3ZSBkb24ndCBzdXBwb3J0IGZ1bmN0aW9uL2NpcmN1bGFyIGRlcGVuZGVuY2llcyBzbyBza2lwIHRob3NlIHByb3BlcnRpZXMgZm9yIG5vdy4uLlxyXG4gICAgICAgICAgICBpZiAocmV0Lmhhc093blByb3BlcnR5KGtleSkgJiYgdHlwZW9mIChyZXRba2V5XSkgPT09ICdvYmplY3QnICYmIGtleS5zdWJzdHJpbmcoMCwgMikgIT09ICdfXycgJiYgIXNraXBGaWVsZHMuZmluZChrID0+IGsgPT09IGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJldFtrZXldID0gVXRpbHMuY2xvbmVEZWVwKG9ialtrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgLyoqIGRlZXAgY2xvbmUgdGhlIGdpdmVuIEhUTUwgbm9kZSwgcmVtb3ZpbmcgdGVoIHVuaXF1ZSBpZCBmaWVsZCAqL1xyXG4gICAgc3RhdGljIGNsb25lTm9kZShlbCkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBlbC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ2lkJyk7XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXBwZW5kVG8oZWwsIHBhcmVudCkge1xyXG4gICAgICAgIGxldCBwYXJlbnROb2RlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGFyZW50ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBwYXJlbnROb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGFyZW50Tm9kZSA9IHBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gcHVibGljIHN0YXRpYyBzZXRQb3NpdGlvblJlbGF0aXZlKGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgLy8gICBpZiAoISgvXig/OnJ8YXxmKS8pLnRlc3Qod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uKSkge1xyXG4gICAgLy8gICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcbiAgICBzdGF0aWMgYWRkRWxTdHlsZXMoZWwsIHN0eWxlcykge1xyXG4gICAgICAgIGlmIChzdHlsZXMgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzIGluIHN0eWxlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlcy5oYXNPd25Qcm9wZXJ0eShzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0eWxlc1tzXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3VwcG9ydCBmYWxsYmFjayB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNbc10uZm9yRWFjaCh2YWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGVbc10gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGVbc10gPSBzdHlsZXNbc107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGluaXRFdmVudChlLCBpbmZvKSB7XHJcbiAgICAgICAgY29uc3QgZXZ0ID0geyB0eXBlOiBpbmZvLnR5cGUgfTtcclxuICAgICAgICBjb25zdCBvYmogPSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbjogMCxcclxuICAgICAgICAgICAgd2hpY2g6IDAsXHJcbiAgICAgICAgICAgIGJ1dHRvbnM6IDEsXHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIHRhcmdldDogaW5mby50YXJnZXQgPyBpbmZvLnRhcmdldCA6IGUudGFyZ2V0XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBkb24ndCBjaGVjayBmb3IgYGluc3RhbmNlb2YgRHJhZ0V2ZW50YCBhcyBTYWZhcmkgdXNlIE1vdXNlRXZlbnQgIzE1NDBcclxuICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcclxuICAgICAgICAgICAgZXZ0WydkYXRhVHJhbnNmZXInXSA9IGUuZGF0YVRyYW5zZmVyOyAvLyB3b3JrYXJvdW5kICdyZWFkb25seScgZmllbGQuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFsnYWx0S2V5JywgJ2N0cmxLZXknLCAnbWV0YUtleScsICdzaGlmdEtleSddLmZvckVhY2gocCA9PiBldnRbcF0gPSBlW3BdKTsgLy8ga2V5c1xyXG4gICAgICAgIFsncGFnZVgnLCAncGFnZVknLCAnY2xpZW50WCcsICdjbGllbnRZJywgJ3NjcmVlblgnLCAnc2NyZWVuWSddLmZvckVhY2gocCA9PiBldnRbcF0gPSBlW3BdKTsgLy8gcG9pbnQgaW5mb1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGV2dCksIG9iaik7XHJcbiAgICB9XHJcbiAgICAvKiogY29waWVzIHRoZSBNb3VzZUV2ZW50IHByb3BlcnRpZXMgYW5kIHNlbmRzIGl0IGFzIGFub3RoZXIgZXZlbnQgdG8gdGhlIGdpdmVuIHRhcmdldCAqL1xyXG4gICAgc3RhdGljIHNpbXVsYXRlTW91c2VFdmVudChlLCBzaW11bGF0ZWRUeXBlLCB0YXJnZXQpIHtcclxuICAgICAgICBjb25zdCBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xyXG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHNpbXVsYXRlZFR5cGUsIC8vIHR5cGVcclxuICAgICAgICB0cnVlLCAvLyBidWJibGVzXHJcbiAgICAgICAgdHJ1ZSwgLy8gY2FuY2VsYWJsZVxyXG4gICAgICAgIHdpbmRvdywgLy8gdmlld1xyXG4gICAgICAgIDEsIC8vIGRldGFpbFxyXG4gICAgICAgIGUuc2NyZWVuWCwgLy8gc2NyZWVuWFxyXG4gICAgICAgIGUuc2NyZWVuWSwgLy8gc2NyZWVuWVxyXG4gICAgICAgIGUuY2xpZW50WCwgLy8gY2xpZW50WFxyXG4gICAgICAgIGUuY2xpZW50WSwgLy8gY2xpZW50WVxyXG4gICAgICAgIGUuY3RybEtleSwgLy8gY3RybEtleVxyXG4gICAgICAgIGUuYWx0S2V5LCAvLyBhbHRLZXlcclxuICAgICAgICBlLnNoaWZ0S2V5LCAvLyBzaGlmdEtleVxyXG4gICAgICAgIGUubWV0YUtleSwgLy8gbWV0YUtleVxyXG4gICAgICAgIDAsIC8vIGJ1dHRvblxyXG4gICAgICAgIGUudGFyZ2V0IC8vIHJlbGF0ZWRUYXJnZXRcclxuICAgICAgICApO1xyXG4gICAgICAgICh0YXJnZXQgfHwgZS50YXJnZXQpLmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuVXRpbHMgPSBVdGlscztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbInJlcXVpcmUiLCJHcmlkU3RhY2siLCJnbG9iYWwiXSwic291cmNlUm9vdCI6IiJ9