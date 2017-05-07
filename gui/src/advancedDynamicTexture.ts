/// <reference path="../../dist/preview release/babylon.d.ts"/>

module BABYLON.GUI {
    export class AdvancedDynamicTexture extends DynamicTexture {
        private _isDirty = false;
        private _renderObserver: Observer<Scene>;
        private _resizeObserver: Observer<Engine>;
        private _background: string;
        private _rootContainer = new Container("root");

        public get background(): string {
            return this._background;
        }

        public set background(value: string) {
            if (this._background === value) {
                return;
            }

            this._background = value;
            this._isDirty = true;
        }
        
        constructor(name: string, scene: Scene) {
            super(name, {}, scene, false, Texture.NEAREST_SAMPLINGMODE, Engine.TEXTUREFORMAT_RGBA);

            this._resizeObserver = this.getScene().getEngine().onResizeObservable.add(() => this._onResize());
            this._renderObserver = this.getScene().onBeforeRenderObservable.add(() => this._checkUpdate());

            this._rootContainer._link(null, this);

            this._onResize();
        }

        public addControl(control: Control): AdvancedDynamicTexture {
            this._rootContainer.addControl(control);

            return this;
        }

        public removeControl(control: Control): AdvancedDynamicTexture {
            this._rootContainer.removeControl(control);
            return this;
        }

        public dispose() {
            this.getScene().onBeforeRenderObservable.remove(this._renderObserver);
            this.getScene().getEngine().onResizeObservable.remove(this._resizeObserver);

            super.dispose();
        }

        private _onResize(): void {
            // Check size
            var engine = this.getScene().getEngine();
            var textureSize = this.getSize();
            var renderWidth = engine.getRenderWidth();
            var renderHeight = engine.getRenderHeight();

            if (textureSize.width !== renderWidth || textureSize.height !== renderHeight) {
                this.scaleTo(renderWidth, renderHeight);
                this._isDirty = true;
            }
        }

        private _checkUpdate(): void {
            if (!this._isDirty && !this._rootContainer.isDirty) {
                return;
            }
            this._isDirty = false;

            this._render();
            this.update();
        }

        private _render(): void {
            var engine = this.getScene().getEngine();
            var renderWidth = engine.getRenderWidth();
            var renderHeight = engine.getRenderHeight();

            // Clear
            var context = this.getContext();
            if (this._background) {
                context.save();
                context.fillStyle = this._background;
                context.fillRect(0, 0, renderWidth, renderHeight);
                context.restore();
            } else {
                this.clear();
            }

            // Render
            var measure = new Measure(0, 0, renderWidth, renderHeight);
            this._rootContainer._draw(measure, context);
        }
    }    
}