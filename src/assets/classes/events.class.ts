export class Base {
	constructor() {
		this.userOnHover =
		this.userOnClick =
		this.userOnBlur =
		this.userOnMouseDown =
		this.userOnMouseUp =
		this.userOnDragStart =
		this.userOnDragEnd =
			() => {};
	}
	get onhover(): Function {
		return () => {
			this.defaultOnHover?.();
			this.userOnHover?.();
		};
	}
	set onhover(x) {
		this.userOnHover = x;
	}
	protected defaultOnHover() {}
	protected userOnHover: Function;

	get onclick(): Function {
		return () => {
			this.defaultOnClick?.();
			this.userOnClick?.();
		};
	}
	set onclick(x) {
		this.userOnClick = x;
	}
	protected defaultOnClick() {}
	protected userOnClick: Function;

	get onblur(): Function {
		return () => {
			this.defaultOnBlur?.();
			this.userOnBlur?.();
		};
	}
	set onblur(x) {
		this.userOnBlur = x;
	}
	protected defaultOnBlur() {}
	protected userOnBlur: Function;

	get onmousedown(): Function {
		return () => {
			this.defaultOnMouseDown?.();
			this.userOnMouseDown?.();
		};
	}
	set onmousedown(x) {
		this.userOnMouseDown = x;
	}
	protected defaultOnMouseDown() {}
	protected userOnMouseDown: Function;

	get onmouseup(): Function {
		return () => {
			this.defaultOnMouseUp?.();
			this.userOnMouseUp?.();
		};
	}
	set onmouseup(x) {
		this.userOnMouseUp = x;
	}
	protected defaultOnMouseUp() {}
	protected userOnMouseUp: Function;

	get ondragstart(): Function {
		return () => {
			this.defaultOnDragStart?.();
			this.userOnDragStart?.();
		};
	}
	set ondragstart(x) {
		this.userOnDragStart = x;
	}
	protected defaultOnDragStart() {}
	protected userOnDragStart: Function;

	get ondragend(): Function {
		return () => {
			this.defaultOnDragEnd?.();
			this.userOnDragEnd?.();
		};
	}
	set ondragend(x) {
		this.userOnDragEnd = x;
	}
	protected defaultOnDragEnd() {}
	protected userOnDragEnd: Function;
}
