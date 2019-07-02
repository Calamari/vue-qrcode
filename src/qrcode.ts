import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import qrcodeGenerator from "qrcode-generator";
import { VNode } from "vue";

@Component({})
export default class QrCode extends Vue {
	@Prop() public text!: string;
	@Prop({ default: "canvas" }) public tagName!: "canvas" | "img" | "svg";
	@Prop({ default: 6 }) public cellSize!: number;
	@Prop({ default: 0 }) public typeNumber!: TypeNumber;
	@Prop({ default: "Q" }) public errorCorrectionLevel!: ErrorCorrectionLevel;
	@Prop() public logo!: string;
	@Prop({ default: 2 }) public logoMargin!: number;

	public height: number = 0;
	public width: number = 0;
	public size!: number;

	public render(createElement: typeof Vue.prototype.$createElement) {
		return createElement(this.tagName === "svg" ? "span" : this.tagName);
	}

	public mounted() {
		this.updateElement();
	}

	@Watch("text")
	private updateText() {
		this.updateElement();
	}

	private updateElement() {
		if (!this.text) {
			return null;
		}

		const qrCode = qrcodeGenerator(this.typeNumber, this.errorCorrectionLevel);
		qrCode.addData(this.text);
		qrCode.make();
		const size = this.cellSize * qrCode.getModuleCount();

		if (this.tagName === "canvas") {
			this.updateCanvas(qrCode, size);
		} else if (this.tagName === "img") {
			this.updateImage(qrCode, size);
		} else {
			this.updateSvg(qrCode, size);
		}
	}

	private updateCanvas(qrCode: QRCode, size: number) {
		const canvas = this.$el as HTMLCanvasElement;
		const context = canvas.getContext("2d");
		canvas.height = size;
		canvas.width = size;
		if (context) {
			qrCode.renderTo2dContext(context, this.cellSize);
			if (this.logo && this.typeNumber >= 3) {
				this.renderLogo(size, context);
			}
		}
	}

	private updateImage(qrCode: QRCode, size: number) {
		const margin = 4;
		const base64 = qrCode.createDataURL(this.cellSize, margin);
		(this.$el as HTMLImageElement).src = base64;
	}

	private updateSvg(qrCode: QRCode, size: number) {
		const margin = 4;
		const svgTag = qrCode.createSvgTag(this.cellSize, margin);
		this.$el.innerHTML = svgTag;
	}

	private renderLogo(size: number, context: CanvasRenderingContext2D): void {
		const img = new Image();
		context.fillStyle = "white";
		img.src = this.logo;
		img.onload = () => {
			const imgSize = this.allowedLogoSize;
			const numModules = size / this.cellSize;
			const ratio = img.naturalHeight / img.naturalWidth;
			const imgModuleSizeX = Math.ceil(imgSize / this.cellSize);
			const imgModuleSizeY = Math.ceil((imgSize * ratio) / this.cellSize);
			const imgModuleX = Math.floor((numModules - imgModuleSizeX) / 2);
			const imgModuleY = Math.floor((numModules - imgModuleSizeY) / 2);
			context.fillRect(
				(imgModuleX - 1) * this.cellSize,
				(imgModuleY - 1) * this.cellSize,
				(imgModuleSizeX + 2) * this.cellSize,
				(imgModuleSizeY + 2) * this.cellSize
			);
			context.drawImage(
				img,
				imgModuleX * this.cellSize,
				imgModuleY * this.cellSize,
				imgModuleSizeX * this.cellSize,
				imgModuleSizeY * this.cellSize
			);
		};
	}

	private get allowedLogoSize(): number {
		const canvas = this.$el as HTMLCanvasElement;
		switch (this.errorCorrectionLevel) {
			case "L":
				return canvas.width / 6;
			case "M":
				return canvas.width / 4.5;
			case "Q":
				return canvas.width / 3.5;
			case "H":
				return canvas.width / 3;
		}
	}
}
