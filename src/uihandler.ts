import { Camera } from "./camera";
import { Settings } from "./settings";

export class UiHandler {
    private settings: Settings;
    private camera: Camera;

    constructor(camera: Camera) {
        this.settings = Settings.getInstance();
        this.camera = camera;
        this.initializeSliders();
        this.initializeKeyControls();
    }

    private initializeSliders() {
        this.setupSlider("gravitySlider", "gravityValue", (value) => {
            const scaledValue = 6.67430 * Math.pow(10, value);
            this.settings.getSettings().gravitationalCoefficient = scaledValue;
            return scaledValue.toExponential(4);
        });

        this.setupSlider("windXSlider", "windXValue", (value) => {
            this.settings.getSettings().windX = value;
            return value.toString();
        });

        this.setupSlider("windZSlider", "windZValue", (value) => {
            this.settings.getSettings().windZ = value;
            return value.toString();
        });
        this.setupSlider("maxSpeedSlider", "maxSpeedValue", (value) => {
            this.settings.getSettings().maxSpeed = value;
            return value.toString();
        });
    }

    private setupSlider(sliderId: string, valueId: string, onChange: (value: number) => string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        const valueDisplay = document.getElementById(valueId);
        if (slider && valueDisplay) {
            const update = (value: number) => {
                const displayText = onChange(value);
                valueDisplay.innerText = displayText;
            };
            slider.onchange = (event) => update(parseFloat((event.target as HTMLInputElement).value));
            slider.onmousemove = (event) => update(parseFloat((event.target as HTMLInputElement).value));
            update(parseFloat(slider.value));
        }
    }

    private initializeKeyControls() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case "w": this.camera.moveForward(); break;
                case "W": this.camera.tiltUp(); break;
                case "s": this.camera.moveBackward(); break;
                case "S": this.camera.tiltDown(); break;
                case "a": this.camera.moveLeft(); break;
                case "A": this.camera.tiltLeft(); break;
                case "d": this.camera.moveRight(); break;
                case "D": this.camera.tiltRight(); break;
            }
        });
    }
}
